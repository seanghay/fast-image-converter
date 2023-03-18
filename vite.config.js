import wasm from "vite-plugin-wasm";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import topLevelAwait from "vite-plugin-top-level-await";
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      '@jsquash/png',
      '@jsquash/jpeg',
      '@jsquash/webp',
      '@jsquash/avif',
    ]
  }
});
