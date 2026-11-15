import { Hono } from 'hono';
import { createDb } from '@fork-lens/db';
import { sql } from 'drizzle-orm';

const app = new Hono<{ Bindings: Env }>();
app.get('/api/health', (c) => c.json({ status: 'ok' as const }));
app.get('/api/ready', async (c) => {
  await createDb(c.env.DB).get(sql`select 1`);
  return c.json({ status: 'ok' as const });
});
app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((error, c) => {
  console.error(error);
  return c.json({ error: 'Internal server error' }, 500);
});
export default app;
