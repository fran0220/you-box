# Gateway R2 Media Storage

Durable object storage for **Origin Gateway** AI-generated media and user uploads.

This plane is **not** the OriginGame Asset Worker catalog (`origingame-assets-*`, `asset-mcp.origingame.dev`). Catalog assets stay on the Cloudflare Asset Worker + Vectorize stack.

## Bucket

| Item | Value |
|------|--------|
| Bucket | `origingame-gateway-media` (dedicated) |
| Access | Private (no public bucket ACL) |
| API | S3-compatible (`*.r2.cloudflarestorage.com`) |
| Downloads | Gateway authorizes → **302** to short-lived R2 presigned URL |

**Forbidden:** never point `R2_BUCKET` at `origingame-assets*`, `*renditions*`, or `*search*` — startup validation refuses those names.

## Env

```bash
R2_ENABLED=false
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=          # API token scoped ONLY to origingame-gateway-media
R2_SECRET_ACCESS_KEY=
R2_BUCKET=origingame-gateway-media
# Optional override:
# R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com

R2_MAX_OBJECT_MB=512       # generated media hard cap
R2_UPLOAD_MAX_MB=25        # user upload hard cap
R2_USER_UPLOAD_QUOTA_MB=500
R2_GEN_TTL_DAYS=90         # 0 = permanent metadata
R2_UPLOAD_TTL_DAYS=7
R2_PERSIST_IMAGES=false    # Phase 2: rewrite image gen URLs
R2_PRESIGN_TTL_SECONDS=900
```

Also ensure `SESSION_SECRET` / `CRYPTO_SECRET` are stable — media signed URLs use `CRYPTO_SECRET` (fallback `SESSION_SECRET`).

## Key layout

```
gen/video/{yyyy}/{mm}/u{userId}/{publicId}.mp4
gen/image/{yyyy}/{mm}/u{userId}/{publicId}.{ext}
upload/{yyyy}/{mm}/u{userId}/{publicId}.{ext}
```

`publicId` is 32 hex chars (unguessable API id).

## HTTP API

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/v1/media/:id/content` | Bearer **or** `?exp=&sig=` | 302 → R2; `?stream=1` proxies |
| `GET` | `/v1/media/:id` | Bearer / session | Metadata |
| `POST` | `/v1/media/uploads` | Bearer / session | Raw body or multipart `file` |
| `DELETE` | `/v1/media/:id` | Owner / admin | Soft-delete + R2 delete |

Signed content URL (for `<img>` / `<video>` without Authorization):

```
{ServerAddress}/v1/media/{publicId}/content?exp={unix}&sig={hmac}
sig = HMAC_SHA256_HEX(CRYPTO_SECRET, "{publicId}:{exp}")
```

Helper: `service.BuildMediaURL(publicId, ttl)`.

## Integration

### Video tasks

On successful async video poll (`service/task_polling.go`), if the adaptor returned a direct `http(s)` result URL and R2 is enabled, a **background worker** streams the file into R2 and rewrites `task.PrivateData.ResultURL` to `/v1/media/{id}/content`.

`VideoProxy` (`GET /v1/videos/:task_id/content`) checks for a linked `media_objects` row first and redirects to R2 when present; otherwise falls back to legacy upstream proxy.

### Images

`R2_PERSIST_IMAGES` is reserved for Phase 2 (rewrite OpenAI-compatible `data[].url` after generations). Default off.

## Code map

| Path | Role |
|------|------|
| `pkg/r2/` | S3 client + config + bucket guards |
| `model/media_object.go` | GORM metadata (`media_objects`) |
| `service/media_storage.go` | Persist, sign, presign |
| `service/media_persist_worker.go` | Async queue + janitor |
| `controller/media.go` | HTTP handlers |
| `router/media-router.go` | Routes |

## Ops checklist (BWG)

1. Create R2 API token with **Object Read & Write** on `origingame-gateway-media` only.
2. Set env on `/opt/origin-gateway/.env` (or compose), `R2_ENABLED=true`.
3. Deploy / restart gateway; confirm log: `media storage: R2 enabled bucket=...`.
4. Optional: Cloudflare lifecycle rules on prefixes `upload/` (7d) and `gen/` (90d) to match TTL.
5. Smoke:

```bash
# upload
curl -sS -X POST https://api.origingame.dev/v1/media/uploads \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: image/png" \
  --data-binary @test.png

# content (follow redirects)
curl -sSIL -H "Authorization: Bearer sk-..." \
  https://api.origingame.dev/v1/media/<id>/content
```

## Failure modes

| Case | Behavior |
|------|----------|
| `R2_ENABLED=false` / misconfig | All media APIs unavailable; video/image paths use existing provider URLs / VideoProxy |
| R2 outage during persist | Task still succeeds; ResultURL stays provider/proxy URL |
| Queue full | Job dropped + error log |
| Expired object | GET → 404; janitor soft-deletes + best-effort R2 delete |

## Red lines

1. Do **not** write game catalog objects to Asset Worker buckets.
2. Do **not** store large media on the BWG disk.
3. Do **not** log raw R2 secrets or full presigned URLs in user-facing errors.
4. Do **not** treat this bucket as a substitute for OriginGame immutable release catalog.
