/**
 * Main sync orchestrator — runs the full data collection pipeline
 *
 * Usage:
 *   npm run sync                    # Full sync (awesome-list + registry + npm)
 *   GITHUB_TOKEN=xxx npm run sync   # Full sync + GitHub enrichment
 */

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { log, writeJson } from "./utils.js";
import { loadState, saveState } from "./state.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(PROJECT_ROOT, "data");
const RAW_DIR = resolve(DATA_DIR, "raw");

async function main() {
  const startTime = Date.now();
  const isForceFull = process.argv.includes("--full");
  const state = await loadState();

  log("sync", `🚀 Starting MCP server data sync... (${isForceFull ? "FORCED FULL" : "INCREMENTAL"})\n`);
  if (!isForceFull && state.lastRegistrySync) {
    log("sync", `  Last registry sync: ${state.lastRegistrySync}`);
  }

  // ===== Phase 1: Fetch all sources in parallel =====
  log("sync", "Phase 1: Fetching data sources...");
  const phase1Start = Date.now();
  const syncTimestamp = new Date().toISOString();

  // Incremental results are merged into the raw cache; without the cache (fresh CI runner) only a full fetch is complete
  const hasRegistryCache = existsSync(resolve(RAW_DIR, "registry.json"));
  if (!isForceFull && !hasRegistryCache) log("sync", "  No raw registry cache, doing a full registry fetch");
  const registryUpdatedSince = isForceFull || !hasRegistryCache ? undefined : (state.lastRegistrySync || undefined);

  const [awesomeResult, registryResult, npmResult] = await Promise.allSettled([
    (async () => {
      const { fetchAwesomeList } = await import("./sources/awesome-list.js");
      const result = await fetchAwesomeList();
      await writeJson(resolve(RAW_DIR, "awesome-list.json"), result);
      return result;
    })(),
    (async () => {
      const { fetchRegistry } = await import("./sources/registry.js");
      const result = await fetchRegistry(registryUpdatedSince);
      await writeJson(resolve(RAW_DIR, "registry.json"), result);
      return result;
    })(),
    (async () => {
      const { fetchNpmPackages } = await import("./sources/npm-registry.js");
      const result = await fetchNpmPackages();
      await writeJson(resolve(RAW_DIR, "npm.json"), result);
      return result;
    })(),
  ]);

  const phase1Time = ((Date.now() - phase1Start) / 1000).toFixed(1);
  log("sync", `Phase 1 done in ${phase1Time}s\n`);

  // Log results
  if (awesomeResult.status === "fulfilled") {
    log(
      "sync",
      `  ✓ awesome-list: ${awesomeResult.value.entries.length} entries, ${awesomeResult.value.errors.length} errors`
    );
  } else {
    log("sync", `  ✗ awesome-list: ${awesomeResult.reason}`);
  }

  if (registryResult.status === "fulfilled") {
    log(
      "sync",
      `  ✓ registry: ${registryResult.value.entries.length} entries, ${registryResult.value.errors.length} errors`
    );
  } else {
    log("sync", `  ✗ registry: ${registryResult.reason}`);
  }

  if (npmResult.status === "fulfilled") {
    log(
      "sync",
      `  ✓ npm: ${npmResult.value.entries.length} entries, ${npmResult.value.errors.length} errors`
    );
  } else {
    log("sync", `  ✗ npm: ${npmResult.reason}`);
  }

  console.log();

  // ===== Phase 2: Merge all sources =====
  log("sync", "Phase 2: Merging data sources...");
  const phase2Start = Date.now();

  const { mergeAllSources } = await import("./merge.js");
  let servers = await mergeAllSources();

  // Safety net: a failed or partial source fetch must not overwrite the published dataset
  if (!isForceFull && state.lastServerCount && servers.length < state.lastServerCount * 0.9) {
    log("sync", `❌ Merged ${servers.length} servers, down from ${state.lastServerCount}. Not writing; run with --full if this drop is real.`);
    process.exit(1);
  }
  await writeJson(resolve(DATA_DIR, "servers.json"), servers);

  const phase2Time = ((Date.now() - phase2Start) / 1000).toFixed(1);
  log("sync", `Phase 2 done in ${phase2Time}s\n`);

  // ===== Phase 3: GitHub enrichment (optional) =====
  if (process.env.GITHUB_TOKEN) {
    log("sync", "Phase 3: Enriching with GitHub data...");
    const phase3Start = Date.now();

    const { enrichWithGitHub } = await import("./sources/github.js");
    servers = await enrichWithGitHub(servers);
    await writeJson(resolve(DATA_DIR, "servers.json"), servers);

    const phase3Time = ((Date.now() - phase3Start) / 1000).toFixed(1);
    log("sync", `Phase 3 done in ${phase3Time}s\n`);
  } else {
    log(
      "sync",
      "Phase 3: Skipping GitHub enrichment (set GITHUB_TOKEN to enable)\n"
    );
  }

  // ===== Summary =====
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("═".repeat(60));
  log("sync", `✅ Sync complete in ${totalTime}s`);
  console.log();
  console.log(`  Total servers:  ${servers.length}`);

  // Category breakdown
  const catCounts = new Map<string, number>();
  for (const s of servers) {
    catCounts.set(s.category, (catCounts.get(s.category) ?? 0) + 1);
  }
  const topCats = [...catCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  console.log(`\n  Top categories:`);
  for (const [cat, count] of topCats) {
    console.log(`    ${count.toString().padStart(4)} - ${cat}`);
  }

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  for (const s of servers) {
    for (const src of s.sources) {
      sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
    }
  }
  console.log(`\n  Sources: ${JSON.stringify(sourceCounts)}`);

  // Install info coverage
  const withInstall = servers.filter((s) => s.install !== null).length;
  const withEnvVars = servers.filter((s) => s.envVars.length > 0).length;
  const withStars = servers.filter(
    (s) => s.metrics.githubStars !== null
  ).length;
  console.log(`\n  Data coverage:`);
  console.log(
    `    Install info: ${withInstall}/${servers.length} (${((withInstall / servers.length) * 100).toFixed(0)}%)`
  );
  console.log(
    `    Env vars:     ${withEnvVars}/${servers.length} (${((withEnvVars / servers.length) * 100).toFixed(0)}%)`
  );
  console.log(
    `    GitHub stars: ${withStars}/${servers.length} (${((withStars / servers.length) * 100).toFixed(0)}%)`
  );
  console.log("═".repeat(60));

  // ===== Update & Save Sync State =====
  if (awesomeResult.status === "fulfilled") state.lastAwesomeListSync = syncTimestamp;
  if (registryResult.status === "fulfilled") state.lastRegistrySync = syncTimestamp;
  if (npmResult.status === "fulfilled") state.lastNpmSync = syncTimestamp;
  if (process.env.GITHUB_TOKEN) state.lastGithubEnrich = syncTimestamp;

  const previousCount = state.lastServerCount || 0;
  const newCount = servers.length;
  state.lastServerCount = newCount;

  state.history.push({
    timestamp: syncTimestamp,
    sources: {
      awesomeList: awesomeResult.status === "fulfilled" ? awesomeResult.value.entries.length : 0,
      registry: registryResult.status === "fulfilled" ? registryResult.value.entries.length : 0,
      npm: npmResult.status === "fulfilled" ? npmResult.value.entries.length : 0,
    },
    totalAfterMerge: newCount,
    newServers: Math.max(0, newCount - previousCount),
    updatedServers: Math.min(newCount, previousCount),
    durationSeconds: parseFloat(totalTime),
  });

  await saveState(state);
  log("sync", `💾 Sync state updated in data/sync-state.json`);
}

main().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
