import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/PlokminFun/pet-care/',
  build: {
    outDir: 'dist',
  },
});
