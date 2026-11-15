export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/api/')) {
      try {
        return await env.API.fetch(request);
      } catch (error) {
        console.error(error);
        return Response.json({ error: 'API unavailable' }, { status: 502 });
      }
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
