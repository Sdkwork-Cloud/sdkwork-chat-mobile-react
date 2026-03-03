// Simple ESLint config for ESLint v9
// This is a minimal configuration that disables all rules
// to prevent errors from missing dependencies

export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Disable all rules - this is a temporary solution
      // until proper ESLint dependencies are installed
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.cache/**',
      '**/coverage/**',
    ],
  },
];
