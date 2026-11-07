# Portfolio

Monorepo com Vite+ no frontend e FastAPI no backend.

```text
apps/
  web/                  # React + Vite + TanStack Router + Tailwind CSS
  api/
    src/portfolio_api/  # Aplicação FastAPI
    tests/              # Testes com pytest e TestClient
packages/
  utils/                # Biblioteca TypeScript compartilhada
```

O Vite+ gerencia os workspaces JavaScript e executa os comandos de todos os
serviços. O uv gerencia o workspace Python, com `uv.lock` e `.venv` na raiz.
O `package.json` da API apenas integra seus comandos ao Vite+; as dependências
Python ficam em `apps/api/pyproject.toml`.

## Instalação

Requisitos: Vite+ (`vp`), Node.js >=22.18, uv e Python >=3.11 (versão fixada
em `.python-version`). O Vite+ gerencia a versão do Bun definida no projeto.

```bash
vp run setup
```

Esse comando executa `vp install` e `uv sync --all-packages`, incluindo as
dependências de desenvolvimento. Versione `bun.lock` e `uv.lock`.

## Desenvolvimento

Execute na raiz:

```bash
vp run dev
```

- Frontend: http://127.0.0.1:5173
- API: http://127.0.0.1:8000/api/health
- Swagger: http://127.0.0.1:8000/docs
- OpenAPI: http://127.0.0.1:8000/openapi.json

Os dois serviços têm recarregamento automático. O frontend usa URLs relativas
como `fetch("/api/health")`; o Worker do web encaminha `/api` para o FastAPI
em `http://127.0.0.1:8000`, preservando o caminho. Assim, o desenvolvimento usa a mesma origem sem precisar
configurar CORS. A página inicial mostra o resultado dessa conexão.

Para iniciar um serviço individualmente:

```bash
vp run dev:web
vp run dev:api
```

Use `vp run dev`: `vp dev` é o comando nativo do Vite e não inicia a API.

## Validação e build

```bash
vp run check  # Tipos do Worker, TypeScript, formatação, lint e Ruff
vp run test   # Vitest nos pacotes e pytest na API
vp run build  # Frontend, biblioteca e pacote Python (wheel/sdist)
vp run ready  # Todas as verificações acima
```

`vp check` e `vp test` executam apenas as ferramentas JS/TS nativas; os scripts
acima também incluem o backend.

Para adicionar dependências Python:

```bash
uv add --package portfolio-api nome-do-pacote
uv add --package portfolio-api --dev nome-da-ferramenta
```

## Frontend

O web usa React e TanStack Router com rotas por arquivos em `apps/web/src/routes`:

- `__root.tsx`: layout compartilhado e navegação.
- `index.tsx`: rota `/`, com indicador de conexão à API.
- `about.tsx`: rota `/about`.

O plugin do TanStack gera `src/routeTree.gen.ts` durante dev/build. Esse arquivo
é versionado e excluído da formatação e do lint. Para criar outra página,
adicione um arquivo em `src/routes`. O Tailwind CSS está integrado pelo plugin
`@tailwindcss/vite`, com importação em `src/style.css`.

## Cloudflare com cf

O web está configurado como um Worker com Static Assets e fallback de SPA para
acesso direto às rotas do TanStack Router. A configuração fica em
`apps/web/cloudflare.config.ts`, com logs e traces habilitados. O CLI `cf` e o
plugin Cloudflare Vite 2 estão instalados no workspace web; ambos usam versões
beta exigidas atualmente pelo fluxo de configuração do cf.

`vp run dev:web` executa `cf dev`. `vp run web#build` executa `cf build` e a
checagem TypeScript. O build fica em `apps/web/.cloudflare/output/v0/`, e os
tipos do runtime são gerados em `apps/web/.cloudflare/types/`. Esses diretórios
são gerados e ignorados pelo Git. Para regenerar os tipos manualmente:

```bash
vp run web#types
```

Para validar o deploy sem publicar:

```bash
vp run deploy:check
```

Para publicar o Worker `portfolio-web`, autentique o CLI e informe a origem
HTTPS onde a API FastAPI está hospedada:

```bash
cf auth login
API_ORIGIN=https://sua-api.example.com vp run deploy
```

Em CI, use `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` no ambiente. O script
faz o build e publica o resultado com `cf deploy --prebuilt --mode production`.
`API_ORIGIN` é lida do ambiente no build e gravada como binding de texto do
Worker. O arquivo `.env.example` documenta o valor; exporte a variável no shell
ou configure-a no ambiente de build. Não use o endereço de exemplo no deploy.

O Worker encaminha `/api/*` à origem configurada, preservando método, corpo,
caminho e query. Sem `API_ORIGIN` em produção, essas chamadas retornam JSON
com status 503. Em desenvolvimento, a origem padrão é `http://127.0.0.1:8000`.
A origem da API deve apontar para o backend, não para o próprio web.

A configuração Cloudflare deste projeto cobre o **web**. A API continua como
serviço Python/Uvicorn e precisa estar acessível na origem informada. Para
executar FastAPI dentro da Cloudflare, é necessária uma adaptação adicional
para Python Workers ou Containers.

## API em produção

Os pacotes Python ficam em `apps/api/dist`. Para iniciar a API sem reload:

```bash
vp run api#start
```

Para inspecionar o build do web localmente, use `vp run web#preview`.
A API pode ser iniciada separadamente com o comando acima.

Referências: [workspace uv](https://docs.astral.sh/uv/concepts/projects/workspaces/),
[FastAPI](https://fastapi.tiangolo.com/tutorial/first-steps/) e
[testes FastAPI](https://fastapi.tiangolo.com/tutorial/testing/).

Referências do frontend e deploy: [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/installation/with-vite),
[Tailwind com Vite](https://tailwindcss.com/docs/installation/using-vite) e
[desenvolver e publicar com cf](https://developers.cloudflare.com/cf/projects/).
