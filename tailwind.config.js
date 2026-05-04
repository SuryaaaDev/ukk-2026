/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        panel: "#0f172a",
        panelSoft: "#1e293b"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(148,163,184,0.2), 0 8px 30px rgba(15,23,42,0.35)"
      }
    }
  },
  plugins: []
};
