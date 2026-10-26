import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CategorySidebar } from './components/CategorySidebar';
import { FilterBar } from './components/FilterBar';
import { ServerCard } from './components/ServerCard';
import { ServerTable } from './components/ServerTable';
import { ConfigModal } from './components/ConfigModal';
import { ServerItem, CatalogStats, FilterState } from './types';
import { Locale, translations, getCategoryLabel, ESSENTIALS } from './i18n';
import { getKnownKoDescription } from './i18n/translator';
import { searchServers } from './utils/search';
import { resolveNaturalLanguageIntent } from './utils/aiMatcher';
import { ChevronLeft, ChevronRight, Terminal, RefreshCw, FolderOpen, Sparkles } from 'lucide-react';

const ITEMS_PER_PAGE = 30;
// Korean category label + curated Korean description, so Korean queries match without translating 34k descriptions
const koSearchText = (s: ServerItem) => `${getCategoryLabel(s.cat, 'ko')} ${getKnownKoDescription(s.id, s.name) ?? ''}`;
const RECENT_CUTOFF = new Date(Date.now() - 180 * 864e5).toISOString().slice(0, 10);

export const App: React.FC = () => {
  // Locale state
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('mcp_locale');
    if (saved === 'ko' || saved === 'en') return saved;
    return 'ko';
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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
    recentOnly: false,
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
        // Build the search cache while idle so the first keystroke doesn't pay for it (~200ms)
        const warm = () => searchServers(data, 'warmup', koSearchText);
        if ('requestIdleCallback' in window) requestIdleCallback(warm);
        else setTimeout(warm, 500);
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

  // Search runs once typing pauses; the input itself updates immediately
  const [deferredQuery, setDeferredQuery] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDeferredQuery(filters.query), 150);
    return () => clearTimeout(id);
  }, [filters.query]);
  const hasQuery = deferredQuery.trim() !== '';

  // AI Intent Matcher (shows an explanation card and contributes extra keywords)
  const aiRecommendation = useMemo(() => {
    return resolveNaturalLanguageIntent(deferredQuery);
  }, [deferredQuery]);

  // Non-search filters
  const { category, language, scope, officialOnly, installOnly, recentOnly, sortBy } = filters;
  const baseServers = useMemo(
    () =>
      servers.filter(
        (server) =>
          (!category || (category === ESSENTIALS ? !!server.top : server.cat === category)) &&
          (!language || server.lang.toLowerCase() === language.toLowerCase()) &&
          (!scope || server.scope === scope) &&
          (!officialOnly || server.off) &&
          (!installOnly || !!server.cmd) &&
          // Recent only (updated within the last 180 days)
          (!recentOnly || (!!server.updatedAt && server.updatedAt >= RECENT_CUTOFF))
      ),
    [servers, category, language, scope, officialOnly, installOnly, recentOnly]
  );

  // Search: ranked by relevance, popularity breaks ties
  const filteredServers = useMemo(() => {
    if (!hasQuery) return baseServers;
    const q = [deferredQuery, ...(aiRecommendation?.suggestedKeywords ?? [])].join(' ');
    return searchServers(baseServers, q, koSearchText);
  }, [baseServers, hasQuery, deferredQuery, aiRecommendation]);

  // Sorting (with a query, "popularity" keeps the relevance order)
  const sortedServers = useMemo(() => {
    const list = [...filteredServers];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      case 'downloads':
        return list.sort((a, b) => (b.dl || 0) - (a.dl || 0));
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'popularity':
      default:
        if (hasQuery) return list;
        return list.sort((a, b) => {
          if (!!a.top !== !!b.top) return a.top ? -1 : 1;
          if (a.off !== b.off) return a.off ? -1 : 1;
          const scoreA = (a.dl || 0) + (a.stars || 0) * 10;
          const scoreB = (b.dl || 0) + (b.stars || 0) * 10;
          return scoreB - scoreA;
        });
    }
  }, [filteredServers, sortBy, hasQuery]);

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
            essentialsCount={stats?.essentials ?? 0}
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

            {/* AI Natural Language Intent Recommendation Banner */}
            {aiRecommendation && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-purple-500/10 border border-brand-500/25 space-y-2 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-500/30">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{locale === 'ko' ? '🤖 AI 맞춤 도구 추천' : '🤖 AI Smart Recommendation'}:</span>
                      <span className="text-brand-600 dark:text-brand-400">{aiRecommendation.intentTitle}</span>
                    </h3>
                  </div>

                  {aiRecommendation.suggestedKeywords.length > 0 && (
                    <button
                      onClick={() => handleFilterChange({ query: aiRecommendation.suggestedKeywords.join(' ') })}
                      className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline shrink-0"
                    >
                      {locale === 'ko' ? '키워드로 필터링' : 'Filter by keywords'} ({aiRecommendation.suggestedKeywords.join(', ')})
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {locale === 'ko' ? aiRecommendation.explanationKo : aiRecommendation.explanationEn}
                </p>
              </div>
            )}

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
                      recentOnly: false,
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
