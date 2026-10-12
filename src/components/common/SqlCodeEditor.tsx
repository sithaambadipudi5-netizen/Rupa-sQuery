import React, { useRef, useState } from 'react';
import { Play, RotateCcw, Trash2, Copy, Check, Sparkles, Terminal } from 'lucide-react';

interface SqlCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset?: () => void;
  onClear?: () => void;
  isRunning?: boolean;
  minHeight?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export const SqlCodeEditor: React.FC<SqlCodeEditorProps> = ({
  value,
  onChange,
  onRun,
  onReset,
  onClear,
  isRunning = false,
  minHeight = '220px',
  placeholder = '-- Write your SQL query here...\nSELECT * FROM students;',
  readOnly = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  // Handle Tab key insertion & Ctrl+Enter to Run
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSql = () => {
    let formatted = value
      .replace(/\s+/g, ' ')
      .replace(/\bSELECT\b/gi, 'SELECT\n   ')
      .replace(/\bFROM\b/gi, '\nFROM\n   ')
      .replace(/\bWHERE\b/gi, '\nWHERE\n   ')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY\n   ')
      .replace(/\bHAVING\b/gi, '\nHAVING\n   ')
      .replace(/\bORDER BY\b/gi, '\nORDER BY\n   ')
      .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN ')
      .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN ')
      .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN ')
      .replace(/\bJOIN\b/gi, '\nJOIN ')
      .replace(/\bLIMIT\b/gi, '\nLIMIT ');
    onChange(formatted.trim());
  };

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + (value ? ' ' : '') + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + snippet + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
    }, 0);
  };

  const lineCount = Math.max(value.split('\n').length, 5);

  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-sm transition-all">
      
      {/* Editor Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-slate-300 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className="text-slate-400 font-mono text-[11px] ml-1 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-sky-400" /> SQL Editor
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={formatSql}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1"
            title="Format SQL Query"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" /> Format
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            title="Copy SQL Query"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
              title="Clear Editor"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
              title="Reset Initial Query"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}
        </div>
      </div>

      {/* Code Textarea with Line Numbers */}
      <div className="relative flex font-mono text-sm" style={{ minHeight }}>
        {/* Line Numbers Bar */}
        <div className="select-none py-3 px-2 bg-slate-950/70 border-r border-slate-800/80 text-slate-600 text-right font-mono text-xs w-10 shrink-0 space-y-1">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full h-full p-3 bg-transparent text-sky-100 placeholder-slate-600 font-mono text-sm leading-6 resize-y focus:outline-hidden focus:ring-0 selection:bg-sky-600/30"
          style={{ minHeight }}
        />
      </div>

      {/* Editor Bottom Bar: Helper Chips & Execute Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950/90 border-t border-slate-800/80">
        
        {/* Quick SQL Keyword Chips */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Insert:</span>
          {['SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT'].map((kw) => (
            <button
              key={kw}
              onClick={() => insertSnippet(kw + ' ')}
              className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-mono text-[10px] font-semibold transition-colors"
            >
              {kw}
            </button>
          ))}
        </div>

        {/* Run Query Button */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] text-slate-500 hidden sm:inline font-mono">
            <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Enter</kbd>
          </span>
          <button
            onClick={onRun}
            disabled={isRunning || !value.trim()}
            className={`px-4 py-1.5 rounded-lg font-semibold text-xs text-white shadow-md flex items-center gap-1.5 transition-all transform active:scale-95 ${
              isRunning || !value.trim()
                ? 'bg-slate-700 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 cursor-pointer shadow-emerald-500/20'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-white ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executing...' : 'Run Query'}
          </button>
        </div>
      </div>

    </div>
  );
};
