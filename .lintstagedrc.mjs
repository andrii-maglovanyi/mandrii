import path from "path";

const buildEslintCommand = (filenames) =>
  `pnpm lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

export default {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
  "*.{ts,tsx,css,md,json}": ["prettier --write --ignore-unknown"],
};
