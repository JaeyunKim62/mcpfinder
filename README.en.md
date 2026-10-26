# 🌐 MCPfinder — The Universal Model Context Protocol Directory

[한국어](README.md) | **English**

**👉 [mcpfinder-ashen.vercel.app](https://mcpfinder-ashen.vercel.app/)**

An open-source directory of **34,000+ Model Context Protocol (MCP) servers** that generates ready-to-paste configs for Claude Desktop, Cursor, Windsurf, Zed and Claude Code. Updated automatically every day.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Servers: 34,000+](https://img.shields.io/badge/Servers-34k%2B-emerald.svg)
![Auto Sync: Daily](https://img.shields.io/badge/Auto--Sync-Daily-sky.svg)

---

## ✨ Key Features

- **⚡ 34,000+ servers**: Aggregated and deduplicated from the Official MCP Registry, `punkpeye/awesome-mcp-servers`, and npm.
- **🔄 Daily auto-sync**: GitHub Actions fetches new and changed servers every day and commits them; Vercel redeploys automatically.
- **🛠️ Per-client config generator**:
  - One-click configs for **Claude Desktop**, **Cursor**, **Windsurf**, **Zed**, and **Claude Code CLI** (`claude mcp add`).
  - Type in API keys or database URLs and the config updates live.
- **🔍 Search & filters**:
  - 50+ categories (Databases, DevTools, Search, Coding Agents, Finance, …)
  - Filter by language (TypeScript, Python, Go, Rust), scope (local stdio vs cloud remote), official status, recent updates
  - Card and table views, `⌘K` (`Ctrl+K`) shortcut
- **🤖 Usable as an MCP server**: Let Claude find, recommend and configure MCP servers mid-conversation (see below).

---

## 🤖 Use as an MCP Server

The directory itself is an MCP server. Connect it and ask things like *"find me MCP servers for this project"*.

```bash
claude mcp add --transport http mcpfinder https://mcpfinder-ashen.vercel.app/api/mcp
```

| Tool | What it does |
|---|---|
| `search_mcp_servers` | Keyword search with category / local-vs-cloud / official filters |
| `get_install_config` | Config for Claude Code, Claude Desktop, Cursor, Windsurf, Zed |
| `list_categories` | Categories with counts |

To run it locally (after cloning and `npm install && npm run build:data`):
```bash
claude mcp add mcpfinder -- npx tsx /path/to/mcpfinder/mcp/stdio.ts
```

---

## 🚀 Run Locally

```bash
npm install
npm run dev          # http://localhost:3000 (builds the data first)
```

| Command | Description |
|---|---|
| `npm run sync` | Fetch new servers from all sources (incremental, ~30s) |
| `GITHUB_TOKEN=... npm run sync:github` | Fill in GitHub stars, forks, archived status |
| `npm run build:data` | Build the web catalog data |
| `npm run typecheck && npm test` | Type check and tests |
| `npm run build` | Production build (`dist/`) |

---

## ☁️ Deploy to Vercel

1. Import this repository at [vercel.com/new](https://vercel.com/new).
2. **Vite** is auto-detected (Build: `npm run build`, Output: `dist`). No env vars needed.
3. Deploy. Every push to `main`, including the daily data sync commits, triggers a redeploy.

For the daily sync to commit, set the repo's Settings → Actions → Workflow permissions to **Read and write**.
`dist/` and `public/data/` are build output and are not committed; they are regenerated from `data/servers.json`.

---

## 📂 Project Structure

```
mcpfinder/
├── .github/workflows/
│   ├── update-mcp-data.yml    # Daily data auto-sync
│   └── ci.yml                 # Typecheck, test, build on PRs
├── data/
│   ├── servers.json           # Canonical dataset (34,000+ servers)
│   ├── sync-state.json        # Incremental sync timestamps & history
│   └── raw/                   # Per-source cache (not committed)
├── api/
│   └── mcp.ts                 # Vercel function: remote MCP endpoint (/api/mcp)
├── mcp/
│   ├── server.ts              # MCP tools: search, install config, categories
│   └── stdio.ts               # Local stdio entry
├── scripts/
│   ├── sync.ts                # Sync orchestrator (npm run sync)
│   ├── merge.ts               # Deduplication & categorization
│   ├── build-catalog.ts       # Web data builder → public/data/
│   └── sources/               # Registry, awesome-list, npm, GitHub collectors
└── src/
    ├── components/            # Header, filters, cards, table, config modal
    ├── i18n/                  # Korean / English (featured descriptions: npm run build:i18n)
    ├── utils/
    │   ├── aiMatcher.ts       # Natural-language query → server recommendations
    │   └── configGenerator.ts # Per-client config generation
    └── App.tsx
```

---

## 📜 License

[MIT](LICENSE)
