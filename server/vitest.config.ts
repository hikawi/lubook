import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      reporter: process.env.CI
        ? ["lcovonly", ["text", { file: "./coverage/coverage.txt" }]]
        : "text",
      reportOnFailure: Boolean(process.env.CI),
    },
    setupFiles: ["dotenv/config", "./src/tests/vitest-setup.ts"],
    fileParallelism: false,
    reporters: process.env.CI ? ["github-actions", "verbose"] : "verbose",
  },
});
