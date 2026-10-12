import { UserProfile, QueryHistoryItem } from '../types';

const USER_STORAGE_KEY = 'rupa_query_user_profile_v1';
const HISTORY_STORAGE_KEY = 'rupa_query_sql_history_v1';

export const INITIAL_USER: UserProfile = {
  id: 'usr_1',
  name: 'Ambadipudi Rupavani',
  email: 'ambadipudirupavani28@gmail.com',
  role: 'student',
  level: 1,
  xp: 150,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: ['l_1_1', 'l_1_2'],
  solvedProblems: ['p_1', 'p_2'],
  completedQuizzes: [{ quizId: 'q_1', score: 100, date: new Date().toISOString().split('T')[0] }],
  completedProjects: [],
  bookmarks: [
    { id: 'b_1', type: 'lesson', title: 'Level 1: SELECT & FROM Fundamentals', link: '/lessons/l_1_1' },
    { id: 'b_2', type: 'problem', title: 'Find High-Earning Instructors', link: '/practice/p_1' },
  ],
  notes: [
    {
      id: 'n_1',
      title: 'SQL Clause Execution Order',
      content: '1. FROM & JOIN\n2. WHERE\n3. GROUP BY\n4. HAVING\n5. SELECT\n6. DISTINCT\n7. ORDER BY\n8. LIMIT',
      updatedAt: new Date().toISOString(),
    },
  ],
  achievements: ['ach_beginner', 'ach_first_query'],
};

export function loadUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load user profile from storage', e);
  }
  return INITIAL_USER;
}

export function saveUserProfile(user: UserProfile): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function loadQueryHistory(): QueryHistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load query history', e);
  }
  return [];
}

export function addQueryHistory(item: Omit<QueryHistoryItem, 'id' | 'timestamp'>): QueryHistoryItem[] {
  const history = loadQueryHistory();
  const newItem: QueryHistoryItem = {
    ...item,
    id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
  };

  const updated = [newItem, ...history.slice(0, 99)]; // keep latest 100
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history item', e);
  }
  return updated;
}

export const getQueryHistory = loadQueryHistory;

export function addQueryToHistory(item: {
  query: string;
  databaseName?: string;
  databaseId?: string;
  executionTimeMs: number;
  rowCount: number;
  status?: string;
  error?: string;
}): QueryHistoryItem[] {
  return addQueryHistory({
    query: item.query,
    databaseId: item.databaseId || 'university_db',
    databaseName: item.databaseName || item.databaseId || 'university_db',
    executionTimeMs: item.executionTimeMs,
    rowCount: item.rowCount,
    success: item.status === 'success' || !item.error,
    status: item.status || (item.error ? 'error' : 'success'),
    error: item.error,
  });
}

export function clearQueryHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}
