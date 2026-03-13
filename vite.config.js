import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
