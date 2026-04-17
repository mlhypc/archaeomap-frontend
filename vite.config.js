import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [
    react({ include: /\.(jsx|js|tsx|ts)$/ }),
    cesium(),
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
});
