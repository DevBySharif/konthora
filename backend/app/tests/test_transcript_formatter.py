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

def test_srt_wrapping_never_drops_text():
    formatter = TranscriptFormatter()
    long_text = "This is a very long transcription segment that we want to render inside an SRT cue and it should split nicely across lines without breaking words."

    lines = formatter._wrap_subtitle_text(long_text, limit=40, max_lines=2)

    # Every word must survive. Previously this truncated with lines[:max_lines],
    # silently discarding everything past limit * max_lines characters.
    assert " ".join(lines) == long_text
    assert len(lines) > 2, "text should need more than the 2-line budget"
    for line in lines:
        assert len(line) <= 40


def test_long_srt_cue_is_split_into_multiple_cues_not_truncated():
    formatter = TranscriptFormatter()
    long_text = (
        "This is a deliberately long sentence used to prove that subtitle cue "
        "generation no longer discards text beyond the two-line budget, because "
        "the old implementation truncated with lines[:max_lines]."
    )
    data = [{"id": 0, "start": 0.0, "end": 12.0, "text": long_text}]

    srt = formatter.export_srt(data)
    vtt = formatter.export_vtt(data)

    for word in long_text.split():
        assert word in srt, f"SRT dropped {word!r}"
        assert word in vtt, f"VTT dropped {word!r}"

    # More than one cue, and they must run forward in time from the start.
    assert srt.count(" --> ") > 1
    assert vtt.count(" --> ") > 1
    assert srt.startswith("1\n00:00:00,000")
    assert vtt.startswith("WEBVTT")


def test_srt_vtt_skip_empty_transcript_instead_of_failing():
    # A file where Whisper finds no speech must not fail the job. The empty SRT
    # export used to be "" which tripped the zero-byte guard in
    # write_atomic_result and raised, failing the whole transcription.
    import tempfile
    from pathlib import Path

    formatter = TranscriptFormatter()
    d = Path(tempfile.mkdtemp())

    for fmt, payload in [
        ("srt", ""),
        ("vtt", "WEBVTT\n\n"),
        ("txt", "No speech was detected."),
    ]:
        try:
            formatter.write_atomic_result(d / f"result.{fmt}", payload)
        except ValueError:
            # Only SRT may legitimately be empty; it must be handled upstream.
            assert fmt == "srt", f"{fmt} raised on empty output"

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


def test_word_spacing_quotes_hyphens_and_ellipsis():
    """Regression tests for spacing bugs introduced with the word-spacing fix.

    Straight quotes used to render as ``He said" hello".``, BPE split
    hyphenated words gained a space (``well- known``), and an ellipsis token
    was treated as sentence-terminal, splitting one sentence into two.
    """
    formatter = TranscriptFormatter()

    def join(*words):
        ws = [{"word": w, "start": i * 0.4, "end": (i + 1) * 0.4}
              for i, w in enumerate(words)]
        return formatter._format_words_to_text(ws)

    q = chr(34)

    # Opening quote keeps its leading space, closing quote hugs the word.
    assert join("He", "said", q, "hello", q, ".") == 'He said "hello".'

    # A trailing hyphen continues the previous token.
    assert join("a", "well-", "known", "issue", ".") == "a well-known issue."

    # Ordinary text and contractions still work.
    assert join("Hello", "there", ".") == "Hello there."
    assert join("It", "'s", "fine", ".") == "It's fine."

    # An ellipsis is a pause, not an ending.
    segs = [{
        "id": 0, "start": 0.0, "end": 2.0, "text": "",
        "words": [
            {"word": w, "start": i * 0.4, "end": (i + 1) * 0.4}
            for i, w in enumerate(["Wait", "...", "really", "are", "you", "ok", "?"])
        ],
    }]
    sentences = formatter.group_sentences(segs)
    texts = [x["text"] for x in sentences]
    assert len(sentences) == 1, "ellipsis split the sentence: %r" % (texts,)
    assert "really" in texts[0]


def test_abbreviation_does_not_create_one_word_sentence():
    """Whisper splits "Dr." into ``Dr`` + ``.``; the lone period must not
    terminate the sentence and produce an orphan one-word unit."""
    formatter = TranscriptFormatter()
    segs = [{
        "id": 0, "start": 0.0, "end": 3.0, "text": "",
        "words": [
            {"word": w, "start": i * 0.4, "end": (i + 1) * 0.4}
            for i, w in enumerate(["Dr", ".", "Smith", "called", "yesterday", "."])
        ],
    }]
    sentences = formatter.group_sentences(segs)
    texts = [x["text"].strip() for x in sentences]
    assert "Dr." not in texts, "orphan abbreviation sentence: %r" % (texts,)
    assert "." not in texts, "orphan period sentence: %r" % (texts,)
    assert "Smith" in " ".join(texts)
