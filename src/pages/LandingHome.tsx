import React from 'react';
import { 
  Database, 
  Terminal, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Flame, 
  Bot, 
  Code2, 
  TrendingUp, 
  Briefcase,
  Phone,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSE_MODULES } from '../data/courses';
import { PRACTICE_PROBLEMS } from '../data/practiceProblems';

interface LandingHomeProps {
  navigate: (path: string) => void;
  onOpenAiTutor: () => void;
}

export const LandingHome: React.FC<LandingHomeProps> = ({ navigate, onOpenAiTutor }) => {
  const { user, authorPhoto } = useApp();

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Author & Mission Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engineered by Ambadipudi Rupavani</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Full SQL Mastery Platform</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Learn SQL. Practice Queries. <span className="text-indigo-600 dark:text-indigo-400">Master Databases.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                The all-in-one interactive platform for SQL beginners, aspiring data engineers, and backend developers. Practice in-browser against real SQLite schemas, conquer 200+ problem challenges, and get real-time guidance from your Gemini AI SQL Tutor.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/playground')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  Launch SQL Console
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => navigate('/courses')}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xs transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Explore 12-Level Course
                </button>

                <button
                  onClick={onOpenAiTutor}
                  className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-indigo-600" />
                  AI SQL Tutor
                </button>
              </div>

              {/* Quick Stat Counter Cards - Professional Polish Style */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-semibold uppercase tracking-tight text-slate-400">Curriculum</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">12 Levels</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-semibold uppercase tracking-tight text-slate-400">Practice</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">200+ Solves</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-semibold uppercase tracking-tight text-slate-400">Schemas</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">5 DBs</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-semibold uppercase tracking-tight text-slate-400">Interviews</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">60+ Q&A</p>
                </div>
              </div>
            </div>

            {/* Right Interactive SQL Teaser Window */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden text-left font-mono">
                {/* Mock Window Top Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-slate-400 font-sans font-medium text-xs ml-2">university_db • live query</span>
                  </div>
                  <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> In-Browser Engine
                  </span>
                </div>

                {/* Query Preview */}
                <div className="p-4 text-xs space-y-2 leading-relaxed">
                  <p className="text-slate-500">-- High Earner Department Ranking</p>
                  <p className="text-purple-400 font-semibold">WITH <span className="text-sky-300">DeptSalaries</span> AS (</p>
                  <p className="pl-4 text-slate-300">
                    <span className="text-sky-400 font-bold">SELECT</span> d.dept_name, <span className="text-amber-300">AVG</span>(i.salary) <span className="text-sky-400 font-bold">AS</span> avg_sal
                  </p>
                  <p className="pl-4 text-slate-300">
                    <span className="text-sky-400 font-bold">FROM</span> departments d <span className="text-sky-400 font-bold">JOIN</span> instructors i
                  </p>
                  <p className="pl-4 text-slate-300">
                    <span className="text-sky-400 font-bold">ON</span> d.dept_id = i.dept_id <span className="text-sky-400 font-bold">GROUP BY</span> d.dept_name
                  </p>
                  <p className="text-purple-400 font-semibold">)</p>
                  <p className="text-slate-300">
                    <span className="text-sky-400 font-bold">SELECT</span> *, <span className="text-amber-300">DENSE_RANK</span>() <span className="text-sky-400 font-bold">OVER</span> (<span className="text-sky-400 font-bold">ORDER BY</span> avg_sal <span className="text-sky-400 font-bold">DESC</span>) <span className="text-sky-400 font-bold">AS</span> rank
                  </p>
                  <p className="text-slate-300"><span className="text-sky-400 font-bold">FROM</span> DeptSalaries;</p>
                </div>

                {/* Instant Result Preview Box */}
                <div className="border-t border-slate-800 bg-slate-900/90 p-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="text-emerald-400 font-semibold">✓ Query returned 4 rows (1.4 ms)</span>
                    <span className="text-slate-500">Output Grid</span>
                  </div>
                  <div className="text-[11px] font-mono grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300">
                    <div className="font-bold text-sky-400 border-b border-slate-800 pb-1">dept_name</div>
                    <div className="font-bold text-sky-400 border-b border-slate-800 pb-1">avg_sal</div>
                    <div className="font-bold text-sky-400 border-b border-slate-800 pb-1">rank</div>
                    <div>Computer Sci</div>
                    <div>$119,000</div>
                    <div className="text-emerald-400 font-bold">1</div>
                    <div>Finance</div>
                    <div>$115,000</div>
                    <div className="text-emerald-400 font-bold">2</div>
                    <div>Physics</div>
                    <div>$98,000</div>
                    <div className="text-emerald-400 font-bold">3</div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/40 border-t border-indigo-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-indigo-300">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <span>Gemini AI Tutor: "Optimal CTE & Window execution!"</span>
                  </div>
                  <button
                    onClick={() => navigate('/playground')}
                    className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Run in Playground
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">Enterprise-Grade Learning</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Everything You Need to Master Relational Databases
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            A comprehensive curriculum tailored from scratch, designed to take you from foundational queries to complex analytic data pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Interactive Curriculum */}
          <div 
            onClick={() => navigate('/courses')}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-50 dark:hover:shadow-none transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              12 Structured Course Levels
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Step through DBMS architecture, relational algebra, DDL/DML, multi-table JOINs, subqueries, CTEs, Window functions, indexing, and transaction ACID properties.
            </p>
            <div className="pt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>View Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: 200+ Practice Problems */}
          <div 
            onClick={() => navigate('/practice')}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-50 dark:hover:shadow-none transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Interactive Practice Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tackle problems categorized by topic and difficulty. Automated test case verification compares your result sets against expected schemas with 3 progressive hint tiers.
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>Solve Challenges</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Gemini AI SQL Tutor */}
          <div 
            onClick={onOpenAiTutor}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-50 dark:hover:shadow-none transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Gemini AI SQL Tutor
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Personalized AI tutoring powered by Gemini 2.5 Flash. Get instant error diagnosis, performance tips, hints without direct answers, and mock technical interview rehearsals.
            </p>
            <div className="pt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>Consult AI Tutor</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* Curriculum Snapshot Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Curriculum Roadmap</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12 Progressive Learning Modules</h3>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Explore All Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COURSE_MODULES.slice(0, 6).map((mod) => (
              <div
                key={mod.id}
                onClick={() => navigate(`/courses/${mod.id}`)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Level {mod.level}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {mod.difficulty}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{mod.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{mod.description}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 dark:border-slate-800">
                  <span>{mod.lessons.length} Lessons</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{mod.lessons.length * 10} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author Tribute Banner - Professional Polish Executive Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-950 text-white p-8 sm:p-10 shadow-xl border border-indigo-700/60 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Author Headshot & Details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-indigo-300/40 shadow-lg">
              <img
                src={authorPhoto}
                alt="Ambadipudi Rupavani"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 bg-white/10 w-fit px-3 py-0.5 rounded-full text-xs font-semibold backdrop-blur-xs">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Created by Ambadipudi Rupavani</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-indigo-500/30 border border-indigo-400/30 w-fit px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-indigo-200">
                  <GraduationCap className="w-3 h-3 text-indigo-300" />
                  <span>Student at MRCET</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Empowering the Next Generation of Database Engineers
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                "RUPA's Query was built on a simple conviction: SQL is not merely about writing syntax; it is about thinking in relational sets, optimizing data access, and turning raw records into actionable intelligence."
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
            <a
              href="tel:9701691282"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 9701691282</span>
            </a>
            <button
              onClick={() => navigate('/about')}
              className="bg-white hover:bg-indigo-50 text-indigo-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors text-center cursor-pointer"
            >
              Profile & Bio
            </button>
            <a
              href="mailto:ambadipudirupavani28@gmail.com"
              className="bg-indigo-600/80 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs border border-indigo-400/40 transition-colors text-center"
            >
              Email
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
