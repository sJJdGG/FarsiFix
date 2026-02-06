// Helper to keep large one-to-one folding tables readable.
const mapChars = (chars: string, target: string): Record<string, string> =>
  Object.fromEntries(Array.from(chars, (ch) => [ch, target] as const));

const ARABIC_TO_PERSIAN_LETTERS: Record<string, string> = {
  "\u064a": "\u06cc",
  "\u0649": "\u06cc",
  "\u0643": "\u06a9",
  "\u06aa": "\u06a9",
  "\u06ab": "\u06a9",
  "\u06ac": "\u06a9",
  "\u06ad": "\u06a9",
  "\u06ae": "\u06a9",
  "\u06c1": "\u0647",
  "\u0629": "\u0647",
  "\u06c0": "\u0647",
  "\u06c2": "\u0647",
  "\u06be": "\u0647",
  "\u06d5": "\u0647",
  "\u0623": "\u0627",
  "\u0625": "\u0627",
  "\u0624": "\u0648",
  "\u0626": "\u06cc",
  "\u0671": "\u0627",
  "\u0672": "\u0627",
  "\u0673": "\u0627",
  "\u0675": "\u0627",
  "\u06d2": "\u06cc",
  "\u06d3": "\u06cc",
};

const ARABIC_EXTENDED_BASE_TO_PERSIAN: Record<string, string> = {
  // Existing baseline mapping.
  "\u0679": "\u062a",
  "\u0688": "\u062f",
  "\u0691": "\u0631",
  "\u06ba": "\u0646",
  "\u06a4": "\u0641",

  // Added from Hazm+Shekar consensus where our previous baseline left unchanged.
  ...mapChars("\u066e\u067b\u0680\u0750\u0752\u0754\u0755\u0756", "\u0628"),
  ...mapChars("\u067a\u067c\u067f", "\u062a"),
  ...mapChars("\u0681\u0682\u0685\u0757\u076e", "\u062d"),
  ...mapChars("\u0689\u068a\u068b\u068d\u06ee\u0759\u075a", "\u062f"),
  ...mapChars("\u0692\u0693\u0694\u0695\u0696\u06ef\u075b", "\u0631"),
  ...mapChars("\u069a\u069b", "\u0633"),
  ...mapChars("\u06fa", "\u0634"),
  ...mapChars("\u069d\u069e", "\u0635"),
  ...mapChars("\u06fb", "\u0636"),
  ...mapChars("\u06a0\u075d\u075e\u075f", "\u0639"),
  ...mapChars("\u06fc", "\u063a"),
  ...mapChars("\u06a1\u06a2\u06a3\u06a5\u06a6\u0760\u0761", "\u0641"),
  ...mapChars("\u066f\u06a7\u06a8", "\u0642"),
  ...mapChars("\u06b5\u06b6\u06b7\u06b8\u076a", "\u0644"),
  ...mapChars("\u0765\u0766", "\u0645"),
  ...mapChars("\u06b9\u06bb\u06bc\u06bd\u0767\u0768\u0769", "\u0646"),
  ...mapChars("\u06c3\u06ff", "\u0647"),
  ...mapChars("\u06c4\u06c5\u06c9\u06ca\u06cb\u06cf", "\u0648"),
  ...mapChars("\u0687\u06bf", "\u0686"),
  ...mapChars("\u063b\u0762\u0763", "\u06a9"),
  ...mapChars("\u06b0\u06b1\u06b2\u06b3\u06b4", "\u06af"),
  ...mapChars("\u063d\u063e\u063f\u06cd\u06ce\u06d0\u06d1", "\u06cc"),
};

// Added as aggressive-only because Hazm/Shekar disagree on these folds.
// Keeping these out of default mode reduces incorrect conflation risk.
const ARABIC_EXTENDED_AGGRESSIVE_TO_PERSIAN: Record<string, string> = {
  "\u0620": "\u06cc",
  "\u067d": "\u062a",
  "\u068c": "\u062f",
  "\u068e": "\u062f",
  "\u068f": "\u062f",
  "\u0690": "\u062f",
  "\u0697": "\u0631",
  "\u0699": "\u0631",
  "\u069c": "\u0633",
  "\u069f": "\u0637",
  "\u06fe": "\u0645",
  "\u0751": "\u0628",
  "\u0753": "\u0628",
  "\u0758": "\u062d",
  "\u075c": "\u0633",
  "\u076b": "\u0631",
  "\u076d": "\u0633",
  "\u076f": "\u062d",
};

const PUNCT_TO_ASCII: Record<string, string> = {
  // Keep punctuation normalization intentionally minimal for XML safety.
  // We only map Urdu full-stop to ASCII full-stop; broad punctuation
  // normalization can corrupt entity-like sequences in Excel XML text runs.
  "\u06d4": ".",
};

const SPACES_TO_ASCII_SPACE: Record<string, string> = {
  "\u00a0": " ",
  "\u2007": " ",
  "\u2008": " ",
  "\u2009": " ",
  "\u200a": " ",
  "\u202f": " ",
  "\u2000": " ",
  "\u2001": " ",
  "\u2002": " ",
  "\u2003": " ",
  "\u2004": " ",
  "\u2005": " ",
  "\u2006": " ",
  "\u205f": " ",
  "\u3000": " ",
};

const ASCII_TO_PERSIAN_DIGIT: Record<string, string> = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [String(i), String.fromCharCode(0x06f0 + i)]),
);

const PERSIAN_TO_ASCII_DIGIT: Record<string, string> = Object.fromEntries(
  Object.entries(ASCII_TO_PERSIAN_DIGIT).map(([ascii, persian]) => [persian, ascii]),
);

const ARABIC_INDIC_TO_ASCII_DIGIT: Record<string, string> = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [String.fromCharCode(0x0660 + i), String(i)]),
);

export const LETTER_TRANSLATION_BASE: Record<string, string> = {
  ...ARABIC_TO_PERSIAN_LETTERS,
  ...ARABIC_EXTENDED_BASE_TO_PERSIAN,
};

export const LETTER_TRANSLATION_AGGRESSIVE: Record<string, string> = {
  ...LETTER_TRANSLATION_BASE,
  ...ARABIC_EXTENDED_AGGRESSIVE_TO_PERSIAN,
};

export const DIGIT_TRANSLATION: Record<string, string> = {
  ...PERSIAN_TO_ASCII_DIGIT,
  ...ARABIC_INDIC_TO_ASCII_DIGIT,
};

export const PUNCT_TRANSLATION: Record<string, string> = { ...PUNCT_TO_ASCII };
export const SPACE_TRANSLATION: Record<string, string> = { ...SPACES_TO_ASCII_SPACE };

export const ZWNJ = "\u200c";

// Characters removed entirely to improve matching; mirrors persian_normalizer.py.
// This aggressively strips combining marks/format controls to stabilize search
// keys, while handling ZWNJ as an explicit policy below.
export const REMOVE_CODEPOINTS = new Set<string>([
  ...Array.from({ length: 0x061b - 0x0610 }, (_, i) => String.fromCharCode(0x0610 + i)),
  ...Array.from({ length: 0x0660 - 0x064b }, (_, i) => String.fromCharCode(0x064b + i)),
  ...Array.from({ length: 0x06ee - 0x06d6 }, (_, i) => String.fromCharCode(0x06d6 + i)),
  "\u0670",
  "\u0674",
  "\u0640",
  "\u0621",
  ...Array.from({ length: 0x0900 - 0x08d4 }, (_, i) => String.fromCharCode(0x08d4 + i)),
  "\u200b",
  "\u200e",
  "\u200f",
  "\u061c",
  ...Array.from({ length: 0x10 }, (_, i) => String.fromCharCode(0xfe00 + i)),
]);
