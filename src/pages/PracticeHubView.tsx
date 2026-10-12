import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Play, 
  HelpCircle, 
  Sparkles, 
  Search, 
  Filter, 
  Award, 
  Bookmark, 
  Lock, 
  Unlock, 
  Bot, 
  ChevronRight, 
  Eye, 
  Database,
  ArrowLeft,
  Flame
} from 'lucide-react';
import { PRACTICE_PROBLEMS } from '../data/practiceProblems';
import { useApp } from '../context/AppContext';
import { SqlCodeEditor } from '../components/common/SqlCodeEditor';
import { QueryResultTable } from '../components/common/QueryResultTable';
import { executeQuery, validateSolution } from '../services/sqlEngine';
import { QueryResult, PracticeProblem } from '../types';

interface PracticeHubViewProps {
  initialProblemId?: string;
  navigate: (path: string) => void;
  onOpenAiTutorWithContext?: (query: string, error: string, dbName: string) => void;
}

export const PracticeHubView: React.FC<PracticeHubViewProps> = ({
  initialProblemId,
  navigate,
  onOpenAiTutorWithContext,
}) => {
  const { user, markProblemSolved, toggleBookmark, isBookmarked, showToast, triggerConfetti } = useApp();

  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(initialProblemId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved'>('All');

  // Active Problem State
  const activeProblem = PRACTICE_PROBLEMS.find((p) => p.id === selectedProblemId) || null;
  const [userSql, setUserSql] = useState('');
  const [executionResult, setExecutionResult] = useState<QueryResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{ passed: boolean; message: string } | null>(null);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [showSolution, setShowSolution] = useState(false);

  // Sync state when problem opens
  useEffect(() => {
    if (activeProblem) {
      setUserSql(activeProblem.initialSql);
      setExecutionResult(null);
      setVerificationFeedback(null);
      setRevealedHints([]);
      setShowSolution(false);
    }
  }, [selectedProblemId]);

  // Filtered problems list
  const filteredProblems = PRACTICE_PROBLEMS.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'All' || p.topic === selectedTopic;
    const isSolved = user.solvedProblems.includes(p.id);
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Solved' && isSolved) ||
      (statusFilter === 'Unsolved' && !isSolved);

    return matchesSearch && matchesDifficulty && matchesTopic && matchesStatus;
  });

  const handleRunQuery = async () => {
    if (!activeProblem || !userSql.trim()) return;
    setIsVerifying(true);
    setVerificationFeedback(null);
    try {
      const res = await executeQuery(activeProblem.databaseId, userSql);
      setExecutionResult(res);
      if (res.error) {
        showToast('error', 'Execution Failed', res.error);
      }
    } catch (err: any) {
      setExecutionResult({
        columns: [],
        values: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: err.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifySolution = async () => {
    if (!activeProblem || !userSql.trim()) return;
    setIsVerifying(true);
    setVerificationFeedback(null);
    try {
      // 1. Execute query
      const userRes = await executeQuery(activeProblem.databaseId, userSql);
      setExecutionResult(userRes);

      if (userRes.error) {
        setVerificationFeedback({ passed: false, message: `Query execution failed: ${userRes.error}` });
        showToast('error', 'Syntax/Execution Error', userRes.error);
        return;
      }

      // 2. Validate against expected query
      const validation = await validateSolution(activeProblem.databaseId, userSql, activeProblem.expectedQuery);
      if (validation.isCorrect) {
        setVerificationFeedback({
          passed: true,
          message: `🎉 Perfect! All test cases passed. You earned +${activeProblem.xpReward} XP!`,
        });
        markProblemSolved(activeProblem.id, activeProblem.xpReward);
        showToast('success', 'Problem Solved!', `+${activeProblem.xpReward} XP earned.`);
      } else {
        setVerificationFeedback({
          passed: false,
          message: validation.feedback || 'Output does not match expected result set.',
        });
        showToast('error', 'Incorrect Output', 'Review your WHERE filter, columns, or sort order.');
      }
    } catch (err: any) {
      setVerificationFeedback({ passed: false, message: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const unlockHint = (hintIndex: number) => {
    if (!revealedHints.includes(hintIndex)) {
      setRevealedHints([...revealedHints, hintIndex]);
    }
  };

  // If a problem is selected, render the full solver workspace
  if (activeProblem) {
    const isSolved = user.solvedProblems.includes(activeProblem.id);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation & Problem Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedProblemId(null)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Problem Catalog
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                toggleBookmark({
                  id: activeProblem.id,
                  type: 'problem',
                  title: activeProblem.title,
                  link: `/practice?problem=${activeProblem.id}`,
                })
              }
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isBookmarked(activeProblem.id)
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(activeProblem.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked(activeProblem.id) ? 'Saved' : 'Save Problem'}</span>
            </button>

            {onOpenAiTutorWithContext && (
              <button
                onClick={() =>
                  onOpenAiTutorWithContext(
                    userSql,
                    executionResult?.error || verificationFeedback?.message || '',
                    activeProblem.databaseId
                  )
                }
                className="px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-purple-200"
              >
                <Bot className="w-3.5 h-3.5" /> Ask AI Tutor
              </button>
            )}
          </div>
        </div>

        {/* Workspace 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Problem Specs, Hints & Solution (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Problem Spec Card */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeProblem.difficulty === 'Easy'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : activeProblem.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                    }`}
                  >
                    {activeProblem.difficulty}
                  </span>
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                    {activeProblem.topic}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-bold text-xs text-amber-500">
                  <Sparkles className="w-3.5 h-3.5" /> +{activeProblem.xpReward} XP
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {activeProblem.title}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeProblem.description}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-sky-500" /> DB: <strong>{activeProblem.databaseId}</strong>
                </span>
                <span>Est: {activeProblem.estimatedMinutes} mins</span>
              </div>
            </div>

            {/* Progressive Hints Accordion */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Progressive Hints</h4>
              </div>

              <div className="space-y-2">
                {activeProblem.hints.map((hint, idx) => {
                  const isRevealed = revealedHints.includes(idx);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                    >
                      {isRevealed ? (
                        <div className="space-y-1">
                          <span className="font-bold text-amber-600 dark:text-amber-400">Hint {idx + 1}:</span>
                          <p className="text-slate-700 dark:text-slate-300">{hint}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => unlockHint(idx)}
                          className="w-full flex items-center justify-between text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                        >
                          <span>Unlock Hint {idx + 1}</span>
                          <Unlock className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Solution Revealer */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Solution & Explanation</h4>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showSolution ? 'Hide Solution' : 'Reveal Solution'}
                </button>
              </div>

              {showSolution && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <pre className="p-3 rounded-xl bg-slate-950 text-sky-300 font-mono overflow-x-auto">
                    {activeProblem.solution}
                  </pre>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeProblem.explanation}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Code Editor & Submission (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Editor */}
            <SqlCodeEditor
              value={userSql}
              onChange={setUserSql}
              onRun={handleRunQuery}
              isRunning={isVerifying}
              onReset={() => setUserSql(activeProblem.initialSql)}
            />

            {/* Verification & Submission Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <button
                onClick={handleRunQuery}
                disabled={isVerifying || !userSql.trim()}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                Run Draft Query
              </button>

              <button
                onClick={handleVerifySolution}
                disabled={isVerifying || !userSql.trim()}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isVerifying ? 'Evaluating...' : 'Submit & Check Solution'}
              </button>
            </div>

            {/* Verification Feedback Card */}
            {verificationFeedback && (
              <div
                className={`p-4 rounded-2xl border shadow-xs text-xs font-semibold ${
                  verificationFeedback.passed
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 text-emerald-900 dark:text-emerald-100'
                    : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 text-rose-900 dark:text-rose-100'
                }`}
              >
                <p>{verificationFeedback.message}</p>
              </div>
            )}

            {/* Query Results Table */}
            <QueryResultTable
              result={executionResult}
              onAskAiDebug={(err) =>
                onOpenAiTutorWithContext &&
                onOpenAiTutorWithContext(userSql, err, activeProblem.databaseId)
              }
            />

          </div>

        </div>

      </div>
    );
  }

  // Otherwise render Problem Catalog
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" /> SQL Practice Challenges
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            200+ structured problems with automated validation across 5 live database schemas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            {user.solvedProblems.length} / {PRACTICE_PROBLEMS.length} Solved
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Topic Filter */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
        >
          <option value="All">All Topics</option>
          <option value="SELECT">SELECT & Aliases</option>
          <option value="WHERE">WHERE & Filters</option>
          <option value="ORDER BY">ORDER BY & LIMIT</option>
          <option value="GROUP BY">GROUP BY Aggregates</option>
          <option value="HAVING">HAVING Group Filters</option>
          <option value="JOIN">Relational JOINs</option>
          <option value="Subquery">Subqueries & EXISTS</option>
          <option value="CTE">CTEs & WITH</option>
          <option value="Window Functions">Window Functions</option>
        </select>

        {/* Solved Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
        >
          <option value="All">All Statuses</option>
          <option value="Unsolved">Unsolved</option>
          <option value="Solved">Solved</option>
        </select>

      </div>

      {/* Problems List Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredProblems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No problems match your filter criteria. Try adjusting your search query.
          </div>
        ) : (
          filteredProblems.map((prob) => {
            const isSolved = user.solvedProblems.includes(prob.id);
            return (
              <div
                key={prob.id}
                onClick={() => setSelectedProblemId(prob.id)}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prob.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : prob.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                      {prob.topic}
                    </span>
                    <span className="text-xs text-slate-400">• {prob.databaseId}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                    {prob.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {prob.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-amber-500">+{prob.xpReward} XP</span>
                  {isSolved ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                    </span>
                  ) : (
                    <button className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-sky-600 group-hover:text-white font-semibold text-xs transition-colors flex items-center gap-1">
                      <span>Solve</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
