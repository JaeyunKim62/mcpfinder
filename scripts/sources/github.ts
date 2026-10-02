/**
 * GitHub API enrichment - adds stars, forks, license, commit activity
 * Does NOT discover new servers, only enriches existing entries.
 */

import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import type { MCPServer } from "../types.js";
import { githubKey } from "../types.js";
import { fetchJson, writeJson, readJson, log, batchExecute, sleep } from "../utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../..");
const DATA_DIR = resolve(PROJECT_ROOT, "data");

interface GitHubRepoResponse {
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  created_at: string;
  open_issues_count: number;
  archived: boolean;
  license: { spdx_id: string } | null;
}

/**
 * Enrich MCPServer entries with GitHub metadata
 */
export async function enrichWithGitHub(
  servers: MCPServer[]
): Promise<MCPServer[]> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "mcp-list-sync",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    log("github", "Using authenticated requests (GITHUB_TOKEN set)");
  } else {
    log("github", "⚠ No GITHUB_TOKEN - rate limited to 60 req/hour");
  }

  // Deduplicate: group servers by GitHub owner/repo
  const repoMap = new Map<string, string[]>(); // key -> server ids
  for (const server of servers) {
    if (!server.githubUrl) continue;
    const key = githubKey(server.githubUrl);
    if (!key) continue;
    const ids = repoMap.get(key) ?? [];
    ids.push(server.id);
    repoMap.set(key, ids);
  }

  const uniqueRepos = Array.from(repoMap.keys());
  log("github", `Enriching ${uniqueRepos.length} unique repos...`);

  // Fetch in batches
  const enrichData = new Map<string, GitHubRepoResponse>();
  let successCount = 0;
  let errorCount = 0;
  let rateLimitHit = false;

  const batchSize = 5;
  const delayMs = token ? 100 : 1200; // slower without auth

  for (let i = 0; i < uniqueRepos.length; i += batchSize) {
    if (rateLimitHit) break;

    const batch = uniqueRepos.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (key) => {
        const url = `https://api.github.com/repos/${key}`;
        try {
          const data = await fetchJson<GitHubRepoResponse>(url, {
            retries: 2,
            delayMs: 500,
            headers,
          });
          return { key, data };
        } catch (err: any) {
          if (err.message?.includes("403") || err.message?.includes("429")) {
            rateLimitHit = true;
            log("github", `⚠ Rate limit hit at ${i + batch.indexOf(key)} repos`);
          }
          throw err;
        }
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        enrichData.set(result.value.key, result.value.data);
        successCount++;
      } else {
        errorCount++;
      }
    }

    // Progress log every 50
    if ((i + batchSize) % 50 === 0 || i + batchSize >= uniqueRepos.length) {
      log(
        "github",
        `  Progress: ${Math.min(i + batchSize, uniqueRepos.length)}/${uniqueRepos.length} (${successCount} ok, ${errorCount} errors)`
      );
    }

    if (i + batchSize < uniqueRepos.length) {
      await sleep(delayMs);
    }
  }

  // Apply enrichment data back to servers
  const enriched = servers.map((server) => {
    if (!server.githubUrl) return server;
    const key = githubKey(server.githubUrl);
    if (!key) return server;
    const data = enrichData.get(key);
    if (!data) return server;

    return {
      ...server,
      metrics: {
        ...server.metrics,
        githubStars: data.stargazers_count,
        githubForks: data.forks_count,
        lastCommitAt: data.pushed_at,
        createdAt: data.created_at,
        openIssues: data.open_issues_count,
        isArchived: data.archived,
      },
      license: data.license?.spdx_id ?? server.license,
      sources: server.sources.includes("github")
        ? server.sources
        : [...server.sources, "github" as const],
    };
  });

  log(
    "github",
    `✓ Enriched ${successCount} repos (${errorCount} errors, ${rateLimitHit ? "rate limited" : "completed"})`
  );

  return enriched;
}

// ===== CLI entry point =====
const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  log("github", "Starting GitHub enrichment...");

  const serversPath = resolve(DATA_DIR, "servers.json");
  const servers = await readJson<MCPServer[]>(serversPath);

  if (!servers) {
    console.error("❌ data/servers.json not found. Run merge first.");
    process.exit(1);
  }

  const enriched = await enrichWithGitHub(servers);
  await writeJson(serversPath, enriched);

  // Stats
  const withStars = enriched.filter((s) => s.metrics.githubStars !== null);
  const top10 = [...withStars]
    .sort((a, b) => (b.metrics.githubStars ?? 0) - (a.metrics.githubStars ?? 0))
    .slice(0, 10);

  log("github", `\nTop 10 by stars:`);
  for (const s of top10) {
    console.log(`  ⭐ ${s.metrics.githubStars} - ${s.name}`);
  }
}
