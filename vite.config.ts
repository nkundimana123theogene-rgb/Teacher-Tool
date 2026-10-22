import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf') || id.includes('pdf-lib') || id.includes('html2pdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (id.includes('pptxgenjs')) return 'vendor-pptx';
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    watch: {
      ignored: ['**/nkorera_local_backup.json', '**/node_modules/**']
    }
  },
});