module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#e6f3ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0066cc',
          600: '#004d99',
          700: '#003366',
          800: '#001a33',
          900: '#000d1a',
        },
        monad: {
          purple: '#6b46c1',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'swim': 'swim 8s ease-in-out infinite',
        'bubble': 'bubble 4s ease-in-out infinite',
        'fishing': 'fishing 2s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        swim: {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '25%': { transform: 'translateX(20px) translateY(-15px)' },
          '50%': { transform: 'translateX(-10px) translateY(-5px)' },
          '75%': { transform: 'translateX(15px) translateY(10px)' },
        },
        bubble: {
          '0%': { transform: 'translateY(100vh) scale(0)' },
          '50%': { transform: 'translateY(50vh) scale(1)' },
          '100%': { transform: 'translateY(0vh) scale(0)' },
        },
        fishing: {
          '0%': { transform: 'translateY(-100px)' },
          '50%': { transform: 'translateY(200px)' },
          '100%': { transform: 'translateY(-100px)' },
        }
      }
    },
  },
  plugins: [],
}