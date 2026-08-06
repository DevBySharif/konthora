from typing import List, Dict, Any
import re

class Chunk:
    def __init__(self, index: int, text: str, source_start: int, source_end: int, end_boundary: str):
        self.index = index
        self.text = text
        self.source_start = source_start
        self.source_end = source_end
        self.end_boundary = end_boundary  # 'paragraph', 'sentence', 'clause', 'none'

    def to_dict(self) -> Dict[str, Any]:
        return {
            "index": self.index,
            "text": self.text,
            "sourceStart": self.source_start,
            "sourceEnd": self.source_end,
            "endBoundary": self.end_boundary,
        }

def chunk_text(text: str, max_chars: int = 400) -> List[Chunk]:
    """
    Splits normalized text into synthesis-friendly chunks based on grammatical boundaries.
    Source offsets refer to the character index in the normalized text.
    """
    if not text.strip():
        return []

    chunks: List[Chunk] = []
    chunk_index = 0

    # Split by paragraph boundaries
    # Keep track of paragraph positions
    paragraphs: List[tuple[str, int]] = []
    current_pos = 0

    # We want to split on \n\n but keep offsets accurate
    raw_paragraphs = text.split('\n\n')
    for p in raw_paragraphs:
        start_idx = text.find(p, current_pos)
        paragraphs.append((p, start_idx))
        current_pos = start_idx + len(p)

    for p_text, p_start in paragraphs:
        p_text_stripped = p_text.strip()
        if not p_text_stripped:
            continue

        # If paragraph fits in max_chars, emit it as a single chunk
        if len(p_text_stripped) <= max_chars:
            chunks.append(
                Chunk(
                    index=chunk_index,
                    text=p_text_stripped,
                    source_start=p_start,
                    source_end=p_start + len(p_text),
                    end_boundary="paragraph"
                )
            )
            chunk_index += 1
            continue

        # Otherwise, split paragraph into sentences
        sentences = split_into_sentences(p_text, p_start)

        current_chunk_text = ""
        current_chunk_start = -1
        current_chunk_end = -1
        last_boundary = "sentence"

        for s_text, s_start, s_end, s_boundary in sentences:
            if not s_text.strip():
                continue

            # If a single sentence is larger than max_chars, split it on clauses or words
            if len(s_text) > max_chars:
                # First, emit current active chunk if it exists
                if current_chunk_text:
                    chunks.append(
                        Chunk(
                            index=chunk_index,
                            text=current_chunk_text.strip(),
                            source_start=current_chunk_start,
                            source_end=current_chunk_end,
                            end_boundary="sentence"
                        )
                    )
                    chunk_index += 1
                    current_chunk_text = ""

                # Split the giant sentence
                sub_chunks = split_giant_sentence(s_text, s_start, max_chars)
                for sub in sub_chunks:
                    # If this sub-chunk is at the end of the sentence, preserve the sentence boundary
                    boundary = s_boundary if sub.source_end == s_end else sub.end_boundary
                    chunks.append(
                        Chunk(
                            index=chunk_index,
                            text=sub.text,
                            source_start=sub.source_start,
                            source_end=sub.source_end,
                            end_boundary=boundary
                        )
                    )
                    chunk_index += 1
                continue

            # If adding sentence exceeds max_chars, emit current chunk first
            if current_chunk_text and len(current_chunk_text) + len(s_text) + 1 > max_chars:
                chunks.append(
                    Chunk(
                        index=chunk_index,
                        text=current_chunk_text.strip(),
                        source_start=current_chunk_start,
                        source_end=current_chunk_end,
                        end_boundary="sentence"
                    )
                )
                chunk_index += 1
                current_chunk_text = ""

            # Add sentence to active chunk
            if not current_chunk_text:
                current_chunk_start = s_start
                current_chunk_text = s_text
            else:
                current_chunk_text += " " + s_text
            current_chunk_end = s_end
            last_boundary = s_boundary

        # Emit any remaining text in the paragraph as a paragraph boundary chunk
        if current_chunk_text:
            chunks.append(
                Chunk(
                    index=chunk_index,
                    text=current_chunk_text.strip(),
                    source_start=current_chunk_start,
                    source_end=current_chunk_end,
                    end_boundary="paragraph"
                )
            )
            chunk_index += 1

    # Fix the final chunk's boundary (must end with paragraph/none if it's the absolute end)
    if chunks:
        chunks[-1].end_boundary = "paragraph"

    return chunks

def split_into_sentences(text: str, offset: int) -> List[tuple[str, int, int, str]]:
    """Splits a string into sentences and returns (text, start_offset, end_offset, boundary_type)"""
    import re
    pattern = re.compile(r'([.!?])(\s+)')

    boundaries = []
    for match in pattern.finditer(text):
        punct = match.group(1)
        start_idx = match.start()
        end_idx = match.end()

        is_boundary = True
        if punct == '.':
            before = text[:start_idx]
            after = text[end_idx:]

            # Rule 1: Single-letter initials (e.g., 'J.', 'A.') - ensure not preceded by period
            if re.search(r'(^|\s|[^a-zA-Z.])[a-zA-Z]$', before):
                is_boundary = False

            # Rule 2: Acronyms (e.g., 'U.S.A.', 'Ph.D.')
            elif re.search(r'(^|\s|[^a-zA-Z])([a-zA-Z]\.)+[a-zA-Z]$', before):
                if after and after[0].isupper():
                    is_boundary = True
                else:
                    is_boundary = False

            # Rule 3: Common abbreviations (a.m., p.m.)
            elif re.search(r'\b(a\.m|p\.m)$', before, re.IGNORECASE):
                if after and after[0].isupper():
                    is_boundary = True
                else:
                    is_boundary = False

        if is_boundary:
            boundaries.append((start_idx, end_idx))

    parts = []
    last_idx = 0
    for start_idx, end_idx in boundaries:
        parts.append(text[last_idx:start_idx+1])
        last_idx = end_idx
    parts.append(text[last_idx:])

    sentences: List[tuple[str, int, int, str]] = []
    current_pos = 0
    for part in parts:
        if not part.strip():
            continue
        start_idx = text.find(part, current_pos)
        end_idx = start_idx + len(part)
        current_pos = end_idx
        sentences.append((part.strip(), offset + start_idx, offset + end_idx, 'sentence'))

    return sentences

def split_giant_sentence(text: str, offset: int, max_chars: int) -> List[Chunk]:
    """Splits a single sentence that exceeds max_chars on clause boundaries or word spaces."""
    chunks: List[Chunk] = []
    clause_endings = re.compile(r'(?<=[,;:—])\s+')

    parts = clause_endings.split(text)
    current_pos = 0
    clauses: List[tuple[str, int, int]] = []

    for part in parts:
        if not part.strip():
            continue
        start_idx = text.find(part, current_pos)
        end_idx = start_idx + len(part)
        current_pos = end_idx
        clauses.append((part.strip(), offset + start_idx, offset + end_idx))

    current_chunk_text = ""
    current_chunk_start = -1
    current_chunk_end = -1
    chunk_index = 0

    for c_text, c_start, c_end in clauses:
        # If a single clause exceeds max_chars, split it on spaces
        if len(c_text) > max_chars:
            if current_chunk_text:
                chunks.append(
                    Chunk(
                        index=chunk_index,
                        text=current_chunk_text.strip(),
                        source_start=current_chunk_start,
                        source_end=current_chunk_end,
                        end_boundary="clause"
                    )
                )
                chunk_index += 1
                current_chunk_text = ""

            sub_chunks = split_on_words(c_text, c_start, max_chars)
            for sub in sub_chunks:
                chunks.append(
                    Chunk(
                        index=chunk_index,
                        text=sub.text,
                        source_start=sub.source_start,
                        source_end=sub.source_end,
                        end_boundary=sub.end_boundary
                    )
                )
                chunk_index += 1
            continue

        if current_chunk_text and len(current_chunk_text) + len(c_text) + 1 > max_chars:
            chunks.append(
                Chunk(
                    index=chunk_index,
                    text=current_chunk_text.strip(),
                    source_start=current_chunk_start,
                    source_end=current_chunk_end,
                    end_boundary="clause"
                )
            )
            chunk_index += 1
            current_chunk_text = ""

        if not current_chunk_text:
            current_chunk_start = c_start
            current_chunk_text = c_text
        else:
            current_chunk_text += " " + c_text
        current_chunk_end = c_end

    if current_chunk_text:
        chunks.append(
            Chunk(
                index=chunk_index,
                text=current_chunk_text.strip(),
                source_start=current_chunk_start,
                source_end=current_chunk_end,
                end_boundary="clause"
            )
        )

    return chunks

def split_on_words(text: str, offset: int, max_chars: int) -> List[Chunk]:
    """Fallback: Splits a long string into chunks fitting max_chars on word boundaries (spaces)."""
    words = text.split(' ')
    chunks: List[Chunk] = []

    current_chunk_words: List[str] = []
    current_length = 0
    current_start = offset
    chunk_index = 0

    for word in words:
        if not word:
            continue
        word_len = len(word)
        # If adding this word exceeds limit
        if current_chunk_words and current_length + word_len + 1 > max_chars:
            chunk_text_str = " ".join(current_chunk_words)
            chunks.append(
                Chunk(
                    index=chunk_index,
                    text=chunk_text_str,
                    source_start=current_start,
                    source_end=current_start + len(chunk_text_str),
                    end_boundary="none"
                )
            )
            chunk_index += 1
            current_start = current_start + len(chunk_text_str) + 1
            current_chunk_words = [word]
            current_length = word_len
        else:
            current_chunk_words.append(word)
            current_length += word_len + (1 if current_length > 0 else 0)

    if current_chunk_words:
        chunk_text_str = " ".join(current_chunk_words)
        chunks.append(
            Chunk(
                index=chunk_index,
                text=chunk_text_str,
                source_start=current_start,
                source_end=current_start + len(chunk_text_str),
                end_boundary="none"
            )
        )

    return chunks
