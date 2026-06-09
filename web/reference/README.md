# web/reference — read-only redesign reference

`default-before-youbox/` is a frozen snapshot of `web/default/` as of the
YouBox redesign baseline (commit `e22fadc9`, Step 0 of
`docs/youbox-frontend-100-percent-redesign-plan.md`), taken before any
redesign commit touched the frontend.

Rules:

- **Read-only.** This tree exists only as the feature-parity reference for
  the YouBox redesign (`docs/redesign-reviews/feature-parity-index.md`).
  Do not edit, build, or import from it.
- It is not part of the bun workspace (`web/package.json` lists only
  `default` and `classic`), is not embedded by `main.go`, and is not copied
  by the `Dockerfile`.
