import { InterviewQuestion } from '../types';

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'int_1',
    category: 'Beginner',
    difficulty: 'Easy',
    question: 'What is the primary difference between DELETE, TRUNCATE, and DROP statements in SQL?',
    answer: `1. **DELETE**: A DML command that removes specific rows based on a WHERE clause. It fires database triggers, logs each deleted row in the transaction log, and can be rolled back within a transaction.
2. **TRUNCATE**: A DDL command that deallocates entire data pages to empty a table instantly. It is significantly faster than DELETE, does not fire row-level delete triggers, resets auto-increment identity counters, and cannot be filtered with a WHERE clause.
3. **DROP**: A DDL command that completely deletes both the table data AND the table schema definition itself from the database catalog.`,
    codeExample: `-- DELETE specific records (DML)
DELETE FROM employees WHERE dept_id = 10;

-- TRUNCATE all rows while keeping structure (DDL)
TRUNCATE TABLE audit_logs;

-- DROP entire table definition (DDL)
DROP TABLE temp_reports;`,
    explanation: 'Interviewers ask this question to evaluate your fundamental grasp of Data Manipulation (DML) versus Data Definition (DDL) and transaction logging performance.',
    relatedTopic: 'Database Design',
    commonFollowUps: [
      'Can a TRUNCATE statement be rolled back inside a transaction block in PostgreSQL or SQL Server?',
      'How does TRUNCATE affect foreign key constraints referencing the truncated table?',
    ],
  },
  {
    id: 'int_2',
    category: 'Intermediate',
    difficulty: 'Medium',
    question: 'What is the difference between WHERE and HAVING clauses in SQL, and what is their execution order?',
    answer: `The core distinction lies in **when** the filtering occurs in the SQL execution pipeline:
- **WHERE Clause**: Filters individual source rows **before** any grouping or aggregation takes place. It cannot contain aggregate functions like \`COUNT()\` or \`AVG()\`.
- **HAVING Clause**: Filters aggregated group buckets **after** the \`GROUP BY\` clause has grouped the rows. It is specifically designed to filter on aggregate expressions.

**Logical Execution Order:**
1. \`FROM\` & \`JOIN\`
2. \`WHERE\` (Row-level filter)
3. \`GROUP BY\` (Group creation)
4. \`HAVING\` (Aggregate group filter)
5. \`SELECT\` & Window Functions
6. \`DISTINCT\`
7. \`ORDER BY\`
8. \`LIMIT\` / \`OFFSET\``,
    codeExample: `SELECT 
    dept_id,
    AVG(salary) AS avg_salary
FROM employees
WHERE hire_date >= '2020-01-01'  -- WHERE filters rows before grouping
GROUP BY dept_id
HAVING AVG(salary) > 100000;      -- HAVING filters aggregated groups`,
    explanation: 'Understanding the logical query processing order is critical for writing performant queries and avoiding syntax errors when aggregating.',
    relatedTopic: 'HAVING',
  },
  {
    id: 'int_3',
    category: 'Advanced',
    difficulty: 'Hard',
    question: 'How do Window Functions differ from GROUP BY, and how do ROW_NUMBER(), RANK(), and DENSE_RANK() handle ties?',
    answer: `Unlike \`GROUP BY\` which collapses multiple rows into a single summary output row, **Window Functions perform calculations across a defined window frame while preserving the identity of each individual row**.

**Ties Handling:**
Assume salaries: [100k, 90k, 90k, 80k]
1. **ROW_NUMBER()**: Assigns strictly consecutive unique integers regardless of ties: \`1, 2, 3, 4\`.
2. **RANK()**: Assigns the same rank to identical values, then skips following ranks based on tie count (creates gaps): \`1, 2, 2, 4\`.
3. **DENSE_RANK()**: Assigns the same rank to identical values without skipping any subsequent ranks (no gaps): \`1, 2, 2, 3\`.`,
    codeExample: `SELECT 
    name,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,
    RANK() OVER (ORDER BY salary DESC) AS rnk,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rnk
FROM employees;`,
    explanation: 'Window functions are an industry standard in modern SQL for analytics, cumulative totals, pagination, and leaderboard rankings.',
    relatedTopic: 'Window Functions',
  },
  {
    id: 'int_4',
    category: 'Optimization',
    difficulty: 'Hard',
    question: 'What makes a query predicate non-SARGable, and how does it degrade database performance?',
    answer: `**SARGable** stands for **Search Argument Able**. A predicate is SARGable if the database engine can utilize an existing B-Tree index to perform an efficient index seek/range scan instead of a full table scan.

**Common Non-SARGable Anti-Patterns:**
1. **Functions on Indexed Columns**: \`WHERE UPPER(email) = 'USER@EXAMPLE.COM'\` or \`WHERE YEAR(created_at) = 2025\`.
2. **Wildcards at the Start of String**: \`WHERE name LIKE '%Smith'\` (forces full scan).
3. **Implicit Data Type Conversions**: Comparing a numeric column against a string literal or vice versa.
4. **Mathematical Expressions on Columns**: \`WHERE salary * 1.1 > 100000\` instead of \`WHERE salary > 100000 / 1.1\`.`,
    codeExample: `-- ❌ NON-SARGABLE (Forces Full Table Scan):
SELECT * FROM orders WHERE strftime('%Y', order_date) = '2025';

-- ✅ SARGABLE (Utilizes B-Tree Index on order_date):
SELECT * FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01';`,
    explanation: 'Database optimizers cannot use standard B-Tree index ordering when columns are wrapped inside mathematical operations or functions.',
    relatedTopic: 'Database Design',
  },
  {
    id: 'int_5',
    category: 'DBMS',
    difficulty: 'Hard',
    question: 'Explain the 4 ACID properties of relational transactions with real-world banking examples.',
    answer: `1. **Atomicity (All or Nothing)**: A fund transfer involves debiting Account A and crediting Account B. If the server crashes after debiting Account A, the entire transaction is rolled back so no money disappears.
2. **Consistency (Integrity Enforced)**: The database transitions from one valid state to another. Constraints (e.g. \`CHECK (balance >= 0)\`, foreign keys) are never violated.
3. **Isolation (Concurrent Safety)**: Concurrent transactions execute as if they were running serially. Intermediate states of uncommitted transactions are not visible to other transactions (preventing dirty reads).
4. **Durability (Permanent Storage)**: Once a transaction issues a COMMIT and receives success, all changes are written to persistent write-ahead logs (WAL) and survive power outages or system restarts.`,
    explanation: 'ACID guarantees form the foundation of enterprise transactional databases (OLTP).',
    relatedTopic: 'Database Design',
  },
  {
    id: 'int_6',
    category: 'Query-Based',
    difficulty: 'Medium',
    question: 'How do you find the N-th highest salary in a company using SQL?',
    answer: `There are two standard approaches:
1. **Using DENSE_RANK() (Recommended ANSI standard)**: Handles duplicate salaries gracefully and works for any N.
2. **Using LIMIT and OFFSET**: Simple and fast, but requires distinct values.`,
    codeExample: `-- Method 1: Using DENSE_RANK (Finds 3rd Highest Salary)
WITH RankedSalaries AS (
    SELECT 
        salary,
        DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
    FROM employees
)
SELECT DISTINCT salary 
FROM RankedSalaries 
WHERE rnk = 3;

-- Method 2: Using LIMIT / OFFSET
SELECT DISTINCT salary 
FROM employees 
ORDER BY salary DESC 
LIMIT 1 OFFSET 2; -- (N - 1 = 2 for 3rd highest)`,
    explanation: 'One of the most famous SQL technical interview coding challenges.',
    relatedTopic: 'Window Functions',
  },
];
