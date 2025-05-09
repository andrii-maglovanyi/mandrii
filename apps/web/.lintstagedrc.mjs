import baseConfig from "../../.lintstagedrc.base.mjs";
import path from "path";

export const getFiles = (filenames) =>
  filenames
    .map((f) => path.relative(`${process.cwd()}/apps/web`, f))
    .join(" --file ");

const eslintWithFix = (filenames) =>
  `pnpm lint --file ${getFiles(filenames)} --fix`;

export default {
  ...baseConfig,
  "**/*.{ts,tsx}": [eslintWithFix],
  // "**/*.{ts,tsx}": ["pnpm lint --fix"],
};
