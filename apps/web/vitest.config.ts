import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    coverage: {
      exclude: ["**/.storybook/**", "**/*.stories.*", "**/storybook-static/**"],
      include: ["src/components/**/*.ts?(x)", "src/hooks/**/*.ts", "src/lib/**/*.ts"],
      provider: "v8",
    },
    environment: "jsdom",
    globals: true,
    include: ["src/components/**/*.test.ts?(x)", "src/hooks/**/*.test.ts", "src/lib/**/*.test.ts"],
    name: "unit",
    setupFiles: ["./vitest.setup.ts"],
  },
});
