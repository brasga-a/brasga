import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import worker from "../worker/index";

afterEach(() => vi.restoreAllMocks());

describe("API proxy", () => {
  it("returns JSON 503 when the API origin is missing", async () => {
    const response = await worker.fetch(new Request("https://portfolio.example/api/health"), {
      API_ORIGIN: "",
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ detail: "API_ORIGIN não configurada" });
  });

  it("preserves the path, query, method and body when forwarding to FastAPI", async () => {
    const upstream = new Response('{"status":"ok"}', {
      headers: { "content-type": "application/json" },
    });
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(upstream);
    const request = new Request("https://portfolio.example/api/projects?draft=true", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{"title":"Portfolio"}',
    });

    const response = await worker.fetch(request, { API_ORIGIN: "https://api.example.com" });
    const forwarded = fetch.mock.calls[0]![0];
    expect(forwarded).toBeInstanceOf(Request);
    if (!(forwarded instanceof Request)) throw new Error("Expected a Request");
    expect(forwarded.url).toBe("https://api.example.com/api/projects?draft=true");
    expect(forwarded.method).toBe("POST");
    expect(forwarded.headers.get("content-type")).toBe("application/json");
    expect(await forwarded.json()).toEqual({ title: "Portfolio" });
    expect(response).toBe(upstream);
  });
});
