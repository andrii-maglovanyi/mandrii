export default {
  "src/**/*.{ts,tsx}": ["pnpm lint --fix"],
  "src/**/*.{ts,tsx,css,md,json}": ["prettier --write --ignore-unknown"],
};
