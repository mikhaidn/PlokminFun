import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/CardGames/light-vod-editor/',
  build: {
    outDir: 'dist',
  },
});
