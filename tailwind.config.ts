import formsPlugin from '@tailwindcss/forms'
import { type Config } from 'tailwindcss'

export default {
  content: ['{routes,islands,components}/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#312e81',
          secondary: '#4338ca',
          tertiary: '#c7d2fe',
          onBrand: '#ffffff',
        },

        neutral: {
          primary: '#1e2939',
          secondary: '#4a5565',
          tertiary: '#99a1af',
          disabled: '#d1d5dc',
        },

        background: {
          primary: '#ffffff',
          base: '#f9fafb',
          secondary: '#f3f4f6',
          border: '#e5e7eb',
        },

        success: {
          bg: '#dcfce7',
          textIcon: '#016630',
          status: '#00a63e',
        },

        error: {
          bg: '#fee2e2',
          textIcon: '#991b1b',
          status: '#dc2626',
        },

        warning: {
          bg: '#fef9c3',
          textIcon: '#854d0e',
          status: '#facc15',
        },

        disabled: {
          bg: '#f3f4f6',
          textIcon: '#4a5565',
          status: '#d1d5dc',
        },

        accent: {
          blue: {
            bg: '#dbeafe',
            textIcon: '#1e40af',
          },
          teal: {
            bg: '#ccfbf1',
            textIcon: '#115e59',
          },
          pink: {
            bg: '#fce7f3',
            textIcon: '#9d174d',
          },
          purple: {
            bg: '#f3e8ff',
            textIcon: '#6b21a8',
          },
          orange: {
            bg: '#ffedd5',
            textIcon: '#c2410c',
            status: '#f97316',
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
