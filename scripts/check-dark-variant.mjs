import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const assetsDir = path.join(distDir, "assets");

if (!fs.existsSync(assetsDir)) {
  console.error("dist/assets not found. Run `npm run build` before this check.");
  process.exit(1);
}

const cssFiles = fs
  .readdirSync(assetsDir)
  .filter((file) => file.endsWith(".css"))
  .map((file) => path.join(assetsDir, file));

if (cssFiles.length === 0) {
  console.error("No CSS files found in dist/assets. Run `npm run build` first.");
  process.exit(1);
}

const forbidden = /prefers-color-scheme\s*:\s*dark/i;
let failed = false;

for (const file of cssFiles) {
  const contents = fs.readFileSync(file, "utf8");
  if (forbidden.test(contents)) {
    console.error(`Found prefers-color-scheme: dark in ${path.relative(process.cwd(), file)}`);
    failed = true;
  }
}

if (failed) {
  console.error("Dark mode should be class-based, not system media-driven.");
  process.exit(1);
}

console.log("OK: no prefers-color-scheme dark media queries in built CSS.");
