import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: Root,
  notFoundComponent: () => <p className="py-12">Página não encontrada.</p>,
});

function Root() {
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-8">
      <header className="flex items-center justify-between border-b border-slate-200 pb-6">
        <Link to="/" className="text-xl font-semibold">
          Portfolio
        </Link>
        <nav className="flex gap-6" aria-label="Navegação principal">
          <Link
            to="/"
            activeProps={{ className: "text-indigo-600" }}
            activeOptions={{ exact: true }}
          >
            Início
          </Link>
          <Link to="/about" activeProps={{ className: "text-indigo-600" }}>
            Sobre
          </Link>
        </nav>
      </header>
      <main className="py-16">
        <Outlet />
      </main>
    </div>
  );
}
