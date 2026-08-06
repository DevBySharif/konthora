from app.utils.text_chunker import chunk_text

def test_chunk_by_paragraphs():
    text = "Paragraph one.\n\nParagraph two."
    chunks = chunk_text(text, max_chars=100)

    assert len(chunks) == 2
    assert chunks[0].text == "Paragraph one."
    assert chunks[0].end_boundary == "paragraph"
    assert chunks[0].source_start == 0
    assert chunks[0].source_end == 14

    assert chunks[1].text == "Paragraph two."
    assert chunks[1].end_boundary == "paragraph"
    assert chunks[1].source_start == 16
    assert chunks[1].source_end == 30

def test_chunk_by_sentences_in_large_paragraph():
    text = "Sentence one. Sentence two. Sentence three."
    # Max size forces splitting sentences but groups small ones
    chunks = chunk_text(text, max_chars=30)

    assert len(chunks) == 2
    assert chunks[0].text == "Sentence one. Sentence two."
    assert chunks[0].end_boundary == "sentence"

    assert chunks[1].text == "Sentence three."
    assert chunks[1].end_boundary == "paragraph" # ends paragraph

def test_chunk_giant_sentence_fallback():
    # A giant sentence with clauses
    text = "This is a very long sentence, which contains clause punctuation; it will split on clause limits."
    chunks = chunk_text(text, max_chars=40)

    assert len(chunks) > 1
    # Check that boundaries are clause or paragraph
    for chunk in chunks[:-1]:
        assert chunk.end_boundary in ["clause", "none"]
    assert chunks[-1].end_boundary == "paragraph"

def test_chunk_unpunctuated_word_fallback():
    # Long text with no punctuation
    text = "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10"
    chunks = chunk_text(text, max_chars=15)

    assert len(chunks) > 1
    # Check that no word is chopped (starts/ends on whole words)
    for c in chunks:
        assert len(c.text) <= 15
        assert not c.text.startswith(" ")
        assert not c.text.endswith(" ")

def test_chunk_initials_in_sentence():
    # 1. Initial chain inside a sentence
    # We set max_chars small enough so it WOULD split if the initial was a boundary
    text = "J. R. R. Tolkien wrote The Hobbit."
    chunks = chunk_text(text, max_chars=40)
    assert len(chunks) == 1
    assert chunks[0].text == "J. R. R. Tolkien wrote The Hobbit."
    assert chunks[0].end_boundary == "paragraph"

def test_chunk_initials_at_sentence_end():
    # 2. Initial chain followed by a real sentence boundary
    text = "J. R. R. Tolkien wrote The Hobbit. It became famous."
    chunks = chunk_text(text, max_chars=40)
    assert len(chunks) == 2
    assert chunks[0].text == "J. R. R. Tolkien wrote The Hobbit."
    assert chunks[0].end_boundary == "sentence"
    assert chunks[1].text == "It became famous."

def test_chunk_spaced_dotted_acronym():
    # 3. Spaced dotted acronym
    text = "The U. S. A. has fifty states."
    chunks = chunk_text(text, max_chars=40)
    assert len(chunks) == 1
    assert chunks[0].text == "The U. S. A. has fifty states."

def test_chunk_compact_dotted_acronym():
    # 4. Compact dotted acronym
    text = "The U.S.A. has fifty states."
    chunks = chunk_text(text, max_chars=40)
    assert len(chunks) == 1

def test_chunk_acronym_at_sentence_end():
    # 5. Acronym at sentence end
    text = "The company operates in the U.S.A. It has several offices."
    chunks = chunk_text(text, max_chars=40)
    assert len(chunks) == 2
    assert chunks[0].text == "The company operates in the U.S.A."
    assert chunks[1].text == "It has several offices."

def test_chunk_time_abbreviation_mid_sentence():
    # 6. Time abbreviation mid-sentence
    text = "The meeting starts at 10 a.m. tomorrow."
    chunks = chunk_text(text, max_chars=40)
    assert len(chunks) == 1

def test_chunk_time_abbreviation_end():
    # 7. Time abbreviation at sentence end
    text = "The meeting starts at 10 a.m. Please be on time."
    chunks = chunk_text(text, max_chars=40)
    assert len(chunks) == 2
    assert chunks[0].text == "The meeting starts at 10 a.m."
    assert chunks[1].text == "Please be on time."

def test_chunk_existing_title_behavior():
    # 8. Existing title abbreviation behavior
    text = "Dr. Smith arrived. He sat down."
    chunks = chunk_text(text, max_chars=20)
    # 'Dr. Smith arrived.' is 18 chars, 'He sat down.' is 12 chars.
    assert len(chunks) == 2
    assert chunks[0].text == "Dr. Smith arrived."
    assert chunks[1].text == "He sat down."

def test_chunk_question_exclamation():
    # 9. Question and exclamation endings
    text = "Is this correct? Yes, it is!"
    chunks = chunk_text(text, max_chars=20)
    assert len(chunks) == 2
    assert chunks[0].text == "Is this correct?"
    assert chunks[1].text == "Yes, it is!"
