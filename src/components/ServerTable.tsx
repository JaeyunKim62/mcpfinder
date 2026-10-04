import React, { useState } from 'react';
import { Sparkles, Terminal, Copy, Check, Layers, ExternalLink, Cloud, Laptop } from 'lucide-react';
import { ServerItem } from '../types';
import { Locale, translations, getCategoryLabel } from '../i18n';

interface ServerTableProps {
  servers: ServerItem[];
  stackIds: Set<string>;
  onToggleStack: (server: ServerItem) => void;
  onConfigure: (server: ServerItem) => void;
  locale: Locale;
}

export const ServerTable: React.FC<ServerTableProps> = ({
  servers,
  stackIds,
  onToggleStack,
  onConfigure,
  locale,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const t = translations[locale];

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
          <tr>
            <th className="py-3 px-4">{t.colName}</th>
            <th className="py-3 px-4">{t.colCategory}</th>
            <th className="py-3 px-4">{t.colLangScope}</th>
            <th className="py-3 px-4">{t.colCommand}</th>
            <th className="py-3 px-4 text-right">{t.colActions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
          {servers.map((server) => {
            const inStack = stackIds.has(server.id);
            const categoryLabel = getCategoryLabel(server.cat, locale);

            return (
              <tr
                key={server.id}
                onClick={() => onConfigure(server)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                {/* Name & Desc */}
                <td className="py-3 px-4 max-w-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                    <span className="truncate">{server.name}</span>
                    {server.off && (
                      <span className="shrink-0 inline-flex items-center text-[10px] text-amber-500 font-bold" title={t.official}>
                        ★
                      </span>
                    )}
                    {server.gh && (
                      <a
                        href={server.gh}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={t.githubRepo}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {server.desc}
                  </p>
                </td>

                {/* Category */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                    {categoryLabel}
                  </span>
                </td>

                {/* Language / Scope */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="capitalize font-mono text-[11px]">{server.lang}</span>
                    {server.scope === 'cloud' && (
                      <Cloud className="w-3.5 h-3.5 text-indigo-500" title={t.scopeCloud} />
                    )}
                    {server.scope === 'local' && (
                      <Laptop className="w-3.5 h-3.5 text-slate-400" title={t.scopeLocal} />
                    )}
                  </div>
                </td>

                {/* Command */}
                <td className="py-3 px-4 font-mono text-[11px] max-w-sm truncate text-slate-600 dark:text-slate-400">
                  {server.cmd ? (
                    <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                      <span className="truncate">{server.cmd}</span>
                      <button
                        onClick={(e) => handleCopy(server.id, server.cmd!, e)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                        title={t.copy}
                      >
                        {copiedId === server.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">{server.scope === 'cloud' ? t.remoteConfigNotice : t.manualInstallNotice}</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfigure(server);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900 border border-brand-200 dark:border-brand-800 font-medium"
                    >
                      {t.configure}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStack(server);
                      }}
                      className={`p-1 rounded-lg border transition-all ${
                        inStack
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                      title={inStack ? t.inStack : t.addStack}
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
