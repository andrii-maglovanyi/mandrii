import path from "path";

const buildEslintCommand = (filenames) =>
  `eslint --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(" ")}`;

const buildStylelintCommand = (filenames) =>
  `stylelint --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(" ")}`;

const commands = {
  "*.{ts,tsx,css,md,json}": ["prettier --write --ignore-unknown"],
  "*.{ts,tsx}": [buildEslintCommand],
  "*.css": [buildStylelintCommand],
};

export default commands;
