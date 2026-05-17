/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "media", // NativeWind v4: mengikuti Appearance.setColorScheme()
  theme: {
    extend: {
      colors: {
        // Brand
        primary: "#1687A7",
        "primary-dark": "#0F5F7A",
        "primary-light": "#5CB8D4",

        // Status
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",

        // Dark theme surfaces
        "dark-bg": "#070D18",
        "dark-card": "#0F1A2E",
        "dark-elevated": "#162035",
        "dark-border": "#1E2D45",

        // Light theme surfaces
        "light-bg": "#F0F4F8",
        "light-card": "#FFFFFF",
        "light-elevated": "#E8EDF4",
        "light-border": "#CBD5E1",

        // Legacy
        active: "#1687A7",
        inactive: "#276678",
        backgound: "#F6F5F5",
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
