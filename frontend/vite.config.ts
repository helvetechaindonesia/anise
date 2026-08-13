import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Anise Presensi',
        short_name: 'Anise',
        id: '/',
        start_url: '/',
        description: 'Sistem Presensi Digital Anise',
        theme_color: '#1a414d',
        background_color: '#1a414d',
        display: 'standalone',
        icons: [
          {
            src: '/assets/pwa-192x192.png?v=3',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/assets/pwa-512x512.png?v=3',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/assets/pwa-192x192.png?v=3',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/assets/pwa-512x512.png?v=3',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  server: {
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': 'http://backend:8000'
    }
  }
})
