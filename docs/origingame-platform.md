# OriginGame platform (consumer of this gateway)

> How this repository relates to the OriginGame product monorepo.  
> Production deploy for this code: BWG only — see `AGENTS.md` and `docs/deploy.md`.  
> Runtime skins: `docs/product-profile.md`. Frozen HTTP: `docs/origingame-contract.md`.

## Boundary

| Role | Repository | License | Production host |
|---|---|---|---|
| **Origin Gateway** (this codebase) | `fran0220/you-box` (brand: Origin Gateway; image `origin-gateway`) | AGPL-3.0 | **bwg** `/opt/origin-gateway` → `https://api.origingame.dev` |
| **OriginGame platform** (portal, play, assets, Studio) | `origingame` monorepo (local typical: `/Users/fan/origingame`) | Not this tree | **oracle** → portal family via edge proxy |

This repo does **not** ship portal, play, game deploy, Kenney assets, or Studio. Those stay in OriginGame and call this gateway over HTTP.

OriginGame normative doc (consumer side): `docs/origin-gateway.md` in the OriginGame repo.

## Production product id

```bash
PRODUCT_ID=origingame
FRONTEND_BASE_URL=https://api.origingame.dev
```

Image (preferred): `ghcr.io/fran0220/origin-gateway:<git-tag>` (legacy alias `ghcr.io/fran0220/you-box` still published).

`you-box.com` is **not** a deploy target for this repository (BoxAI owns that host). Runtime `PRODUCT_ID=youbox` is local Circuit demo only; production is **BWG + origingame** only.

## How OriginGame reaches us

```text
Browser / agents  →  https://origingame.dev/gw/{api,v1}/*   (short; OriginGame proxies)
Studio long SSE   →  https://api.origingame.dev/{api,v1}/*  (direct to this stack)
OriginGame server →  GATEWAY_ORIGIN  (same APIs; server-side)
```

| Path on this process | Used for |
|---|---|
| `/v1/*` | OpenAI-compatible relay (models, chat, images, audio, …) |
| `/api/*` | Account, tokens, dashboard, agent-auth seams |

Breaking changes to auth headers, `sk-` validation, quota errors, or CORS for `origingame.dev` / Studio clients require coordinated checks against OriginGame:

```bash
curl -i https://api.origingame.dev/v1/models          # expect 401 without key
curl -i https://origingame.dev/gw/v1/models           # portal proxy → this stack
# Plus one authenticated Studio or script chat completion when changing relay paths
```

## Do not

- Merge OriginGame app source into this repo as a substitute for HTTP contracts.
- Expect OriginGame to vendor this AGPL tree; consumers integrate by URL only.
- Deploy this image to `you-box.com` (retired for this codebase).
- Point OriginGame long Studio SSE at portal `/gw` as the primary path (they use `api.origingame.dev`).

## Related docs in this repo

| Doc | Topic |
|---|---|
| `AGENTS.md` | Repo conventions, BWG-only production |
| `docs/product-profile.md` | `PRODUCT_ID` skins (youbox / origingame) |
| `docs/deploy.md` | Deploy checklist (BWG-only) |
| `docs/origingame-contract.md` | Frozen OriginGame HTTP surface |
| `docs/contracts/*.json` | Agent auth / models contracts |
