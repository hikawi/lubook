import tailwind from "@astrojs/tailwind";
import vuePlugin from "@vitejs/plugin-vue";
import "dotenv/config";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vuePlugin(), tailwind()],
  resolve: {
    alias: {
      "@": "/src", // Map `@` to the `src` directory
    },
  },
  test: {
    css: true,
    reporters:
      process.env.MODE == "CI" ? ["github-actions", "verbose"] : "verbose",
    setupFiles: ["./src/tests/vitest-setup.ts"],
    coverage: {
      provider: "istanbul",
      reporter: process.env.MODE == "CI" ? ["lcovonly", "text"] : "text",
      reportOnFailure: process.env.MODE == "CI",
      reportsDirectory: "coverage",
      exclude: [
        ...coverageConfigDefaults.exclude,
        "./src/pages/**/*",
        "./src/layouts/**/*",
        "**/*.astro",
      ],
    },
    browser: {
      enabled: true,
      headless: true,
      provider: "playwright",
      name: "chromium",
      screenshotFailures: false,
    },
  },
});
