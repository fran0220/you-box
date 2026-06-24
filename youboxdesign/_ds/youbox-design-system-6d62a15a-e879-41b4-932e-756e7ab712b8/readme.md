# YouBox Design System

> **YouBox** — *Every model, one box.*
> The unified API gateway and marketplace for large language models. One
> OpenAI-compatible endpoint routes to 300+ models across every major provider,
> with smart cost/latency routing, automatic failover, and pass-through pricing.

This project is a **design system**: tokens, fonts, reusable React components, a
marketing-site UI kit, and brand assets. An automated compiler bundles the
components into a runtime library (`_ds_bundle.js`) and indexes the CSS tokens.

- **Category:** AI infrastructure · developer tooling (model aggregation, à la an OpenRouter-style marketplace)
- **Primary surface:** Marketing website
- **Aesthetic:** Dark-mode-first, technical, data-dense, monospace accents — a developer-marketplace look. Azure brand accent (`#0090ff`) against near-black ink — aligned with the shipped `web/default` theme.
- **Sources:** No existing codebase or Figma was provided. This system was **designed from scratch** in the model-aggregation genre. It is an original brand — not a recreation of any existing product's visuals.

---

## Content Fundamentals

How YouBox writes copy.

- **Voice:** Confident, technical, plainspoken. Talks to developers as peers. No hype, no fluff. Claims are concrete ("no markup on tokens", "drop-in OpenAI-compatible SDK") rather than vague ("revolutionary AI platform").
- **Person:** Second person ("**you** write one integration"). The product is "YouBox" or "we". The reader is always "you".
- **Casing:** Sentence case for all headings and buttons ("Get your API key", not "Get Your API Key"). The brand name is always **camel case: `YouBox`** — never "Youbox", "youbox", or "YOUBOX". The "Box" half is often tinted `--brand` (azure) in the wordmark.
- **Headline style:** Short, punchy, often two beats with a line break and a colored payoff. The anchor line is **"Every model, one box."** Others: "Route to any LLM.", "One catalog. Every model.", "Live in three steps."
- **Eyebrows:** Mono, uppercase, prefixed with a `//` comment slash — e.g. `// MARKETPLACE`, `// WHY YOUBOX`. This is a recurring signature that reinforces the developer-tool feel.
- **Numbers & units:** Specific and mono-set. "312 models", "1.4T tokens/day", "99.98% uptime", "$3.00 / 1M". Units sit in the mono font, dimmed.
- **Technical terms** stay lowercase and literal: `model`, `tokens`, `context window`, `failover`, `tok/s`. Model IDs use provider-prefixed slugs: `anthropic/claude-opus-4.6`.
- **Emoji:** None. Iconography is line icons, never emoji.
- **Tone examples:**
  - Hero sub: "Write one integration and route to any provider — with automatic failover, smart cost routing, and pass-through pricing."
  - Feature: "If a provider degrades or rate-limits, YouBox retries the next best model in milliseconds."
  - Pricing: "Pay for tokens, not the gateway."

---

## Visual Foundations

- **Color:** Dark-mode-first. The canvas is near-black warm ink (`--ink-950 #0B0B0F`); surfaces step up through `--surface` → `--surface-2` → `--surface-3`. The signature is **YouBox Azure `#0090ff`** (`--brand`), used sparingly for primary CTAs, the wordmark's "Box", eyebrows, active states, and the hero glow. **Teal `#1FBEA3`** (`--accent`) is the secondary, reserved for data/status dots and model categories. A light theme exists (`[data-theme="light"]`) but dark is the brand's home. *(Design tokens updated to match `web/default/src/styles/theme.css`; legacy orange docs superseded.)*
- **Type:** Three families. **Space Grotesk** (display/headings) — geometric grotesque, tight negative tracking. **Hanken Grotesk** (body/UI) — warm, neutral, readable. **JetBrains Mono** (code, eyebrows, technical labels, units). Headlines run large with `-0.025em`–`-0.035em` tracking; mono eyebrows run uppercase with `+0.08em–0.1em` tracking.
- **Spacing:** 4px base grid (`--space-1`…`--space-40`). Sections breathe at 96px vertical padding; cards pad at 20–30px.
- **Backgrounds:** Flat near-black. **No photographic imagery, no busy patterns.** The single decorative move is a soft radial **brand glow** behind the hero (`radial-gradient` of azure at ~16% alpha). Glass/blur is used only on the sticky nav (`backdrop-filter: blur`). Avoid full-page gradients.
- **Borders:** Hairline, low-contrast — `rgba(255,255,255,0.09)` on dark. Elevation reads through borders + a faint glow more than heavy drop shadows. Border-radius scale: cards use **md (10px)** / **lg (14px)**; pills and tags use **pill (999px)**; plans use **xl (20px)**.
- **Cards:** `--surface-card` fill, 1px hairline border, `--radius-lg`. Interactive cards lift `translateY(-2px)` and gain a brand-glow border on hover. No colored left-border accents, no emoji.
- **Shadows:** Subtle on dark (`--shadow-sm`…`--shadow-xl` are deep-but-soft black). The hero CTA and feature cards use `--glow-brand` (a 1px brand border ring + soft azure shadow) for emphasis.
- **Motion:** Signature easing is `--ease-out: cubic-bezier(0.16,1,0.3,1)` for entrances; `--ease-spring` adds a gentle overshoot (used on the switch thumb). Durations: fast 140ms, base 220ms, slow 400ms. Respect `prefers-reduced-motion`.
- **Hover states:** Buttons lighten (primary → `--brand-hover`); ghost/secondary gain a `--surface-hover` fill; links/icons brighten toward `--text`. **Press states:** scale down slightly (`scale(0.985)` on buttons, `scale(0.92)` on icon buttons).
- **Transparency & blur:** Used deliberately — sticky nav glass, subtle tints (`--brand-subtle`, semantic `*-subtle` fills at ~12–15% alpha). Not decorative.
- **Imagery vibe:** Code is the hero imagery. Code blocks have a chrome bar (three dots + filename/lang + copy), syntax tints (azure keywords, teal strings, blue function names) on `--code-bg`.

---

## Iconography

- **System:** [**Lucide**](https://lucide.dev) — clean 1.75px-stroke line icons. This matches the technical, utilitarian feel. Loaded from CDN (`unpkg.com/lucide`) in cards and the UI kit via `<i data-lucide="name">` + `lucide.createIcons()`.
- **Why a CDN substitution:** No brand icon set existed (designed from scratch). Lucide is the chosen standard, not a placeholder — but if you want a bespoke set later, swap it here and document it. **Stroke width is always 1.75.**
- **Sizes:** 15–18px inline; 21px in feature tiles; 16–17px in buttons.
- **Emoji:** Never used.
- **Unicode:** The `//` in eyebrows and `★` favorite glyph are the only non-icon glyphs; otherwise prefer Lucide.
- **Brand mark:** `assets/youbox-mark.svg` — an original isometric **open box** in two azure shades. `assets/youbox-mark-mono.svg` is a single-`currentColor` variant. The wordmark sets "You" in `--text-strong` and "Box" in `--brand`, Space Grotesk 700.

---

## Index / Manifest

**Root**
- `styles.css` — global entry point (imports only). Consumers link this.
- `readme.md` — this file.
- `SKILL.md` — Agent-Skills-compatible entry for use in Claude Code.

**`tokens/`** (all `@import`ed by `styles.css`)
- `fonts.css` — `@import` of the three Google Fonts families.
- `colors.css` — brand/teal/ink ramps, semantic palette, dark + light aliases.
- `typography.css` — families, scale, weights, leading, tracking, semantic roles.
- `spacing.css` — spacing, radius, border widths, layout, control heights.
- `effects.css` — shadows, glows, focus ring, blur, motion, z-index.
- `base.css` — element resets + brand canvas defaults + `.yb-eyebrow` util + scrollbars.

**`guidelines/`** — foundation specimen cards (Design System tab): brand/teal/neutral/semantic/surfaces colors, display/body/mono/scale type, spacing/radius/elevation/motion, logomark + wordmark.

**`components/`** — reusable React primitives (namespace `window.YouBoxDesignSystem_6d62a1`):
- `buttons/` — **Button**, **IconButton**
- `forms/` — **Input**, **Switch**
- `data-display/` — **Badge**, **Tag**, **Avatar**, **Stat**
- `surfaces/` — **Card**, **Tabs**
- `models/` — **ModelCard** (the signature marketplace listing)
- `code/` — **CodeBlock**

**`ui_kits/marketing/`** — the marketing website (interactive `index.html`): `Nav`, `Hero`, `Providers`, `Marketplace` (live search + filter), `Features`, `Quickstart`, `Pricing`, `Footer`, with `data.js` and `marketing.css`.

**`assets/`** — `youbox-mark.svg`, `youbox-mark-mono.svg`.

**Starting points:** Button, Input, CodeBlock, ModelCard (components) and the Marketing landing page (screen).
