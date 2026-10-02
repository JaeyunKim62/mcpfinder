/**
 * npm Registry search client
 * Searches for MCP server packages on npm
 */

import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fetchJson, writeJson, readJson, log, sleep } from '../utils.js';
import type { NpmEntry, SyncResult } from '../types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const RAW_DIR = resolve(PROJECT_ROOT, 'data/raw');

const NPM_SEARCH_URL = 'https://registry.npmjs.org/-/v1/search';

export async function fetchNpmPackages(): Promise<SyncResult<NpmEntry>> {
  const entries: NpmEntry[] = [];
  const errors: string[] = [];
  
  log('npm', 'Starting fetch from npm registry...');

  try {
    let from = 0;
    const size = 250;
    let total = 0;

    do {
      const url = new URL(NPM_SEARCH_URL);
      url.searchParams.set('text', 'keywords:mcp-server');
      url.searchParams.set('size', size.toString());
      url.searchParams.set('from', from.toString());

      const data = await fetchJson<any>(url.toString());
      
      const objects = data.objects || [];
      if (objects.length === 0) break;

      total = data.total || 0;

      for (const obj of objects) {
        const pkg = obj.package || {};
        
        // Clean repository URL
        let repositoryUrl = pkg.links?.repository ?? null;
        if (repositoryUrl) {
          repositoryUrl = repositoryUrl
            .replace(/^git\+/, '')
            .replace(/\.git$/, '')
            .replace(/^git:\/\//, 'https://')
            .replace(/^ssh:\/\/git@github\.com/, 'https://github.com');
        }

        entries.push({
          packageName: pkg.name || 'unknown',
          version: pkg.version || '0.0.0',
          description: pkg.description || '',
          keywords: pkg.keywords || [],
          license: pkg.license ?? null,
          repositoryUrl,
          homepageUrl: pkg.links?.homepage ?? null,
          npmUrl: pkg.links?.npm || `https://www.npmjs.com/package/${pkg.name}`,
          weeklyDownloads: obj.downloads?.weekly || 0,
          monthlyDownloads: obj.downloads?.monthly || 0,
          score: obj.score?.final || 0,
          maintainers: (pkg.maintainers || []).map((m: any) => m.username || m.email || 'unknown'),
          lastUpdated: pkg.date || new Date().toISOString()
        });
      }

      log('npm', `  Fetched ${entries.length}/${total} packages (offset ${from})...`);
      from += size;
      
      // npm search API caps at 5000 offset
      if (from >= 5000) {
        log('npm', '  Reached npm API offset limit (5000)');
        break;
      }
      
      // Small delay to be polite
      await sleep(200);
    } while (from < total);

    log('npm', `✓ Fetched ${entries.length} packages (total available: ${total})`);

    // Merge with existing npm cache so historical packages are retained
    const existing = await readJson<SyncResult<NpmEntry>>(resolve(RAW_DIR, 'npm.json'));
    if (existing && Array.isArray(existing.entries)) {
      const map = new Map<string, NpmEntry>();
      for (const e of existing.entries) {
        map.set(e.packageName, e);
      }
      for (const e of entries) {
        map.set(e.packageName, e);
      }
      const mergedEntries = Array.from(map.values());
      log('npm', `✓ Total cached npm packages: ${mergedEntries.length}`);
      return {
        source: 'npm',
        entries: mergedEntries,
        fetchedAt: new Date().toISOString(),
        errors
      };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log('npm', `Error fetching npm packages: ${msg}`);
    errors.push(msg);
  }

  return {
    source: 'npm',
    entries,
    fetchedAt: new Date().toISOString(),
    errors
  };
}

// ===== CLI entry point =====
const isMain = process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  fetchNpmPackages().then(async (result) => {
    await writeJson(resolve(RAW_DIR, 'npm.json'), result);
    log('npm', `Done. Total entries: ${result.entries.length}`);
    
    // Top 10 by downloads
    const top = [...result.entries]
      .sort((a, b) => b.weeklyDownloads - a.weeklyDownloads)
      .slice(0, 10);
    console.log('\nTop 10 by weekly downloads:');
    for (const e of top) {
      console.log(`  ${e.weeklyDownloads.toLocaleString().padStart(10)} - ${e.packageName}`);
    }
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
