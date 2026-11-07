export default {
  async fetch(request: Request, env: Cloudflare.Env) {
    if (!env.API_ORIGIN) {
      return Response.json({ detail: "API_ORIGIN não configurada" }, { status: 503 });
    }

    const url = new URL(request.url);
    const target = new URL(env.API_ORIGIN);
    target.pathname = url.pathname;
    target.search = url.search;
    return fetch(new Request(target, request));
  },
} satisfies ExportedHandler<Cloudflare.Env>;
