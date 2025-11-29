import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // KRİTİK AYAR: sodium-universal ne isterse istesin, ona sodium-javascript veriyoruz.
      'sodium-native': 'sodium-javascript',
      'sodium-javascript': 'sodium-javascript',
    },
  },
  optimizeDeps: {
    // Vite'a bu paketleri önceden hazırlamasını söylüyoruz
    include: ['sodium-javascript', 'sodium-universal', '@tetherto/wdk', '@tetherto/wdk-wallet-evm'],
  },
})