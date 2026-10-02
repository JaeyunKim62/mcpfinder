# 🌐 MCP Index — The Universal Model Context Protocol Directory

An open-source, continuously updated directory and configuration hub indexing over **34,000+ Model Context Protocol (MCP) servers** for Claude Desktop, Cursor, Windsurf, Zed, and AI coding agents.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Servers: 34,000+](https://img.shields.io/badge/Servers-34%2C269%2B-emerald.svg)
![Auto Sync: Every 6h](https://img.shields.io/badge/Auto--Sync-Every%206h-sky.svg)

---

## ✨ Key Features

- **⚡ 34,000+ Servers Indexed**: Aggregates from the Official MCP Registry, `punkpeye/awesome-mcp-servers`, and npm.
- **🔄 Continuous Auto-Sync Engine**: GitHub Actions scheduled cron runs every 6 hours, querying incremental updates and auto-committing fresh data.
- **🛠️ Multi-Client Config Generator**:
  - One-click configuration for **Claude Desktop** (`claude_desktop_config.json`), **Cursor IDE** (`.cursor/mcp.json`), **Windsurf** (`mcp_config.json`), **Zed Editor**, and **Claude Code CLI** (`claude mcp add`).
  - **Live Environment Variable Form**: Type in your API keys or database URLs and watch your JSON configuration update in real-time.
- **📦 Custom Stack Builder**: Select multiple servers (e.g., PostgreSQL + GitHub + Brave Search) and generate a single unified configuration file.
- **🔍 Instant Search & Faceted Filtering**:
  - Filter by 50+ categories (Databases, DevTools, Search, Coding Agents, Finance, etc.).
  - Filter by runtime (TypeScript, Python, Go, Rust), scope (Local stdio vs Cloud Remote), or verified status.
  - Card Grid View & Compact Table View.
  - Global `⌘K` keyboard shortcut.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Data Pipeline (Optional, dataset already included)
```bash
# Incremental update (fetches new & modified servers in ~30s)
npm run sync

# Re-build optimized web catalog datasets
npm run build:data
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates a static web bundle in `dist/` ready to deploy to Cloudflare Pages, Vercel, or GitHub Pages.

---

## 📂 Project Architecture

```
mcp-list/
├── .github/workflows/
│   └── update-mcp-data.yml    # Scheduled cron (every 6h) for auto-updates
├── data/
│   ├── servers.json           # Canonical dataset (34,269+ servers)
│   ├── sync-state.json        # Incremental sync timestamps & history
│   └── raw/                   # Source cache (awesome-list, registry, npm)
├── public/
│   └── data/
│       ├── stats.json         # Real-time category & language counts
│       ├── featured.json      # Top featured servers for instant first-paint
│       └── catalog.json       # Full searchable catalog index
├── scripts/
│   ├── types.ts               # Shared TypeScript schemas
│   ├── utils.ts               # Resilient fetch, retry, and batch utils
│   ├── state.ts               # Sync state manager
│   ├── sync.ts                # Main orchestrator (npm run sync)
│   ├── merge.ts               # Deduplication & smart categorization
│   ├── build-catalog.ts       # Web data optimizer
│   └── sources/
│       ├── registry.ts        # Official MCP Registry API client
│       ├── awesome-list.ts    # Community list markdown parser
│       ├── npm-registry.ts    # npm registry search client
│       └── github.ts          # GitHub API stars & license enricher
└── src/
    ├── components/
    │   ├── Header.tsx         # Search bar, stats ticker, theme toggle
    │   ├── FilterBar.tsx      # Category pills, client & scope filters
    │   ├── ServerCard.tsx     # Interactive cards with 1-click copy
    │   ├── ServerTable.tsx    # Dense tabular view
    │   ├── ConfigModal.tsx    # Multi-client interactive config generator
    │   └── StackBuilderModal.tsx # Multi-server stack merger
    ├── utils/
    │   └── configGenerator.ts # Generates Claude, Cursor, Windsurf configs
    ├── App.tsx                # Main application controller
    └── main.tsx               # React entry point
```

---

## 📜 License

MIT License
