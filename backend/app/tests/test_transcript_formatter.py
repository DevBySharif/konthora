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

def test_format_words_to_text_spacing_and_punctuation():
    formatter = TranscriptFormatter()
    # Case 1: Pure stripped words without leading spaces (the bug reproduction)
    words = [
        {"word": "This"},
        {"word": "is"},
        {"word": "a"},
        {"word": "very"},
        {"word": "clear"},
        {"word": "demonstration"}
    ]
    assert formatter._format_words_to_text(words) == "This is a very clear demonstration"

    # Case 2: Punctuation tokens and contractions
    words_with_punct = [
        {"word": "Hello"},
        {"word": ","},
        {"word": "it"},
        {"word": "'s"},
        {"word": "wonderful"},
        {"word": "to"},
        {"word": "see"},
        {"word": "you"},
        {"word": "!"}
    ]
    assert formatter._format_words_to_text(words_with_punct) == "Hello, it's wonderful to see you!"

    # Case 3: Leading space tokens from Whisper
    whisper_words = [
        {"word": "Hello"},
        {"word": " world"},
        {"word": "."}
    ]
    assert formatter._format_words_to_text(whisper_words) == "Hello world."

    # Case 4: Parentheses and currency
    bracket_words = [
        {"word": "Cost"},
        {"word": "is"},
        {"word": "$"},
        {"word": "50"},
        {"word": "("},
        {"word": "estimated"},
        {"word": ")"},
        {"word": "."}
    ]
    assert formatter._format_words_to_text(bracket_words) == "Cost is $50 (estimated)."

def test_group_sentences_with_stripped_words():
    formatter = TranscriptFormatter()
    raw_segments = [
        {
            "id": 0,
            "text": "Hello world. This is test.",
            "start": 0.0,
            "end": 4.0,
            "words": [
                {"word": "Hello", "start": 0.0, "end": 0.5},
                {"word": "world.", "start": 0.5, "end": 1.0},
                {"word": "This", "start": 1.0, "end": 1.5},
                {"word": "is", "start": 1.5, "end": 2.0},
                {"word": "test.", "start": 2.0, "end": 2.5}
            ]
        }
    ]

    validated = formatter.sanitize_and_validate_segments(raw_segments, media_duration=10.0)
    sentences = formatter.group_sentences(validated)
    assert len(sentences) == 2
    assert sentences[0]["text"] == "Hello world."
    assert sentences[1]["text"] == "This is test."

def test_format_to_lines_word_mode_spacing():
    formatter = TranscriptFormatter()
    raw_segments = [
        {
            "id": 0,
            "text": "One two three four five six seven eight nine ten eleven twelve thirteen.",
            "start": 0.0,
            "end": 5.0,
            "words": [
                {"word": "One", "start": 0.0, "end": 0.3},
                {"word": "two", "start": 0.3, "end": 0.6},
                {"word": "three", "start": 0.6, "end": 0.9},
                {"word": "four", "start": 0.9, "end": 1.2},
                {"word": "five", "start": 1.2, "end": 1.5},
                {"word": "six", "start": 1.5, "end": 1.8},
                {"word": "seven", "start": 1.8, "end": 2.1},
                {"word": "eight", "start": 2.1, "end": 2.4},
                {"word": "nine", "start": 2.4, "end": 2.7},
                {"word": "ten", "start": 2.7, "end": 3.0},
                {"word": "eleven", "start": 3.0, "end": 3.3},
                {"word": "twelve", "start": 3.3, "end": 3.6},
                {"word": "thirteen.", "start": 3.6, "end": 4.0}
            ]
        }
    ]
    validated = formatter.sanitize_and_validate_segments(raw_segments, media_duration=10.0)
    lines = formatter.format_to_lines(validated, words_per_line=12)
    assert len(lines) == 2
    assert lines[0]["text"] == "One two three four five six seven eight nine ten eleven twelve"
    assert lines[1]["text"] == "thirteen."

def test_export_formats_word_spacing():
    formatter = TranscriptFormatter()
    segments = [
        {"id": 0, "text": "Hello world.", "start": 0.0, "end": 1.5, "words": []},
        {"id": 1, "text": "This is a test transcript.", "start": 1.5, "end": 3.5, "words": []}
    ]

    txt_output = formatter.export_txt(segments)
    assert "Hello world." in txt_output
    assert "This is a test transcript." in txt_output
    assert "Helloworld" not in txt_output
    assert "Thisisatest" not in txt_output

    srt_output = formatter.export_srt(segments)
    assert "Hello world." in srt_output
    assert "This is a test transcript." in srt_output
    assert "-->" in srt_output

    vtt_output = formatter.export_vtt(segments)
    assert "WEBVTT" in vtt_output
    assert "Hello world." in vtt_output
    assert "This is a test transcript." in vtt_output
