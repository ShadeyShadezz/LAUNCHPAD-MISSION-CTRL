/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './app/globals.css',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--brand-500) / <alpha-value>)',
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
        },

        background: 'rgb(var(--bg-primary) / <alpha-value>)',
        foreground: 'rgb(var(--text-primary) / <alpha-value>)',

        card: {
          DEFAULT: 'rgb(var(--bg-primary) / <alpha-value>)',
          foreground: 'rgb(var(--text-primary) / <alpha-value>)',
        },

        popover: {
          DEFAULT: 'rgb(var(--bg-primary) / <alpha-value>)',
          foreground: 'rgb(var(--text-primary) / <alpha-value>)',
        },

        primary: {
          DEFAULT: 'rgb(var(--brand-500) / <alpha-value>)',
          foreground: 'rgb(250 250 252 / <alpha-value>)',
        },

        secondary: {
          DEFAULT: 'rgb(var(--bg-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--text-secondary) / <alpha-value>)',
        },

        muted: {
          DEFAULT: 'rgb(var(--bg-tertiary) / <alpha-value>)',
          foreground: 'rgb(var(--text-tertiary) / <alpha-value>)',
        },

        accent: {
          DEFAULT: 'rgb(var(--bg-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--text-secondary) / <alpha-value>)',
        },

        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          foreground: 'rgb(250 250 252 / <alpha-value>)',
        },

        warning: {
          DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
          foreground: 'rgb(var(--text-primary) / <alpha-value>)',
        },

        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(250 250 252 / <alpha-value>)',
        },

        border: 'rgb(var(--border-light) / <alpha-value>)',
        input: 'rgb(var(--border-medium) / <alpha-value>)',
        ring: 'rgb(var(--brand-500) / <alpha-value>)',

        sidebar: {
          DEFAULT: 'rgb(var(--bg-primary) / <alpha-value>)',
          foreground: 'rgb(var(--text-primary) / <alpha-value>)',
          accent: 'rgb(var(--bg-secondary) / <alpha-value>)',
          border: 'rgb(var(--border-light) / <alpha-value>)',
        },
      },

      spacing: {
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-width-collapsed)',
        header: 'var(--header-height)',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        large: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        premium: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'premium-lg': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        glow: '0 0 20px rgba(var(--brand-500), 0.45)',
      },

      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-in': 'slideIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },

      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        2000: '2000ms',
      },

      backdropBlur: {
        xs: '2px',
      },

      fontSize: {
        xxs: ['0.625rem', { lineHeight: '0.875rem' }],
      },

      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
    },
  },
  plugins: [],
};
