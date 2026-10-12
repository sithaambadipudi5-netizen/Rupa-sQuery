import React, { useState } from 'react';
import { 
  Database, 
  Terminal, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Moon, 
  Sun, 
  Flame, 
  User, 
  Layers, 
  Briefcase, 
  FileText, 
  Bookmark, 
  Menu, 
  X,
  Shield,
  Bot,
  LogIn,
  LogOut,
  UserPlus,
  Mail
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenAiTutor?: () => void;
  onOpenFeedback?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, onOpenAiTutor, onOpenFeedback }) => {
  const { user, firebaseUser, logout, theme, toggleTheme, setRole } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Layers },
    { label: 'Courses', path: '/courses', icon: BookOpen },
    { label: 'Playground', path: '/playground', icon: Terminal },
    { label: 'Practice', path: '/practice', icon: CheckCircle2 },
    { label: 'Quizzes', path: '/quizzes', icon: Award },
    { label: 'Projects', path: '/projects', icon: Briefcase },
    { label: 'Interview', path: '/interview', icon: Award },
    { label: 'Cheat Sheet', path: '/cheatsheet', icon: FileText },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('/')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none">
            <div className="w-4 h-4 border-2 border-white rounded-xs flex items-center justify-center">
              <Database className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">RUPA's Query</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              PRO
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          {navItems.map((item) => {
            const isActive = currentPath.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`py-5 text-sm transition-colors relative font-semibold flex items-center gap-1.5 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Stats & Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* AI SQL Tutor Button */}
          <button
            onClick={() => onOpenAiTutor ? onOpenAiTutor() : handleNav('/ai-tutor')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-100 dark:shadow-none flex items-center gap-1.5 transition-all cursor-pointer"
            title="Open AI SQL Tutor"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline">AI Tutor</span>
          </button>

          {/* Mail Feedback Button */}
          <button
            id="navbar-feedback-btn"
            onClick={() => onOpenFeedback ? onOpenFeedback() : handleNav('/feedback')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800/70 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Mail Feedback to Author (Ambadipudi Rupavani)"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden xl:inline">Mail Feedback</span>
          </button>

          {/* Daily Streak */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-bold" title="Daily Practice Streak">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{user.streak}d</span>
          </div>

          {/* User XP Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold" title="Total Experience Points">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{user.xp} XP</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="global-theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
                <span className="sr-only">Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-180 duration-300" />
                <span className="sr-only">Switch to Dark Mode</span>
              </>
            )}
          </button>

          {/* User Profile Avatar / Auth Dropdown */}
          <div className="relative">
            {firebaseUser ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-indigo-400 transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center border border-indigo-200 dark:border-indigo-800 font-bold text-xs">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'RQ'}
                  </div>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log in</span>
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Level {user.level} Solver</span>
                    <span className="text-slate-500">{user.xp} XP</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => handleNav('/profile')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" /> Profile & Stats
                  </button>
                  <button
                    onClick={() => handleNav('/feedback')}
                    className="w-full px-4 py-2 text-left text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-2 font-semibold"
                  >
                    <Mail className="w-4 h-4 text-indigo-500" /> Mail Feedback to Author
                  </button>
                  <button
                    onClick={() => handleNav('/roadmap')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-slate-400" /> Learning Roadmap
                  </button>
                  <button
                    onClick={() => handleNav('/bookmarks')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4 text-slate-400" /> Bookmarks & Notes ({user.bookmarks.length})
                  </button>
                  <button
                    onClick={() => handleNav('/achievements')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Award className="w-4 h-4 text-slate-400" /> Achievements ({user.achievements.length})
                  </button>
                  <button
                    onClick={() => handleNav('/admin')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-amber-500" /> Admin Dashboard
                  </button>
                  <button
                    onClick={() => handleNav('/about')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <FileText className="w-4 h-4 text-slate-400" /> About & Author
                  </button>
                </div>

                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Role: <strong className="text-slate-900 dark:text-white uppercase">{user.role}</strong></span>
                  <button
                    onClick={() => setRole(user.role === 'admin' ? 'student' : 'admin')}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Switch to {user.role === 'admin' ? 'Student' : 'Admin'}
                  </button>
                </div>

                <div className="p-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenFeedback) onOpenFeedback();
              else handleNav('/feedback');
            }}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
          >
            <Mail className="w-4 h-4" />
            Mail Feedback to Author
          </button>

          <button
            onClick={() => handleNav('/ai-tutor')}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
          >
            <Bot className="w-4 h-4" />
            AI SQL Tutor
          </button>

          {/* Mobile Theme Switcher */}
          <button
            id="mobile-theme-toggle-btn"
            onClick={toggleTheme}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-xs text-slate-400 font-normal capitalize">Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
            {firebaseUser ? (
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user.name})
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold"
                >
                  <UserPlus className="w-4 h-4" />
                  Register Free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
