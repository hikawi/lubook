import "dotenv/config";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters:
      process.env.MODE == "CI" ? ["github-actions", "verbose"] : "verbose",
    setupFiles: ["./src/tests/vitest-setup.ts"],
    coverage: {
      provider: "istanbul",
      reporter: process.env.MODE == "CI" ? ["lcovonly", "text"] : "text",
      reportOnFailure: process.env.MODE == "CI",
      reportsDirectory: "coverage",
      exclude: [...coverageConfigDefaults.exclude, "app.ts"],
    },
  },
});
