# Upstream Backend Sync Plan

Branch: `feat/upstream-backend-b1-b3`  
Base: YouBox `main` @ `846daa52` (v0.1.14)  
Upstream: `upstream/main` @ `7c28993f`  
Merge-base: `d2576ddc`

## Goal

Port **Batch 1–3** backend functional updates from Calcium-Ion/new-api into YouBox, including the full text protocol conversion stack (`service/relayconvert` + `billing_usage`), while preserving YouBox seams.

## Done-when

1. Batch 1 small correctness ports complete.
2. Batch 2 billing/stream hardening complete.
3. Batch 3 protocol conversion + advanced-custom complete.
4. `go test ./...` green; YouBox seams intact.

## Non-negotiables (preserved)

- `registerYouBoxRoutes`, `StartYouBoxBackgroundTasks`, `InitYouBoxRuntimeResources`
- Branding (`SystemName`, `PoweredBy`, issue links)
- No classic web theme embed
- `pkg/appusage` consume logging
- Plaza: models require metadata `status=1` for `GetPricing()` visibility
- ElevenLabs/Meshy/Agent extensions

## Batches (this pass)

### Batch 1 — small correctness

- [x] Clear sample special usable groups (`setting/ratio_setting/group_ratio.go`)
- [x] Model meta search `status` / `sync_official` filters
- [x] `golang.org/x/{crypto,net,image,text}` dep bumps

### Batch 2 — billing + stream

- [x] `QuotaFromFloatStrict` / `QuotaRoundStrict` + pre-consume rejection
- [x] Stream write timeout / client disconnect hardening
- [x] Image stream disconnect + billing adjustments
- [x] OpenAI `cache_write_tokens` billing + uncached remainder clamp
- [x] Codex / prompt_cache field sync (affinity + DTOs)

### Batch 3 — protocol conversion (P2)

- [x] Full `service/relayconvert` registry (Claude/Gemini/OAI Chat/Responses)
- [x] `dto/billing_usage` + `service/billing_usage`
- [x] Advanced Custom: path/model matching, `openai_responses_to_gemini`, regex cache
- [x] Pricing advanced-custom endpoint inference (lock order documented)
- [x] Thin `service/convert.go` wrappers
- [x] GetUserModels `?group=` filter
- [x] Warm `GetPricing()` after channel cache init

## Verification

```bash
go build -o /tmp/youbox-build ./
go test ./... -count=1   # exit 0, no FAIL packages
```

Last verified: 2026-07-12 on branch `feat/upstream-backend-b1-b3`.

## Residual / notes

- Frontend models already support `status`/`sync_official` query params in types/API; backend now honors them.
- YouBox plaza still requires model metadata for listing (tests updated to insert meta where needed).
- Do not broad-merge upstream `web/` or classic theme.
