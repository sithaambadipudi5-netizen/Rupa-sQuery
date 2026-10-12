import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, UserRole } from '../types';
import { loadUserProfile, saveUserProfile } from '../services/storageService';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  FirebaseUser
} from '../services/firebase';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  user: UserProfile;
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setRole: (role: UserRole) => void;
  awardXp: (amount: number, reason?: string) => void;
  markLessonComplete: (lessonId: string) => void;
  markProblemSolved: (problemId: string, xp?: number) => void;
  recordQuizAttempt: (quizId: string, score: number) => void;
  toggleBookmark: (item: { id: string; type: 'lesson' | 'problem' | 'interview' | 'cheatsheet'; title: string; link: string }) => void;
  isBookmarked: (id: string) => boolean;
  addNote: (title: string, content: string, topicId?: string) => void;
  deleteNote: (id: string) => void;
  editNote: (id: string, title: string, content: string) => void;
  resetProgress: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;
  authorPhoto: string;
  updateAuthorPhoto: (dataUrl: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => loadUserProfile());
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('rupa_query_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authorPhoto, setAuthorPhoto] = useState<string>(() => {
    return localStorage.getItem('rupas_author_photo') || '/rupavani_profile.jpg';
  });

  const updateAuthorPhoto = async (dataUrl: string): Promise<boolean> => {
    try {
      setAuthorPhoto(dataUrl);
      localStorage.setItem('rupas_author_photo', dataUrl);
      await fetch('/api/upload-profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      });
      showToast('success', 'Photo Updated', 'Original picture set successfully across the website.');
      return true;
    } catch (err) {
      console.warn('Could not persist to server:', err);
      showToast('success', 'Photo Updated', 'Picture updated in your browser session.');
      return true;
    }
  };

  // Apply dark/light class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('rupa_query_theme', theme);
  }, [theme]);

  // Listen to Firebase Auth changes & sync with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            const cloudData = docSnap.data() as Partial<UserProfile>;
            setUser((prev) => {
              const merged: UserProfile = {
                ...prev,
                ...cloudData,
                id: fbUser.uid,
                email: fbUser.email || prev.email,
                name: fbUser.displayName || cloudData.name || prev.name,
                avatarUrl: fbUser.photoURL || undefined,
              };
              saveUserProfile(merged);
              return merged;
            });
          } else {
            // New user registration doc creation
            const initialDoc: UserProfile = {
              ...user,
              id: fbUser.uid,
              name: fbUser.displayName || user.name || 'SQL Learner',
              email: fbUser.email || user.email,
              avatarUrl: fbUser.photoURL || undefined,
            };
            await setDoc(userRef, initialDoc, { merge: true });
            setUser(initialDoc);
            saveUserProfile(initialDoc);
          }
        } catch (e) {
          console.warn('Firestore user fetch failed, using local profile state', e);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Persist user profile changes to local storage & Firestore if signed in
  useEffect(() => {
    saveUserProfile(user);

    if (firebaseUser && !authLoading) {
      const syncToCloud = async () => {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, user, { merge: true });
        } catch (e) {
          console.warn('Could not sync user profile to Firestore:', e);
        }
      };
      syncToCloud();
    }
  }, [user, firebaseUser, authLoading]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#34d399', '#f59e0b', '#ec4899'],
      });
    } catch (e) {
      console.log('Confetti trigger', e);
    }
  };

  const loginWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(userRef);
      
      let profileData: UserProfile;
      if (docSnap.exists()) {
        profileData = {
          ...user,
          ...(docSnap.data() as UserProfile),
          id: fbUser.uid,
          name: fbUser.displayName || 'SQL Learner',
          email: fbUser.email || '',
          avatarUrl: fbUser.photoURL || undefined,
        };
      } else {
        profileData = {
          ...user,
          id: fbUser.uid,
          name: fbUser.displayName || 'SQL Learner',
          email: fbUser.email || '',
          avatarUrl: fbUser.photoURL || undefined,
        };
        await setDoc(userRef, profileData);
      }
      setUser(profileData);
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = res.user;
      const userRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUser({
          ...user,
          ...(docSnap.data() as UserProfile),
          id: fbUser.uid,
          email: fbUser.email || email,
        });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setAuthLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = res.user;
      await updateProfile(fbUser, { displayName: name });
      
      const newProfile: UserProfile = {
        ...user,
        id: fbUser.uid,
        name: name,
        email: email,
      };
      
      const userRef = doc(db, 'users', fbUser.uid);
      await setDoc(userRef, newProfile);
      setUser(newProfile);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      showToast('info', 'Logged Out', 'You have been safely signed out.');
    } catch (e: any) {
      console.error('Logout error', e);
      showToast('error', 'Logout Error', e.message || 'Failed to sign out.');
    }
  };

  const calculateLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1;
  };

  const awardXp = (amount: number, reason?: string) => {
    setUser((prev) => {
      const newXp = prev.xp + amount;
      const oldLevel = prev.level;
      const newLevel = calculateLevel(newXp);
      const isLevelUp = newLevel > oldLevel;

      if (isLevelUp) {
        showToast('success', `🎉 Level Up! You reached Level ${newLevel}!`, `Keep up the momentum! Earned +${amount} XP.`);
        triggerConfetti();
      } else if (reason) {
        showToast('success', `+${amount} XP Earned!`, reason);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  const markLessonComplete = (lessonId: string) => {
    setUser((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const updatedLessons = [...prev.completedLessons, lessonId];
      awardXp(10, 'Lesson Completed');
      return {
        ...prev,
        completedLessons: updatedLessons,
      };
    });
  };

  const markProblemSolved = (problemId: string, xp = 20) => {
    setUser((prev) => {
      const isAlreadySolved = prev.solvedProblems.includes(problemId);
      if (!isAlreadySolved) {
        awardXp(xp, `Problem Solved: +${xp} XP`);
        triggerConfetti();
        return {
          ...prev,
          solvedProblems: [...prev.solvedProblems, problemId],
        };
      }
      return prev;
    });
  };

  const recordQuizAttempt = (quizId: string, score: number) => {
    setUser((prev) => {
      const updated = prev.completedQuizzes.filter((q) => q.quizId !== quizId);
      updated.push({ quizId, score, date: new Date().toISOString().split('T')[0] });
      awardXp(score >= 80 ? 30 : 15, `Quiz Completed with ${score}% score!`);
      return {
        ...prev,
        completedQuizzes: updated,
      };
    });
  };

  const setRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }));
    showToast('info', 'Role Updated', `Switched active mode to ${role.toUpperCase()}`);
  };

  const toggleBookmark = (item: { id: string; type: 'lesson' | 'problem' | 'interview' | 'cheatsheet'; title: string; link: string }) => {
    setUser((prev) => {
      const exists = prev.bookmarks.some((b) => b.id === item.id);
      if (exists) {
        showToast('info', 'Bookmark Removed', item.title);
        return { ...prev, bookmarks: prev.bookmarks.filter((b) => b.id !== item.id) };
      } else {
        showToast('success', 'Bookmark Saved', item.title);
        return { ...prev, bookmarks: [...prev.bookmarks, item] };
      }
    });
  };

  const isBookmarked = (id: string) => {
    return user.bookmarks.some((b) => b.id === id);
  };

  const addNote = (title: string, content: string, topicId?: string) => {
    const newNote = {
      id: 'note_' + Date.now(),
      title,
      content,
      topicId,
      updatedAt: new Date().toISOString(),
    };
    setUser((prev) => ({ ...prev, notes: [newNote, ...prev.notes] }));
    showToast('success', 'Note Created', title);
  };

  const deleteNote = (id: string) => {
    setUser((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
    showToast('info', 'Note Deleted', 'Note was removed.');
  };

  const editNote = (id: string, title: string, content: string) => {
    setUser((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n)),
    }));
    showToast('success', 'Note Updated', title);
  };

  const resetProgress = () => {
    const resetUser: UserProfile = {
      ...user,
      xp: 0,
      level: 1,
      streak: 1,
      completedLessons: [],
      solvedProblems: [],
      completedQuizzes: [],
      completedProjects: [],
      bookmarks: [],
      notes: [],
    };
    setUser(resetUser);
    showToast('info', 'Progress Reset', 'Your practice statistics and lessons have been reset.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        firebaseUser,
        authLoading,
        theme,
        toggleTheme,
        setRole,
        awardXp,
        markLessonComplete,
        markProblemSolved,
        recordQuizAttempt,
        toggleBookmark,
        isBookmarked,
        addNote,
        deleteNote,
        editNote,
        resetProgress,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        toasts,
        showToast,
        removeToast,
        triggerConfetti,
        authorPhoto,
        updateAuthorPhoto,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
