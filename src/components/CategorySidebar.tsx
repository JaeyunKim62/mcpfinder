import React from 'react';
import { Locale, translations, getCategoryLabel, ESSENTIALS } from '../i18n';
import { 
  FolderTree, 
  Code2, 
  Search, 
  Bot, 
  Database, 
  BrainCircuit, 
  Coins, 
  ShieldCheck, 
  MessageSquare, 
  HardDrive, 
  Globe, 
  Cloud, 
  Briefcase, 
  Sparkles, 
  Activity, 
  Share2, 
  MapPin, 
  Wrench,
  Star
} from 'lucide-react';

interface CategorySidebarProps {
  categories: Array<{ name: string; count: number }>;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  totalServers: number;
  essentialsCount: number;
  locale: Locale;
}

// Icon mapper for categories
const getCategoryIcon = (category: string) => {
  switch (category) {
    case ESSENTIALS:
      return <Star className="w-4 h-4 text-amber-400" />;
    case 'Developer Tools':
      return <Code2 className="w-4 h-4 text-blue-500" />;
    case 'Search & Data Extraction':
      return <Search className="w-4 h-4 text-emerald-500" />;
    case 'Coding Agents':
      return <Bot className="w-4 h-4 text-purple-500" />;
    case 'Databases':
      return <Database className="w-4 h-4 text-amber-500" />;
    case 'Knowledge & Memory':
      return <BrainCircuit className="w-4 h-4 text-pink-500" />;
    case 'Finance & Fintech':
      return <Coins className="w-4 h-4 text-yellow-500" />;
    case 'Security':
      return <ShieldCheck className="w-4 h-4 text-red-500" />;
    case 'Communication':
      return <MessageSquare className="w-4 h-4 text-sky-500" />;
    case 'File Systems':
      return <HardDrive className="w-4 h-4 text-teal-500" />;
    case 'Browser Automation':
      return <Globe className="w-4 h-4 text-indigo-500" />;
    case 'Cloud Platforms':
      return <Cloud className="w-4 h-4 text-cyan-500" />;
    case 'Workplace & Productivity':
      return <Briefcase className="w-4 h-4 text-orange-500" />;
    case 'Multimedia Process':
      return <Sparkles className="w-4 h-4 text-violet-500" />;
    case 'Monitoring':
      return <Activity className="w-4 h-4 text-rose-500" />;
    case 'Social Media':
      return <Share2 className="w-4 h-4 text-blue-400" />;
    case 'Location Services':
      return <MapPin className="w-4 h-4 text-emerald-600" />;
    default:
      return <Wrench className="w-4 h-4 text-slate-400" />;
  }
};

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalServers,
  essentialsCount,
  locale,
}) => {
  const t = translations[locale];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          <FolderTree className="w-4 h-4 text-brand-500" />
          <span>{locale === 'ko' ? '카테고리별 분류' : 'Categories'}</span>
        </div>

        <nav className="space-y-0.5 text-xs max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {/* All category button */}
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
              !selectedCategory
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <FolderTree className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t.allCategories}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {totalServers.toLocaleString()}
            </span>
          </button>

          {/* Individual Category items */}
          {[...(essentialsCount ? [{ name: ESSENTIALS, count: essentialsCount }] : []), ...categories].map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const label = getCategoryLabel(cat.name, locale);

            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="shrink-0">{getCategoryIcon(cat.name)}</span>
                  <span className="truncate">{label}</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {cat.count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
