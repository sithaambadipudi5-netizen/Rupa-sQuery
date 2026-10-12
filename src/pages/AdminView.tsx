import React, { useState } from 'react';
import { Shield, Database, RotateCcw, Plus, CheckCircle2, Users, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRACTICE_DATABASES } from '../data/practiceDatabases';
import { resetDatabase } from '../services/sqlEngine';

export const AdminView: React.FC = () => {
  const { user, resetProgress, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'analytics' | 'databases' | 'problems'>('analytics');

  const handleResetAllDbs = async () => {
    for (const db of PRACTICE_DATABASES) {
      await resetDatabase(db.id);
    }
    showToast('success', 'All Databases Reset', 'All 5 schemas have been restored to initial seeds.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-amber-500" /> Instructor & Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform governance, database seed resets, student progression telemetry, and problem authoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAllDbs}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-4 h-4" /> Reset All DB Seeds
          </button>
          <button
            onClick={resetProgress}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
          >
            Reset User Progress
          </button>
        </div>
      </div>

      {/* Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Live DB Schemas</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">5 Schemas</div>
          <p className="text-xs text-slate-500">University, E-Commerce, HR, Banking, Hospital</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Curriculum Lessons</span>
          <div className="text-3xl font-black text-sky-600 dark:text-sky-400">12 Modules</div>
          <p className="text-xs text-slate-500">Structured beginner to advanced levels</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Current User XP</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{user.xp} XP</div>
          <p className="text-xs text-slate-500">Level {user.level} Solver Profile</p>
        </div>
      </div>

      {/* Database Schema Status */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Database Seed Instances</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRACTICE_DATABASES.map((db) => (
            <div
              key={db.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{db.name}</span>
                <span className="text-xs text-emerald-500 font-bold">Online</span>
              </div>
              <p className="text-xs text-slate-500">{db.description}</p>
              <div className="pt-2 text-[11px] text-slate-400 font-mono">
                {db.tables.length} tables • {db.tables.reduce((a, t) => a + t.columns.length, 0)} total columns
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
