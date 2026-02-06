import { describe, expect, it } from "vitest";
import { normalizeXmlText } from "./xmlTextNormalizer";

describe("normalizeXmlText", () => {
  it("normalizes only <t> contents and preserves entities", () => {
    const xml = "<sst><si><t>سلام &amp; دنيا</t></si><si><t>TeST</t></si><v>123</v></sst>";
    const out = normalizeXmlText(xml);
    expect(out).toContain("<t>سلام &amp; دنیا</t>");
    expect(out).toContain("<t>TeST</t>");
    expect(out).toContain("<v>123</v>");
  });

  it("respects <t> attributes without decoding", () => {
    const xml = '<si><t xml:space="preserve">می\u200cروم &amp; تست</t></si>';
    const out = normalizeXmlText(xml);
    expect(out).toContain('<t xml:space="preserve">می روم &amp; تست</t>');
  });

  it("keeps numeric entities unchanged", () => {
    const xml = "<sst><si><t>A&#10;B &amp; C</t></si></sst>";
    const out = normalizeXmlText(xml);
    expect(out).toContain("<t>A&#10;B &amp; C</t>");
  });
});
