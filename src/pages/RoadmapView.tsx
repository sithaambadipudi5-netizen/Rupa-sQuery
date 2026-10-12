import React from 'react';
import { Layers, CheckCircle2, ArrowRight, BookOpen, Terminal, Award, Briefcase, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface RoadmapViewProps {
  navigate: (path: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ navigate }) => {
  const { user } = useApp();

  const stages = [
    {
      stage: 'Phase 1: Relational Foundations',
      levelRange: 'Levels 1 - 3',
      description: 'Master tables, primary keys, relational data modeling, basic SELECT queries, row filtering with WHERE, and sorting with ORDER BY.',
      skills: ['Relational Architecture', 'Primary/Foreign Keys', 'SELECT & Aliases', 'WHERE & Operators', 'LIMIT & OFFSET'],
      unlocked: true,
      targetLevel: 1,
    },
    {
      stage: 'Phase 2: Aggregations & Analytical Bucketing',
      levelRange: 'Levels 4 - 5',
      description: 'Understand group operations, COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING, and SQL logical query evaluation sequence.',
      skills: ['Aggregate Functions', 'GROUP BY Clustered Math', 'HAVING Filter Semantics', 'Logical Processing Pipeline'],
      unlocked: user.level >= 2,
      targetLevel: 2,
    },
    {
      stage: 'Phase 3: Relational Joins & Set Algebra',
      levelRange: 'Levels 6 - 7',
      description: 'Connect multi-table schemas with INNER, LEFT, RIGHT, FULL OUTER, CROSS, and SELF JOINs. Implement set operations with UNION and INTERSECT.',
      skills: ['Multi-table Relationships', 'Outer Joins & NULLs', 'Anti-Joins', 'UNION ALL vs UNION', 'Set Logic'],
      unlocked: user.level >= 3,
      targetLevel: 3,
    },
    {
      stage: 'Phase 4: Advanced Subqueries & Modular CTEs',
      levelRange: 'Levels 8 - 9',
      description: 'Write scalar, multi-row, and correlated subqueries with EXISTS. Build maintainable data pipelines using Common Table Expressions (WITH).',
      skills: ['Correlated Subqueries', 'EXISTS & NOT EXISTS', 'Common Table Expressions', 'Modular Data Transformations'],
      unlocked: user.level >= 4,
      targetLevel: 4,
    },
    {
      stage: 'Phase 5: Window Functions & Deep Analytics',
      levelRange: 'Level 10',
      description: 'Compute running totals, moving averages, ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, and sliding frame partitions.',
      skills: ['OVER & PARTITION BY', 'Dense Ranking', 'Time-series LEAD/LAG', 'Cumulative Sums'],
      unlocked: user.level >= 5,
      targetLevel: 5,
    },
    {
      stage: 'Phase 6: Performance, Indexes & ACID Transactions',
      levelRange: 'Levels 11 - 12',
      description: 'Deep dive into B-Tree indexes, SARGability, query execution plan tuning, and ACID transaction isolation guarantees.',
      skills: ['B-Tree Index Design', 'SARGable Predicates', 'ACID Transactions', 'Concurrency Isolation'],
      unlocked: user.level >= 6,
      targetLevel: 6,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-7 h-7 text-sky-500" /> SQL Mastery Career Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          A step-by-step pathway from basic querying to database administration and data engineering excellence.
        </p>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {stages.map((stage, idx) => (
          <div key={idx} className="relative flex items-start gap-6 group">
            {/* Stage Icon Marker */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-md z-10 transition-transform ${
                stage.unlocked
                  ? 'bg-sky-500 text-white border-sky-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
            >
              {stage.unlocked ? <CheckCircle2 className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
            </div>

            {/* Stage Card */}
            <div className="flex-1 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  {stage.levelRange}
                </span>
                {stage.unlocked ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Unlocked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Requires Level {stage.targetLevel}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{stage.stage}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {stage.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {stage.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-100 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
