import React, { useState } from 'react';
import { Download, AlertCircle, CheckCircle2, Clock, Hash, ChevronLeft, ChevronRight, Bot } from 'lucide-react';
import { QueryResult } from '../../types';

interface QueryResultTableProps {
  result: QueryResult | null;
  onAskAiDebug?: (errorMessage: string) => void;
}

export const QueryResultTable: React.FC<QueryResultTableProps> = ({ result, onAskAiDebug }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  if (!result) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
        <p className="text-sm text-slate-500 dark:text-slate-400">Click <strong>Run Query</strong> to execute your SQL statement and view data output.</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h4 className="font-bold text-sm">Query Execution Failed</h4>
            <p className="text-xs font-mono bg-rose-100 dark:bg-rose-900/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800/80 leading-relaxed text-rose-900 dark:text-rose-200">
              {result.error}
            </p>
            {onAskAiDebug && (
              <button
                onClick={() => onAskAiDebug(result.error!)}
                className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Bot className="w-3.5 h-3.5" /> Ask AI SQL Tutor to Debug This
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { columns, values, rowCount, executionTimeMs } = result;

  const totalPages = Math.ceil(values.length / pageSize) || 1;
  const paginatedRows = values.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportCsv = () => {
    if (!columns.length || !values.length) return;
    const header = columns.join(',');
    const rows = values.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `query_result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJson = () => {
    if (!columns.length || !values.length) return;
    const jsonObj = values.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `query_result_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
      
      {/* Table Header Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Success
          </span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
            <Hash className="w-3.5 h-3.5" /> {rowCount} {rowCount === 1 ? 'row' : 'rows'}
          </span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5" /> {executionTimeMs} ms
          </span>
        </div>

        {/* Export Buttons */}
        {values.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-sky-500" /> Export CSV
            </button>
            <button
              onClick={exportJson}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-indigo-500" /> Export JSON
            </button>
          </div>
        )}
      </div>

      {/* Data Table Grid */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold z-10">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center text-slate-400 border-r border-slate-200/60 dark:border-slate-800/60">#</th>
              {columns.map((col, idx) => (
                <th key={idx} className="py-2.5 px-3 border-r border-slate-200/60 dark:border-slate-800/60 last:border-r-0">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-6 text-center text-slate-400">
                  Empty result set (0 rows).
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, rowIdx) => {
                const actualIndex = (currentPage - 1) * pageSize + rowIdx + 1;
                return (
                  <tr key={rowIdx} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 select-none border-r border-slate-100 dark:border-slate-800/60">
                      {actualIndex}
                    </td>
                    {row.map((cell: any, cellIdx: number) => (
                      <td key={cellIdx} className="py-2 px-3 border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 whitespace-nowrap">
                        {cell === null ? (
                          <span className="italic text-slate-400 font-sans">NULL</span>
                        ) : typeof cell === 'boolean' ? (
                          <span className={cell ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                            {cell ? 'TRUE' : 'FALSE'}
                          </span>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages} ({rowCount} total rows)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
