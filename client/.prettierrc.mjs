export default {
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  printWidth: 120,
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
        printWidth: 120,
      },
    },
  ],
};
