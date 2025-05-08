import nextConfig from "@mandrii/eslint-config-custom/next.mjs";

export default [
  {
    ignores: [".next/**", "public/**", "**/graphql.generated.ts"],
  },
  ...nextConfig,
];
