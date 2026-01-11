import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/CardGames/dog-care-tracker/',
  build: {
    outDir: 'dist',
  },
});