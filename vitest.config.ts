import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
      },
    },
  },
})
