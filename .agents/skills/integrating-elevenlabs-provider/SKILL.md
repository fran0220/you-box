---
name: integrating-elevenlabs-provider
description: Integrates, updates, or reviews the YouBox ElevenLabs provider, including native audio endpoints, model plaza catalog metadata, pricing docs, and i18n. Use when touching ElevenLabs routing, model IDs, endpoint types, smoke tests, or catalog presentation.
---

# Integrating ElevenLabs Provider

Use this skill when adding, changing, or reviewing ElevenLabs support in YouBox.

ElevenLabs is a **native multi-endpoint audio provider**, not an OpenAI audio alias. Keep routing, catalog metadata, docs, tests, and i18n aligned.

## Non-negotiables

- Do **not** fallback OpenAI `tts-1`, `whisper-1`, or any OpenAI audio model to ElevenLabs.
- Do **not** mix ElevenLabs model IDs with OpenAI-compatible model IDs unless the specific route is intentionally OpenAI-compatible.
- Keep provider routing exact by `channel_type`, API route, and model ID.
- Never commit or expose real ElevenLabs API keys. Use environment variables, admin channel config, or temporary smoke-test tokens that are deleted after testing.
- Support SQLite, MySQL, and PostgreSQL; use GORM and existing config patterns for persistent data.
- Use `common.*` JSON wrappers in Go business code.

## Current public model catalog

Expose only the curated current models in the model plaza unless the product owner asks otherwise:

| Model | Capability | Endpoint type |
| --- | --- | --- |
| `eleven_v3` | Text to speech | `audio-tts` |
| `scribe_v2` | Speech to text | `audio-stt` |
| `eleven_multilingual_sts_v2` | Speech to speech | `audio-speech-to-speech` |
| `eleven_text_to_sound_v2` | Sound effects | `audio-sfx` |
| `music_v2` | Music generation | `audio-music` |
| `elevenlabs-audio-isolation` | Audio isolation | `audio-isolation` |
| `elevenlabs-forced-alignment` | Forced alignment | `audio-alignment` |

Hide legacy/internal aliases from the model plaza even if a channel can route them internally.

## Backend integration checklist

1. **Channel identity**
   - Add/maintain the ElevenLabs channel type in `constant/`, channel labels in `common/`, distributor registration in `middleware/`, and channel UI mapping in `web/default/src/features/channels/`.
   - Keep ElevenLabs as its own provider/channel; do not branch from OpenAI audio semantics except where the public route is deliberately OpenAI-compatible.

2. **Routes and adaptor**
   - Native routes live under `/elevenlabs/v1/...`.
   - OpenAI-compatible speech/transcription routes may map to `/v1/audio/speech` and `/v1/audio/transcriptions`, but the underlying channel must still be ElevenLabs-specific.
   - Place provider code under `relay/channel/elevenlabs/` and keep request/response conversion localized there.

3. **Endpoint types**
   - Add capability-specific endpoint types in `constant/endpoint_type.go`.
   - Map default paths/methods in `common/endpoint_defaults.go`.
   - Map ElevenLabs model IDs to endpoint types in `common/endpoint_type.go`.

4. **Catalog metadata and pricing**
   - Curated defaults live in `model/pricing_default.go`.
   - Hidden aliases live in `pricingHiddenModels` in `model/pricing.go`.
   - Default metadata must include provider, icon, tags, English fallback description, and a stable `description_key` for i18n.
   - The pricing API should return both `description` and `description_key`; frontend translates the key and falls back to description.
   - Vendor metadata should also include `description_key` when the description is a built-in default.

## Frontend catalog checklist

- Add endpoint labels in `web/default/src/features/pricing/constants.ts`.
- Ensure fine-grained `audio-*` endpoint types roll up to the top-level `Audio` model type in `lib/model-type.ts`.
- Render capability labels in all model plaza surfaces that exist in the current branch (cards, list rows, table endpoint columns, and details).
- Add or verify the ElevenLabs built-in icon fallback in `lazy-lobe-icon.tsx`; do not rely solely on package icons if runtime imports are brittle.
- Generate API examples by capability, not by vendor name alone:
  - TTS: `/v1/audio/speech`
  - STT: `/v1/audio/transcriptions`
  - SFX: `/elevenlabs/v1/sound-generation`
  - Music: `/elevenlabs/v1/music/stream`
  - Speech-to-speech, isolation, alignment: their native `/elevenlabs/v1/...` routes.

## i18n rule for catalog copy

Model plaza descriptions are user-facing copy.

- Backend: expose stable `description_key` fields for built-in model/vendor descriptions.
- Frontend data layer: translate once in `usePricingData()` using `t(description_key, { defaultValue: description })`.
- Locale files: add translations for all supported locales: `en`, `zh`, `fr`, `ja`, `ru`, `vi`.
- Run `cd web/default && bun run i18n:sync` and inspect `_reports/_sync-report.json`.
- Do not translate user-customized DB descriptions unless a trusted built-in key is present.

## Smoke testing

Use temporary test tokens and delete them after testing.

Recommended coverage:

- TTS request succeeds for `eleven_v3`.
- STT request succeeds for `scribe_v2`.
- SFX request succeeds for `eleven_text_to_sound_v2`.
- Music request succeeds for `music_v2`.
- Audio isolation succeeds for `elevenlabs-audio-isolation`.
- Forced alignment succeeds for `elevenlabs-forced-alignment`.
- OpenAI `tts-1` and `whisper-1` do **not** route to ElevenLabs.
- `/api/pricing` returns exactly the curated visible ElevenLabs models, with descriptions, description keys, tags, vendor metadata, and fine-grained endpoint types.
- Browser-check `/pricing?search=eleven` and at least one detail API tab.

## Verification commands

Choose the narrowest meaningful set, then broaden if needed:

```bash
gofmt -w constant/endpoint_type.go common/endpoint_defaults.go common/endpoint_type.go model/pricing_default.go model/pricing.go relay/channel/elevenlabs/*.go
go test ./common ./model ./relay/channel/elevenlabs -count=1
cd web/default && bun run typecheck && bun run i18n:sync
```

For production deployment, follow the project `AGENTS.md` deployment policy for `jpdata` and verify `docker compose ps new-api` is healthy.
