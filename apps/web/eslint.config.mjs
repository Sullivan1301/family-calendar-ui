import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    // next/typescript enregistre le plugin @typescript-eslint, sans quoi les
    // règles @typescript-eslint/* ci-dessous font échouer ESLint au démarrage.
    extends: ['next/core-web-vitals', 'next/typescript'],
    plugins: ['import'],
  }),
  {
    ignores: ['.next/**', 'node_modules/**', 'src/lib/drizzle/migrations/**'],
  },
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-absolute-path': 'error',
      'import/no-cycle': 'error',
    },
  },
]

export default eslintConfig
