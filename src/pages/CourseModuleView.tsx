import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Sparkles, 
  Bookmark, 
  FileEdit, 
  Play, 
  Bot, 
  Check, 
  Layers,
  AlertCircle,
  Lightbulb,
  Copy,
  HelpCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { COURSE_MODULES } from '../data/courses';
import { useApp } from '../context/AppContext';
import { SqlCodeEditor } from '../components/common/SqlCodeEditor';
import { QueryResultTable } from '../components/common/QueryResultTable';
import { executeQuery } from '../services/sqlEngine';
import { QueryResult, Lesson } from '../types';

interface CourseModuleViewProps {
  initialModuleId?: string;
  initialLessonId?: string;
  navigate: (path: string) => void;
  onOpenAiTutorWithContext?: (query: string, error: string) => void;
}

export const CourseModuleView: React.FC<CourseModuleViewProps> = ({
  initialModuleId = 'mod_1',
  initialLessonId,
  navigate,
  onOpenAiTutorWithContext,
}) => {
  const { user, markLessonComplete, toggleBookmark, isBookmarked, addNote, showToast, triggerConfetti } = useApp();

  const [activeModuleId, setActiveModuleId] = useState(initialModuleId);
  const [activeLessonId, setActiveLessonId] = useState(initialLessonId || '');
  
  // Interactive Exercise State
  const [exerciseSql, setExerciseSql] = useState('');
  const [exerciseResult, setExerciseResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [copiedSyntax, setCopiedSyntax] = useState(false);

  // Mini Quiz in lesson state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const currentModule = COURSE_MODULES.find((m) => m.id === activeModuleId) || COURSE_MODULES[0];
  const currentLesson: Lesson = currentModule.lessons.find((l) => l.id === activeLessonId) || currentModule.lessons[0];

  // Set default active lesson on module change
  useEffect(() => {
    if (!activeLessonId || !currentModule.lessons.some((l) => l.id === activeLessonId)) {
      setActiveLessonId(currentModule.lessons[0].id);
    }
  }, [activeModuleId]);

  // Load interactive SQL on lesson change
  useEffect(() => {
    if (currentLesson.exampleQueries && currentLesson.exampleQueries.length > 0) {
      setExerciseSql(currentLesson.exampleQueries[0].query);
      setExerciseResult(null);
      setSelectedQuizAnswer(null);
      setQuizSubmitted(false);
    }
  }, [currentLesson]);

  const handleRunExercise = async () => {
    if (!exerciseSql.trim()) return;
    setIsExecuting(true);
    try {
      const res = await executeQuery('university_db', exerciseSql);
      setExerciseResult(res);
      if (!res.error) {
        showToast('success', 'Query Executed', `Returned ${res.rowCount} rows`);
      }
    } catch (err: any) {
      setExerciseResult({
        columns: [],
        values: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: err.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const isCompleted = user.completedLessons.includes(currentLesson.id);

  const handleCompleteAndNext = () => {
    if (!isCompleted) {
      markLessonComplete(currentLesson.id);
      triggerConfetti();
    }

    // Find next lesson
    const currentIndex = currentModule.lessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex < currentModule.lessons.length - 1) {
      setActiveLessonId(currentModule.lessons[currentIndex + 1].id);
    } else {
      // Find next module
      const modIndex = COURSE_MODULES.findIndex((m) => m.id === currentModule.id);
      if (modIndex < COURSE_MODULES.length - 1) {
        const nextMod = COURSE_MODULES[modIndex + 1];
        setActiveModuleId(nextMod.id);
        setActiveLessonId(nextMod.lessons[0].id);
      }
    }
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    addNote(noteTitle, noteContent, currentLesson.id);
    setShowNoteModal(false);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleCopySyntax = () => {
    navigator.clipboard.writeText(currentLesson.syntax);
    setCopiedSyntax(true);
    setTimeout(() => setCopiedSyntax(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button onClick={() => navigate('/dashboard')} className="hover:underline">Dashboard</button>
          <span>/</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{currentModule.title}</span>
          <span>/</span>
          <span className="text-sky-600 dark:text-sky-400 font-bold">{currentLesson.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmark({
              id: currentLesson.id,
              type: 'lesson',
              title: currentLesson.title,
              link: `/courses/${currentModule.id}?lesson=${currentLesson.id}`,
            })}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isBookmarked(currentLesson.id)
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600 dark:text-amber-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title="Bookmark Lesson"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(currentLesson.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">{isBookmarked(currentLesson.id) ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          {/* Add Study Note */}
          <button
            onClick={() => {
              setNoteTitle(`Note on ${currentLesson.title}`);
              setShowNoteModal(true);
            }}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileEdit className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Add Note</span>
          </button>

          {/* Module Quiz Link */}
          <button
            onClick={() => navigate(`/quizzes?module=${currentModule.id}`)}
            className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Take Quiz</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: 12 Modules & Lessons Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Curriculum Modules</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">12 Levels</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[70vh] overflow-y-auto">
              {COURSE_MODULES.map((mod) => {
                const isCurrentMod = mod.id === activeModuleId;
                const completedInMod = mod.lessons.filter((l) => user.completedLessons.includes(l.id)).length;
                const modPercent = Math.round((completedInMod / mod.lessons.length) * 100);

                return (
                  <div key={mod.id} className="p-2">
                    {/* Module Accordion Header */}
                    <button
                      onClick={() => setActiveModuleId(mod.id)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                        isCurrentMod
                          ? 'bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Lvl {mod.level}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{mod.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{completedInMod}/{mod.lessons.length} done</span>
                          <span>•</span>
                          <span>{modPercent}%</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isCurrentMod ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Lessons list for active module */}
                    {isCurrentMod && (
                      <div className="ml-3 mt-1.5 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-1">
                        {mod.lessons.map((les) => {
                          const isLesActive = les.id === activeLessonId;
                          const isLesDone = user.completedLessons.includes(les.id);
                          return (
                            <button
                              key={les.id}
                              onClick={() => setActiveLessonId(les.id)}
                              className={`w-full p-2 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors ${
                                isLesActive
                                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span className="truncate pr-2">{les.title}</span>
                              {isLesDone && (
                                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isLesActive ? 'text-white' : 'text-emerald-500'}`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Main Lesson Content Panel */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Lesson Header Banner */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  Level {currentModule.level} • Lesson {currentLesson.order}
                </span>
                <span className="text-xs text-slate-400 font-mono">{currentLesson.durationMinutes} mins read</span>
              </div>

              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed (+10 XP)
                </span>
              ) : (
                <button
                  onClick={() => markLessonComplete(currentLesson.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Mark as Done (+10 XP)
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {currentLesson.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentLesson.introduction}
            </p>
          </div>

          {/* Concept Explanation Card */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 shadow-xs prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-500" /> Core Architectural Concept
            </h3>
            <ReactMarkdown>{currentLesson.conceptExplanation}</ReactMarkdown>
          </div>

          {/* Syntax Blueprint */}
          {currentLesson.syntax && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-950 text-slate-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-sky-400 uppercase tracking-wider">SQL Syntax Blueprint</span>
                <button
                  onClick={handleCopySyntax}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedSyntax ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSyntax ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-sky-300 pt-1 overflow-x-auto">
                {currentLesson.syntax}
              </pre>
            </div>
          )}

          {/* Best Practices & Common Mistakes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common Mistakes */}
            <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
              <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500" /> Common Pitfalls to Avoid
              </h4>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                {currentLesson.commonMistakes.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>

            {/* Best Practices */}
            <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
              <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Industry Best Practices
              </h4>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                {currentLesson.bestPractices.map((bp, idx) => (
                  <li key={idx}>{bp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Live Query Runner */}
          <div className="border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-950/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Live SQL Sandbox Runner
                  </h3>
                  <p className="text-xs text-slate-500">
                    Database: <strong className="font-mono text-sky-500">university_db</strong>
                  </p>
                </div>
              </div>

              {onOpenAiTutorWithContext && (
                <button
                  onClick={() => onOpenAiTutorWithContext(exerciseSql, exerciseResult?.error || '')}
                  className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-purple-200"
                >
                  <Bot className="w-3.5 h-3.5" /> Ask AI Tutor
                </button>
              )}
            </div>

            {/* Code Editor */}
            <SqlCodeEditor
              value={exerciseSql}
              onChange={setExerciseSql}
              onRun={handleRunExercise}
              isRunning={isExecuting}
              onReset={() => {
                if (currentLesson.exampleQueries && currentLesson.exampleQueries.length > 0) {
                  setExerciseSql(currentLesson.exampleQueries[0].query);
                }
              }}
            />

            {/* Results Grid */}
            <QueryResultTable
              result={exerciseResult}
              onAskAiDebug={(err) => onOpenAiTutorWithContext && onOpenAiTutorWithContext(exerciseSql, err)}
            />
          </div>

          {/* Lesson Mini Quiz */}
          {currentLesson.miniQuiz && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" /> Quick Knowledge Check
                </h4>
                <span className="text-xs font-semibold text-amber-500">+5 XP Bonus</span>
              </div>

              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {currentLesson.miniQuiz.question}
              </p>

              <div className="space-y-2">
                {currentLesson.miniQuiz.options.map((opt, oIdx) => {
                  const isSelected = selectedQuizAnswer === oIdx;
                  const isCorrect = oIdx === currentLesson.miniQuiz.correctAnswerIndex;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => {
                        if (!quizSubmitted) {
                          setSelectedQuizAnswer(oIdx);
                        }
                      }}
                      className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                        quizSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold'
                            : isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                          : isSelected
                          ? 'bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-900 dark:text-sky-200 font-bold'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-500" />}
                      {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
                    </button>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={() => {
                    if (selectedQuizAnswer !== null) {
                      setQuizSubmitted(true);
                      if (selectedQuizAnswer === currentLesson.miniQuiz.correctAnswerIndex) {
                        showToast('success', 'Correct Answer!', '+5 XP earned');
                      }
                    }
                  }}
                  disabled={selectedQuizAnswer === null}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs shadow-xs"
                >
                  Verify Answer
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 italic">
                  <strong>Explanation:</strong> {currentLesson.miniQuiz.explanation}
                </div>
              )}
            </div>
          )}

          {/* Lesson Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                const currentIndex = currentModule.lessons.findIndex((l) => l.id === currentLesson.id);
                if (currentIndex > 0) {
                  setActiveLessonId(currentModule.lessons[currentIndex - 1].id);
                }
              }}
              disabled={currentModule.lessons.findIndex((l) => l.id === currentLesson.id) === 0}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Lesson
            </button>

            <button
              onClick={handleCompleteAndNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <span>{isCompleted ? 'Next Lesson' : 'Complete & Continue'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Note Creation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Study Note</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Syntax Takeaways</label>
                <textarea
                  rows={5}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record your understanding, key syntax rules, or queries..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
