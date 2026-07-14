# Product profile (Core + runtime skin)

## Goal

Run **YouBox** and **Origin Gateway** from one monorepo and one release image, with:

- different design tokens / brand accents
- optional different feature sets (frontend + backend)
- continued upstream Calcium-Ion/new-api backend merges into **shared core**

without maintaining two apps or two git forks.

## Model

```text
upstream new-api  ──►  core (relay, model, billing, auth, shared UI)
                              │
              PRODUCT_ID ─────┼── youbox skin + features
                              └── origingame skin + features
```

| Host | `PRODUCT_ID` | Domain (default public base) |
| --- | --- | --- |
| youbox | `youbox` | https://you-box.com |
| bwg | `origingame` | https://api.origingame.dev |

Same image digest on both hosts. Differences are **runtime**.

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
PRODUCT_ID=youbox          # or origingame
PRODUCT_PUBLIC_BASE_URL=   # optional absolute origin, no trailing slash required
```

### Feature keys (keep small)

| Key | Meaning |
| --- | --- |
| `agent_desktop` | Agent auth/device APIs + console entry |
| `model_plaza` | Model plaza surfaces (reserved for gates) |
| `rankings` | App rankings `/api/apps` |
| `playground_presets` | Preset + conversation playground APIs |
| `public_marketing` | Marketing-oriented UI (reserved) |
| `subscriptions` | Subscription surfaces (reserved) |

Phase-0 default: **all true** for both products (behavior-preserving). Turn off per product when divergence is real.

### Adding an A-only feature

1. Add a key to `product.FeatureSet` (Go) and FE `FeatureKey` / `FULL_FEATURES` (keep keys in sync).
2. Set defaults in `profileFor` for each product.
3. Register/guard routes only in seams (`youbox-router.go` etc.), never deep inside upstream-owned controllers.
4. FE: `useFeature('…')` for menus; `productHasFeature` in route `beforeLoad` if needed.
5. Prefer deleting the flag later if both products converge.

## Frontend

| Piece | Location |
| --- | --- |
| Types / defaults | `web/default/src/products/` (`ui.darkMode`, `ui.paperMarketing`, `ui.skin`) |
| YouBox Circuit skin | `web/default/src/products/skins/youbox.css` (full light+dark tokens) |
| Origin accents | `web/default/src/products/product-tokens.css` (teal on Paper `:root`) |
| Theme | `context/theme-provider.tsx` + `ThemeSwitch` (gated by `ui.darkMode`) |
| Store + hooks | `useProduct`, `useFeature`, `useProductStore` |
| Bootstrap | `main.tsx` + `index.html` FOUC script (`yb-ui-theme`, `data-product`) |

`html[data-product="youbox"|"origingame"]` drives CSS. Shared semantic names stay in `styles/theme.css`.

| Product | Skin | Dark mode | Marketing canvas |
| --- | --- | --- | --- |
| youbox | Circuit (slate + violet, sans display) | yes (light/dark/system) | no `.paper` |
| origingame | Paper (cream + serif, teal accent) | no (forced light) | `.paper` class |

### Do not

- Copy entire feature folders per product
- Scatter `if (productId === 'origingame')` in shared feature code
- Invent a second token vocabulary in components
- Let `.paper` wrap youbox (it would shadow Circuit tokens)

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

### Circuit UI smoke (youbox)

```bash
cd web/default && bunx rsbuild dev --port 5199 --host 127.0.0.1
# Browser: data-product=youbox, Theme menu light/dark/system
# Computed: light --background #f6f8fa / --brand #4f46e5
#           dark  --background #0b0e13 / --brand #818cf8
# Isolation: data-product=origingame + .dark still Paper light tokens
```

Browser evidence: `docs/redesign-reviews/circuit-verify/README.md`.

## Later phases (do not start early)

1. Product-private Go packages + `og_*` tables when a whole domain is product-only.
2. Dual image tags / build-arg product bundles only if secrecy, bundle size, or incompatible design systems force it.
3. Never split into two git repositories while both remain gateways on this core.
