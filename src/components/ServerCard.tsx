import React, { useState } from 'react';
import { Sparkles, Terminal, Copy, Check, Layers, ExternalLink, Cloud, Laptop } from 'lucide-react';
import { ServerItem } from '../types';
import { Locale, translations, getCategoryLabel } from '../i18n';

interface ServerCardProps {
  server: ServerItem;
  isInStack: boolean;
  onToggleStack: (server: ServerItem) => void;
  onConfigure: (server: ServerItem) => void;
  locale: Locale;
}

export const ServerCard: React.FC<ServerCardProps> = ({
  server,
  isInStack,
  onToggleStack,
  onConfigure,
  locale,
}) => {
  const [copied, setCopied] = useState(false);
  const t = translations[locale];

  const handleCopyCmd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!server.cmd) return;
    navigator.clipboard.writeText(server.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageBadge = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'typescript':
      case 'javascript':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">TypeScript</span>;
      case 'python':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">Python</span>;
      case 'go':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900/50">Go</span>;
      case 'rust':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50">Rust</span>;
      default:
        return null;
    }
  };

  const categoryLabel = getCategoryLabel(server.cat, locale);

  return (
    <div
      onClick={() => onConfigure(server)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-brand-400 dark:hover:border-brand-600 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Header row: Category & Meta badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              {categoryLabel}
            </span>
            {getLanguageBadge(server.lang)}
            {server.scope === 'cloud' && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
                <Cloud className="w-2.5 h-2.5" /> {t.remote}
              </span>
            )}
            {server.scope === 'local' && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <Laptop className="w-2.5 h-2.5" /> {t.local}
              </span>
            )}
          </div>

          {server.off && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3 h-3" /> {t.official}
            </span>
          )}
        </div>

        {/* Server Name & GitHub link */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
            {server.name}
          </h3>
          {server.gh && (
            <a
              href={server.gh}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Open GitHub Repository"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {server.desc || t.noDesc}
        </p>
      </div>

      {/* Footer & Actions */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        {/* Install Command Snippet (if available) */}
        {server.cmd ? (
          <div
            onClick={handleCopyCmd}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:border-brand-400 dark:hover:border-brand-600 transition-colors group/cmd"
            title="Click to copy install command"
          >
            <span className="truncate pr-2 select-all">{server.cmd}</span>
            <button className="shrink-0 text-slate-400 group-hover/cmd:text-brand-600 dark:group-hover/cmd:text-brand-400">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
            {server.scope === 'cloud' ? t.remoteConfigNotice : t.manualInstallNotice}
          </div>
        )}

        {/* Buttons: Configure & Add to Stack */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfigure(server);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            {t.configure}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStack(server);
            }}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              isInStack
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
            title={isInStack ? 'Remove from Stack' : 'Add to Stack'}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isInStack ? t.inStack : t.addStack}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
