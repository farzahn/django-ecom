/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#667eea',
          hover: '#5a67d8',
          active: '#4c51bf',
          light: '#e6f3ff',
          dark: '#2d3748'
        },
        secondary: {
          DEFAULT: '#718096',
          hover: '#4a5568',
          light: '#f7fafc',
          dark: '#1a202c'
        },
        accent: {
          DEFAULT: '#e74c3c',
          hover: '#c0392b',
          light: '#fadbd8'
        },
        success: {
          DEFAULT: '#48bb78',
          hover: '#38a169',
          light: '#c6f6d5'
        },
        warning: {
          DEFAULT: '#ed8936',
          hover: '#dd6b20',
          light: '#feebc8'
        },
        info: {
          DEFAULT: '#4299e1',
          hover: '#3182ce',
          light: '#bee3f8'
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
          muted: '#999999',
          disabled: '#cccccc',
          white: '#ffffff',
          inverse: '#ffffff'
        },
        bg: {
          primary: '#ffffff',
          secondary: '#f8f9fa',
          tertiary: '#e9ecef',
          dark: '#343a40',
          overlay: 'rgba(0, 0, 0, 0.5)'
        },
        border: {
          DEFAULT: '#e2e8f0',
          light: '#f1f5f9',
          dark: '#cbd5e0',
          focus: '#667eea'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', 'monospace']
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      lineHeight: {
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem'
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px'
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      },
      zIndex: {
        'dropdown': 1000,
        'sticky': 1020,
        'fixed': 1030,
        'modal-backdrop': 1040,
        'modal': 1050,
        'popover': 1060,
        'tooltip': 1070,
        'toast': 1080
      },
      transitionDuration: {
        'fast': '150ms',
        'DEFAULT': '250ms',
        'slow': '350ms'
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      },
      maxWidth: {
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1536px',
        'container-max': '1200px'
      },
      height: {
        'header': '4rem',
        'footer': '3rem'
      },
      width: {
        'sidebar': '16rem',
        'sidebar-collapsed': '4rem'
      }
    }
  },
  plugins: [],
  darkMode: 'class'
}