/**
 * Shared types for MCP Server Directory data pipeline
 */

// ===== Normalized output schema =====

export interface MCPServer {
  /** Normalized unique ID: "owner/repo" from GitHub URL, or registry name */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;

  // Classification
  /** Primary category from awesome-list taxonomy */
  category: string;
  /** Additional tags */
  tags: string[];
  /** Primary programming language */
  language: Language;
  /** Cloud vs Local vs Hybrid */
  scope: Scope;
  /** Supported operating systems */
  osSupport: OS[];
  /** Official implementation flag */
  isOfficial: boolean;

  // Source links
  githubUrl: string | null;
  githubOwner: string | null;
  githubRepo: string | null;
  websiteUrl: string | null;

  // Installation
  transport: Transport;
  install: InstallInfo | null;
  envVars: EnvVar[];

  // Metrics (enriched from GitHub/npm)
  metrics: Metrics;
  license: string | null;

  // Provenance
  /** Which data sources contributed to this entry */
  sources: DataSource[];
  /** Registry version if from official registry */
  registryVersion: string | null;
  /** Last time this entry was synced */
  lastSyncedAt: string;
}

export type Language =
  | "python"
  | "typescript"
  | "go"
  | "rust"
  | "csharp"
  | "java"
  | "cpp"
  | "ruby"
  | "other"
  | "unknown";

export type Scope = "cloud" | "local" | "hybrid" | "unknown";

export type OS = "macos" | "windows" | "linux";

export type Transport = "stdio" | "sse" | "streamable_http" | "unknown";

export type DataSource = "awesome-list" | "registry" | "npm" | "github";

export interface InstallInfo {
  type: "npm" | "pypi" | "docker" | "binary" | "remote";
  packageName: string | null;
  installCommand: string | null;
  remoteUrl: string | null;
}

export interface EnvVar {
  name: string;
  description: string;
  required: boolean;
  isSecret: boolean;
}

export interface Metrics {
  githubStars: number | null;
  githubForks: number | null;
  npmWeeklyDownloads: number | null;
  lastCommitAt: string | null;
  createdAt: string | null;
  openIssues: number | null;
  isArchived: boolean;
}

// ===== Raw source types =====

/** Raw entry parsed from awesome-mcp-servers README */
export interface AwesomeListEntry {
  name: string;
  githubUrl: string;
  description: string;
  category: string;
  language: Language;
  scope: Scope;
  osSupport: OS[];
  isOfficial: boolean;
}

/** Raw entry from official MCP registry API */
export interface RegistryEntry {
  name: string;
  title: string | null;
  description: string;
  version: string;
  status: "active" | "deprecated" | "deleted";
  isLatest: boolean;
  publishedAt: string;
  updatedAt: string;
  repositoryUrl: string | null;
  repositorySource: string | null;
  websiteUrl: string | null;
  remotes: RegistryRemote[];
  packages: RegistryPackage[];
  icons: RegistryIcon[];
}

export interface RegistryRemote {
  type: string;
  url: string;
}

export interface RegistryPackage {
  registryType: string;
  identifier: string;
  version?: string;
  transport: { type: string };
  environmentVariables?: Array<{
    name: string;
    description?: string;
    isRequired?: boolean;
    isSecret?: boolean;
  }>;
  runtimeHint?: string;
}

export interface RegistryIcon {
  src: string;
  mimeType?: string;
  sizes?: string[];
}

/** Raw entry from npm registry search */
export interface NpmEntry {
  packageName: string;
  version: string;
  description: string;
  keywords: string[];
  license: string | null;
  repositoryUrl: string | null;
  homepageUrl: string | null;
  npmUrl: string;
  weeklyDownloads: number;
  monthlyDownloads: number;
  score: number;
  maintainers: string[];
  lastUpdated: string;
}

/** Raw repo from GitHub topic search or data/manual.json */
export interface GitHubRepoEntry {
  fullName: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  license: string | null;
  homepage: string | null;
  pushedAt: string;
  createdAt: string;
  archived: boolean;
  openIssues: number;
  /** Install command override, only from data/manual.json */
  install?: string;
}

// ===== Utility types =====

/** Result of a sync operation */
export interface SyncResult<T> {
  source: DataSource;
  entries: T[];
  fetchedAt: string;
  errors: string[];
}

/** GitHub repo key for deduplication */
export function githubKey(url: string): string | null {
  const match = url.match(
    /github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)/
  );
  if (!match) return null;
  return `${match[1].toLowerCase()}/${match[2].toLowerCase().replace(/\.git$/, "")}`;
}

/** Create empty metrics */
export function emptyMetrics(): Metrics {
  return {
    githubStars: null,
    githubForks: null,
    npmWeeklyDownloads: null,
    lastCommitAt: null,
    createdAt: null,
    openIssues: null,
    isArchived: false,
  };
}
