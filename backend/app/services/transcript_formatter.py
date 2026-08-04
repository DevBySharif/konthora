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

    def group_sentences(self, segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups words or raw segments into coherent sentence units.
        If word timestamps exist, splits when seeing ('.', '?', '!') or exceeding sent_max_chars.
        First start -> first word start. Final end -> final word end.
        """
        # Collect all words across all segments if they exist
        has_words = any(len(s.get("words", [])) > 0 for s in segments)

        if not has_words:
            # Fallback directly to segment structures as sentences
            sentences = []
            for s in segments:
                sentences.append({
                    "id": len(sentences),
                    "text": s["text"],
                    "start": s["start"],
                    "end": s["end"],
                    "words": []
                })
            return sentences

        # Build sentences from words
        all_words = []
        for s in segments:
            all_words.extend(s["words"])

        sentences = []
        current_sentence_words = []
        current_sentence_text = []

        for w in all_words:
            current_sentence_words.append(w)
            current_sentence_text.append(w["word"])

            # Sentence endings check (trailing dot, question, exclamation)
            word_str = w["word"].strip()
            is_terminal = len(word_str) > 0 and word_str[-1] in [".", "?", "!"]

            # Character length limit check
            current_char_count = len("".join(current_sentence_text))

            if is_terminal or current_char_count >= self.sent_max_chars:
                # Commit sentence
                sentences.append(self._build_sentence_unit(len(sentences), current_sentence_words))
                current_sentence_words = []
                current_sentence_text = []

        # Commit trailing words
        if current_sentence_words:
            sentences.append(self._build_sentence_unit(len(sentences), current_sentence_words))

        return sentences

    def _build_sentence_unit(self, unit_id: int, words: List[Dict[str, Any]]) -> Dict[str, Any]:
        text = "".join([w["word"] for w in words]).strip()
        # Clean extra spaces
        text = re.sub(r'\s+', ' ', text)
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
        has_words = any(len(s.get("words", [])) > 0 for s in segments)
        if not has_words:
            # Fall back to segments if no word timestamps
            lines = []
            for s in segments:
                lines.append({
                    "id": len(lines),
                    "text": s["text"],
                    "start": s["start"],
                    "end": s["end"],
                    "words": []
                })
            return lines

        all_words = []
        for s in segments:
            all_words.extend(s["words"])

        lines = []
        current_words = []

        for w in all_words:
            current_words.append(w)
            # Split line when word limit reached or seeing terminal punctuation
            is_terminal = w["word"].strip() and w["word"].strip()[-1] in [".", "?", "!"]

            if len(current_words) >= words_per_line or is_terminal:
                lines.append(self._build_line_unit(len(lines), current_words))
                current_words = []

        if current_words:
            lines.append(self._build_line_unit(len(lines), current_words))

        return lines

    def _build_line_unit(self, unit_id: int, words: List[Dict[str, Any]]) -> Dict[str, Any]:
        text = "".join([w["word"] for w in words]).strip()
        text = re.sub(r'\s+', ' ', text)
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

            last_end = end

            # Split long cues into subtitle lines (max 2 lines, 84 chars per line)
            split_lines = self._wrap_subtitle_text(text, limit=self.sub_max_chars, max_lines=self.sub_max_lines)
            subtitle_block = "\n".join(split_lines)

            start_tag = format_srt_timestamp(start)
            end_tag = format_srt_timestamp(end)

            lines.append(f"{cue_idx}\n{start_tag} --> {end_tag}\n{subtitle_block}\n")
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

            last_end = end

            split_lines = self._wrap_subtitle_text(text, limit=self.sub_max_chars, max_lines=self.sub_max_lines)
            subtitle_block = "\n".join(split_lines)

            start_tag = format_vtt_timestamp(start)
            end_tag = format_vtt_timestamp(end)

            lines.append(f"{cue_idx}\n{start_tag} --> {end_tag}\n{subtitle_block}\n")
            cue_idx += 1

        return "\n".join(lines)

    def _wrap_subtitle_text(self, text: str, limit: int, max_lines: int) -> List[str]:
        """Utility to split subtitle texts cleanly on word boundaries."""
        words = text.split()
        lines = []
        current_line = []

        for w in words:
            # Check length of current line + next word
            test_line = " ".join(current_line + [w])
            if len(test_line) > limit:
                if current_line:
                    lines.append(" ".join(current_line))
                    current_line = [w]
                else:
                    # Single extremely long word, force split
                    lines.append(w)
                    current_line = []
            else:
                current_line.append(w)

        if current_line:
            lines.append(" ".join(current_line))

        # Restrict to max lines
        if len(lines) > max_lines:
            lines = lines[:max_lines]

        return lines
