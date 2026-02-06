import {
  DIGIT_TRANSLATION,
  LETTER_TRANSLATION_AGGRESSIVE,
  LETTER_TRANSLATION_BASE,
  PUNCT_TRANSLATION,
  REMOVE_CODEPOINTS,
  SPACE_TRANSLATION,
  ZWNJ,
} from "./persianNormalizer.tables";

const FORMAT_CHAR_REGEX = /\p{Cf}/u;

export type ZwnjMode = "space" | "preserve";
export type ArabicExtendedMode = "default" | "aggressive";

export interface NormalizeTextOptions {
  zwnjMode?: ZwnjMode;
  arabicExtendedMode?: ArabicExtendedMode;
}

const DEFAULT_OPTIONS: Required<NormalizeTextOptions> = {
  zwnjMode: "space",
  arabicExtendedMode: "default",
};

// Fast single-pass translation (avoids rebuilding regexes).
const translate = (input: string, map: Record<string, string>) => {
  let out = "";
  for (const ch of input) {
    out += map[ch] ?? ch;
  }
  return out;
};

// Collapse horizontal whitespace per line while preserving newline types.
const collapseWhitespacePreserveNewlines = (input: string) => {
  const chunks = input.match(/.*?(?:\r\n|\r|\n|$)/g) ?? [];
  const out: string[] = [];

  for (const chunk of chunks) {
    if (!chunk) {
      continue;
    }
    let line = chunk;
    let ending = "";

    if (chunk.endsWith("\r\n")) {
      line = chunk.slice(0, -2);
      ending = "\r\n";
    } else if (chunk.endsWith("\n")) {
      line = chunk.slice(0, -1);
      ending = "\n";
    } else if (chunk.endsWith("\r")) {
      line = chunk.slice(0, -1);
      ending = "\r";
    }

    // Normalize horizontal whitespace only; preserve line break structure.
    line = line.replace(/[ \t\f\v]+/g, " ").trim();
    out.push(line + ending);
  }

  return out.join("");
};

const getLetterTranslation = (mode: ArabicExtendedMode) =>
  mode === "aggressive" ? LETTER_TRANSLATION_AGGRESSIVE : LETTER_TRANSLATION_BASE;

const normalizeUnicodeCompatibility = (input: string) => input.normalize("NFKC").normalize("NFC");

const canonicalizeLetterVariants = (input: string, mode: ArabicExtendedMode) =>
  translate(input, getLetterTranslation(mode));

const stripNonSearchMarks = (input: string) => {
  const stripped: string[] = [];

  for (const ch of input) {
    if (ch === ZWNJ) {
      stripped.push(ch);
      continue;
    }
    if (REMOVE_CODEPOINTS.has(ch)) {
      continue;
    }
    if (FORMAT_CHAR_REGEX.test(ch)) {
      continue;
    }
    stripped.push(ch);
  }

  return stripped.join("");
};

const applyZwnjPolicy = (input: string, zwnjMode: ZwnjMode) =>
  zwnjMode === "space" ? input.replaceAll(ZWNJ, " ") : input;

const normalizeSearchCompatibleSymbols = (input: string) => {
  // Keep this phase intentionally conservative for Excel/XML invariants.
  let s = translate(input, SPACE_TRANSLATION);
  s = translate(s, DIGIT_TRANSLATION);
  s = translate(s, PUNCT_TRANSLATION);
  return s;
};

export const normalizeText = (input: string, options: NormalizeTextOptions = {}) => {
  const settings = { ...DEFAULT_OPTIONS, ...options };

  // Order matters: NFKC first to unfold presentation forms, then NFC to keep
  // canonical composed output stable after replacements.
  let s = normalizeUnicodeCompatibility(input);

  // Canonicalize Arabic/Persian letter variants before stripping marks so we
  // do not lose foldable base letters hidden behind compatibility forms.
  s = canonicalizeLetterVariants(s, settings.arabicExtendedMode);

  // Remove diacritics/formatting but preserve ZWNJ for policy handling.
  s = stripNonSearchMarks(s);

  // Default search mode maps ZWNJ to visible space for match friendliness;
  // preserve mode keeps original token boundary semantics.
  s = applyZwnjPolicy(s, settings.zwnjMode);

  s = normalizeSearchCompatibleSymbols(s);
  return collapseWhitespacePreserveNewlines(s);
};
