# brasga.com

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

Para publicar o Worker `portfolio-web` em `brasga.com`, autentique o CLI:

```bash
cf auth login
vp run deploy
```

Em CI, use `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` no ambiente. O script
faz o build e publica o resultado com `cf deploy --prebuilt --mode production`.
`API_ORIGIN` usa `https://api.brasga.com` em produção e pode ser sobrescrita
pelo ambiente no build. O valor é gravado como binding de texto do Worker.
O arquivo `.env.example` documenta a configuração opcional.

O Worker encaminha `/api/*` à origem configurada, preservando método, corpo,
caminho e query. Se `API_ORIGIN` for explicitamente definida como vazia, essas chamadas retornam
JSON com status 503. Em desenvolvimento, a origem é `http://127.0.0.1:8000`.
A origem da API deve apontar para o backend, não para o próprio web.

## API na Cloudflare

A API FastAPI roda em Python Workers no Worker `portfolio-api`, com domínio
`api.brasga.com`. O adaptador ASGI fica em `apps/api/src/worker.py`; a aplicação
continua em `src/portfolio_api/main.py`, compartilhada com Uvicorn e os testes.

```bash
vp run dev:api:cloudflare  # Runtime Python Workers local na porta 8000
vp run deploy:api:check   # Build e dry-run sem publicar
vp run deploy:api         # Publica a API em api.brasga.com
```

A publicação usa o CLI `cf`. A API declara Wrangler como implementação de build,
com `wrangler.config.ts` executando `pywrangler sync` antes do build para preparar
as dependências compatíveis com Pyodide. `cloudflare.config.ts` define o Worker,
o domínio, logs e traces. O arquivo `wrangler.jsonc` contém apenas os metadados
de compatibilidade exigidos por `pywrangler sync`, e a configuração cf lê esse
mesmo arquivo para manter uma única definição da versão do runtime.

Versione `apps/api/pylock.toml`: ele fixa as dependências do runtime Pyodide;
`uv.lock` fixa as dependências locais. `python_modules/`, `.venv-workers/` e
`.cloudflare/` são gerados e ignorados pelo Git. A versão de Python Workers é
selecionada pela data de compatibilidade; ela é independente do Python local
fixado em `.python-version`. O uv necessário ao `workers-py` está declarado
nas dependências de desenvolvimento para não exigir atualização global.

Endpoints públicos após o deploy:

- https://api.brasga.com/api/health
- https://api.brasga.com/docs
- https://api.brasga.com/openapi.json

Para publicar os dois serviços, execute `vp run deploy:api` e depois
`vp run deploy`. O cf configura os Custom Domains e os registros DNS ao publicar.

## API com Uvicorn

Os pacotes Python ficam em `apps/api/dist`. Para executar fora da Cloudflare,
o extra `server` instala Uvicorn sem incluí-lo nas dependências do Worker:

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

Referência da API: [FastAPI em Python Workers](https://developers.cloudflare.com/workers/languages/python/packages/fastapi/).
