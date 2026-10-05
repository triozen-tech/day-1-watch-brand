#!/usr/bin/env node
// Checks that every image / video / frames folder used by the site (files in site/) exists.
//   npm run check
import * as fsRM from "node:fs";
import * as pathRM from "node:path";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(f)) files.push(p);
  }
};
walk("site");
const src = files.map((f) => readFileSync(f, "utf8")).join("\n");
const paths = [...new Set([...src.matchAll(/["'(](\/(?:images|frames|videos)\/[^"')]+)["')]/g)].map((m) => m[1]))];
let ok = true;
for (const p of paths) {
  const isFrames = p.startsWith("/frames/");
  const target = isFrames ? join("public", p, "manifest.json") : join("public", p);
  if (existsSync(target)) console.log(`  ✓ ${p}`);
  else {
    ok = false;
    console.log(`  ✗ ${p}  ${isFrames ? "(no manifest.json — run: npm run frames -- <video> " + p.slice(1) + ")" : "(file missing)"}`);
  }
}
console.log(ok ? "\nAll assets found.\n" : "\nSome assets are missing.\n");
// Motion lint: the OS "reduce motion" setting is ON by default on many Windows machines and turned live sites into
// flat static pages. Only ?static=1 may disable motion, so no code may read that setting (no CSS media query, no
// matchMedia). The patterns are built from pieces so this file never matches itself.
const RM = new RegExp(["prefers", "reduced", "motion"].join("-") + "|matchMedia\\([^)]*" + "reduce", "i");
const rmFiles = [];
const rmWalk = (d) => {
  if (!fsRM.existsSync(d)) return;
  for (const f of fsRM.readdirSync(d)) {
    if (f === "node_modules" || f === ".next" || f === "archive" || f === "out") continue;
    const p = pathRM.join(d, f);
    if (fsRM.statSync(p).isDirectory()) rmWalk(p);
    else if (/\.(tsx?|jsx?|mjs|css)$/.test(f)) rmFiles.push(p);
  }
};
["app", "components", "lib", "site", "scripts"].forEach(rmWalk);
const rmOffenders = rmFiles.filter((f) => RM.test(fsRM.readFileSync(f, "utf8")));
if (rmOffenders.length) {
  console.log("✗ Reduce-motion check FAILED: these files read the OS reduce-motion setting (only ?static=1 may disable motion):");
  rmOffenders.forEach((f) => console.log(`    ${f}`));
  console.log("");
} else console.log("✓ Motion lint: nothing honours the OS reduce-motion setting (only ?static=1 disables motion).\n");
process.exit(ok && !rmOffenders.length ? 0 : 1);
