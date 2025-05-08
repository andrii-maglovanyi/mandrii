import nextConfig from "@mandrii/eslint-config-custom/next.mjs";

export default [
  ...nextConfig,
  {
    ignores: [".next/**", "public/**", "**/graphql.generated.ts"],
  },
];
