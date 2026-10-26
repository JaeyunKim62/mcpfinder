import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { generateClientConfig } from '../src/utils/configGenerator.js';
import { searchServers as rankServers } from '../src/utils/search.js';
import type { ServerItem } from '../src/types.js';

const CATALOG_PATH = fileURLToPath(new URL('../public/data/catalog.json', import.meta.url));

let catalog: ServerItem[] | null = null;
// Already sorted by popularity (essentials, official, then downloads/stars) by build-catalog
const getCatalog = () => (catalog ??= JSON.parse(readFileSync(CATALOG_PATH, 'utf-8')) as ServerItem[]);

export function searchServers(
  items: ServerItem[],
  opts: { query: string; category?: string; scope?: string; officialOnly?: boolean; limit?: number }
): ServerItem[] {
  const cat = opts.category?.toLowerCase();
  const filtered = items.filter(
    (item) =>
      (!cat || item.cat.toLowerCase().includes(cat)) &&
      (!opts.scope || item.scope === opts.scope) &&
      (!opts.officialOnly || item.off)
  );
  return rankServers(filtered, opts.query).slice(0, opts.limit ?? 10);
}

const summarize = (s: ServerItem) => ({
  id: s.id,
  name: s.name,
  description: s.desc.length > 240 ? s.desc.slice(0, 240) + '…' : s.desc,
  category: s.cat,
  scope: s.scope,
  official: s.off,
  essential: !!s.top,
  githubStars: s.stars,
  npmWeeklyDownloads: s.dl,
  lastUpdated: s.updatedAt,
  github: s.gh,
  install: s.remoteUrl ? `remote: ${s.remoteUrl}` : s.cmd ?? (s.pkg ? `${s.pkgType}: ${s.pkg}` : null),
  requiredEnv: s.envs?.filter((e) => e.required).map((e) => e.name) ?? [],
});

const text = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });

export function createServer(): McpServer {
  const server = new McpServer({ name: 'mcpfinder', version: '0.1.0' });

  server.registerTool(
    'search_mcp_servers',
    {
      title: 'Search MCP servers',
      description:
        'Search a catalog of 34,000+ MCP servers and return the best matches, most popular first. ' +
        'Use short English keywords for the capability needed (e.g. "postgres", "slack notion", "pdf extract"). ' +
        'To recommend servers for a project, run several searches, one per need, and compare stars, downloads and lastUpdated. ' +
        'essential=true marks hand-picked well-known servers (often vendor-official remote ones with no stars); prefer them when they fit.',
      inputSchema: {
        query: z.string().describe('English keywords; any matching keyword counts, more matches rank higher'),
        category: z.string().optional().describe('Filter by category (substring); see list_categories'),
        scope: z.enum(['local', 'cloud']).optional().describe('local = runs on your machine (stdio), cloud = hosted remote server'),
        officialOnly: z.boolean().optional().describe('Only servers from the official MCP registry'),
        limit: z.number().int().min(1).max(30).optional().describe('Default 10'),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) => text(searchServers(getCatalog(), args).map(summarize))
  );

  server.registerTool(
    'get_install_config',
    {
      title: 'Get MCP install config',
      description: 'Generate a ready-to-paste config (or CLI command) to install one server, by id from search_mcp_servers.',
      inputSchema: {
        id: z.string(),
        client: z.enum(['claude_code', 'claude', 'cursor', 'windsurf', 'zed']).describe('claude = Claude Desktop'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ id, client }) => {
      const item = getCatalog().find((s) => s.id === id);
      if (!item) return { ...text({ error: `No server with id "${id}". Use search_mcp_servers first.` }), isError: true };
      const cfg = generateClientConfig(item, client);
      return text({ ...cfg, env: item.envs ?? [] });
    }
  );

  server.registerTool(
    'list_categories',
    {
      title: 'List MCP categories',
      description: 'List catalog categories with server counts, for the category filter of search_mcp_servers.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const counts = new Map<string, number>();
      for (const s of getCatalog()) counts.set(s.cat, (counts.get(s.cat) ?? 0) + 1);
      return text([...counts].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })));
    }
  );

  return server;
}
