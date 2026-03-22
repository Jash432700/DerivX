/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        head: ['Syne', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#080c18',
          2: '#0d1120',
          3: '#111827',
          4: '#161e30',
        },
        surface: '#1c2540',
        accent: {
          DEFAULT: '#5b8dff',
          2: '#8b5cf6',
        },
        gold: '#f59e0b',
        emerald: '#10b981',
        danger: '#ef4444',
        cyan: '#06b6d4',
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease',
        'slide-in': 'slideIn 0.28s cubic-bezier(0.4,0,0.2,1)',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          from: { boxShadow: '0 0 5px rgba(91,141,255,0.3)' },
          to: { boxShadow: '0 0 20px rgba(91,141,255,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
