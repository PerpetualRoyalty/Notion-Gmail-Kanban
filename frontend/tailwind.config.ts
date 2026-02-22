import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        notion: '#000000',
        gmail: '#EA4335',
      }
    }
  },
  plugins: []
};

export default config;
