/**
 * Compare local frontend src/ with a clone of the design repo; track integration files to preserve.
 * Usage: FIGMA_REPO_URL=https://github.com/org/design.git node scripts/figma-sync.js check|diff
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const designUrl =
  process.env.FIGMA_REPO_URL || "https://github.com/hessgamesllc/HessElite.git";
const cloneDir = path.join(root, ".figma-design-repo");

const FILES_TO_PRESERVE = [
  "src/services/api.ts",
  "src/types/user.ts",
  "src/utils/mapUser.ts",
  "src/app/contexts/AuthContext.tsx",
  "src/app/contexts/InquiryContext.tsx",
  "src/app/components/ErrorBoundary.tsx",
  "src/app/components/RequireAuth.tsx",
  "vite-plugins/figma-asset.ts",
  "vite.config.ts",
];

function run(cmd) {
  execSync(cmd, { stdio: "inherit", cwd: root });
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  const walk = (d) => {
    for (const name of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, name.name);
      if (name.isDirectory()) walk(p);
      else n += 1;
    }
  };
  walk(dir);
  return n;
}

const cmd = process.argv[2];

if (cmd === "check") {
  if (!fs.existsSync(cloneDir)) {
    run(`git clone --depth 1 "${designUrl}" "${cloneDir}"`);
  } else {
    run(`git -C "${cloneDir}" pull`);
  }
  const state = {
    designSrcFiles: countFiles(path.join(cloneDir, "src")),
    localSrcFiles: countFiles(path.join(root, "src")),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(root, ".figma-sync-state.json"), JSON.stringify(state, null, 2));
  console.log("figma:check OK", state);
} else if (cmd === "diff") {
  const designSrc = path.join(cloneDir, "src");
  const localSrc = path.join(root, "src");
  console.log("Design repo src files:", countFiles(designSrc));
  console.log("Local src files:", countFiles(localSrc));
  console.log("\nFILES_TO_PRESERVE (do not overwrite blindly when merging design updates):");
  FILES_TO_PRESERVE.forEach((f) => console.log(" -", f));
} else {
  console.log("Usage: node scripts/figma-sync.js check|diff");
  process.exit(1);
}
