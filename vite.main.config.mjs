import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  optimizeDeps: {
    exclude: ['escpos-usb']
  },
  build: {
    rollupOptions: {
      external: ['usb', 'escpos-usb']
    }
  }
});
