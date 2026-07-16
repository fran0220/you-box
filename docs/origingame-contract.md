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
