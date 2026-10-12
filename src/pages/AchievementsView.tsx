import React from 'react';
import { Award, Sparkles, Trophy, CheckCircle2, Lock, Medal, Crown } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import { useApp } from '../context/AppContext';

export const AchievementsView: React.FC = () => {
  const { user } = useApp();

  const isAchievementUnlocked = (ach: typeof ACHIEVEMENTS[0]) => {
    if (ach.type === 'lessons') {
      return user.completedLessons.length >= ach.targetCount;
    }
    if (ach.type === 'problems') {
      return user.solvedProblems.length >= ach.targetCount;
    }
    if (ach.type === 'quizzes') {
      return user.completedQuizzes.length >= ach.targetCount;
    }
    if (ach.type === 'projects') {
      return user.completedProjects.length >= ach.targetCount;
    }
    return user.xp >= ach.targetCount * 10;
  };

  const unlockedCount = ACHIEVEMENTS.filter(isAchievementUnlocked).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" /> Milestones & Badges
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your accomplishments, unlock badges, and earn XP multipliers as you practice SQL.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
          {unlockedCount} / {ACHIEVEMENTS.length} Badges Unlocked
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = isAchievementUnlocked(ach);
          return (
            <div
              key={ach.id}
              className={`p-6 rounded-3xl border transition-all space-y-3 ${
                unlocked
                  ? 'border-amber-300 dark:border-amber-800/80 bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs ${
                    unlocked
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {unlocked ? '🏆' : '🔒'}
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> +{ach.xpBonus} XP
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white">{ach.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {ach.description}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Requirement: {ach.targetCount} {ach.type}</span>
                {unlocked ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
