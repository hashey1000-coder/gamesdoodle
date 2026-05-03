import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' ws: wss: https:; frame-src 'self' https:; media-src 'self' data: https:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only split in client build (SSR externalizes these)
          if (id.includes('node_modules/react-dom')) return 'react-vendor';
          if (id.includes('node_modules/react-router')) return 'react-vendor';
          if (id.includes('src/data/games.js')) return 'games-data';
        },
      },
    },
  },
})
