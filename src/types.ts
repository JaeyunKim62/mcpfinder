export interface ServerItem {
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

export type SupportedClient = 'claude' | 'cursor' | 'windsurf' | 'zed' | 'claude_code';

export interface FilterState {
  query: string;
  category: string;
  client: string;
  language: string;
  scope: string;
  officialOnly: boolean;
  installOnly: boolean;
  recentOnly: boolean;
  sortBy: 'popularity' | 'downloads' | 'name' | 'newest';
}
