/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        clinicalBg: '#040711',
        clinicalSurface: '#121826',
        clinicalBorder: '#1d2433',
        clinicalCyan: '#06b6d4',
        clinicalGreen: '#10b981'
      }
    },
  },
  plugins: [],
}
