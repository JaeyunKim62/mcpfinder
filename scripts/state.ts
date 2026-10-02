/**
 * Sync state — tracks last sync timestamps for incremental updates
 */

import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { readJson, writeJson } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const STATE_PATH = resolve(PROJECT_ROOT, "data/sync-state.json");

export interface SyncState {
  /** ISO timestamp of last successful awesome-list sync */
  lastAwesomeListSync: string | null;
  /** ISO timestamp of last successful registry sync */
  lastRegistrySync: string | null;
  /** ISO timestamp of last successful npm sync */
  lastNpmSync: string | null;
  /** ISO timestamp of last successful GitHub enrichment */
  lastGithubEnrich: string | null;
  /** Total server count after last merge */
  lastServerCount: number;
  /** History of sync runs */
  history: SyncRun[];
}

export interface SyncRun {
  timestamp: string;
  sources: {
    awesomeList: number;
    registry: number;
    npm: number;
  };
  totalAfterMerge: number;
  newServers: number;
  updatedServers: number;
  durationSeconds: number;
}

const DEFAULT_STATE: SyncState = {
  lastAwesomeListSync: null,
  lastRegistrySync: null,
  lastNpmSync: null,
  lastGithubEnrich: null,
  lastServerCount: 0,
  history: [],
};

export async function loadState(): Promise<SyncState> {
  const state = await readJson<SyncState>(STATE_PATH);
  return state ?? { ...DEFAULT_STATE };
}

export async function saveState(state: SyncState): Promise<void> {
  // Keep only last 30 history entries
  if (state.history.length > 30) {
    state.history = state.history.slice(-30);
  }
  await writeJson(STATE_PATH, state);
}
