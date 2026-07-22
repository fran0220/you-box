# Deploy checklist — Origin Gateway (BWG only)

> **Production product:** Origin Gateway (`PRODUCT_ID=origingame`)
> **Host:** BWG → `https://api.origingame.dev`
> **Do not** deploy this application to `you-box.com`; that host runs BoxAI.
> OriginGame portal/play/Studio consume this gateway over HTTP. See
> `docs/origingame-platform.md` and `docs/origingame-contract.md`.

| Host | App dir | Service | Listen | Status |
| --- | --- | --- | --- | --- |
| `bwg` | `/opt/origin-gateway` | `origin-gateway.service` | `127.0.0.1:9320` | **Active** |

## Production deployment

Pushes to `main` use `.github/workflows/ci.yml`:

1. Install frontend dependencies and run typecheck, lint, tests, and build.
2. Run backend tests and golangci-lint.
3. Cross-compile one static `linux/amd64` binary with the frontend embedded.
4. Upload it directly to BWG over the dedicated GitHub Actions SSH key.
5. Atomically switch `/opt/origin-gateway/current` and restart systemd.
6. Require a healthy Origin Gateway status response or roll back the symlink.

There are no production image builds, registry pushes, release tags, or builds
on the memory-constrained BWG host.

Required GitHub repository configuration:

| Name | Type | Purpose |
| --- | --- | --- |
| `BWG_SSH_KEY` | Actions secret | Dedicated deployment private key |
| `BWG_KNOWN_HOSTS` | Actions secret | Pinned BWG SSH host key |
| `BWG_HOST` | Actions variable | BWG address |
| `BWG_USER` | Actions variable | Deployment SSH user |

## Host layout

```text
/opt/origin-gateway/
  current -> releases/<git-sha>/
  releases/<git-sha>/origin-gateway
  .env                 # stable production settings and secrets
  native.env           # loopback PostgreSQL/Redis connection strings
  data/
  logs/
```

PostgreSQL and Redis remain isolated containers with loopback-only host ports;
the gateway application itself runs as a native systemd service.

## Inspect or roll back

```bash
ssh bwg
systemctl status origin-gateway
readlink -f /opt/origin-gateway/current
curl -fsS http://127.0.0.1:9320/api/status | jq .data.product

# Manual rollback to an existing SHA:
ln -sfn /opt/origin-gateway/releases/<git-sha> /opt/origin-gateway/current.next
mv -Tf /opt/origin-gateway/current.next /opt/origin-gateway/current
systemctl restart origin-gateway
```

## Hard rules

1. **Never** delete or recreate persistent volumes during routine deploys.
2. Keep `SESSION_SECRET`, DB password, Redis password, and `NODE_NAME` stable.
3. Production `PRODUCT_ID=origingame`.
4. Do **not** deploy this application to the BoxAI host.
5. Never install the frontend/Go build toolchain or build source on BWG.

## Local development

Docker remains available for local development only:

```bash
docker compose build new-api
docker compose up -d
```

Optional Circuit demo skin: `PRODUCT_ID=youbox` in `.env` (not production).

## Smoke after deploy

```bash
curl -fsS https://api.origingame.dev/api/status | jq .data.product
curl -i https://api.origingame.dev/v1/models   # expect 401 without key
```
