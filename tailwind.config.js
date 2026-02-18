/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 🔴 THIS IS CRITICAL
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
