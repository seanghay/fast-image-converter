import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      '@jsquash/png',
      '@jsquash/jpeg',
      '@jsquash/webp',
      '@jsquash/avif',
      // '@saschazar/wasm-heif'
    ]
  },
  define: {
    BUILD_TIMESTAMP: JSON.stringify(new Date().toISOString())
  }
});
