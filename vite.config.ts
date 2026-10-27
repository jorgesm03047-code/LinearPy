import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite para compilar un sitio estático listo para Cloudflare Pages
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('node_modules/katex/')) return 'katex';
        },
      },
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
