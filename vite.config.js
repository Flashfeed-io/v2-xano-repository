import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    cors: true,
    hmr: {
      overlay: false
    },
    fs: {
      strict: false,
      allow: ['..']
    }
  },
  optimizeDeps: {
    include: ['petite-vue']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        'ad-library': resolve(__dirname, 'src/pages/app/ad-library.js')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]'
      }
    }
  }
});
