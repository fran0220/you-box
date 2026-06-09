# Redesign review records — YouBox frontend

Per-step review records for `docs/youbox-frontend-100-percent-redesign-plan.md`.

## Layout

```text
docs/redesign-reviews/
  step-00-baseline.md … step-19-final-acceptance.md   # one record per plan step
  final-acceptance-matrix.md                          # step 19 route matrix
  feature-parity-index.md                             # reference → new implementation map
  screenshots/step-NN/                                # browser-review screenshots per step
```

## Numbering note

Steps 2–19 were executed under the plan's pre-revision numbering (1–18),
before the revised plan inserted Step 1 (reference-directory migration)
and renumbered everything after it. The records were renamed to the
revised numbering; each file's commit references therefore point at
commits whose messages may mention the old step number. Mapping:
executed step N (commits `0467b20a`…`fc75ef53`) = revised plan step N+1.
Step 0 is unchanged. Step 1 was executed retroactively (see
`step-01-reference-migration.md`).

Screenshot directories follow the revised numbering: `screenshots/step-00/`
holds the Step 0 *before* set, `screenshots/step-19/` holds the final
acceptance set.
