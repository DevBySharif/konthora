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
