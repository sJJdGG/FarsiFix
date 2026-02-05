import { expect, test } from "@playwright/test";
import JSZip from "jszip";
import { createTempWorkbook, readDownloadBuffer, resolveRepoPath } from "./helpers";

const samplePath = resolveRepoPath("sample.xlsx");
const fixturePath = resolveRepoPath("fixtures/farsifix-fixture.xlsx");

test("uploads and downloads normalized excel", async ({ page }) => {
  await page.goto("/");

  const downloadPromise = page.waitForEvent("download");
  await page.setInputFiles('[data-testid="file-input"]', samplePath);
  const download = await downloadPromise;

  await expect(download.suggestedFilename()).toBe("sample_FarsiFix.xlsx");
  const buffer = await readDownloadBuffer(download);
  const zip = await JSZip.loadAsync(buffer);
  const sharedStrings = await zip.file("xl/sharedStrings.xml")?.async("string");

  expect(sharedStrings).toBeDefined();
  // Confirm normalized token exists and original Arabic-yeh variant is gone.
  expect(sharedStrings).toContain("بالالاریجان");
  expect(sharedStrings).not.toContain("بالالاريجان");
});

test("preserves XML entities in sharedStrings and inline strings", async ({ page }) => {
  const { path: inputPath, cleanup } = await createTempWorkbook("سلام &amp; دنيا");

  await page.goto("/");
  const downloadPromise = page.waitForEvent("download");
  await page.setInputFiles('[data-testid="file-input"]', inputPath);
  const download = await downloadPromise;

  const buffer = await readDownloadBuffer(download);
  const zip = await JSZip.loadAsync(buffer);
  const sharedStrings = await zip.file("xl/sharedStrings.xml")?.async("string");
  const sheet = await zip.file("xl/worksheets/sheet1.xml")?.async("string");

  expect(sharedStrings).toBeDefined();
  expect(sheet).toBeDefined();
  expect(sharedStrings).toContain("سلام &amp; دنیا");
  expect(sharedStrings).toContain("&amp;");
  expect(sheet).toContain("سلام &amp; دنیا");
  expect(sheet).toContain("&amp;");
  // Inline strings should be normalized too (Arabic yeh -> Persian yeh).
  expect(sheet).not.toContain("سلام &amp; دنيا");

  await cleanup();
});

test("processes fixture workbook and preserves XML/format invariants", async ({ page }) => {
  await page.goto("/");

  const downloadPromise = page.waitForEvent("download");
  await page.setInputFiles('[data-testid="file-input"]', fixturePath);
  const download = await downloadPromise;

  await expect(download.suggestedFilename()).toBe("farsifix-fixture_FarsiFix.xlsx");

  const buffer = await readDownloadBuffer(download);
  const zip = await JSZip.loadAsync(buffer);
  const sharedStrings = await zip.file("xl/sharedStrings.xml")?.async("string");
  const sheet1 = await zip.file("xl/worksheets/sheet1.xml")?.async("string");
  const sheet2 = await zip.file("xl/worksheets/sheet2.xml")?.async("string");

  expect(sharedStrings).toBeDefined();
  expect(sheet1).toBeDefined();
  expect(sheet2).toBeDefined();

  if (!sharedStrings || !sheet1 || !sheet2) {
    return;
  }

  // Shared strings should be normalized (Arabic forms removed, digits ASCII).
  expect(sharedStrings).toContain("کریم یی کاف ک");
  expect(sharedStrings).toContain("1234567890 و 12345");
  expect(sharedStrings).toContain("می روم و سلام دنیا");
  expect(sharedStrings).toContain("api v2 - نسخه 2");
  expect(sharedStrings).toContain("فضای زیاد");
  expect(sharedStrings).not.toContain("ك");
  expect(sharedStrings).not.toContain("ي");
  expect(sharedStrings).not.toContain("ى");
  expect(sharedStrings).not.toContain("\u200c");
  expect(sharedStrings).not.toContain("۱۲۳۴");

  // XML entities must remain encoded in sharedStrings.
  expect(sharedStrings).toContain("&amp;");
  expect(sharedStrings).toContain("&lt;");
  expect(sharedStrings).toContain("&gt;");

  // Inline strings must be normalized too, with entities preserved.
  expect(sheet2).toContain("سلام &amp; دنیا با ک و ی");
  expect(sheet2).toContain("می رویم");
  expect(sheet2).toContain("r &amp; d &lt; q");
  expect(sheet2).not.toContain("سلام &amp; دنيا با ك و ي");
  expect(sheet2).not.toContain("\u200c");

  // Formulas and non-text XML should remain untouched.
  expect(sheet1).toContain("<f>SUM(E2:E4)</f>");
  expect(sheet1).toContain('CONCAT(B2, " - ", B3)');
});
