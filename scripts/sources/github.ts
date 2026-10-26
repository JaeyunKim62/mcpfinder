/**
 * GitHub API enrichment - adds stars, forks, license, commit activity
 * Does NOT discover new servers, only enriches existing entries.
 */

import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import type { MCPServer } from "../types.js";
import { githubKey } from "../types.js";
import { writeJson, readJson, log, sleep } from "../utils.js";

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

interface GraphQLRepo {
  stargazerCount: number;
  forkCount: number;
  pushedAt: string;
  createdAt: string;
  isArchived: boolean;
  issues: { totalCount: number };
  licenseInfo: { spdxId: string } | null;
}

// ~250 requests for 25k repos, well inside even the Actions GITHUB_TOKEN limit (1,000/hour)
const BATCH_SIZE = 100;

/** Fetch up to BATCH_SIZE repos in one GraphQL request; missing repos come back null */
async function queryRepos(keys: string[], token: string): Promise<Record<string, GraphQLRepo | null>> {
  const fields = "stargazerCount forkCount pushedAt createdAt isArchived issues(states: OPEN) { totalCount } licenseInfo { spdxId }";
  const query = `{ ${keys
    .map((k, i) => {
      const [owner, name] = k.split("/");
      return `r${i}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { ${fields} }`;
    })
    .join(" ")} }`;

  for (let attempt = 1; ; attempt++) {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "User-Agent": "mcp-list-sync", "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    // NOT_FOUND errors for individual repos still return 200 with partial data
    if (res.ok) {
      const body = (await res.json()) as { data?: Record<string, GraphQLRepo | null> };
      if (body.data) return body.data;
    }
    if (attempt === 3) throw new Error(`HTTP ${res.status}`);
    await sleep(2000 * attempt);
  }
}

/**
 * Enrich MCPServer entries with GitHub metadata
 */
export async function enrichWithGitHub(
  servers: MCPServer[]
): Promise<MCPServer[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    // GraphQL API rejects unauthenticated requests
    log("github", "⚠ No GITHUB_TOKEN - skipping enrichment");
    return servers;
  }

  // Deduplicate: group servers by GitHub owner/repo
  const uniqueRepos = [
    ...new Set(servers.map((s) => s.githubUrl && githubKey(s.githubUrl)).filter((k): k is string => !!k)),
  ];
  log("github", `Enriching ${uniqueRepos.length} unique repos via GraphQL (${BATCH_SIZE} per request)...`);

  const enrichData = new Map<string, GitHubRepoResponse>();
  let failedBatches = 0;

  for (let i = 0; i < uniqueRepos.length; i += BATCH_SIZE) {
    const batch = uniqueRepos.slice(i, i + BATCH_SIZE);
    try {
      const data = await queryRepos(batch, token);
      batch.forEach((key, j) => {
        const r = data[`r${j}`];
        if (!r) return; // deleted, renamed away or private
        enrichData.set(key, {
          stargazers_count: r.stargazerCount,
          forks_count: r.forkCount,
          pushed_at: r.pushedAt,
          created_at: r.createdAt,
          open_issues_count: r.issues.totalCount,
          archived: r.isArchived,
          license: r.licenseInfo ? { spdx_id: r.licenseInfo.spdxId } : null,
        });
      });
    } catch (err) {
      failedBatches++;
      log("github", `  ⚠ Batch at ${i} failed: ${err}`);
    }

    const done = Math.min(i + BATCH_SIZE, uniqueRepos.length);
    if (done % 2000 < BATCH_SIZE || done === uniqueRepos.length) {
      log("github", `  Progress: ${done}/${uniqueRepos.length} (${enrichData.size} found)`);
    }
    await sleep(200); // stay under GitHub's secondary rate limit
  }

  const successCount = enrichData.size;
  const errorCount = uniqueRepos.length - successCount;
  const rateLimitHit = failedBatches > 0;

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
