import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),

    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('/redux/')) {
              return 'vendor-redux';
            }
            if (id.includes('react-bootstrap') || id.includes('/bootstrap/')) {
              return 'vendor-bootstrap';
            }
            if (id.includes('react-select')) {
              return 'vendor-select';
            }
            if (id.includes('swiper')) {
              return 'vendor-swiper';
            }
            if (id.includes('react-toastify')) {
              return 'vendor-toast';
            }
            
          }
        },
      },
    },
  },
});