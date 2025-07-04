/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom Star Wars colors
        'jedi-blue': '#00BFFF',
        'sith-red': '#FF0000',
        'force-green': '#00FF7F',
        'space-dark': '#0A0A0F',
        'space-blue': '#1A1A2E',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'share-tech': ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'bb8-roll': 'bb8-roll 8s linear infinite',
        'bb8-head-tilt': 'bb8-head-tilt 3s ease-in-out infinite',
        'lightsaber-sweep': 'lightsaber-sweep 0.6s ease-in-out',
        'force-lightning': 'force-lightning 0.1s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      boxShadow: {
        'neon': '0 0 10px currentColor',
        'neon-lg': '0 0 20px currentColor, 0 0 30px currentColor',
      },
    },
  },
  plugins: [],
};