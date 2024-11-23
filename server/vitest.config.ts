import "dotenv/config";
import { resolve } from "path";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
  test: {
    reporters: process.env.MODE == "CI" ? ["github-actions", "verbose"] : "verbose",
    setupFiles: ["./tests/vitest-setup.ts"],
    coverage: {
      provider: "istanbul",
      reporter: process.env.MODE == "CI" ? ["lcovonly", "text"] : "text",
      reportOnFailure: process.env.MODE == "CI",
      reportsDirectory: "coverage",
      exclude: [...coverageConfigDefaults.exclude, "app.ts"],
    },
  },
});
