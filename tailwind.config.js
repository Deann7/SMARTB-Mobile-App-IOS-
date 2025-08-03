/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"], // Adjust path if your components are in a different directory
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};