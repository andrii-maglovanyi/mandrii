import { FlatCompat } from "@eslint/eslintrc";
import perfectionist from 'eslint-plugin-perfectionist'



const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  perfectionist.configs['recommended-alphabetical'],
];

function forceAllWarningsToErrors(configs) {
  for (const config of configs) {
    if (config.rules) {
      for (const ruleName in config.rules) {
        const rule = config.rules[ruleName];
        if (Array.isArray(rule)) {
          if (rule[0] === "warn") rule[0] = "error";
        } else if (rule === "warn") {
          config.rules[ruleName] = "error";
        }
      }
    }
  }
}

export default forceAllWarningsToErrors(eslintConfig);

// export default eslintConfig;
