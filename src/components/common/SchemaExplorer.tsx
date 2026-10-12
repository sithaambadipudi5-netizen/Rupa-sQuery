import React, { useState } from 'react';
import { Database, Key, Link2, Table, ChevronDown, ChevronRight, Eye, RefreshCw, Layers, Sparkles } from 'lucide-react';
import { DatabaseSchema, TableSchema } from '../../types';
import { PRACTICE_DATABASES } from '../../data/practiceDatabases';

interface SchemaExplorerProps {
  activeDatabaseId: string;
  onSelectDatabase: (dbId: string) => void;
  onInsertSql?: (sql: string) => void;
  onResetDatabase?: () => void;
}

export const SchemaExplorer: React.FC<SchemaExplorerProps> = ({
  activeDatabaseId,
  onSelectDatabase,
  onInsertSql,
  onResetDatabase,
}) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [showErModal, setShowErModal] = useState(false);
  const [sampleModalTable, setSampleModalTable] = useState<TableSchema | null>(null);

  const currentDb = PRACTICE_DATABASES.find((db) => db.id === activeDatabaseId) || PRACTICE_DATABASES[0];

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs flex flex-col h-full">
      
      {/* DB Selector Header */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Database Schema
            </span>
          </div>
          {onResetDatabase && (
            <button
              onClick={onResetDatabase}
              className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-[11px] transition-colors"
              title="Reset Database to Default Seed Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Database Dropdown */}
        <select
          value={activeDatabaseId}
          onChange={(e) => onSelectDatabase(e.target.value)}
          className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
        >
          {PRACTICE_DATABASES.map((db) => (
            <option key={db.id} value={db.id}>
              {db.name} ({db.tables.length} tables)
            </option>
          ))}
        </select>
      </div>

      {/* Description & Action Bar */}
      <div className="px-3 py-2 bg-sky-50/40 dark:bg-sky-950/20 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]" title={currentDb.description}>
          {currentDb.description}
        </span>
        <button
          onClick={() => setShowErModal(true)}
          className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 shrink-0"
        >
          <Layers className="w-3 h-3" /> Visual ER Map
        </button>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/40">
        {currentDb.tables.map((table) => {
          const isExpanded = !!expandedTables[table.name];
          return (
            <div key={table.name} className="pt-1 first:pt-0">
              {/* Table Row Header */}
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
                <button
                  onClick={() => toggleTable(table.name)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 text-left flex-1"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <Table className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="font-mono">{table.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({table.columns.length})</span>
                </button>

                {/* Quick Insert & Sample Rows Buttons */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => setSampleModalTable(table)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title={`View sample rows for ${table.name}`}
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  {onInsertSql && (
                    <button
                      onClick={() => onInsertSql(`SELECT * FROM ${table.name} LIMIT 10;`)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 text-[10px] font-mono transition-colors"
                      title="Insert SELECT * query into editor"
                    >
                      SELECT *
                    </button>
                  )}
                </div>
              </div>

              {/* Table Columns (Expanded) */}
              {isExpanded && (
                <div className="ml-5 pl-2 border-l border-slate-200 dark:border-slate-800 py-1 space-y-1 text-[11px] font-mono">
                  {table.columns.map((col) => (
                    <div
                      key={col.name}
                      onClick={() => onInsertSql && onInsertSql(col.name)}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
                      title={col.description ? `${col.description} (Click to insert column name)` : 'Click to insert'}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {col.primaryKey && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                        {col.foreignKey && <Link2 className="w-3 h-3 text-sky-500 shrink-0" />}
                        <span className={col.primaryKey ? 'font-bold text-amber-600 dark:text-amber-400' : ''}>
                          {col.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal shrink-0 uppercase">
                        {col.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ER Diagram Modal */}
      {showErModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Entity Relationship Map — {currentDb.name}
                </h3>
              </div>
              <button
                onClick={() => setShowErModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-300"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentDb.tables.map((table) => (
                <div
                  key={table.name}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-950/60 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                    <span className="font-mono font-bold text-sm text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                      <Table className="w-4 h-4" /> {table.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{table.columns.length} columns</span>
                  </div>
                  <div className="space-y-1 font-mono text-xs">
                    {table.columns.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-slate-700 dark:text-slate-300 py-0.5">
                        <span className="flex items-center gap-1">
                          {c.primaryKey && <Key className="w-3 h-3 text-amber-500" />}
                          {c.foreignKey && <Link2 className="w-3 h-3 text-sky-500" />}
                          <span className={c.primaryKey ? 'font-bold' : ''}>{c.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">{c.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sample Rows Modal */}
      {sampleModalTable && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 font-mono">
                <Table className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Sample Data — {sampleModalTable.name}
                </h3>
              </div>
              <button
                onClick={() => setSampleModalTable(null)}
                className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    {sampleModalTable.columns.map((col) => (
                      <th key={col.name} className="py-1.5 px-2 font-semibold">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {sampleModalTable.sampleRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {sampleModalTable.columns.map((col) => (
                        <td key={col.name} className="py-1.5 px-2">
                          {String(row[col.name] ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
