/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FBF9F5',
        card: '#FFFFFF',
        'subtle-border': '#EBE6DF',
        forest: {
          DEFAULT: '#1E4D38',
          dark: '#143527',
          light: '#2D6A4F',
          tint: '#E8F5E9',
        },
        charcoal: {
          DEFAULT: '#121614',
          muted: '#6B726A',
          light: '#8E958E',
        },
        pastel: {
          spaces: '#E8EFE9',
          calendar: '#FDF3E7',
          faculty: '#EBF3FB',
          issues: '#FDEBEB',
          marketplace: '#F2EDF9',
          lostfound: '#EBF5F0',
        },
        badge: {
          green: '#E8F5E9',
          'green-text': '#1B5E20',
          red: '#FDEBEB',
          'red-text': '#C62828',
          orange: '#FFF3E0',
          'orange-text': '#B76E00',
          blue: '#E3F2FD',
          'blue-text': '#1565C0',
          purple: '#F3E5F5',
          'purple-text': '#6A1B9A',
        }
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
