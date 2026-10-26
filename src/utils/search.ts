import type { ServerItem } from '../types';

// Korean query words → English terms found in (English) server descriptions
const KO_TERMS: Record<string, string[]> = {
  데이터베이스: ['database', 'sql'], 디비: ['database'], 검색: ['search'], 브라우저: ['browser'], 파일: ['file'],
  이메일: ['email', 'mail'], 메일: ['mail', 'email'], 슬랙: ['slack'], 노션: ['notion'], 깃허브: ['github'], 깃헙: ['github'],
  깃: ['git'], 이미지: ['image'], 영상: ['video'], 비디오: ['video'], 동영상: ['video'], 음성: ['speech', 'voice', 'audio'],
  오디오: ['audio'], 음악: ['music'], 번역: ['translat'], 날씨: ['weather'], 지도: ['map'], 주식: ['stock'], 코인: ['crypto'],
  암호화폐: ['crypto'], 결제: ['payment'], 캘린더: ['calendar'], 일정: ['calendar', 'schedule'], 문서: ['document', 'docs'],
  크롤링: ['crawl', 'scrap'], 스크래핑: ['scrap'], 수집: ['scrap', 'collect'], 자동화: ['automat'], 메모리: ['memory'],
  기억: ['memory'], 뉴스: ['news'], 트렌드: ['trend'], 유튜브: ['youtube'], 디스코드: ['discord'], 텔레그램: ['telegram'],
  카카오: ['kakao'], 엑셀: ['excel', 'spreadsheet'], 스프레드시트: ['spreadsheet'], 피디에프: ['pdf'], 배포: ['deploy'],
  모니터링: ['monitor'], 보안: ['security'], 로그: ['log'], 테스트: ['test'], 코드: ['code'], 도커: ['docker'],
  쿠버네티스: ['kubernetes'], 클라우드: ['cloud'], 데이터: ['data'], 분석: ['analy'], 차트: ['chart'], 디자인: ['design'],
  피그마: ['figma'], 쇼핑: ['shop', 'commerce'], 여행: ['travel'], 게임: ['game'], 웹: ['web'], 채팅: ['chat'],
  지식: ['knowledge'], 위키: ['wiki'], 논문: ['paper', 'arxiv'], 학술: ['research', 'paper'], 이슈: ['issue'],
  에이전트: ['agent'], 터미널: ['terminal'], 스토리지: ['storage'], 벡터: ['vector'], 그래프: ['graph'],
  구글: ['google'], 드라이브: ['drive'], 지라: ['jira'], 리니어: ['linear'], 트위터: ['twitter'], 인스타그램: ['instagram'],
};

// Words nearly every entry contains, or request filler ("찾아줘"); they would make everything match
const STOPWORDS = new Set(['mcp', 'server', 'servers', 'tool', 'tools', 'the', 'for', 'and', 'with', '서버', '도구', '툴', '찾아줘', '추천', '추천해줘', '필요해', '필요한']);

/** Each group is one query word plus its translations; a group matches if any alternative does */
export function parseQuery(query: string): string[][] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => (t.length > 1 || /[^\x00-\x7f]/.test(t)) && !STOPWORDS.has(t))
    .map((t) => {
      // Prefix match so particles still resolve: 데이터베이스를 → 데이터베이스
      const ko = Object.keys(KO_TERMS).filter((k) => t.startsWith(k)).sort((a, b) => b.length - a.length)[0];
      return ko ? [t, ...KO_TERMS[ko]] : [t];
    });
}

interface Fields {
  owner: string;
  name: string;
  cat: string;
  text: string;
}

// Lowercased once per item, not once per keystroke
const cache = new WeakMap<ServerItem, Fields>();
function fieldsOf(s: ServerItem, extraText?: (s: ServerItem) => string): Fields {
  let f = cache.get(s);
  if (!f) {
    f = {
      owner: s.id.toLowerCase().split('/')[0],
      name: s.name.toLowerCase(),
      cat: s.cat.toLowerCase(),
      text: `${s.desc} ${s.pkg ?? ''} ${s.cmd ?? ''} ${extraText?.(s) ?? ''}`.toLowerCase(),
    };
    cache.set(s, f);
  }
  return f;
}

/**
 * Rank items by how many query words they match, then match quality, then input (popularity) order.
 * extraText adds searchable text such as Korean labels; it must be stable per item (results are cached).
 */
export function searchServers(
  items: ServerItem[],
  query: string,
  extraText?: (s: ServerItem) => string
): ServerItem[] {
  const groups = parseQuery(query);
  if (groups.length === 0) return items;

  const scored: Array<{ item: ServerItem; hits: number; score: number; rank: number }> = [];
  items.forEach((item, rank) => {
    const f = fieldsOf(item, extraText);
    let hits = 0;
    let score = 0;
    for (const alts of groups) {
      let best = 0;
      for (const t of alts) {
        // Vendor's own server (github/github-mcp-server for "github") beats third-party ones
        const s = (f.owner === t ? 4 : 0) + (f.name.includes(t) ? 3 : 0) + (f.cat.includes(t) ? 2 : 0) + (f.text.includes(t) ? 1 : 0);
        if (s > best) best = s;
      }
      if (best > 0) hits++;
      score += best;
    }
    if (hits > 0) scored.push({ item, hits, score, rank });
  });

  scored.sort((a, b) => b.hits - a.hits || b.score - a.score || a.rank - b.rank);
  return scored.map((s) => s.item);
}
