"""
Edge TTS (Microsoft neural voices) as a second TTS engine beside Kokoro.

Design contract (user requirement):
- Kokoro is the default and always works. Edge voices are ADDED to the
  catalogue only while Edge is reachable; if Edge fails in any way, its
  voices must not be shown at all, so the user never picks a voice that
  cannot generate.

How availability is decided:
- The live Microsoft voice list is fetched (plain HTTPS) and cached.
- A tiny probe synthesis (one short sentence, Andrew voice) must succeed.
- Both results are cached (success TTL / failure TTL in config). While the
  cache says unavailable, ``get_voices()`` returns [] and the API serves
  Kokoro voices only.

Transport note:
- ``edge_tts``' own client uses aiohttp, which fails behind TLS-intercepting
  egress proxies (they rewrite the websocket 101 ``Connection`` header to
  ``upgrade, close``, which aiohttp rejects). Synthesis therefore goes
  through the ``websockets`` client, which accepts the rewritten header —
  the same path verified live in this sandbox (Andrew voice, 3.72s MP3).
  The voice-list fetch uses stdlib ``urllib`` with an SSL context that
  honours ``SSL_CERT_FILE`` when set. In a normal datacenter (HF Space)
  there is no proxy and no custom CA, so both paths work with defaults.

- ``edge_tts`` is an unofficial endpoint: no API key, no SLA, and Microsoft
  can change voice IDs, throttle, or block datacenter IPs at any time.
  Voice IDs are therefore always verified against the live list, never
  hard-coded as available. If the ``edge_tts`` package is missing or its
  internals change, the service reports unavailable instead of crashing.
"""

import asyncio
import json
import os
import ssl
import threading
import time
import urllib.request
from typing import Any, Dict, List, Optional

from loguru import logger

from app.core.config import settings
from app.core.exceptions import TtsException

# Microsoft locale -> Konthora workspace language code.
# Only these languages are served: they are the ones the workspace picker
# offers (plus Bengali, the headline new language Edge unlocks). Any other
# Edge locale (e.g. en-GB, de-DE) is dropped — the picker has no entry for
# it, so the voice could never be selected anyway.
_EDGE_LOCALE_PREFIX_MAP = {
    "es": "es",
    "fr": "fr-FR",
    "it": "it",
    "bn": "bn-BD",
}
_EDGE_LOCALE_EXACT_MAP = {
    "en-US": "en-US",
    "hi-IN": "hi-IN",
    "pt-BR": "pt-BR",
}

# Voices shown first inside their language (recommended sort in the UI).
# Only voices actually present in the live list get the flag; a wrong entry
# here is harmless. These are all verified against the live voice list.
_RECOMMENDED_EDGE_VOICES = {
    "en-US-AndrewNeural",
    "en-US-AriaNeural",
    "bn-BD-NabanitaNeural",
    "bn-BD-PradeepNeural",
    "bn-IN-BashkarNeural",
    "bn-IN-TanishaaNeural",
    "hi-IN-SwaraNeural",
    "hi-IN-MadhurNeural",
}

_PROBE_TEXT = "Hello."
_PROBE_VOICE = "en-US-AndrewNeural"


def _map_locale(locale: str) -> Optional[str]:
    """Maps a Microsoft locale (e.g. 'es-MX') to a workspace language code."""
    if locale in _EDGE_LOCALE_EXACT_MAP:
        return _EDGE_LOCALE_EXACT_MAP[locale]
    prefix = locale.split("-")[0]
    return _EDGE_LOCALE_PREFIX_MAP.get(prefix)


def _voice_name_from_short_name(short_name: str, locale: str) -> str:
    """'en-US-AvaMultilingualNeural' -> 'Ava Multilingual'; 'bn-BD-NabanitaNeural' -> 'Nabanita'.

    The MultilingualNeural twins (Andrew/Ava/Emma/Brian) share their plain
    Neural twin's base name, so the ' Multilingual' marker keeps their
    display names distinct in the picker ("Ava Multilingual (Female)").
    """
    name = short_name
    if locale and name.startswith(locale + "-"):
        name = name[len(locale) + 1:]
    multilingual = name.endswith("MultilingualNeural")
    for suffix in ("MultilingualNeural", "Neural"):
        if name.endswith(suffix):
            name = name[: -len(suffix)]
            break
    if multilingual:
        name = f"{name} Multilingual"
    return name or short_name


def _map_voice(raw: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Maps one Microsoft voice-list entry to a Konthora VoiceInfo dict."""
    short_name = raw.get("ShortName") or ""
    locale = raw.get("Locale") or ""
    language = _map_locale(locale)
    if not short_name or not language:
        return None

    gender = (raw.get("Gender") or "").lower()
    if gender not in ("female", "male"):
        gender = "female"
    name = _voice_name_from_short_name(short_name, locale)

    return {
        "id": short_name,
        "displayName": f"{name} ({'Female' if gender == 'female' else 'Male'})",
        "gender": gender,
        # Microsoft's human-readable locale name, e.g. "Bengali (Bangladesh)".
        "accent": raw.get("LocaleName") or locale,
        "language": language,
        "recommended": short_name in _RECOMMENDED_EDGE_VOICES,
        "defaultSpeed": 1.0,
        "minimumSpeed": 0.75,
        "maximumSpeed": 1.25,
        "engine": "edge",
        # Edge has no hosted preview clips; the UI hides the Listen button
        # for voices without a preview URL.
        "previewUrl": "",
    }


class EdgeTTSService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(EdgeTTSService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._lock = threading.Lock()
        self._voices_cache: List[Dict[str, Any]] = []
        self._voices_cached_at: float = 0.0
        self._voices_cache_failed_at: float = 0.0
        self._avail_cache: Optional[bool] = None
        self._avail_checked_at: float = 0.0

    # ── internals ──────────────────────────────────────────────────────────

    def _ssl_context(self) -> ssl.SSLContext:
        """Default SSL context, honouring SSL_CERT_FILE when the environment sets it."""
        ca_file = os.environ.get("SSL_CERT_FILE")
        if ca_file:
            return ssl.create_default_context(cafile=ca_file)
        return ssl.create_default_context()

    def _proxy(self) -> Optional[str]:
        return os.environ.get("https_proxy") or os.environ.get("HTTPS_PROXY")

    def _fetch_voice_list(self) -> List[Dict[str, Any]]:
        """Fetches the live Microsoft voice list and maps it to VoiceInfo dicts."""
        from edge_tts.constants import VOICE_LIST, SEC_MS_GEC_VERSION
        from edge_tts.drm import DRM

        url = (
            f"{VOICE_LIST}"
            f"&Sec-MS-GEC={DRM.generate_sec_ms_gec()}"
            f"&Sec-MS-GEC-Version={SEC_MS_GEC_VERSION}"
        )
        request = urllib.request.Request(
            url, headers={"User-Agent": "Mozilla/5.0 (compatible; Konthora/1.0)"}
        )
        with urllib.request.urlopen(
            request, timeout=15, context=self._ssl_context()
        ) as response:
            raw_list = json.loads(response.read().decode("utf-8"))
        voices = [v for v in (_map_voice(entry) for entry in raw_list) if v is not None]
        logger.info(f"Edge TTS voice list fetched: {len(voices)} voices in scope.")
        return voices

    async def _synthesize_async(self, text: str, voice_id: str, speed: float) -> bytes:
        """One Edge synthesis over the websockets client. Returns MP3 bytes."""
        import websockets.asyncio.client as ws_client
        from websockets.exceptions import ConnectionClosed
        from edge_tts.communicate import (
            TTSConfig,
            mkssml,
            date_to_string,
            connect_id,
            ssml_headers_plus_data,
            get_headers_and_data,
        )
        from edge_tts.constants import WSS_URL, WSS_HEADERS, SEC_MS_GEC_VERSION
        from edge_tts.drm import DRM

        # Kokoro speed 0.75–1.25 maps to Edge rate -25%…+25%.
        rate_pct = int(round((speed - 1.0) * 100))
        rate = f"{rate_pct:+d}%"
        config = TTSConfig(
            voice=voice_id, rate=rate, volume="+0%", pitch="+0Hz", boundary="WordBoundary"
        )
        uri = (
            f"{WSS_URL}&ConnectionId={connect_id()}"
            f"&Sec-MS-GEC={DRM.generate_sec_ms_gec()}"
            f"&Sec-MS-GEC-Version={SEC_MS_GEC_VERSION}"
        )
        # websockets adds Sec-WebSocket-Version itself; passing it again via
        # additional_headers duplicates it and Bing rejects with HTTP 400.
        headers = {
            k: v
            for k, v in DRM.headers_with_muid(WSS_HEADERS).items()
            if k.lower() != "sec-websocket-version"
        }
        audio = bytearray()
        async with ws_client.connect(
            uri,
            proxy=self._proxy(),
            ssl=self._ssl_context(),
            additional_headers=headers,
            compression=None,
            open_timeout=20,
            close_timeout=10,
        ) as ws:
            await ws.send(
                f"X-Timestamp:{date_to_string()}\r\n"
                "Content-Type:application/json; charset=utf-8\r\n"
                "Path:speech.config\r\n\r\n"
                '{"context":{"synthesis":{"audio":{"metadataoptions":{'
                '"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},'
                '"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n'
            )
            await ws.send(
                ssml_headers_plus_data(connect_id(), date_to_string(), mkssml(config, text))
            )
            try:
                async for msg in ws:
                    if isinstance(msg, str):
                        if "Path:turn.end" in msg:
                            break
                        continue
                    if len(msg) < 2:
                        continue
                    header_len = int.from_bytes(msg[:2], "big")
                    params, data = get_headers_and_data(msg, header_len)
                    if params.get(b"Path") == b"audio" and data:
                        audio.extend(data)
            except ConnectionClosed:
                # The server/proxy sometimes drops the socket without a close
                # frame right after turn.end; audio already received is usable.
                if not audio:
                    raise
        if not audio:
            raise RuntimeError(f"Edge TTS returned no audio for voice {voice_id}")
        return bytes(audio)

    def _run_sync(self, coro) -> bytes:
        """Runs an async synthesis from a sync thread (no running loop here)."""
        try:
            return asyncio.run(coro)
        except RuntimeError:
            # A loop is already running in this thread (should not happen from
            # the sync endpoints / worker threads, but stay safe).
            result: Dict[str, Any] = {}
            def _target():
                try:
                    result["value"] = asyncio.run(coro)
                except Exception as e:  # noqa: BLE001 — captured for the caller
                    result["error"] = e
            thread = threading.Thread(target=_target, daemon=True)
            thread.start()
            thread.join(timeout=settings.EDGE_TTS_SYNTH_TIMEOUT_SECONDS + 30)
            if "error" in result:
                raise result["error"]
            if "value" not in result:
                raise TimeoutError("Edge TTS synthesis timed out")
            return result["value"]

    # ── public API ─────────────────────────────────────────────────────────

    def get_voices(self) -> List[Dict[str, Any]]:
        """Cached Edge catalogue. Empty list when Edge is disabled/unreachable."""
        if not settings.EDGE_TTS_ENABLED:
            return []
        now = time.monotonic()
        with self._lock:
            if self._voices_cache and now - self._voices_cached_at < settings.EDGE_TTS_VOICE_LIST_TTL_SECONDS:
                return list(self._voices_cache)
            if (
                not self._voices_cache
                and self._voices_cache_failed_at
                and now - self._voices_cache_failed_at < 60
            ):
                return []
            try:
                voices = self._fetch_voice_list()
            except Exception as e:  # noqa: BLE001 — any fetch failure hides Edge
                logger.warning(f"Edge TTS voice list fetch failed: {e}")
                self._voices_cache = []
                self._voices_cache_failed_at = now
                return []
            self._voices_cache = voices
            self._voices_cached_at = now
            return list(voices)

    def is_available(self) -> bool:
        """
        True only when Edge actually works right now: voice list fetch OK
        AND a tiny probe synthesis succeeded. Result is cached; a failure
        hides Edge voices until the failure TTL expires, then retries.
        """
        if not settings.EDGE_TTS_ENABLED:
            return False
        now = time.monotonic()
        with self._lock:
            if self._avail_cache is not None:
                ttl = (
                    settings.EDGE_TTS_AVAILABILITY_TTL_SECONDS
                    if self._avail_cache
                    else settings.EDGE_TTS_AVAILABILITY_FAILURE_TTL_SECONDS
                )
                if now - self._avail_checked_at < ttl:
                    return self._avail_cache
        try:
            voices = self.get_voices()
            if not voices:
                raise RuntimeError("Edge voice list empty")
            self.synthesize(
                _PROBE_TEXT,
                _PROBE_VOICE,
                1.0,
                timeout_seconds=settings.EDGE_TTS_PROBE_TIMEOUT_SECONDS,
            )
        except Exception as e:  # noqa: BLE001 — any probe failure hides Edge
            logger.warning(f"Edge TTS availability probe failed: {e}")
            with self._lock:
                self._avail_cache = False
                self._avail_checked_at = time.monotonic()
            return False
        with self._lock:
            self._avail_cache = True
            self._avail_checked_at = time.monotonic()
        return True

    def get_voice(self, voice_id: str) -> Optional[Dict[str, Any]]:
        """Returns the mapped catalogue entry for an Edge voice ID, or None."""
        for voice in self.get_voices():
            if voice["id"] == voice_id:
                return voice
        return None

    def synthesize(
        self,
        text: str,
        voice_id: str,
        speed: float = 1.0,
        timeout_seconds: Optional[float] = None,
    ) -> bytes:
        """
        Synthesizes ``text`` with an Edge voice. Returns MP3 bytes (24kHz,
        48kbps mono — the format Edge streams). Raises TtsException on any
        failure so the worker can fail the job cleanly.
        """
        timeout = (
            settings.EDGE_TTS_SYNTH_TIMEOUT_SECONDS
            if timeout_seconds is None
            else timeout_seconds
        )
        try:
            return self._run_sync(
                asyncio.wait_for(
                    self._synthesize_async(text, voice_id, speed), timeout=timeout
                )
            )
        except Exception as e:  # noqa: BLE001 — surfaced as a clean job failure
            raise TtsException(
                "EDGE_TTS_FAILED",
                f"Edge speech synthesis failed for voice '{voice_id}': {e}",
            ) from e
