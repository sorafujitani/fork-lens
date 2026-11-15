import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite-plus';
export default defineConfig({
  plugins: process.env.VITEST ? [] : [cloudflare({ remoteBindings: false, inspectorPort: false })],
  server: { host: '127.0.0.1', port: 8787, strictPort: true },
  test: { include: ['test/**/*.test.ts'], testTimeout: 15000, hookTimeout: 30000 },
});
