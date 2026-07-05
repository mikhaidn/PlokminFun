/// <reference types="vitest" />
import { defineConfig, type UserConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/PlokminFun/js-repl/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'JavaScript Playground',
        short_name: 'JS Playground',
        description: 'Run JavaScript instantly in your browser — offline-capable REPL',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/PlokminFun/js-repl/',
        start_url: '/PlokminFun/js-repl/',
        icons: [
          {
            src: '/PlokminFun/js-repl/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/PlokminFun/js-repl/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
} as UserConfig);
