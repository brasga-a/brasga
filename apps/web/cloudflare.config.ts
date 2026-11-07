import { bindings, defineConfig } from "cf/config";

export default defineConfig(({ mode }) => ({
  worker: {
    name: "portfolio-web",
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-11-07",
    domains: ["brasga.com"],
    assets: {
      notFoundHandling: "single-page-application",
      runWorkerFirst: ["/api/*"],
    },
    env: {
      API_ORIGIN: bindings.text(
        process.env.API_ORIGIN ??
          (mode === "development" ? "http://127.0.0.1:8000" : "https://api.brasga.com"),
      ),
    },
    observability: {
      enabled: true,
      logs: { enabled: true },
      traces: { enabled: true, headSamplingRate: 0.01 },
    },
  },
}));
