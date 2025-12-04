import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded correctly on GitHub Pages
  define: {
    // Polyfill process.env for the browser so access to process.env.API_KEY doesn't crash
    'process.env': {} 
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});