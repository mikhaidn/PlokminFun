import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type UserConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/PlokminFun/sixballmonty/',
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@plokmin/shared': path.resolve(__dirname, '../shared/index.ts'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: '6 Ball Monty',
        short_name: '6BallMonty',
        description: 'Falling-ball chain puzzle - drop, match, and chain. Playable offline.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/PlokminFun/sixballmonty/',
        start_url: '/PlokminFun/sixballmonty/',
        icons: [
          {
            src: '/PlokminFun/sixballmonty/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/PlokminFun/sixballmonty/icon-512.png',
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
} as UserConfig);
