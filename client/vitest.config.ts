/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";
import "dotenv/config";
import { coverageConfigDefaults } from "vitest/config.js";

export default getViteConfig({
  test: {
    reporters:
      process.env.MODE == "CI" ? ["github-actions", "verbose"] : "verbose",
    setupFiles: ["./tests/vitest-setup.ts"],
    coverage: {
      provider: "istanbul",
      reporter: process.env.MODE == "CI" ? ["lcovonly", "text"] : "text",
      reportOnFailure: process.env.MODE == "CI",
      reportsDirectory: "coverage",
      exclude: [
        ...coverageConfigDefaults.exclude,
        "./src/pages/*",
        "./src/layouts/*",
      ],
    },
  },
});
