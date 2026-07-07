import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/engine/**/*.ts'],
      exclude: ['**/__tests__/**', '**/*.test.ts', 'src/engine/index.ts'],
    },
  },
});
