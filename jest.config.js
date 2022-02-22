// eslint-disable-next-line
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  testMatch: ['**/__tests__/**/*.test.(js|ts)'],
  coverageDirectory: './coverage',
  coverageReporters: ['html'],
};
