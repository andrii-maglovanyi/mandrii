import baseConfig from "@mandrii/eslint-config-custom";

export default [
  ...baseConfig,
  {
    ignores: ["public", "**/graphql.generated.ts"],
  },
];
