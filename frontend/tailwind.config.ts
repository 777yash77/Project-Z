import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        green: {
          '400': '#00ff88',
          '500': '#00e07a',
          '600': '#00c96a',
          '700': '#00874a',
          '800': '#00522e',
          '900': '#002e1a',
          '950': '#001a0f',
        },
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.25)',
        'glow-green-lg': '0 0 40px rgba(0, 255, 136, 0.2)',
      },
    },
  },
  plugins: [],
} satisfies Config;
