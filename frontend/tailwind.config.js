/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#12372A',
          700: '#1F5D45',
          500: '#3E8E5B',
          accent: '#7CB342',
          light: '#A8D66D',
        },
        surface: {
          warm: '#F7F5EF',
          white: '#FFFFFF',
          secondary: '#EEF3EC',
        },
        content: {
          primary: '#17201B',
          secondary: '#66736A',
        },
        border: {
          DEFAULT: '#DDE5DD',
        },
        graph: {
          node: '#12372A',
          visited: '#A8D66D',
          edge: '#B8C5BB',
          route: '#7CB342',
        },
        status: {
          success: '#3E8E5B',
          warning: '#D99A2B',
          error: '#C94C4C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
