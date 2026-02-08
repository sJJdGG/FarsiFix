import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const args = parseArgs(process.argv.slice(2));

if (!args.before || !args.after) {
  console.error(
    "Usage: node scripts/perf-compare.mjs --before <path> --after <path> [--out <path>] [--fail-on-regression]",
  );
  process.exit(1);
}

const rootDir = process.cwd();
const beforePath = path.resolve(rootDir, args.before);
const afterPath = path.resolve(rootDir, args.after);
const outPath = path.resolve(rootDir, args.out ?? "output/perf/report.md");

const before = JSON.parse(readFileSync(beforePath, "utf8"));
const after = JSON.parse(readFileSync(afterPath, "utf8"));

const thresholds = {
  maxScoreDrop: args.maxScoreDrop ?? 3,
  maxFcpIncreaseMs: args.maxFcpIncreaseMs ?? 300,
  maxLcpIncreaseMs: args.maxLcpIncreaseMs ?? 400,
  maxTbtIncreaseMs: args.maxTbtIncreaseMs ?? 75,
};

const comparisons = {
  mobile: comparePlatform(before.mobile, after.mobile, thresholds),
  desktop: comparePlatform(before.desktop, after.desktop, thresholds),
};

const regressions = [
  ...comparisons.mobile.regressions.map((item) => `mobile: ${item}`),
  ...comparisons.desktop.regressions.map((item) => `desktop: ${item}`),
];

const markdown = buildMarkdown(before, after, comparisons, regressions, thresholds);

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, `${markdown}\n`);
console.log(markdown);
console.log(`Saved comparison report: ${toRelative(outPath, rootDir)}`);

if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`, { flag: "a" });
}

if (args.failOnRegression && regressions.length > 0) {
  process.exit(1);
}

function comparePlatform(beforeData, afterData, thresholds) {
  const metricRules = [
    {
      key: "score",
      label: "Score",
      type: "higher-is-better",
      threshold: thresholds.maxScoreDrop,
      thresholdLabel: `drop > ${thresholds.maxScoreDrop}pt`,
    },
    {
      key: "firstContentfulPaintMs",
      label: "FCP",
      type: "lower-is-better",
      threshold: thresholds.maxFcpIncreaseMs,
      thresholdLabel: `increase > ${thresholds.maxFcpIncreaseMs}ms`,
    },
    {
      key: "largestContentfulPaintMs",
      label: "LCP",
      type: "lower-is-better",
      threshold: thresholds.maxLcpIncreaseMs,
      thresholdLabel: `increase > ${thresholds.maxLcpIncreaseMs}ms`,
    },
    {
      key: "totalBlockingTimeMs",
      label: "TBT",
      type: "lower-is-better",
      threshold: thresholds.maxTbtIncreaseMs,
      thresholdLabel: `increase > ${thresholds.maxTbtIncreaseMs}ms`,
    },
  ];

  const deltas = {};
  const regressions = [];

  for (const rule of metricRules) {
    const beforeValue = normalizeNumber(beforeData?.[rule.key]);
    const afterValue = normalizeNumber(afterData?.[rule.key]);
    const delta =
      beforeValue == null || afterValue == null ? null : round(afterValue - beforeValue, 1);

    deltas[rule.key] = { before: beforeValue, after: afterValue, delta };

    if (delta == null) {
      continue;
    }

    const isRegression =
      rule.type === "higher-is-better" ? delta < -rule.threshold : delta > rule.threshold;
    if (isRegression) {
      regressions.push(`${rule.label} ${rule.thresholdLabel} (delta ${formatSigned(delta)})`);
    }
  }

  return { deltas, regressions };
}

function buildMarkdown(before, after, comparisons, regressions, thresholds) {
  const sections = [
    "## Lighthouse Before/After",
    "",
    `- Before: \`${beforePathLabel(before)}\``,
    `- After: \`${beforePathLabel(after)}\``,
    "",
    buildPlatformTable("Mobile", comparisons.mobile),
    "",
    buildPlatformTable("Desktop", comparisons.desktop),
    "",
    "### Regression Rules",
    `- Score drop > ${thresholds.maxScoreDrop}pt`,
    `- FCP increase > ${thresholds.maxFcpIncreaseMs}ms`,
    `- LCP increase > ${thresholds.maxLcpIncreaseMs}ms`,
    `- TBT increase > ${thresholds.maxTbtIncreaseMs}ms`,
    "",
    "### Result",
  ];

  if (regressions.length === 0) {
    sections.push("- No configured regressions detected.");
  } else {
    for (const regression of regressions) {
      sections.push(`- ${regression}`);
    }
  }

  return sections.join("\n");
}

function buildPlatformTable(title, platformComparison) {
  const order = [
    ["score", "Score", "pt"],
    ["firstContentfulPaintMs", "FCP", "ms"],
    ["largestContentfulPaintMs", "LCP", "ms"],
    ["totalBlockingTimeMs", "TBT", "ms"],
  ];

  const lines = [
    `### ${title}`,
    "| Metric | Before | After | Delta |",
    "| --- | ---: | ---: | ---: |",
  ];

  for (const [key, label, unit] of order) {
    const item = platformComparison.deltas[key];
    lines.push(
      `| ${label} | ${formatValue(item.before, unit)} | ${formatValue(item.after, unit)} | ${formatSigned(item.delta, unit)} |`,
    );
  }

  return lines.join("\n");
}

function formatValue(value, unit) {
  if (value == null) {
    return "n/a";
  }
  return unit ? `${value}${unit}` : `${value}`;
}

function formatSigned(value, unit = "") {
  if (value == null) {
    return "n/a";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}${unit}`;
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    if (key === "fail-on-regression") {
      parsed.failOnRegression = true;
      continue;
    }
    const value = argv[i + 1];
    if (value == null || value.startsWith("--")) {
      continue;
    }
    i += 1;
    if (key === "before") {
      parsed.before = value;
    } else if (key === "after") {
      parsed.after = value;
    } else if (key === "out") {
      parsed.out = value;
    } else if (key === "max-score-drop") {
      parsed.maxScoreDrop = Number.parseFloat(value);
    } else if (key === "max-fcp-increase-ms") {
      parsed.maxFcpIncreaseMs = Number.parseFloat(value);
    } else if (key === "max-lcp-increase-ms") {
      parsed.maxLcpIncreaseMs = Number.parseFloat(value);
    } else if (key === "max-tbt-increase-ms") {
      parsed.maxTbtIncreaseMs = Number.parseFloat(value);
    }
  }
  return parsed;
}

function normalizeNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function round(value, precision = 1) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function beforePathLabel(payload) {
  return payload?.generatedAt ? `generated ${payload.generatedAt}` : "unknown";
}

function toRelative(targetPath, rootDir) {
  return path.relative(rootDir, targetPath) || targetPath;
}
