import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@plokmin/shared': path.resolve(__dirname, '../shared/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/engine/**/*.ts', 'src/input/**/*.ts'],
      exclude: ['**/__tests__/**', '**/*.test.ts', 'src/engine/index.ts'],
    },
  },
});
