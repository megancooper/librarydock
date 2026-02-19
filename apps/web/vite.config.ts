import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@librarydock/shared-types': resolve(__dirname, '../../libs/shared/types/src/index.ts'),
      '@librarydock/shared-utils': resolve(__dirname, '../../libs/shared/utils/src/index.ts'),
      '@librarydock/ui': resolve(__dirname, '../../libs/ui/src/index.ts'),
    },
  },
  server: {
    port: parseInt(process.env.DEV_PORT || '4200'),
    host: process.env.DEV_HOST || 'localhost',
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:5656',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
