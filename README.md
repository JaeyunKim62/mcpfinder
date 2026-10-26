# 🌐 MCPfinder — 모든 AI 에이전트를 위한 MCP 통합 디렉토리

**한국어** | [English](README.en.md)

**👉 [mcpfinder-ashen.vercel.app](https://mcpfinder-ashen.vercel.app/)**

**34,000개 이상의 MCP(Model Context Protocol) 서버**를 검색하고, Claude Desktop · Cursor · Windsurf · Zed · Claude Code 설정을 바로 만들어 주는 오픈소스 디렉토리입니다. 매일 자동으로 업데이트됩니다.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Servers: 34,000+](https://img.shields.io/badge/Servers-34k%2B-emerald.svg)
![Auto Sync: Daily](https://img.shields.io/badge/Auto--Sync-Daily-sky.svg)

---

## ✨ 주요 기능

- **⚡ 34,000개 이상의 서버**: 공식 MCP 레지스트리, `punkpeye/awesome-mcp-servers`, npm, GitHub 토픽(`mcp-server`, `model-context-protocol`, star 3개 이상)을 모아서 중복을 정리합니다.
- **🔄 매일 자동 동기화**: GitHub Actions가 매일 새 서버와 변경 사항을 가져와 커밋하고, Vercel이 자동으로 다시 배포합니다.
- **🛠️ 클라이언트별 설정 생성**:
  - **Claude Desktop**, **Cursor**, **Windsurf**, **Zed**, **Claude Code CLI**(`claude mcp add`)용 설정을 클릭 한 번으로 만듭니다.
  - API 키나 DB 주소를 입력하면 설정 JSON에 바로 반영됩니다.
- **🔍 검색과 필터**:
  - 50개 이상의 카테고리(데이터베이스, 개발 도구, 검색, 코딩 에이전트, 금융 등)
  - 언어(TypeScript, Python, Go, Rust), 실행 방식(로컬 stdio / 클라우드 원격), 공식 여부, 최근 업데이트로 필터
  - 카드 보기 / 표 보기, `⌘K`(`Ctrl+K`) 단축키
- **🤖 MCP 서버로도 사용 가능**: Claude가 대화 중에 직접 MCP를 찾아 추천하고 설치 설정까지 만들어 줍니다. (아래 참고)

---

## 🤖 MCP 서버로 사용하기

이 디렉토리 자체가 MCP 서버입니다. 연결해 두면 *"이 프로젝트에 필요한 MCP 찾아줘"* 처럼 물어볼 수 있습니다.

```bash
claude mcp add --transport http mcpfinder https://mcpfinder-ashen.vercel.app/api/mcp
```

| 도구 | 하는 일 |
|---|---|
| `search_mcp_servers` | 키워드 검색 (카테고리 / 로컬·클라우드 / 공식 여부 필터) |
| `get_install_config` | Claude Code, Claude Desktop, Cursor, Windsurf, Zed용 설정 생성 |
| `list_categories` | 카테고리와 서버 수 |

로컬에서 실행하려면 (클론 후 `npm install && npm run build:data`):
```bash
claude mcp add mcpfinder -- npx tsx /path/to/mcpfinder/mcp/stdio.ts
```

---

## ➕ MCP 추가 요청

목록에 없는 MCP가 있다면 [`data/manual.json`](data/manual.json)에 저장소 주소를 추가하는 PR을 보내 주세요. 다음 동기화 때 반영됩니다.

```json
{ "url": "https://github.com/owner/repo", "install": "npx -y github:owner/repo" }
```
`install`은 npm/PyPI에 배포되지 않은 경우에만 적으면 됩니다.

---

## 🚀 직접 실행하기

```bash
npm install
npm run dev          # http://localhost:3000 (데이터 빌드가 먼저 자동 실행됨)
```

| 명령 | 설명 |
|---|---|
| `npm run sync` | 데이터 소스에서 새 서버 가져오기 (증분, 약 30초) |
| `GITHUB_TOKEN=... npm run sync:github-search` | GitHub 토픽 검색 + manual.json 수집 |
| `GITHUB_TOKEN=... npm run sync:github` | GitHub 스타·포크·아카이브 정보 채우기 |
| `npm run build:data` | 웹용 카탈로그 데이터 생성 |
| `npm run typecheck && npm test` | 타입 검사와 테스트 |
| `npm run build` | 배포용 빌드 (`dist/`) |

---

## ☁️ Vercel 배포

1. [vercel.com/new](https://vercel.com/new)에서 이 저장소를 Import합니다.
2. **Vite**가 자동 감지됩니다 (Build: `npm run build`, Output: `dist`). 환경변수는 필요 없습니다.
3. Deploy. 이후 `main`에 push될 때마다(매일 자동 데이터 동기화 포함) 다시 배포됩니다.

자동 동기화가 결과를 커밋하려면 저장소 Settings → Actions → Workflow permissions를 **Read and write**로 설정해야 합니다.
`dist/`와 `public/data/`는 빌드 결과물이라 커밋하지 않고 `data/servers.json`에서 다시 만들어집니다.

---

## 📂 프로젝트 구조

```
mcpfinder/
├── .github/workflows/
│   ├── update-mcp-data.yml    # 매일 데이터 자동 동기화
│   └── ci.yml                 # PR마다 타입 검사·테스트·빌드
├── data/
│   ├── servers.json           # 원본 데이터셋 (34,000+ 서버)
│   ├── sync-state.json        # 증분 동기화 시점과 기록
│   └── raw/                   # 소스별 캐시 (커밋 안 함)
├── api/
│   └── mcp.ts                 # Vercel 함수: 원격 MCP 엔드포인트 (/api/mcp)
├── mcp/
│   ├── server.ts              # MCP 도구: 검색, 설치 설정, 카테고리
│   └── stdio.ts               # 로컬 stdio 실행
├── scripts/
│   ├── sync.ts                # 동기화 전체 흐름 (npm run sync)
│   ├── merge.ts               # 중복 제거와 카테고리 분류
│   ├── build-catalog.ts       # 웹용 데이터 생성 → public/data/
│   └── sources/               # 레지스트리, awesome-list, npm, GitHub 수집기
└── src/
    ├── components/            # 헤더, 필터, 카드, 표, 설정 생성 모달
    ├── i18n/                  # 한국어 / 영어 번역 (주요 서버 설명: npm run build:i18n)
    ├── utils/
    │   ├── aiMatcher.ts       # 자연어 질문 → 서버 추천
    │   └── configGenerator.ts # 클라이언트별 설정 생성
    └── App.tsx
```

---

## 📜 라이선스

[MIT](LICENSE)
