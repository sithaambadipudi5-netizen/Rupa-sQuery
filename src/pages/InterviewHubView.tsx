import React, { useState } from 'react';
import { Award, Search, Filter, ChevronDown, ChevronRight, Bookmark, Bot, Check, Copy } from 'lucide-react';
import { INTERVIEW_QUESTIONS } from '../data/interviewQuestions';
import { useApp } from '../context/AppContext';

interface InterviewHubViewProps {
  navigate: (path: string) => void;
  onOpenAiTutorWithContext?: (query: string, error: string) => void;
}

export const InterviewHubView: React.FC<InterviewHubViewProps> = ({ navigate, onOpenAiTutorWithContext }) => {
  const { toggleBookmark, isBookmarked } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({
    int_1: true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredQuestions = INTERVIEW_QUESTIONS.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.relatedTopic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-amber-500" /> SQL Technical Interview Prep
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            60+ curated questions covering ACID transactions, SARGability, Window Functions, DDL vs DML, and query tuning.
          </p>
        </div>

        {onOpenAiTutorWithContext && (
          <button
            onClick={() => onOpenAiTutorWithContext('Conduct a mock SQL technical interview with me. Ask me one question at a time and evaluate my answers.', '')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md"
          >
            <Bot className="w-4 h-4" /> Start AI Mock Interview
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search interview topics, ACID, indexes, Window functions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
        >
          <option value="All">All Categories</option>
          <option value="Beginner">Beginner & Fundamentals</option>
          <option value="Intermediate">Intermediate & Aggregations</option>
          <option value="Advanced">Advanced & Window Functions</option>
          <option value="Query-Based">Query-Based Coding Questions</option>
          <option value="Optimization">Performance & SARGability</option>
          <option value="DBMS">DBMS Architecture & ACID</option>
        </select>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = !!expandedQuestions[q.id];
          const isSaved = isBookmarked(q.id);
          return (
            <div
              key={q.id}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all"
            >
              {/* Question Header */}
              <div className="p-5 flex items-start justify-between gap-4">
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="flex items-start gap-3 text-left flex-1"
                >
                  <div className="mt-0.5 text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                        {q.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 font-mono">
                        {q.relatedTopic}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </h3>
                  </div>
                </button>

                <button
                  onClick={() =>
                    toggleBookmark({
                      id: q.id,
                      type: 'interview',
                      title: q.question,
                      link: `/interview#${q.id}`,
                    })
                  }
                  className={`p-2 rounded-xl border text-xs ${
                    isSaved
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700'
                  }`}
                  title="Bookmark Question"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                </button>
              </div>

              {/* Answer Body */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4 text-xs">
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {q.answer}
                  </div>

                  {q.codeExample && (
                    <div className="relative">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] font-mono rounded-t-xl">
                        <span>SQL Code Example</span>
                        <button
                          onClick={() => handleCopyCode(q.codeExample!, q.id)}
                          className="flex items-center gap-1 hover:text-white text-slate-400"
                        >
                          {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === q.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-4 bg-slate-900 text-sky-200 font-mono text-xs overflow-x-auto rounded-b-xl border border-t-0 border-slate-800">
                        {q.codeExample}
                      </pre>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <strong>💡 Why interviewers ask this:</strong> {q.explanation}
                  </div>

                  {q.commonFollowUps && (
                    <div className="space-y-1">
                      <strong className="text-slate-800 dark:text-slate-200">Common Follow-Up Scenarios:</strong>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                        {q.commonFollowUps.map((fu, fIdx) => (
                          <li key={fIdx}>{fu}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
