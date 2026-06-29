---
name: syncing-upstream-backend
description: Syncs backend-only functional changes from Calcium-Ion/new-api into this YouBox fork while preserving the local frontend redesign, deployment policy, and YouBox extension seams. Use when comparing with upstream/main, planning or executing upstream backend merges, or reviewing overlap files for mergeability.
---

# Syncing Upstream Backend

Use this skill when bringing backend functionality from `Calcium-Ion/new-api` into YouBox.

The goal is **file-list / commit-batch backend sync**, not a broad tree merge. YouBox intentionally owns the frontend redesign, product branding, deployment defaults, and local extension files.

## Non-negotiables

- Do **not** merge upstream `web/`, `docs/`, `Design-system/`, or project deployment defaults unless the user explicitly asks.
- Do **not** start from a broad merge that overwrites YouBox files and then tries to restore them later.
- Keep YouBox-specific backend features in dedicated files whenever possible:
  - `router/youbox-*.go`
  - `controller/youbox-*.go` or feature-specific controller files
  - `service/youbox-*.go` or feature-specific service files
  - `model/youbox-*.go` or feature-specific model files
  - `common/branding.go`, `common/legacy_console_rewrite.go`
- Central upstream files should contain only thin call sites where unavoidable.
- Preserve DB compatibility with SQLite, MySQL, and PostgreSQL. Use GORM unless raw SQL is unavoidable.
- Use `common.*` JSON wrappers for marshal/unmarshal.

## Baseline inventory

Start by fetching upstream and computing the merge-base:

```bash
git fetch upstream
base=$(git merge-base HEAD upstream/main)
echo "base=$base ours=$(git rev-parse --short HEAD) upstream=$(git rev-parse --short upstream/main)"
```

Classify changed files:

```bash
comm -12 \
  <(git diff --name-only "$base"..HEAD | sort) \
  <(git diff --name-only "$base"..upstream/main | sort)

git diff --name-status "$base"..HEAD -- \
  common constant controller dto middleware model pkg relay router service setting \
  main.go go.mod go.sum Dockerfile docker-compose.yml .env.example makefile VERSION

git diff --name-status "$base"..upstream/main -- \
  common constant controller dto middleware model pkg relay router service setting \
  main.go go.mod go.sum Dockerfile docker-compose.yml .env.example makefile VERSION
```

Expected durable overlap hotspots in this fork:

- `main.go` — keep YouBox startup behind `service.StartYouBoxBackgroundTasks()` and `service.InitYouBoxRuntimeResources()`.
- `router/api-router.go` — keep YouBox routes behind `registerYouBoxRoutes(apiRouter)`.
- `router/channel-router.go` — when upstream moves inline channel routes into a registry, re-add YouBox-only channel endpoints such as Codex OAuth start/complete routes to the new registry instead of keeping a duplicate inline route block.
- `model/main.go` — keep YouBox migrations behind `youBoxMigrationModels()` / `youBoxMigrationSpecs()`.
- `model/log.go` — if ClickHouse log support is present, new audit/login log writes must use the shared log creation path (`createLog`) rather than direct `LOG_DB.Create`, so ClickHouse and alternate log DB behavior stays consistent.
- `common/constants.go` — keep branding and legacy console rewrites in separate common files.
- `relay/channel/openai/adaptor.go` — use common branding helpers instead of hard-coded YouBox strings.
- `controller/user.go`, `model/token.go`, provider relay converters — only touch when the upstream type or hot path truly needs the field/branch.

## Commit-batch classification

List upstream backend-impacting commits and mark overlap before porting:

```bash
python3 - <<'PY'
import subprocess
base=subprocess.check_output(['git','merge-base','HEAD','upstream/main'],text=True).strip()
ours=set(subprocess.check_output(['git','diff','--name-only',f'{base}..HEAD'],text=True).splitlines())
backend=('common/','constant/','controller/','dto/','middleware/','model/','pkg/','relay/','router/','service/','setting/','main.go','go.mod','go.sum','Dockerfile','docker-compose.yml','.env.example','makefile','VERSION')
for c in subprocess.check_output(['git','rev-list','--reverse',f'{base}..upstream/main'],text=True).splitlines():
    files=subprocess.check_output(['git','diff-tree','--no-commit-id','--name-only','-r',c],text=True).splitlines()
    b=[f for f in files if f.startswith(backend) or f in backend]
    if not b:
        continue
    overlap=[f for f in b if f in ours]
    subj=subprocess.check_output(['git','log','-1','--format=%h %s',c],text=True).strip()
    print(('OVERLAP ' if overlap else 'SAFE    ') + subj)
    if overlap:
        print('         ' + ', '.join(overlap[:8]))
PY
```

Use the result as a merge plan:

| Bucket | Policy |
| --- | --- |
| SAFE backend-only | Cherry-pick or checkout file hunks directly. |
| OVERLAP backend | Hand-merge after reading both local and upstream diffs. Keep YouBox extension seams. |
| Frontend/docs/design | Defer by default. |
| Deployment files | Cherry-pick only specific env knobs/comments that fit YouBox deployment. |
| `go.mod` / `go.sum` | Update only with selected backend functionality and verify build. |

When `go.sum` conflicts during dependency-bearing backend patches, prefer restoring a clean side and running `go mod tidy` over hand-merging checksum blocks:

```bash
git show HEAD:go.sum > go.sum
go mod tidy
git add go.mod go.sum
```

## Safe implementation workflow

1. Create a dedicated branch from current YouBox branch.
2. Port upstream backend commits in small batches.
3. Before editing any overlap file, read both sides:

```bash
git diff "$base"..HEAD -- <path>
git diff "$base"..upstream/main -- <path>
```

4. Prefer adding or updating feature-specific files over expanding central files.
5. If a central file must change, keep the local delta to one of:
   - a single registration call,
   - a struct field required by persistent schema/API compatibility,
   - a provider branch that cannot be expressed elsewhere,
   - a small config helper call.
6. When applying upstream system-task/authz/router refactors, resolve conflicts by preserving both ordering constraints and YouBox seams. Example: set task adaptor factories before starting the system task runner, then call `service.StartYouBoxBackgroundTasks()` after the upstream runner registration.
7. Never remove YouBox frontend routes, branding, deployment secrets policy, or local API behavior unless the user explicitly approves.

## Verification

For backend sync or overlap refactors, run the narrowest meaningful checks first, then broaden if needed:

```bash
gofmt -w <changed-go-files>
go test ./common ./model ./service ./controller ./router ./relay/...
```

If the change touches dependencies, migrations, or cross-package contracts, run:

```bash
go test ./...
```

For frontend-owned behavior or routes exposed to the redesigned UI, also run the relevant `web/default` Bun checks only if frontend files changed.

## Reporting

End with:

- Upstream base and upstream/main commit used.
- Included backend commits/features.
- Deferred frontend/deployment/risky items.
- Overlap files touched and why each touch was unavoidable.
- Verification commands and results.
