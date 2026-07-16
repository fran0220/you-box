# OriginGame consumer contract (freeze list)

Normative HTTP surface that **OriginGame** (portal, Studio, agents) depends on.  
Breaking changes require coordinated verification against OriginGame.

Cross-repo docs:

- OriginGame: `docs/origin-gateway.md`
- This repo: `docs/origingame-platform.md`, `docs/deploy.md`

## Identity

| Item | Value |
| --- | --- |
| Product | Origin Gateway |
| `PRODUCT_ID` | `origingame` (default) |
| Public origin | `https://api.origingame.dev` |
| Image | `ghcr.io/fran0220/origin-gateway:<tag>` |

## Account & keys (`/api/*`)

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/user/login` | Password session |
| POST | `/api/user/register` | Signup |
| GET | `/api/verification` | Email verification code |
| GET | `/api/user/self` | Profile + quota |
| PUT | `/api/user/self` | Profile update |
| GET | `/api/token/` | List API keys |
| POST | `/api/token/` | Create key |
| POST | `/api/token/:id/key` | Reveal `sk-…` (once) |
| GET | `/api/log/self` | Usage logs |
| GET/POST | `/api/user/checkin` | Check-in (may be disabled by option) |
| POST | `/api/user/topup` | Redemption / top-up |
| * | `/api/subscription/*` | Plans, self, balance pay |
| GET | `/api/status` | Includes nested `data.product` |

Auth: session cookie + `New-Api-User` for browser; Studio uses password login then **Bearer sk-**.

## Relay (`/v1/*`)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/models` | Catalog + sk- probe |
| POST | `/v1/chat/completions` | Chat (long SSE on **api host**) |
| POST | `/v1/images/generations` | Image gen |
| POST | `/v1/audio/speech` | TTS |
| POST | `/v1/sound-generation` | SFX (native alias) |
| POST | `/v1/music` | Music (native alias) |
| POST | `/v1/embeddings` | Embeddings |

Studio long streams must use **direct** `api.origingame.dev` (or `OG_AI_GATEWAY`), not portal `/gw` as primary.

## 3D generation (`/meshy/*`, Meshy native proxy)

Auth: **Bearer sk-** (same relay token as `/v1/*`). Allowlisted upstream endpoints only
(create POST is billed per request; GET / list / DELETE / SSE `stream` are free):

| Workflow model | Upstream path | Purpose |
| --- | --- | --- |
| `meshy-text-to-3d` | `/meshy/openapi/v2/text-to-3d` | Text to 3D (preview/refine two-step) |
| `meshy-image-to-3d` | `/meshy/openapi/v1/image-to-3d` | Image to 3D (`smart-topology` supported) |
| `meshy-multi-image-to-3d` | `/meshy/openapi/v1/multi-image-to-3d` | Multi-view images to 3D |
| `meshy-remesh` | `/meshy/openapi/v1/remesh` | Polycount / topology reduction |
| `meshy-uv-unwrap` | `/meshy/openapi/v1/uv-unwrap` | Clean UV layout (max 40k faces) |
| `meshy-convert` | `/meshy/openapi/v1/convert` | Format conversion (GLB/FBX/OBJ/USDZ/…) |
| `meshy-resize` | `/meshy/openapi/v1/resize` | Physical size scaling |
| `meshy-retexture` | `/meshy/openapi/v1/retexture` | Re-texture existing model |
| `meshy-rigging` | `/meshy/openapi/v1/rigging` | Auto-rigging |
| `meshy-animation` | `/meshy/openapi/v1/animations` | Preset character animation |
| — | `GET /meshy/openapi/v1/balance` | Upstream credit balance |

3D-print and Creative Lab upstream endpoints are intentionally **not** exposed.

Task status (preferred over polling upstream through the proxy):

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/meshy/tasks/:id` | Gateway-local task status (`status`, `progress`, `result_url`, last payload) — served from DB, no upstream call |
| POST | `/meshy-webhook/:secret` | Meshy dashboard webhook receiver (path secret = `MESHY_WEBHOOK_SECRET` env; 404 when unset) |

Create responses (`{"result": "<task-id>"}`) are recorded as gateway tasks (`platform=meshy`).
Status flows in via the Meshy webhook, with the async task poller as fallback; failed or
canceled tasks are refunded automatically.

## Model readiness

Studio expects **`grok-4.5`** present on `GET /v1/models` for Maker readiness (channel/metadata ops, not a code freeze).

## Product features (`data.product.features`)

For `origingame` production defaults:

| Key | Default | Notes |
| --- | --- | --- |
| `subscriptions` | **true** | Portal billing — do not turn off lightly |
| `agent_desktop` | false | Not Studio path |
| `rankings` | false | Retail leaderboard |
| `playground_presets` | false | Console nicety |
| `public_marketing` | false | About/marketing |
| `model_plaza` | false | Reserved; pricing UI still via HeaderNavModules |

## Explicitly out of contract

- `/api/agent/*` device OAuth (unless a non-Studio client still needs it)
- `/api/apps`, `/api/rankings` when rankings feature is off
- `/api/preset`, `/api/conversation` when playground_presets is off
- Dual-host / `you-box.com` production deploy of this image

## Automated checks

- Go: `go test ./product/ ./tests/contracts/ -count=1`
- Manual smoke after deploy: see `docs/deploy.md`
