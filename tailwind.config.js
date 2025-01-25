const colors = require('tailwindcss/colors')
/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: ["Inter", "system-ui", "sans-serif"],
      body: ["Inter", "system-ui", "sans-serif"],
    },
    extend: {
      colors: {
             //just add this below and your all other tailwind colors willwork
          ...colors
      }
    },
    backgroundImage: {
      'hero-pattern': "url('login.jpg')",
      'sign-up': "url('sign-up.jpg')",
    }
  },
  plugins: [],
});
