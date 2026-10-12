import React from 'react';
import { Database, Mail, Phone, Github, Sparkles, Heart, Award, BookOpen, Terminal, MessageSquare, GraduationCap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FooterProps {
  navigate: (path: string) => void;
  onOpenFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate, onOpenFeedback }) => {
  const { authorPhoto } = useApp();
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Database className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">RUPA's Query</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Interactive SQL education, real-world query execution sandbox, 200+ practice problems, structured quizzes, projects, and Gemini AI SQL Tutor.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Master Databases Step-by-Step</span>
            </div>
          </div>

          {/* Col 2: Learning Modules */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Curriculum</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/courses')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">12-Level SQL Course</button></li>
              <li><button onClick={() => navigate('/practice')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">200+ Practice Problems</button></li>
              <li><button onClick={() => navigate('/playground')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Full SQL Playground</button></li>
              <li><button onClick={() => navigate('/quizzes')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Skill Assessments & Quizzes</button></li>
              <li><button onClick={() => navigate('/projects')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Real-World Projects</button></li>
            </ul>
          </div>

          {/* Col 3: Resources & Tools */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/interview')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Interview Prep (60+ Q&A)</button></li>
              <li><button onClick={() => navigate('/roadmap')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">SQL Career Roadmap</button></li>
              <li><button onClick={() => navigate('/cheatsheet')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">SQL Syntax Cheat Sheet</button></li>
              <li><button onClick={() => navigate('/ai-tutor')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">AI SQL Tutor (Gemini)</button></li>
              <li><button onClick={() => navigate('/feedback')} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors flex items-center gap-1.5"><Mail className="w-3 h-3 text-indigo-500" /> Mail Feedback</button></li>
            </ul>
          </div>

          {/* Col 4: Author & Contact */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Author Profile</h4>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-indigo-300 shadow-xs">
                <img
                  src={authorPhoto}
                  alt="Ambadipudi Rupavani"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Ambadipudi Rupavani</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Student at MRCET (CSE)</p>
              </div>
            </div>
            <div className="mt-2.5 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <a 
                  href="tel:9701691282" 
                  className="text-emerald-700 dark:text-emerald-300 font-semibold hover:underline text-[11px]"
                >
                  +91 9701691282
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <a 
                  href="mailto:ambadipudirupavani28@gmail.com" 
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium truncate text-[11px]"
                >
                  ambadipudirupavani28@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a 
                  href="mailto:ambadipudirupavani17@gmail.com" 
                  className="text-slate-500 dark:text-slate-400 hover:underline truncate text-[11px]"
                >
                  ambadipudirupavani17@gmail.com
                </a>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
              <button 
                onClick={() => navigate('/about')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-left"
              >
                <span>View Full Bio, MRCET & Strengths →</span>
              </button>
              <button 
                onClick={() => onOpenFeedback ? onOpenFeedback() : navigate('/feedback')}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-left flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Send In-App Feedback</span>
              </button>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} RUPA's Query. Designed & Developed by Ambadipudi Rupavani.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/about')} className="hover:text-slate-800 dark:hover:text-slate-200">About</button>
            <span>•</span>
            <button onClick={() => onOpenFeedback ? onOpenFeedback() : navigate('/feedback')} className="hover:text-slate-800 dark:hover:text-slate-200 font-medium">Mail Feedback</button>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Powered by <span className="font-semibold text-sky-500">Google Gemini</span> & SQLite
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
