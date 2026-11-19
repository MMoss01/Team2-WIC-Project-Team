import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Relative base + HashRouter means the build works on GitHub Pages
// under any repo name, with no extra routing config.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
});
