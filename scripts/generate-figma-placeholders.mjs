/**
 * Writes minimal valid PNGs for each figma:asset/*.png referenced in src/.
 * Replace these files with real exports from Figma when available.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");

const MINI_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const seen = new Set();

function walk(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(name.name)) {
      const text = fs.readFileSync(p, "utf8");
      const re = /figma:asset\/([a-f0-9]+\.png)/g;
      let m;
      while ((m = re.exec(text)) !== null) {
        seen.add(m[1]);
      }
    }
  }
}

walk(src);

const outDir = path.join(root, "src/assets/figma");
fs.mkdirSync(outDir, { recursive: true });
for (const file of seen) {
  fs.writeFileSync(path.join(outDir, file), MINI_PNG);
}

console.log(`Wrote ${seen.size} placeholder PNG(s) to src/assets/figma/`);
