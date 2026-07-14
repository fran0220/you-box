# Dual-host deploy checklist (youbox + bwg)

Image registry: `ghcr.io/fran0220/you-box`

| Host | SSH / IP | App dir | Container | Domain | Local port |
| --- | --- | --- | --- | --- | --- |
| `youbox` | `youbox` / `160.187.1.155` | `/opt/you-box` | `new-api` | `https://you-box.com/` | `3000` |
| `bwg` | `bwg` | `/opt/origin-gateway` | `origin-gateway` | `https://api.origingame.dev/` | `127.0.0.1:9320` |

Both hosts keep **separate** Postgres / Redis / volumes / secrets.

## 0. One-time host registry login (if package is private)

On each host:

```bash
# Use a GitHub PAT with read:packages (or a deploy bot token)
echo "$GHCR_TOKEN" | docker login ghcr.io -u fran0220 --password-stdin
```

If the GHCR package is public, login is optional for pull.

## 1. Publish a version image

From a release commit on `main`:

```bash
# local
git checkout main && git pull
echo 'v0.1.7' > VERSION
git add VERSION
git commit -m "chore(release): bump VERSION to v0.1.7"
git tag v0.1.7
git push origin main
git push origin v0.1.7
```

GitHub Actions workflow `.github/workflows/ghcr-publish.yml` builds and pushes:

- `ghcr.io/fran0220/you-box:v0.1.7`
- `ghcr.io/fran0220/you-box:main`

Wait for the workflow to finish before deploying.

Manual rebuild of an existing tag:

```bash
gh workflow run ghcr-publish.yml -f tag=v0.1.7
```

## 2. Host `.env` (`BOXAI_IMAGE`)

### youbox `/opt/you-box/.env`

```bash
BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.7
PORT=3000
NODE_NAME=youbox-1
PRODUCT_ID=youbox
# optional: PRODUCT_PUBLIC_BASE_URL=https://you-box.com
FRONTEND_BASE_URL=https://you-box.com
# keep host-local secrets: POSTGRES_*, REDIS_PASSWORD, SESSION_SECRET
```

### bwg `/opt/origin-gateway/.env`

```bash
BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.7
PORT=9320
NODE_NAME=bwg-origin-gateway-1
PRODUCT_ID=origingame
# optional: PRODUCT_PUBLIC_BASE_URL=https://api.origingame.dev
FRONTEND_BASE_URL=https://api.origingame.dev
# keep host-local secrets: POSTGRES_*, REDIS_PASSWORD, SESSION_SECRET
```

Rules:

- Same image tag/digest on both hosts for a given release (runtime product via `PRODUCT_ID`).
- Different `SESSION_SECRET` / DB / Redis credentials per host.
- Never point both hosts at the same volume/DB unless intentionally multi-node.
- After deploy, smoke `curl -fsS http://127.0.0.1:<port>/api/status` and confirm `data.product.id` is `youbox` or `origingame`.

## 3. Deploy order

### A. youbox first

```bash
ssh youbox
cd /opt/you-box
# optional: git fetch && git checkout v0.1.7   # keep compose/scripts in sync
# ensure BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.7 in .env
docker compose pull new-api
docker compose up -d new-api
docker compose ps
curl -fsS http://127.0.0.1:3000/api/status
curl -fsSI https://you-box.com/api/status | head
```

Smoke:

- Admin login works
- Channel list loads
- One chat/completions request succeeds

### B. bwg second

```bash
ssh bwg
cd /opt/origin-gateway
# ensure BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.7 in .env
docker compose pull new-api
docker compose up -d new-api
docker compose ps
curl -fsS http://127.0.0.1:9320/api/status
curl -fsSI https://api.origingame.dev/api/status | head
```

## 4. DNS + Nginx / TLS (youbox)

Apex `you-box.com` → `160.187.1.155`. On youbox:

```bash
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx
# site: proxy you-box.com → 127.0.0.1:3000
certbot --nginx -d you-box.com

cd /opt/you-box
# FRONTEND_BASE_URL=https://you-box.com
docker compose up -d new-api
curl -fsSI https://you-box.com/api/status | head
```

## 5. Rollback

```bash
# set previous good tag in .env, e.g. BOXAI_IMAGE=ghcr.io/fran0220/you-box:v0.1.6
docker compose pull new-api
docker compose up -d new-api
```

Do **not** recreate postgres/redis volumes during rollback.

## 6. Emergency without registry

Build once on a capable machine (not bwg):

```bash
docker build -t boxai:v0.1.7 .
docker save boxai:v0.1.7 | gzip > boxai-v0.1.7.tar.gz
# scp to each host, docker load, set BOXAI_IMAGE=boxai:v0.1.7
```

## 7. What not to do

- Do not use `calciumion/new-api` for YouBox production.
- Do not routinely `docker compose build` on `bwg` (low memory).
- Do not share one DB between youbox and bwg by accident.
- Do not delete named volumes / `./data` during routine deploys.

## 8. Retired host: jpdata

`jpdata` is **no longer** a YouBox production target. Primary product traffic is on `youbox` (`https://you-box.com/`).

On the former host, YouBox was offlined by:

- `docker compose down` (no live containers)
- removing the Nginx `you-box.com` / `api.you-box.com` site
- deleting volume `you-box_pg_data`
- archiving `/opt/you-box` → `/opt/you-box.offlined-<timestamp>`

Other services on that machine (e.g. `origin-studio`, `origingame-assets`) are unrelated and stay up. Local SSH `Host jpdata` may remain for non-YouBox ops only.
