from persian_normalizer import normalize_fa

# Real examples curated from sample.xlsx (kept small and representative).
SAMPLE_EXAMPLES = {
    "بالالاريجان": "بالالاریجان",  # arabic_yeh
    "لاريجان": "لاریجان",  # arabic_yeh
    "رضا حسن زاده اعظمي": "رضا حسن زاده اعظمی",  # arabic_yeh
    "دينان": "دینان",  # arabic_yeh
    "اميراباد": "امیراباد",  # arabic_yeh
    "ايرا": "ایرا",  # arabic_yeh
    "زيار": "زیار",  # arabic_yeh
    "كنارانجام": "کنارانجام",  # arabic_kaf
    "كندلو": "کندلو",  # arabic_kaf
    "نياك": "نیاک",  # arabic_kaf, arabic_yeh
    "چالي كياده": "چالی کیاده",  # arabic_kaf, arabic_yeh
    "بالاخيابان ليتكوه": "بالاخیابان لیتکوه",  # arabic_kaf, arabic_yeh
    "اميرداود مرادي ديوكلائي": "امیرداود مرادی دیوکلایی",  # arabic_kaf, arabic_yeh, yeh_hamza
    "محسن ابراهيم پور گله كلايي": "محسن ابراهیم پور گله کلایی",  # arabic_kaf, arabic_yeh
    "دابوئ جنوبي": "دابوی جنوبی",  # arabic_yeh, yeh_hamza
    "کلثوم علائی": "کلثوم علایی",  # yeh_hamza
    "مركزئ": "مرکزی",  # arabic_kaf, yeh_hamza
    "آب زيست فرايند": "آب زیست فرایند",  # arabic_yeh, alef_madda (preserved by default)
    "آب و خاك دلتا": "آب و خاک دلتا",  # arabic_kaf, alef_madda (preserved by default)
    "آذرزمين سنج": "آذرزمین سنج",  # arabic_yeh, alef_madda (preserved by default)
    "آرمان قربان نژاد سرخكلائي": "آرمان قربان نژاد سرخکلایی",  # arabic_kaf, arabic_yeh, yeh_hamza, alef_madda (preserved by default)
    "اب اسك": "اب اسک",  # arabic_kaf
    "اب چين": "اب چین",  # arabic_yeh
    "اببندانكش": "اببندانکش",  # arabic_kaf
    "ابكسر": "ابکسر",  # arabic_kaf
    "ابكوله سربزرگ": "ابکوله سربزرگ",  # arabic_kaf
    "ابكوله سركوچك": "ابکوله سرکوچک",  # arabic_kaf
    "ابندانك": "ابندانک",  # arabic_kaf
    "ابوالحسن كلا": "ابوالحسن کلا",  # arabic_kaf
    "اتيني": "اتینی",  # arabic_yeh
    "اجاك": "اجاک",  # arabic_kaf
    "احسان آزرده پاشاكلائي": "احسان آزرده پاشاکلایی",  # arabic_kaf, arabic_yeh, yeh_hamza, alef_madda (preserved by default)
    "احسان كاشاني راد": "احسان کاشانی راد",  # arabic_kaf, arabic_yeh
    "احمد اباد كليج سفلي": "احمد اباد کلیج سفلی",  # arabic_kaf, arabic_yeh
    "احمدابادكليج عليا": "احمدابادکلیج علیا",  # arabic_kaf, arabic_yeh
    "احمدكلا": "احمدکلا",  # arabic_kaf
    "اخته چي": "اخته چی",  # arabic_yeh
    "اردشيرمحله": "اردشیرمحله",  # arabic_yeh
    "ارزك": "ارزک",  # arabic_kaf
    "اركا": "ارکا",  # arabic_kaf
    "ارمك": "ارمک",  # arabic_kaf
    "ارمك محله": "ارمک محله",  # arabic_kaf
    "ارميچ كلا": "ارمیچ کلا",  # arabic_kaf, arabic_yeh
    "ارواخيل": "ارواخیل",  # arabic_yeh
    "ارويج كلا": "ارویج کلا",  # arabic_kaf, arabic_yeh
    "اري": "اری",  # arabic_yeh
    "اريم": "اریم",  # arabic_yeh
    "ارچي": "ارچی",  # arabic_yeh
    "ازارسي بابل كنار": "ازارسی بابل کنار",  # arabic_kaf, arabic_yeh
    "ازارسي حاتم": "ازارسی حاتم",  # arabic_yeh
    "ازاركل": "ازارکل",  # arabic_kaf
    "ازني": "ازنی",  # arabic_yeh
    "اسب شورپي": "اسب شورپی",  # arabic_yeh
    "اسبوكلا": "اسبوکلا",  # arabic_kaf
    "اسبوكلاكريم كلا": "اسبوکلاکریم کلا",  # arabic_kaf, arabic_yeh
    "استانكرود": "استانکرود",  # arabic_kaf
    "استرديكلا": "استردیکلا",  # arabic_kaf, arabic_yeh
    "استل كنار": "استل کنار",  # arabic_kaf
    "اسفنديارمحله": "اسفندیارمحله",  # arabic_yeh
    "اسفيواشي": "اسفیواشی",  # arabic_yeh
    "اسفيوردشوراب": "اسفیوردشوراب",  # arabic_yeh
    "اسكارد": "اسکارد",  # arabic_kaf
    "اسكاردين": "اسکاردین",  # arabic_kaf, arabic_yeh
    "اسكندركلا": "اسکندرکلا",  # arabic_kaf
    "اسكنده": "اسکنده",  # arabic_kaf
    "مراحل کنترل، بررسی، تصویب و ابلاغ طرح مصوب": "مراحل کنترل، بررسی، تصویب و ابلاغ طرح مصوب",  # arabic_comma
}

SAMPLE_ARABIC_KAF = [
    "كنارانجام",  # Arabic ك only
    "كندلو",  # Arabic ك only
    "نياك",  # Arabic ك plus Arabic ي
    "اميرداود مرادي ديوكلائي",  # Arabic ك + Arabic ي + ئ
    "محسن ابراهيم پور گله كلايي",  # Arabic ك + Arabic ي
]

SAMPLE_ARABIC_YEH = [
    "بالالاريجان",  # Arabic ي
    "لاريجان",  # Arabic ي
    "دينان",  # Arabic ي
    "اميراباد",  # Arabic ي
    "ايرا",  # Arabic ي
    "زيار",  # Arabic ي
    "چالي كياده",  # Arabic ي + Arabic ك
    "بالاخيابان ليتكوه",  # Arabic ي + Arabic ك
]

SAMPLE_YEH_HAMZA = [
    "دابوئ جنوبي",  # ئ in middle
    "کلثوم علائی",  # ئ before final ی
    "مركزئ",  # ئ at end
]

SAMPLE_ARABIC_COMMA = [
    "مراحل کنترل، بررسی، تصویب و ابلاغ طرح مصوب",  # Arabic comma should stay
]


def test_sample_examples_exact():
    for src, expected in SAMPLE_EXAMPLES.items():
        assert normalize_fa(src) == expected


def test_sample_category_arabic_kaf():
    for src in SAMPLE_ARABIC_KAF:
        out = normalize_fa(src)
        assert "ك" not in out
        assert "ک" in out


def test_sample_category_arabic_yeh():
    for src in SAMPLE_ARABIC_YEH:
        out = normalize_fa(src)
        assert "ي" not in out
        assert "ى" not in out
        assert "ی" in out


def test_sample_category_yeh_hamza():
    for src in SAMPLE_YEH_HAMZA:
        out = normalize_fa(src)
        assert "ئ" not in out
        assert "ی" in out


def test_sample_category_arabic_comma_preserved():
    for src in SAMPLE_ARABIC_COMMA:
        out = normalize_fa(src)
        assert "،" in out


def test_basic_letter_mapping():
    assert normalize_fa("كريم") == "کریم"
    assert normalize_fa("علي") == "علی"
    assert normalize_fa("دابوئ") == "دابوی"


def test_hamza_removed():
    assert normalize_fa("مسءول") == "مسول"


def test_extended_letter_mapping():
    assert normalize_fa("ٹڈڑںڤ") == "تدرنف"


def test_digits_to_ascii():
    # Mix of Persian and Arabic-Indic digits
    assert normalize_fa("۱۲۳٤٥٦٧٨٩٠") == "1234567890"


def test_zwnj_and_newlines_preserved():
    s = "می\u200cروم\n  خط  دوم"
    assert normalize_fa(s) == "می روم\nخط دوم"


def test_punctuation_minimal():
    assert normalize_fa("سلام، دنیا؟") == "سلام، دنیا؟"
    assert normalize_fa("سلام۔") == "سلام."


def test_alef_madda_preserved():
    assert normalize_fa("آباد") == "آباد"
