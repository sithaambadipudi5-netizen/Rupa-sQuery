import React, { useState } from 'react';
import { Briefcase, ArrowRight, CheckCircle2, Play, Sparkles, Database, Layers } from 'lucide-react';
import { SQL_PROJECTS } from '../data/projects';
import { useApp } from '../context/AppContext';
import { SqlCodeEditor } from '../components/common/SqlCodeEditor';
import { QueryResultTable } from '../components/common/QueryResultTable';
import { executeQuery } from '../services/sqlEngine';
import { QueryResult } from '../types';

interface ProjectsViewProps {
  navigate: (path: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ navigate }) => {
  const { user, awardXp, showToast, triggerConfetti } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const [taskSql, setTaskSql] = useState('');
  const [taskResult, setTaskResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const activeProject = SQL_PROJECTS.find((p) => p.id === selectedProjectId) || null;
  const activeTask = activeProject?.tasks.find((t) => t.id === activeTaskId) || activeProject?.tasks[0] || null;

  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = SQL_PROJECTS.find((p) => p.id === projId);
    if (proj && proj.tasks.length > 0) {
      setActiveTaskId(proj.tasks[0].id);
      setTaskSql(proj.tasks[0].initialSql);
      setTaskResult(null);
    }
  };

  const handleRunTask = async () => {
    if (!activeProject || !taskSql.trim()) return;
    setIsExecuting(true);
    try {
      const res = await executeQuery(activeProject.databaseId, taskSql);
      setTaskResult(res);
      if (!res.error) {
        showToast('success', 'Task Query Executed', `Returned ${res.rowCount} rows`);
        awardXp(activeTask?.xpReward || 25, 'Project Task Completed');
        triggerConfetti();
      }
    } catch (err: any) {
      setTaskResult({
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

  if (activeProject && activeTask) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedProjectId(null)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            ← Back to Projects Portfolio
          </button>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
            {activeProject.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Col: Project Spec & Task Selector */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                  {activeProject.category}
                </span>
                <span className="text-xs font-bold text-amber-500">+{activeProject.xpReward} Total XP</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeProject.title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeProject.problemStatement}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Requirements:</h4>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  {activeProject.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Tasks Picker */}
              <div className="pt-3 space-y-2">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Project Tasks:</h4>
                <div className="space-y-1.5">
                  {activeProject.tasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTaskId(t.id);
                        setTaskSql(t.initialSql);
                        setTaskResult(null);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        t.id === activeTaskId
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{t.title}</span>
                      <span>+{t.xpReward} XP</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Task Query Execution */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{activeTask.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{activeTask.description}</p>
            </div>

            <SqlCodeEditor
              value={taskSql}
              onChange={setTaskSql}
              onRun={handleRunTask}
              isRunning={isExecuting}
              onReset={() => setTaskSql(activeTask.initialSql)}
            />

            <QueryResultTable result={taskResult} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-sky-500" /> Real-World SQL Projects Portfolio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Apply end-to-end database design, analytics, reporting pipelines, and ledger auditing on production-style datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SQL_PROJECTS.map((proj) => (
          <div
            key={proj.id}
            onClick={() => handleSelectProject(proj.id)}
            className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 hover:shadow-xl transition-all cursor-pointer space-y-4 group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {proj.category}
              </span>
              <span className="font-bold text-amber-500">+{proj.xpReward} XP</span>
            </div>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
              {proj.title}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {proj.problemStatement}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {proj.skillsLearned.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{proj.tasks.length} Milestone Tasks</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                Start Project <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
