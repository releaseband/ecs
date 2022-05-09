export default {
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  coverageDirectory: './coverage',
  coverageReporters: ['html'],
};
