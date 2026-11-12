import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configured with relative base './' for seamless GitHub Pages deployment
// under both root domain (username.github.io) and project subpath (username.github.io/repo-name/)
export default defineConfig({
  base: './',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['eecircuit-engine'],
  },
  assetsInclude: ['**/*.wasm'],
  build: {
    target: 'es2022',
    outDir: 'dist',
    chunkSizeWarningLimit: 25000,
  },
});
