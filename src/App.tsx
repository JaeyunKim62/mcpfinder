import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CategorySidebar } from './components/CategorySidebar';
import { FilterBar } from './components/FilterBar';
import { ServerCard } from './components/ServerCard';
import { ServerTable } from './components/ServerTable';
import { ConfigModal } from './components/ConfigModal';
import { ServerItem, CatalogStats, FilterState } from './types';
import { Locale, translations, getCategoryLabel } from './i18n';
import { getLocalizedDescription } from './i18n/translator';
import { ChevronLeft, ChevronRight, Terminal, RefreshCw, FolderOpen } from 'lucide-react';

const ITEMS_PER_PAGE = 30;

export const App: React.FC = () => {
  // Locale state
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('mcp_locale');
    if (saved === 'ko' || saved === 'en') return saved;
    return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en';
  });

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('mcp_locale', newLocale);
  };

  const t = translations[locale];

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

  // Modal
  const [selectedServer, setSelectedServer] = useState<ServerItem | null>(null);

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

  const handleSelectCategory = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat }));
    setPage(1);
  };

  // Filter & Search Engine
  const filteredServers = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    return servers.filter((server) => {
      // Query filter
      if (q) {
        const matchesName = server.name.toLowerCase().includes(q);
        const matchesDesc = server.desc.toLowerCase().includes(q);
        const koreanDesc = getLocalizedDescription(server.name, server.desc, 'ko').toLowerCase();
        const matchesKoDesc = koreanDesc.includes(q);
        const catTranslated = getCategoryLabel(server.cat, locale).toLowerCase();
        const matchesCat = server.cat.toLowerCase().includes(q) || catTranslated.includes(q);
        const matchesCmd = server.cmd?.toLowerCase().includes(q);
        const matchesPkg = server.pkg?.toLowerCase().includes(q);

        if (!matchesName && !matchesDesc && !matchesKoDesc && !matchesCat && !matchesCmd && !matchesPkg) {
          return false;
        }
      }

      // Category filter
      if (filters.category && server.cat !== filters.category) {
        return false;
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
  }, [servers, filters, locale]);

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

  const activeCategoryTitle = filters.category
    ? getCategoryLabel(filters.category, locale)
    : (locale === 'ko' ? '전체 MCP 서버' : 'All MCP Servers');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header
        stats={stats}
        searchQuery={filters.query}
        onSearchChange={(q) => handleFilterChange({ query: q })}
        isDark={isDark}
        onToggleDark={() => setIsDark((prev) => !prev)}
        locale={locale}
        onLocaleChange={handleLocaleChange}
      />

      {/* Main Directory Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Category Navigation Sidebar */}
          <CategorySidebar
            categories={stats?.categories || []}
            selectedCategory={filters.category}
            onSelectCategory={handleSelectCategory}
            totalServers={stats?.total || 34269}
            locale={locale}
          />

          {/* Right: Server Listings & Filters */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* Active Category Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-brand-500" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {activeCategoryTitle}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {sortedServers.length.toLocaleString()}{locale === 'ko' ? '개' : ''}
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalFilteredCount={sortedServers.length}
              locale={locale}
            />

            {/* Background Full Catalog Loading Indicator */}
            {!isFullCatalogLoaded && (
              <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 p-3 rounded-2xl animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>{t.backgroundLoading}</span>
              </div>
            )}

            {/* Server Listings: Grid vs Table */}
            {paginatedServers.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedServers.map((server) => (
                    <ServerCard
                      key={server.id}
                      server={server}
                      onConfigure={setSelectedServer}
                      locale={locale}
                    />
                  ))}
                </div>
              ) : (
                <ServerTable
                  servers={paginatedServers}
                  onConfigure={setSelectedServer}
                  locale={locale}
                />
              )
            ) : (
              <div className="text-center py-20 space-y-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Terminal className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t.noMatchTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {t.noMatchDesc}
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
                  {t.resetFilters}
                </button>
              </div>
            )}

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800/80 pt-6 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {t.showingPage} <strong className="text-slate-900 dark:text-slate-100">{page}</strong> {t.of}{' '}
                  <strong className="text-slate-900 dark:text-slate-100">{totalPages.toLocaleString()}</strong> ({sortedServers.length.toLocaleString()} {t.total})
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
                    {t.previous}
                  </button>

                  <button
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {t.next}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>{t.footerSyncText}</p>
          <div className="flex items-center gap-4">
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {t.protocolDocs}
            </a>
            <a
              href="https://github.com/modelcontextprotocol/servers"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {t.referenceServers}
            </a>
            <a
              href="https://registry.modelcontextprotocol.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {t.registryPortal}
            </a>
          </div>
        </div>
      </footer>

      {/* Config Modal */}
      <ConfigModal
        server={selectedServer}
        onClose={() => setSelectedServer(null)}
        locale={locale}
      />
    </div>
  );
};
