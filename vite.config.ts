import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001/api'),
    'import.meta.env.VITE_ADSENSE_CLIENT_ID': JSON.stringify(process.env.VITE_ADSENSE_CLIENT_ID || ''),
    'import.meta.env.VITE_ADSENSE_SLOT_HEADER': JSON.stringify(process.env.VITE_ADSENSE_SLOT_HEADER || ''),
    'import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR': JSON.stringify(process.env.VITE_ADSENSE_SLOT_SIDEBAR || ''),
    'import.meta.env.VITE_ADSENSE_SLOT_FOOTER': JSON.stringify(process.env.VITE_ADSENSE_SLOT_FOOTER || ''),
    'import.meta.env.VITE_ADSENSE_SLOT_ARTICLE': JSON.stringify(process.env.VITE_ADSENSE_SLOT_ARTICLE || ''),
  },
});