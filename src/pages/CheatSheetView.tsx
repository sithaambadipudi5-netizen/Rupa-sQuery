import React, { useState } from 'react';
import { FileText, Search, Copy, Check, Terminal, AlertTriangle, Play } from 'lucide-react';
import { SQL_CHEAT_SHEET } from '../data/cheatSheet';
import { useApp } from '../context/AppContext';

interface CheatSheetViewProps {
  navigate: (path: string) => void;
}

export const CheatSheetView: React.FC<CheatSheetViewProps> = ({ navigate }) => {
  const { showToast } = useApp();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('success', 'Copied to Clipboard', 'SQL snippet copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = SQL_CHEAT_SHEET.filter((entry) => {
    return (
      entry.title.toLowerCase().includes(search.toLowerCase()) ||
      entry.category.toLowerCase().includes(search.toLowerCase()) ||
      entry.syntax.toLowerCase().includes(search.toLowerCase()) ||
      entry.explanation.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-sky-500" /> SQL Syntax & Concept Cheat Sheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quick-reference syntax blueprints, concrete examples, and common pitfalls to avoid.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search syntax, JOINs, CTE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-900 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {item.category}
              </span>
              <button
                onClick={() => handleCopy(item.example, item.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs flex items-center gap-1"
                title="Copy Example"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.title}</h3>

            {/* Syntax Blueprint */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Syntax Template</span>
              <pre className="p-3 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs overflow-x-auto border border-slate-800">
                {item.syntax}
              </pre>
            </div>

            {/* Practical Example */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Practical Example</span>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
                {item.example}
              </pre>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.explanation}
            </p>

            {item.commonMistake && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Common Pitfall:</strong> {item.commonMistake}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
