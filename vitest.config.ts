import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "#remix-server": "@remix-run/node",
    },
  },
});
