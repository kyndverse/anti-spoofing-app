/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        active: "#1687A7",
        inactive: "#276678",
        background: "#F6F5F5", // Typo diperbaiki
        success: "#10B981",    // Hijau untuk Real
        danger: "#EF4444",     // Merah untuk Fake
      },
    },
  },
  plugins: [],
};
