/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#2d5a27',
        'secondary-orange': '#f39200',
      },
    },
  },
  plugins: [],
}
