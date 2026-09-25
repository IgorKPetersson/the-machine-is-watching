// Small, dependency-free formatter for this repository's handwritten CSS.
// Run from anywhere with: node scripts/format-css.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve(import.meta.dirname, "../css/style.css");
const source = readFileSync(file, "utf8");
let result = "";
let chunk = "";
let depth = 0;
let parentheses = 0;
let quote = "";
let escaped = false;

function flush(suffix = "") {
  const text = chunk.trim();
  if (text) result += `${"  ".repeat(depth)}${text}${suffix}\n`;
  chunk = "";
}

for (const char of source) {
  if (quote) {
    chunk += char;
    if (escaped) escaped = false;
    else if (char === "\\") escaped = true;
    else if (char === quote) quote = "";
    continue;
  }
  if (char === '"' || char === "'") { quote = char; chunk += char; continue; }
  if (char === "(") { parentheses++; chunk += char; continue; }
  if (char === ")") { parentheses--; chunk += char; continue; }
  if (parentheses === 0 && char === "{") { flush(" {"); depth++; continue; }
  if (parentheses === 0 && char === ";") { flush(";"); continue; }
  if (parentheses === 0 && char === "}") {
    flush();
    depth--;
    result += `${"  ".repeat(depth)}}\n\n`;
    continue;
  }
  chunk += char;
}
flush();
writeFileSync(file, result.trimEnd() + "\n");
