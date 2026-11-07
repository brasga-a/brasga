import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <section className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Sobre</h1>
      <p className="text-lg text-slate-600">
        Um espaço para apresentar minha trajetória e meus projetos.
      </p>
    </section>
  );
}
