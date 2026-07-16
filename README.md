<div align="center">

# Origin Gateway

**AI API gateway for OriginGame** — accounts, `sk-` keys, quota/billing, multi-provider relay, and admin console.

Production: **`https://api.origingame.dev`** · Image: **`ghcr.io/fran0220/origin-gateway`**

</div>

## What this is

This repository implements **Origin Gateway**: a unified OpenAI-compatible AI gateway used by the [OriginGame](https://origingame.dev) platform (portal, Studio, agents).

| Concern | Owner |
| --- | --- |
| Accounts, tokens, quota, top-up, relay `/v1/*` | **This repo** (Origin Gateway) |
| Portal, play, game deploy, Studio product | Separate monorepo (`origingame`) — HTTP consumer only |

License: **AGPL-3.0** (new-api lineage). OriginGame does **not** vendor this source.

> **Not BoxAI.** `you-box.com` runs a different product (`fran0220/boxAI`). Do not deploy Origin Gateway images there.

## Quick start (local)

```bash
cp .env.example .env   # set POSTGRES_PASSWORD, REDIS_PASSWORD, SESSION_SECRET
docker compose up -d --build
# http://localhost:3000
curl -fsS http://127.0.0.1:3000/api/status | jq .data.product
# expect id: "origingame", display_name: "Origin Gateway"
```

Default image: `origin-gateway:local` (`GATEWAY_IMAGE`).  
Default product: `PRODUCT_ID=origingame`. Optional local Circuit demo: `PRODUCT_ID=youbox`.

## Production (BWG only)

```text
ghcr.io/fran0220/origin-gateway:<git-tag>
PRODUCT_ID=origingame
NODE_NAME=bwg-origin-gateway-1
```

Full checklist: [`docs/deploy.md`](./docs/deploy.md)  
Consumer boundary: [`docs/origingame-platform.md`](./docs/origingame-platform.md)  
Frozen HTTP contract: [`docs/origingame-contract.md`](./docs/origingame-contract.md)  
Product / skin profile: [`docs/product-profile.md`](./docs/product-profile.md)

## Image publish

```bash
docker buildx build --platform linux/amd64 \
  -t ghcr.io/fran0220/origin-gateway:vX.Y.Z \
  -t ghcr.io/fran0220/origin-gateway:main \
  -t ghcr.io/fran0220/you-box:vX.Y.Z \   # legacy alias
  --push .
```

CI: `.github/workflows/ghcr-publish.yml`

## Stack

- **Backend:** Go, Gin, GORM (SQLite / MySQL / PostgreSQL)
- **Frontend:** React 19, TypeScript, Rsbuild, Tailwind (`web/default`)
- **Relay:** 40+ upstream channel adaptors under `relay/channel/`
- **Brand default:** Origin Gateway (Paper UI); optional `youbox` Circuit skin for local demos

## Agent / contributor rules

See [`AGENTS.md`](./AGENTS.md) and [`CLAUDE.md`](./CLAUDE.md).

## Local validation

```bash
go test ./product/ ./tests/contracts/ -count=1
go test ./... -count=1   # full backend
cd web && bun install --frozen-lockfile
cd default && bun run typecheck && bun run test
```

## License

AGPL-3.0 — see [LICENSE](./LICENSE).
