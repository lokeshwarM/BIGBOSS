/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        card: '#131B2E',
        cardHover: '#1B2640',
        primary: '#F59E0B',
        primaryGlow: 'rgba(245, 158, 11, 0.15)',
        accent: '#EC4899',
        borderMuted: '#1E293B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
