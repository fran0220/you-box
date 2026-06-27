<div align="center">

![BoxAI](/web/default/public/logo.png)

# BoxAI

🍥 **Next-Generation LLM Gateway and AI Asset Management System**

<p align="center">
  <a href="./README.zh_CN.md">简体中文</a> |
  <a href="./README.zh_TW.md">繁體中文</a> |
  <strong>English</strong> |
  <a href="./README.fr.md">Français</a> |
  <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/fran0220/you-box/main/LICENSE">
    <img src="https://img.shields.io/github/license/fran0220/you-box?color=brightgreen" alt="license">
  </a><!--
  --><a href="https://github.com/fran0220/you-box/releases/latest">
    <img src="https://img.shields.io/github/v/release/fran0220/you-box?color=brightgreen&include_prereleases" alt="release">
  </a><!--
  --><a href="https://github.com/fran0220/you-box">
    <img src="https://img.shields.io/badge/docker-dockerHub-blue" alt="docker">
  </a><!--
  --><a href="https://goreportcard.com/report/github.com/fran0220/you-box">
    <img src="https://goreportcard.com/badge/github.com/fran0220/you-box" alt="GoReportCard">
  </a>
</p>

<p align="center">
  <a href="https://trendshift.io/repositories/20180" target="_blank">
    <img src="https://trendshift.io/api/badge/repositories/20180" alt="fran0220%2Fyou-box | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/>
  </a>
  <br>
  <a href="https://hellogithub.com/repository/fran0220/you-box" target="_blank">
    <img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=539ac4217e69431684ad4a0bab768811&claim_uid=tbFPfKIDHpc4TzR" alt="Featured｜HelloGitHub" style="width: 250px; height: 54px;" width="250" height="54" />
  </a><!--
  --><a href="https://www.producthunt.com/products/you-box/launches/you-box?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-you-box" target="_blank" rel="noopener noreferrer">
    <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1047693&theme=light&t=1769577875005" alt="BoxAI - All-in-one AI asset management gateway. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" />
  </a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-help-support">Help</a>
</p>

</div>

## 📝 Project Description

> [!IMPORTANT]
> - This project is intended solely for lawful and authorized AI API gateway, organization-level authentication, multi-model management, usage analytics, cost accounting, and private deployment scenarios.
> - Users must lawfully obtain upstream API keys, accounts, model services, and interface permissions, and must comply with upstream terms of service and applicable laws and regulations.
> - Users should ensure their use complies with upstream terms of service and applicable laws and regulations.
> - When providing generative AI services to the public, users should comply with applicable regulatory requirements and fulfill all filing, licensing, content safety, real-name verification, log retention, tax, and upstream authorization obligations required by their jurisdiction.

---

## 🤝 Trusted Partners

<p align="center">
  <em>No particular order</em>
</p>

<p align="center">
  <a href="https://www.cherry-ai.com/" target="_blank">
    <img src="./docs/images/cherry-studio.png" alt="Cherry Studio" height="80" />
  </a><!--
  --><a href="https://github.com/iOfficeAI/AionUi/" target="_blank">
    <img src="./docs/images/aionui.png" alt="Aion UI" height="80" />
  </a><!--
  --><a href="https://bda.pku.edu.cn/" target="_blank">
    <img src="./docs/images/pku.png" alt="Peking University" height="80" />
  </a><!--
  --><a href="https://www.compshare.cn/?ytag=GPU_yy_boxai" target="_blank">
    <img src="./docs/images/ucloud.png" alt="UCloud" height="80" />
  </a><!--
  --><a href="https://www.aliyun.com/" target="_blank">
    <img src="./docs/images/aliyun.png" alt="Alibaba Cloud" height="80" />
  </a><!--
  --><a href="https://io.net/" target="_blank">
    <img src="./docs/images/io-net.png" alt="IO.NET" height="80" />
  </a>
</p>

---

## 🙏 Special Thanks

<p align="center">
  <a href="https://www.jetbrains.com/?from=you-box" target="_blank">
    <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.png" alt="JetBrains Logo" width="120" />
  </a>
</p>

<p align="center">
  <strong>Thanks to <a href="https://www.jetbrains.com/?from=you-box">JetBrains</a> for providing free open-source development license for this project</strong>
</p>

---

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the project
git clone https://github.com/fran0220/you-box.git
cd you-box

# Edit docker-compose.yml configuration
nano docker-compose.yml

# Start the service
docker-compose up -d
```

<details>
<summary><strong>Using Docker Commands</strong></summary>

```bash
# Pull the latest image
docker compose build new-api

# Using SQLite (default)
docker run --name you-box -d --restart always \
  -p 3000:3000 \
  -e TZ=Asia/Shanghai \
  -v ./data:/data \
  boxai:local

# Using MySQL
docker run --name you-box -d --restart always \
  -p 3000:3000 \
  -e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi" \
  -e TZ=Asia/Shanghai \
  -v ./data:/data \
  boxai:local
```

> **💡 Tip:** `-v ./data:/data` will save data in the `data` folder of the current directory, you can also change it to an absolute path like `-v /your/custom/path:/data`

</details>

---

🎉 After deployment is complete, visit `http://localhost:3000` to start using!

> [!WARNING]
> When operating this project as a public generative AI service or API resale service, users should first complete all required filing, licensing, content safety, real-name verification, log retention, tax, payment, and upstream authorization obligations.

📖 For more deployment methods, please refer to [Deployment Guide](https://api.you-box.com/api-docs/installation)

---

## 📚 Documentation

<div align="center">

### 📖 [Official Documentation](https://api.you-box.com/api-docs) | [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/fran0220/you-box)

</div>

**Quick Navigation:**

| Category | Link |
|------|------|
| 🚀 Deployment Guide | [Installation Documentation](https://api.you-box.com/api-docs/installation) |
| ⚙️ Environment Configuration | [Environment Variables](https://api.you-box.com/api-docs/installation/config-maintenance/environment-variables) |
| 📡 API Documentation | [API Documentation](https://api.you-box.com/api-docs/api) |
| ❓ FAQ | [FAQ](https://api.you-box.com/api-docs/support/faq) |
| 💬 Community Interaction | [Communication Channels](https://api.you-box.com/api-docs/support/community-interaction) |

---

## ✨ Key Features

> For detailed features, please refer to [Features Introduction](https://api.you-box.com/api-docs/guide/wiki/basic-concepts/features-introduction)

### 🎨 Core Functions

| Feature | Description |
|------|------|
| 🎨 New UI | Modern user interface design |
| 🌍 Multi-language | Supports Simplified Chinese, Traditional Chinese, English, French, Japanese |
| 🔄 Data Compatibility | Fully compatible with the original One API database |
| 📈 Data Dashboard | Visual console and statistical analysis |
| 🔒 Permission Management | Token grouping, model restrictions, user management |

### 💰 Authorized Usage Accounting and Billing

- ✅ Internal top-up and quota allocation for lawful authorized scenarios (EPay, Stripe)
- ✅ Organization-level per-request, usage-based, and cache-hit cost accounting
- ✅ Cache billing statistics for OpenAI, Azure, DeepSeek, Claude, Qwen, and supported models
- ✅ Flexible billing policies for internal management or authorized enterprise customers

### 🔐 Authorization and Security

- 😈 Discord authorization login
- 🤖 LinuxDO authorization login
- 📱 Telegram authorization login
- 🔑 OIDC unified authentication
- 🔍 Key quota query usage (with [you-box-key-tool](https://github.com/fran0220/you-box-key-tool))

### 🚀 Advanced Features

**API Format Support:**
- ⚡ [OpenAI Responses](https://api.you-box.com/api-docs/api/ai-model/chat/openai/create-response)
- ⚡ [OpenAI Realtime API](https://api.you-box.com/api-docs/api/ai-model/realtime/create-realtime-session) (including Azure)
- ⚡ [Claude Messages](https://api.you-box.com/api-docs/api/ai-model/chat/create-message)
- ⚡ [Google Gemini](https://api.you-box.com/api-docs/api/ai-model/chat/gemini/geminirelayv1beta)
- 🔄 [Rerank Models](https://api.you-box.com/api-docs/api/ai-model/rerank/create-rerank) (Cohere, Jina)

**Intelligent Routing:**
- ⚖️ Channel weighted random
- 🔄 Automatic retry on failure
- 🚦 User-level model rate limiting

**Format Conversion:**
- 🔄 **OpenAI Compatible ⇄ Claude Messages**
- 🔄 **OpenAI Compatible → Google Gemini**
- 🔄 **Google Gemini → OpenAI Compatible** - Text only, function calling not supported yet
- 🚧 **OpenAI Compatible ⇄ OpenAI Responses** - In development
- 🔄 **Thinking-to-content functionality**

**Reasoning Effort Support:**

<details>
<summary>View detailed configuration</summary>

**OpenAI series models:**
- `o3-mini-high` - High reasoning effort
- `o3-mini-medium` - Medium reasoning effort
- `o3-mini-low` - Low reasoning effort
- `gpt-5-high` - High reasoning effort
- `gpt-5-medium` - Medium reasoning effort
- `gpt-5-low` - Low reasoning effort

**Claude thinking models:**
- `claude-3-7-sonnet-20250219-thinking` - Enable thinking mode

**Google Gemini series models:**
- `gemini-2.5-flash-thinking` - Enable thinking mode
- `gemini-2.5-flash-nothinking` - Disable thinking mode
- `gemini-2.5-pro-thinking` - Enable thinking mode
- `gemini-2.5-pro-thinking-128` - Enable thinking mode with thinking budget of 128 tokens
- You can also append `-low`, `-medium`, or `-high` to any Gemini model name to request the corresponding reasoning effort (no extra thinking-budget suffix needed).

</details>

---

## 🤖 Model Support

> For details, please refer to [API Documentation - Gateway Interface](https://api.you-box.com/api-docs/api)

| Model Type | Description | Documentation |
|---------|------|------|
| 🤖 OpenAI-Compatible | OpenAI compatible models | [Documentation](https://api.you-box.com/api-docs/api/ai-model/chat/openai/createchatcompletion) |
| 🤖 OpenAI Responses | OpenAI Responses format | [Documentation](https://api.you-box.com/api-docs/api/ai-model/chat/openai/createresponse) |
| 🎨 Midjourney-Proxy | [Midjourney-Proxy(Plus)](https://github.com/novicezk/midjourney-proxy) | [Documentation](https://api.you-box.com/api-docs/api) |
| 🎵 Suno-API | [Suno API](https://github.com/Suno-API/Suno-API) | [Documentation](https://api.you-box.com/api-docs/api) |
| 🔄 Rerank | Cohere, Jina | [Documentation](https://api.you-box.com/api-docs/api/ai-model/rerank/creatererank) |
| 💬 Claude | Messages format | [Documentation](https://api.you-box.com/api-docs/api/ai-model/chat/createmessage) |
| 🌐 Gemini | Google Gemini format | [Documentation](https://api.you-box.com/api-docs/api/ai-model/chat/gemini/geminirelayv1beta) |
| 🔧 Dify | ChatFlow mode | - |
| 🎯 Custom upstream | Supports configuring legally authorized upstream endpoints | - |

### 📡 Supported Interfaces

<details>
<summary>View complete interface list</summary>

- [Chat Interface (Chat Completions)](https://api.you-box.com/api-docs/api/ai-model/chat/openai/createchatcompletion)
- [Response Interface (Responses)](https://api.you-box.com/api-docs/api/ai-model/chat/openai/createresponse)
- [Image Interface (Image)](https://api.you-box.com/api-docs/api/ai-model/images/openai/post-v1-images-generations)
- [Audio Interface (Audio)](https://api.you-box.com/api-docs/api/ai-model/audio/openai/create-transcription)
- [Video Interface (Video)](https://api.you-box.com/api-docs/api/ai-model/audio/openai/createspeech)
- [Embedding Interface (Embeddings)](https://api.you-box.com/api-docs/api/ai-model/embeddings/createembedding)
- [Rerank Interface (Rerank)](https://api.you-box.com/api-docs/api/ai-model/rerank/creatererank)
- [Realtime Conversation (Realtime)](https://api.you-box.com/api-docs/api/ai-model/realtime/createrealtimesession)
- [Claude Chat](https://api.you-box.com/api-docs/api/ai-model/chat/createmessage)
- [Google Gemini Chat](https://api.you-box.com/api-docs/api/ai-model/chat/gemini/geminirelayv1beta)

</details>

---

## 🚢 Deployment

> [!TIP]
> **Latest Docker image:** `boxai:local`

### 📋 Deployment Requirements

| Component | Requirement |
|------|------|
| **Local database** | SQLite (Docker must mount `/data` directory)|
| **Remote database** | MySQL ≥ 5.7.8 or PostgreSQL ≥ 9.6 |
| **Container engine** | Docker / Docker Compose |

### ⚙️ Environment Variable Configuration

<details>
<summary>Common environment variable configuration</summary>

| Variable Name | Description | Default Value |
|--------|------|--------|
| `SESSION_SECRET` | Session secret (required for multi-machine deployment) | - |
| `CRYPTO_SECRET` | Encryption secret (required for Redis) | - |
| `SQL_DSN` | Database connection string | - |
| `REDIS_CONN_STRING` | Redis connection string | - |
| `RELAY_IDLE_CONN_TIMEOUT` | Idle keep-alive timeout for relay HTTP clients, seconds. Defaults to Go standard library behavior; set `0` to disable | `90` |
| `STREAMING_TIMEOUT` | Streaming timeout (seconds) | `300` |
| `STREAM_SCANNER_MAX_BUFFER_MB` | Max per-line buffer (MB) for the stream scanner; increase when upstream sends huge image/base64 payloads | `64` |
| `MAX_REQUEST_BODY_MB` | Max request body size (MB, counted **after decompression**; prevents huge requests/zip bombs from exhausting memory). Exceeding it returns `413` | `32` |
| `AZURE_DEFAULT_API_VERSION` | Azure API version | `2025-04-01-preview` |
| `ERROR_LOG_ENABLED` | Error log switch | `false` |
| `PYROSCOPE_URL` | Pyroscope server address | - |
| `PYROSCOPE_APP_NAME` | Pyroscope application name | `you-box` |
| `PYROSCOPE_BASIC_AUTH_USER` | Pyroscope basic auth user | - |
| `PYROSCOPE_BASIC_AUTH_PASSWORD` | Pyroscope basic auth password | - |
| `PYROSCOPE_MUTEX_RATE` | Pyroscope mutex sampling rate | `5` |
| `PYROSCOPE_BLOCK_RATE` | Pyroscope block sampling rate | `5` |
| `HOSTNAME` | Hostname tag for Pyroscope | `you-box` |

📖 **Complete configuration:** [Environment Variables Documentation](https://api.you-box.com/api-docs/installation/config-maintenance/environment-variables)

</details>

### 🔧 Deployment Methods

<details>
<summary><strong>Method 1: Docker Compose (Recommended)</strong></summary>

```bash
# Clone the project
git clone https://github.com/fran0220/you-box.git
cd you-box

# Edit configuration
nano docker-compose.yml

# Start service
docker-compose up -d
```

</details>

<details>
<summary><strong>Method 2: Docker Commands</strong></summary>

**Using SQLite:**
```bash
docker run --name you-box -d --restart always \
  -p 3000:3000 \
  -e TZ=Asia/Shanghai \
  -v ./data:/data \
  boxai:local
```

**Using MySQL:**
```bash
docker run --name you-box -d --restart always \
  -p 3000:3000 \
  -e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi" \
  -e TZ=Asia/Shanghai \
  -v ./data:/data \
  boxai:local
```

> **💡 Path explanation:**
> - `./data:/data` - Relative path, data saved in the data folder of the current directory
> - You can also use absolute path, e.g.: `/your/custom/path:/data`

</details>

<details>
<summary><strong>Method 3: BaoTa Panel</strong></summary>

1. Install BaoTa Panel (≥ 9.2.0 version)
2. Search for **New-API** in the application store
3. One-click installation

📖 [Tutorial with images](./docs/BT.md)

</details>

### ⚠️ Multi-machine Deployment Considerations

> [!WARNING]
> - **Must set** `SESSION_SECRET` - Otherwise login status inconsistent
> - **Shared Redis must set** `CRYPTO_SECRET` - Otherwise data cannot be decrypted

### 🔄 Channel Retry and Cache

**Retry configuration:** `Settings → Operation Settings → General Settings → Failure Retry Count`

**Cache configuration:**
- `REDIS_CONN_STRING`: Redis cache (recommended)
- `MEMORY_CACHE_ENABLED`: Memory cache

---

## 🔗 Related Projects

### Upstream Projects

| Project | Description |
|------|------|
| [One API](https://github.com/songquanpeng/one-api) | Original project base |
| [Midjourney-Proxy](https://github.com/novicezk/midjourney-proxy) | Midjourney interface support |

### Supporting Tools

| Project | Description |
|------|------|
| [you-box-key-tool](https://github.com/fran0220/you-box-key-tool) | Key quota query tool |
| [you-box-horizon](https://github.com/fran0220/you-box-horizon) | BoxAI high-performance optimized version |

---

## 💬 Help Support

### 📖 Documentation Resources

| Resource | Link |
|------|------|
| 📘 FAQ | [FAQ](https://api.you-box.com/api-docs/support/faq) |
| 💬 Community Interaction | [Communication Channels](https://api.you-box.com/api-docs/support/community-interaction) |
| 🐛 Issue Feedback | [Issue Feedback](https://api.you-box.com/api-docs/support/feedback-issues) |
| 📚 Complete Documentation | [Official Documentation](https://api.you-box.com/api-docs) |

### 🤝 Contribution Guide

Welcome all forms of contribution!

- 🐛 Report Bugs
- 💡 Propose New Features
- 📝 Improve Documentation
- 🔧 Submit Code

---

## 📜 License

This project is licensed under the [GNU Affero General Public License v3.0 (AGPLv3)](./LICENSE).

Additional terms under AGPLv3 Section 7 apply. Modified versions must preserve
the author attribution notice `Frontend design and development by BoxAI
contributors.` in the appropriate legal notices and in any prominent about,
legal, footer, or attribution location presented by the user interface.

Modified versions that present a user interface must also preserve a visible
link to the original project: <https://github.com/fran0220/you-box>.

This is an open-source project developed based on [One API](https://github.com/songquanpeng/one-api) (MIT License).

If your organization's policies do not permit AGPLv3-licensed software, consult your legal counsel before deploying or distributing modified versions.

---

## 🌟 Star History

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=fran0220/you-box&type=Date)](https://star-history.com/#fran0220/you-box&Date)

</div>

---

<div align="center">

### 💖 Thank you for using BoxAI

If this project is helpful to you, welcome to give us a ⭐️ Star！

**[Official Documentation](https://api.you-box.com/api-docs)** • **[Issue Feedback](https://github.com/fran0220/you-box/issues)** • **[Latest Release](https://github.com/fran0220/you-box/releases)**

<sub>Built with ❤️ by BoxAI contributors</sub>

</div>
