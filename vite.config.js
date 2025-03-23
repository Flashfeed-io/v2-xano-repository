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
    open: true,
    port: 3000,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    }
  },
  optimizeDeps: {
    include: ['petite-vue', 'ag-grid-community'],
    exclude: []
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        'ad-library': resolve(__dirname, 'src/pages/app/ad-library.js'),
        'my-briefs': resolve(__dirname, 'src/pages/app/my-briefs.js')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]'
      }
    }
  },
  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  }
});
