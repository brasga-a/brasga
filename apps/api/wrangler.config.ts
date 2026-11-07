import { defineWranglerConfig } from "wrangler/experimental-config";

export default defineWranglerConfig({
  build: {
    command: "uv run --package portfolio-api pywrangler sync",
  },
  dev: { ip: "127.0.0.1", port: 8000 },
  types: { generate: false },
});
