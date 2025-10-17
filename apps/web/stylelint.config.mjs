/** @type {import('stylelint').Config} */
const config = {
  extends: ["stylelint-config-standard", "stylelint-config-tailwindcss"],
  rules: {
    "at-rule-no-deprecated": [
      true,
      {
        ignoreAtRules: ["apply"], // Tailwindcss @apply
      },
    ],
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["apply", "custom-variant", "layer", "plugin", "theme"],
      },
    ],
  },
};

export default config;
