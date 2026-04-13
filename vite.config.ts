import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react({
      // Prevent @vitejs/plugin-react from picking up babel.config.js
      // (that file is intended for Jest only), which causes a Babel version
      // mismatch and the "allowDirectives is not defined" runtime error.
      babel: { configFile: false, babelrc: false },
    }),
    tailwindcss(),
    // PWA plugin disabled temporarily due to build errors on Windows
    // VitePWA({...}),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})
