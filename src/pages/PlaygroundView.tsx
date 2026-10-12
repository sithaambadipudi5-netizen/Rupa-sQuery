import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Database, 
  Sparkles, 
  History, 
  RotateCcw, 
  Bot, 
  Layers, 
  Download, 
  CheckCircle2, 
  Play, 
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { SqlCodeEditor } from '../components/common/SqlCodeEditor';
import { QueryResultTable } from '../components/common/QueryResultTable';
import { SchemaExplorer } from '../components/common/SchemaExplorer';
import { executeQuery, resetDatabase } from '../services/sqlEngine';
import { addQueryToHistory, getQueryHistory } from '../services/storageService';
import { useApp } from '../context/AppContext';
import { QueryResult } from '../types';
import { PRACTICE_DATABASES } from '../data/practiceDatabases';

interface PlaygroundViewProps {
  initialDbId?: string;
  initialQuery?: string;
  onOpenAiTutorWithContext?: (query: string, error: string, dbName: string) => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  initialDbId = 'university_db',
  initialQuery,
  onOpenAiTutorWithContext,
}) => {
  const { showToast, awardXp } = useApp();
  const [activeDbId, setActiveDbId] = useState(initialDbId);
  const [sqlQuery, setSqlQuery] = useState(
    initialQuery ||
      `-- Welcome to RUPA's Query Playground!
-- Select a database on the left and start executing real SQL.

SELECT 
    name, 
    dept_id, 
    salary 
FROM instructors 
ORDER BY salary DESC;`
  );
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'history' | 'samples'>('results');
  const [historyList, setHistoryList] = useState(() => getQueryHistory());

  const currentDb = PRACTICE_DATABASES.find((d) => d.id === activeDbId) || PRACTICE_DATABASES[0];

  const handleRun = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecuting(true);
    try {
      const res = await executeQuery(activeDbId, sqlQuery);
      setResult(res);

      // Save to query execution history
      addQueryToHistory({
        query: sqlQuery,
        databaseName: currentDb.name,
        executionTimeMs: res.executionTimeMs,
        rowCount: res.rowCount,
        status: res.error ? 'error' : 'success',
      });
      setHistoryList(getQueryHistory());

      if (res.error) {
        showToast('error', 'Execution Error', res.error);
      } else {
        showToast('success', 'Query Executed', `${res.rowCount} rows returned in ${res.executionTimeMs} ms`);
        awardXp(2, 'Query Executed in Playground');
      }
    } catch (err: any) {
      const resErr: QueryResult = {
        columns: [],
        values: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: err.message,
      };
      setResult(resErr);
      showToast('error', 'Database Error', err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetDb = async () => {
    await resetDatabase(activeDbId);
    showToast('info', 'Database Reset', `${currentDb.name} has been reset to default state.`);
  };

  const sampleQueries = [
    {
      title: 'Top Earning Faculty per Department',
      query: `SELECT d.dept_name, i.name, i.salary\nFROM instructors i\nJOIN departments d ON i.dept_id = d.dept_id\nORDER BY i.salary DESC;`,
      dbId: 'university_db',
    },
    {
      title: 'Department Budget Aggregation',
      query: `SELECT building, COUNT(dept_id) AS dept_count, SUM(budget) AS total_budget\nFROM departments\nGROUP BY building\nORDER BY total_budget DESC;`,
      dbId: 'university_db',
    },
    {
      title: 'Customer Order History & Totals',
      query: `SELECT c.first_name, c.last_name, COUNT(o.order_id) AS orders_placed, SUM(o.total_amount) AS lifetime_value\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id\nORDER BY lifetime_value DESC;`,
      dbId: 'ecommerce_db',
    },
    {
      title: 'Active High-Balance Bank Accounts',
      query: `SELECT a.account_number, c.full_name, a.account_type, a.balance\nFROM accounts a\nJOIN customers c ON a.cust_id = c.cust_id\nWHERE a.balance > 25000\nORDER BY a.balance DESC;`,
      dbId: 'banking_db',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-6 h-6 text-sky-500" /> SQL Sandbox & Playground
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              SQLite Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Execute arbitrary DDL, DML, JOINs, Window Functions, and CTEs in real-time in your browser sandbox.
          </p>
        </div>

        {/* AI Tutor Assistant CTA */}
        {onOpenAiTutorWithContext && (
          <button
            onClick={() => onOpenAiTutorWithContext(sqlQuery, result?.error || '', currentDb.name)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI to Explain / Review</span>
          </button>
        )}
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Database Schema Explorer (4 cols) */}
        <div className="lg:col-span-4 h-[750px]">
          <SchemaExplorer
            activeDatabaseId={activeDbId}
            onSelectDatabase={(id) => {
              setActiveDbId(id);
              setResult(null);
            }}
            onInsertSql={(snippet) => setSqlQuery((prev) => prev + ' ' + snippet)}
            onResetDatabase={handleResetDb}
          />
        </div>

        {/* Right Col: Code Editor & Result Tab Area (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* SQL Editor */}
          <SqlCodeEditor
            value={sqlQuery}
            onChange={setSqlQuery}
            onRun={handleRun}
            isRunning={isExecuting}
            onClear={() => setSqlQuery('')}
            onReset={() =>
              setSqlQuery(
                `SELECT * FROM ${currentDb.tables[0]?.name || 'students'} LIMIT 10;`
              )
            }
          />

          {/* Bottom Tabs: Results | Query History | Sample Queries */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            
            {/* Tab Buttons Bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('results')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'results'
                    ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Output Results
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" /> History ({historyList.length})
              </button>

              <button
                onClick={() => setActiveTab('samples')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'samples'
                    ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" /> Sample Queries
              </button>
            </div>

            {/* Tab 1: Results Table */}
            {activeTab === 'results' && (
              <div className="p-4">
                <QueryResultTable
                  result={result}
                  onAskAiDebug={(err) => onOpenAiTutorWithContext && onOpenAiTutorWithContext(sqlQuery, err, currentDb.name)}
                />
              </div>
            )}

            {/* Tab 2: Query History */}
            {activeTab === 'history' && (
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {historyList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No queries executed yet.</p>
                ) : (
                  historyList.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs"
                    >
                      <div className="truncate max-w-lg pr-4 font-mono">
                        <span className="text-sky-500 font-sans font-semibold mr-2">[{h.databaseName}]</span>
                        <span className="text-slate-800 dark:text-slate-200">{h.query}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSqlQuery(h.query);
                            showToast('info', 'Loaded Query', 'Query loaded into editor');
                          }}
                          className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900 text-slate-700 dark:text-slate-200 text-[11px] font-semibold"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Sample Queries */}
            {activeTab === 'samples' && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleQueries.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{s.title}</span>
                      <span className="text-[10px] font-mono text-sky-500">{s.dbId}</span>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 truncate">
                      {s.query}
                    </pre>
                    <button
                      onClick={() => {
                        setActiveDbId(s.dbId);
                        setSqlQuery(s.query);
                        showToast('info', 'Sample Loaded', s.title);
                      }}
                      className="w-full py-1 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold text-xs hover:bg-sky-100"
                    >
                      Load into Sandbox
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
