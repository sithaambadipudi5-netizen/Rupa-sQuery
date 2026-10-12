import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AiTutorChat } from './components/ai/AiTutorChat';
import { FeedbackModal } from './components/feedback/FeedbackModal';

// Page Views
import { LandingHome } from './pages/LandingHome';
import { DashboardView } from './pages/DashboardView';
import { CourseModuleView } from './pages/CourseModuleView';
import { PlaygroundView } from './pages/PlaygroundView';
import { PracticeHubView } from './pages/PracticeHubView';
import { QuizView } from './pages/QuizView';
import { ProjectsView } from './pages/ProjectsView';
import { InterviewHubView } from './pages/InterviewHubView';
import { CheatSheetView } from './pages/CheatSheetView';
import { BookmarksAndNotesView } from './pages/BookmarksAndNotesView';
import { RoadmapView } from './pages/RoadmapView';
import { AchievementsView } from './pages/AchievementsView';
import { AdminView } from './pages/AdminView';
import { AboutAuthorView } from './pages/AboutAuthorView';
import { LoginView } from './pages/LoginView';
import { RegisterView } from './pages/RegisterView';
import { FeedbackView } from './pages/FeedbackView';

const MainApp: React.FC = () => {
  // Path state with browser history synchronization
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // AI Tutor drawer state
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [aiContext, setAiContext] = useState<{
    query: string;
    error: string;
    dbName: string;
  }>({
    query: '',
    error: '',
    dbName: 'university_db',
  });

  // Global Feedback Modal state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openAiTutorWithContext = (query = '', error = '', dbName = 'university_db') => {
    setAiContext({ query, error, dbName });
    setIsAiTutorOpen(true);
  };

  // Simple Router
  const renderCurrentPage = () => {
    const path = currentPath.split('?')[0];

    // Auth Routes
    if (path === '/login' || path === '/signin') {
      return <LoginView navigate={navigate} />;
    }

    if (path === '/register' || path === '/signup') {
      return <RegisterView navigate={navigate} />;
    }

    // Feedback Route
    if (path === '/feedback' || path === '/contact') {
      return <FeedbackView navigate={navigate} />;
    }

    // Module / Lesson deep link handling
    if (path.startsWith('/courses')) {
      const parts = path.split('/');
      const modId = parts[2] || 'mod_1';
      const urlParams = new URLSearchParams(window.location.search);
      const lessonId = urlParams.get('lesson') || undefined;

      return (
        <CourseModuleView
          initialModuleId={modId}
          initialLessonId={lessonId}
          navigate={navigate}
          onOpenAiTutorWithContext={openAiTutorWithContext}
        />
      );
    }

    if (path.startsWith('/practice')) {
      const urlParams = new URLSearchParams(window.location.search);
      const probId = urlParams.get('problem') || undefined;
      return (
        <PracticeHubView
          initialProblemId={probId}
          navigate={navigate}
          onOpenAiTutorWithContext={openAiTutorWithContext}
        />
      );
    }

    if (path.startsWith('/playground')) {
      return (
        <PlaygroundView
          onOpenAiTutorWithContext={openAiTutorWithContext}
        />
      );
    }

    if (path.startsWith('/quizzes')) {
      const urlParams = new URLSearchParams(window.location.search);
      const qId = urlParams.get('module') || undefined;
      return <QuizView initialQuizId={qId} navigate={navigate} />;
    }

    if (path.startsWith('/projects')) {
      return <ProjectsView navigate={navigate} />;
    }

    if (path.startsWith('/interview')) {
      return (
        <InterviewHubView
          navigate={navigate}
          onOpenAiTutorWithContext={openAiTutorWithContext}
        />
      );
    }

    if (path.startsWith('/cheatsheet')) {
      return <CheatSheetView navigate={navigate} />;
    }

    if (path.startsWith('/bookmarks') || path.startsWith('/profile')) {
      return <BookmarksAndNotesView navigate={navigate} />;
    }

    if (path.startsWith('/roadmap')) {
      return <RoadmapView navigate={navigate} />;
    }

    if (path.startsWith('/achievements')) {
      return <AchievementsView />;
    }

    if (path.startsWith('/admin')) {
      return <AdminView />;
    }

    if (path.startsWith('/about')) {
      return <AboutAuthorView navigate={navigate} onOpenFeedback={() => setIsFeedbackOpen(true)} />;
    }

    if (path === '/ai-tutor') {
      return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gemini AI SQL Tutor</h2>
          <p className="text-xs text-slate-500">Your AI Tutor is accessible globally across all playgrounds and lessons.</p>
          <button
            onClick={() => setIsAiTutorOpen(true)}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Open AI Tutor Assistant Panel
          </button>
        </div>
      );
    }

    if (path === '/dashboard') {
      return (
        <DashboardView
          navigate={navigate}
          onOpenAiTutor={() => setIsAiTutorOpen(true)}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />
      );
    }

    // Default: Landing Home
    return (
      <LandingHome
        navigate={navigate}
        onOpenAiTutor={() => setIsAiTutorOpen(true)}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        currentPath={currentPath}
        navigate={navigate}
        onOpenAiTutor={() => setIsAiTutorOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      <Footer navigate={navigate} onOpenFeedback={() => setIsFeedbackOpen(true)} />

      {/* Global Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Global AI SQL Tutor Sliding Assistant */}
      <AiTutorChat
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        initialQuery={aiContext.query}
        initialError={aiContext.error}
        activeDatabase={aiContext.dbName}
      />

      {/* Global Toast Message Stack */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
