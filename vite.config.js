import { defineConfig } from 'vite';

// Basic Vite config for a static HTML/CSS repo.
export default defineConfig({
  root: '.',
  // do not copy every file from the project root into `dist` (avoids .git and node_modules)
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});