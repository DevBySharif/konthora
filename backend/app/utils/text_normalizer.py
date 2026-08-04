import re
from loguru import logger

# Currency regex (e.g. $12.50 or $12)
CURRENCY_PATTERN = re.compile(r'\$(\d+)(?:\.(\d{2}))?\b')

# Percentage regex (e.g. 25%)
PERCENT_PATTERN = re.compile(r'\b(\d+(?:\.\d+)?)%')

# Abbreviation mappings
ABBREVIATIONS = {
    r'\bMr\.\s+': 'Mister ',
    r'\bMr\s+([A-Z])': r'Mister \1',
    r'\bMrs\.\s+': 'Missus ',
    r'\bMrs\s+([A-Z])': r'Missus \1',
    r'\bDr\.\s+': 'Doctor ',
    r'\bDr\s+([A-Z])': r'Doctor \1',
    r'\bMs\.\s+': 'Miss ',
    r'\bMs\s+([A-Z])': r'Miss \1',
    r'\bProf\.\s+': 'Professor ',
    r'\bProf\s+([A-Z])': r'Professor \1',
    r'\bSt\.\s+': 'Saint ',
    r'\be\.g\.\s+': 'for example ',
    r'\be\.g\.\b': 'for example',
    r'\bi\.e\.\s+': 'that is ',
    r'\bi\.e\.\b': 'that is',
    r'\bvs\.\s+': 'versus ',
    r'\bvs\.\b': 'versus',
}

def normalize_text(text: str) -> str:
    """
    Normalizes input text for Kokoro speech synthesis.
    Maintains a conservative strategy to avoid altering names, URLs, IPs, etc.
    """
    if not text:
        return ""

    # 1. Standardize line endings and filter out control characters
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = "".join(ch for ch in text if ord(ch) >= 32 or ch in ['\n', '\t'])

    # 2. Normalize smart punctuation and symbols
    # Smart double quotes
    text = text.replace('“', '"').replace('”', '"')
    # Smart single quotes and apostrophes
    text = text.replace('‘', "'").replace('’', "'").replace('`', "'")
    # Dashes and hyphens
    text = text.replace('—', '-').replace('–', '-')
    # Ellipses
    text = text.replace('…', '...')

    # 3. Currency normalization (e.g., $12.50 -> 12 dollars and 50 cents, $12 -> 12 dollars)
    def replace_currency(match):
        dollars = match.group(1)
        cents = match.group(2)
        if cents:
            # Handle decimals like .50
            cents_val = int(cents)
            if cents_val == 0:
                return f"{dollars} dollars"
            return f"{dollars} dollars and {cents} cents"
        return f"{dollars} dollars"

    text = CURRENCY_PATTERN.sub(replace_currency, text)

    # 4. Percentages (e.g., 25% -> 25 percent)
    text = PERCENT_PATTERN.sub(r'\1 percent', text)

    # 5. Expand abbreviations contextually
    for pattern, replacement in ABBREVIATIONS.items():
        text = re.sub(pattern, replacement, text)

    # 6. Collapse extra whitespaces while preserving paragraph boundaries (\n\n)
    lines = []
    for line in text.split('\n'):
        # Collapse multiple spaces inside this line
        collapsed = ' '.join(line.split())
        lines.append(collapsed)

    normalized_text = '\n'.join(lines)

    # Clean up multiple empty lines to maximum of 2 newlines (one empty line)
    # to protect paragraph chunking logic
    normalized_text = re.sub(r'\n{3,}', '\n\n', normalized_text)

    return normalized_text.strip()
