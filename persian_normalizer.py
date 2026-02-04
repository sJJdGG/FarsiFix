import re
import unicodedata

# This module normalizes Persian/Arabic-script text for Excel-style search/filtering.
# The intent is "make what users type match what exists in sheets", not to preserve
# visual fidelity or linguistic nuance.
#
# Goals (ELI5):
# - If two letters look the same to a Persian user, treat them as the same.
# - If text has invisible marks, remove them so matching works.
# - If punctuation is NOT available on Persian keyboards (e.g. Urdu full stop),
#   normalize it to ASCII so the user's keyboard input still matches.
# - Digits are always normalized to ASCII because users commonly type ASCII digits.
# - Keep output stable and easy to search, even if the original data is messy.
#
# Design choices (brief but explicit):
# - We prefer "what users type" over "what producers emit".
# - We normalize to Persian keyboard letters plus ASCII digits, and only
#   normalize punctuation when it is not on Persian keyboards.
# - We keep unknown Arabic-extended letters unchanged to avoid data loss.
# - Newlines are preserved exactly; only horizontal whitespace within lines
#   is collapsed for matching.
#
# Non-goals (explicitly NOT doing these):
# - Exact round-trip conversion.
# - Full linguistic correctness for all Arabic-script languages.
# - Rendering-accurate output.


# --- public API --------------------------------------------------------------
def normalize_fa(s: str) -> str:
    """Normalize Persian/Arabic-script text for search/filtering (canonical output).

    ELI5 examples:
      - "كريم" and "کریم" both become "کریم"
      - "۱۲۳" becomes "123"
      - "سلام‌دنیا" (with ZWNJ) becomes "سلام دنیا"
      - "سلام۔" (Urdu full stop) becomes "سلام."
      - newlines are preserved: "سلام\\n  دنیا" -> "سلام\\nدنیا"
    """
    return _normalize_fa(s)


# --- implementation ----------------------------------------------------------
_ARABIC_TO_PERSIAN_LETTERS = {
    # The core mapping: Arabic forms and mixed-script variants -> Persian keyboard forms.
    # We bias toward what Persian users type by default when filtering/searching.
    #
    # Yeh/Kaf family (very common in "Arabic output" software):
    # - Arabic Yeh "ي" and Alef Maksura "ى" are not on Persian keyboards.
    # - Arabic Kaf "ك" is not on Persian keyboards; Persian users type "ک".
    "\u064a": "\u06cc",  # ARABIC YEH "ي" -> FARSI YEH "ی" (users type Persian YEH)
    "\u0649": "\u06cc",  # ALEF MAKSURA "ى" -> FARSI YEH "ی" (common in Arabic exports)
    "\u0643": "\u06a9",  # ARABIC KAF "ك" -> KEHEH "ک" (Persian keyboard KAF)
    "\u06aa": "\u06a9",  # SWASH KAF "ڪ" -> KEHEH "ک" (regional Arabic-script variant)
    "\u06ab": "\u06a9",  # KAF WITH RING "ګ" -> KEHEH "ک" (regional variant)
    "\u06ac": "\u06a9",  # KAF WITH DOT ABOVE "ڪ̇" -> KEHEH "ک" (regional variant)
    "\u06ad": "\u06a9",  # NG + KAF family "ڭ" -> KEHEH "ک" (approximate to Persian KAF)
    "\u06ae": "\u06a9",  # KAF WITH THREE DOTS "ڮ" -> KEHEH "ک" (regional variant)
    # Heh variants commonly seen in mixed data:
    # Many sources emit non-Persian "heh" shapes; we collapse all to "ه".
    "\u06c1": "\u0647",  # HEH GOAL "ہ" -> HEH "ه" (collapse to Persian HEH)
    "\u0629": "\u0647",  # TEH MARBUTA "ة" -> HEH "ه" (search-friendly simplification)
    "\u06c0": "\u0647",  # HEH WITH YEH ABOVE "ۀ" -> HEH "ه" (drop hamza)
    "\u06c2": "\u0647",  # HEH GOAL WITH HAMZA "ۂ" -> HEH "ه" (drop hamza)
    "\u06be": "\u0647",  # HEH DOACHASHMEE "ھ" -> HEH "ه" (best Persian match)
    "\u06d5": "\u0647",  # ARABIC LETTER AE "ە" -> HEH "ه" (Persian loans prefer "ه")
    # Hamza seat simplifications:
    # These are Arabic orthographic variants; Persian users typically type base letters.
    "\u0623": "\u0627",  # ALEF WITH HAMZA ABOVE "أ" -> ALEF "ا"
    "\u0625": "\u0627",  # ALEF WITH HAMZA BELOW "إ" -> ALEF "ا"
    "\u0624": "\u0648",  # WAW WITH HAMZA "ؤ" -> WAW "و"
    "\u0626": "\u06cc",  # YEH WITH HAMZA "ئ" -> FARSI YEH "ی"
    "\u0671": "\u0627",  # ALEF WASLA "ٱ" -> ALEF "ا"
    "\u0672": "\u0627",  # ALEF WITH WAVY HAMZA "ٲ" -> ALEF "ا"
    "\u0673": "\u0627",  # ALEF WITH WAVY HAMZA BELOW "ٳ" -> ALEF "ا"
    "\u0675": "\u0627",  # HIGH HAMZA ALEF "ٵ" -> ALEF "ا"
    "\u06d2": "\u06cc",  # YEH BARREE "ے" -> FARSI YEH "ی"
    "\u06d3": "\u06cc",  # YEH BARREE WITH HAMZA "ۓ" -> FARSI YEH "ی"
}

# Arabic-extended letters commonly emitted by software for Persian text
_ARABIC_EXTENDED_TO_PERSIAN = {
    # These are not on Persian keyboards, but appear in Arabic-script outputs
    # from third-party systems (Urdu/Pashto/Kurdish-influenced data, etc.).
    # We map them to the closest Persian base letter to improve search matches.
    # Example: users will type "د" and expect it to match "ڈ" in imported data.
    "\u0679": "\u062a",  # TTEH "ٹ" -> TEH "ت" (closest Persian base)
    "\u0688": "\u062f",  # DDAL "ڈ" -> DAL "د" (closest Persian base)
    "\u0691": "\u0631",  # RREH "ڑ" -> REH "ر" (closest Persian base)
    "\u06ba": "\u0646",  # NOON GHUNNA "ں" -> NOON "ن" (closest Persian base)
    "\u06a4": "\u0641",  # VEH "ڤ" -> FEH "ف" (common Persian replacement)
}
# IMPORTANT: Any Arabic-extended letter NOT in this table is left unchanged.
# This avoids silent data loss for languages we do not explicitly handle.

# Persian digits (U+06F0..U+06F9) and Arabic-Indic (U+0660..U+0669)
# We always normalize digits to ASCII because most users type digits via the
# numeric keypad and Excel searches with ASCII numerals.
_ARABIC_INDIC_TO_PERSIAN_DIGIT = {chr(0x0660 + i): chr(0x06F0 + i) for i in range(10)}
_ASCII_TO_PERSIAN_DIGIT = {str(i): chr(0x06F0 + i) for i in range(10)}
_PERSIAN_TO_ASCII_DIGIT = {v: k for k, v in _ASCII_TO_PERSIAN_DIGIT.items()}
_ARABIC_INDIC_TO_ASCII_DIGIT = {chr(0x0660 + i): str(i) for i in range(10)}

# Punctuation normalization (minimal)
_PUNCT_TO_ASCII = {
    # Minimal punctuation normalization:
    # - We do NOT convert Persian/Arabic comma/semicolon/question mark because
    #   they are familiar and used by many Persian users.
    # - We DO convert Arabic full stop (Urdu) to ASCII dot because both Persian
    #   keyboards use the ASCII dot key, and this character is not on them.
    # Examples:
    #   "سلام۔" -> "سلام."
    #   "سلام؟" stays "سلام؟"
    "\u06d4": ".",  # ARABIC FULL STOP (Urdu) -> ASCII dot
}

_QUOTES_TO_ASCII = {
    # Normalize fancy quotes to plain ASCII quotes.
    # Users rarely type « » or curly quotes when filtering in Excel.
    "\u00ab": '"',  # LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
    "\u00bb": '"',  # RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK
    "\u201c": '"',  # LEFT DOUBLE QUOTATION MARK
    "\u201d": '"',  # RIGHT DOUBLE QUOTATION MARK
    "\u201e": '"',  # DOUBLE LOW-9 QUOTATION MARK
    "\u201f": '"',  # DOUBLE HIGH-REVERSED-9 QUOTATION MARK
    "\u201a": "'",  # SINGLE LOW-9 QUOTATION MARK
    "\u2018": "'",  # LEFT SINGLE QUOTATION MARK
    "\u2019": "'",  # RIGHT SINGLE QUOTATION MARK
    "\u2039": "'",  # SINGLE LEFT-POINTING ANGLE QUOTATION MARK
    "\u203a": "'",  # SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
}

_DASHES_TO_HYPHEN = {
    # Normalize all dash-like characters to a simple hyphen-minus.
    # Users type "-" and expect it to match.
    "\u2010": "-",  # HYPHEN
    "\u2011": "-",  # NON-BREAKING HYPHEN
    "\u2012": "-",  # FIGURE DASH
    "\u2013": "-",  # EN DASH
    "\u2014": "-",  # EM DASH
    "\u2015": "-",  # HORIZONTAL BAR
    "\u2212": "-",  # MINUS SIGN
    "\u2043": "-",  # HYPHEN BULLET
}

_SPACES_TO_ASCII_SPACE = {
    # Normalize exotic/invisible spaces to a regular ASCII space.
    # This prevents "invisible differences" from breaking matches.
    "\u00a0": " ",  # NO-BREAK SPACE
    "\u2007": " ",  # FIGURE SPACE
    "\u2008": " ",  # PUNCTUATION SPACE
    "\u2009": " ",  # THIN SPACE
    "\u200a": " ",  # HAIR SPACE
    "\u202f": " ",  # NARROW NO-BREAK SPACE
    "\u2000": " ",  # EN QUAD
    "\u2001": " ",  # EM QUAD
    "\u2002": " ",  # EN SPACE
    "\u2003": " ",  # EM SPACE
    "\u2004": " ",  # THREE-PER-EM SPACE
    "\u2005": " ",  # FOUR-PER-EM SPACE
    "\u2006": " ",  # SIX-PER-EM SPACE
    "\u205f": " ",  # MEDIUM MATHEMATICAL SPACE
    "\u3000": " ",  # IDEOGRAPHIC SPACE
}

# Translation tables (precomputed for speed)
# These are used with str.translate() to avoid repeated dict construction.
# Any character not in these tables is left unchanged by translate().
_LETTER_TRANSLATION = {
    # Only maps entries in the two tables above; everything else passes through.
    ord(k): v
    for k, v in {**_ARABIC_TO_PERSIAN_LETTERS, **_ARABIC_EXTENDED_TO_PERSIAN}.items()
}
_DIGIT_TRANSLATION = {
    # Only Persian and Arabic-Indic digits are remapped; ASCII digits remain unchanged.
    ord(k): v
    for k, v in {**_PERSIAN_TO_ASCII_DIGIT, **_ARABIC_INDIC_TO_ASCII_DIGIT}.items()
}
_PUNCT_TRANSLATION = {ord(k): v for k, v in _PUNCT_TO_ASCII.items()}
_SPACE_TRANSLATION = {ord(k): v for k, v in _SPACES_TO_ASCII_SPACE.items()}
_DASH_TRANSLATION = {ord(k): v for k, v in _DASHES_TO_HYPHEN.items()}
_QUOTE_TRANSLATION = {ord(k): v for k, v in _QUOTES_TO_ASCII.items()}

# Codepoints removed entirely to broaden matching.
# Rationale: these marks are rarely typed by users when filtering/searching,
# and they often break exact matching in Excel.
#
# Categories we remove:
# - Qur'anic/annotation marks: 0610..061A
# - Harakat (vowel marks) and related: 064B..065F, plus 0670
# - Extended Qur'anic marks: 06D6..06ED
# - Kashida (tatweel): 0640 (purely decorative stretch)
# - Formatting controls: ZWSP/LRM/RLM/ALM and similar
# - Variation selectors (VS1..VS16), which can create "same-looking" characters
_REMOVE_CODEPOINTS = set()
_REMOVE_CODEPOINTS.update(chr(cp) for cp in range(0x0610, 0x061B))
_REMOVE_CODEPOINTS.update(chr(cp) for cp in range(0x064B, 0x0660))
_REMOVE_CODEPOINTS.update(chr(cp) for cp in range(0x06D6, 0x06EE))
_REMOVE_CODEPOINTS.add("\u0670")  # SUPERSCRIPT ALEF
_REMOVE_CODEPOINTS.add("\u0674")  # HIGH HAMZA (drops after compatibility decomposition)
_REMOVE_CODEPOINTS.add("\u0640")  # TATWEEL
_REMOVE_CODEPOINTS.add("\u0621")  # HAMZA (often omitted by users in search)
_REMOVE_CODEPOINTS.update(chr(cp) for cp in range(0x08D4, 0x0900))
_REMOVE_CODEPOINTS.update({"\u200b", "\u200e", "\u200f", "\u061c"})  # ZWSP/LRM/RLM/ALM
_REMOVE_CODEPOINTS.update(
    chr(cp) for cp in range(0xFE00, 0xFE10)
)  # Variation selectors VS1..VS16
# Treat ZWNJ specially below (convert to ASCII space for fuzzy search).
# Users typically type a space (or nothing) instead of the ZWNJ character.
_ZWNJ = "\u200c"


def _collapse_whitespace_preserve_newlines(s: str) -> str:
    # Collapse runs of spaces/tabs within each line, but preserve line breaks.
    # We keep newline characters exactly as-is (including CRLF vs LF) while
    # normalizing the text around them for search.
    out = []
    for chunk in s.splitlines(keepends=True):
        line = chunk
        ending = ""
        if chunk.endswith("\r\n"):
            line = chunk[:-2]
            ending = "\r\n"
        elif chunk.endswith("\n"):
            line = chunk[:-1]
            ending = "\n"
        elif chunk.endswith("\r"):
            line = chunk[:-1]
            ending = "\r"
        # Collapse horizontal whitespace inside the line.
        line = re.sub(r"[ \t\f\v]+", " ", line).strip()
        out.append(line + ending)
    return "".join(out)


def _normalize_fa(s: str) -> str:
    # Why this order?
    # - NFKC first so presentation forms (ligatures) become real letters.
    # - Letter translation before stripping marks so we don't lose the base letter.
    # - Strip diacritics/format controls before spacing/punctuation so hidden chars
    #   don't affect later regexes or spacing.
    # - Normalize spaces/dashes/quotes before collapsing whitespace.
    # - Digits before punctuation so any numeric content is consistently ASCII.
    # - Collapse whitespace last to keep output stable.
    # 0) NFKC -> casefold -> NFC.
    # NFKC expands Arabic presentation forms (ligatures) into base letters.
    # Example: "ﻻ" becomes "لا" before further processing.
    # casefold() normalizes case for any Latin text (e.g., "ABC" -> "abc"),
    # which makes mixed-language search more forgiving.
    # NFC at the end recomposes any combining marks introduced by casefolding.
    s = unicodedata.normalize("NFKC", s)
    s = s.casefold()
    s = unicodedata.normalize("NFC", s)

    # 1) Letter canonicalization (Arabic -> Persian repertoire).
    # This handles Arabic variants that are visually similar but different codepoints.
    # Example: "كريم" -> "کریم", "علي" -> "علی"
    s = s.translate(_LETTER_TRANSLATION)

    # 2) Strip diacritics/annotations/kashida/formatting but preserve ZWNJ for step 3.
    # We explicitly remove Cf (format controls) because they break search matching.
    # Example: "عَلِيّ" -> "علی" (vowel marks removed)
    stripped_chars = []
    for ch in s:
        if ch == _ZWNJ:
            stripped_chars.append(ch)
            continue
        if ch in _REMOVE_CODEPOINTS:
            continue
        if unicodedata.category(ch) == "Cf":
            continue
        stripped_chars.append(ch)
    s = "".join(stripped_chars)

    # 3) ZWNJ policy: map to ASCII space for semantic separation in search results.
    # This helps users find both "می‌روم" and "میروم" with a space-insensitive match.
    # Example: "می‌روم" -> "می روم"
    s = s.replace(_ZWNJ, " ")

    # 4) Normalize exotic spaces, dashes, and quotes before collapsing whitespace.
    # This prevents invisible or uncommon punctuation from blocking matches.
    # Examples:
    # - "«سلام»" -> "\"سلام\""
    # - "می–روم" (en-dash) -> "می-روم"
    if any(space in s for space in _SPACES_TO_ASCII_SPACE):
        s = s.translate(_SPACE_TRANSLATION)
    s = s.translate(_DASH_TRANSLATION)
    s = s.translate(_QUOTE_TRANSLATION)

    # 5) Digits -> ASCII (Latin). This matches how most users type digits in Excel.
    # Example: "۱۲۳۴۵۶۷۸۹۰" -> "1234567890"
    s = s.translate(_DIGIT_TRANSLATION)

    # 6) Punctuation -> minimal ASCII normalization.
    # We only normalize punctuation that is NOT on Persian keyboards (e.g. Urdu full stop).
    # We intentionally keep Persian/Arabic comma/semicolon/question mark as-is.
    # Example: "سلام۔" -> "سلام." but "سلام؟" stays "سلام؟"
    s = s.translate(_PUNCT_TRANSLATION)

    # 7) Collapse whitespace for stable matching, but preserve newlines.
    # Example: "سلام   دنیا" -> "سلام دنیا"
    # Example with newlines: "سلام\\n  دنیا" -> "سلام\\nدنیا"
    s = _collapse_whitespace_preserve_newlines(s)
    return s
