/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,css,scss}"],
  theme: {
    extend: {
      fontFamily: {
        worksans: ["WorkSans", "sans-serif"],
        rational: ["Rational", "sans-serif"],
        drukBold: ["DrukBold", "sans-serif"],
        drukMedium: ["DrukMedium", "sans-serif"],
        drukHeavy: ["DrukHeavy", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        interBold: ["InterBold", "sans-serif"],
        grotesk: ["Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
