import { defineConfig } from 'vite-plus';
export default defineConfig({
  lint: {
    plugins: ['typescript', 'react'],
    ignorePatterns: [
      '**/dist/**',
      '**/.cloudflare/**',
      '**/worker-configuration.d.ts',
      '**/drizzle/meta/**',
    ],
  },
  fmt: {
    singleQuote: true,
    ignorePatterns: [
      '**/dist/**',
      '**/.cloudflare/**',
      '**/worker-configuration.d.ts',
      '**/drizzle/**',
      'bun.lock',
      'flake.lock',
    ],
  },
});
