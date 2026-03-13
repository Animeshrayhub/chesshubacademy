import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // react-hooks/set-state-in-effect is part of the React Compiler ruleset (v7).
      // This project does not use the React Compiler, so async loadData() calls inside
      // effects are correctly async and do not cause synchronous cascading renders.
      'react-hooks/set-state-in-effect': 'off',
        // The following rules are from the React Compiler lint ruleset bundled in
        // eslint-plugin-react-hooks v7. They are disabled here because this project
        // does not use the React Compiler (no babel-plugin-react-compiler).
        'react-hooks/purity': 'off',
        'react-hooks/immutability': 'off',
    },
  },
])
