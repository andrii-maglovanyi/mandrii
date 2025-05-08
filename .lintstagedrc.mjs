export default {
  "*.{ts,tsx,js,jsx}": ["pnpm lint --fix"],
  "*.{ts,tsx,css,md,json}": ["prettier --write --ignore-unknown"],
};
