# Motion & Animation

This document describes the YouBox frontend motion system: the token foundation,
how to consume it from CSS / Tailwind / JS, the shared-component micro-animations,
and the conventions that keep motion consistent and accessible.

## Philosophy

Motion is **differentiated by surface**:

- **Marketing / landing** (`features/home`, public header) — expressive: hero
  reveals, scroll-triggered entrances, count-ups, parallax. Bigger durations and
  more personality are welcome here.
- **In-app** (dashboard, playground, tables, settings) — restrained and
  functional: motion confirms state and guides the eye, never decorates. Fast,
  token-driven, GPU-cheap.

Everything respects `prefers-reduced-motion`.

## Token foundation (single source of truth)

Motion tokens are defined once and exposed three ways so CSS, Tailwind utilities,
and Framer (`motion`) all share one motion language.

### Easings — `src/styles/theme.css` (`@theme`)

| Token         | Curve                            | Use for                              |
| ------------- | -------------------------------- | ------------------------------------ |
| `ease-out`    | `cubic-bezier(0.16, 1, 0.3, 1)`  | Entrances, hovers, most UI (default) |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Reversible / bidirectional movement  |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Emphasis / playful pop (overshoots) |

Declared in a `@theme` block, so Tailwind generates the `ease-out` / `ease-in-out`
/ `ease-spring` utilities **and** emits the `--ease-*` custom properties on
`:root`. The utilities also set `--tw-ease`, which `tw-animate-css` reads — so the
same curve drives CSS transitions, Tailwind utilities, and `animate-in`/
`animate-out` overlay animations. (`ease-out` / `ease-in-out` intentionally
override Tailwind's defaults.)

> ⚠️ `ease-spring` overshoots past 1. Safe for **scale/opacity** pops (checkbox
> tick, radio dot). Avoid it on **translate** of an element pinned to an edge
> (e.g. a switch thumb) — the overshoot can poke past the track. Use `ease-out`
> there.

### Durations — `src/styles/theme.css` (`:root`) + `src/styles/index.css` (`@utility`)

| Token              | Value | Use for                                   |
| ------------------ | ----- | ----------------------------------------- |
| `duration-instant` | 80ms  | Micro feedback (press, tiny color shifts) |
| `duration-fast`    | 140ms | Overlays, hovers, buttons, toggles        |
| `duration-base`    | 220ms | Pills/indicators, sheets, page content    |
| `duration-slow`    | 400ms | Large/marketing reveals, theme wipe       |

The raw values live as `--dur-*` vars in `:root`. Tailwind v4 has **no**
`--duration-*` theme namespace, so the named `duration-*` utilities are defined
explicitly via `@utility` in `index.css`. Each sets **both** `transition-duration`
and `--tw-duration`, so one token drives plain transitions **and** `tw-animate-css`
`animate-in`/`animate-out` (which fall back through `--tw-duration`).

### JS / Framer — `src/lib/motion.ts`

`EASE` and `DUR` mirror the CSS tokens (durations in **seconds** for Framer).
`MOTION_TRANSITION` and the `*_VARIANTS` derive from them. Always import from
here — never hardcode bezier arrays or second values in components.

```ts
import { EASE, DUR, MOTION_TRANSITION } from '@/lib/motion'
// transition={MOTION_TRANSITION.default}  // 220ms ease-out
// transition={{ duration: DUR.fast, ease: EASE.out }}
```

## How to use

**CSS / Tailwind (preferred for simple things):**

```tsx
className = 'transition-colors duration-fast ease-out'
className = 'transition-[translate,width] duration-base ease-out'
```

**Arbitrary CSS value (raw var):** `duration-(--dur-base)` or `var(--ease-out)`
inside a keyframe/`animation` shorthand.

**Framer (`motion`)** — for shared-layout, enter/exit (`AnimatePresence`),
scroll-linked, or stagger. Use the helpers in `components/page-transition.tsx`
(`PageTransition`, `Stagger*`, `Card*`, `Table*`, `FadeIn`) and
`components/animate-in-view.tsx` (`AnimateInView`) rather than re-rolling.

## Shared-component micro-animations (Phase 1)

| Component                         | Animation                                                                 |
| --------------------------------- | ------------------------------------------------------------------------- |
| `ui/tabs` (default variant)       | Sliding pill via Base UI `Tabs.Indicator` (`--active-tab-*`), pure CSS     |
| `patterns/segmented-control`      | Sliding pill via Framer `layoutId` (unique per instance via `useId`)       |
| `ui/switch`                       | Token-timed thumb slide + track color (`ease-out`, no overshoot)          |
| `ui/checkbox`                     | Tick pops in (`animate-in zoom-in-50`, `ease-spring`), `motion-safe`       |
| `ui/radio-group`                  | Selected dot pops in (`zoom-in-50`, `ease-spring`), `motion-safe`          |
| `ui/button`                       | `loading` prop → leading `Spinner` + disabled; tokenized press            |
| `theme-switch`                    | Circular reveal via View Transitions API from the click point             |
| Overlays (dialog, popover, …)     | Tokenized to `duration-fast` / `ease-out` (was hardcoded `duration-100`)  |

### `Button` loading

```tsx
<Button loading={isSubmitting}>Save</Button>
```

Additive and backward-compatible. Shows a spinner and blocks interaction. Skipped
when a custom `render` element is provided (that element owns its content).

### Theme switch

`handleSetTheme` wraps `setTheme` in `document.startViewTransition` and animates a
`clip-path` circle on `::view-transition-new(root)` from the click coordinates.
`flushSync` is required so the `.dark` class (applied in a `useEffect`) lands
synchronously inside the transition callback. Feature-detected and disabled under
reduced motion; CSS lives under `index.css` → "Theme-switch circular reveal".

## Data feedback (Phase 2)

`<AnimatedNumber>` (`components/ui/animated-number.tsx`) is the shared count-up:
rAF interpolation with a cubic ease-out, writing to `textContent` (no per-frame
React renders), reduced-motion aware, `tabular-nums`. The formatter is read via a
ref so inline `format={...}` functions don't re-trigger the animation; the initial
text is captured once (via `useState`) so value changes animate from the previous
value with no flash to zero.

```tsx
<AnimatedNumber value={quota} format={formatQuota} />
<AnimatedNumber value={count} startOnView /> // defer until scrolled in (landing)
```

Applied to KPI values across dashboard (overview insights, model stat cards,
performance health), wallet balance, keys, profile, channels, users, redemption
codes, and rankings; the landing `Stats` counter is built on it too.

Other Phase 2 feedback: the copy buttons (`components/copy-button.tsx`,
`ai-elements/code-block.tsx`) pop the success check with a spring, and the pricing
favorite star (`pricing/model-card.tsx`) pops on favorite. Press feedback is
global (`button:active { scale(0.98) }`, index.css).

## Flagship surfaces (Phase 3)

- **Playground messages** (`playground/components/playground-chat.tsx`): each
  message row mounts with an opacity + 6px rise, keyed by `message.key` so it
  plays once on mount (not on every streaming token). Compare-mode columns
  stagger in (`delay = colIndex * 0.06`). Only `opacity`/`translateY` are
  animated — transforms don't change layout, so the `use-stick-to-bottom`
  auto-scroll stays correct. Reduced-motion → no wrapper animation.
- **Pricing view switch** (`pricing/index.tsx`): card ↔ table crossfades via a
  keyed `motion.div` (`key={viewMode}`) that fades the new view in. Keyed on
  `viewMode` only, so it fires on the switch — NOT on every search keystroke
  (which changes the filtered set). No `AnimatePresence mode='wait'`, to avoid a
  height-collapse gap during the swap.
- **Landing** (`home/`): the hero brand glow drifts on scroll (Framer
  `useScroll` / `useTransform` → a `MotionValue`, no React re-renders) for a
  depth cue; the terminal demo's method badge now joins the endpoint in the
  tab-switch opacity crossfade (it previously snapped).

## Phase 4 (infrastructure)

- **Token-only lint rule** (`eslint.config.js`): `no-restricted-syntax` forbids
  arbitrary `duration-[…]` and inline `cubic-bezier(…)` in class strings and
  template literals, pointing authors at the tokens. All prior offenders were
  tokenized first, so `bun run lint` passes clean and regressions now fail CI.
- **LazyMotion + `m`** (`main.tsx`): the app is wrapped in `<LazyMotion>` whose
  `features` load via a dynamic `import('motion/react').then(m => m.domMax)`, and
  every `motion.*` was swapped to the lightweight `m.*` primitive. This
  code-splits the `domMax` feature set (~84KB raw / ~28KB gzip) into an async
  chunk that loads after first paint — measured ~84KB less eager initial JS than
  loading `features={domMax}` statically. The shared core + `m` +
  `AnimatePresence` stay eager (needed on first paint); that part is unavoidable
  because the only motion entry exposing LazyMotion / AnimatePresence / hooks is
  the feature-bundling `motion/react` (the lightweight `motion/react-m` entry
  exports only `m.*` elements and ships incomplete types). Use a dynamic
  `features` loader (not `features={domMax}`) to keep the split.
- **Route transitions** are already handled by `AnimatedOutlet`
  (`page-transition.tsx`, Framer, keyed on pathname); native `startViewTransition`
  routing would be a competing system, so it's intentionally not added.

## Conventions / guardrails

- **Token-only.** No raw `duration-[<number>]` or inline `cubic-bezier(...)` in
  components — use the `duration-*` / `ease-*` utilities or `lib/motion.ts`.
- **Animate cheap properties:** `transform` / `translate` / `scale` / `opacity` /
  `filter` / `clip-path`. Avoid animating `width`/`height`/`top`/`left` (layout
  thrash) — use Framer layout / FLIP if you must move things.
- **Always honor reduced motion:** CSS via `@media (prefers-reduced-motion)` or
  `motion-safe:` / `motion-reduce:`; JS via `useReducedMotion()` (Framer) or
  `matchMedia('(prefers-reduced-motion: reduce)')`.
- **`will-change` sparingly** and remove it after the animation.

## Deferred follow-ups

Phases 0–4 and their tails are complete (count-up everywhere, copy/favorite
feedback, playground message + typing-dots, pricing view crossfade + card
stagger, pricing chart entrances, landing glow parallax + terminal per-line
reveal, sidebar highlight, token lint rule, LazyMotion). What remains is
intentionally out of scope:

- **Table row insert/remove animation.** Tables use index-based row keys (no
  `getRowId`) and swap the whole page on server pagination, so per-row enter/exit
  can't be done reliably without a data-layer change.
- **Virtualized-table stagger guard.** `@tanstack/react-virtual` is installed but
  unused, so the global `[data-slot='table'] tbody tr` stagger is safe today. If
  virtualization is adopted later, gate that stagger so it doesn't replay per row
  on scroll (a correctness fix, not polish).
- **Sidebar sliding-pill indicator.** The active item animates its highlight
  (tokenized `transition-colors`); a full Framer `layoutId` sliding pill was
  assessed but deferred — the nav is a collapsible tree with an icon-collapsed
  mode, so a shared-layout pill is fragile on this core surface.
