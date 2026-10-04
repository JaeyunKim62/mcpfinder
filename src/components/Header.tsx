import React from 'react';
import { Search, Moon, Sun, Database } from 'lucide-react';
import { CatalogStats } from '../types';
import { Locale, translations } from '../i18n';

interface HeaderProps {
  stats: CatalogStats | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  locale: Locale;
  onLocaleChange: (loc: Locale) => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  searchQuery,
  onSearchChange,
  isDark,
  onToggleDark,
  locale,
  onLocaleChange,
}) => {
  const t = translations[locale];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-600 dark:from-white dark:via-brand-300 dark:to-indigo-400 bg-clip-text text-transparent">
                  {t.title}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  34K+
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-12 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Utilities */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 text-xs font-semibold">
              <button
                onClick={() => onLocaleChange('ko')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  locale === 'ko'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="한국어"
              >
                KO
              </button>
              <button
                onClick={() => onLocaleChange('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  locale === 'en'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDark}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/modelcontextprotocol/servers"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-all hidden md:flex items-center justify-center"
              title="Official MCP Repo"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Global Statistics ticker */}
        {stats && (
          <div className="py-1.5 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-none">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t.indexedServers} <strong className="text-slate-700 dark:text-slate-200">{stats.total.toLocaleString()}</strong>{t.serversUnit}
              </span>
              <span>•</span>
              <span>
                {t.readyToInstall} <strong className="text-slate-700 dark:text-slate-200">{stats.withInstall.toLocaleString()} ({((stats.withInstall / stats.total) * 100).toFixed(0)}%)</strong>
              </span>
              <span>•</span>
              <span className="hidden sm:inline">
                {t.openSource} <strong className="text-slate-700 dark:text-slate-200">{stats.withGithub.toLocaleString()}</strong>
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-slate-400">
                {t.compatibleWith}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
