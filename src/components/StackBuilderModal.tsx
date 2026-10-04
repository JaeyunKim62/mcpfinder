import React, { useState } from 'react';
import { X, Layers, Copy, Check, Download, Trash2, Terminal, Sparkles } from 'lucide-react';
import { ServerItem, SupportedClient } from '../types';
import { generateMergedStackConfig } from '../utils/configGenerator';
import { Locale, translations, getCategoryLabel } from '../i18n';

interface StackBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  stackServers: ServerItem[];
  onRemoveFromStack: (serverId: string) => void;
  onClearStack: () => void;
  locale: Locale;
}

export const StackBuilderModal: React.FC<StackBuilderModalProps> = ({
  isOpen,
  onClose,
  stackServers,
  onRemoveFromStack,
  onClearStack,
  locale,
}) => {
  if (!isOpen) return null;

  const t = translations[locale];
  const [activeClient, setActiveClient] = useState<SupportedClient>('claude');
  const [copied, setCopied] = useState(false);

  const config = generateMergedStackConfig(stackServers, activeClient);

  const handleCopy = () => {
    navigator.clipboard.writeText(config.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (activeClient === 'claude_code') return;
    const blob = new Blob([config.code], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clientTabs: Array<{ id: SupportedClient; label: string }> = [
    { id: 'claude', label: 'Claude Desktop' },
    { id: 'cursor', label: 'Cursor IDE' },
    { id: 'windsurf', label: 'Windsurf' },
    { id: 'zed', label: 'Zed Editor' },
    { id: 'claude_code', label: 'Claude Code CLI' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t.stackModalTitle}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {stackServers.length} {t.serversSelected}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.stackHint}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stackServers.length > 0 && (
              <button
                onClick={onClearStack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.clearAll}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {stackServers.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t.emptyStackTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {t.emptyStackDesc}
              </p>
            </div>
          ) : (
            <>
              {/* Selected Server Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {t.serversInStack}
                </label>
                <div className="flex flex-wrap gap-2">
                  {stackServers.map((s) => (
                    <div
                      key={s.id}
                      className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 shadow-sm"
                    >
                      <span className="font-medium truncate max-w-[200px]">{s.name}</span>
                      <span className="text-[10px] text-slate-400">({getCategoryLabel(s.cat, locale)})</span>
                      <button
                        onClick={() => onRemoveFromStack(s.id)}
                        className="p-0.5 text-slate-400 hover:text-rose-500 rounded transition-colors"
                        title={t.clearAll}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Selection Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {t.targetClient}
                </label>
                <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  {clientTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveClient(tab.id)}
                      className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                        activeClient === tab.id
                          ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Merged Config Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    Merged {config.filename}
                  </span>
                  <span className="text-slate-400 text-[11px] truncate max-w-sm" title={config.locationHint}>
                    📍 {config.locationHint}
                  </span>
                </div>

                <div className="relative group rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-100 font-mono text-xs overflow-hidden shadow-inner">
                  <pre className="overflow-x-auto whitespace-pre leading-relaxed select-all max-h-[300px]">
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
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {stackServers.length > 0 && (
          <div className="p-4 px-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              {t.stackHint}
            </span>
            <div className="flex items-center gap-2">
              {activeClient !== 'claude_code' && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t.downloadStack}
                </button>
              )}
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t.copiedClipboard : t.copyStack}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
