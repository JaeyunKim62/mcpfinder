/**
 * GitHub source - discovers MCP servers that live only on GitHub (not in the registry, awesome-list or npm)
 *  1. data/manual.json: hand-picked repos, always included
 *  2. Topic search: repos tagged mcp-server / model-context-protocol / mcp-servers with >= MIN_STARS stars
 */

import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import type { GitHubRepoEntry, SyncResult } from "../types.js";
import { githubKey } from "../types.js";
import { writeJson, readJson, log, sleep } from "../utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../../data");

const TOPICS = ["mcp-server", "model-context-protocol", "mcp-servers"];
// Below this, results are mostly empty experiments; manual.json covers small gems
const MIN_STARS = 3;
// Search API: 30 requests/minute with a token
const SEARCH_DELAY_MS = 2100;

interface ManualEntry {
  url: string;
  install?: string;
}

interface ApiRepo {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  license: { spdx_id: string } | null;
  homepage: string | null;
  pushed_at: string;
  created_at: string;
  archived: boolean;
  open_issues_count: number;
}

const toEntry = (r: ApiRepo): GitHubRepoEntry => ({
  fullName: r.full_name,
  url: r.html_url,
  description: r.description ?? "",
  stars: r.stargazers_count,
  forks: r.forks_count,
  language: r.language,
  topics: r.topics ?? [],
  license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
  homepage: r.homepage || null,
  pushedAt: r.pushed_at,
  createdAt: r.created_at,
  archived: r.archived,
  openIssues: r.open_issues_count,
});

async function gh<T>(path: string, headers: Record<string, string>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://api.github.com${path}`, { headers });
    if (res.ok) return (await res.json()) as T;
    // 403/429 = rate limited: wait for the window to reset
    if ((res.status === 403 || res.status === 429) && attempt < 4) {
      log("github-search", `  rate limited, waiting 60s...`);
      await sleep(60_000);
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${path}`);
  }
}

/** Search one topic, splitting the created-date range until each slice fits the 1,000-result search cap */
export async function searchTopic(topic: string, from: Date, to: Date, headers: Record<string, string>, out: Map<string, GitHubRepoEntry>) {
  const range = `${from.toISOString().slice(0, 10)}..${to.toISOString().slice(0, 10)}`;
  const q = encodeURIComponent(`topic:${topic} stars:>=${MIN_STARS} created:${range}`);
  const first = await gh<{ total_count: number; items: ApiRepo[] }>(`/search/repositories?q=${q}&per_page=100&page=1`, headers);
  await sleep(SEARCH_DELAY_MS);

  const days = (to.getTime() - from.getTime()) / 86_400_000;
  if (first.total_count > 1000 && days > 1) {
    const mid = new Date((from.getTime() + to.getTime()) / 2);
    await searchTopic(topic, from, mid, headers, out);
    await searchTopic(topic, new Date(mid.getTime() + 86_400_000), to, headers, out);
    return;
  }

  for (const r of first.items) out.set(r.full_name.toLowerCase(), toEntry(r));
  const pages = Math.min(10, Math.ceil(first.total_count / 100));
  for (let page = 2; page <= pages; page++) {
    const res = await gh<{ items: ApiRepo[] }>(`/search/repositories?q=${q}&per_page=100&page=${page}`, headers);
    for (const r of res.items) out.set(r.full_name.toLowerCase(), toEntry(r));
    await sleep(SEARCH_DELAY_MS);
  }
}

export async function fetchGitHubRepos(): Promise<SyncResult<GitHubRepoEntry>> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "mcpfinder-sync" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const repos = new Map<string, GitHubRepoEntry>();
  const errors: string[] = [];

  // 1. Manual list (works without a token: 60 requests/hour is plenty)
  const manual = (await readJson<ManualEntry[]>(resolve(DATA_DIR, "manual.json"))) ?? [];
  for (const m of manual) {
    const key = githubKey(m.url);
    if (!key) {
      errors.push(`manual.json: not a GitHub repo URL: ${m.url}`);
      continue;
    }
    try {
      const entry = toEntry(await gh<ApiRepo>(`/repos/${key}`, headers));
      repos.set(key, m.install ? { ...entry, install: m.install } : entry);
    } catch (err) {
      errors.push(`manual.json ${key}: ${err}`);
    }
  }
  log("github-search", `Manual list: ${repos.size}/${manual.length} repos`);

  // 2. Topic search (needs a token: unauthenticated search is 10 requests/minute)
  if (!token) {
    log("github-search", "⚠ No GITHUB_TOKEN - skipping topic search");
  } else {
    const found = new Map<string, GitHubRepoEntry>();
    for (const topic of TOPICS) {
      try {
        await searchTopic(topic, new Date("2008-01-01"), new Date(), headers, found);
        log("github-search", `  topic:${topic} → ${found.size} unique repos so far`);
      } catch (err) {
        errors.push(`topic:${topic}: ${err}`);
      }
    }
    // Manual entries win (they may carry an install override)
    for (const [k, v] of found) if (!repos.has(k)) repos.set(k, v);
  }

  log("github-search", `✓ ${repos.size} repos, ${errors.length} errors`);
  return { source: "github", entries: [...repos.values()], fetchedAt: new Date().toISOString(), errors };
}

// ===== CLI entry point =====
const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const result = await fetchGitHubRepos();
  await writeJson(resolve(DATA_DIR, "raw/github-repos.json"), result);
}
