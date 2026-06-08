import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@app': path.resolve(__dirname, './src/app'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@schemas': path.resolve(__dirname, './src/schemas'),
      '@constants': path.resolve(__dirname, './src/constants/index'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       react: ['react', 'react-dom'],
    //       router: ['react-router-dom'],
    //       redux: ['@reduxjs/toolkit', 'react-redux'],
    //       query: ['@tanstack/react-query'],
    //       forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
    //     },
    //   },
    // },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) return 'react';
            if (id.includes('react-router-dom')) return 'router';
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) return 'redux';
            if (id.includes('@tanstack/react-query')) return 'query';
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'forms';
            if (id.includes('recharts') || id.includes('victory-vendor')) return 'charts';
          }
        },
      },
    },
  },
});