/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    "./App.js",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5B4CCC',
        'rating-badge': '#f0c040',
        'bg-page': '#f9f9f9',
        'bg-card': '#ffffff',
        'text-primary': '#1a1a1a',
        'text-secondary': '#333',
        'text-muted': '#666',
        'text-light': '#888',
        'text-label': '#999',
        'text-error': '#cc0000',
        'border-light': '#eee',
        'bg-input': '#f5f5f5',
      },
    },
  },
  plugins: [],
};