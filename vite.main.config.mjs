import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
      // also explicitly mark the following as externals:
    build: {
    rollupOptions: {
        external: ['usb', 'escpos-usb']
    }
}
});