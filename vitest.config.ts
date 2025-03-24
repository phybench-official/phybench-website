import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mjs,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', 'coverage/'],
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    deps: {
      optimizer: {
        web: {
          exclude: ['next/server'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});