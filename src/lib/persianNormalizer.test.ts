import { describe, expect, it } from "vitest";
import { normalizeText } from "./persianNormalizer";

const SAMPLE_EXAMPLES: Record<string, string> = {
  بالالاريجان: "بالالاریجان",
  لاريجان: "لاریجان",
  "رضا حسن زاده اعظمي": "رضا حسن زاده اعظمی",
  دينان: "دینان",
  اميراباد: "امیراباد",
  ايرا: "ایرا",
  زيار: "زیار",
  كنارانجام: "کنارانجام",
  كندلو: "کندلو",
  نياك: "نیاک",
  "چالي كياده": "چالی کیاده",
  "بالاخيابان ليتكوه": "بالاخیابان لیتکوه",
  "اميرداود مرادي ديوكلائي": "امیرداود مرادی دیوکلایی",
  "محسن ابراهيم پور گله كلايي": "محسن ابراهیم پور گله کلایی",
  "دابوئ جنوبي": "دابوی جنوبی",
  "کلثوم علائی": "کلثوم علایی",
  مركزئ: "مرکزی",
  "آب زيست فرايند": "آب زیست فرایند",
  "آب و خاك دلتا": "آب و خاک دلتا",
  "آذرزمين سنج": "آذرزمین سنج",
  "آرمان قربان نژاد سرخكلائي": "آرمان قربان نژاد سرخکلایی",
  "اب اسك": "اب اسک",
  "اب چين": "اب چین",
  اببندانكش: "اببندانکش",
  ابكسر: "ابکسر",
  "ابكوله سربزرگ": "ابکوله سربزرگ",
  "ابكوله سركوچك": "ابکوله سرکوچک",
  ابندانك: "ابندانک",
  "ابوالحسن كلا": "ابوالحسن کلا",
  اتيني: "اتینی",
  اجاك: "اجاک",
  "احسان آزرده پاشاكلائي": "احسان آزرده پاشاکلایی",
  "احسان كاشاني راد": "احسان کاشانی راد",
  "احمد اباد كليج سفلي": "احمد اباد کلیج سفلی",
  "احمدابادكليج عليا": "احمدابادکلیج علیا",
  احمدكلا: "احمدکلا",
  "اخته چي": "اخته چی",
  اردشيرمحله: "اردشیرمحله",
  ارزك: "ارزک",
  اركا: "ارکا",
  ارمك: "ارمک",
  "ارمك محله": "ارمک محله",
  "ارميچ كلا": "ارمیچ کلا",
  ارواخيل: "ارواخیل",
  "ارويج كلا": "ارویج کلا",
  اري: "اری",
  اريم: "اریم",
  ارچي: "ارچی",
  "ازارسي بابل كنار": "ازارسی بابل کنار",
  "ازارسي حاتم": "ازارسی حاتم",
  ازاركل: "ازارکل",
  ازني: "ازنی",
  "اسب شورپي": "اسب شورپی",
  اسبوكلا: "اسبوکلا",
  "اسبوكلاكريم كلا": "اسبوکلاکریم کلا",
  استانكرود: "استانکرود",
  استرديكلا: "استردیکلا",
  "استل كنار": "استل کنار",
  اسفنديارمحله: "اسفندیارمحله",
  اسفيواشي: "اسفیواشی",
  اسفيوردشوراب: "اسفیوردشوراب",
  اسكارد: "اسکارد",
  اسكاردين: "اسکاردین",
  اسكندركلا: "اسکندرکلا",
  اسكنده: "اسکنده",
  "مراحل کنترل، بررسی، تصویب و ابلاغ طرح مصوب": "مراحل کنترل، بررسی، تصویب و ابلاغ طرح مصوب",
};

const SAMPLE_ARABIC_KAF = [
  "كنارانجام",
  "كندلو",
  "نياك",
  "اميرداود مرادي ديوكلائي",
  "محسن ابراهيم پور گله كلايي",
];

const SAMPLE_ARABIC_YEH = [
  "بالالاريجان",
  "لاريجان",
  "دينان",
  "اميراباد",
  "ايرا",
  "زيار",
  "چالي كياده",
  "بالاخيابان ليتكوه",
];

const SAMPLE_YEH_HAMZA = ["دابوئ جنوبي", "کلثوم علائی", "مركزئ"];

const SAMPLE_ARABIC_COMMA = ["مراحل کنترل، بررسی، تصویب و ابلاغ طرح مصوب"];

describe("normalizeText", () => {
  it("normalizes sample examples", () => {
    for (const [src, expected] of Object.entries(SAMPLE_EXAMPLES)) {
      expect(normalizeText(src)).toBe(expected);
    }
  });

  it("normalizes arabic kaf", () => {
    for (const src of SAMPLE_ARABIC_KAF) {
      const out = normalizeText(src);
      expect(out).not.toContain("ك");
      expect(out).toContain("ک");
    }
  });

  it("normalizes arabic yeh", () => {
    for (const src of SAMPLE_ARABIC_YEH) {
      const out = normalizeText(src);
      expect(out).not.toContain("ي");
      expect(out).not.toContain("ى");
      expect(out).toContain("ی");
    }
  });

  it("normalizes yeh hamza", () => {
    for (const src of SAMPLE_YEH_HAMZA) {
      const out = normalizeText(src);
      expect(out).not.toContain("ئ");
      expect(out).toContain("ی");
    }
  });

  it("preserves arabic comma", () => {
    for (const src of SAMPLE_ARABIC_COMMA) {
      const out = normalizeText(src);
      expect(out).toContain("،");
    }
  });

  it("maps common letters", () => {
    expect(normalizeText("كريم")).toBe("کریم");
    expect(normalizeText("علي")).toBe("علی");
    expect(normalizeText("دابوئ")).toBe("دابوی");
  });

  it("removes hamza", () => {
    expect(normalizeText("مسءول")).toBe("مسول");
  });

  it("maps extended letters", () => {
    expect(normalizeText("ٹڈڑںڤ")).toBe("تدرنف");
  });

  it("normalizes digits to ascii", () => {
    expect(normalizeText("۱۲۳٤٥٦٧٨٩٠")).toBe("1234567890");
  });

  it("handles zwnj and newlines", () => {
    const src = "می\u200cروم\n  خط  دوم";
    expect(normalizeText(src)).toBe("می روم\nخط دوم");
  });

  it("normalizes minimal punctuation", () => {
    expect(normalizeText("سلام، دنیا؟")).toBe("سلام، دنیا؟");
    expect(normalizeText("سلام۔")).toBe("سلام.");
  });

  it("preserves alef madda", () => {
    expect(normalizeText("آباد")).toBe("آباد");
  });

  it("keeps latin text while normalizing persian", () => {
    expect(normalizeText("Hello كريم ۱۲۳")).toBe("hello کریم 123");
    expect(normalizeText("FA-كاف test")).toBe("fa-کاف test");
  });
});
