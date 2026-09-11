/// <reference types="vitest" />
import { defineConfig, type UserConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/PlokminFun/peer-doc/',
  test: {
    environment: 'jsdom',
  },
} as UserConfig);
