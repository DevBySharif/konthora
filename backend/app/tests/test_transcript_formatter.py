import pytest
from app.services.transcript_formatter import TranscriptFormatter
from app.utils.timestamp_formatter import (
    parse_seconds,
    format_display_timestamp,
    format_srt_timestamp,
    format_vtt_timestamp
)

def test_parse_seconds():
    # Standard format
    assert parse_seconds(0.0) == (0, 0, 0, 0)
    assert parse_seconds(12.345) == (0, 0, 12, 345)
    assert parse_seconds(3665.9996) == (1, 1, 6, 0) # handles round up
    assert parse_seconds(-5.0) == (0, 0, 0, 0) # handles negative

def test_format_timestamps():
    assert format_display_timestamp(12.5) == "[00:12]"
    assert format_display_timestamp(3605.2) == "[01:00:05]"
    assert format_srt_timestamp(65.123) == "00:01:05,123"
    assert format_vtt_timestamp(65.123) == "00:01:05.123"

def test_sanitize_and_validate_segments():
    formatter = TranscriptFormatter()
    raw_segments = [
        {"id": 0, "text": "   ", "start": 0.0, "end": 2.0}, # empty text -> wipe
        {"id": 1, "text": "First segment", "start": -0.5, "end": 3.0}, # negative start -> clamp to 0.0
        {"id": 2, "text": "Overlap segment", "start": 2.9, "end": 5.0}, # overlap start -> monotonic shift to 3.0
        {"id": 3, "text": "Overshoot segment", "start": 9.0, "end": 15.0}, # overshoot -> clamp to duration 10.0
    ]

    validated = formatter.sanitize_and_validate_segments(raw_segments, media_duration=10.0)
    assert len(validated) == 3

    # Assert clamp and monotonic properties
    assert validated[0]["start"] == 0.0
    assert validated[0]["end"] == 3.0
    assert validated[1]["start"] == 3.0
    assert validated[1]["end"] == 5.0
    assert validated[2]["start"] == 9.0
    assert validated[2]["end"] == 10.0

def test_group_sentences_with_words():
    formatter = TranscriptFormatter()
    segments = [
        {
            "id": 0,
            "text": "Hello world. This is test.",
            "start": 0.0,
            "end": 4.0,
            "words": [
                {"word": "Hello", "start": 0.0, "end": 0.5},
                {"word": " world.", "start": 0.5, "end": 1.0},
                {"word": " This", "start": 1.0, "end": 1.5},
                {"word": " is", "start": 1.5, "end": 2.0},
                {"word": " test.", "start": 2.0, "end": 2.5}
            ]
        }
    ]

    sentences = formatter.group_sentences(segments)
    assert len(sentences) == 2
    assert sentences[0]["text"] == "Hello world."
    assert sentences[0]["start"] == 0.0
    assert sentences[0]["end"] == 1.0

    assert sentences[1]["text"] == "This is test."
    assert sentences[1]["start"] == 1.0
    assert sentences[1]["end"] == 2.5

def test_group_paragraphs():
    formatter = TranscriptFormatter()
    sentences = [
        {"id": 0, "text": "Sentence one.", "start": 0.0, "end": 2.0, "words": []},
        {"id": 1, "text": "Sentence two.", "start": 2.2, "end": 4.0, "words": []}, # gap is 0.2s (< gap threshold 1.5s)
        {"id": 2, "text": "Sentence three.", "start": 6.0, "end": 8.0, "words": []}, # gap is 2.0s (>= gap threshold 1.5s)
    ]

    paragraphs = formatter.group_paragraphs(sentences)
    assert len(paragraphs) == 2
    assert paragraphs[0]["text"] == "Sentence one. Sentence two."
    assert paragraphs[1]["text"] == "Sentence three."

def test_srt_wrapping():
    formatter = TranscriptFormatter()
    # Mock settings.TRANSCRIPTION_SUBTITLE_MAX_CHARACTERS = 84
    # Mock settings.TRANSCRIPTION_SUBTITLE_MAX_LINES = 2
    long_text = "This is a very long transcription segment that we want to render inside an SRT cue and it should split nicely across lines without breaking words."

    lines = formatter._wrap_subtitle_text(long_text, limit=40, max_lines=2)
    assert len(lines) == 2
    assert len(lines[0]) <= 40
    assert len(lines[1]) <= 40
