import path from "path";

const buildEslintCommand = (filenames) =>
  `pnpm --filter web exec next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

export default {
  "*.{ts,tsx}": [buildEslintCommand],
  "*.{ts,tsx,css,md,json}": ["prettier --write --ignore-unknown"],
};
