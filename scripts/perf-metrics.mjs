import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";

const DEFAULTS = {
  host: "127.0.0.1",
  port: 4174,
  out: "output/perf/metrics.json",
  rawDir: "output/perf/raw",
  skipBuild: false,
  skipPreview: false,
  url: "",
};

const args = parseArgs(process.argv.slice(2));
const options = { ...DEFAULTS, ...args };
const rootDir = process.cwd();
const url = options.url || `http://${options.host}:${options.port}/`;
const outPath = path.resolve(rootDir, options.out);
const rawDir = path.resolve(rootDir, options.rawDir);
const reportPath = outPath.replace(/\.json$/i, ".md");

mkdirSync(path.dirname(outPath), { recursive: true });
mkdirSync(rawDir, { recursive: true });

let previewProcess = null;

try {
  if (!options.skipBuild) {
    await runCommand("npm", ["run", "build"], { cwd: rootDir });
  }

  if (!options.skipPreview) {
    previewProcess = startPreviewServer(options.host, String(options.port), rootDir);
    await waitForUrl(url, 30_000);
  }

  const mobileReportPath = path.join(rawDir, "lighthouse-mobile.json");
  const desktopReportPath = path.join(rawDir, "lighthouse-desktop.json");

  await runLighthouse(url, mobileReportPath, "mobile");
  await runLighthouse(url, desktopReportPath, "desktop");

  const mobileReport = JSON.parse(readFileSync(mobileReportPath, "utf8"));
  const desktopReport = JSON.parse(readFileSync(desktopReportPath, "utf8"));

  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    url,
    commitSha: process.env.GITHUB_SHA ?? null,
    mobile: extractMetrics(mobileReport),
    desktop: extractMetrics(desktopReport),
  };

  writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);

  const markdown = buildMarkdown(summary);
  writeFileSync(reportPath, `${markdown}\n`);

  console.log(`Saved metrics JSON: ${toRelative(outPath)}`);
  console.log(`Saved metrics report: ${toRelative(reportPath)}`);
  console.log(markdown);
} finally {
  await stopProcess(previewProcess);
}

async function runLighthouse(targetUrl, outputPath, formFactor) {
  const chromeFlags = "--headless=new --no-sandbox --disable-dev-shm-usage";
  const args = [
    "lighthouse",
    targetUrl,
    "--only-categories=performance",
    "--output=json",
    `--output-path=${outputPath}`,
    "--quiet",
    `--chrome-flags=${chromeFlags}`,
    `--form-factor=${formFactor}`,
  ];

  if (formFactor === "desktop") {
    args.push("--screenEmulation.mobile=false");
  }

  await runCommand("npx", args, { cwd: rootDir });
}

function extractMetrics(report) {
  const audits = report.audits ?? {};
  const mainThreadItems = audits["mainthread-work-breakdown"]?.details?.items ?? [];
  const nonCompositedItems = audits["non-composited-animations"]?.details?.items ?? [];

  return {
    score: round((report.categories?.performance?.score ?? 0) * 100, 1),
    firstContentfulPaintMs: safeAuditNumber(audits["first-contentful-paint"]),
    largestContentfulPaintMs: safeAuditNumber(audits["largest-contentful-paint"]),
    speedIndexMs: safeAuditNumber(audits["speed-index"]),
    interactiveMs: safeAuditNumber(audits.interactive),
    totalBlockingTimeMs: safeAuditNumber(audits["total-blocking-time"]),
    cumulativeLayoutShift: safeAuditNumber(audits["cumulative-layout-shift"], 3),
    mainThreadWorkMs: round(
      mainThreadItems.reduce((sum, item) => sum + Number(item.duration ?? 0), 0),
      1,
    ),
    totalByteWeightBytes: safeAuditNumber(audits["total-byte-weight"], 0),
    nonCompositedAnimationCount: nonCompositedItems.length,
  };
}

function safeAuditNumber(audit, precision = 1) {
  if (!audit || typeof audit.numericValue !== "number") {
    return null;
  }
  return round(audit.numericValue, precision);
}

function round(value, precision = 1) {
  if (!Number.isFinite(value)) {
    return null;
  }
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function buildMarkdown(summary) {
  const rows = [
    ["Mobile", summary.mobile],
    ["Desktop", summary.desktop],
  ];

  const header = [
    "| Platform | Score | FCP | LCP | Speed Index | TBT | CLS | Main Thread | Bytes | Non-composited |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];

  const tableRows = rows.map(([label, data]) => {
    return [
      `| ${label}`,
      formatNumber(data.score, "pt"),
      formatMs(data.firstContentfulPaintMs),
      formatMs(data.largestContentfulPaintMs),
      formatMs(data.speedIndexMs),
      formatMs(data.totalBlockingTimeMs),
      formatNumber(data.cumulativeLayoutShift, ""),
      formatMs(data.mainThreadWorkMs),
      formatNumber(data.totalByteWeightBytes, "B"),
      formatNumber(data.nonCompositedAnimationCount, ""),
      "|",
    ].join(" ");
  });

  return [
    "## Lighthouse Performance Summary",
    "",
    `- URL: \`${summary.url}\``,
    `- Generated: ${summary.generatedAt}`,
    "",
    ...header,
    ...tableRows,
  ].join("\n");
}

function formatMs(value) {
  return formatNumber(value, "ms");
}

function formatNumber(value, unit) {
  if (value == null || !Number.isFinite(value)) {
    return "n/a";
  }
  return unit ? `${value}${unit}` : `${value}`;
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    if (key === "skip-build") {
      parsed.skipBuild = true;
      continue;
    }
    if (key === "skip-preview") {
      parsed.skipPreview = true;
      continue;
    }
    const value = argv[i + 1];
    if (value == null || value.startsWith("--")) {
      continue;
    }
    i += 1;
    if (key === "port") {
      parsed.port = Number.parseInt(value, 10);
    } else if (key === "host") {
      parsed.host = value;
    } else if (key === "out") {
      parsed.out = value;
    } else if (key === "raw-dir") {
      parsed.rawDir = value;
    } else if (key === "url") {
      parsed.url = value;
    }
  }
  return parsed;
}

function startPreviewServer(host, port, cwd) {
  const child = spawn("npx", ["vite", "preview", "--host", host, "--port", port], {
    cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  return child;
}

async function waitForUrl(targetUrl, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(targetUrl, { method: "GET" });
      if (response.ok) {
        return;
      }
    } catch {
      // Ignore connection errors while server is starting.
    }
    await sleep(500);
  }
  throw new Error(`Timed out waiting for preview server: ${targetUrl}`);
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: process.env,
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed (${code}): ${command} ${args.join(" ")}`));
      }
    });
    child.on("error", reject);
  });
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  const exited = new Promise((resolve) => {
    child.once("exit", () => resolve());
  });

  child.kill("SIGTERM");
  const timeout = sleep(5_000).then(() => {
    if (child.exitCode === null) {
      child.kill("SIGKILL");
    }
  });

  await Promise.race([exited, timeout]);
}

function toRelative(targetPath) {
  return path.relative(rootDir, targetPath) || targetPath;
}
