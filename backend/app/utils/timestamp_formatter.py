from typing import Tuple

def parse_seconds(seconds: float) -> Tuple[int, int, int, int]:
    """
    Parses total seconds into (hours, minutes, seconds, milliseconds).
    Guarantees no negative outputs.
    """
    if seconds < 0:
        seconds = 0.0

    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    milliseconds = int(round((seconds - int(seconds)) * 1000))

    # Handle rounding overflows (e.g. 999.6ms -> 1000ms -> add 1s)
    if milliseconds >= 1000:
        milliseconds -= 1000
        secs += 1
        if secs >= 60:
            secs -= 60
            minutes += 1
            if minutes >= 60:
                minutes -= 60
                hours += 1

    return hours, minutes, secs, milliseconds

def format_display_timestamp(seconds: float) -> str:
    """Formats seconds to [HH:]MM:SS representation."""
    hours, minutes, secs, _ = parse_seconds(seconds)
    if hours > 0:
        return f"[{hours:02d}:{minutes:02d}:{secs:02d}]"
    return f"[{minutes:02d}:{secs:02d}]"

def format_srt_timestamp(seconds: float) -> str:
    """Formats seconds to SRT standard format: HH:MM:SS,mmm"""
    hours, minutes, secs, ms = parse_seconds(seconds)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"

def format_vtt_timestamp(seconds: float) -> str:
    """Formats seconds to WebVTT standard format: HH:MM:SS.mmm"""
    hours, minutes, secs, ms = parse_seconds(seconds)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{ms:03d}"
