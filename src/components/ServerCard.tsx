import React, { useState } from 'react';
import { Sparkles, Terminal, Copy, Check, ExternalLink, Cloud, Laptop, Globe2, Calendar } from 'lucide-react';
import { ServerItem } from '../types';
import { Locale, translations, getCategoryLabel } from '../i18n';
import { getLocalizedDescription, getStructuredDescription } from '../i18n/translator';

interface ServerCardProps {
  server: ServerItem;
  onConfigure: (server: ServerItem) => void;
  locale: Locale;
}

export const ServerCard: React.FC<ServerCardProps> = ({
  server,
  onConfigure,
  locale,
}) => {
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
  const structured = getStructuredDescription(server.name, server.desc, locale, server.cat, server.id);
  const hasTranslationDiff = locale === 'ko' && server.desc && structured.summary !== server.desc;

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
            {server.updatedAt && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                title={`${t.updatedAt}: ${server.updatedAt}`}
              >
                <Calendar className="w-2.5 h-2.5 text-slate-400" />
                {server.updatedAt}
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
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
            {server.name}
          </h3>
          {server.gh && (
            <a
              href={server.gh}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Structured Description: 📌 Summary + ✔ Feature Bullets */}
        <div className="mb-3 space-y-2">
          {showOriginal ? (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
              {server.desc || t.noDesc}
            </p>
          ) : (
            <>
              {/* 📌 한 줄 핵심 정의 */}
              <div className="flex items-start gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className="text-brand-500 shrink-0 mt-0.5 text-xs">📌</span>
                <span className="leading-snug line-clamp-2">{structured.summary}</span>
              </div>

              {/* ✔ 핵심 기능 불렛 목록 */}
              {structured.bullets.length > 0 && (
                <ul className="space-y-1 pl-1 pt-0.5">
                  {(isExpanded ? structured.bullets : structured.bullets.slice(0, 3)).map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-tight"
                    >
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold shrink-0 text-[10px] mt-0.5">
                        ✔
                      </span>
                      <span className={isExpanded ? '' : 'line-clamp-1'}>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <div className="flex items-center gap-3 pt-1 flex-wrap">
            {structured.bullets.length > 3 && !showOriginal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="inline-flex items-center text-[10px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                {isExpanded ? (locale === 'ko' ? '기능 접기 ↑' : 'Show less ↑') : (locale === 'ko' ? `기능 ${structured.bullets.length - 3}개 더보기 ↓` : 'More features ↓')}
              </button>
            )}

            {/* Language toggle for description if Korean mode */}
            {hasTranslationDiff && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOriginal((prev) => !prev);
                }}
                className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Globe2 className="w-2.5 h-2.5" />
                <span>{showOriginal ? (locale === 'ko' ? '구조화 요약 보기' : 'Structured View') : (locale === 'ko' ? '영문 원문 보기' : 'Original Text')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        {/* Quick Install Command */}
        {server.cmd ? (
          <div
            onClick={handleCopyCmd}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:border-brand-400 dark:hover:border-brand-600 transition-colors group/cmd"
            title="클릭하여 설치 명령 복사"
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

        {/* Action Button: Simple Configure / JSON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfigure(server);
          }}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 transition-all"
        >
          <Terminal className="w-3.5 h-3.5" />
          {locale === 'ko' ? '설정 코드 (mcp.json) 보기' : 'View Config (mcp.json)'}
        </button>
      </div>
    </div>
  );
};
