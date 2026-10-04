/**
 * MCP Server Description Translator & Korean Knowledge Base
 */

import featuredTranslations from './featured-translations.json';

// Well-known popular MCP servers curated Korean descriptions
export const KNOWN_DESCRIPTIONS_KO: Record<string, string> = {
  // WaveSpeed & Multimedia
  'wavespeedai/mcp-server': 'WaveSpeed 카탈로그의 이미지, 동영상, 음성 및 3D 모델을 실행하는 멀티미디어 모델 실행 서버입니다. 모델 검색, 스키마 검사, 로컬 파일 업로드 및 실행 전 예상 비용 견적 조회를 지원합니다.',
  '@wavespeed/mcp': 'WaveSpeed 카탈로그의 이미지, 동영상, 음성 및 3D 모델을 실행하는 멀티미디어 모델 실행 서버입니다. 모델 검색, 스키마 검사, 로컬 파일 업로드 및 실행 전 예상 비용 견적 조회를 지원합니다.',
  'wavespeed': 'WaveSpeed 카탈로그의 이미지, 동영상, 음성 및 3D 모델을 실행하는 멀티미디어 모델 실행 서버입니다. 모델 검색, 스키마 검사, 로컬 파일 업로드 및 실행 전 예상 비용 견적 조회를 지원합니다.',

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

// Merge featured translations into a single fast lookup
const FEATURED_MAP: Record<string, string> = {
  ...featuredTranslations,
  ...KNOWN_DESCRIPTIONS_KO,
};

// Known technical compound phrases
const COMPOUND_PHRASES: Record<string, string> = {
  'image, video, audio and 3d models': '이미지, 비디오, 오디오 및 3D 모델',
  'image, video, audio and 3D models': '이미지, 비디오, 오디오 및 3D 모델',
  'model search': '모델 검색',
  'schema introspection': '스키마 구조 분석',
  'local file upload': '로컬 파일 업로드',
  'price quotes before running': '실행 전 예상 비용 견적 조회',
  'breakpoints, stepping, locals, expression evaluation': '중단점 디버깅, 단계별 코드 실행, 로컬 변수 확인 및 표현식 평가',
  'projects, packages, building, testing, and development tools': '프로젝트, 패키지, 빌드, 테스트 및 개발 도구',
  'task management': '태스크 및 할 일 관리',
  'project management': '프로젝트 관리',
  'browser automation': '브라우저 자동화',
  'web scraping': '웹 스크래핑',
  'web search': '웹 검색',
  'knowledge graph': '지식 그래프',
  'knowledge base': '지식 베이스',
  'cost observability': '비용 모니터링 및 분석',
  'code analysis': '코드 정적 분석',
  'security audit': '보안 감사',
  'file system': '파일 시스템',
  'filesystem': '파일 시스템',
  'decompiled source': '디컴파일 소스 코드',
  'vector database': '벡터 데이터베이스',
  'video, image and ugc avatar ads': '동영상, 이미지 및 UGC 아바타 광고',
  'script, voiceover and music': '스크립트, 음성 및 배경음악',
  'read, search, draft, send, schedule and organize mail': '메일 읽기, 검색, 초안 작성, 발송, 예약 및 폴더 정리',
  'cms, forms, auth and storage': 'CMS 콘텐츠 관리, 웹 폼, 사용자 인증 및 클라우드 스토리지',
  'outbound, deals, pipeline and crm automation': '아웃바운드 영업, 딜 계약, 파이프라인 및 CRM 자동화',
};

// Common prefixes & sentence patterns to translate automatically
const PATTERN_RULES: Array<{ pattern: RegExp; replace: (match: RegExpMatchArray) => string }> = [
  // Run models / catalogs
  {
    pattern: /^Run (.+?) from (.+?)(?::\s*(.+))?$/i,
    replace: (m) => {
      const models = translateFragment(m[1]);
      const source = translateCatalogName(m[2]);
      const details = m[3] ? ` (주요 기능: ${translateDetails(m[3])})` : '';
      return `${source}에서 ${models}을(를) 실행합니다${details}.`;
    },
  },
  // Give an AI agent
  {
    pattern: /^Give an? AI agent (.+?)(?::\s*(.+))?$/i,
    replace: (m) => {
      const cap = translateFragment(m[1]);
      const details = m[2] ? ` (${translateDetails(m[2])})` : '';
      return `AI 에이전트에게 ${cap} 기능을 제공합니다${details}.`;
    },
  },
  // AI assistant access to
  {
    pattern: /^AI assistant access to (.+?) for (.+)$/i,
    replace: (m) => {
      const target = translateFragment(m[1]);
      const purpose = translateFragment(m[2]);
      return `AI 어시스턴트가 ${purpose} 목적으로 ${target}에 접근할 수 있도록 연동합니다.`;
    },
  },
  // MCP server for X — Y
  {
    pattern: /^(?:An? )?(?:official )?(?:Model Context Protocol|MCP) server for (.+?)(?: — |: | - )(.*)$/i,
    replace: (m) => {
      const service = m[1].trim();
      const desc = m[2] ? ` - ${translateDetails(m[2])}` : '';
      return `${service}을(를) 위한 MCP 서버입니다${desc}`;
    },
  },
  // Standard MCP server for / to
  {
    pattern: /^(?:An? )?(?:official )?(?:Model Context Protocol|MCP) server (?:for|that|to) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) 위한 MCP 서버입니다.`,
  },
  // MCP server enabling X to Y
  {
    pattern: /^(?:An? )?MCP server enabling (.+?) to (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}이(가) ${translateFragment(m[2])}할 수 있도록 지원하는 MCP 서버입니다.`,
  },
  // MCP server providing / that provides
  {
    pattern: /^(?:An? )?MCP server (?:providing|that provides) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])} 기능을 제공하는 MCP 서버입니다.`,
  },
  // Connects X to Y
  {
    pattern: /^Connects? (.+) (?:to|with) (?:MCP|Claude|AI|LLMs?)(?: — |: | - )?(.*)$/i,
    replace: (m) => {
      const target = translateFragment(m[1]);
      const extra = m[2] ? ` (${translateDetails(m[2])})` : '';
      return `${target}을(를) AI 및 MCP 환경에 연동합니다${extra}.`;
    },
  },
  // Integrates X with Y
  {
    pattern: /^Integrates? (.+) with (?:MCP|Claude|AI)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) MCP와 연동하여 AI가 직접 활용할 수 있도록 지원합니다.`,
  },
  // Local MCP server for
  {
    pattern: /^Local(?:-first)? MCP server for (.+?)(?: — |: | - )?(.*)$/i,
    replace: (m) => {
      const target = translateFragment(m[1]);
      const extra = m[2] ? ` (${translateDetails(m[2])})` : '';
      return `${target}을(를) 위한 로컬 전용 MCP 서버입니다${extra}.`;
    },
  },
  // Tools for X
  {
    pattern: /^Tools? (?:for|to) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) 위한 도구 모음입니다.`,
  },
  // Enables AI to
  {
    pattern: /^Enables? (?:AI|Claude|LLMs?) to (.+)$/i,
    replace: (m) => `AI가 ${translateFragment(m[1])}할 수 있도록 기능을 제공합니다.`,
  },
  // Provides access to / tools for
  {
    pattern: /^Provides? (?:access to|tools for) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}에 접근하여 다양한 작업을 수행할 수 있는 기능을 제공합니다.`,
  },
  // Query and manage
  {
    pattern: /^Query and (?:manage|mutate|update) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) 조회하고 편리하게 관리합니다.`,
  },
  // Search across
  {
    pattern: /^Search (?:across|and extract|for) (.+)$/i,
    replace: (m) => `${translateFragment(m[1])}을(를) 검색하고 필요한 데이터를 추출합니다.`,
  },
  // Execute queries
  {
    pattern: /^Execute (.+) queries(?: and (.+))?$/i,
    replace: (m) => `${translateFragment(m[1])} 쿼리를 실행${m[2] ? `하고 ${translateFragment(m[2])}` : ''}합니다.`,
  },
  // Smart MCP tool to
  {
    pattern: /^Smart MCP tool to (.+)$/i,
    replace: (m) => `${translateFragment(m[1])} 작업을 수행하는 스마트 MCP 도구입니다.`,
  },
  // TypeScript MCP server boilerplate with
  {
    pattern: /^TypeScript MCP server boilerplate with (.+)$/i,
    replace: (m) => `${translateDetails(m[1])}을(를) 갖춘 TypeScript 기반 MCP 서버 보일러플레이트입니다.`,
  },
];

function translateCatalogName(cat: string): string {
  let cleaned = cat.trim().replace(/^the\s+/i, '');
  if (/catalog$/i.test(cleaned)) {
    cleaned = cleaned.replace(/catalog$/i, '카탈로그');
  }
  return cleaned;
}

function translateDetails(details: string): string {
  let result = details.trim();
  for (const [en, ko] of Object.entries(COMPOUND_PHRASES)) {
    const re = new RegExp(en, 'gi');
    result = result.replace(re, ko);
  }
  return result;
}

function translateFragment(frag: string): string {
  let cleaned = frag.trim().replace(/\.$/, '');
  for (const [en, ko] of Object.entries(COMPOUND_PHRASES)) {
    const re = new RegExp(`\\b${en}\\b`, 'gi');
    cleaned = cleaned.replace(re, ko);
  }
  return cleaned;
}

/**
 * Returns translated Korean description if locale is 'ko', or original text
 */
export function getLocalizedDescription(
  name: string,
  description: string,
  locale: 'ko' | 'en',
  category?: string,
  id?: string
): string {
  if (locale === 'en' || !description) {
    return description;
  }

  // 1. Direct match by id or name in FEATURED_MAP
  if (id && FEATURED_MAP[id]) {
    return FEATURED_MAP[id];
  }
  const cleanKey = name.toLowerCase().trim();
  if (FEATURED_MAP[cleanKey]) {
    return FEATURED_MAP[cleanKey];
  }
  for (const [k, ko] of Object.entries(FEATURED_MAP)) {
    if (cleanKey === k.toLowerCase()) {
      return ko;
    }
  }

  // 2. Pattern matching against full description
  const trimmed = description.trim();
  for (const rule of PATTERN_RULES) {
    const match = trimmed.match(rule.pattern);
    if (match) {
      return rule.replace(match);
    }
  }

  // 3. Common structural decomposition: "Topic: Details"
  const colonMatch = trimmed.match(/^([^:]{3,50}):\s*(.+)$/);
  if (colonMatch) {
    const topic = colonMatch[1].trim();
    const details = translateDetails(colonMatch[2].trim());
    return `${topic} 솔루션으로, ${details}을(를) 지원합니다.`;
  }

  // 4. Common structural decomposition: "Verb + Object"
  const verbMatch = trimmed.match(/^(Run|Execute|Fix|Generate|Create|Manage|Automate|Monitor|Track|Search|Find|Inspect|Query|Connect|Deploy|Sync|Build|Publish)\s+(.+)$/i);
  if (verbMatch) {
    const verb = verbMatch[1].toLowerCase();
    const rest = translateDetails(verbMatch[2].replace(/\.$/, ''));
    const verbMap: Record<string, string> = {
      run: '실행',
      execute: '실행',
      fix: '수정 및 해결',
      generate: '생성',
      create: '생성',
      manage: '관리',
      automate: '자동화',
      monitor: '모니터링',
      track: '추적',
      search: '검색',
      find: '탐색 및 조회',
      inspect: '검사 및 분석',
      query: '조회',
      connect: '연결 및 연동',
      deploy: '배포',
      sync: '동기화',
      build: '빌드 및 제작',
      publish: '발행 및 배포',
    };
    return `${rest} 관련 ${verbMap[verb] || verb} 기능을 지원합니다.`;
  }

  // 5. Common structural decomposition: "X for Y"
  const forMatch = trimmed.match(/^(.+?)\s+for\s+(.+?)(?:\s+with\s+(.+))?$/i);
  if (forMatch) {
    const subj = forMatch[1];
    const target = forMatch[2];
    const withClause = forMatch[3] ? ` (${translateDetails(forMatch[3])} 지원)` : '';
    return `${target}을(를) 위한 ${subj} 연동 서버입니다${withClause}.`;
  }

  // 6. Detail phrase enhancement if known phrases exist
  let enhanced = trimmed;
  let matchedPhrase = false;
  for (const [en, ko] of Object.entries(COMPOUND_PHRASES)) {
    const re = new RegExp(en, 'gi');
    if (re.test(enhanced)) {
      matchedPhrase = true;
      enhanced = enhanced.replace(re, ko);
    }
  }

  if (matchedPhrase) {
    return enhanced;
  }

  // 7. Contextual Category Fallback: ensure no card is left as unexplained raw English
  if (category) {
    return `${category} 작업 도구로, ${trimmed}`;
  }

  return description;
}
