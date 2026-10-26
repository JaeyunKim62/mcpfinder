/**
 * Shared utilities for data collection scripts
 */

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

/** Fetch JSON with retry */
export async function fetchJson<T>(
  url: string,
  options: {
    retries?: number;
    delayMs?: number;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { retries = 3, delayMs = 1000, headers = {} } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...headers,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText} for ${url}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(
        `  ⚠ Attempt ${attempt}/${retries} failed for ${url}: ${err}`
      );
      await sleep(delayMs * attempt);
    }
  }

  throw new Error("unreachable");
}

/** Fetch text with retry */
export async function fetchText(
  url: string,
  options: { retries?: number; delayMs?: number } = {}
): Promise<string> {
  const { retries = 3, delayMs = 1000 } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText} for ${url}`);
      }
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(
        `  ⚠ Attempt ${attempt}/${retries} failed for ${url}: ${err}`
      );
      await sleep(delayMs * attempt);
    }
  }

  throw new Error("unreachable");
}

/** Sleep for ms */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Write JSON to file, creating directories if needed */
export async function writeJson(path: string, data: unknown, space: number = 2): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, space), "utf-8");
  console.log(`  ✓ Wrote ${path}`);
}

/** Read JSON from file, return null if not found */
export async function readJson<T>(path: string): Promise<T | null> {
  try {
    const text = await readFile(path, "utf-8");
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Log with timestamp */
export function log(source: string, message: string): void {
  const time = new Date().toISOString().slice(11, 19);
  console.log(`[${time}] [${source}] ${message}`);
}

/** Rate-limited batch executor */
export async function batchExecute<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  options: { concurrency?: number; delayMs?: number } = {}
): Promise<R[]> {
  const { concurrency = 5, delayMs = 200 } = options;
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fn));

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    }

    if (i + concurrency < items.length) {
      await sleep(delayMs);
    }
  }

  return results;
}

/** Project root data directory */
export const DATA_DIR = new URL("../data", import.meta.url).pathname.replace(
  /^\//,
  ""
);
export const RAW_DIR = `${DATA_DIR}/raw`;
