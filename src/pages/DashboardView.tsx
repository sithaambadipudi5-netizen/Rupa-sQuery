import React from 'react';
import { 
  Play, 
  Bot, 
  Terminal, 
  Layers, 
  Award, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Calendar,
  Zap,
  TrendingUp,
  Clock,
  Compass,
  Mail
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSE_MODULES } from '../data/courses';
import { PRACTICE_PROBLEMS } from '../data/practiceProblems';
import { PRACTICE_DATABASES } from '../data/practiceDatabases';
import { loadQueryHistory } from '../services/storageService';

interface DashboardViewProps {
  navigate: (path: string) => void;
  onOpenAiTutor?: () => void;
  onOpenFeedback?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ navigate, onOpenAiTutor, onOpenFeedback }) => {
  const { user } = useApp();
  const history = loadQueryHistory();

  // Progress metrics calculation
  const totalLessons = COURSE_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const lessonsCompletedCount = user.completedLessons.length;
  const lessonProgressPercent = totalLessons > 0 ? Math.round((lessonsCompletedCount / totalLessons) * 100) : 0;

  const totalProblems = PRACTICE_PROBLEMS.length;
  const problemsSolvedCount = user.solvedProblems.length;
  const problemProgressPercent = totalProblems > 0 ? Math.round((problemsSolvedCount / totalProblems) * 100) : 0;

  // Next suggested lesson logic
  let nextLesson: { moduleId: string; lessonId: string; title: string; moduleTitle: string } | null = null;
  for (const m of COURSE_MODULES) {
    const uncompleted = m.lessons.find(l => !user.completedLessons.includes(l.id));
    if (uncompleted) {
      nextLesson = {
        moduleId: m.id,
        lessonId: uncompleted.id,
        title: uncompleted.title,
        moduleTitle: m.title
      };
      break;
    }
  }

  // Daily Challenge problem suggestion
  const nextProblem = PRACTICE_PROBLEMS.find(p => !user.solvedProblems.includes(p.id)) || PRACTICE_PROBLEMS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: User Greeting & Quick Status */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Level {user.level} Relational Explorer
            </span>
            <span className="text-xs text-slate-400 font-medium">•</span>
            <span className="text-xs text-slate-500 font-semibold">{user.xp} XP Accumulated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Pick up your SQL curriculum, execute live queries across 5 isolated databases, and test your skills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/courses')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Resume Curriculum
          </button>
          
          <button
            onClick={onOpenAiTutor}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            Ask AI Tutor
          </button>
        </div>
      </section>

      {/* Metric Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Course Lessons */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-tight">Curriculum Mastery</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {lessonProgressPercent}%
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            +{lessonsCompletedCount} of {totalLessons} Lessons Completed
          </p>
        </div>

        {/* Metric 2: Practice Problems */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-tight">Practice Challenges</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {problemsSolvedCount} <span className="text-xs font-normal text-slate-400">/ {totalProblems}</span>
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            {problemProgressPercent}% Solved Across 5 DBs
          </p>
        </div>

        {/* Metric 3: Active Streak */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-tight">Daily Practice Streak</p>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {user.streak} Days
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Stable & Active
          </p>
        </div>

        {/* Metric 4: Skill Assessments */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-tight">Quizzes & Projects</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {user.completedQuizzes.length} <span className="text-xs font-normal text-slate-400">Passed</span>
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            {user.achievements.length} Badges Unlocked
          </p>
        </div>

      </section>

      {/* Main Grid: Continue Learning & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1 & 2: Suggested Next Action & History Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Next Lesson Target */}
          {nextLesson && (
            <div className="border border-indigo-200/70 dark:border-indigo-900/60 rounded-2xl p-6 bg-gradient-to-r from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Continue Curriculum
                </span>
                <p className="text-xs text-slate-400 font-medium">{nextLesson.moduleTitle}</p>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{nextLesson.title}</h3>
              </div>

              <button
                onClick={() => navigate(`/courses/${nextLesson?.moduleId}?lesson=${nextLesson?.lessonId}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Open Lesson</span>
              </button>
            </div>
          )}

          {/* Daily Problem Card */}
          {nextProblem && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                    Daily Problem Challenge
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {nextProblem.difficulty}
                  </span>
                  <span className="text-xs text-amber-500 font-bold">+{nextProblem.xpReward} XP</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{nextProblem.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">{nextProblem.description}</p>
              </div>

              <button
                onClick={() => navigate(`/practice?problem=${nextProblem.id}`)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Solve Now</span>
              </button>
            </div>
          )}

          {/* Recent Query Execution History */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Recent Query Activity</h3>
              </div>
              <button
                onClick={() => navigate('/playground')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Open SQL Console →
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No queries executed yet. Run queries in the Playground or Practice Hub to populate history.
              </p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-slate-100 dark:border-slate-800/60"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      h.status === 'success' || h.success
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}>
                      {h.status === 'success' || h.success ? 'OK' : 'ERR'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono font-bold truncate text-slate-800 dark:text-slate-200">{h.query}</p>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">{h.databaseName || h.databaseId} • {h.executionTimeMs}ms</p>
                    </div>
                    <p className="ml-auto text-xs font-bold text-slate-700 dark:text-slate-300">
                      {h.rowCount} rows
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Col 3: Quick Action Hub & AI Tutor CTA */}
        <div className="space-y-6">
          
          {/* AI Tutor Card */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Gemini AI SQL Consultant</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive instant query execution reviews, schema index recommendations, and query cost breakdowns.
              </p>
            </div>
            <button
              onClick={onOpenAiTutor}
              className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" /> Launch Consultation
            </button>
          </div>

          {/* Mail Feedback Card */}
          <div className="border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-6 bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <Mail className="w-4 h-4" />
              <span>Direct Author Contact</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Have Suggestions or Issues?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mail your feedback, feature ideas, or SQL questions directly to author <strong>Ambadipudi Rupavani</strong>.
            </p>
            <button
              onClick={() => onOpenFeedback ? onOpenFeedback() : navigate('/feedback')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" /> Mail Feedback
            </button>
          </div>

          {/* Quick Hub Links */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400">Quick Navigation</h4>
            <div className="space-y-2 text-xs font-semibold">
              <button
                onClick={() => navigate('/playground')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2"><Terminal className="w-4 h-4 text-indigo-600" /> SQL Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/interview')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2"><Award className="w-4 h-4 text-emerald-600" /> Technical Interview Q&A</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/cheatsheet')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-600" /> Syntax Cheat Sheet</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
