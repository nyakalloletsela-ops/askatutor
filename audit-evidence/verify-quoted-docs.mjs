import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import prettier from "prettier";

const cfg = JSON.parse(readFileSync(".prettierrc", "utf8"));
const norm = (s) => s.replace(/\r\n/g, "\n");

for (const f of [
  "docs/archive/BACKLOG (2).md",
  "docs/archive/CURRENT_STATE (2).md",
  "docs/archive/DECISION_LOG (2).md",
  "docs/archive/MASTER_PLAN (2).md",
  "docs/archive/WORK_PROTOCOL (2).md",
]) {
  const head = execFileSync("git", ["show", `HEAD:${f}`], { encoding: "buffer" }).toString("utf8");
  const work = readFileSync(f, "utf8");
  const fmt = await prettier.format(norm(head), { ...cfg, filepath: f, endOfLine: "lf" });
  console.log(norm(work) === fmt ? "FORMATTING_ONLY" : "REAL_DIFF", "|", f);
}