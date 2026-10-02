/**
 * Official MCP Registry API client
 * Fetches all servers from registry.modelcontextprotocol.io
 */

import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fetchJson, writeJson, readJson, log } from '../utils.js';
import type { RegistryEntry, SyncResult } from '../types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const RAW_DIR = resolve(PROJECT_ROOT, 'data/raw');

const REGISTRY_URL = 'https://registry.modelcontextprotocol.io/v0/servers';

/**
 * Fetch servers from official MCP registry.
 * @param updatedSince - ISO timestamp; if provided, only fetches entries updated after this time (incremental)
 */
export async function fetchRegistry(updatedSince?: string): Promise<SyncResult<RegistryEntry>> {
  const entries: RegistryEntry[] = [];
  const errors: string[] = [];
  let nextCursor: string | null = null;
  
  log('registry', updatedSince
    ? `Starting incremental fetch (since ${updatedSince})...`
    : 'Starting full fetch from official MCP registry...');

  try {
    let page = 0;
    do {
      const url = new URL(REGISTRY_URL);
      url.searchParams.set('version', 'latest');
      url.searchParams.set('limit', '100');
      if (nextCursor) {
        url.searchParams.set('cursor', nextCursor);
      }
      if (updatedSince) {
        url.searchParams.set('updated_since', updatedSince);
      }

      const data = await fetchJson<any>(url.toString());
      
      const servers = data.servers || [];
      for (const item of servers) {
        const server = item.server || {};
        const meta = item._meta?.['io.modelcontextprotocol.registry/official'] || {};
        
        entries.push({
          name: server.name || 'unknown',
          title: server.title ?? null,
          description: server.description || '',
          version: server.version || '0.0.0',
          status: meta.status || 'active',
          isLatest: !!meta.isLatest,
          publishedAt: meta.publishedAt || new Date().toISOString(),
          updatedAt: meta.updatedAt || new Date().toISOString(),
          repositoryUrl: server.repository?.url ?? null,
          repositorySource: server.repository?.source ?? null,
          websiteUrl: server.websiteUrl ?? null,
          remotes: server.remotes ?? [],
          packages: server.packages ?? [],
          icons: server.icons ?? []
        });
      }

      nextCursor = data.metadata?.nextCursor || null;
      page++;
      
      if (page % 10 === 0) {
        log('registry', `  Fetched ${entries.length} entries (page ${page})...`);
      }
    } while (nextCursor);

    log('registry', `✓ Fetched ${entries.length} servers in ${page} pages`);

    // If incremental fetch was performed, merge with existing cache
    if (updatedSince) {
      const existing = await readJson<SyncResult<RegistryEntry>>(resolve(RAW_DIR, 'registry.json'));
      if (existing && Array.isArray(existing.entries)) {
        const map = new Map<string, RegistryEntry>();
        for (const e of existing.entries) {
          map.set(e.name, e);
        }
        for (const e of entries) {
          map.set(e.name, e);
        }
        const mergedEntries = Array.from(map.values());
        log('registry', `✓ Incremental merge: ${entries.length} updated/new, total cached: ${mergedEntries.length}`);
        return {
          source: 'registry',
          entries: mergedEntries,
          fetchedAt: new Date().toISOString(),
          errors
        };
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log('registry', `Error fetching registry: ${msg}`);
    errors.push(msg);
  }

  return {
    source: 'registry',
    entries,
    fetchedAt: new Date().toISOString(),
    errors
  };
}

// ===== CLI entry point =====
const isMain = process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  fetchRegistry().then(async (result) => {
    await writeJson(resolve(RAW_DIR, 'registry.json'), result);
    log('registry', `Done. Total entries: ${result.entries.length}`);
    
    // Stats
    const withRepo = result.entries.filter(e => e.repositoryUrl).length;
    const withPkg = result.entries.filter(e => e.packages.length > 0).length;
    const withRemote = result.entries.filter(e => e.remotes.length > 0).length;
    console.log(`  With repo: ${withRepo}`);
    console.log(`  With packages: ${withPkg}`);
    console.log(`  With remotes: ${withRemote}`);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
