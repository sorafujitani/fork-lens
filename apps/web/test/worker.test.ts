import { describe, expect, it, vi } from 'vite-plus/test';
import worker from '../worker';

describe('web worker', () => {
  it('forwards API requests without losing the method, body, or query', async () => {
    const api = vi.fn(async (request: Request) =>
      Response.json({ method: request.method, url: request.url, body: await request.text() }),
    );
    const env = { API: { fetch: api }, ASSETS: { fetch: vi.fn() } } as unknown as Env;
    const request = new Request('https://example.com/api/items?q=one', {
      method: 'POST',
      body: 'payload',
    });
    const response = await worker.fetch(request, env);
    expect(await response.json()).toEqual({ method: 'POST', url: request.url, body: 'payload' });
    expect(env.ASSETS.fetch).not.toHaveBeenCalled();
  });
  it('returns 502 when the API worker is unavailable', async () => {
    const env = {
      API: { fetch: vi.fn().mockRejectedValue(new Error('offline')) },
    } as unknown as Env;
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect((await worker.fetch(new Request('https://example.com/api/health'), env)).status).toBe(
        502,
      );
    } finally {
      log.mockRestore();
    }
  });
});
