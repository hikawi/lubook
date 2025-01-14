/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        josefin: ["Josefin Sans", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        "dark-navy": "rgb(10, 38, 71)",
        "medium-navy": "rgb(20, 66, 114)",
        blue: "rgb(32, 82, 149)",
        "light-blue": "rgb(44, 116, 179)",
        "darker-navy": "rgb(6, 25, 46)",
        "very-light-blue": "rgb(162, 201, 236)",
        "light-red": "rgb(231, 143, 143)",
        red: "rgb(221, 98, 96)",
        "light-green": "rgb(161, 247, 124)",
        "light-gray": "rgb(181, 181, 181)",
        "sky-blue": "rgb(108, 173, 230)",
        gold: "rgb(255, 180, 88)",
      },
    },
  },
  plugins: [],
};
