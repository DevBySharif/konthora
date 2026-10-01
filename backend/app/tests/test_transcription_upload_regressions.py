"""Regression tests for upload-path bugs in the transcription API.

Covers the issues found auditing POST /api/v1/transcription/jobs:
  * a synchronous chunk write per 1MB blocked the event loop
  * ``except Exception`` did not catch ``asyncio.CancelledError`` (a
    ``BaseException``), so a client disconnect leaked the queue slot, the
    per-IP active-job slot and the staged file
  * a failure cleanup step that raised would skip the remaining steps
  * internal error text (absolute storage paths) reached the client
  * the upload endpoint lowercased the suffix but the worker looked the source
    up with the original casing
"""
import ast
import asyncio
import inspect
import textwrap
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.v1.transcription import (
    _append_chunk_sync,
    _cleanup_failed_admission,
)


def _mock_queue_manager() -> MagicMock:
    manager = MagicMock()
    manager.release_admission_slot = AsyncMock(return_value=None)
    return manager


def test_append_chunk_sync_appends_bytes(tmp_path):
    target = tmp_path / "upload.part"
    _append_chunk_sync(target, b"abc")
    _append_chunk_sync(target, b"def")
    assert target.read_bytes() == b"abcdef"


def test_cleanup_releases_slots_and_removes_job_dir(tmp_path):
    job_dir = tmp_path / "transcription" / "job-1"
    job_dir.mkdir(parents=True)
    (job_dir / "source.mp3").write_bytes(b"data")

    queue_manager = _mock_queue_manager()
    rate_limiter = MagicMock()

    asyncio.run(
        _cleanup_failed_admission(
            queue_manager, rate_limiter, "1.2.3.4", "job-1", job_dir
        )
    )

    queue_manager.release_admission_slot.assert_awaited_once()
    rate_limiter.deregister_transcription_active_job.assert_called_once_with(
        "1.2.3.4", "job-1"
    )
    assert not job_dir.exists()


def test_cleanup_still_releases_slots_when_file_removal_fails(tmp_path):
    # A cleanup step raising must not leave the queue and IP slots reserved,
    # which would eventually reject every upload from that client.
    job_dir = tmp_path / "transcription" / "job-2"
    job_dir.mkdir(parents=True)

    queue_manager = _mock_queue_manager()
    rate_limiter = MagicMock()

    with patch(
        "app.api.v1.transcription.shutil.rmtree",
        side_effect=OSError("device busy"),
    ):
        asyncio.run(
            _cleanup_failed_admission(
                queue_manager, rate_limiter, "1.2.3.4", "job-2", job_dir
            )
        )

    queue_manager.release_admission_slot.assert_awaited_once()
    rate_limiter.deregister_transcription_active_job.assert_called_once()


def test_cleanup_continues_when_slot_release_fails(tmp_path):
    job_dir = tmp_path / "transcription" / "job-3"
    job_dir.mkdir(parents=True)

    queue_manager = MagicMock()
    queue_manager.release_admission_slot = AsyncMock(side_effect=RuntimeError("boom"))
    rate_limiter = MagicMock()

    asyncio.run(
        _cleanup_failed_admission(
            queue_manager, rate_limiter, "1.2.3.4", "job-3", job_dir
        )
    )

    # The IP slot and the files must still be released.
    rate_limiter.deregister_transcription_active_job.assert_called_once()
    assert not job_dir.exists()


def test_cancelled_error_is_a_base_exception_not_an_exception():
    # This is why the old `except Exception` never ran on disconnect.
    assert issubclass(asyncio.CancelledError, BaseException)
    assert not issubclass(asyncio.CancelledError, Exception)


def test_upload_handler_catches_base_exception():
    """Guard the fix: the handler must not be `except Exception` again.

    A client disconnect raises CancelledError, which is a BaseException, so a
    narrower handler silently skips slot and file cleanup.
    """
    import ast
    import inspect

    from app.api.v1 import transcription as mod

    source = inspect.getsource(mod.create_transcription_job)
    tree = ast.parse(textwrap.dedent(source))

    handlers: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ExceptHandler):
            handlers.append(
                ast.unparse(node.type) if node.type else "bare-except"
            )

    assert handlers, "no except handler found"
    assert "BaseException" in handlers, (
        f"handler must catch BaseException to cover CancelledError, found {handlers}"
    )


def test_cancelling_the_upload_task_cleans_up_slots_and_files():
    """Cancel the endpoint coroutine mid-stream, like a real client disconnect."""
    from app.api.v1 import transcription as mod
    from app.services.rate_limit_service import RateLimitService
    from app.services.transcription_job_service import TranscriptionJobService

    TranscriptionJobService()._jobs.clear()
    RateLimitService()._trans_active_jobs.clear()

    client_ip = "9.9.9.9"

    class _CancellingUpload:
        """Yields one chunk, then blocks so the task can be cancelled."""

        filename = "audio.MP3"
        content_type = "audio/mpeg"

        def __init__(self):
            self._reads = 0
            self.written_dir: Path | None = None

        async def read(self, _size):
            self._reads += 1
            if self._reads == 1:
                return b"\xff\xfb\x90\x00" + b"\x00" * 64
            # A real slow client: the await below is the cancellation point.
            await asyncio.sleep(3600)
            return b""

    async def scenario() -> None:
        queue_manager = _mock_queue_manager()
        # reserve_admission_slot is awaited, so it needs an awaitable mock.
        queue_manager.reserve_admission_slot = AsyncMock(return_value=True)
        upload = _CancellingUpload()

        with patch.object(
            mod, "TranscriptionQueueManager", return_value=queue_manager
        ), patch.object(
            mod.RateLimitService, "get_client_ip", return_value=client_ip
        ), patch.object(
            mod.RateLimitService, "check_transcription_rate_limit"
        ), patch.object(
            mod.RateLimitService, "check_transcription_active_jobs_limit"
        ):
            task = asyncio.create_task(
                mod.create_transcription_job(
                    _FakeRequest(),
                    file=upload,
                    language="auto",
                    timestampMode="sentence",
                    exportFormat="txt",
                )
            )
            # Let the first chunk be written, then simulate the disconnect.
            await asyncio.sleep(0.05)
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await task

        # The partially written upload must be gone and the slot released.
        assert not list(Path("test_storage/transcription").glob("*/upload.part"))
        assert not list(Path("test_storage/transcription").glob("*/source.*"))
        queue_manager.release_admission_slot.assert_awaited()
        assert client_ip not in RateLimitService()._trans_active_jobs

        # The job must be recorded as failed, not left "processing" forever.
        jobs = TranscriptionJobService()._jobs
        assert jobs, "the created job disappeared"
        failed = [j for j in jobs.values() if j.status == "failed"]
        assert len(failed) == 1
        assert failed[0].error_code == "CLIENT_DISCONNECTED"

    try:
        asyncio.run(scenario())
    finally:
        for leftover in Path("test_storage/transcription").glob("*"):
            if leftover.is_dir():
                for child in leftover.rglob("*"):
                    if child.is_file():
                        child.unlink()
                leftover.rmdir()


def test_upload_stores_a_lowercased_source_extension(client):
    """The API lowercased the suffix, so "AUDIO.MP3" landed as source.mp3 while
    the worker looked for source.MP3. Assert both sides of that contract."""
    from app.api.v1 import transcription as mod
    from app.services.transcription_job_service import TranscriptionJobService

    TranscriptionJobService()._jobs.clear()
    seen: dict = {}

    async def _fake_enqueue(job_id):
        from app.utils.storage import resolve_secure_path

        job_dir = resolve_secure_path(f"transcription/{job_id}")
        # The real on-disk names. Asserting `Path("source.MP3").exists()` would
        # pass on Windows (case-insensitive) and on HF (case-sensitive) the old
        # worker lookup missed the file, so compare the literal names instead.
        seen["names"] = sorted(p.name for p in job_dir.glob("source*"))
        return job_id

    with patch.object(mod.MediaService, "inspect_media", return_value={"duration": 1.0}), \
         patch.object(mod, "validate_uploaded_file"), \
         patch.object(
             mod.TranscriptionQueueManager, "enqueue_job", side_effect=_fake_enqueue
         ):
        response = client.post(
            "/api/v1/transcription/jobs",
            files={"file": ("AUDIO.MP3", _minimal_mp3_bytes(), "audio/mpeg")},
            data={"exportFormat": "txt"},
        )

    assert response.status_code == 200, response.text
    assert seen["names"] == ["source.mp3"], (
        f"source must be stored with a lowercased suffix, found {seen['names']}"
    )


def test_internal_error_text_is_not_disclosed_to_the_client(client):
    from app.api.v1 import transcription as mod

    secret_path = "/app/storage/transcription/abc-123/source.mp3"

    with patch.object(mod, "validate_uploaded_file"), patch.object(
        mod.MediaService,
        "inspect_media",
        side_effect=RuntimeError(f"ffprobe failed on {secret_path}"),
    ):
        response = client.post(
            "/api/v1/transcription/jobs",
            files={"file": ("audio.mp3", _minimal_mp3_bytes(), "audio/mpeg")},
        )

    assert response.status_code == 400
    assert "/app/storage" not in response.text, response.text
    assert secret_path not in response.text
    assert "ffprobe" not in response.text


def test_empty_srt_placeholder_is_written_and_non_empty(tmp_path):
    from app.services.transcript_formatter import TranscriptFormatter

    formatter = TranscriptFormatter()
    payload = "1\n00:00:00,000 --> 00:00:01,000\nNo speech was detected.\n"
    out = tmp_path / "result.srt"
    formatter.write_atomic_result(out, payload)
    assert out.stat().st_size > 0
    assert "No speech was detected." in out.read_text(encoding="utf-8")


def test_mixed_wordless_and_word_segments_keep_their_text():
    from app.services.transcript_formatter import TranscriptFormatter

    formatter = TranscriptFormatter()
    segments = [
        {
            "id": 0,
            "start": 0.0,
            "end": 1.0,
            "text": "First sentence.",
            "words": [
                {"word": "First", "start": 0.0, "end": 0.4},
                {"word": "sentence", "start": 0.4, "end": 1.0},
            ],
        },
        {
            "id": 1,
            "start": 1.0,
            "end": 2.0,
            # No word timings for this segment at all.
            "text": "Second sentence.",
            "words": [],
        },
    ]

    out = formatter.export_txt(segments)
    assert "First sentence." in out
    assert "Second sentence." in out, f"wordless segment text was dropped: {out!r}"


class _FakeRequest:
    """Minimal Request stand-in for the endpoint signature."""

    def __init__(self):
        self.headers: dict = {}
        self.client = type("C", (), {"host": "9.9.9.9"})()


def _minimal_mp3_bytes() -> bytes:
    # ID3 header plus a small MPEG frame, enough for the signature checks.
    return b"ID3\x03\x00\x00\x00\x00\x00\x00" + b"\xff\xfb\x90\x00" + b"\x00" * 512
