const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const PORT = Number(process.env.A11Y_PORT || 3000);
const BASE = process.env.A11Y_BASE_URL || `http://127.0.0.1:${PORT}`;

function resolveChromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const cache = path.join(os.homedir(), ".cache", "puppeteer", "chrome");
  if (!fs.existsSync(cache)) return undefined;
  const matches = [];
  for (const entry of fs.readdirSync(cache)) {
    for (const arch of ["chrome-mac-arm64", "chrome-mac-x64"]) {
      const candidate = path.join(
        cache,
        entry,
        arch,
        "Google Chrome for Testing.app",
        "Contents",
        "MacOS",
        "Google Chrome for Testing",
      );
      if (fs.existsSync(candidate)) matches.push(candidate);
    }
    const linux = path.join(cache, entry, "chrome-linux64", "chrome");
    if (fs.existsSync(linux)) matches.push(linux);
  }
  return matches.sort().at(-1);
}

const chromePath = resolveChromePath();

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      url: [
        `${BASE}/login`,
        `${BASE}/mis-tareas`,
        `${BASE}/dashboard`,
        `${BASE}/institucional`,
        `${BASE}/chat`,
      ],
      startServerCommand: process.env.LHCI_START_SERVER || "npm run start",
      startServerReadyPattern: "Ready|started server",
      startServerReadyTimeout: 180000,
      puppeteerScript: "./e2e/a11y/lhci-puppeteer.cjs",
      puppeteerLaunchOptions: {
        ...(chromePath ? { executablePath: chromePath } : {}),
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      },
      settings: {
        preset: "desktop",
        onlyCategories: ["accessibility", "performance"],
        skipAudits: ["uses-http2", "bf-cache"],
      },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:performance": ["error", { minScore: 0.85 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./reports/lighthouse",
    },
  },
};
