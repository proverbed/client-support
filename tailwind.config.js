/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: ["Inter", "system-ui", "sans-serif"],
      body: ["Inter", "system-ui", "sans-serif"],
    },
    colors: {
      primary: {
        50: "#CCEFBB",
        100: "#A8E397",
        200: "#7FD674",
        300: "#54C654",
        400: "#59B54B",
        500: "#5BA342",
        600: "#5C9139",
        700: "#5A7F31",
        800: "#556D29",
        900: "#0f172a",
      },
    },
    backgroundImage: {
      'hero-pattern': "url('login.jpg')",
      'sign-up': "url('sign-up.jpg')",
    }
  },
  plugins: [],
});
