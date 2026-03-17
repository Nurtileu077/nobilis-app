module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'nobilis': {
          green: '#1a3a32',
          'green-light': '#2d5a4a',
          'green-dark': '#0f2a22',
          gold: '#c9a227',
          'gold-light': '#e8c547',
          'gold-dark': '#a68620',
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
