import path from "path";

const buildEslintCommand = (filenames) =>
  `next lint --strict --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(" --file ")}`;

const buildStylelintCommand = (filenames) =>
  `stylelint --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(" ")}`;

export default {
  "*.{ts,tsx}": [buildEslintCommand],
  "*.{ts,tsx,css,md,json}": ["prettier --write --ignore-unknown"],
  "*.css": [buildStylelintCommand],
};
