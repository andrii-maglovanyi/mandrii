import baseConfig from "../../.lintstagedrc.base.mjs";
import path from "path";

const buildEslintCommand = (filenames) =>
  `pnpm lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

export default {
  ...baseConfig,
  "*.{ts,tsx}": [buildEslintCommand],
};
