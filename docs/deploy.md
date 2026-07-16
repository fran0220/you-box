# Deploy checklist — Origin Gateway (BWG only)

> **Production product:** Origin Gateway (`PRODUCT_ID=origingame`)  
> **Host:** BWG → `https://api.origingame.dev`  
> **Do not** deploy this image to `you-box.com` (that host runs BoxAI from `fran0220/boxAI`).  
> OriginGame platform (portal/play/Studio) is a separate monorepo; it consumes this gateway over HTTP. See `docs/origingame-platform.md` and `docs/origingame-contract.md`.

| Host | App dir | Container | Domain | Listen | Status |
| --- | --- | --- | --- | --- | --- |
| `bwg` | `/opt/origin-gateway` | `origin-gateway` | `https://api.origingame.dev/` | `127.0.0.1:9320` | **Active** |

## Image names

```text
ghcr.io/fran0220/origin-gateway:<git-tag>   # preferred
ghcr.io/fran0220/origin-gateway:main
ghcr.io/fran0220/you-box:<git-tag>          # legacy alias (same digest; migrate .env off this)
```

Local default: `origin-gateway:local` via `GATEWAY_IMAGE`.

## BWG deploy

### 0. Registry login (if package is private)

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u fran0220 --password-stdin
```

### 1. Publish a version image

```bash
docker buildx build \
  --platform linux/amd64 \
  -t ghcr.io/fran0220/origin-gateway:v0.1.17 \
  -t ghcr.io/fran0220/origin-gateway:main \
  -t ghcr.io/fran0220/you-box:v0.1.17 \
  -t ghcr.io/fran0220/you-box:main \
  --push \
  .
```

Or use `.github/workflows/ghcr-publish.yml` on tag `v*`.

### 2. Host `.env` on bwg `/opt/origin-gateway/.env`

```bash
GATEWAY_IMAGE=ghcr.io/fran0220/origin-gateway:v0.1.17
# Temporary fallback if host still uses old var name:
# BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.17
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
docker compose pull new-api   # service key may still be new-api in host compose
docker compose up -d new-api
docker compose ps
curl -fsS http://127.0.0.1:9320/api/status | jq .data.product
# expect: id == "origingame", display_name == "Origin Gateway"
```

### Hard rules

1. **Never** delete/recreate persistent volumes during routine deploys.
2. Keep `SESSION_SECRET`, DB password, Redis password, and `NODE_NAME` stable.
3. Production `PRODUCT_ID=origingame` (repo default is already origingame).
4. Do **not** deploy this image to the BoxAI host.
5. Prefer **pulling** prebuilt images on BWG (memory-constrained).

## Local development

```bash
docker compose build new-api
docker compose up -d
# default image: origin-gateway:local
```

Optional Circuit demo skin: `PRODUCT_ID=youbox` in `.env` (not production).

## Smoke after deploy

```bash
curl -fsS https://api.origingame.dev/api/status | jq .data.product
curl -i https://api.origingame.dev/v1/models   # expect 401 without key
# Plus one authenticated Studio chat completion when changing relay paths
```

Historical dual-host notes lived in `docs/deploy-dual-host.md` (stub → this file).
