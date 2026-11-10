/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rext: {
          dark: 'var(--bg-main)',
          darker: 'var(--bg-darker)',
          card: 'var(--bg-card)',
          'card-hover': 'var(--bg-card-hover)',
          surface: 'var(--bg-surface)',
          border: 'var(--border-color)',
          orange: 'var(--accent-orange)',
          'orange-glow': 'var(--accent-glow)',
          blue: 'var(--accent-blue)',
          'blue-cyan': 'var(--accent-cyan)',
          white: '#FFFFFF',
          gray: '#A1A1AA',
          muted: '#71717A'
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        sans: ['var(--active-font)', 'Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'sound-bar': 'soundBar 1.2s ease-in-out infinite alternate',
        'spin-slow': 'spin 12s linear infinite',
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 1.8s infinite linear',
        'equalizer': 'equalizer 0.8s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
        soundBar: {
          '0%': { height: '15%' },
          '100%': { height: '100%' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        equalizer: {
          '0%': { transform: 'scaleY(0.2)' },
          '100%': { transform: 'scaleY(1)' },
        }
      }
    },
  },
  plugins: [],
}
