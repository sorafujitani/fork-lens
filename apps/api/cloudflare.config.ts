import { bindings, defineConfig } from 'cf/config';

export default defineConfig({
  worker: {
    name: 'fork-lens-api',
    compatibilityDate: '2026-11-13',
    compatibilityFlags: ['nodejs_compat'],
    entrypoint: 'src/index.ts',
    workersDev: false,
    previewUrls: false,
    observability: {
      enabled: true,
    },
    env: {
      DB: bindings.d1({
        name: 'fork-lens',
        id: '11111111-1111-4111-8111-111111111111',
      }),
      AI: bindings.ai({}),
    },
  },
});
