import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, ExternalLink, Sparkles, KeyRound, Code, Laptop } from 'lucide-react';
import { ServerItem } from '../types';
import { generateClientConfig } from '../utils/configGenerator';
import { Locale, translations, getCategoryLabel } from '../i18n';
import { getLocalizedDescription, getStructuredDescription } from '../i18n/translator';

interface ConfigModalProps {
  server: ServerItem | null;
  onClose: () => void;
  locale: Locale;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ server, onClose, locale }) => {
  if (!server) return null;

  const t = translations[locale];
  const [configFormat, setConfigFormat] = useState<'json' | 'cli'>('json');
  const [copied, setCopied] = useState(false);
  const [envInputs, setEnvInputs] = useState<Record<string, string>>({});

  const handleEnvChange = (name: string, value: string) => {
    setEnvInputs((prev) => ({ ...prev, [name]: value }));
  };

  const clientType = configFormat === 'json' ? 'claude' : 'claude_code';
  const config = generateClientConfig(server, clientType, envInputs);

  const handleCopy = () => {
    navigator.clipboard.writeText(config.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (configFormat === 'cli') return;
    const blob = new Blob([config.code], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcp.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryLabel = getCategoryLabel(server.cat, locale);
  const structured = getStructuredDescription(server.name, server.desc, locale, server.cat, server.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {server.name}
                </h2>
                {server.off && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-2.5 h-2.5" /> {t.official}
                  </span>
                )}
              </div>
              <div className="mt-1 space-y-1.5 max-w-xl">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  <span className="text-brand-500 font-bold mr-1">📌</span>
                  {structured.summary}
                </p>
                {structured.bullets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {structured.bullets.map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40"
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-500" /> {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Format Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'ko' ? '설정 포맷' : 'Format'}
            </span>
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <button
                onClick={() => setConfigFormat('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  configFormat === 'json'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON (Claude / Cursor / Windsurf)</span>
              </button>
              <button
                onClick={() => setConfigFormat('cli')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  configFormat === 'cli'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>CLI (Claude Code)</span>
              </button>
            </div>
          </div>

          {/* Interactive Environment Variables Form (if needed) */}
          {server.envs && server.envs.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
                <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t.requiredEnvVars}</span>
              </div>
              <div className="space-y-2">
                {server.envs.map((env) => (
                  <div key={env.name} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 min-w-[160px]">
                      {env.name} {env.required && <span className="text-rose-500">*</span>}:
                    </span>
                    <input
                      type={env.secret ? 'password' : 'text'}
                      placeholder={`${t.enterVarPlaceholder} ${env.name}...`}
                      value={envInputs[env.name] || ''}
                      onChange={(e) => handleEnvChange(env.name, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Code Snippet */}
          <div className="space-y-2">
            <div className="relative group rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-100 font-mono text-xs overflow-hidden shadow-inner">
              <pre className="overflow-x-auto whitespace-pre leading-relaxed select-all">
                {config.code}
              </pre>

              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-sans font-medium transition-all shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copy}</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {locale === 'ko'
                ? '💡 Claude Desktop의 경우 claude_desktop_config.json, Cursor의 경우 .cursor/mcp.json 파일의 mcpServers 블록에 복사해 넣으시면 됩니다.'
                : '💡 Paste into your claude_desktop_config.json or .cursor/mcp.json under mcpServers.'}
            </p>
          </div>

          {/* Metadata badges and links */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span>{t.category}: <strong className="text-slate-700 dark:text-slate-300">{categoryLabel}</strong></span>
              <span>•</span>
              <span>{t.transport}: <strong className="text-slate-700 dark:text-slate-300 uppercase font-mono">{server.trans}</strong></span>
            </div>

            <div className="flex items-center gap-3">
              {server.gh && (
                <a
                  href={server.gh}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {server.web && (
                <a
                  href={server.web}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {t.website} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-end gap-2">
          {configFormat === 'json' && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              {t.downloadJson}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t.copiedClipboard : t.copyConfig}
          </button>
        </div>
      </div>
    </div>
  );
};
