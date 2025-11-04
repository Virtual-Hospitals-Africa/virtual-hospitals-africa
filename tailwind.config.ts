import colors from 'tailwindcss/colors.js'
import formsPlugin from '@tailwindcss/forms'
import { type Config } from 'tailwindcss'

export default {
  content: ['{routes,islands,components}/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.indigo[900],
          secondary: colors.indigo[700],
          tertiary: colors.indigo[200],
        },

        neutral: {
          primary: colors.gray[800],
          secondary: colors.gray[600],
          tertiary: colors.gray[400],
          disabled: colors.gray[300],
        },

        background: {
          primary: colors.white,
          base: colors.neutral[50],
          secondary: colors.neutral[100],
          border: colors.neutral[200],
        },

        success: {
          bg: colors.green[100],
          text: colors.green[600],
          status: colors.green[600],
        },

        error: {
          bg: colors.red[100],
          text: colors.red[800],
          status: colors.red[600],
        },

        warning: {
          bg: colors.yellow[100],
          text: colors.yellow[800],
          status: colors.yellow[500],
        },

        disabled: {
          bg: colors.neutral[100],
          text: colors.neutral[600],
          status: colors.neutral[200],
        },

        accent: {
          blue: {
            bg: colors.blue[100],
            text: colors.blue[800],
          },
          teal: {
            bg: colors.teal[100],
            text: colors.teal[800],
          },
          pink: {
            bg: colors.pink[100],
            text: colors.pink[800],
          },
          purple: {
            bg: colors.purple[200],
            text: colors.purple[800],
          },
          orange: {
            bg: colors.orange[100],
            text: colors.orange[700],
            status: colors.orange[500],
          },
        },
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'heading-1': ['24px', '32px'],
        'heading-2': ['20px', '28px'],
        'heading-3': ['18px', '26px'],
        'heading-4': ['16px', '24px'],
        'heading-5': ['14px', '20px'],
        '20': ['20px', '28px'],
        '18': ['18px', '26px'],
        '16': ['16px', '24px'],
        '14': ['14px', '20px'],
        '12': ['12px', '20px'],
      },
    },
  },
  plugins: [formsPlugin],
} satisfies Config
