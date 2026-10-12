import { QuizQuestion } from '../types';

export interface AiRequestOptions {
  prompt: string;
  mode?: 'general' | 'explain' | 'hint' | 'review' | 'debug' | 'interview' | 'concept';
  context?: {
    problemTitle?: string;
    schema?: any;
    userQuery?: string;
    currentQuery?: string;
    databaseName?: string;
    errorMessage?: string;
  };
}

export interface AiResponse {
  text: string;
  source: 'gemini' | 'fallback' | 'fallback_on_error';
  note?: string;
  error?: string;
}

export interface GenerateQuizOptions {
  topicTitle: string;
  moduleId?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  count?: number;
  excludeQuestions?: string[];
  customTopic?: string;
}

export interface GenerateQuizResult {
  questions: QuizQuestion[];
  source: 'gemini' | 'fallback' | 'fallback_emergency';
  model?: string;
  topic?: string;
  timestamp?: string;
  error?: string;
}

export async function askAiTutor(options: AiRequestOptions): Promise<AiResponse> {
  try {
    const res = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    const data: AiResponse = await res.json();
    return data;
  } catch (error: any) {
    console.warn('AI request failed, using client-side safety fallback:', error);
    return {
      text: generateClientFallbackText(options),
      source: 'fallback_on_error',
      error: error.message,
      note: 'Offline AI assistant responded while backend connection was syncing.',
    };
  }
}

export async function generateAiQuiz(options: GenerateQuizOptions): Promise<GenerateQuizResult> {
  try {
    const res = await fetch('/api/ai/quiz-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    const data: GenerateQuizResult = await res.json();
    return data;
  } catch (error: any) {
    console.warn('Dynamic quiz generation error, using client fallback:', error);
    return {
      questions: generateClientFallbackQuiz(options),
      source: 'fallback',
      topic: options.topicTitle,
      error: error.message,
    };
  }
}

function generateClientFallbackQuiz(options: GenerateQuizOptions): QuizQuestion[] {
  const seed = Date.now();
  const variations: QuizQuestion[] = [
    {
      id: `client_gen_${seed}_1`,
      type: 'multiple_choice',
      question: `In SQL, which operator is strictly required to check if an attribute value is unknown or unassigned?`,
      options: ['IS NULL', '= NULL', '== NULL', 'NULL EQUALS'],
      correctAnswerIndex: 0,
      explanation: 'In ANSI SQL three-valued logic, comparison with = NULL evaluates to UNKNOWN. The IS NULL operator is required.',
      topic: 'WHERE',
    },
    {
      id: `client_gen_${seed}_2`,
      type: 'syntax',
      question: `What is the correct clause ordering for a complete analytical SQL query?`,
      options: [
        'SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY -> LIMIT',
        'FROM -> SELECT -> WHERE -> ORDER BY -> GROUP BY -> LIMIT',
        'SELECT -> WHERE -> FROM -> HAVING -> GROUP BY -> LIMIT',
        'SELECT -> FROM -> GROUP BY -> WHERE -> ORDER BY -> HAVING',
      ],
      correctAnswerIndex: 0,
      explanation: 'Standard SQL syntax order: SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY -> LIMIT.',
      topic: 'SELECT',
    },
    {
      id: `client_gen_${seed}_3`,
      type: 'output_prediction',
      question: `What does the query return when a table has 5 rows and 2 of them contain NULL in the 'score' column?`,
      codeSnippet: `SELECT COUNT(*), COUNT(score) FROM exam_results;`,
      options: ['5 and 3', '5 and 5', '3 and 3', '5 and 0'],
      correctAnswerIndex: 0,
      explanation: 'COUNT(*) counts total physical records (5). COUNT(column_name) counts only non-null occurrences (3).',
      topic: 'GROUP BY',
    },
    {
      id: `client_gen_${seed}_4`,
      type: 'multiple_choice',
      question: `Which type of JOIN guarantees that all rows from both tables are preserved in the final result set?`,
      options: ['FULL OUTER JOIN', 'LEFT JOIN', 'INNER JOIN', 'CROSS JOIN'],
      correctAnswerIndex: 0,
      explanation: 'A FULL OUTER JOIN retains all rows from both left and right relations, inserting NULLs for missing relationships.',
      topic: 'JOIN',
    },
  ];

  return variations.sort(() => Math.random() - 0.5);
}

function generateClientFallbackText(options: AiRequestOptions): string {
  const { mode = 'general', context = {} } = options;

  if (mode === 'hint') {
    return `### 💡 SQL Guide Hint
1. **Identify Relevant Tables**: Look at the schema relations (Primary & Foreign keys).
2. **Column Projections**: Write the \`SELECT\` columns explicitly.
3. **Filtering**: Add your \`WHERE\` predicates for row-level restrictions.
4. **Aggregation**: If computing totals or averages, pair \`GROUP BY\` with aggregate functions like \`COUNT()\`, \`SUM()\`, or \`AVG()\`.`;
  }

  if (mode === 'debug') {
    return `### 🛠️ SQL Error Diagnostic
- **Error Description**: ${context.errorMessage || 'Syntax or relational error'}
- **Tip 1**: Verify that column and table names are spelled accurately according to the active database schema.
- **Tip 2**: For string values, use single quotes (e.g., \`'Engineering'\`), not double quotes or raw text.
- **Tip 3**: Check for missing commas between selected columns in your \`SELECT\` clause.`;
  }

  if (mode === 'review' && context.userQuery) {
    return `### 🔍 SQL Query Evaluation
\`\`\`sql
${context.userQuery}
\`\`\`
- **Syntax Check**: Ensure all opened parentheses \`(\` are balanced and closed \`)\`.
- **Performance**: In multi-table JOINs, ensure foreign keys are indexed and specify filtering conditions early.
- **Standards**: Prefer explicit column aliasing (e.g., \`dept_name AS department\`) for readability.`;
  }

  return `### 🤖 RUPA's Query AI Tutor
Welcome! I am your AI SQL assistant. You can ask me to explain database concepts, review your query performance, give hints without spoiling answers, or explain SQL runtime errors.

**Popular topics you can ask me about:**
- *How does LEFT JOIN differ from INNER JOIN?*
- *When should I use a CTE (Common Table Expression) over a Subquery?*
- *How do Window Functions like \`ROW_NUMBER()\` and \`DENSE_RANK()\` work?*
- *What are the 3 Normal Forms (1NF, 2NF, 3NF)?*`;
}
