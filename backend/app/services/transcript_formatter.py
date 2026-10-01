import json
import os
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
from loguru import logger

from app.core.config import settings
from app.utils.timestamp_formatter import (
    format_display_timestamp,
    format_srt_timestamp,
    format_vtt_timestamp,
)

# Abbreviations that end in a period but do not end a sentence. Splitting on
# them produced one-word "sentences" such as "Dr." or "e.g.".
_NON_TERMINAL_ABBREVIATIONS = {
    "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st", "mt", "rev",
    "dr.", "mr.", "mrs.", "ms.", "prof.", "sr.", "jr.", "st.", "mt.", "rev.",
    "e.g", "i.e", "etc", "vs", "approx", "no", "fig", "vol", "pp",
    "e.g.", "i.e.", "etc.", "vs.", "approx.", "no.", "fig.", "vol.", "pp.",
    "inc", "ltd", "co", "corp",
    "inc.", "ltd.", "co.", "corp.",
}


def _ends_sentence(token: str, prev_token: str = "") -> bool:
    """True when a token genuinely terminates a sentence.

    Excludes ellipses (Whisper emits `...` as a standalone token, which used to
    split "Wait ... really" into two fragments) and common abbreviations such as
    "Dr." and "e.g." which otherwise produced one-word sentences.

    ``prev_token`` matters for a standalone "." — Whisper frequently splits
    "Dr." into the tokens ``Dr`` and ``.``, so the period on its own is only a
    terminator when the token before it is not an abbreviation or a lone
    capital letter.
    """
    if not token:
        return False

    # Strip trailing quotes/brackets that may follow the terminal punctuation.
    stripped = token.rstrip('"\'”’)]}')
    if not stripped:
        return False

    if stripped[-1] not in ".?!":
        return False

    # An ellipsis is a pause, not an ending.
    if stripped.endswith("..."):
        return False

    # A run of four or more periods is an ellipsis-style pause.
    if len(stripped) > 3 and stripped.endswith(".") and stripped.rstrip(".").endswith("."):
        return False

    lowered = stripped.lower()
    if lowered in _NON_TERMINAL_ABBREVIATIONS:
        return False

    # Standalone "." straight after an abbreviation or a lone capital letter
    # completes that abbreviation rather than ending the sentence.
    if stripped == "." and prev_token:
        prior = prev_token.strip()
        if prior.lower() in _NON_TERMINAL_ABBREVIATIONS:
            return False
        if len(prior) <= 3 and prior[:1].isupper():
            return False

    return True


class TranscriptFormatter:
    def __init__(self):
        # Load formatting thresholds
        self.sent_max_chars = settings.TRANSCRIPTION_SENTENCE_MAX_CHARACTERS
        self.para_max_chars = settings.TRANSCRIPTION_PARAGRAPH_MAX_CHARACTERS
        self.para_max_duration = settings.TRANSCRIPTION_PARAGRAPH_MAX_DURATION_SECONDS
        self.para_gap = settings.TRANSCRIPTION_PARAGRAPH_GAP_SECONDS
        self.sub_max_chars = settings.TRANSCRIPTION_SUBTITLE_MAX_CHARACTERS
        self.sub_max_lines = settings.TRANSCRIPTION_SUBTITLE_MAX_LINES

    def sanitize_and_validate_segments(
        self,
        segments: List[Dict[str, Any]],
        media_duration: float
    ) -> List[Dict[str, Any]]:
        """
        Validates segment parameters:
        - Rejects NaN/Infinity, negative timestamps (clamping tiny floating errors).
        - Enforces monotonic start/end times.
        - Wipes whitespace-only segments.
        - Clamps overshoot to media_duration.
        """
        valid_segments = []

        last_end = 0.0

        for s in segments:
            text = s.get("text", "").strip()
            if not text:
                continue

            start = float(s.get("start", 0.0))
            end = float(s.get("end", 0.0))

            # Check for NaN / Inf
            import math
            if math.isnan(start) or math.isinf(start) or math.isnan(end) or math.isinf(end):
                logger.warning(f"Discarding segment with non-finite timestamp: start={start}, end={end}")
                continue

            # Clamp negative values
            if start < 0.0:
                start = 0.0
            if end < 0.0:
                end = 0.0

            # Clamp overshoot
            if start > media_duration:
                start = media_duration
            if end > media_duration:
                end = media_duration

            # Ensure start is before end
            if start > end:
                # swap or fix tiny rounding
                if start - end < 0.05:
                    end = start
                else:
                    logger.warning(f"Discarding invalid segment with start > end: start={start}, end={end}")
                    continue

            # Monotonic sanity check
            if start < last_end:
                # Clamp slight overlap
                if last_end - start <= 0.2:
                    start = last_end
                else:
                    # Let it pass but log, or shift start
                    start = max(start, last_end)

            if start > end:
                end = start

            last_end = end

            # Validate words list if present
            valid_words = []
            words = s.get("words", [])
            last_w_end = start
            for w in words:
                w_text = w.get("word", "").strip()
                if not w_text:
                    continue
                w_start = float(w.get("start", 0.0))
                w_end = float(w.get("end", 0.0))

                if math.isnan(w_start) or math.isinf(w_start) or math.isnan(w_end) or math.isinf(w_end):
                    continue
                w_start = max(0.0, min(w_start, media_duration))
                w_end = max(w_start, min(w_end, media_duration))

                # Enforce monotonicity within segment words
                w_start = max(w_start, last_w_end)
                w_end = max(w_end, w_start)
                last_w_end = w_end

                valid_words.append({
                    "word": w_text,
                    "start": w_start,
                    "end": w_end,
                    "probability": w.get("probability")
                })

            valid_segments.append({
                "id": len(valid_segments),
                "text": text,
                "start": start,
                "end": end,
                "words": valid_words,
                "no_speech_probability": s.get("no_speech_probability")
            })

        return valid_segments

    def _format_words_to_text(self, words: List[Dict[str, Any]]) -> str:
        """
        Reconstructs coherent, properly spaced text from a list of word token dictionaries.
        Handles stripped tokens, Whisper leading-space tokens, punctuation, and contractions.

        Quote handling is context aware: the same character is an opening or a
        closing quote depending on whether the previous token is a word, so the
        fixed "attach left / attach right" sets alone produced `He said" hello"`
        and `" hello "`.
        """
        raw_tokens = [w.get("word", "") for w in words if w.get("word", "") is not None]
        cleaned_tokens = [t.strip() for t in raw_tokens if t.strip()]
        if not cleaned_tokens:
            return ""

        # Ellipsis, curly quotes/dashes and friends, written as escapes so the
        # source stays pure ASCII and survives any editor encoding.
        ELLIPSIS = "\u2026"
        LDQUO, RDQUO = "\u201c", "\u201d"
        LSQUO, RSQUO = "\u2018", "\u2019"
        NDASH, MDASH, MINUS = "\u2013", "\u2014", "\u2212"

        # Binds to the PRECEDING word (no leading space).
        no_pre_space = {
            ".", ",", "!", "?", ":", ";", "%", ELLIPSIS,
            ")", "]", "}", RDQUO, RSQUO, '"',
            # Whisper's BPE emits ellipses and hyphenated fragments separately.
            "...", "....",
            "-", NDASH, MDASH, MINUS,
            # Trailing apostrophe/quote fragment.
            "'", RSQUO,
        }

        # Binds to the FOLLOWING word (no trailing space).
        no_post_space = {"(", "[", "{", LDQUO, LSQUO, '"', "\u00ab", "$"}

        # Quote characters whose role depends on the surrounding tokens.
        quote_chars = {'"', LDQUO, RDQUO}

        def is_wordish(tok: str) -> bool:
            return bool(tok) and (tok[-1].isalnum() or tok[-1] in ")]}\u201d\u2019\"'")

        result_parts: List[str] = []

        for i, token in enumerate(cleaned_tokens):
            if i == 0:
                result_parts.append(token)
                continue

            prev_token = cleaned_tokens[i - 1]
            next_token = cleaned_tokens[i + 1] if i + 1 < len(cleaned_tokens) else ""

            # Quote role is decided by what follows: a quote followed by a word is
            # opening (needs a space before it), otherwise it is closing and hugs
            # the preceding word. Deciding from the previous token alone was wrong
            # because an opening quote also follows a word, which produced
            # `He said"hello".`
            if token in quote_chars:
                if is_wordish(next_token):
                    result_parts.append(" " + token)    # opening
                else:
                    result_parts.append(token)          # closing
                continue

            # Contractions: 's, 't, 're, n't, \u2019s ...
            is_contraction = (
                token in {"n't", "n\u2019t"} or
                (len(token) > 1 and token[0] in {"'", RSQUO} and token[1].isalpha())
            )

            # A hyphen at the end of the previous token continues that word, so
            # "well-" + "known" must not gain a space.
            prev_ends_hyphen = prev_token.endswith(("-", NDASH, MDASH, MINUS))

            if token in no_pre_space or is_contraction or prev_ends_hyphen:
                result_parts.append(token)
            elif prev_token in no_post_space:
                result_parts.append(token)
            else:
                result_parts.append(" " + token)

        assembled = "".join(result_parts)
        return re.sub(r"\s+", " ", assembled).strip()

    def _segment_text(self, segment: Dict[str, Any]) -> str:
        """Text for one segment, falling back when word timings are absent.

        A segment can arrive with a populated ``text`` but an empty ``words``
        list (the model returned no word-level timing for it). Selecting only
        word-reconstructed segments and testing them with ``any(...)`` silently
        dropped every such segment, losing whole sentences from the transcript.
        """
        if segment.get("words"):
            return self._format_words_to_text(segment["words"])
        # No words: use the segment text as the model supplied it, only guarding
        # against the collapsed-word case seen before the spacing fix.
        text = (segment.get("text") or "").strip()
        if not text:
            return ""
        # "Helloworld" style output means the words were stripped before
        # reassembly, so repair the spacing instead of emitting it.
        if re.search(r"[a-z][A-Z]", text):
            return re.sub(r"(?<=[a-z])(?=[A-Z])", " ", text)
        return text

    def group_sentences(self, segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups words or raw segments into coherent sentence units.
        If word timestamps exist, splits when seeing ('.', '?', '!') or exceeding sent_max_chars.
        First start -> first word start. Final end -> final word end.
        """
        sentences: List[Dict[str, Any]] = []

        # Segments without word timings still carry text. Building sentences from
        # the union of all `words` and only keeping word-reconstructed units used
        # to silently drop every wordless segment, losing whole sentences.
        if not any(s.get("words") for s in segments):
            for s in segments:
                text = self._segment_text(s)
                if not text:
                    continue
                sentences.append({
                    "id": len(sentences),
                    "text": text,
                    "start": s["start"],
                    "end": s["end"],
                    "words": []
                })
            return sentences

        # Build sentences from words, flushing at wordless segment boundaries so
        # their text is preserved in order.
        all_words: List[Dict[str, Any]] = []
        segment_boundaries: List[Tuple[int, Dict[str, Any]]] = []
        for s in segments:
            if s.get("words"):
                all_words.extend(s["words"])
            else:
                segment_boundaries.append((len(all_words), s))

        current_sentence_words: List[Dict[str, Any]] = []
        current_sentence_text: List[str] = []
        boundary_at = {index: s for index, s in segment_boundaries}

        for word_index, w in enumerate(all_words):
            if word_index in boundary_at:
                # Commit the in-progress sentence before the wordless segment.
                if current_sentence_words:
                    sentences.append(
                        self._build_sentence_unit(len(sentences), current_sentence_words)
                    )
                    current_sentence_words = []
                    current_sentence_text = []
                fallback = self._segment_text(boundary_at[word_index])
                if fallback:
                    gap = boundary_at[word_index]
                    sentences.append({
                        "id": len(sentences),
                        "text": fallback,
                        "start": gap["start"],
                        "end": gap["end"],
                        "words": []
                    })
            current_sentence_words.append(w)
            current_sentence_text.append(w["word"])

            # Sentence endings check (trailing dot, question, exclamation).
            # An ellipsis is NOT terminal: Whisper splits "Wait ... really" into
            # `...` as its own token, and treating it as terminal produced
            # two-word "sentences".
            word_str = w["word"].strip()
            prev_str = (
                current_sentence_words[-2]["word"].strip()
                if len(current_sentence_words) >= 2
                else ""
            )
            is_terminal = _ends_sentence(word_str, prev_str)

            # Character length limit check with proper space estimation
            current_char_count = len(" ".join(current_sentence_text))

            if is_terminal or current_char_count >= self.sent_max_chars:
                # Commit sentence
                sentences.append(self._build_sentence_unit(len(sentences), current_sentence_words))
                current_sentence_words = []
                current_sentence_text = []

        # Commit trailing words
        if current_sentence_words:
            sentences.append(self._build_sentence_unit(len(sentences), current_sentence_words))

        # Any wordless segment that landed after the final word.
        for index, gap in segment_boundaries:
            if index >= len(all_words):
                fallback = self._segment_text(gap)
                if fallback:
                    sentences.append({
                        "id": len(sentences),
                        "text": fallback,
                        "start": gap["start"],
                        "end": gap["end"],
                        "words": []
                    })

        return sentences

    def _build_sentence_unit(self, unit_id: int, words: List[Dict[str, Any]]) -> Dict[str, Any]:
        text = self._format_words_to_text(words)
        return {
            "id": unit_id,
            "text": text,
            "start": words[0]["start"],
            "end": words[-1]["end"],
            "words": words
        }

    def group_paragraphs(self, sentences: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups sentence units into paragraph blocks based on:
        - Time gap between sentences (>= para_gap seconds).
        - Maximum character count (para_max_chars).
        - Maximum duration (para_max_duration seconds).
        """
        paragraphs = []
        if not sentences:
            return paragraphs

        current_para_sentences = [sentences[0]]

        for next_sent in sentences[1:]:
            last_sent = current_para_sentences[-1]

            gap = next_sent["start"] - last_sent["end"]

            para_text = " ".join([s["text"] for s in current_para_sentences])
            para_char_count = len(para_text) + len(next_sent["text"]) + 1

            para_duration = next_sent["end"] - current_para_sentences[0]["start"]

            # Paragraph split triggers
            trigger_gap = gap >= self.para_gap
            trigger_chars = para_char_count >= self.para_max_chars
            trigger_duration = para_duration >= self.para_max_duration

            if trigger_gap or trigger_chars or trigger_duration:
                # Commit paragraph
                paragraphs.append(self._build_paragraph_unit(len(paragraphs), current_para_sentences))
                current_para_sentences = [next_sent]
            else:
                current_para_sentences.append(next_sent)

        if current_para_sentences:
            paragraphs.append(self._build_paragraph_unit(len(paragraphs), current_para_sentences))

        return paragraphs

    def _build_paragraph_unit(self, unit_id: int, sentences: List[Dict[str, Any]]) -> Dict[str, Any]:
        text = " ".join([s["text"] for s in sentences]).strip()
        text = re.sub(r'\s+', ' ', text)
        words = []
        for s in sentences:
            words.extend(s.get("words", []))

        return {
            "id": unit_id,
            "text": text,
            "start": sentences[0]["start"],
            "end": sentences[-1]["end"],
            "words": words
        }

    def format_to_lines(self, segments: List[Dict[str, Any]], words_per_line: int = 12) -> List[Dict[str, Any]]:
        """
        Used for Word Mode. Groups raw words into readable text lines with timestamps.
        Each line uses its first word's start time and final word's end time.
        """
        lines: List[Dict[str, Any]] = []
        has_words = any(s.get("words") for s in segments)
        if not has_words:
            # Fall back to segments if no word timestamps
            for s in segments:
                text = self._segment_text(s)
                if not text:
                    continue
                lines.append({
                    "id": len(lines),
                    "text": text,
                    "start": s["start"],
                    "end": s["end"],
                    "words": []
                })
            return lines

        # Word Mode has the same text-loss problem as group_sentences: wordless
        # segments must be flushed in order instead of being skipped.
        all_words: List[Dict[str, Any]] = []
        boundaries: List[Tuple[int, Dict[str, Any]]] = []
        for s in segments:
            if s.get("words"):
                all_words.extend(s["words"])
            else:
                boundaries.append((len(all_words), s))
        boundary_at = {index: s for index, s in boundaries}

        current_words: List[Dict[str, Any]] = []

        def flush() -> None:
            if current_words:
                lines.append(self._build_line_unit(len(lines), current_words))
                current_words.clear()

        def add_gap(gap: Dict[str, Any]) -> None:
            text = self._segment_text(gap)
            if text:
                lines.append({
                    "id": len(lines),
                    "text": text,
                    "start": gap["start"],
                    "end": gap["end"],
                    "words": []
                })

        for word_index, w in enumerate(all_words):
            if word_index in boundary_at:
                flush()
                add_gap(boundary_at[word_index])

            current_words.append(w)
            # Split line when word limit reached or seeing terminal punctuation
            prev_str = (
                current_words[-2]["word"].strip()
                if len(current_words) >= 2
                else ""
            )
            is_terminal = _ends_sentence(w["word"].strip(), prev_str)

            if len(current_words) >= words_per_line or is_terminal:
                flush()

        flush()

        for index, gap in boundaries:
            if index >= len(all_words):
                add_gap(gap)

        return lines

    def _build_line_unit(self, unit_id: int, words: List[Dict[str, Any]]) -> Dict[str, Any]:
        text = self._format_words_to_text(words)
        return {
            "id": unit_id,
            "text": text,
            "start": words[0]["start"],
            "end": words[-1]["end"],
            "words": words
        }

    def write_atomic_result(self, file_path: Path, content: str) -> None:
        """Atomically writes content to a .part file first, then renames it to target path."""
        part_path = file_path.with_suffix(file_path.suffix + ".part")

        # Ensure parent folder exists
        file_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            with open(part_path, "w", encoding="utf-8") as f:
                f.write(content)
                f.flush()
                os.fsync(f.fileno())

            # Validate output size
            if part_path.stat().st_size == 0:
                raise ValueError("Generated file output size is empty.")

            # Atomic rename
            if file_path.exists():
                file_path.unlink()
            part_path.rename(file_path)

        except Exception as e:
            if part_path.exists():
                try:
                    part_path.unlink()
                except Exception:
                    pass
            logger.error(f"Atomic file write failed for {file_path.name}: {e}")
            raise e

    def export_txt(self, data_list: List[Dict[str, Any]]) -> str:
        """Compiles modes data into display timestamped text blocks."""
        lines = []
        for item in data_list:
            time_tag = format_display_timestamp(item["start"])
            lines.append(f"{time_tag}\n{item['text']}\n")
        return "\n".join(lines)

    def export_srt(self, data_list: List[Dict[str, Any]]) -> str:
        """
        Compiles segments or lines into valid SubRip (SRT) format.
        Splits lines if they exceed character ceilings, enforces subtitle parameters,
        and avoids time overlaps.
        """
        lines = []
        cue_idx = 1

        last_end = 0.0

        for item in data_list:
            start = item["start"]
            end = item["end"]
            text = item["text"]

            # Avoid subtitle cue overlays
            if start < last_end:
                start = last_end
            if start >= end:
                end = start + 0.5  # shift slightly

            # Long units become several consecutive cues so no text is lost.
            for chunk_text, chunk_start, chunk_end in self._subtitle_cue_chunks(
                text, start, end
            ):
                cue_start = chunk_start
                cue_end = chunk_end
                if cue_start < last_end:
                    cue_start = last_end
                if cue_start >= cue_end:
                    cue_end = cue_start + 0.5
                last_end = cue_end

                start_tag = format_srt_timestamp(cue_start)
                end_tag = format_srt_timestamp(cue_end)

                lines.append(f"{cue_idx}\n{start_tag} --> {end_tag}\n{chunk_text}\n")
                cue_idx += 1

        return "\n".join(lines)

    def export_vtt(self, data_list: List[Dict[str, Any]]) -> str:
        """Compiles data list into valid WebVTT format."""
        lines = ["WEBVTT\n"]
        cue_idx = 1

        last_end = 0.0

        for item in data_list:
            start = item["start"]
            end = item["end"]
            text = item["text"]

            if start < last_end:
                start = last_end
            if start >= end:
                end = start + 0.5

            for chunk_text, chunk_start, chunk_end in self._subtitle_cue_chunks(
                text, start, end
            ):
                cue_start = chunk_start
                cue_end = chunk_end
                if cue_start < last_end:
                    cue_start = last_end
                if cue_start >= cue_end:
                    cue_end = cue_start + 0.5
                last_end = cue_end

                start_tag = format_vtt_timestamp(cue_start)
                end_tag = format_vtt_timestamp(cue_end)

                lines.append(f"{cue_idx}\n{start_tag} --> {end_tag}\n{chunk_text}\n")
                cue_idx += 1

        return "\n".join(lines)

    def _wrap_subtitle_text(self, text: str, limit: int, max_lines: int) -> List[str]:
        """Utility to split subtitle texts cleanly on word boundaries.

        Never drops content: every word is emitted, even when that produces more
        than ``max_lines``. The previous implementation truncated with
        ``lines[:max_lines]``, which silently discarded everything past
        ``limit * max_lines`` characters (168 by default) — invisible in the TXT
        and JSON exports, so long sentences simply vanished from the SRT/VTT.
        Callers use the returned list to emit follow-up cues; ``max_lines`` is
        therefore only a soft target used to decide when to start a new cue.
        """
        words = text.split()
        lines: List[str] = []
        current_line: List[str] = []

        for w in words:
            test_line = " ".join(current_line + [w])
            if len(test_line) > limit:
                if current_line:
                    lines.append(" ".join(current_line))
                    current_line = [w]
                else:
                    # Single extremely long token on its own line.
                    lines.append(w)
                    current_line = []
            else:
                current_line.append(w)

        if current_line:
            lines.append(" ".join(current_line))

        return lines

    def _subtitle_cue_chunks(
        self, text: str, start: float, end: float
    ) -> List[tuple]:
        """Chops one transcript unit into (text, start, end) cues that each fit
        the subtitle line budget.

        A unit whose text needs more than ``sub_max_lines`` wrapped lines is
        emitted as several consecutive cues, with times divided proportionally
        by character offset. Nothing is dropped.
        """
        wrapped = self._wrap_subtitle_text(
            text, limit=self.sub_max_chars, max_lines=self.sub_max_lines
        )

        if len(wrapped) <= self.sub_max_lines:
            return [(text, start, end)]

        total_chars = sum(len(line) for line in wrapped) or 1
        duration = max(0.0, end - start)
        chunks: List[tuple] = []
        consumed = 0
        cursor = start

        for index, line in enumerate(wrapped):
            # +1 accounts for the joining space between lines.
            share = (len(line) + (1 if index else 0)) / total_chars
            is_last = index == len(wrapped) - 1
            chunk_end = end if is_last else cursor + (duration * share)
            if chunk_end <= cursor:
                chunk_end = cursor + 0.5
            chunks.append((line, cursor, chunk_end))
            cursor = chunk_end
            consumed += len(line)

        return chunks
