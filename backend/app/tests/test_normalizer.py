from app.utils.text_normalizer import normalize_text

def test_normalize_basic_cleanup():
    # standard carriage returns and smart quotes
    assert normalize_text("Hello\r\n“World”") == 'Hello\n"World"'
    assert normalize_text("Don’t…") == "Don't..."
    # em-dashes
    assert normalize_text("yes—no") == "yes-no"

def test_normalize_whitespace_collapsing():
    text = "Line 1   contains extra   spaces.  \n\n  Line 2   also has them."
    expected = "Line 1 contains extra spaces.\n\nLine 2 also has them."
    assert normalize_text(text) == expected

def test_normalize_abbreviations():
    assert normalize_text("Dr. Smith met Mr. Brown") == "Doctor Smith met Mister Brown"
    assert normalize_text("Dr Smith") == "Doctor Smith"
    assert normalize_text("Prof. Jones") == "Professor Jones"
    assert normalize_text("e.g. text") == "for example text"

def test_normalize_percentages_and_currencies():
    assert normalize_text("$12.50") == "12 dollars and 50 cents"
    assert normalize_text("$12.00") == "12 dollars"
    assert normalize_text("$100") == "100 dollars"
    assert normalize_text("25%") == "25 percent"
    assert normalize_text("3.14") == "3.14" # Decimals left alone for num2words

def test_normalize_conservative_invariance():
    # Ensure these are not corrupted
    assert normalize_text("v2.1.0") == "v2.1.0"
    assert normalize_text("192.168.1.1") == "192.168.1.1"
    assert normalize_text("example.com") == "example.com"
    assert normalize_text("user@example.com") == "user@example.com"
    assert normalize_text("10:30 AM") == "10:30 AM"
    assert normalize_text("2026-08-04") == "2026-08-04"

def test_normalize_hindi():
    hindi_text = "नमस्ते। कोन्थोरा में आपका स्वागत है। 100%?"
    # Should not expand % to percent or currency when language is hi-IN
    assert normalize_text(hindi_text, language="hi-IN") == "नमस्ते। कोन्थोरा में आपका स्वागत है। 100%?"
    assert normalize_text("₹12.50", language="hi-IN") == "₹12.50"
def test_normalizer_multilingual_spanish():
    # Should preserve ¿, ¡, and accents
    text = "¿Dónde está la estación? ¡Bienvenidos a Konthora!"
    normalized = normalize_text(text, language="es")
    assert normalized == "¿Dónde está la estación? ¡Bienvenidos a Konthora!"

def test_normalizer_multilingual_french():
    text = "Bonjour, bienvenue à Konthora. Ça fonctionne très bien."
    normalized = normalize_text(text, language="fr-FR")
    assert normalized == text

def test_normalizer_multilingual_italian():
    text = "Ciao, benvenuto su Konthora. L'audio è pronto."
    normalized = normalize_text(text, language="it")
    assert normalized == text

def test_normalizer_multilingual_portuguese():
    text = "Olá, bem-vindo ao Konthora. A geração está pronta."
    normalized = normalize_text(text, language="pt-BR")
    assert normalized == text

def test_normalizer_multilingual_no_english_expansion():
    # Ensure abbreviation expansion and currency doesn't trigger
    text = "El Sr. Smith tiene \.50."
    normalized = normalize_text(text, language="es")
    # In English it would be "Mister Smith tiene 12 dollars and 50 cents."
    # In Spanish it should remain untouched except standard replacements
    assert normalized == "El Sr. Smith tiene \.50."
