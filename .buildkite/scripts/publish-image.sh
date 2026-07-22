#!/usr/bin/env bash
# Build and push Origin Gateway images to GHCR (linux/amd64).
# Intended for Buildkite agents; safe to run locally with the same env.
set -euo pipefail

REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-fran0220/origin-gateway}"
LEGACY_IMAGE_NAME="${LEGACY_IMAGE_NAME:-fran0220/you-box}"
PLATFORM="${PLATFORM:-linux/amd64}"
GHCR_USERNAME="${GHCR_USERNAME:-fran0220}"

log() { echo "~~~ $*" >&2; }
die() { echo "error: $*" >&2; exit 1; }

# --- resolve version ---
# Priority: explicit VERSION env → Buildkite tag → Buildkite commit → VERSION file → local short sha
resolve_version() {
  if [[ -n "${VERSION:-}" ]]; then
    echo "${VERSION}"
    return
  fi
  if [[ -n "${BUILDKITE_TAG:-}" ]]; then
    echo "${BUILDKITE_TAG}"
    return
  fi
  if [[ -n "${BUILDKITE_COMMIT:-}" ]]; then
    echo "${BUILDKITE_COMMIT:0:12}"
    return
  fi
  if [[ -f VERSION ]]; then
    tr -d '[:space:]' < VERSION
    return
  fi
  git rev-parse --short=12 HEAD
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing command: $1"
}

require_cmd docker
require_cmd git

VERSION="$(resolve_version)"
[[ -n "${VERSION}" ]] || die "empty VERSION"
echo "${VERSION}" > VERSION

IMAGE="${REGISTRY}/${IMAGE_NAME}"
LEGACY="${REGISTRY}/${LEGACY_IMAGE_NAME}"

TAGS=(
  "${IMAGE}:${VERSION}"
  "${LEGACY}:${VERSION}"
)
if [[ "${VERSION}" == v* ]]; then
  TAGS+=("${IMAGE}:main" "${LEGACY}:main")
fi
if [[ -n "${FLOATING_TAG:-}" ]]; then
  TAGS+=("${IMAGE}:${FLOATING_TAG}" "${LEGACY}:${FLOATING_TAG}")
fi

log "version=${VERSION}"
log "platform=${PLATFORM}"
log "tags:"
for t in "${TAGS[@]}"; do
  echo "  - ${t}"
done

# --- login GHCR ---
if [[ -z "${GHCR_TOKEN:-}" ]]; then
  die "GHCR_TOKEN is not set (GitHub PAT with write:packages, or Actions-style token)"
fi

log "docker login ${REGISTRY}"
echo "${GHCR_TOKEN}" | docker login "${REGISTRY}" -u "${GHCR_USERNAME}" --password-stdin

# --- buildx builder ---
# Reuse one builder per long-lived agent instead of leaking a container per build.
BUILDER_NAME="origin-gateway-${BUILDKITE_AGENT_ID:-local}"
if ! docker buildx inspect "${BUILDER_NAME}" >/dev/null 2>&1; then
  log "creating buildx builder ${BUILDER_NAME}"
  docker buildx create --name "${BUILDER_NAME}" --driver docker-container --use
else
  docker buildx use "${BUILDER_NAME}"
fi
docker buildx inspect --bootstrap >/dev/null

TAG_ARGS=()
for t in "${TAGS[@]}"; do
  TAG_ARGS+=(--tag "${t}")
done

# Local registry cache on the agent speeds rebuilds vs cold GitHub Actions.
CACHE_REF="${REGISTRY}/${IMAGE_NAME}:buildcache"
CACHE_ARGS=(
  --cache-from "type=registry,ref=${CACHE_REF}"
  --cache-to "type=registry,ref=${CACHE_REF},mode=max"
)

log "docker buildx build (push)"
docker buildx build \
  --platform "${PLATFORM}" \
  --push \
  --provenance=false \
  --sbom=false \
  "${CACHE_ARGS[@]}" \
  "${TAG_ARGS[@]}" \
  .

log "published ${IMAGE}:${VERSION}"
if [[ -n "${BUILDKITE_AGENT_ACCESS_TOKEN:-}" ]] && command -v buildkite-agent >/dev/null 2>&1; then
  buildkite-agent annotate --style success \
    "Published \`${IMAGE}:${VERSION}\` (legacy \`${LEGACY}:${VERSION}\`) platform=${PLATFORM}"
  buildkite-agent meta-data set "image.version" "${VERSION}"
  buildkite-agent meta-data set "image.primary" "${IMAGE}:${VERSION}"
fi

echo "IMAGE=${IMAGE}:${VERSION}"
echo "LEGACY=${LEGACY}:${VERSION}"
