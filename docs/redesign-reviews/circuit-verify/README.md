# Circuit visual redesign — browser verification

Dev server: `http://127.0.0.1:5199` (YouBox `web/default`, rsbuild).  
Date: 2026-07-14. Product: runtime `data-product=youbox` Circuit skin.

## Production note

`https://you-box.com` was still serving the **pre-Circuit** build as of this work
(no `data.product` on `/api/status`, HTML FOUC only forces `light`, no theme
control). **Deploy a new image** after merge for online theme switch + Circuit UI.
Local verification below is against the redesigned source.

## Oracle plan status

| Stage | Scope | Result |
| --- | --- | --- |
| **A** Foundation | Token indirection, `skins/youbox.css`, ThemeProvider, FOUC, ThemeSwitch, no `.paper` on youbox | **PASS** |
| **B** Flagship surfaces | Home, auth, model plaza (`/pricing`), status, docs, shell chrome | **PASS** (screenshots) |
| **B2** Dark hardcode audit | hero-terminal, slider, model dialogs, email preview, kbd, 2FA, `yb-link` | **PASS** (fixed) |
| **C** Docs | AGENTS / CLAUDE / product-profile dual languages | **PASS** |
| **Isolation** | origingame + forced `.dark` still Paper light tokens | **PASS** |
| **Final matrix** | light/dark public routes + origingame | **PASS** |

### Residual (needs login / ops)

Oracle matrix also listed dashboard, usage logs, admin, playground. Those routes require authenticated sessions; not exercised in this run. Token coverage + shared shell imply they inherit Circuit; recommend a signed-in smoke after deploy.

## Measured tokens (computed style)

| State | `--background` | `--brand` | Display |
| --- | --- | --- | --- |
| youbox light | `#f6f8fa` | `#4f46e5` | Hanken Grotesk 620 |
| youbox dark | `#0b0e13` | `#818cf8` | Hanken Grotesk 620 |
| origingame (+ forced dark class) | `#fafaf8` (Paper) | `#0f766e` teal | Instrument Serif 400 |

- youbox: `paper=false`, Theme menu 浅色/深色/系统 present  
- origingame: dark class does **not** switch canvas to Circuit dark (variant scoped)

## Screenshot index

### Stage A
- `A1-youbox-home-light.png` — Circuit home light
- `A2-youbox-home-dark.png` — Circuit home dark + theme menu

### Stage B
- `B-dark-sign-in.png`, `B-dark-status.png`, `B-dark-pricing.png` (model plaza), `B-dark-docs.png`
- `B-light-home.png`, `B-light-pricing.png`, `B-light-sign-in.png`, `B-light-status.png`

### Isolation / final
- `ISO-origingame-with-dark-class.png`
- `FINAL-dark-*.png`, `FINAL-light-*.png`, `FINAL-origingame-paper.png`

## How to re-run

```bash
cd web/default && bunx rsbuild dev --port 5199 --host 127.0.0.1
# then agent-browser open http://127.0.0.1:5199/
```
