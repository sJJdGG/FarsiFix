# FarsiFix

Fix Persian (Farsi) Excel files by normalizing characters for better search and filtering.

## Usage

```python
from persian_normalizer import normalize_fa

normalize_fa("كريم")
normalize_fa("سلام۔")
```

## Notes

- Arabic/Persian letter variants are normalized to common Persian keyboard forms.
- Digits are always normalized to ASCII.
- Urdu full stop `۔` is normalized to ASCII `.`.
- Newlines are preserved; only horizontal whitespace inside each line is collapsed.
- Alef madda `آ` is preserved.

## Top 10 Examples (from `sample.xlsx`)

| Input                                        | Output                                       |
| -------------------------------------------- | -------------------------------------------- |
| `بالالاريجان`                                | `بالالاریجان`                                |
| `كنارانجام`                                  | `کنارانجام`                                  |
| `دابوئ جنوبي`                                | `دابوی جنوبی`                                |
| `آرمان قربان نژاد سرخكلائي`                  | `آرمان قربان نژاد سرخکلایی`                  |
| `آب و خاك دلتا`                              | `آب و خاک دلتا`                              |
| `احسان كاشاني راد`                           | `احسان کاشانی راد`                           |
| `احمدابادكليج عليا`                          | `احمدابادکلیج علیا`                          |
| `اسكاردين`                                   | `اسکاردین`                                   |
| `رضا حسن زاده اعظمي`                         | `رضا حسن زاده اعظمی`                         |
| `مراحل کنترل، بررسی، تصویب و ابلاغ طرح مصوب` | `مراحل کنترل، بررسی، تصویب و ابلاغ طرح مصوب` |
