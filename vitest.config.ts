import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: "./tests/setup.ts",
    alias: {
      "#remix-server": "@remix-run/node",
    },
  },
});
