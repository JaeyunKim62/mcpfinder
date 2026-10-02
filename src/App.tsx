import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ServerCard } from './components/ServerCard';
import { ServerTable } from './components/ServerTable';
import { ConfigModal } from './components/ConfigModal';
import { StackBuilderModal } from './components/StackBuilderModal';
import { ServerItem, CatalogStats, FilterState } from './types';
import { ChevronLeft, ChevronRight, Layers, Sparkles, Terminal, RefreshCw } from 'lucide-react';

const ITEMS_PER_PAGE = 36;

export const App: React.FC = () => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('mcp_theme') === 'dark' ||
      (!('mcp_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mcp_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mcp_theme', 'light');
    }
  }, [isDark]);

  // Data states
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [isFullCatalogLoaded, setIsFullCatalogLoaded] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    category: '',
    client: '',
    language: '',
    scope: '',
    officialOnly: false,
    installOnly: false,
    sortBy: 'popularity',
  });

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);

  // Modals & Stack
  const [selectedServer, setSelectedServer] = useState<ServerItem | null>(null);
  const [isStackOpen, setIsStackOpen] = useState(false);
  const [stack, setStack] = useState<ServerItem[]>(() => {
    try {
      const saved = localStorage.getItem('mcp_stack');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mcp_stack', JSON.stringify(stack));
  }, [stack]);

  const stackIds = useMemo(() => new Set(stack.map((s) => s.id)), [stack]);

  // 1. Initial Instant Paint: Load stats & featured servers (~200KB)
  useEffect(() => {
    fetch('/data/stats.json')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.warn('Failed loading stats:', err));

    fetch('/data/featured.json')
      .then((res) => res.json())
      .then((data: ServerItem[]) => {
        setServers(data);
      })
      .catch((err) => console.warn('Failed loading featured:', err));

    // 2. Background Load: Full catalog (~22MB)
    fetch('/data/catalog.json')
      .then((res) => res.json())
      .then((data: ServerItem[]) => {
        setServers(data);
        setIsFullCatalogLoaded(true);
      })
      .catch((err) => console.warn('Failed loading full catalog:', err));
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedServer(null);
        setIsStackOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset page when filters change
  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  // Stack management
  const handleToggleStack = (server: ServerItem) => {
    setStack((prev) => {
      if (prev.some((s) => s.id === server.id)) {
        return prev.filter((s) => s.id !== server.id);
      } else {
        return [...prev, server];
      }
    });
  };

  const handleRemoveFromStack = (serverId: string) => {
    setStack((prev) => prev.filter((s) => s.id !== serverId));
  };

  // Filter & Search Engine
  const filteredServers = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    return servers.filter((server) => {
      // Query filter
      if (q) {
        const matchesName = server.name.toLowerCase().includes(q);
        const matchesDesc = server.desc.toLowerCase().includes(q);
        const matchesCat = server.cat.toLowerCase().includes(q);
        const matchesCmd = server.cmd?.toLowerCase().includes(q);
        const matchesPkg = server.pkg?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesCmd && !matchesPkg) {
          return false;
        }
      }

      // Category filter
      if (filters.category && server.cat !== filters.category) {
        return false;
      }

      // Client filter
      if (filters.client) {
        if (filters.client === 'claude_code' && !server.cmd) return false;
        if (filters.client === 'zed' && !server.cmd && server.scope !== 'cloud') return false;
      }

      // Language filter
      if (filters.language && server.lang.toLowerCase() !== filters.language.toLowerCase()) {
        return false;
      }

      // Scope filter
      if (filters.scope && server.scope !== filters.scope) {
        return false;
      }

      // Official only
      if (filters.officialOnly && !server.off) {
        return false;
      }

      // Install only
      if (filters.installOnly && !server.cmd) {
        return false;
      }

      return true;
    });
  }, [servers, filters]);

  // Sorting
  const sortedServers = useMemo(() => {
    const list = [...filteredServers];
    switch (filters.sortBy) {
      case 'downloads':
        return list.sort((a, b) => (b.dl || 0) - (a.dl || 0));
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'popularity':
      default:
        return list.sort((a, b) => {
          if (a.off !== b.off) return a.off ? -1 : 1;
          const scoreA = (a.dl || 0) + (a.stars || 0) * 10;
          const scoreB = (b.dl || 0) + (b.stars || 0) * 10;
          return scoreB - scoreA;
        });
    }
  }, [filteredServers, filters.sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(sortedServers.length / ITEMS_PER_PAGE) || 1;
  const paginatedServers = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedServers.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedServers, page]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header
        stats={stats}
        searchQuery={filters.query}
        onSearchChange={(q) => handleFilterChange({ query: q })}
        stackCount={stack.length}
        onOpenStack={() => setIsStackOpen(true)}
        isDark={isDark}
        onToggleDark={() => setIsDark((prev) => !prev)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Banner (when no active query) */}
        {!filters.query && !filters.category && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-slate-900 text-white p-8 md:p-10 shadow-lg">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-200 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Continuously Updated MCP Catalog
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Discover & Run 34,000+ Tools for Your AI Agents
              </h1>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                Connect Claude Desktop, Cursor, Windsurf, Zed, and Claude Code to databases, web scrapers, developer APIs, and business systems with zero config hassle.
              </p>
            </div>

            {/* Background glowing orb */}
            <div className="absolute right-0 bottom-0 -mr-16 -mb-16 w-80 h-80 rounded-full bg-brand-400/20 blur-3xl pointer-events-none" />
          </div>
        )}

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={stats?.categories || []}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={sortedServers.length}
        />

        {/* Background Full Catalog Loading Indicator */}
        {!isFullCatalogLoaded && (
          <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 p-3 rounded-2xl animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>
              Showing top featured servers. Loading full index of <strong>34,000+ servers</strong> in the background for instant search...
            </span>
          </div>
        )}

        {/* Server Listings: Grid vs Table */}
        {paginatedServers.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedServers.map((server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  isInStack={stackIds.has(server.id)}
                  onToggleStack={handleToggleStack}
                  onConfigure={setSelectedServer}
                />
              ))}
            </div>
          ) : (
            <ServerTable
              servers={paginatedServers}
              stackIds={stackIds}
              onToggleStack={handleToggleStack}
              onConfigure={setSelectedServer}
            />
          )
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
              <Terminal className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              No servers match your criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try adjusting your query, selecting "All Categories", or clearing language and client filters.
            </p>
            <button
              onClick={() =>
                setFilters({
                  query: '',
                  category: '',
                  client: '',
                  language: '',
                  scope: '',
                  officialOnly: false,
                  installOnly: false,
                  sortBy: 'popularity',
                })
              }
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800/80 pt-6 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing Page <strong className="text-slate-900 dark:text-slate-100">{page}</strong> of{' '}
              <strong className="text-slate-900 dark:text-slate-100">{totalPages.toLocaleString()}</strong> ({sortedServers.length.toLocaleString()} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            MCP Index &copy; 2026. Automatically synced every 6 hours from Official MCP Registry, punkpeye/awesome-mcp-servers, and npm.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Protocol Docs
            </a>
            <a
              href="https://github.com/modelcontextprotocol/servers"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Reference Servers
            </a>
            <a
              href="https://registry.modelcontextprotocol.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Registry Portal
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ConfigModal
        server={selectedServer}
        onClose={() => setSelectedServer(null)}
      />

      <StackBuilderModal
        isOpen={isStackOpen}
        onClose={() => setIsStackOpen(false)}
        stackServers={stack}
        onRemoveFromStack={handleRemoveFromStack}
        onClearStack={() => setStack([])}
      />
    </div>
  );
};
