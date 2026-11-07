import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [apiStatus, setApiStatus] = useState("Conectando à API…");

  useEffect(() => {
    const controller = new AbortController();
    async function checkApi() {
      try {
        const response = await fetch("/api/health", { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: { status?: string } = await response.json();
        if (data.status !== "ok") throw new Error("Resposta inesperada");
        setApiStatus("API conectada");
      } catch {
        if (!controller.signal.aborted) setApiStatus("API indisponível");
      }
    }
    void checkApi();
    return () => controller.abort();
  }, []);

  return (
    <section className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Portfolio</h1>
      <p className="text-lg text-slate-600">Bem-vindo ao meu portfolio.</p>
      <p
        role="status"
        className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
      >
        {apiStatus}
      </p>
    </section>
  );
}
