import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Download, Page } from "@playwright/test";
import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

export const resolveRepoPath = (...segments: string[]) => path.resolve(repoRoot, ...segments);

export const readDownloadBuffer = async (download: Download) => {
  const downloadPath = await download.path();
  const tempPath =
    downloadPath ??
    path.join(os.tmpdir(), `farsifix-${Date.now()}-${Math.random().toString(16).slice(2)}.xlsx`);

  if (!downloadPath) {
    await download.saveAs(tempPath);
  }

  const buffer = await fs.readFile(tempPath);

  if (!downloadPath) {
    await fs.unlink(tempPath);
  }

  return buffer;
};

export const uploadAndWaitForDownload = async (page: Page, inputPath: string) => {
  const firstAttempt = page
    .waitForEvent("download", { timeout: 45_000 })
    .catch(() => null as Download | null);

  await page.setInputFiles('[data-testid="file-input"]', inputPath);
  const firstDownload = await firstAttempt;
  if (firstDownload) {
    return firstDownload;
  }

  const downloadAgainButton = page.getByRole("button", { name: "دانلود دوباره خروجی" });
  await downloadAgainButton.waitFor({ state: "visible", timeout: 30_000 });

  const retryAttempt = page.waitForEvent("download", { timeout: 45_000 });
  await downloadAgainButton.click();
  return await retryAttempt;
};

export const createTempWorkbook = async (text: string) => {
  const zip = new JSZip();
  zip.file(
    "xl/sharedStrings.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="1" uniqueCount="1"><si><t>${text}</t></si></sst>`,
  );
  zip.file(
    "xl/worksheets/sheet1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n  <sheetData>\n    <row r="1">\n      <c r="A1" t="inlineStr"><is><t>${text}</t></is></c>\n    </row>\n  </sheetData>\n</worksheet>`,
  );
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="xml" ContentType="application/xml"/>\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\n  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>\n</Types>`,
  );

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  const tempPath = path.join(
    os.tmpdir(),
    `farsifix-entity-${Date.now()}-${Math.random().toString(16).slice(2)}.xlsx`,
  );
  await fs.writeFile(tempPath, buffer);
  return {
    path: tempPath,
    cleanup: async () => {
      await fs.unlink(tempPath);
    },
  };
};
