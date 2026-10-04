/**
 * MCP Server Description Translator & Korean Knowledge Base
 */

// Well-known popular MCP servers curated Korean descriptions
export const KNOWN_DESCRIPTIONS_KO: Record<string, string> = {
  // Top DevTools & Official
  '@modelcontextprotocol/server-filesystem': '로컬 파일 시스템에 안전하게 접근하여 파일을 읽고, 쓰고, 디렉토리를 탐색하는 공식 MCP 서버입니다.',
  '@modelcontextprotocol/server-github': 'GitHub 리포지토리 탐색, 커밋 조회, 이슈/PR 생성 및 코드 검색을 제공하는 공식 GitHub MCP 서버입니다.',
  '@modelcontextprotocol/server-gitlab': 'GitLab 프로젝트, 이슈, 머지 리퀘스트(MR), 파이프라인을 관리하는 공식 GitLab MCP 서버입니다.',
  '@modelcontextprotocol/server-git': '로컬 Git 저장소의 커밋 이력, diff 확인, 브랜치 작업 등을 지원하는 Git MCP 서버입니다.',
  '@modelcontextprotocol/server-postgres': 'PostgreSQL 데이터베이스의 스키마를 검사하고 SQL 쿼리를 읽기 전용으로 안전하게 실행하는 데이터베이스 MCP 서버입니다.',
  '@modelcontextprotocol/server-sqlite': 'SQLite 데이터베이스 파일에 연결하여 테이블 구조 확인 및 SQL 쿼리를 실행하는 경량 데이터베이스 MCP 서버입니다.',
  '@modelcontextprotocol/server-brave-search': 'Brave Search API를 활용하여 최신 웹 검색 및 로컬 비즈니스 정보를 실시간으로 질의하는 검색 MCP 서버입니다.',
  '@modelcontextprotocol/server-fetch': '웹페이지의 HTML 내용을 Markdown으로 변환하여 AI가 읽을 수 있도록 스크래핑하는 공식 Fetch MCP 서버입니다.',
  '@modelcontextprotocol/server-puppeteer': 'Puppeteer를 통해 웹 브라우저를 직접 제어하고, 스크린샷 캡처 및 복잡한 자바스크립트 사이트를 자동화하는 브라우저 MCP 서버입니다.',
  '@modelcontextprotocol/server-slack': 'Slack 워크스페이스의 채널 목록을 조회하고 메시지를 읽고 전송하는 공식 Slack MCP 서버입니다.',
  '@modelcontextprotocol/server-memory': '지식 그래프 기반의 영구 기억(Memory)을 관리하여 대화 간 문맥을 지속적으로 기억하는 공식 메모리 MCP 서버입니다.',
  '@modelcontextprotocol/server-everything': '도구, 리소스, 프롬프트 등 MCP 프로토콜의 모든 기능을 테스트할 수 있는 공식 레퍼런스 서버입니다.',
  'yahoo-finance2': '야후 파이낸스(Yahoo Finance)를 통해 실시간 주가, 재무제표, 환율 및 시장 데이터를 조회하는 금융 MCP 서버입니다.',
  'docker-mcp': 'Docker 컨테이너, 이미지, 볼륨 상태를 확인하고 관리하는 컨테이너 오케스트레이션 MCP 서버입니다.',
  'kubernetes-mcp': 'Kubernetes 클러스터의 Pod, Service, Deployment 상태를 모니터링하고 리소스를 관리하는 K8s MCP 서버입니다.',
  'redis-mcp': 'Redis 인메모리 캐시 및 키-값 저장소에 접속하여 키를 조회하고 캐시를 제어하는 Redis MCP 서버입니다.',
  'mysql-mcp': 'MySQL 데이터베이스에 접속하여 스키마를 확인하고 쿼리를 실행하는 데이터베이스 MCP 서버입니다.',
  'mongodb-mcp': 'MongoDB NoSQL 데이터베이스의 컬렉션을 탐색하고 문서를 쿼리 및 관리하는 MongoDB MCP 서버입니다.',
  'supabase-mcp': 'Supabase 프로젝트의 PostgreSQL 데이터베이스, Auth, 스토리지 설정을 제어하는 Supabase 공식/커뮤니티 MCP 서버입니다.',
  'notion-mcp': 'Notion 워크스페이스의 페이지, 데이터베이스, 블록 콘텐츠를 검색하고 읽고 작성하는 Notion MCP 서버입니다.',
  'obsidian-mcp': 'Obsidian 마크다운 볼트와 메모를 로컬에서 직접 검색하고 생성/편집하는 옵시디언 MCP 서버입니다.',
  'linear-mcp': 'Linear 프로젝트 관리 도구의 이슈, 프로젝트, 사이클을 조회하고 생성/수정하는 Linear MCP 서버입니다.',
  'jira-mcp': 'Atlassian Jira의 티켓을 조회하고 스프린트 및 업무를 관리하는 Jira MCP 서버입니다.',
  'playwright-mcp': 'Playwright를 사용해 크롬/파이어폭스 브라우저 상호작용 및 웹 테스트 자동화를 수행하는 브라우저 MCP 서버입니다.',
  'firecrawl-mcp': '웹사이트 전체를 깨끗한 Markdown 형식으로 크롤링하고 구조화된 데이터를 추출하는 Firecrawl MCP 서버입니다.',
  'tavily-mcp': 'AI 에이전트에 최적화된 심층 웹 검색 엔진 Tavily Search API 연동 MCP 서버입니다.',
  'google-maps-mcp': 'Google Maps API를 이용해 장소 검색, 경로 안내, 이동 시간 및 좌표를 조회하는 지도 MCP 서버입니다.',
  'weather-mcp': '실시간 날씨 정보, 일기 예보 및 기상 데이터를 조회하는 기상 정보 MCP 서버입니다.',
  'sentry-mcp': 'Sentry 에러 트래킹 시스템에서 발생한 실시간 예외 및 스택 트레이스를 분석하는 모니터링 MCP 서버입니다.',
};

// Common prefixes & sentence patterns to translate automatically
const PATTERN_RULES: Array<{ pattern: RegExp; replace: (match: RegExpMatchArray) => string }> = [
  {
    pattern: /^an? (?:official )?(?:model context protocol|mcp) server (?:for|that|to) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) 위한 MCP 서버입니다.`,
  },
  {
    pattern: /^(?:model context protocol|mcp) server (?:for|that|to) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) 위한 MCP 서버입니다.`,
  },
  {
    pattern: /^connects? (?:ai assistants?|claude|llms?) to (.+)$/i,
    replace: (m) => `AI를 ${translateFragment(m[1])}에 연결하여 연동 작업을 수행합니다.`,
  },
  {
    pattern: /^integrates? (.+) with (?:mcp|claude|ai)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) MCP와 연동하여 AI가 직접 활용할 수 있도록 지원합니다.`,
  },
  {
    pattern: /^tools? (?:for|to) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) 위한 도구 모음입니다.`,
  },
  {
    pattern: /^enables? (?:ai|claude|llms?) to (.+)$/i,
    replace: (m) => `AI가 ${translateFragment(m[1])}할 수 있도록 기능을 제공합니다.`,
  },
  {
    pattern: /^provides? (?:access to|tools for) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}에 접근하여 다양한 작업을 수행할 수 있는 기능을 제공합니다.`,
  },
  {
    pattern: /^query and (?:manage|mutate|update) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) 조회하고 편리하게 관리합니다.`,
  },
  {
    pattern: /^search (?:across|and extract|for) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) 검색하고 필요한 데이터를 추출합니다.`,
  },
  {
    pattern: /^execute (.+) queries(?: and (.+))?$/i,
    replace: (m) => `${translateFragment(m[1])} 쿼리를 실행${m[2] ? `하고 ${translateFragment(m[2])}` : ''}합니다.`,
  },
];

// Term dictionary for common technical terms
const TERM_DICT: Record<string, string> = {
  'database': '데이터베이스',
  'databases': '데이터베이스',
  'filesystem': '파일 시스템',
  'file system': '파일 시스템',
  'browser automation': '브라우저 자동화',
  'web scraping': '웹 스크래핑',
  'web search': '웹 검색',
  'search': '검색',
  'memory': '메모리 및 기억',
  'knowledge graph': '지식 그래프',
  'code analysis': '코드 분석',
  'developer tools': '개발자 도구',
  'security audit': '보안 감사',
  'monitoring': '모니터링',
  'finance': '금융',
  'cryptocurrency': '가상자산/크립토',
  'trading': '트레이딩',
  'weather': '날씨 및 기상',
  'management': '관리',
  'automation': '자동화',
};

function translateFragment(frag: string): string {
  let cleaned = frag.trim().replace(/\.$/, '');
  for (const [en, ko] of Object.entries(TERM_DICT)) {
    const re = new RegExp(`\\b${en}\\b`, 'gi');
    cleaned = cleaned.replace(re, ko);
  }
  return cleaned;
}

/**
 * Returns translated Korean description if locale is 'ko', or original text
 */
export function getLocalizedDescription(name: string, description: string, locale: 'ko' | 'en'): string {
  if (locale === 'en' || !description) {
    return description;
  }

  // 1. Direct match by package/repo name
  const cleanKey = name.toLowerCase().trim();
  if (KNOWN_DESCRIPTIONS_KO[cleanKey]) {
    return KNOWN_DESCRIPTIONS_KO[cleanKey];
  }
  for (const [k, ko] of Object.entries(KNOWN_DESCRIPTIONS_KO)) {
    if (cleanKey.includes(k.toLowerCase()) || k.toLowerCase().includes(cleanKey)) {
      return ko;
    }
  }

  // 2. Pattern matching
  const trimmed = description.trim();
  for (const rule of PATTERN_RULES) {
    const match = trimmed.match(rule.pattern);
    if (match) {
      return rule.replace(match);
    }
  }

  // 3. Fallback: Term replacement if English sentence is recognized
  let translated = trimmed;
  let hasReplacement = false;
  for (const [en, ko] of Object.entries(TERM_DICT)) {
    const re = new RegExp(`\\b${en}\\b`, 'gi');
    if (re.test(translated)) {
      hasReplacement = true;
      translated = translated.replace(re, ko);
    }
  }

  return hasReplacement ? translated : description;
}
