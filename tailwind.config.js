/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zred: '#E23744',
        zorange: '#FF6B35',
        zdark: '#0D0D0D',
        zcard: '#161616',
        zcard2: '#1E1E1E',
        zborder: '#2A2A2A',
        ztext: '#F0EDE8',
        zmuted: '#7A7570',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
