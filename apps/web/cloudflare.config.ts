import { bindings, defineConfig } from 'cf/config';

export default defineConfig({
  worker: {
    name: 'fork-lens-web',
    compatibilityDate: '2026-11-13',
    entrypoint: 'worker/index.ts',
    observability: {
      enabled: true,
    },
    assets: {
      notFoundHandling: 'single-page-application',
      runWorkerFirst: ['/api/*'],
    },
    env: {
      API: bindings.worker({
        worker: 'fork-lens-api',
      }),
      ASSETS: bindings.assets(),
    },
  },
});
