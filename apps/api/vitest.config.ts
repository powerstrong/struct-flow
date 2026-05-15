import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@struct-flow/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
});
