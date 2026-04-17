import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;
        return transformWithEsbuild(code, id.replace(/\.js$/, '.jsx'), {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react(),
    cesium(),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
});
