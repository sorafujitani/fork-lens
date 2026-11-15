import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite-plus';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [
    react(),
    ...(process.env.VITEST ? [] : [cloudflare({ remoteBindings: false, inspectorPort: false })]),
  ],
  server: { port: 5173, strictPort: true },
  test: { include: ['test/**/*.test.ts'] },
});
