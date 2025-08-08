/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"], // Include src directory
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        kollektif: ['Kollektif'],
        'space-mono': ['SpaceMono'],
      },
      colors: {
        'smar-green': '#2D5A4F',
        'smar-light': '#F5F5F5',
        'smar-accent': '#E8B4A4',
        'smar-blue': '#87CEEB',
      },
    },
  },
  plugins: [],
};