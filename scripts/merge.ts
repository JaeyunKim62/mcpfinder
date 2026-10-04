/**
 * Merge all raw data sources into a unified MCPServer[] dataset
 */

import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import type {
  MCPServer,
  AwesomeListEntry,
  RegistryEntry,
  NpmEntry,
  SyncResult,
  Transport,
  InstallInfo,
  EnvVar,
} from "./types.js";
import { githubKey, emptyMetrics } from "./types.js";
import { readJson, writeJson, log } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(PROJECT_ROOT, "data");
const RAW_DIR = resolve(DATA_DIR, "raw");

const CATEGORY_RULES: Array<{ category: string; regex: RegExp }> = [
  { category: "Databases", regex: /\b(postgres|postgresql|mysql|sqlite|mongodb|redis|prisma|supabase|surrealdb|cockroach|couchdb|dynamodb|clickhouse|mariadb|neo4j|cassandra|fauna|sql|database|db|vector-db)\b/i },
  { category: "Search & Data Extraction", regex: /\b(search|brave-search|tavily|scrape|scraping|scraper|crawler|crawling|spider|firecrawl|playwright|puppeteer|browserbase|web-scraping|extract|extractor|fetch)\b/i },
  { category: "Developer Tools", regex: /\b(github|gitlab|git|docker|kubernetes|k8s|linter|compiler|ast|code-analysis|formatter|debugging|debug|terminal|cli|devtools|dev-tool|shell|powershell|bash|vscode|ide)\b/i },
  { category: "Communication", regex: /\b(slack|discord|telegram|matrix|zulip|whatsapp|teams|wechat|email|gmail|smtp|imap|sms|twilio|messaging|chat|mail)\b/i },
  { category: "Finance & Fintech", regex: /\b(crypto|bitcoin|ethereum|solana|blockchain|web3|defi|stock|trading|nasdaq|forex|currency|finance|fintech|stripe|invoice|accounting|bank|banking|portfolio|wallet|x402)\b/i },
  { category: "Knowledge & Memory", regex: /\b(memory|rag|vector|embedding|knowledge|notion|obsidian|confluence|wiki|graphrag|pinecone|qdrant|chroma|weaviate|milvus|zep|mem0|second-brain)\b/i },
  { category: "File Systems", regex: /\b(filesystem|file-system|files|s3|minio|directory|folder|pdf|docx|excel|spreadsheet|csv|parquet|unzip|tar|storage)\b/i },
  { category: "Cloud Platforms", regex: /\b(aws|azure|gcp|google-cloud|cloudflare|vercel|netlify|fly\.io|render|heroku|cloud|serverless|lambda)\b/i },
  { category: "Browser Automation", regex: /\b(browser|automation|selenium|playwright|puppeteer|web-automation|headless|tab-management)\b/i },
  { category: "Security", regex: /\b(security|auth|authentication|oauth|jwt|vault|secret|firewall|vulnerability|cve|audit|pentest|shodan|cert|ssl|tls|guardrail)\b/i },
  { category: "Monitoring", regex: /\b(monitoring|metrics|telemetry|sentry|datadog|prometheus|grafana|opentelemetry|uptime|healthcheck|alerting|logs|logging)\b/i },
  { category: "Workplace & Productivity", regex: /\b(jira|linear|trello|asana|notion|clickup|calendar|google-calendar|todo|task|tasks|project-management|productivity|meeting|zoom)\b/i },
  { category: "Multimedia Process", regex: /\b(image|video|audio|tts|stt|whisper|speech|sound|music|ffmpeg|media|canvas|svg|graphics|rendering|dall-e|midjourney)\b/i },
  { category: "Coding Agents", regex: /\b(agent|agents|swarm|orchestration|agentic|autonomous|multi-agent|planner|harness|meta-agent)\b/i },
  { category: "Social Media", regex: /\b(twitter|x\.com|mastodon|reddit|bluesky|linkedin|instagram|youtube|tiktok)\b/i },
  { category: "Location Services", regex: /\b(maps|google-maps|openstreetmap|geolocation|geocoding|weather|climate|forecast)\b/i }
];

export function inferCategory(name: string, description: string, tags: string[] = []): string {
  const text = `${name} ${description} ${tags.join(" ")}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.regex.test(text)) {
      return rule.category;
    }
  }
  return "Other Tools and Integrations";
}

/** Create MCPServer from AwesomeListEntry */
function fromAwesomeEntry(entry: AwesomeListEntry): MCPServer {
  const key = githubKey(entry.githubUrl);
  const match = entry.githubUrl.match(
    /github\.com\/([^/]+)\/([^/]+)/
  );

  return {
    id: key ?? entry.name,
    name: entry.name,
    description: entry.description,
    category: entry.category,
    tags: [],
    language: entry.language,
    scope: entry.scope,
    osSupport: entry.osSupport,
    isOfficial: entry.isOfficial,
    githubUrl: entry.githubUrl,
    githubOwner: match?.[1] ?? null,
    githubRepo: match?.[2]?.replace(/\.git$/, "") ?? null,
    websiteUrl: null,
    transport: "unknown",
    install: null,
    envVars: [],
    metrics: { ...emptyMetrics(), npmWeeklyDownloads: null },
    license: null,
    sources: ["awesome-list"],
    registryVersion: null,
    lastSyncedAt: new Date().toISOString(),
  };
}

/** Extract install info from a registry entry */
function extractInstallInfo(entry: RegistryEntry): InstallInfo | null {
  // Try packages first
  if (entry.packages.length > 0) {
    const pkg = entry.packages[0];
    const type = pkg.registryType as InstallInfo["type"];

    let installCommand: string | null = null;
    if (pkg.registryType === "npm") {
      installCommand = pkg.runtimeHint
        ? `${pkg.runtimeHint} -y ${pkg.identifier}`
        : `npx -y ${pkg.identifier}`;
    } else if (pkg.registryType === "pypi") {
      installCommand = `uvx ${pkg.identifier}`;
    } else if (pkg.registryType === "docker" || pkg.registryType === "oci") {
      installCommand = `docker run ${pkg.identifier}`;
    }

    return {
      type: ["npm", "pypi", "docker", "binary", "remote"].includes(type)
        ? type
        : "binary",
      packageName: pkg.identifier,
      installCommand,
      remoteUrl: null,
    };
  }

  // Try remotes
  if (entry.remotes.length > 0) {
    return {
      type: "remote",
      packageName: null,
      installCommand: null,
      remoteUrl: entry.remotes[0].url,
    };
  }

  return null;
}

/** Extract env vars from registry entry */
function extractEnvVars(entry: RegistryEntry): EnvVar[] {
  if (entry.packages.length === 0) return [];
  const pkg = entry.packages[0];
  if (!pkg.environmentVariables) return [];

  return pkg.environmentVariables.map((ev) => ({
    name: ev.name,
    description: ev.description ?? "",
    required: ev.isRequired ?? false,
    isSecret: ev.isSecret ?? false,
  }));
}

/** Extract transport from registry entry */
function extractTransport(entry: RegistryEntry): Transport {
  if (entry.packages.length > 0) {
    const t = entry.packages[0].transport?.type;
    if (t === "stdio") return "stdio";
    if (t === "sse") return "sse";
    if (t === "streamable-http") return "streamable_http";
  }
  if (entry.remotes.length > 0) {
    const t = entry.remotes[0].type;
    if (t === "sse") return "sse";
    if (t === "streamable-http") return "streamable_http";
  }
  return "unknown";
}

/** Clean npm/git repository URL to plain GitHub URL */
function cleanRepoUrl(url: string): string {
  return url
    .replace(/^git\+/, "")
    .replace(/\.git$/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/^ssh:\/\/git@github\.com/, "https://github.com");
}

/**
 * Merge all raw sources into unified MCPServer[]
 */
export async function mergeAllSources(): Promise<MCPServer[]> {
  const now = new Date().toISOString();
  const serverMap = new Map<string, MCPServer>();

  // ===== Step 1: Awesome-list entries (category backbone) =====
  const awesomeRaw = await readJson<SyncResult<AwesomeListEntry>>(
    resolve(RAW_DIR, "awesome-list.json")
  );
  if (awesomeRaw) {
    log("merge", `Processing ${awesomeRaw.entries.length} awesome-list entries...`);
    for (const entry of awesomeRaw.entries) {
      const server = fromAwesomeEntry(entry);
      serverMap.set(server.id, server);
    }
  } else {
    log("merge", "⚠ awesome-list.json not found, skipping");
  }

  // ===== Step 2: Registry entries overlay =====
  const registryRaw = await readJson<SyncResult<RegistryEntry>>(
    resolve(RAW_DIR, "registry.json")
  );
  if (registryRaw) {
    log("merge", `Processing ${registryRaw.entries.length} registry entries...`);
    let newFromRegistry = 0;
    let mergedFromRegistry = 0;

    for (const entry of registryRaw.entries) {
      // Only keep latest, active entries
      if (!entry.isLatest || entry.status !== "active") continue;

      const repoUrl = entry.repositoryUrl;
      const key = repoUrl ? githubKey(repoUrl) : null;

      const install = extractInstallInfo(entry);
      const envVars = extractEnvVars(entry);
      const transport = extractTransport(entry);

      if (key && serverMap.has(key)) {
        // Merge into existing
        const existing = serverMap.get(key)!;
        existing.install = install ?? existing.install;
        existing.envVars =
          envVars.length > 0 ? envVars : existing.envVars;
        existing.transport =
          transport !== "unknown" ? transport : existing.transport;
        existing.registryVersion = entry.version;
        existing.websiteUrl = entry.websiteUrl ?? existing.websiteUrl;
        existing.metrics.lastCommitAt = entry.updatedAt || entry.publishedAt || existing.metrics.lastCommitAt;
        if (!existing.sources.includes("registry")) {
          existing.sources.push("registry");
        }
        existing.lastSyncedAt = now;
        mergedFromRegistry++;
      } else {
        // New entry from registry
        const match = repoUrl?.match(/github\.com\/([^/]+)\/([^/]+)/);
        const id = key ?? entry.name;
        const inferredCat = inferCategory(entry.title ?? entry.name, entry.description);

        const server: MCPServer = {
          id,
          name: entry.title ?? entry.name,
          description: entry.description,
          category: inferredCat,
          tags: [],
          language: "unknown",
          scope: entry.remotes.length > 0 ? "cloud" : "unknown",
          osSupport: [],
          isOfficial: false,
          githubUrl: repoUrl,
          githubOwner: match?.[1] ?? null,
          githubRepo: match?.[2]?.replace(/\.git$/, "") ?? null,
          websiteUrl: entry.websiteUrl ?? null,
          transport,
          install,
          envVars,
          metrics: {
            ...emptyMetrics(),
            lastCommitAt: entry.updatedAt || entry.publishedAt || null,
          },
          license: null,
          sources: ["registry"],
          registryVersion: entry.version,
          lastSyncedAt: now,
        };

        serverMap.set(id, server);
        newFromRegistry++;
      }
    }
    log(
      "merge",
      `  Registry: ${mergedFromRegistry} merged, ${newFromRegistry} new`
    );
  } else {
    log("merge", "⚠ registry.json not found, skipping");
  }

  // ===== Step 3: npm entries overlay =====
  const npmRaw = await readJson<SyncResult<NpmEntry>>(
    resolve(RAW_DIR, "npm.json")
  );
  if (npmRaw) {
    log("merge", `Processing ${npmRaw.entries.length} npm entries...`);
    let newFromNpm = 0;
    let mergedFromNpm = 0;

    for (const entry of npmRaw.entries) {
      const repoUrl = entry.repositoryUrl
        ? cleanRepoUrl(entry.repositoryUrl)
        : null;
      const key = repoUrl ? githubKey(repoUrl) : null;

      if (key && serverMap.has(key)) {
        // Merge: add download metrics
        const existing = serverMap.get(key)!;
        existing.metrics.npmWeeklyDownloads = entry.weeklyDownloads;
        existing.metrics.lastCommitAt = entry.lastUpdated || existing.metrics.lastCommitAt;
        if (!existing.install) {
          existing.install = {
            type: "npm",
            packageName: entry.packageName,
            installCommand: `npx -y ${entry.packageName}`,
            remoteUrl: null,
          };
        }
        if (!existing.sources.includes("npm")) {
          existing.sources.push("npm");
        }
        existing.lastSyncedAt = now;
        mergedFromNpm++;
      } else if (entry.weeklyDownloads > 100) {
        // New entry — only if meaningfully popular
        const id = key ?? `npm:${entry.packageName}`;
        const match = repoUrl?.match(/github\.com\/([^/]+)\/([^/]+)/);

        const server: MCPServer = {
          id,
          name: entry.packageName,
          description: entry.description,
          category: inferCategory(entry.packageName, entry.description, entry.keywords),
          tags: entry.keywords.filter(
            (k) => !["mcp", "mcp-server", "model-context-protocol"].includes(k)
          ),
          language: "typescript",
          scope: "unknown",
          osSupport: [],
          isOfficial: false,
          githubUrl: repoUrl,
          githubOwner: match?.[1] ?? null,
          githubRepo: match?.[2]?.replace(/\.git$/, "") ?? null,
          websiteUrl: entry.homepageUrl,
          transport: "unknown",
          install: {
            type: "npm",
            packageName: entry.packageName,
            installCommand: `npx -y ${entry.packageName}`,
            remoteUrl: null,
          },
          envVars: [],
          metrics: {
            ...emptyMetrics(),
            lastCommitAt: entry.lastUpdated,
            npmWeeklyDownloads: entry.weeklyDownloads,
          },
          license: entry.license,
          sources: ["npm"],
          registryVersion: null,
          lastSyncedAt: now,
        };

        serverMap.set(id, server);
        newFromNpm++;
      }
    }
    log("merge", `  npm: ${mergedFromNpm} merged, ${newFromNpm} new`);
  } else {
    log("merge", "⚠ npm.json not found, skipping");
  }

  // ===== Final: Sort by stars descending, then name =====
  const allServers = Array.from(serverMap.values()).sort((a, b) => {
    const starsA = a.metrics.githubStars ?? 0;
    const starsB = b.metrics.githubStars ?? 0;
    if (starsB !== starsA) return starsB - starsA;
    return a.name.localeCompare(b.name);
  });

  log("merge", `✓ Total: ${allServers.length} servers`);

  return allServers;
}

// ===== CLI entry point =====
const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  log("merge", "Starting merge...");
  const servers = await mergeAllSources();
  await writeJson(resolve(DATA_DIR, "servers.json"), servers);

  // Category stats
  const catCounts = new Map<string, number>();
  for (const s of servers) {
    catCounts.set(s.category, (catCounts.get(s.category) ?? 0) + 1);
  }
  const sorted = [...catCounts.entries()].sort((a, b) => b[1] - a[1]);

  log("merge", `\nCategories:`);
  for (const [cat, count] of sorted) {
    console.log(`  ${count.toString().padStart(4)} - ${cat}`);
  }

  // Source breakdown
  const sourceCounts = { "awesome-list": 0, registry: 0, npm: 0 };
  for (const s of servers) {
    for (const src of s.sources) {
      if (src in sourceCounts)
        sourceCounts[src as keyof typeof sourceCounts]++;
    }
  }
  log("merge", `\nSources: ${JSON.stringify(sourceCounts)}`);
}
