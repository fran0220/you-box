# Upstream Backend Sync Plan

Branch: `feat/upstream-backend-sync`  
Base: YouBox `main` @ `7f0b5343`  
Upstream: `upstream/main` @ `a79f9691` (≈ v1.0.0-rc.20)  
Merge-base: `d2576ddc`

## Goal

Port all meaningful **backend functional updates** from Calcium-Ion/new-api into YouBox, preserve YouBox seams (branding, routes, migrations, Meshy/ElevenLabs/agent), and **add Paper-theme frontend** for any new APIs that need admin/user UI.

## Done-when

1. SAFE provider/billing backend commits ported and tests green.
2. P0 billing/security/ops backend deltas ported with YouBox seams intact.
3. P1 product backend features ported (subscription reset, stale instance cleanup, redemption cleanup, usedata flow, passive monitor, polling delay, node attribution).
4. Frontend gaps covered in `web/default` Paper UI for user-visible features.
5. `go test` for touched packages passes; frontend typecheck/lint for changed UI.

## Non-negotiables

- No broad merge of upstream `web/`, docs, Design-system, deployment defaults.
- Keep `registerYouBoxRoutes`, `StartYouBoxBackgroundTasks`, `youBoxMigration*`, branding helpers.
- SQLite/MySQL/PostgreSQL compatibility; `common.*` JSON wrappers.

## Batches

### Batch A — SAFE backend (low risk)
- `c8491b41` Seedance 2.0 billing by resolution/video input
- `e514db20` Seedance 2.0 safety_identifier/priority/4k
- `52858ad1` Wan2.7 i2v media mapping
- `0977965d` Ollama non-stream tool calls
- `3fbad6a7` tiered expression pre-consume default token estimate
- GPT-5.6 ratios from `2f5f6ba8` / `6ce7305c`

### Batch B — Billing correctness (P0)
- `common/quota_math.go` + tests
- quantity validation / saturating conversions
- quota saturation audit events
- int32 overflow guards
- PriceData other-ratios refactor
- task settlement / Ali video duration fix `043720f9`

### Batch C — Security & ops (P0)
- secure session cookies (`common/session_cookie.go`)
- SSRF protected fetch client
- graceful shutdown in `main.go` (preserve YouBox seams)
- user/auth harden (email/password, omit access_token, read-only tokens, username trim)
- centralized row locking `model/locking.go`
- stale system instance cleanup APIs

### Batch D — Product backend (P1)
- subscription admin quota reset
- redemption status filter + cleanup
- usedata flow / Sankey backend (`model/usedata_flow.go` + routes)
- passive channel monitoring + test env toggle
- async polling delay toggle
- async task usage node attribution
- channel ops retry_times API (tiny)

### Batch E — Frontend gaps (Paper UI)
Only for features that expose new/changed APIs users or admins need:

| Feature | Backend API | Frontend target |
|---|---|---|
| Subscription admin quota reset | subscription admin endpoints | admin subscription / user subscription panels |
| Stale system instance cleanup | system_info delete stale | admin system info / instance list |
| Redemption cleanup/filter | redemption list/cleanup | admin redemption page |
| Traffic flow Sankey | usedata flow API | dashboard flow chart (Paper) |
| Passive monitor / test env | monitor settings | admin channel monitor settings |
| Async polling delay | channel settings field | channel edit form |
| Secure session cookie | env-driven (may be ops-only) | optional `.env.example` note only |
| GPT-5.6 / provider billing | ratio defaults | usually no UI |

Skip pure upstream frontend cosmetics (table column resize, classic theme, etc.).

## Verification gates

After each batch:
```bash
gofmt -w <changed go files>
go test ./common ./model ./service ./controller ./router ./relay/...
```

After frontend batch:
```bash
cd web/default && bun run typecheck && bun run lint
```

Final:
```bash
go test ./...
```

## Progress

- [x] Branch created
- [ ] Batch A
- [ ] Batch B
- [ ] Batch C
- [ ] Batch D
- [ ] Batch E
- [ ] Final verification
