# Product profile (Core + runtime skin)

## Goal

Run **Origin Gateway** as the production product from one monorepo and one release
image (`ghcr.io/fran0220/origin-gateway`):

- one design language: OriginGame **Amp × Arcade** (Paper), tokens mirrored from the OriginGame token package
- feature sets that gate demo/retail surfaces off in production (`PRODUCT_ID`-driven)
- continued upstream Calcium-Ion/new-api backend merges into **shared core**

without maintaining two gateway apps or two git forks of this core. The legacy
`youbox` id remains only as a backend dev profile; the frontend Circuit demo skin
is retired.

**Production:** only **BWG** runs this image as Origin Gateway (`PRODUCT_ID=origingame`, `https://api.origingame.dev`).  
`you-box.com` is **BoxAI**, not this stack. See `AGENTS.md` and `docs/deploy.md`.  
OriginGame consumer boundary: `docs/origingame-platform.md`. Frozen HTTP: `docs/origingame-contract.md`.

## Model

```text
upstream new-api  ──►  core (relay, model, billing, auth, shared UI)
                              │
              PRODUCT_ID ─────┼── origingame (default, production Origin Gateway)
                              └── youbox (local backend dev profile only)
```

| Context | `PRODUCT_ID` | Domain (default public base) | Production? |
| --- | --- | --- | --- |
| BWG Origin Gateway | `origingame` (**default**) | https://api.origingame.dev | **Yes — only live deploy of this repo** |
| Local backend dev profile | `youbox` | override | No — not `you-box.com` |

Differences are **runtime** (`PRODUCT_ID`), not separate images per host.

## Backend

| Piece | Location |
| --- | --- |
| Profile + features | `product/product.go` |
| Init from env | `common.InitEnv` → `product.Init()` |
| Status payload | `controller.GetStatus` → nested `data.product` |
| Feature middleware | `middleware.RequireFeature` |
| Extension seam | `router/youbox-router.go`, `service/youbox_runtime.go` |
| OpenRouter referer | `common.OpenRouterReferer()` → `product.PublicBaseURL()` |

### Env

```bash
PRODUCT_ID=origingame      # default; youbox = local backend dev profile only
PRODUCT_PUBLIC_BASE_URL=   # optional absolute origin, no trailing slash required
```

### Feature keys (keep small)

| Key | Meaning | `origingame` default | `youbox` demo |
| --- | --- | --- | --- |
| `agent_desktop` | Agent auth/device APIs + console entry | **false** | true |
| `model_plaza` | Model plaza reserved gate | **false** | true |
| `rankings` | Rankings + apps APIs | **false** | true |
| `playground_presets` | Preset + conversation playground APIs | **false** | true |
| `public_marketing` | Marketing-oriented UI (About, etc.) | **false** | true |
| `subscriptions` | Subscription surfaces (portal billing) | **true** | true |

Empty / unknown `PRODUCT_ID` → **origingame** (safe production default).

### Adding an A-only feature

1. Add a key to `product.FeatureSet` (Go) and FE `FeatureKey` / `FULL_FEATURES` (keep keys in sync).
2. Set defaults in `profileFor` for each product.
3. Register/guard routes only in seams (`youbox-router.go` etc.), never deep inside upstream-owned controllers.
4. FE: `useFeature('…')` for menus; `productHasFeature` in route `beforeLoad` if needed.
5. Prefer deleting the flag later if both products converge.

## Frontend

The frontend ships **one design language**: OriginGame **Amp × Arcade** ("Paper"). The
retired YouBox "Circuit" demo skin has been removed; any non-`origingame`
`PRODUCT_ID` resolves to the same Paper skin on the client.

| Piece | Location |
| --- | --- |
| Types / defaults | `web/default/src/products/` (`ui.darkMode`, `ui.paperMarketing`, `ui.skin`) |
| OriginGame token mirror | `web/default/src/products/og-tokens.css` (AUTO-GENERATED `--og-*`) |
| Token sync script | `web/default/scripts/sync-og-tokens.mjs` (`bun run tokens:sync` / `tokens:check`) |
| Semantic tokens | `web/default/src/styles/theme.css` (maps `--og-*`, warm dark remap) |
| Product seam | `web/default/src/products/product-tokens.css` (`html[data-product]` hook) |
| Theme | `context/theme-provider.tsx` + `ThemeSwitch` (gated by `ui.darkMode`) |
| Store + hooks | `useProduct`, `useFeature`, `useProductStore` |
| Bootstrap | `main.tsx` + `index.html` FOUC script (`yb-ui-theme`, `data-product`) |

**Design tokens are mirrored from the OriginGame token package** (SSOT:
`origingame/packages/tokens/tokens.json`). `bun run tokens:sync` regenerates
`og-tokens.css`; `bun run tokens:check` verifies drift when the sibling source is
available and reports a skip in standalone clones. Only token **values** cross
the boundary — no AGPL source is vendored in either direction.

| Product | Skin | Dark mode | Marketing canvas |
| --- | --- | --- | --- |
| origingame | Paper — Amp × Arcade (warm parchment, Archivo Black display, arcade-yellow `#ffb100` CTA) | yes (light / warm dark / system) | `.paper` desk canvas |

### Do not

- Copy entire feature folders per product
- Scatter `if (productId === 'origingame')` in shared feature code
- Invent a second token vocabulary — map `--og-*` in `theme.css`, never hardcode product colors in features
- Hand-edit `og-tokens.css` (regenerate via `tokens:sync`)

## Upstream sync

- Merge backend functional changes into **core** only.
- Product package + `web/default/src/products/**` should stay conflict-free.
- Keep extension seams greppable (`registerYouBoxRoutes`, YouBox runtime helpers).

## Verification

```bash
# unit
go test ./product/ -count=1
cd web/default && bun run test src/products src/lib/theme-mode.test.ts

# deploy smoke
curl -fsS http://127.0.0.1:3000/api/status | jq .data.product
curl -fsS http://127.0.0.1:9320/api/status | jq .data.product
```

Expect matching `id`, and OpenRouter referer / agent issuer fallbacks to use that product’s `public_base_url` when server address is unset.

### Design token smoke (Amp × Arcade)

```bash
cd web/default && bun run tokens:check   # mirror in sync with origingame tokens.json
cd web/default && bunx rsbuild dev --port 5199 --host 127.0.0.1
# Browser: data-product=origingame, Theme menu light/dark/system
# Computed: light --background #f4efe4 (paper) / --cta #ffb100 (arcade yellow)
#           dark  --background #1b160f (warm) / --cta #ffb100 (constant accent)
```

## Later phases (do not start early)

1. Product-private Go packages + `og_*` tables when a whole domain is product-only.
2. Dual image tags / build-arg product bundles only if secrecy, bundle size, or incompatible design systems force it.
3. Keep gateway core in this repo; do not merge OriginGame portal/Studio source here (HTTP consumer only — `docs/origingame-platform.md`).
4. Never split this gateway core into two git repositories while both skins remain on the same release image.
