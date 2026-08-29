import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        // Resuelve la ambigüedad de rutas con distinto casing en Windows
        // (ej: "C:\\Users\\Jairo..." vs "C:\\Users\\jairo..."), fijando la raíz
        // del proyecto para el parser de TypeScript.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
