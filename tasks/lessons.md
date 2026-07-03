# Lessons

- Project deployment target for this repository is `api.you-box.com` on the `jpdata` server, not `amp.you-box.com` and not the shared `api.xiaomao.chat` gateway. Check project-specific deployment notes before assuming a host from global VPS inventory.
- Provider model IDs are not compatibility aliases across vendors: OpenAI audio models (`tts-1`, `whisper-1`) must not fallback or translate to ElevenLabs models. Keep routing exact by provider/channel; add explicit channel/API/endpoint types instead of cross-provider fallbacks.
- Model plaza catalog descriptions are product copy, not opaque backend data: when adding default provider/model metadata, expose stable i18n keys from the backend and translate in the frontend data layer with all supported locales, instead of showing backend English literals directly.
