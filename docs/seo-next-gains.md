# SEO Deep-Dive Findings: Next Gains for FarsiFix

Date: 2026-02-08  
Scope: Post-implementation opportunities after baseline technical SEO hardening (metadata, social tags, structured data, robots/sitemap, semantic landmarks).

## Current Baseline (Already Implemented)

- Canonical URL, robots directives, Open Graph, Twitter card metadata.
- `SoftwareApplication` JSON-LD.
- Crawl assets: `robots.txt` and `sitemap.xml`.
- Semantic landmark improvements in the UI.
- Playwright SEO regression test coverage.

## Highest-Impact Opportunities (Prioritized)

## P0: Build Search-Intent Landing Content

### Why this matters

Technical SEO is now mostly in place. The largest upside is ranking for Persian problem/solution queries by publishing indexable content tied to real user intent.

### Target query clusters

- "رفع مشکل ی و ک در اکسل"
- "نرمال سازی فارسی در اکسل"
- "جستجو در اکسل فارسی کار نمی‌کند"
- "یکسان سازی متن فارسی برای فیلتر اکسل"
- "تبدیل اعداد فارسی به انگلیسی در اکسل"

### What to build

- Create dedicated, crawlable pages (or sections) for each cluster with:
  - Problem statement
  - Before/after examples
  - How FarsiFix solves it
  - FAQ and edge-case notes
- Include screenshots and sample workbook snippets.
- Add internal links from homepage to these pages.

### KPI

- Non-brand organic clicks and impressions for Persian long-tail queries.

## P0: Add FAQ Content + FAQ Structured Data

### Why this matters

FAQ-rich support content captures long-tail searches and improves SERP coverage.

### What to build

- Add a homepage FAQ block with real support questions.
- Add `FAQPage` JSON-LD aligned exactly with visible FAQ text.
- Keep answers concise and action-oriented.

### Candidate questions

- چرا در اکسل کلمات فارسی مشابه پیدا نمی‌شوند؟
- آیا فرمول‌ها یا قالب‌بندی فایل خراب می‌شود؟
- آیا فایل من آپلود می‌شود یا روی مرورگر پردازش می‌شود؟
- چه تفاوتی بین ی/ک عربی و فارسی وجود دارد؟

### KPI

- Impressions and CTR on informational Persian queries.

## P1: Upgrade Social Preview Assets

### Why this matters

Some crawlers handle PNG/JPG previews more consistently than SVG.

### What to build

- Keep existing SVG OG image.
- Add a PNG version (`1200x630`) and point OG/Twitter image tags to PNG.
- Verify cards with social debuggers before release.

### KPI

- Higher CTR from shared links on social/messaging platforms.

## P1: Add Lightweight Programmatic Content Around Use Cases

### Why this matters

Use-case pages can rank for specific workflows and industries.

### What to build

- Pages like:
  - "FarsiFix for accounting sheets"
  - "FarsiFix for CRM exports"
  - "FarsiFix for inventory reports"
- Reuse the same core template + domain-specific examples.

### KPI

- Growth in long-tail landing pages with >1 click/week.

## P1: Strengthen Internal Linking Architecture

### Why this matters

New pages need link equity and crawl paths.

### What to build

- Add contextual links from homepage hero/features/FAQ to relevant landing pages.
- Add reciprocal "Related Guides" links among docs/pages.
- Ensure every page is reachable within 2 clicks from homepage.

### KPI

- Better indexing consistency and reduced orphan-page risk.

## P2: Internationalization Strategy

### Why this matters

If English acquisition is desired, language targeting needs explicit structure.

### What to build

- Publish English variants for key pages.
- Use separate routes and reciprocal `hreflang` tags.
- Keep Persian (`fa-IR`) as primary.

### KPI

- English query impressions and targeted traffic mix.

## Measurement Plan

## Search Console Setup

- Track page-level performance by query cluster.
- Monitor:
  - Index coverage
  - Queries with rising impressions but low CTR
  - Pages with declining average position

## Analytics Events (recommended)

- `file_upload_started`
- `file_processed_success`
- `download_clicked`
- `error_shown`

This helps correlate SEO landing traffic with actual product activation.

## 30-Day Execution Plan

1. Publish 3 high-intent Persian landing pages.
2. Add FAQ section + `FAQPage` JSON-LD.
3. Ship PNG OG image and update metadata.
4. Add internal links from homepage and between pages.

## 60-Day Execution Plan

1. Expand to 6-10 intent pages (problem/use-case mix).
2. Improve low-CTR pages with tighter titles/descriptions.
3. Evaluate English page rollout if Persian growth stabilizes.

## Implementation Notes

- If domain changes from `farsifix.site` to another custom domain, update:
  - Canonical URLs
  - `sitemap.xml`
  - `robots.txt` sitemap reference
  - JSON-LD `url`
- Keep structured data synchronized with visible page content to avoid rich result invalidation.
