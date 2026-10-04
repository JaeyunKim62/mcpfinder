/**
 * AI Intent Matcher & Natural Language Query Resolver
 * Parses queries like "~ mcp 가 필요해", "PDF 문서 읽어서 요약해주는 도구 찾아줘"
 */

import { ServerItem } from '../types';

export interface AIRecommendation {
  intentTitle: string;
  explanationKo: string;
  explanationEn: string;
  recommendedServerIds: string[];
  suggestedKeywords: string[];
}

interface IntentPattern {
  triggerRegex: RegExp;
  cleanKeywords: string[];
  titleKo: string;
  titleEn: string;
  explanationKo: string;
  explanationEn: string;
  curatedIds: string[];
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    triggerRegex: /(노션|notion).*(슬랙|slack)|(슬랙|slack).*(노션|notion)/i,
    cleanKeywords: ['notion', 'slack'],
    titleKo: '노션 & 슬랙 업무 연동',
    titleEn: 'Notion & Slack Integration',
    explanationKo: '노션의 문서 및 데이터베이스를 읽고 슬랙 채널로 알림이나 메시지를 전송하는 업무 자동화 MCP 도구들입니다.',
    explanationEn: 'Tools to read Notion pages/databases and dispatch messages/alerts to Slack channels.',
    curatedIds: ['@modelcontextprotocol/server-slack', 'suekou/mcp-notion-server', 'notion-mcp'],
  },
  {
    triggerRegex: /(pdf|피디에프|문서|파일|오피스|엑셀|excel|csv).*(읽|파싱|추출|요약|열|분석)/i,
    cleanKeywords: ['pdf', 'filesystem', 'file'],
    titleKo: 'PDF 문서 및 로컬 파일 분석 & 요약',
    titleEn: 'PDF & Local Document Parsing',
    explanationKo: '로컬 PDF, CSV, 문서 파일의 내용을 추출하여 AI가 읽고 요약할 수 있도록 해주는 파일 시스템 MCP 도구들입니다.',
    explanationEn: 'Tools to extract text, tables, and contents from PDF, CSV, and local files for AI summarization.',
    curatedIds: ['@modelcontextprotocol/server-filesystem', 'arjun-menon/mcp-server-pdf', 'ac.inference.sh/mcp'],
  },
  {
    triggerRegex: /(웹.*(검색|서치)|구글|브레이브|인터넷.*(찾아|검색|최신 정보)|search)/i,
    cleanKeywords: ['brave-search', 'search', 'tavily'],
    titleKo: '실시간 웹 검색 & 최신 정보 탐색',
    titleEn: 'Real-time Web Search & Research',
    explanationKo: 'AI에게 실시간 웹 검색 기능을 부여하여 최신 뉴스, 테크 문서, 시장 정보를 바로 검색할 수 있게 해주는 도구입니다.',
    explanationEn: 'Tools providing real-time web search capabilities for up-to-date facts, tech documentation, and news.',
    curatedIds: ['@modelcontextprotocol/server-brave-search', 'tavily-mcp', 'fatk/mcp-brave-search'],
  },
  {
    triggerRegex: /(크롤|스크랩|웹.*(수집|내용 가져|데이터 추출)|puppeteer|playwright|firecrawl)/i,
    cleanKeywords: ['puppeteer', 'fetch', 'firecrawl', 'scrape'],
    titleKo: '웹사이트 스크래핑 & 브라우저 자동화',
    titleEn: 'Web Scraping & Browser Automation',
    explanationKo: '웹페이지를 깔끔한 Markdown으로 긁어오거나, 크롬 브라우저를 직접 띄워 복잡한 사이트를 자동 조작하는 도구입니다.',
    explanationEn: 'Tools to scrape dynamic websites into clean Markdown or automate headless Chrome browsers.',
    curatedIds: ['@modelcontextprotocol/server-fetch', '@modelcontextprotocol/server-puppeteer', 'firecrawl-mcp'],
  },
  {
    triggerRegex: /(db|데이터베이스|sql|쿼리|postgres|mysql|sqlite|몽고|redis|supabase)/i,
    cleanKeywords: ['postgres', 'sqlite', 'mysql', 'database'],
    titleKo: '데이터베이스 조회 & SQL 쿼리 실행',
    titleEn: 'Database Querying & Schema Inspection',
    explanationKo: '데이터베이스의 테이블 스키마를 확인하고 SQL 쿼리를 읽기 전용으로 안전하게 실행하여 데이터를 분석하는 MCP 도구입니다.',
    explanationEn: 'Tools to safely inspect database schemas and run SQL queries to analyze data.',
    curatedIds: ['@modelcontextprotocol/server-postgres', '@modelcontextprotocol/server-sqlite', 'redis-mcp', 'supabase-mcp'],
  },
  {
    triggerRegex: /(깃|깃허브|git|github|gitlab|커밋|pr|풀리퀘|이슈)/i,
    cleanKeywords: ['github', 'git', 'gitlab'],
    titleKo: 'GitHub / Git 리포지토리 제어 & 코드 검색',
    titleEn: 'GitHub & Git Repository Automation',
    explanationKo: 'GitHub 저장소의 코드 검색, 이슈/PR 생성, 로컬 Git diff 및 커밋 이력을 AI가 직접 확인할 수 있도록 지원하는 도구입니다.',
    explanationEn: 'Tools for AI to search codebases, manage PRs/issues, and inspect Git commit histories.',
    curatedIds: ['@modelcontextprotocol/server-github', '@modelcontextprotocol/server-git', '@modelcontextprotocol/server-gitlab'],
  },
  {
    triggerRegex: /(주식|주가|코인|가상자산|크립토|비트코인|환율|재무|금융|투자|finance|stock|trading)/i,
    cleanKeywords: ['yahoo-finance', 'finance', 'crypto'],
    titleKo: '주식 시세, 재무 데이터 & 금융 분석',
    titleEn: 'Stock Market & Financial Data',
    explanationKo: '실시간 주가, 재무제표, 환율 정보 및 암호화폐 시세를 조회하여 투자 분석을 돕는 금융 MCP 서버입니다.',
    explanationEn: 'Tools for fetching real-time stock prices, financial statements, forex rates, and crypto quotes.',
    curatedIds: ['yahoo-finance2', '402signalhq/402signal', 'bintocher/mcp-superset'],
  },
  {
    triggerRegex: /(기억|메모리|대화.*(기억|보존)|rag|지식 그래프|나를 기억|장기 기억|memory)/i,
    cleanKeywords: ['memory', 'knowledge', 'rag'],
    titleKo: '장기 기억(Long-term Memory) & 지식 그래프',
    titleEn: 'Long-term Memory & Knowledge Graph',
    explanationKo: '대화가 끝나도 사용자의 선호도, 프로젝트 배경, 핵심 사실을 지식 그래프로 영구 저장하고 필요할 때 회상하는 도구입니다.',
    explanationEn: 'Tools that manage a persistent knowledge graph to remember user preferences and facts across sessions.',
    curatedIds: ['@modelcontextprotocol/server-memory', 'mem0', 'zep-mcp'],
  },
];

// Clean Korean conversational filler words
const FILLER_REGEX = /(필요해|찾아줘|추천해줘|알려줘|어떤.*써야|어떤거|해주는.*mcp|해주는.*도구|할.*수.*있는|연동하고.*싶|가.*필요|이.*필요|좀.*알려|좋은거)/gi;

export function resolveNaturalLanguageIntent(query: string): AIRecommendation | null {
  const trimmed = query.trim();
  if (trimmed.length < 3) return null;

  // Check if it's a natural language request
  const isQuestion = FILLER_REGEX.test(trimmed) || trimmed.includes('?') || trimmed.split(' ').length >= 3;

  for (const pattern of INTENT_PATTERNS) {
    if (pattern.triggerRegex.test(trimmed)) {
      return {
        intentTitle: pattern.titleKo,
        explanationKo: pattern.explanationKo,
        explanationEn: pattern.explanationEn,
        recommendedServerIds: pattern.curatedIds,
        suggestedKeywords: pattern.cleanKeywords,
      };
    }
  }

  // If conversational query but no direct pattern matched, extract cleaned keywords
  if (isQuestion) {
    const cleaned = trimmed.replace(FILLER_REGEX, '').trim();
    if (cleaned.length >= 2) {
      return {
        intentTitle: `'${cleaned}' 관련 추천 도구`,
        explanationKo: `입력하신 '${cleaned}' 요구사항과 연관성이 높은 MCP 서버들을 필터링했습니다.`,
        explanationEn: `Filtered MCP servers that closely match your intent for '${cleaned}'.`,
        recommendedServerIds: [],
        suggestedKeywords: [cleaned],
      };
    }
  }

  return null;
}
