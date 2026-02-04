const ARABIC_TO_PERSIAN_LETTERS: Record<string, string> = {
  '\u064a': '\u06cc',
  '\u0649': '\u06cc',
  '\u0643': '\u06a9',
  '\u06aa': '\u06a9',
  '\u06ab': '\u06a9',
  '\u06ac': '\u06a9',
  '\u06ad': '\u06a9',
  '\u06ae': '\u06a9',
  '\u06c1': '\u0647',
  '\u0629': '\u0647',
  '\u06c0': '\u0647',
  '\u06c2': '\u0647',
  '\u06be': '\u0647',
  '\u06d5': '\u0647',
  '\u0623': '\u0627',
  '\u0625': '\u0627',
  '\u0624': '\u0648',
  '\u0626': '\u06cc',
  '\u0671': '\u0627',
  '\u0672': '\u0627',
  '\u0673': '\u0627',
  '\u0675': '\u0627',
  '\u06d2': '\u06cc',
  '\u06d3': '\u06cc',
}

const ARABIC_EXTENDED_TO_PERSIAN: Record<string, string> = {
  '\u0679': '\u062a',
  '\u0688': '\u062f',
  '\u0691': '\u0631',
  '\u06ba': '\u0646',
  '\u06a4': '\u0641',
}

const PUNCT_TO_ASCII: Record<string, string> = {
  '\u06d4': '.',
}

const QUOTES_TO_ASCII: Record<string, string> = {
  '\u00ab': '"',
  '\u00bb': '"',
  '\u201c': '"',
  '\u201d': '"',
  '\u201e': '"',
  '\u201f': '"',
  '\u201a': "'",
  '\u2018': "'",
  '\u2019': "'",
  '\u2039': "'",
  '\u203a': "'",
}

const DASHES_TO_HYPHEN: Record<string, string> = {
  '\u2010': '-',
  '\u2011': '-',
  '\u2012': '-',
  '\u2013': '-',
  '\u2014': '-',
  '\u2015': '-',
  '\u2212': '-',
  '\u2043': '-',
}

const SPACES_TO_ASCII_SPACE: Record<string, string> = {
  '\u00a0': ' ',
  '\u2007': ' ',
  '\u2008': ' ',
  '\u2009': ' ',
  '\u200a': ' ',
  '\u202f': ' ',
  '\u2000': ' ',
  '\u2001': ' ',
  '\u2002': ' ',
  '\u2003': ' ',
  '\u2004': ' ',
  '\u2005': ' ',
  '\u2006': ' ',
  '\u205f': ' ',
  '\u3000': ' ',
}

const ASCII_TO_PERSIAN_DIGIT: Record<string, string> = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [String(i), String.fromCharCode(0x06f0 + i)])
)

const PERSIAN_TO_ASCII_DIGIT: Record<string, string> = Object.fromEntries(
  Object.entries(ASCII_TO_PERSIAN_DIGIT).map(([ascii, persian]) => [persian, ascii])
)

const ARABIC_INDIC_TO_ASCII_DIGIT: Record<string, string> = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [String.fromCharCode(0x0660 + i), String(i)])
)

const LETTER_TRANSLATION: Record<string, string> = {
  ...ARABIC_TO_PERSIAN_LETTERS,
  ...ARABIC_EXTENDED_TO_PERSIAN,
}

const DIGIT_TRANSLATION: Record<string, string> = {
  ...PERSIAN_TO_ASCII_DIGIT,
  ...ARABIC_INDIC_TO_ASCII_DIGIT,
}

const PUNCT_TRANSLATION: Record<string, string> = { ...PUNCT_TO_ASCII }
const SPACE_TRANSLATION: Record<string, string> = { ...SPACES_TO_ASCII_SPACE }
const DASH_TRANSLATION: Record<string, string> = { ...DASHES_TO_HYPHEN }
const QUOTE_TRANSLATION: Record<string, string> = { ...QUOTES_TO_ASCII }

const ZWNJ = '\u200c'
const FORMAT_CHAR_REGEX = /\p{Cf}/u

// Characters removed entirely to improve matching; mirrors persian_normalizer.py.
const REMOVE_CODEPOINTS = new Set<string>([
  ...Array.from({ length: 0x061b - 0x0610 }, (_, i) => String.fromCharCode(0x0610 + i)),
  ...Array.from({ length: 0x0660 - 0x064b }, (_, i) => String.fromCharCode(0x064b + i)),
  ...Array.from({ length: 0x06ee - 0x06d6 }, (_, i) => String.fromCharCode(0x06d6 + i)),
  '\u0670',
  '\u0674',
  '\u0640',
  '\u0621',
  ...Array.from({ length: 0x0900 - 0x08d4 }, (_, i) => String.fromCharCode(0x08d4 + i)),
  '\u200b',
  '\u200e',
  '\u200f',
  '\u061c',
  ...Array.from({ length: 0x10 }, (_, i) => String.fromCharCode(0xfe00 + i)),
])

// Fast single-pass translation (avoids rebuilding regexes).
const translate = (input: string, map: Record<string, string>) => {
  let out = ''
  for (const ch of input) {
    out += map[ch] ?? ch
  }
  return out
}

// Collapse horizontal whitespace per line while preserving newline types.
const collapseWhitespacePreserveNewlines = (input: string) => {
  const chunks = input.match(/.*?(?:\r\n|\r|\n|$)/g) ?? []
  const out: string[] = []

  for (const chunk of chunks) {
    if (!chunk) {
      continue
    }
    let line = chunk
    let ending = ''

    if (chunk.endsWith('\r\n')) {
      line = chunk.slice(0, -2)
      ending = '\r\n'
    } else if (chunk.endsWith('\n')) {
      line = chunk.slice(0, -1)
      ending = '\n'
    } else if (chunk.endsWith('\r')) {
      line = chunk.slice(0, -1)
      ending = '\r'
    }

    line = line.replace(/[ \t\f\v]+/g, ' ').trim()
    out.push(line + ending)
  }

  return out.join('')
}

export const normalizeText = (input: string) => {
  // Order matters: compatibility decomposition, casefold, recompose.
  let s = input.normalize('NFKC')
  s = s.toLocaleLowerCase('en-US')
  s = s.normalize('NFC')

  // Canonicalize Arabic/Persian letter variants before stripping marks.
  s = translate(s, LETTER_TRANSLATION)

  // Remove diacritics/formatting but preserve ZWNJ for the next step.
  const stripped: string[] = []
  for (const ch of s) {
    if (ch === ZWNJ) {
      stripped.push(ch)
      continue
    }
    if (REMOVE_CODEPOINTS.has(ch)) {
      continue
    }
    if (FORMAT_CHAR_REGEX.test(ch)) {
      continue
    }
    stripped.push(ch)
  }
  s = stripped.join('')

  // Map ZWNJ to ASCII space for search friendliness.
  s = s.replaceAll(ZWNJ, ' ')

  // Normalize exotic spaces/dashes/quotes before collapsing whitespace.
  s = translate(s, SPACE_TRANSLATION)
  s = translate(s, DASH_TRANSLATION)
  s = translate(s, QUOTE_TRANSLATION)
  s = translate(s, DIGIT_TRANSLATION)
  s = translate(s, PUNCT_TRANSLATION)

  return collapseWhitespacePreserveNewlines(s)
}
