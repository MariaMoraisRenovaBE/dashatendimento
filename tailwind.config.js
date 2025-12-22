/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        purple: {
          500: '#a855f7',
          600: '#9333ea',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        pink: {
          400: '#ec4899',
          500: '#ec4899',
          600: '#be185d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Sistema de sombras premium - 4 níveis estratificados
        'soft': '0 1px 3px rgba(162, 117, 227, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 6px -1px rgba(162, 117, 227, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
        'strong': '0 10px 25px -5px rgba(162, 117, 227, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 0 1px rgba(162, 117, 227, 0.05), 0 20px 40px -10px rgba(162, 117, 227, 0.25)',
        'glow-hover': '0 0 0 1px rgba(162, 117, 227, 0.1), 0 25px 50px -12px rgba(162, 117, 227, 0.35)',
        // Sombras para cards premium
        'card': '0 4px 6px -1px rgba(162, 117, 227, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'card-hover': '0 10px 25px -5px rgba(162, 117, 227, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        // Sombras para botões
        'button': '0 4px 6px -1px rgba(162, 117, 227, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'button-hover': '0 10px 25px -5px rgba(162, 117, 227, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.12)',
        // Sombra dourada para badges premium
        'gold': '0 4px 6px -1px rgba(245, 158, 11, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'gold-lg': '0 10px 25px -5px rgba(245, 158, 11, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.12)',
        // Sombras antigas (mantidas para compatibilidade)
        'mystic': '0 10px 40px -10px rgba(236, 72, 153, 0.3), 0 0 20px rgba(236, 72, 153, 0.1)',
        'mystic-lg': '0 20px 60px -15px rgba(236, 72, 153, 0.4), 0 0 30px rgba(236, 72, 153, 0.15)',
        'layered': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(236, 72, 153, 0.05)',
        'layered-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(236, 72, 153, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'ripple': 'ripple 0.6s ease-out',
        'lift': 'lift 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'stagger': 'stagger 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(236, 72, 153, 0.5), 0 0 10px rgba(236, 72, 153, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.8), 0 0 30px rgba(236, 72, 153, 0.5)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        lift: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-8px) scale(1.02)' },
        },
        stagger: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      letterSpacing: {
        'tighter': '-0.05em',
        'wide': '0.05em',
        'wider': '0.1em',
      },
    },
  },
  plugins: [],
}
