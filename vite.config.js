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
    {
      // vite-plugin-cesium puts <script src="/cesium/Cesium.js"> (5.7 MB raw, ~1.6 MB gz) in <head>
      // without defer, so every page waited for Cesium before first paint even if 3D never opens.
      // defer keeps document order (Cesium before the module bundle), so window.Cesium is ready.
      name: 'defer-cesium-script',
      enforce: 'post',
      transformIndexHtml(html) {
        return html.replace('<script src="/cesium/Cesium.js"></script>', '<script defer src="/cesium/Cesium.js"></script>');
      },
    },
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
});
