module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // 科技蓝
          dark: '#1e40af',
        },
        accent: '#a21caf', // 紫色点缀
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 8px 2px #2563eb55',
      },
    },
  },
  plugins: [],
}; 