import { FlatCompat } from "@eslint/eslintrc";
import perfectionist from "eslint-plugin-perfectionist";
import vitest from "@vitest/eslint-plugin";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import testingLibrary from "eslint-plugin-testing-library";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:storybook/recommended"),
  {
    files: ["src/**/*.test.{ts,tsx}"],
    plugins: {
      "testing-library": testingLibrary,
    },
    rules: {
      ...testingLibrary.configs.react.rules,
    },
  },
  perfectionist.configs["recommended-alphabetical"],
  {
    plugins: {
      vitest,
      "better-tailwindcss": betterTailwindcss,
    },
    rules: {
      ...betterTailwindcss.configs["recommended-warn"].rules,
      ...betterTailwindcss.configs["recommended-error"].rules,
      "better-tailwindcss/no-unregistered-classes": [
        "error",
        { ignore: ["^(?:group|peer)(?:\\/(\\S*))?$", "^mndr(-[\\w-]+)?$"] },
      ],
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "./src/app/globals.css",
      },
    },
  },
];
