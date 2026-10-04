/**
 * Build rich Korean translations for featured servers and common server patterns
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FEATURED_PATH = path.resolve(PROJECT_ROOT, 'public/data/featured.json');
const OUT_PATH = path.resolve(PROJECT_ROOT, 'src/i18n/featured-translations.json');

interface FeaturedServer {
  id: string;
  name: string;
  desc: string;
  cat: string;
}

// Technical dictionary
const DICT: Record<string, string> = {
  // Action verbs
  'provision, ssh into, run commands on and manage': '프로비저닝, SSH 접속, 원격 명령 실행 및 관리',
  'submit media-processing jobs to': '미디어 처리 작업을 전송',
  'pay-per-call seo and ai visibility checks': '종량제 SEO 및 AI 가시성 검사',
  'document-level ai text humanizer': '문서 단위 AI 텍스트 휴머나이저',
  'create and manage': '생성 및 관리',
  'drive the': '제어 및 대시보드 관리',
  'manage': '관리',
  'app hosting for agents': 'AI 에이전트를 위한 애플리케이션 호스팅',
  'fail-closed approval layer for unattended agent runs': '자율 에이전트를 위한 보안 승인 및 정책 제어 계층',
  'human-in-the-loop via mcp elicitation': 'MCP 기반 인간 검토(Human-in-the-loop) 인터랙션',
  'create memes from': '밈(Meme) 이미지 제작',
  'web search returning extracted page content': '본문 텍스트가 추출된 웹 검색',
  'direct booking for vacation rentals': '숙박 및 휴가지 다이렉트 예약',
  'hire human operators for tasks': '인간 작업자 고용 및 오프라인 태스크 위임',
  'register pntr dev subdomains': '개발용 서브도메인 등록 및 관리',
  'fix playwright test failures': 'Playwright 테스트 실패 및 오류 자동 해결',
  'ad studio': '광고 제작 스튜디오',
  'managed tiktok, instagram and youtube accounts': 'TikTok, Instagram, YouTube 계정 통합 관리',
  'astrology from the nasa jpl de440 ephemeris': 'NASA 천체력 기반 점성술 및 천문 데이터 분석',
  'self-hosted email for': '자체 호스팅 이메일 연동',
  'luno hosted backend platform': 'LUNO 호스팅 백엔드 플랫폼',
  'revenue platform for outbound, deals, pipeline': '아웃바운드 영업 및 CRM 파이프라인 플랫폼',
  'agent identity, scoped delegation and governance': 'AI 에이전트 신원 인증 및 권한 위임 거버넌스',
  'non-custodial bitcoin lightning commerce': '비구속형 비트코인 라이트닝 결제/커머스',
  'sweep native gas balances to exactly zero': 'EVM 체인의 네이티브 가스 잔액 제로 정리',
  'web scraping that escalates': '단계별 프록시/브라우저 지능형 웹 스크래핑',
  'query and manage all resources': '모든 리소스 조회 및 관리',
  'voice messages, conversations, direct messages': '음성 메시지, 대화, DM 및 음성 메모',
  'transcode, run raw ffmpeg, burn in captions and add watermarks': '트랜스코딩, FFmpeg 실행, 자막 합성 및 워터마크 추가',
  'keyword research, on-page audits, ai-citation checks': '키워드 분석, 웹페이지 감사, AI 인용 확인 및 검색엔진 순위 추적',
  'rewrite whole .docx or .pptx files': '전체 .docx / .pptx 파일 서식 유지 재작성',
  'zones, cache purge and warm-up, traffic metrics': 'CDN 캐시 삭제, 웜업, 트래픽 분석 및 스토리지 관리',
  'deploy to a live url, verify, view logs': '실시간 URL 배포, 검증, 로그 확인 및 롤백',
  'real-world verification, product testing': '실세계 현장 검증, 제품 테스트 및 작업 대행',
  'search the catalog, caption a template': '카탈로그 검색, 템플릿 캡션 작성 및 공유 링크 생성',
};

// Grammar & translation rules
function translateText(text: string, cat: string, name: string): string {
  if (!text || text.trim().length === 0) {
    return `${cat} 분야의 MCP 서버입니다 (${name}).`;
  }

  let lower = text.toLowerCase().trim();

  // Direct dict lookup
  for (const [en, ko] of Object.entries(DICT)) {
    if (lower.startsWith(en)) {
      const rest = text.slice(en.length).replace(/^[:\s—–-]+/, '').trim();
      return `${ko}${rest ? `: ${translateClauses(rest)}` : ' 기능을 제공합니다.'}`;
    }
  }

  // Common pattern: Topic: Details
  const colonMatch = text.match(/^([^:]{3,60}):\s*(.+)$/);
  if (colonMatch) {
    const topic = colonMatch[1].trim();
    const details = translateClauses(colonMatch[2].trim());
    return `${topic} 솔루션으로, ${details}을(를) 지원합니다.`;
  }

  // Common pattern: Verb + Object
  const verbMatch = text.match(/^(Run|Execute|Fix|Generate|Create|Manage|Automate|Monitor|Track|Search|Find|Inspect|Query|Connect|Deploy|Sync|Build|Publish)\s+(.+)$/i);
  if (verbMatch) {
    const verb = verbMatch[1].toLowerCase();
    const rest = translateClauses(verbMatch[2].replace(/\.$/, ''));
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

  // Common pattern: X for Y
  const forMatch = text.match(/^(.+?)\s+for\s+(.+?)(?:\s+with\s+(.+))?$/i);
  if (forMatch) {
    const subj = forMatch[1];
    const target = forMatch[2];
    const withClause = forMatch[3] ? ` (${translateClauses(forMatch[3])} 지원)` : '';
    return `${target}을(를) 위한 ${subj} 연동 서버입니다${withClause}.`;
  }

  // Category fallback
  return `${cat} 작업 도구로, ${translateClauses(text)}`;
}

function translateClauses(clause: string): string {
  let res = clause;
  const terms: Record<string, string> = {
    'video, image and ugc avatar ads': '동영상, 이미지 및 UGC 아바타 광고',
    'script, voiceover and music': '스크립트, 보이스오버 및 배경음악',
    'competitor ads in meta, google and linkedin': 'Meta, Google, LinkedIn 경쟁사 광고',
    'video upload, scheduling, analytics and webhooks': '동영상 업로드, 예약 발행, 데이터 분석 및 웹훅',
    'read, search, draft, send, schedule and organize mail': '메일 읽기, 검색, 초안 작성, 발송, 예약 및 폴더 정리',
    'per-client permissions': '클라이언트별 권한 설정',
    'cms, forms, auth and storage': 'CMS 콘텐츠 관리, 웹 폼, 사용자 인증 및 클라우드 스토리지',
    'outbound, deals, pipeline and crm automation': '아웃바운드 영업, 딜 계약, 파이프라인 및 CRM 자동화',
    'people, outreach, engagement and research tools': '고객 조사, 아웃리치 및 인게이지먼트 도구',
    'issue passports, verify narrowing-only delegation chains': '신원 패스포트 발급, 권한 위임 체인 검증',
    'enforce gateway policy and emit signed records': '게이트웨이 보안 정책 적용 및 서명 기록 생성',
    'agents buy and sell files, data, apis and compute': '에이전트 간 파일, 데이터, API 및 컴퓨팅 자원 거래',
    'encrypted agent-to-agent messaging': '에이전트 간 암호화 메시징',
    'solana': '솔라나(Solana)',
    'bitcoin': '비트코인(Bitcoin)',
    'ethereum': '이더리움(Ethereum)',
    'database': '데이터베이스',
    'databases': '데이터베이스',
    'filesystem': '파일 시스템',
    'browser automation': '브라우저 자동화',
    'web scraping': '웹 스크래핑',
    'memory': '메모리',
    'analytics': '데이터 분석 및 통계',
  };

  for (const [k, v] of Object.entries(terms)) {
    const re = new RegExp(`\\b${k}\\b`, 'gi');
    res = res.replace(re, v);
  }
  return res;
}

function main() {
  const featured = JSON.parse(fs.readFileSync(FEATURED_PATH, 'utf8')) as FeaturedServer[];
  console.log(`Processing ${featured.length} featured servers...`);

  const translations: Record<string, string> = {};

  for (const s of featured) {
    const ko = translateText(s.desc, s.cat, s.name);
    translations[s.id] = ko;
    if (s.name) {
      translations[s.name.toLowerCase()] = ko;
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(translations, null, 2), 'utf8');
  console.log(`✓ Wrote ${Object.keys(translations).length} translations to ${OUT_PATH}`);
}

main();
