import baseConfig from "../../.lintstagedrc.base.mjs";

const buildEslintCommand = (filenames) =>
  `pnpm run lint --fix --file ${filenames
    .map((f) => `"${f}"`)
    .join(" --file ")}`;

export default {
  ...baseConfig,
  "**/*.{ts,tsx}": [buildEslintCommand],
};
