import path from "path";
import { fileURLToPath } from "url";
import type { Plugin } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Resolves `figma:asset/<hash>.png` imports to files under `src/assets/figma/`. */
export function figmaAssetPlugin(): Plugin {
  const prefix = "figma:asset/";
  return {
    name: "figma-asset",
    resolveId(id) {
      if (id.startsWith(prefix)) {
        const file = id.slice(prefix.length);
        return path.resolve(root, "../src/assets/figma", file);
      }
      return undefined;
    },
  };
}
