module.exports = {
  extends: [
    '@releaseband/eslint-config',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:jest-formatting/recommended',
  ],
  plugins: ['jest', 'eslint-plugin-tsdoc'],
  rules: {
    '@typescript-eslint/no-empty-interface': ['off'],
    'tsdoc/syntax': 'warn',
  },
  parserOptions: {
    project: './tsconfig.json',
  },
};
