import { describe, expect, it } from "vitest";
import { normalizeText } from "./persianNormalizer";

const mapChars = (chars: string, target: string): Array<[string, string]> =>
  Array.from(chars, (ch) => [ch, target]);

const BASELINE_CONSENSUS_MAP: Array<[string, string]> = [
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
];

const AGGRESSIVE_ONLY_MAP: Array<[string, string]> = [
  ["\u0620", "\u06cc"],
  ["\u067d", "\u062a"],
  ["\u068c", "\u062f"],
  ["\u068e", "\u062f"],
  ["\u068f", "\u062f"],
  ["\u0690", "\u062f"],
  ["\u0697", "\u0631"],
  ["\u0699", "\u0631"],
  ["\u069c", "\u0633"],
  ["\u069f", "\u0637"],
  ["\u06fe", "\u0645"],
  ["\u0751", "\u0628"],
  ["\u0753", "\u0628"],
  ["\u0758", "\u062d"],
  ["\u075c", "\u0633"],
  ["\u076b", "\u0631"],
  ["\u076d", "\u0633"],
  ["\u076f", "\u062d"],
];

describe("normalizeText", () => {
  it("normalizes common Arabic/Persian letter variants", () => {
    expect(normalizeText("كريم")).toBe("کریم");
    expect(normalizeText("علي")).toBe("علی");
    expect(normalizeText("دابوئ")).toBe("دابوی");
  });

  it("preserves latin casing (no case folding)", () => {
    expect(normalizeText("Hello كريم ۱۲۳")).toBe("Hello کریم 123");
    expect(normalizeText("FA-كاف test")).toBe("FA-کاف test");
  });

  it("normalizes digits to ascii", () => {
    expect(normalizeText("۱۲۳٤٥٦٧٨٩٠")).toBe("1234567890");
  });

  it("uses space as default ZWNJ mode", () => {
    const src = "می\u200cروم\n  خط  دوم";
    expect(normalizeText(src)).toBe("می روم\nخط دوم");
  });

  it("supports preserve ZWNJ mode", () => {
    const src = "می\u200cروم\n  خط  دوم";
    expect(normalizeText(src, { zwnjMode: "preserve" })).toBe("می\u200cروم\nخط دوم");
  });

  it("keeps punctuation normalization conservative", () => {
    expect(normalizeText("سلام، دنیا؟")).toBe("سلام، دنیا؟");
    expect(normalizeText("سلام۔")).toBe("سلام.");
    expect(normalizeText("«نقل\u200cقول»")).toBe("«نقل قول»");
  });

  it("preserves XML entities literally", () => {
    const input = "A&amp;B &lt;tag&gt; &#10;";
    expect(normalizeText(input)).toBe("A&amp;B &lt;tag&gt; &#10;");
  });

  it("maps baseline consensus Arabic-extended chars", () => {
    const src = "ٮٺځډڒښۺڝۻڠۼڡٯڵݥڹۃۄڇػڰؽ";
    expect(normalizeText(src)).toBe("بتحدرسشصضعغفقلمنهوچکگی");
  });

  it("maps all baseline consensus Arabic-extended chars", () => {
    for (const [src, expected] of BASELINE_CONSENSUS_MAP) {
      expect(normalizeText(src)).toBe(expected);
    }
  });

  it("keeps Hazm/Shekar disagreement chars unchanged by default", () => {
    const src = "ؠٽڌڎڏڐڗڙڜڟ۾ݑݓݘݜݫݭݯ";
    expect(normalizeText(src)).toBe(src);
  });

  it("maps Hazm/Shekar disagreement chars in aggressive mode", () => {
    const src = "ؠٽڌڎڏڐڗڙڜڟ۾ݑݓݘݜݫݭݯ";
    expect(normalizeText(src, { arabicExtendedMode: "aggressive" })).toBe("یتددددررسطمببحسرسح");
  });

  it("maps all aggressive-only Arabic-extended chars", () => {
    for (const [src, expected] of AGGRESSIVE_ONLY_MAP) {
      expect(normalizeText(src)).toBe(src);
      expect(normalizeText(src, { arabicExtendedMode: "aggressive" })).toBe(expected);
    }
  });

  it("retains current legacy extended mapping", () => {
    expect(normalizeText("ٹڈڑںڤ")).toBe("تدرنف");
  });

  it("is idempotent in default mode", () => {
    const src = "Hello كريم ۱۲۳ می\u200cروم";
    const once = normalizeText(src);
    const twice = normalizeText(once);
    expect(twice).toBe(once);
  });

  it("is idempotent in aggressive preserve mode", () => {
    const src = "ؠٽڌڎڏڐڗڙڜڟ۾ݑݓݘݜݫݭݯ می روم";
    const opts = {
      arabicExtendedMode: "aggressive",
      zwnjMode: "preserve",
    } as const;
    const once = normalizeText(src, opts);
    const twice = normalizeText(once, opts);
    expect(twice).toBe(once);
  });
});
