import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Use relative base path so assets resolve correctly on GitHub Pages, Vercel, Netlify, or subpaths
  base: './',
  server: {
    port: 5173,
    host: true,
    allowedHosts: true
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        createCourse: resolve(__dirname, 'create-course.html'),
        login: resolve(__dirname, 'login.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  }
});
