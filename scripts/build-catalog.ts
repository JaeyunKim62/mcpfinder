/**
 * Build optimized web catalog datasets from data/servers.json
 */

import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { readJson, writeJson, log } from "./utils.js";
import type { MCPServer } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const SERVERS_PATH = resolve(PROJECT_ROOT, "data/servers.json");
const PUBLIC_DATA_DIR = resolve(PROJECT_ROOT, "public/data");

export interface WebServerItem {
  id: string;
  name: string;
  desc: string;
  cat: string;
  lang: string;
  scope: string;
  off: boolean;
  gh: string | null;
  web: string | null;
  trans: string;
  cmd: string | null;
  pkg: string | null;
  pkgType: string | null;
  remoteUrl: string | null;
  envs: Array<{ name: string; required: boolean; secret: boolean }> | null;
  stars: number | null;
  dl: number | null;
  lic: string | null;
  srcs: string[];
  updatedAt: string | null;
}

export interface CatalogStats {
  total: number;
  withInstall: number;
  withGithub: number;
  categories: Array<{ name: string; count: number }>;
  languages: Array<{ name: string; count: number }>;
  scopes: Array<{ name: string; count: number }>;
  updatedAt: string;
}

async function buildCatalog() {
  log("build-catalog", "Reading data/servers.json...");
  const servers = await readJson<MCPServer[]>(SERVERS_PATH);

  if (!servers || !Array.isArray(servers)) {
    console.error("❌ data/servers.json not found or invalid");
    process.exit(1);
  }

  log("build-catalog", `Processing ${servers.length} servers...`);

  const categoryCounts = new Map<string, number>();
  const languageCounts = new Map<string, number>();
  const scopeCounts = new Map<string, number>();
  let withInstallCount = 0;
  let withGithubCount = 0;

  const catalogItems: WebServerItem[] = [];

  for (const s of servers) {
    categoryCounts.set(s.category, (categoryCounts.get(s.category) ?? 0) + 1);
    languageCounts.set(s.language, (languageCounts.get(s.language) ?? 0) + 1);
    scopeCounts.set(s.scope, (scopeCounts.get(s.scope) ?? 0) + 1);

    if (s.install?.installCommand) withInstallCount++;
    if (s.githubUrl) withGithubCount++;

    const envs =
      s.envVars && s.envVars.length > 0
        ? s.envVars.map((e) => ({
            name: e.name,
            required: !!e.required,
            secret: !!e.isSecret,
          }))
        : null;

    catalogItems.push({
      id: s.id,
      name: s.name,
      desc: s.description || "",
      cat: s.category,
      lang: s.language || "unknown",
      scope: s.scope || "unknown",
      off: !!s.isOfficial,
      gh: s.githubUrl,
      web: s.websiteUrl,
      trans: s.transport || "unknown",
      cmd: s.install?.installCommand ?? null,
      pkg: s.install?.packageName ?? null,
      pkgType: s.install?.type ?? null,
      remoteUrl: s.install?.remoteUrl ?? null,
      envs,
      stars: s.metrics?.githubStars ?? null,
      dl: s.metrics?.npmWeeklyDownloads ?? null,
      lic: s.license ?? null,
      srcs: s.sources || [],
      updatedAt: s.metrics?.lastCommitAt ? s.metrics.lastCommitAt.split('T')[0] : null,
    });
  }

  // Sort: Official first, then highest downloads/stars, then name
  catalogItems.sort((a, b) => {
    if (a.off !== b.off) return a.off ? -1 : 1;
    const scoreA = (a.dl || 0) + (a.stars || 0) * 10;
    const scoreB = (b.dl || 0) + (b.stars || 0) * 10;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });

  // Top 300 featured servers for instant first render
  const featuredItems = catalogItems.slice(0, 300);

  const stats: CatalogStats = {
    total: catalogItems.length,
    withInstall: withInstallCount,
    withGithub: withGithubCount,
    categories: [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count })),
    languages: [...languageCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count })),
    scopes: [...scopeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count })),
    updatedAt: new Date().toISOString(),
  };

  log("build-catalog", "Writing output files to public/data/...");
  await writeJson(resolve(PUBLIC_DATA_DIR, "stats.json"), stats);
  await writeJson(resolve(PUBLIC_DATA_DIR, "featured.json"), featuredItems);
  await writeJson(resolve(PUBLIC_DATA_DIR, "catalog.json"), catalogItems);

  log(
    "build-catalog",
    `✅ Successfully built catalog: ${catalogItems.length} items (featured: ${featuredItems.length})`
  );
}

buildCatalog().catch((err) => {
  console.error("❌ Build catalog failed:", err);
  process.exit(1);
});
