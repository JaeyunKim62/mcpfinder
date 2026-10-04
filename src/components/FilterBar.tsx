import React from 'react';
import { LayoutGrid, Table, Sparkles, Terminal, Code2, Clock } from 'lucide-react';
import { FilterState } from '../types';
import { Locale, translations } from '../i18n';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFilteredCount: number;
  locale: Locale;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  locale,
}) => {
  const t = translations[locale];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-xs">
      {/* Left: Quick filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Language Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
          <Code2 className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.language}
            onChange={(e) => onFilterChange({ language: e.target.value })}
            className="bg-transparent text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="">{t.allLanguages}</option>
            <option value="typescript">TypeScript / JS</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="csharp">C#</option>
            <option value="java">Java</option>
          </select>
        </div>

        {/* Quick Checkbox: Official Only */}
        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800">
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

        {/* Quick Checkbox: Install Ready Only */}
        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800">
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

        {/* Quick Checkbox: Recently Updated Only */}
        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800">
          <input
            type="checkbox"
            checked={filters.recentOnly}
            onChange={(e) => onFilterChange({ recentOnly: e.target.checked })}
            className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
          />
          <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-500" /> {t.recentOnly}
          </span>
        </label>
      </div>

      {/* Right side: Count, Sort, and View Switcher */}
      <div className="flex items-center gap-3">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          <strong className="text-slate-900 dark:text-slate-100">{totalFilteredCount.toLocaleString()}</strong> {t.serversFound}
        </span>

        {/* Sort Selector */}
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
          className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
        >
          <option value="popularity">{t.sortByPopularity}</option>
          <option value="newest">{t.sortByNewest}</option>
          <option value="downloads">{t.sortByDownloads}</option>
          <option value="name">{t.sortByName}</option>
        </select>

        {/* Grid vs Table View Mode */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
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
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
            title={t.compactTableView}
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
