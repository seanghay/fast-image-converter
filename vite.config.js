import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        maximumFileSizeToCacheInBytes: 5097152,
      },
      includeAssets: ['favicon.ico', 'apple-icon.png', 'masked-icon.svg'], 
      manifest: {
        name: 'Floo',
        short_name: 'Floo',
        description: 'Fast Image Converter',
        theme_color: '#3CB371',
        icons: [
          {
            "src": "\/android-icon-36x36.png",
            "sizes": "36x36",
            "type": "image\/png",
            "density": "0.75"
          },
          {
            "src": "\/android-icon-48x48.png",
            "sizes": "48x48",
            "type": "image\/png",
            "density": "1.0"
          },
          {
            "src": "\/android-icon-72x72.png",
            "sizes": "72x72",
            "type": "image\/png",
            "density": "1.5"
          },
          {
            "src": "\/android-icon-96x96.png",
            "sizes": "96x96",
            "type": "image\/png",
            "density": "2.0"
          },
          {
            "src": "\/android-icon-144x144.png",
            "sizes": "144x144",
            "type": "image\/png",
            "density": "3.0"
          },
          {
            "src": "\/android-icon-192x192.png",
            "sizes": "192x192",
            "type": "image\/png",
            "density": "4.0"
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: [
      '@jsquash/png',
      '@jsquash/jpeg',
      '@jsquash/webp',
      '@jsquash/avif',
      '@resvg/resvg-wasm'
      // '@saschazar/wasm-heif'
    ]
  },
  define: {
    BUILD_TIMESTAMP: JSON.stringify(new Date().toISOString()),
  }
});
