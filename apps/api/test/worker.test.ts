import { readFile, readdir } from 'node:fs/promises';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';

let worker: Miniflare;
beforeAll(async () => {
  worker = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      scriptPath: '.cloudflare/output/v0/workers/default/bundle/index.js',
      compatibilityDate: '2026-11-13',
      compatibilityFlags: ['nodejs_compat'],
      d1Databases: ['DB'],
    }),
  );
  const db = await worker.getD1Database('DB');
  const directory = '../../packages/db/drizzle';
  for (const file of (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort()) {
    const sql = await readFile(`${directory}/${file}`, 'utf8');
    for (const statement of sql.split('--> statement-breakpoint').filter((value) => value.trim())) {
      await db.prepare(statement).run();
    }
  }
});
afterAll(async () => {
  await worker?.dispose();
});
it('queries D1 from the built Worker', async () => {
  const response = await worker.dispatchFetch('https://example.com/api/ready');
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok' });
});
it('applies the repository schema and enforces unique names', async () => {
  const db = await worker.getD1Database('DB');
  await db
    .prepare('INSERT INTO repositories (id, full_name) VALUES (?, ?)')
    .bind(1, 'example/repo')
    .run();
  await expect(
    db
      .prepare('INSERT INTO repositories (id, full_name) VALUES (?, ?)')
      .bind(2, 'example/repo')
      .run(),
  ).rejects.toThrow();
});
it('returns JSON 404 for unknown API routes', async () => {
  const response = await worker.dispatchFetch('https://example.com/api/missing');
  expect(response.status).toBe(404);
  expect(await response.json()).toEqual({ error: 'Not found' });
});
