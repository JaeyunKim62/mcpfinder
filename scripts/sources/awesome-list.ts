import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import type { AwesomeListEntry, Language, Scope, OS, SyncResult } from '../types.js';
import { fetchText, writeJson, log } from '../utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const RAW_DIR = resolve(PROJECT_ROOT, 'data/raw');

const AWESOME_LIST_URL = 'https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md';

export async function fetchAwesomeList(): Promise<SyncResult<AwesomeListEntry>> {
  log('awesome-list', 'Fetching README.md...');
  const text = await fetchText(AWESOME_LIST_URL);
  
  const entries: AwesomeListEntry[] = [];
  const errors: string[] = [];
  
  const lines = text.split('\n');
  let currentCategory = '';
  
  // Match H3 headers like: ### 🔗 <a name="aggregators"></a>Aggregators
  const H3_REGEX = /^###(?:[^<]+)?<a name="[^"]+"><\/a>\s*(.+)$/;
  // Match entry lines like: - [name](url) ...emojis... - description
  const ENTRY_REGEX = /^- \[(.*?)\]\((.*?)\)(.*?)\s+-\s+(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Try to match H3 category header
    const h3Match = line.match(H3_REGEX);
    if (h3Match) {
      currentCategory = h3Match[1].trim();
      continue;
    }
    
    // Fallback H3 matching for simpler headers
    if (line.startsWith('### ')) {
      const cleanCat = line.replace(/^###\s+(?:.*?\s+)?(?:<a[^>]*><\/a>)?\s*(.*)$/, '$1').trim();
      if (cleanCat && !line.includes('Table of Contents')) {
         currentCategory = cleanCat;
      }
    }
    
    // Try to match an entry line
    if (line.startsWith('- [')) {
      const match = line.match(ENTRY_REGEX);
      if (!match) continue;
      
      const name = match[1].trim();
      const firstLink = match[2].trim();
      const tagsPart = match[3].trim();
      const description = match[4].trim();
      
      if (!currentCategory || currentCategory === 'Table of Contents') continue;
      
      // Parse language emoji
      let language: Language = 'unknown';
      if (tagsPart.includes('🐍')) language = 'python';
      else if (tagsPart.includes('📇')) language = 'typescript';
      else if (tagsPart.includes('🏎️')) language = 'go';
      else if (tagsPart.includes('🦀')) language = 'rust';
      else if (tagsPart.includes('#️⃣')) language = 'csharp';
      else if (tagsPart.includes('☕')) language = 'java';
      else if (tagsPart.includes('🌊')) language = 'cpp';
      else if (tagsPart.includes('💎')) language = 'ruby';

      // Parse scope emoji
      let scope: Scope = 'unknown';
      if (tagsPart.includes('☁️') && tagsPart.includes('🏠')) scope = 'hybrid';
      else if (tagsPart.includes('☁️')) scope = 'cloud';
      else if (tagsPart.includes('🏠') || tagsPart.includes('📟')) scope = 'local';
      
      // Parse OS emoji
      const osSupport: OS[] = [];
      if (tagsPart.includes('🍎')) osSupport.push('macos');
      if (tagsPart.includes('🪟')) osSupport.push('windows');
      if (tagsPart.includes('🐧')) osSupport.push('linux');
      
      const isOfficial = tagsPart.includes('🎖️');
      
      entries.push({
        name,
        githubUrl: firstLink,
        description,
        category: currentCategory,
        language,
        scope,
        osSupport,
        isOfficial
      });
    }
  }
  
  log('awesome-list', `✓ Parsed ${entries.length} entries`);
  
  return {
    source: 'awesome-list',
    entries,
    fetchedAt: new Date().toISOString(),
    errors
  };
}

// ===== CLI entry point =====
const isMain = process.argv[1] && 
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  fetchAwesomeList().then(async (result) => {
    const outPath = resolve(RAW_DIR, 'awesome-list.json');
    await writeJson(outPath, result);
    
    const counts: Record<string, number> = {};
    for (const e of result.entries) {
      counts[e.category] = (counts[e.category] || 0) + 1;
    }
    
    log('awesome-list', `Total entries: ${result.entries.length}`);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    for (const [cat, count] of sorted) {
      console.log(`  ${count.toString().padStart(4)} - ${cat}`);
    }
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
