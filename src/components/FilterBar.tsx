import React from 'react';
import { Filter, LayoutGrid, Table, Check, Sparkles, Terminal, Cloud, Laptop, Code2 } from 'lucide-react';
import { FilterState } from '../types';
import { Locale, translations, getCategoryLabel } from '../i18n';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  categories: Array<{ name: string; count: number }>;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFilteredCount: number;
  locale: Locale;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  categories,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  locale,
}) => {
  const t = translations[locale];

  // Top popular categories for quick filter chips (keys matching canonical categories)
  const quickCategories = [
    'All',
    'Developer Tools',
    'Search & Data Extraction',
    'Coding Agents',
    'Databases',
    'Knowledge & Memory',
    'Finance & Fintech',
    'Security',
    'Communication',
    'File Systems',
    'Browser Automation',
    'Cloud Platforms',
  ];

  return (
    <div className="space-y-4 py-4">
      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {quickCategories.map((catKey) => {
          const isSelected = (catKey === 'All' && !filters.category) || filters.category === catKey;
          const label = catKey === 'All' ? t.allCategories : getCategoryLabel(catKey, locale);

          return (
            <button
              key={catKey}
              onClick={() => onFilterChange({ category: catKey === 'All' ? '' : catKey })}
              className={`shrink-0 px-3 py-1.5 rounded-full font-medium transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Granular Filters & Layout Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Client Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.client}
              onChange={(e) => onFilterChange({ client: e.target.value })}
              className="bg-transparent text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">{t.allClients}</option>
              <option value="claude">Claude Desktop</option>
              <option value="cursor">Cursor IDE</option>
              <option value="windsurf">Windsurf</option>
              <option value="zed">Zed Editor</option>
              <option value="claude_code">Claude Code CLI</option>
            </select>
          </div>

          {/* Scope Filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm">
            <Cloud className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.scope}
              onChange={(e) => onFilterChange({ scope: e.target.value })}
              className="bg-transparent text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">{t.allScopes}</option>
              <option value="local">{t.scopeLocal}</option>
              <option value="cloud">{t.scopeCloud}</option>
              <option value="hybrid">{t.scopeHybrid}</option>
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm">
            <Code2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.language}
              onChange={(e) => onFilterChange({ language: e.target.value })}
              className="bg-transparent text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">{t.allLanguages}</option>
              <option value="typescript">TypeScript / JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="csharp">C#</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Quick Checkbox: Official Only */}
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer select-none shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <input
              type="checkbox"
              checked={filters.officialOnly}
              onChange={(e) => onFilterChange({ officialOnly: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> {t.officialOnly}
            </span>
          </label>

          {/* Quick Checkbox: Install Command Ready */}
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer select-none shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <input
              type="checkbox"
              checked={filters.installOnly}
              onChange={(e) => onFilterChange({ installOnly: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {t.installReadyOnly}
            </span>
          </label>
        </div>

        {/* Right side: Count & View Switcher */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            <strong className="text-slate-900 dark:text-slate-100">{totalFilteredCount.toLocaleString()}</strong> {t.serversFound}
          </span>

          {/* Sort Selector */}
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="popularity">{t.sortByPopularity}</option>
            <option value="downloads">{t.sortByDownloads}</option>
            <option value="name">{t.sortByName}</option>
          </select>

          {/* Grid vs Table View Mode */}
          <div className="flex items-center bg-slate-200/60 dark:bg-slate-800/60 p-0.5 rounded-xl border border-slate-300/40 dark:border-slate-700/40">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title={t.cardGridView}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title={t.compactTableView}
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
