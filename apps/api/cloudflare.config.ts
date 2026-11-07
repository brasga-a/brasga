import { readFileSync } from "node:fs";
import { defineConfig } from "cf/config";
import { parse, type ParseError } from "jsonc-parser";

// pywrangler sync reads this metadata to select the matching Pyodide runtime.
const errors: ParseError[] = [];
const runtime: { compatibility_date: string; compatibility_flags: string[] } = parse(
  readFileSync(new URL("./wrangler.jsonc", import.meta.url), "utf8"),
  errors,
  { allowTrailingComma: true },
);
if (errors.length) throw new Error("Invalid Python runtime metadata in wrangler.jsonc");

export default defineConfig({
  worker: {
    name: "portfolio-api",
    entrypoint: "./src/worker.py",
    compatibilityDate: runtime.compatibility_date,
    compatibilityFlags: runtime.compatibility_flags,
    domains: ["api.brasga.com"],
    observability: {
      enabled: true,
      logs: { enabled: true },
      traces: { enabled: true, headSamplingRate: 0.01 },
    },
  },
});
