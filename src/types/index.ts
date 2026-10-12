export type UserRole = 'student' | 'admin';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemCategory =
  | 'SELECT'
  | 'WHERE'
  | 'ORDER BY'
  | 'GROUP BY'
  | 'HAVING'
  | 'JOIN'
  | 'Subquery'
  | 'CTE'
  | 'Window Functions'
  | 'Database Design';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  level: number;
  xp: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  solvedProblems: string[];
  completedQuizzes: { quizId: string; score: number; date: string }[];
  completedProjects: { projectId: string; completedTasks: string[] }[];
  bookmarks: { id: string; type: 'lesson' | 'problem' | 'interview' | 'cheatsheet'; title: string; link: string }[];
  notes: { id: string; title: string; content: string; topicId?: string; updatedAt: string }[];
  achievements: string[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  primaryKey?: boolean;
  foreignKey?: { table: string; column: string };
  nullable?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface TableSchema {
  name: string;
  description: string;
  columns: ColumnSchema[];
  sampleRows: Record<string, any>[];
}

export interface DatabaseSchema {
  id: string;
  name: string;
  category: string;
  description: string;
  tables: TableSchema[];
  initSql: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  durationMinutes: number;
  introduction: string;
  conceptExplanation: string;
  syntax: string;
  exampleQueries: {
    title: string;
    query: string;
    explanation: string;
    expectedResult: {
      columns: string[];
      values: any[][];
    };
  }[];
  commonMistakes: string[];
  bestPractices: string[];
  practiceQuestionIds?: string[];
  miniQuiz: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  };
}

export interface CourseModule {
  id: string;
  level: number;
  title: string;
  description: string;
  iconName: string;
  difficulty: Difficulty;
  lessons: Lesson[];
}

export interface TestCase {
  id: string;
  description: string;
  setupSql?: string;
  expectedQuery: string;
}

export interface PracticeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  topic: ProblemCategory;
  databaseId: string;
  estimatedMinutes: number;
  xpReward: number;
  initialSql: string;
  expectedQuery: string;
  hints: [string, string, string]; // Hint 1: Concept, Hint 2: Approach, Hint 3: Syntax
  solution: string;
  explanation: string;
  testCases: TestCase[];
  tags: string[];
}

export interface QueryResult {
  columns: string[];
  values: any[][];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

export interface ValidationResult {
  success: boolean;
  message: string;
  userResult?: QueryResult;
  expectedResult?: QueryResult;
  xpEarned?: number;
  diffSummary?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'output_prediction' | 'debug' | 'syntax';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: ProblemCategory;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
  xpReward: number;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  databaseId: string;
  initialSql: string;
  solutionQuery: string;
  hints: string[];
  xpReward: number;
}

export interface SqlProject {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  estimatedHours: number;
  problemStatement: string;
  requirements: string[];
  databaseId: string;
  tasks: ProjectTask[];
  skillsLearned: string[];
  xpReward: number;
}

export interface InterviewQuestion {
  id: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced' | 'Query-Based' | 'DBMS' | 'Scenario-Based' | 'Optimization';
  question: string;
  difficulty: Difficulty;
  answer: string;
  codeExample?: string;
  explanation: string;
  relatedTopic: ProblemCategory;
  commonFollowUps?: string[];
}

export interface CheatSheetEntry {
  id: string;
  category: string;
  title: string;
  syntax: string;
  example: string;
  explanation: string;
  commonMistake: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
  targetCount: number;
  type: 'problems' | 'streak' | 'lessons' | 'quizzes' | 'projects' | 'category';
  categoryKey?: string;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  databaseId: string;
  databaseName?: string;
  timestamp: string;
  executionTimeMs: number;
  rowCount: number;
  success: boolean;
  status?: string;
  error?: string;
}
