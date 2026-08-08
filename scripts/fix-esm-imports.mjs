// Runs automatically after every `prisma generate` (see package.json).
// Adds explicit .js (or /index.js for directory imports) to every
// extension-less relative import — needed because the project uses
// Node.js native ESM ("type": "module"), and both our own TS source
// AND Prisma's own generated client code omit extensions.
import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from "fs";
import { join, extname, dirname, resolve } from "path";

// src/ ধরে পুরো project (আমাদের কোড + generated/prisma দুটোই) কভার করে
const ROOTS = ["src", "api"];
const VALID_EXT = [".js", ".json", ".mjs", ".cjs", ".node"];
const IMPORT_RE =
  /(from\s+|import\s*\(\s*|export\s+[^;]*?from\s+)(["'])(\.[^"']+)\2/g;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules") continue; // এখন আর "generated" বাদ দিচ্ছি না
      walk(full, files);
    } else if (
      (entry.endsWith(".ts") && !entry.endsWith(".d.ts")) ||
      entry.endsWith(".js") // Prisma generated code সরাসরি .js-ও হতে পারে
    ) {
      files.push(full);
    }
  }
  return files;
}

function resolveSpecifier(fileDir, specifier) {
  const abs = resolve(fileDir, specifier);
  if (existsSync(abs) && statSync(abs).isDirectory()) {
    return specifier.replace(/\/?$/, "") + "/index.js";
  }
  return specifier + ".js";
}

function fixFile(path) {
  const original = readFileSync(path, "utf8");
  let changed = false;
  const fileDir = dirname(path);

  const updated = original.replace(
    IMPORT_RE,
    (match, prefix, quote, specifier) => {
      const hasExt = VALID_EXT.includes(extname(specifier));
      if (hasExt) return match;
      changed = true;
      const fixed = resolveSpecifier(fileDir, specifier);
      return `${prefix}${quote}${fixed}${quote}`;
    },
  );

  if (changed) writeFileSync(path, updated, "utf8");
  return changed;
}

let totalChanged = 0;
const changedFiles = [];

for (const root of ROOTS) {
  try {
    for (const file of walk(root)) {
      if (fixFile(file)) {
        totalChanged++;
        changedFiles.push(file);
      }
    }
  } catch (e) {
    console.log(`Skipping ${root}: ${e.message}`);
  }
}

console.log(
  `✅ [fix-esm-imports] Patched ${totalChanged} file(s) for Node ESM compatibility.`,
);
