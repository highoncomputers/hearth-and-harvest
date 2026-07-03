import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 8192,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('node_modules/cannon-es/')) return 'cannon';
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: false,
  },
});
