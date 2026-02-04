# XML Invariants

These rules protect Excel file integrity. Any change to the XML pipeline must preserve them.

## Must Preserve
- **Never decode XML entities.** Keep `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&apos;` encoded in the output.
- **String-only surgery.** Do not parse or re-serialize XML with DOM tools.
- **Target `<t>` only.** Normalize only text inside `<t>` tags; leave other tags/attributes untouched.
- **Preserve attributes.** Keep attributes like `xml:space="preserve"` intact.
- **Stable whitespace rules.** ZWNJ becomes space; collapse horizontal whitespace per line; preserve newline types.

## Guardrails
- Reject files larger than `VITE_MAX_FILE_SIZE_MB` at the UI layer.
- Abort if `xl/sharedStrings.xml` exceeds 200MB (unzipped).
- Abort if any `xl/worksheets/sheet*.xml` exceeds 50MB (unzipped).

## Testing Expectations
- Unit tests must cover entity preservation and normalization rules.
- E2E tests must verify:
  - Normalization occurs in downloaded files.
  - Entities remain encoded in `sharedStrings.xml` and inline strings.
