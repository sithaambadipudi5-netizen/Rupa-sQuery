import React, { useState } from 'react';
import { 
  Bookmark, 
  FileEdit, 
  Trash2, 
  ExternalLink, 
  Plus, 
  BookOpen, 
  CheckCircle2, 
  Award,
  User,
  Mail,
  Flame,
  Sparkles,
  Shield,
  LogOut,
  LogIn
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BookmarksAndNotesViewProps {
  navigate: (path: string) => void;
}

export const BookmarksAndNotesView: React.FC<BookmarksAndNotesViewProps> = ({ navigate }) => {
  const { user, firebaseUser, logout, toggleBookmark, deleteNote, addNote, resetProgress } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookmarks' | 'notes'>('profile');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleCreateNote = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    addNote(newTitle, newContent);
    setNewTitle('');
    setNewContent('');
    setShowAddNote(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-7 h-7 text-indigo-600 dark:text-indigo-400" /> Account Profile & Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your account credentials, cloud persistence, study bookmarks, and personal SQL notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Profile & Account
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Bookmarks ({user.bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Notes ({user.notes.length})
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User Card */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
            <div className="flex items-center gap-4">
              {firebaseUser?.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 dark:border-indigo-800"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold text-xl flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'RQ'}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {user.role}
                  </span>
                  {firebaseUser ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                      Cloud Synced
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800">
                      Guest Session
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Player Level</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">Level {user.level}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Experience Points</span>
                <strong className="text-slate-900 dark:text-white font-bold">{user.xp} XP</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Streak</span>
                <strong className="text-amber-600 dark:text-amber-400 font-bold">{user.streak} Days</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lessons Completed</span>
                <strong className="text-slate-900 dark:text-white font-bold">{user.completedLessons.length}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Problems Solved</span>
                <strong className="text-slate-900 dark:text-white font-bold">{user.solvedProblems.length}</strong>
              </div>
            </div>

            {/* Auth Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
              {firebaseUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out Account
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In to Sync Cloud Progress
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    Create Free Account
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cloud Synchronization & Security Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Cloud Database & Auth Status
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Authentication is powered by Google Firebase Auth with Google Identity Provider & Password encryption. Your learning records and query accomplishments sync to Firestore database securely.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Auth State</span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {firebaseUser ? 'Authenticated' : 'Guest (Local)'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Database Storage</span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    Firestore + SQLite WASM
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Reset */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Workspace Data Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Need a fresh start? Resetting progress clears completed lessons, quiz scores, and resets your XP level back to Level 1.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all your progress and XP? This action cannot be undone.')) {
                      resetProgress();
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                >
                  Reset All Learning Progress
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {user.bookmarks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No items bookmarked yet. Click the bookmark icon in any Lesson, Problem, or Interview Question to save it here!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {bm.type}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{bm.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(bm.link)}
                      className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleBookmark(bm)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddNote(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create New Note
            </button>
          </div>

          {showAddNote && (
            <div className="p-6 rounded-2xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 shadow-lg space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Create Study Note</h3>
              <input
                type="text"
                placeholder="Note Title (e.g. Window function frame clauses)..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <textarea
                rows={4}
                placeholder="Write your study notes, insights, syntax snippets..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAddNote(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {user.notes.length === 0 && !showAddNote ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No personal notes created yet. Click "Create New Note" to jot down your database insights.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{note.title}</h4>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
