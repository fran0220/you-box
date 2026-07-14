# Deploy checklist — BWG only (you-box codebase)

> **Cutover 2026-07-15:** Dual-host deploy of **this** repository is **retired**.  
> - **BWG** (`api.origingame.dev`) remains the only production host for `fran0220/you-box`.  
> - **youbox** (`you-box.com` / `160.187.1.155`) now runs **BoxAI** from `fran0220/boxAI` (`ghcr.io/fran0220/boxai`). Do not deploy you-box images there.

Image registry for this repo: `ghcr.io/fran0220/you-box`

| Host | SSH / IP | App dir | Container | Domain | Local port | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `bwg` | `bwg` | `/opt/origin-gateway` | `origin-gateway` | `https://api.origingame.dev/` | `127.0.0.1:9320` | **Active (this repo)** |
| `youbox` | `youbox` / `160.187.1.155` | `/opt/boxAI` (BoxAI) | `sub2api` | `https://you-box.com/` | `127.0.0.1:8080` | **BoxAI — not you-box** |
| `youbox` (archive) | — | `/opt/you-box.offlined-*` | — | — | — | Offline archive + volume `you-box_pg_data` |

## BWG deploy (only production path for you-box)

### 0. Registry login (if package is private)

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u fran0220 --password-stdin
```

### 1. Publish a version image

From a release commit on `main` (see `.github/workflows/ghcr-publish.yml`):

```text
ghcr.io/fran0220/you-box:<git-tag>
ghcr.io/fran0220/you-box:main
```

### 2. Host `.env` on bwg `/opt/origin-gateway/.env`

```bash
BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.17   # pin a release tag
PORT=9320
NODE_NAME=bwg-origin-gateway-1
PRODUCT_ID=origingame
FRONTEND_BASE_URL=https://api.origingame.dev
# host-local secrets: POSTGRES_*, REDIS_PASSWORD, SESSION_SECRET
```

### 3. Roll out

```bash
ssh bwg
cd /opt/origin-gateway
# set BOXAI_IMAGE to the new tag
docker compose pull new-api
docker compose up -d new-api
docker compose ps
curl -fsS http://127.0.0.1:9320/api/status
# expect data.product.id == "origingame" when product profile is enabled
curl -fsSI https://api.origingame.dev/api/status | head
```

### 4. Rollback

```bash
# set previous good BOXAI_IMAGE tag in .env
docker compose pull new-api
docker compose up -d new-api
```

Do **not** recreate postgres/redis volumes during rollback.

## What not to do

- Do **not** deploy `ghcr.io/fran0220/you-box` to `youbox` / `you-box.com` (BoxAI owns that host).
- Do not use `calciumion/new-api` as the production image for this product.
- Do not routinely `docker compose build` on `bwg` (low memory).
- Do not delete named volumes / `./data` during routine deploys.

## Historical: youbox offlined from you-box (2026-07-15)

On `youbox`:

1. `cd /opt/you-box && docker compose down` (containers removed; volume `you-box_pg_data` **kept**)
2. Archived `/opt/you-box` → `/opt/you-box.offlined-20260715013721`
3. Deployed BoxAI under `/opt/boxAI` with `ghcr.io/fran0220/boxai:0.1.155-box.2`
4. Nginx `you-box.com` now proxies to `127.0.0.1:8080`

BoxAI ops: repository `fran0220/boxAI`, docs under that repo (`AGENTS.md`, `docs/agents/deploy-release.md`).

## Retired host: jpdata

`jpdata` remains retired for YouBox product traffic. See previous archive notes if needed.
