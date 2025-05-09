import perfectionist from "eslint-plugin-perfectionist";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "public/**", "**/graphql.generated.ts"],
  },
  perfectionist.configs["recommended-alphabetical"],
];
