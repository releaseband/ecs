module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'airbnb/hooks',
    'airbnb-typescript',
    'plugin:prettier/recommended',
    'plugin:sonarjs/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:jest-formatting/recommended',
  ],
  plugins: ['simple-import-sort', 'sonarjs', 'tsdoc', 'jest', 'eslint-plugin-tsdoc'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    '@typescript-eslint/no-empty-interface': ['off'],
    'tsdoc/syntax': 'warn',
  },
  parserOptions: {
    project: './tsconfig.json',
  },
};
