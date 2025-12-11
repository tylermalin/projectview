/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sustainability-green': '#10b981', // Emerald green
        'sustainability-mint': '#34d399', // Mint green
        'sustainability-teal': '#14b8a6', // Teal
        'sustainability-sky': '#0ea5e9', // Sky blue
        'sustainability-orange': '#f97316', // Orange for warnings
        'sustainability-red': '#ef4444', // Light red for risks
        'sustainability-gray': '#6b7280', // Dark gray text
        'sustainability-bg': '#f8f9fa', // Light gray background
      },
      borderRadius: {
        'card': '12px',
        'tile': '8px',
      },
    },
  },
  plugins: [],
}

