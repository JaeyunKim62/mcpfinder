export type Locale = 'ko' | 'en';

/** Virtual category: servers flagged `top` by build-catalog */
export const ESSENTIALS = 'Essentials';

export const categoryTranslations: Record<string, { ko: string; en: string }> = {
  [ESSENTIALS]: { ko: '⭐ 주요 MCP', en: '⭐ Essentials' },
  'Developer Tools': { ko: '개발자 도구', en: 'Developer Tools' },
  'Search & Data Extraction': { ko: '검색 & 데이터 수집', en: 'Search & Data Extraction' },
  'Coding Agents': { ko: '코딩 에이전트', en: 'Coding Agents' },
  'Databases': { ko: '데이터베이스', en: 'Databases' },
  'Knowledge & Memory': { ko: '지식 & 메모리 (RAG)', en: 'Knowledge & Memory' },
  'Finance & Fintech': { ko: '금융 & 핀테크', en: 'Finance & Fintech' },
  'Security': { ko: '보안 & 인증', en: 'Security' },
  'Communication': { ko: '커뮤니케이션 & 메시징', en: 'Communication' },
  'File Systems': { ko: '파일 시스템 & 스토리지', en: 'File Systems' },
  'Browser Automation': { ko: '브라우저 자동화', en: 'Browser Automation' },
  'Cloud Platforms': { ko: '클라우드 플랫폼', en: 'Cloud Platforms' },
  'Workplace & Productivity': { ko: '업무 & 생산성', en: 'Workplace & Productivity' },
  'Multimedia Process': { ko: '멀티미디어 & AI 생성', en: 'Multimedia Process' },
  'Monitoring': { ko: '모니터링 & 로그', en: 'Monitoring' },
  'Social Media': { ko: '소셜 미디어', en: 'Social Media' },
  'Location Services': { ko: '위치 & 지도 & 날씨', en: 'Location Services' },
  'Other Tools and Integrations': { ko: '기타 도구 & 연동', en: 'Other Tools and Integrations' },
};

export const translations = {
  en: {
    title: 'MCPfinder',
    subtitle: 'The Universal Model Context Protocol Directory',
    searchPlaceholder: 'Search 34,000+ MCP servers (e.g. postgres, git, brave, memory)...',
    stackBuilder: 'Stack Builder',
    indexedServers: 'Indexed',
    serversUnit: 'servers',
    readyToInstall: 'Ready to install:',
    openSource: 'Open Source (GitHub):',
    compatibleWith: 'Compatible with Claude Desktop, Cursor, Windsurf, Zed & CLI',

    // Hero
    heroBadge: 'Continuously Updated MCP Catalog',
    heroTitle: 'Discover & Run 34,000+ Tools for Your AI Agents',
    heroDesc: 'Connect Claude Desktop, Cursor, Windsurf, Zed, and Claude Code to databases, web scrapers, developer APIs, and business systems with zero config hassle.',

    // Filter
    allCategories: 'All',
    allClients: 'All Clients',
    allScopes: 'All Scopes',
    scopeLocal: 'Local (stdio)',
    scopeCloud: 'Cloud (Remote HTTP/SSE)',
    scopeHybrid: 'Hybrid',
    allLanguages: 'All Languages',
    officialOnly: 'Verified / Official',
    installReadyOnly: 'Install Ready Only',
    recentOnly: 'Updated Recently (Active)',
    serversFound: 'servers found',
    sortByPopularity: 'Sort by: Popularity',
    sortByDownloads: 'Sort by: Downloads',
    sortByNewest: 'Sort by: Recently Updated',
    sortByName: 'Sort by: Name (A-Z)',
    cardGridView: 'Card Grid View',
    compactTableView: 'Compact Table View',
    updatedAt: 'Updated',

    // Card & Table
    official: 'Official',
    remote: 'Remote',
    local: 'Local',
    configure: 'Configure',
    addStack: '+ Stack',
    inStack: 'In Stack',
    copied: 'Copied!',
    copy: 'Copy',
    noDesc: 'No description provided.',
    remoteConfigNotice: 'Remote endpoint configuration',
    manualInstallNotice: 'Manual installation',
    colName: 'Name / Server',
    colCategory: 'Category',
    colLangScope: 'Language / Scope',
    colCommand: 'Install Command',
    colActions: 'Actions',

    // Config Modal
    configTitle: 'Configuration & Setup Guide',
    selectClient: 'Select Client Application',
    requiredEnvVars: 'Required Credentials & Environment Variables',
    envVarsNotice: 'Enter your credentials below. They are rendered directly into the configuration snippet locally and never leave your browser.',
    enterVarPlaceholder: 'Enter',
    downloadJson: 'Download JSON',
    copyConfig: 'Copy Configuration',
    copiedClipboard: 'Copied to Clipboard',
    copyHint: 'Copy into your client configuration file and restart the client.',
    category: 'Category',
    transport: 'Transport',
    license: 'License',
    githubRepo: 'GitHub Repository',
    website: 'Website',

    // Stack Modal
    stackModalTitle: 'Custom MCP Stack Builder',
    serversSelected: 'Servers Selected',
    clearAll: 'Clear All',
    emptyStackTitle: 'Your Stack is Empty',
    emptyStackDesc: "Browse servers in the directory and click '+ Stack' on any server card to add it to your custom bundle.",
    serversInStack: 'Servers in Your Stack',
    targetClient: 'Target AI Client',
    copyStack: 'Copy Combined Config',
    downloadStack: 'Download Stack JSON',
    stackHint: 'Paste into your client configuration to run all servers simultaneously.',

    // Empty state
    noMatchTitle: 'No servers match your criteria',
    noMatchDesc: 'Try adjusting your query, selecting "All Categories", or clearing language and client filters.',
    resetFilters: 'Reset Filters',

    // Pagination
    showingPage: 'Showing Page',
    of: 'of',
    total: 'total',
    previous: 'Previous',
    next: 'Next',

    // Footer
    footerSyncText: 'MCPfinder © 2026. Automatically synced daily from Official MCP Registry, punkpeye/awesome-mcp-servers, and npm.',
    protocolDocs: 'Protocol Docs',
    referenceServers: 'Reference Servers',
    registryPortal: 'Registry Portal',
    backgroundLoading: 'Showing top featured servers. Loading full index of 34,000+ servers in the background for instant search...',
  },
  ko: {
    title: 'MCPfinder',
    subtitle: '모든 AI 에이전트를 위한 MCP 통합 디렉토리',
    searchPlaceholder: '34,000+ 개 MCP 서버 검색 (예: postgres, git, brave, memory)...',
    stackBuilder: '스택 빌더',
    indexedServers: '총 색인 서버',
    serversUnit: '개',
    readyToInstall: '즉시 설치 가능:',
    openSource: '오픈소스 (GitHub):',
    compatibleWith: 'Claude Desktop, Cursor, Windsurf, Zed 및 CLI 완벽 호환',

    // Hero
    heroBadge: '지속적으로 자동 갱신되는 MCP 카탈로그',
    heroTitle: 'AI 에이전트를 위한 34,000개 이상의 도구 탐색 & 설정',
    heroDesc: 'Claude Desktop, Cursor, Windsurf, Zed, Claude Code에 데이터베이스, 웹 크롤러, 개발 도구 및 비즈니스 시스템을 복잡한 설정 없이 원클릭으로 연결하세요.',

    // Filter
    allCategories: '전체 카테고리',
    allClients: '전체 클라이언트',
    allScopes: '전체 실행 환경',
    scopeLocal: '로컬 프로세스 (stdio)',
    scopeCloud: '클라우드 원격 (HTTP/SSE)',
    scopeHybrid: '하이브리드',
    allLanguages: '전체 언어',
    officialOnly: '공식 / 검증됨',
    installReadyOnly: '즉시 설치 가능만',
    recentOnly: '최근 갱신된 서버만 (Active)',
    serversFound: '개 서버 검색됨',
    sortByPopularity: '정렬: 인기도순',
    sortByDownloads: '정렬: 다운로드순',
    sortByNewest: '정렬: 최신 업데이트순',
    sortByName: '정렬: 이름순 (A-Z)',
    cardGridView: '카드 그리드 뷰',
    compactTableView: '압축 테이블 뷰',
    updatedAt: '최근 갱신',

    // Card & Table
    official: '공식 인증',
    remote: '원격',
    local: '로컬',
    configure: '설정하기',
    addStack: '+ 스택 추가',
    inStack: '스택 담김',
    copied: '복사 완료!',
    copy: '복사',
    noDesc: '등록된 설명이 없습니다.',
    remoteConfigNotice: '원격 엔드포인트 URL 설정 필요',
    manualInstallNotice: '수동 설치 안내 참조',
    colName: '서버 이름',
    colCategory: '카테고리',
    colLangScope: '언어 / 환경',
    colCommand: '설치 명령',
    colActions: '동작',

    // Config Modal
    configTitle: '클라이언트 설정 및 연동 가이드',
    selectClient: '대상 AI 클라이언트 선택',
    requiredEnvVars: '필수 인증키 및 환경변수 설정',
    envVarsNotice: '아래에 실제 인증키(API Key, DB 주소 등)를 입력하면 화면의 JSON 설정 코드에 실시간으로 반영됩니다. 입력값은 서버로 전송되지 않고 브라우저 내에서만 안전하게 처리됩니다.',
    enterVarPlaceholder: '입력',
    downloadJson: 'JSON 파일 다운로드',
    copyConfig: '설정 코드 복사하기',
    copiedClipboard: '클립보드에 복사되었습니다!',
    copyHint: '복사한 설정을 클라이언트 구성 파일에 붙여넣고 클라이언트를 재시작하세요.',
    category: '카테고리',
    transport: '전송 방식',
    license: '라이선스',
    githubRepo: 'GitHub 저장소',
    website: '공식 웹사이트',

    // Stack Modal
    stackModalTitle: '나만의 MCP 멀티 스택 빌더',
    serversSelected: '개 서버 선택됨',
    clearAll: '스택 비우기',
    emptyStackTitle: '스택이 비어 있습니다',
    emptyStackDesc: "디렉토리의 원하는 서버 카드에서 '+ 스택 추가'를 눌러 나만의 도구 조합을 만드세요.",
    serversInStack: '스택에 담긴 서버 목록',
    targetClient: '대상 AI 클라이언트',
    copyStack: '통합 설정 코드 복사',
    downloadStack: '통합 스택 JSON 다운로드',
    stackHint: '선택한 모든 서버가 하나의 설정 파일로 합쳐져 여러 도구를 동시에 실행할 수 있습니다.',

    // Empty state
    noMatchTitle: '조건에 일치하는 서버가 없습니다',
    noMatchDesc: '검색어를 변경하거나 카테고리/언어 필터를 초기화해 보세요.',
    resetFilters: '필터 전체 초기화',

    // Pagination
    showingPage: '현재 페이지',
    of: '/',
    total: '전체',
    previous: '이전',
    next: '다음',

    // Footer
    footerSyncText: 'MCPfinder © 2026. 공식 MCP 레지스트리, punkpeye/awesome-mcp-servers, npm에서 매일 자동으로 동기화됩니다.',
    protocolDocs: '프로토콜 공식 문서',
    referenceServers: '레퍼런스 서버',
    registryPortal: '레지스트리 포털',
    backgroundLoading: '인기 서버를 먼저 표시했습니다. 34,000+개 전체 서버 색인을 백그라운드에서 로딩 중입니다...',
  },
};

export function getCategoryLabel(categoryName: string, locale: Locale): string {
  if (categoryTranslations[categoryName]) {
    return categoryTranslations[categoryName][locale];
  }
  return categoryName;
}
