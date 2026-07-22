# Buildkite — Origin Gateway auxiliary image publishing

GitHub Actions on free runners is slow for multi-stage (Bun frontend + Go) amd64 images.
Use **Buildkite** with your own agent (local Mac, or a beefy linux/amd64 host)
when a registry image is needed. This is an auxiliary artifact path; current BWG
production deploys remain native binary + systemd as documented in `docs/deploy.md`.

## Security first

| Secret | Where it lives | Commit to git? |
| --- | --- | --- |
| **Agent token** (`bkct_…`) | Only on the machine running `buildkite-agent` (`buildkite-agent.cfg`) | **Never** |
| **GHCR_TOKEN** | Agent environment or Buildkite cluster secrets | **Never** |

If an agent token was pasted into chat, email, or a ticket: **rotate it in Buildkite** (Agents → token revoke/regenerate) and update the agent config. Treat the old token as compromised.

## 1. Create pipeline (Buildkite UI)

1. Open [Buildkite](https://buildkite.com) → your org → **New pipeline**.
2. Connect GitHub repo `fran0220/you-box`.
3. Steps source: **Upload from repository**
   Path: `.buildkite/pipeline.yml`
4. Recommended GitHub triggers:
   - **Tags**: `v*` (release publish)
   - Optional: manual builds with env `VERSION=v0.1.x`
5. Save. Note the pipeline slug (e.g. `origin-gateway`).

Webhooks: Buildkite’s GitHub App or webhook should already fire on tag push after the repo is connected.

## 2. Install agent (where Docker is fast)

### Option A — Apple Silicon Mac (Docker Desktop)

Works, but **`linux/amd64` uses QEMU** and can still be slow. Prefer Option B if available.

```bash
# macOS (Homebrew)
brew install buildkite/buildkite/buildkite-agent

# Run the service and own its files as the current Homebrew user.
BREW_PREFIX="$(brew --prefix)"
AGENT_DIR="$BREW_PREFIX/etc/buildkite-agent"
mkdir -p "$AGENT_DIR/hooks" \
  "$BREW_PREFIX/var/buildkite-agent/builds" \
  "$BREW_PREFIX/var/buildkite-agent/plugins"

cat >"$AGENT_DIR/buildkite-agent.cfg" <<EOF
token="REPLACE_WITH_AGENT_TOKEN"
name="%hostname-%n"
tags="queue=default,os=macos,arch=arm64"
build-path="$BREW_PREFIX/var/buildkite-agent/builds"
hooks-path="$AGENT_DIR/hooks"
plugins-path="$BREW_PREFIX/var/buildkite-agent/plugins"
EOF

# secrets for GHCR push (do not put token in the cfg file above if you prefer env)
cat >"$AGENT_DIR/hooks/environment" <<'EOF'
#!/bin/bash
set -euo pipefail
# Prefer a PAT with packages:write, not your password.
export GHCR_USERNAME="${GHCR_USERNAME:-fran0220}"
export GHCR_TOKEN="REPLACE_WITH_GHCR_PAT"
export REGISTRY=ghcr.io
export IMAGE_NAME=fran0220/origin-gateway
export LEGACY_IMAGE_NAME=fran0220/you-box
export PLATFORM=linux/amd64
EOF
chmod 700 "$AGENT_DIR/hooks/environment"
chmod 600 "$AGENT_DIR/buildkite-agent.cfg"

brew services start buildkite-agent
# or: buildkite-agent start
```

### Option B — linux/amd64 VM or host (recommended)

Same config idea; install agent from [Buildkite install docs](https://buildkite.com/docs/agent/v3/installation).
Native amd64 avoids QEMU and matches BWG (`linux/amd64`).

Do **not** put the agent on memory-starved `bwg` for full frontend+Go builds.

## 3. GHCR credentials

Create a GitHub classic PAT (or fine-grained with Packages write on `fran0220/you-box` / org packages):

- `write:packages`
- `read:packages`
- (classic) often also needs `repo` if the package is linked to a private repo

Login test on the agent host:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u fran0220 --password-stdin
```

## 4. What the pipeline does

File: `.buildkite/pipeline.yml` → runs `.buildkite/scripts/publish-image.sh`

1. Resolves version: `VERSION` env → `BUILDKITE_TAG` → Buildkite commit SHA → local `VERSION` file → local short SHA
2. Tags:
   - `ghcr.io/fran0220/origin-gateway:<version>`
   - `ghcr.io/fran0220/you-box:<version>` (legacy)
   - if version is `v*`: also `:main` on both names
3. `docker buildx build --platform linux/amd64 --push`
4. Registry cache tag: `ghcr.io/fran0220/origin-gateway:buildcache` (speeds rebuilds)

Local publish (no Buildkite; this pushes to GHCR):

```bash
export GHCR_TOKEN=… GHCR_USERNAME=fran0220 VERSION=v0.1.18
.buildkite/scripts/publish-image.sh
```

## 5. Production deployment relationship

Publishing an image does **not** deploy production. BWG currently receives the
verified static binary from `.github/workflows/ci.yml` and runs it through
`origin-gateway.service`. Follow `docs/deploy.md` for inspection and rollback.
Do not replace that path with Compose without a coordinated deployment migration.

## 6. Relationship to GitHub Actions

| Path | Role |
| --- | --- |
| `.github/workflows/ci.yml` | Required verification and native BWG deployment on `main` |
| `.buildkite/pipeline.yml` | Optional registry image publishing on a self-hosted agent |

Buildkite is not a fallback production deploy and must not bypass the GitHub
Actions verification path.

## 7. Common failures

| Symptom | Fix |
| --- | --- |
| Job stuck “Waiting for agent” | Agent not running / wrong `queue` tag |
| `GHCR_TOKEN is not set` | Fix agent `hooks/environment` or cluster secret |
| `bun install --frozen-lockfile` fails | Commit updated `web/bun.lock` after package.json changes |
| amd64 build very slow on Mac | Use linux/amd64 agent or accept QEMU cost |
| `denied` pushing package | PAT scope / package visibility / org SSO authorize |

## 8. Agent token format

Buildkite agent tokens look like `bkct_…`.
They only register the agent process with Buildkite; they are **not** used inside pipeline steps and must **never** appear in `.buildkite/pipeline.yml`, git history, or chat logs you keep around.
