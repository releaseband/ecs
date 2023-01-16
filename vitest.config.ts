import { defineConfig } from 'vitest/config';
// TODO: remove eslint jest plugins
export default defineConfig({
  test: {
    include: ['**/__tests__/*.spec.ts'],
    exclude: ['**/dist/**'],
    environment: 'node',
    teardownTimeout: 500,
  },
});
