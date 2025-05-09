// const buildEslintCommand = (filenames) =>
//   `next lint --fix --dir . --file ${filenames
//     .map((f) => path.relative(process.cwd(), f))
//     .join(" --file ")}`;

const buildEslintCommand = (filenames) => {
  console.log(
    ":::::",
    `next lint --fix --dir . --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(" --file ")}`,
  );
  return `next lint --fix --dir . --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(" --file ")}`;
};

export default {
  // "*.{ts,tsx}": [buildEslintCommand],
  "*.{ts,tsx,css,md,json}": ["prettier --write --ignore-unknown"],
};
