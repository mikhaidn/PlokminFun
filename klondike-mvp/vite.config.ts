import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type UserConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'child_process';

// Get git commit hash and build timestamp
const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
const buildDate = new Date().toISOString().split('T')[0];
const buildVersion = `${buildDate}-${gitHash}`;

// https://vite.dev/config/
export default defineConfig({
  base: '/PlokminFun/klondike/',
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
    __GIT_HASH__: JSON.stringify(gitHash),
  },
  resolve: {
    preserveSymlinks: true, // This tells Vite to follow the symlinks NPM created
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
        name: 'Klondike Solitaire',
        short_name: 'Klondike',
        description: 'Classic Klondike Solitaire game - playable offline',
        theme_color: '#1e40af',
        background_color: '#1e40af',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/PlokminFun/klondike/',
        start_url: '/PlokminFun/klondike/',
        icons: [
          {
            src: '/PlokminFun/klondike/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/PlokminFun/klondike/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
} as UserConfig);
