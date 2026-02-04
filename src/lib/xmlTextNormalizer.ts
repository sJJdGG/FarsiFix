import { normalizeText } from './persianNormalizer'

// Regex-only XML surgery: do not DOM-parse to avoid formatting loss.
const TEXT_TAG_REGEX = /(<t(?:\s+[^>]*)?>)(.*?)(<\/t>)/g

// Normalize text inside <t> tags without decoding entities.
export const normalizeXmlText = (
  xml: string,
  normalizer: (text: string) => string = normalizeText
) =>
  xml.replace(TEXT_TAG_REGEX, (_match, openTag: string, text: string, closeTag: string) => {
    const normalized = normalizer(text)
    return `${openTag}${normalized}${closeTag}`
  })
