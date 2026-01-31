const colors = require("tailwindcss/colors")

module.exports = {
  content: [
    "./index.html",
    "./public/**/*.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  important: true,
  theme: {
    extend: {
      fontSize: {
        xs: ["0.813rem", "1rem"],
      },
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      // Columbia Blue theme (replacing green)
      "pale-green": "#D4E8F7",      // pale blue
      "light-green": "#75AADB",     // light Columbia blue
      "ligher-green": "#EAF3FA",    // lighter blue
      green: "#5B92C8",             // primary Columbia blue
      "dark-green": "#3D6FA0",      // dark blue
      "darkest-green": "#2C5A8A",   // darkest blue
      "light-blue": "#53A2FF",
      blue: "#006BE8",
      orange: "#E5A800",
      yellow: "#FFE8B8",
      "dark-yellow": "#997700",
      white: "#FFFFFF",
      "off-white": "#F2F2F2",
      black: "#000000",
      gray: "#BDBDBD",
      "dark-gray": "#6B6B6B",
      "very-dark-gray": "#4F4F4F",
      "light-gray": "#f3f4f6",
      "light-gray-stroke": "#dfdfdf",
      "avail-green": colors.sky, // The color used for marking availability (now blue)
      red: "#DB1616",
    },
    screens: {
      sm: "640px",
      md: "768px",
      mdlg: "896px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
  prefix: "tw-",
  safelist: [],
}
