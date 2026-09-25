import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import prettier from "prettier";

const root = "C:\\Users\\User\\Documents\\Projects\\askatutor";
const config = readFileSync(resolve(root, ".prettierrc"), "utf8");
const prettierOptions = { ...JSON.parse(config) };

function normalizeEOL(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function gitShow(rev, path) {
  try {
    const out = execSync(`git show "${rev}:${path}"`, {
      encoding: "buffer",
      maxBuffer: 512 * 1024 * 1024,
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.toString("utf8");
  } catch {
    return null;
  }
}

const status = execSync("git status --short", { encoding: "utf8", cwd: root });

const rows = [];
for (const line of status.split(/\r?\n/)) {
  if (!line.trim()) continue;
  const flags = line.slice(0, 2);
  let path = line.slice(3);
  if (!flags.includes("M") && !flags.includes("?")) continue;
  if (path.includes(" -> ")) path = path.split(" -> ").pop().trim();
  rows.push({ flags, path });
}

const result = {
  EOL_ONLY: [],
  FORMATTING_ONLY: [],
  REAL_DIFF: [],
  UNPARSEABLE: [],
  NEW: [],
  ERR: [],
};

for (const { flags, path } of rows) {
  let work;
  try {
    work = readFileSync(resolve(root, path), "utf8");
  } catch {
    work = null;
  }
  if (flags.startsWith("??")) {
    result.NEW.push(path);
    continue;
  }
  const head = gitShow("HEAD", path);
  if (head === null) {
    result.NEW.push(path);
    continue;
  }
  const w = normalizeEOL(work);
  const h = normalizeEOL(head);
  if (w === h) {
    result.EOL_ONLY.push(path);
    continue;
  }
  let formatted;
  try {
    formatted = await prettier.format(h, {
      ...prettierOptions,
      filepath: path,
      endOfLine: "lf",
    });
  } catch (e) {
    result.UNPARSEABLE.push(path);
    continue;
  }
  if (w === formatted) {
    result.FORMATTING_ONLY.push(path);
  } else {
    result.REAL_DIFF.push(path);
  }
}

const summary = Object.fromEntries(Object.entries(result).map(([k, v]) => [k, v.length]));
writeFileSync(resolve(root, "audit-evidence", "working-tree-classification.json"), JSON.stringify({ summary, result }, null, 2));
console.log(JSON.stringify(summary, null, 2));
console.log("\n-- NEW (untracked) --");
for (const p of result.NEW) console.log(p);
console.log("\n-- UNPARSEABLE --");
for (const p of result.UNPARSEABLE) console.log(p);
console.log("\n-- REAL_DIFF --");
for (const p of result.REAL_DIFF) console.log(p);