/** @type {import('tailwindcss').Config} */
const PrimeUIPreset = require('tailwindcss-primeui');

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [PrimeUIPreset],
}
