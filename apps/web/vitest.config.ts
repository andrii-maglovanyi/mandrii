import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      exclude: ["**/.storybook/**", "**/*.stories.*", "**/storybook-static/**"],
      include: ["src/components/**/*.ts?(x)", "src/hooks/**/*.ts"],
      provider: "v8",
    },
    environment: "jsdom",
    globals: true,
    include: ["src/components/**/*.test.ts?(x)", "src/hooks/**/*.test.ts"],
    name: "unit",
    setupFiles: ["./vitest.setup.ts"],
  },
});
