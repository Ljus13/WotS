import { defineConfig } from 'vite';

// Basic Vite config for a static HTML/CSS repo.
export default defineConfig({
  root: '.',
  publicDir: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});