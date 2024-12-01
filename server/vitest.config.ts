import "dotenv/config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      reporter: process.env.CI ? ["lcovonly", "text"] : "text",
      reportOnFailure: Boolean(process.env.CI),
    },
    setupFiles: ["./src/tests/vitest-setup.ts"],
    fileParallelism: false,
    reporters: process.env.CI ? "github-actions" : "verbose",
  },
});
