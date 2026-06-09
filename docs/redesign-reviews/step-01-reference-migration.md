# Step 1 review — reference directory migration

Branch: `redesign/youbox-frontend-100`
Date: 2026-06-10

## Summary

Plan rule 8 (reference directory) was added to the plan after the
redesign had already been executed in place on `web/default/`
(commits `0467b20a`…`fc75ef53`). A literal
`git mv web/default web/reference/default-before-youbox` was therefore no
longer possible without destroying the finished implementation. The step
was executed retroactively with an equivalent result:

- `web/reference/default-before-youbox/` was materialized from the Step 0
  baseline commit `e22fadc9` via `git archive` — the last commit before any
  redesign change touched `web/default/`. Content is byte-identical to the
  pre-redesign frontend (932 tracked files; `src/features/usage-logs/data/schema.ts`
  re-added with `git add -f` to match its originally tracked state against
  the root `.gitignore` `data/` pattern).
- The current `web/default/` (already fully rebuilt on the YouBox system)
  serves as the new implementation directory required by the plan.
- `web/reference/README.md` marks the snapshot read-only.
- `docs/redesign-reviews/feature-parity-index.md` maps every reference
  route/feature/component to its new implementation (see that file).

## Build isolation verification

- `web/package.json` workspaces list only `default` and `classic` — the
  reference tree is outside the bun workspace and never installed/built.
- `main.go` embeds only `web/default/dist` and `web/classic/dist`.
- `Dockerfile` copies only `web/default`, `web/classic`, and their `dist`
  outputs.
- Conclusion: visiting any page can never load code from
  `web/reference/default-before-youbox/`.

## Verification

- `bun run typecheck` (web/default): pass — recorded below in this step's
  follow-up verification run.
- `bun run build` (web/default): pass — reference directory absent from
  build graph.

## Browser threshold

The plan's Step 1 browser threshold ("new `web/default` boots a basic
shell") is superseded by the fact that the full implementation already
passed per-page browser review in steps 2–19
(`screenshots/step-02/`…`screenshots/step-19/`, `final-acceptance-matrix.md`).

## Review conclusion

`pass` — reference snapshot is exact, isolated from the build, and the
parity index ties every reference feature to its new implementation.

Commit: recorded in branch history as
`chore(frontend): add pre-YouBox web app snapshot as redesign reference`
(`e72fcdc8`) plus the docs restructure commit that follows it.
