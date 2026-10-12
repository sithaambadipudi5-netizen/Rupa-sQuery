import { CourseModule } from '../types';

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'mod_1',
    level: 1,
    title: 'Level 1 — SQL Fundamentals',
    description: 'Master core database concepts, tables, columns, SELECT, WHERE, sorting, limits, and aliasing.',
    iconName: 'Database',
    difficulty: 'Easy',
    lessons: [
      {
        id: 'l_1_1',
        moduleId: 'mod_1',
        title: 'Introduction to SQL & Relational Databases',
        order: 1,
        durationMinutes: 10,
        introduction: 'Structured Query Language (SQL) is the standard international language for querying and modifying relational databases.',
        conceptExplanation: `A Relational Database Management System (RDBMS) organizes structured information into 2-dimensional tables consisting of **rows (records)** and **columns (fields/attributes)**.

Key foundational concepts:
- **Primary Key (PK)**: A column (or combination of columns) that uniquely identifies each individual row in a table (e.g., \`student_id\`, \`dept_id\`).
- **Foreign Key (FK)**: A column in one table that points to the Primary Key of another table, establishing a relation.
- **SQL Declarative Nature**: In SQL, you specify **what** data you want to retrieve, rather than writing procedural loops describing **how** to fetch it step-by-step.`,
        syntax: `SELECT column1, column2, ...
FROM table_name;`,
        exampleQueries: [
          {
            title: 'Selecting Specific Columns from Students',
            query: 'SELECT student_id, name, gpa FROM students;',
            explanation: 'Pulls the student identification number, full name, and GPA attributes from the students table.',
            expectedResult: {
              columns: ['student_id', 'name', 'gpa'],
              values: [
                [1001, 'Alice Walker', 3.85],
                [1002, 'Bob Chen', 3.42],
                [1003, 'Catherine Diaz', 3.91],
                [1004, 'David Kumar', 2.95],
                [1005, 'Emma Watson', 3.78],
                [1006, 'Frank Miller', 3.10],
                [1007, 'Grace Hopper Jr.', 3.95],
              ],
            },
          },
        ],
        commonMistakes: [
          'Confusing table names and column names.',
          'Missing comma between column names in the SELECT clause.',
          'Omitting the FROM keyword.',
        ],
        bestPractices: [
          'Explicitly list required column names instead of defaulting to SELECT * in production.',
          'Always use consistent uppercase casing for SQL keywords (SELECT, FROM, WHERE).',
        ],
        miniQuiz: {
          question: 'Which of the following uniquely identifies a row within a relational database table?',
          options: ['Foreign Key', 'Primary Key', 'Index Pointer', 'Schema Tag'],
          correctAnswerIndex: 1,
          explanation: 'A Primary Key enforces entity integrity and guarantees that each record in a table has a distinct identity.',
        },
      },
      {
        id: 'l_1_2',
        moduleId: 'mod_1',
        title: 'Filtering Rows with WHERE & Comparison Operators',
        order: 2,
        durationMinutes: 12,
        introduction: 'The WHERE clause restricts query results to only rows that satisfy a specified boolean condition or predicate.',
        conceptExplanation: `The WHERE clause is evaluated row-by-row after the FROM clause is processed.

Common comparison operators:
- \`=\` : Equal to
- \`<>\` or \`!=\` : Not equal to
- \`>\`, \`<\` : Greater than, Less than
- \`>=\`, \`<=\` : Greater than or equal, Less than or equal

Text literals and dates must always be enclosed in single quotes (\`'Computer Science'\`, \`'2025-01-01'\`), whereas numeric numbers do not require quotes (\`gpa > 3.5\`).`,
        syntax: `SELECT column1, column2
FROM table_name
WHERE condition;`,
        exampleQueries: [
          {
            title: 'Filter Honor Roll Students (GPA >= 3.8)',
            query: 'SELECT name, email, gpa FROM students WHERE gpa >= 3.80;',
            explanation: 'Extracts only student records where the numeric GPA attribute is at least 3.80.',
            expectedResult: {
              columns: ['name', 'email', 'gpa'],
              values: [
                ['Alice Walker', 'alice@univ.edu', 3.85],
                ['Catherine Diaz', 'catherine@univ.edu', 3.91],
                ['Grace Hopper Jr.', 'ghopper@univ.edu', 3.95],
              ],
            },
          },
        ],
        commonMistakes: [
          'Using double quotes instead of single quotes for string values.',
          'Attempting to filter aggregated values in WHERE instead of HAVING.',
        ],
        bestPractices: [
          'Place the most selective filtering condition early when feasible.',
          'Keep numeric values unquoted so database indexes can be utilized efficiently.',
        ],
        miniQuiz: {
          question: 'What is the correct syntax to filter employees with a salary greater than 100,000?',
          options: [
            "WHERE salary > '100,000'",
            'WHERE salary > 100000',
            'FILTER BY salary > 100000',
            'HAVING salary > 100000',
          ],
          correctAnswerIndex: 1,
          explanation: 'Numbers should not include commas or quotes. WHERE salary > 100000 is standard ANSI SQL.',
        },
      },
      {
        id: 'l_1_3',
        moduleId: 'mod_1',
        title: 'Sorting with ORDER BY & Limiting with LIMIT',
        order: 3,
        durationMinutes: 10,
        introduction: 'Learn how to sort query output in ascending (ASC) or descending (DESC) sequence and paginate results.',
        conceptExplanation: `By default, relational database tables store rows as unordered sets. The only way to guarantee a deterministic row order in query output is by specifying the \`ORDER BY\` clause.

- \`ASC\`: Ascending order (A to Z, lowest number to highest). This is default.
- \`DESC\`: Descending order (Z to A, highest number to lowest).
- \`LIMIT n\`: Returns only the first n records.
- \`OFFSET m\`: Skips the first m records (commonly used for web pagination).`,
        syntax: `SELECT column1, column2
FROM table_name
ORDER BY column1 [ASC | DESC], column2 [ASC | DESC]
LIMIT count [OFFSET skip_count];`,
        exampleQueries: [
          {
            title: 'Top 3 Highest Paid Instructors',
            query: 'SELECT name, salary, hire_date FROM instructors ORDER BY salary DESC LIMIT 3;',
            explanation: 'Sorts professors from highest salary to lowest and picks the top 3 entries.',
            expectedResult: {
              columns: ['name', 'salary', 'hire_date'],
              values: [
                ['Dr. Marie Curie', 130000, '2012-11-05'],
                ['Dr. Grace Hopper', 125000, '2014-01-10'],
                ['Dr. Alan Turing', 115000, '2016-08-15'],
              ],
            },
          },
        ],
        commonMistakes: [
          'Placing ORDER BY before the WHERE clause.',
          'Assuming the database returns rows in insertion order without an ORDER BY.',
        ],
        bestPractices: [
          'Always use ORDER BY when using LIMIT to ensure deterministic results.',
          'Sort on indexed columns for high-throughput production queries.',
        ],
        miniQuiz: {
          question: 'What is the default sorting direction if ASC or DESC is not specified in an ORDER BY clause?',
          options: ['Descending (DESC)', 'Ascending (ASC)', 'Random', 'Insertion Order'],
          correctAnswerIndex: 1,
          explanation: 'In SQL, ASC (Ascending) is always the default sorting direction.',
        },
      },
    ],
  },
  {
    id: 'mod_2',
    level: 2,
    title: 'Level 2 — Data Manipulation (DML)',
    description: 'Learn how to modify database records using INSERT, UPDATE, DELETE, and understand three-valued NULL logic.',
    iconName: 'Edit3',
    difficulty: 'Easy',
    lessons: [
      {
        id: 'l_2_1',
        moduleId: 'mod_2',
        title: 'Inserting New Records (INSERT INTO)',
        order: 1,
        durationMinutes: 10,
        introduction: 'The INSERT INTO statement is used to add new rows of data into a database table.',
        conceptExplanation: `When inserting rows, you can either provide values for all columns in their defined physical order, or specify explicit column names.

Best practice is to always specify target column names. This avoids breaking your code if table schemas are modified in the future with new columns.`,
        syntax: `INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);`,
        exampleQueries: [
          {
            title: 'Add a New Department',
            query: "INSERT INTO departments (dept_id, dept_name, building, budget) VALUES (6, 'Artificial Intelligence', 'Lovelace Center', 2000000);",
            explanation: 'Inserts a new AI department with ID 6 and $2,000,000 budget.',
            expectedResult: {
              columns: ['status'],
              values: [['Query executed successfully. (0 rows affected / no output returned)']],
            },
          },
        ],
        commonMistakes: [
          'Mismatch between the number of column names and values supplied.',
          'Violating PRIMARY KEY unique constraints by inserting duplicate IDs.',
        ],
        bestPractices: [
          'Always name the target columns in the INSERT statement.',
          'Wrap multi-row inserts in a single transaction for maximum speed.',
        ],
        miniQuiz: {
          question: 'What happens if you try to INSERT a row with a primary key that already exists?',
          options: [
            'It overwrites the existing row silently',
            'It creates a duplicate row',
            'It throws a Primary Key / Unique constraint violation error',
            'It sets the new key to NULL',
          ],
          correctAnswerIndex: 2,
          explanation: 'Relational database engines strictly enforce primary key uniqueness and reject duplicate keys.',
        },
      },
      {
        id: 'l_2_2',
        moduleId: 'mod_2',
        title: 'Updating & Deleting Records (UPDATE & DELETE)',
        order: 2,
        durationMinutes: 12,
        introduction: 'Learn how to safely modify existing rows and remove unwanted records.',
        conceptExplanation: `⚠️ **Crucial Warning:** If you execute an \`UPDATE\` or \`DELETE\` statement without a \`WHERE\` clause, **EVERY SINGLE ROW** in the table will be modified or removed!

- \`UPDATE\`: Modifies one or more column values in existing rows.
- \`DELETE FROM\`: Removes rows matching the WHERE criteria.`,
        syntax: `UPDATE table_name
SET column1 = value1, column2 = value2
WHERE condition;

DELETE FROM table_name
WHERE condition;`,
        exampleQueries: [
          {
            title: 'Grant a 10% Raise to Mathematics Instructors',
            query: 'UPDATE instructors SET salary = salary * 1.10 WHERE dept_id = 3;',
            explanation: 'Increases salary for all faculty in department 3 (Mathematics) by 10%.',
            expectedResult: {
              columns: ['status'],
              values: [['Query executed successfully. (0 rows affected / no output returned)']],
            },
          },
        ],
        commonMistakes: [
          'Executing UPDATE or DELETE without a WHERE clause, affecting all rows in the table.',
          'Using single equals sign in SET and forgetting commas between columns.',
        ],
        bestPractices: [
          'Run a SELECT with the exact same WHERE condition first before running UPDATE or DELETE.',
          'Always execute updates inside transactions in production environments.',
        ],
        miniQuiz: {
          question: 'What happens if you run "DELETE FROM students;" without a WHERE clause?',
          options: [
            'It deletes the first student row',
            'It produces a syntax error',
            'It deletes ALL rows in the students table',
            'It drops the entire table structure',
          ],
          correctAnswerIndex: 2,
          explanation: 'A DELETE without a WHERE condition removes all rows from the table while keeping the table structure intact.',
        },
      },
    ],
  },
  {
    id: 'mod_3',
    level: 3,
    title: 'Level 3 — Operators & Pattern Matching',
    description: 'Harness logical operators (AND, OR, NOT), ranges (BETWEEN), sets (IN), and wildcards (LIKE).',
    iconName: 'Filter',
    difficulty: 'Easy',
    lessons: [
      {
        id: 'l_3_1',
        moduleId: 'mod_3',
        title: 'Logical Operators (AND, OR, NOT) & Precedence',
        order: 1,
        durationMinutes: 12,
        introduction: 'Combine multiple filtering conditions using boolean algebra in SQL.',
        conceptExplanation: `When combining conditions:
- \`AND\` requires **both** conditions to be TRUE.
- \`OR\` requires **at least one** condition to be TRUE.
- \`NOT\` inverts a boolean evaluation.

**Operator Precedence**: In SQL, \`AND\` has higher precedence than \`OR\`. Always use parentheses \`()\` to enforce your intended logical grouping and avoid subtle bugs.`,
        syntax: `SELECT * FROM table_name
WHERE (cond1 OR cond2) AND cond3;`,
        exampleQueries: [
          {
            title: 'Instructors with high salary OR in Computer Science',
            query: 'SELECT name, dept_id, salary FROM instructors WHERE dept_id = 1 OR salary > 120000;',
            explanation: 'Finds instructors who either teach in CS (dept 1) or earn more than $120,000.',
            expectedResult: {
              columns: ['name', 'dept_id', 'salary'],
              values: [
                ['Dr. Alan Turing', 1, 115000],
                ['Dr. Grace Hopper', 1, 125000],
                ['Dr. Marie Curie', 5, 130000],
              ],
            },
          },
        ],
        commonMistakes: [
          'Forgetting parentheses when mixing AND and OR, leading to unintended evaluation order.',
        ],
        bestPractices: [
          'Always use explicit parentheses for compound boolean expressions.',
        ],
        miniQuiz: {
          question: 'Which operator has higher precedence in standard SQL evaluation?',
          options: ['OR', 'AND', 'Both have equal precedence', 'NOT is lowest'],
          correctAnswerIndex: 1,
          explanation: 'In SQL, AND evaluates before OR unless parentheses are used.',
        },
      },
      {
        id: 'l_3_2',
        moduleId: 'mod_3',
        title: 'BETWEEN, IN, and LIKE Pattern Matching',
        order: 2,
        durationMinutes: 12,
        introduction: 'Test ranges with BETWEEN, discrete sets with IN, and fuzzy text patterns with LIKE.',
        conceptExplanation: `Special SQL operators:
- \`BETWEEN low AND high\`: Inclusive range check (\`val >= low AND val <= high\`).
- \`IN (val1, val2, ...)\`: Checks if value exists in a discrete set or subquery.
- \`LIKE 'pattern'\`: Pattern matching with wildcards:
  - \`%\`: Matches zero, one, or multiple characters (e.g. \`'Dr.%'\` matches any name starting with Dr.).
  - \`_\`: Matches exactly one character.`,
        syntax: `SELECT * FROM table_name WHERE column BETWEEN a AND b;
SELECT * FROM table_name WHERE column IN ('val1', 'val2');
SELECT * FROM table_name WHERE column LIKE 'A%_';`,
        exampleQueries: [
          {
            title: 'Find Students with Name Starting with "A" or "C"',
            query: "SELECT student_id, name, email FROM students WHERE name LIKE 'A%' OR name LIKE 'C%';",
            explanation: 'Searches for students whose first name starts with letter A or C.',
            expectedResult: {
              columns: ['student_id', 'name', 'email'],
              values: [
                [1001, 'Alice Walker', 'alice@univ.edu'],
                [1003, 'Catherine Diaz', 'catherine@univ.edu'],
              ],
            },
          },
        ],
        commonMistakes: [
          'Assuming BETWEEN is exclusive (it is INCLUSIVE of both endpoints in SQL).',
          'Using * instead of % for SQL wildcard pattern matching.',
        ],
        bestPractices: [
          'Use IN instead of long chains of OR conditions for readability.',
          'Prefix searches like LIKE "abc%" can use indexes, whereas LIKE "%abc" requires full table scans.',
        ],
        miniQuiz: {
          question: 'Which wildcard in SQL matches exactly one single character?',
          options: ['%', '*', '_', '?'],
          correctAnswerIndex: 2,
          explanation: 'The underscore character (_) represents exactly one single character in SQL LIKE patterns.',
        },
      },
    ],
  },
  {
    id: 'mod_4',
    level: 4,
    title: 'Level 4 — SQL Built-in Functions',
    description: 'Aggregate functions (COUNT, SUM, AVG, MIN, MAX), string manipulation, numeric math, and date arithmetic.',
    iconName: 'FunctionSquare',
    difficulty: 'Medium',
    lessons: [
      {
        id: 'l_4_1',
        moduleId: 'mod_4',
        title: 'Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)',
        order: 1,
        durationMinutes: 14,
        introduction: 'Aggregate functions compute a single summary result from multiple row values.',
        conceptExplanation: `Core aggregates:
- \`COUNT(*)\`: Counts all rows, including NULLs and duplicates.
- \`COUNT(column)\`: Counts only non-NULL values in that column.
- \`COUNT(DISTINCT column)\`: Counts distinct non-NULL values.
- \`SUM(column)\`: Computes the mathematical sum of numeric values (ignores NULLs).
- \`AVG(column)\`: Computes the arithmetic mean (ignores NULLs).
- \`MIN(column)\` / \`MAX(column)\`: Returns smallest / largest value.`,
        syntax: `SELECT 
    COUNT(*) AS total_rows,
    AVG(salary) AS avg_salary,
    MAX(salary) AS max_salary
FROM table_name;`,
        exampleQueries: [
          {
            title: 'Faculty Salary Statistics',
            query: 'SELECT COUNT(*) AS total_professors, ROUND(AVG(salary), 2) AS avg_salary, MIN(salary) AS min_salary, MAX(salary) AS max_salary FROM instructors;',
            explanation: 'Calculates the total faculty count, rounded average salary, minimum and maximum salaries.',
            expectedResult: {
              columns: ['total_professors', 'avg_salary', 'min_salary', 'max_salary'],
              values: [[6, 115000.0, 92000, 130000]],
            },
          },
        ],
        commonMistakes: [
          'Using aggregate functions in a WHERE clause without a subquery.',
          'Forgetting that AVG() ignores NULL values rather than treating them as 0.',
        ],
        bestPractices: [
          'Always assign meaningful column aliases with AS when using aggregate expressions.',
          'Use COUNT(1) or COUNT(*) for general row counting.',
        ],
        miniQuiz: {
          question: 'What does COUNT(column_name) do when some rows contain NULL values in that column?',
          options: [
            'Counts the NULL rows as 0',
            'Throws an error',
            'Ignores the NULL rows and counts non-NULL values only',
            'Counts every row regardless of NULL',
          ],
          correctAnswerIndex: 2,
          explanation: 'COUNT(column_name) counts only rows where the specified column is NOT NULL.',
        },
      },
      {
        id: 'l_4_2',
        moduleId: 'mod_4',
        title: 'String & Mathematical Functions',
        order: 2,
        durationMinutes: 12,
        introduction: 'Transform text and numbers using UPPER, LOWER, LENGTH, CONCAT, SUBSTR, and ROUND.',
        conceptExplanation: `Common String Functions:
- \`UPPER(str)\`, \`LOWER(str)\`: Converts case.
- \`LENGTH(str)\`: Character count.
- \`SUBSTR(str, start, len)\`: Extracts substring.
- \`TRIM(str)\`: Removes leading and trailing whitespace.
- String concatenation: \`CONCAT(a, b)\` or standard SQL pipe operator \`a || ' ' || b\`.

Common Numeric Functions:
- \`ROUND(num, decimals)\`: Rounds to nearest decimal place.
- \`ABS(num)\`: Absolute value.
- \`CEIL(num)\` / \`FLOOR(num)\`: Rounds up / down to nearest integer.`,
        syntax: `SELECT UPPER(name) AS upper_name, ROUND(price, 1) FROM table_name;`,
        exampleQueries: [
          {
            title: 'Format Student Directory Display',
            query: "SELECT student_id, UPPER(name) AS formatted_name, LOWER(email) AS clean_email, ROUND(gpa, 1) AS approx_gpa FROM students LIMIT 3;",
            explanation: 'Demonstrates UPPER(), LOWER(), and ROUND() formatting functions.',
            expectedResult: {
              columns: ['student_id', 'formatted_name', 'clean_email', 'approx_gpa'],
              values: [
                [1001, 'ALICE WALKER', 'alice@univ.edu', 3.9],
                [1002, 'BOB CHEN', 'bob@univ.edu', 3.4],
                [1003, 'CATHERINE DIAZ', 'catherine@univ.edu', 3.9],
              ],
            },
          },
        ],
        commonMistakes: [
          'Assuming 0-indexed string indexing in SQL (SQL string indexing starts at 1, not 0).',
        ],
        bestPractices: [
          'Use LOWER() or UPPER() on both sides of comparisons for case-insensitive matching if the collation is case-sensitive.',
        ],
        miniQuiz: {
          question: 'In standard SQL, what is the 1-based index position of the first character in SUBSTRING("DATABASE", 1, 4)?',
          options: ['0', '1', '-1', 'Undefined'],
          correctAnswerIndex: 1,
          explanation: 'SQL string functions are 1-indexed. SUBSTR("DATABASE", 1, 4) returns "DATA".',
        },
      },
    ],
  },
  {
    id: 'mod_5',
    level: 5,
    title: 'Level 5 — Grouping & Aggregations',
    description: 'Partition data buckets with GROUP BY, filter aggregated metrics with HAVING, and understand WHERE vs HAVING.',
    iconName: 'Layers',
    difficulty: 'Medium',
    lessons: [
      {
        id: 'l_5_1',
        moduleId: 'mod_5',
        title: 'Grouping Data with GROUP BY',
        order: 1,
        durationMinutes: 14,
        introduction: 'The GROUP BY clause collapses rows sharing identical values in specified columns into summary groups.',
        conceptExplanation: `When using \`GROUP BY\`, every column in your \`SELECT\` clause must either:
1. Be listed in the \`GROUP BY\` clause, OR
2. Be wrapped inside an aggregate function (e.g., \`COUNT()\`, \`AVG()\`, \`SUM()\`).

This rule prevents ambiguity, ensuring the database engine knows how to resolve values for each group bucket.`,
        syntax: `SELECT dept_id, COUNT(*) AS num_employees, AVG(salary) AS avg_sal
FROM employees
GROUP BY dept_id;`,
        exampleQueries: [
          {
            title: 'Student Count and Average GPA by Department',
            query: 'SELECT dept_id, COUNT(*) AS student_count, ROUND(AVG(gpa), 2) AS avg_gpa FROM students GROUP BY dept_id ORDER BY student_count DESC;',
            explanation: 'Groups students by their major department to compute enrollment size and mean academic GPA.',
            expectedResult: {
              columns: ['dept_id', 'student_count', 'avg_gpa'],
              values: [
                [1, 3, 3.46],
                [2, 1, 3.91],
                [3, 1, 2.95],
                [4, 1, 3.78],
                [5, 1, 3.95],
              ],
            },
          },
        ],
        commonMistakes: [
          'Selecting a non-aggregated column that is not present in the GROUP BY clause.',
        ],
        bestPractices: [
          'Group by primary key identifiers or indexed columns for high performance.',
        ],
        miniQuiz: {
          question: 'If a query has "SELECT department, job_title, AVG(salary)", what MUST be in the GROUP BY clause?',
          options: [
            'Only department',
            'Only job_title',
            'Both department and job_title',
            'No GROUP BY is required',
          ],
          correctAnswerIndex: 2,
          explanation: 'All non-aggregated columns in the SELECT list (department and job_title) must be in the GROUP BY clause.',
        },
      },
      {
        id: 'l_5_2',
        moduleId: 'mod_5',
        title: 'Filtering Groups with HAVING (WHERE vs HAVING)',
        order: 2,
        durationMinutes: 14,
        introduction: 'Filter aggregated summary groups using the HAVING clause.',
        conceptExplanation: `Difference between WHERE and HAVING:
- **WHERE**: Filters **individual rows** BEFORE any grouping or aggregation takes place. Cannot contain aggregate functions.
- **HAVING**: Filters **aggregated groups** AFTER grouping is calculated. Typically contains aggregate conditions like \`HAVING COUNT(*) > 5\`.

Execution lifecycle:
\`FROM\` ➔ \`WHERE\` ➔ \`GROUP BY\` ➔ \`HAVING\` ➔ \`SELECT\` ➔ \`ORDER BY\``,
        syntax: `SELECT dept_id, COUNT(*) AS total_students
FROM students
GROUP BY dept_id
HAVING COUNT(*) >= 2;`,
        exampleQueries: [
          {
            title: 'Departments with Multiple Students',
            query: 'SELECT dept_id, COUNT(*) AS total_students, ROUND(AVG(gpa), 2) AS avg_gpa FROM students GROUP BY dept_id HAVING COUNT(*) >= 2;',
            explanation: 'Filters for departments having 2 or more enrolled students.',
            expectedResult: {
              columns: ['dept_id', 'total_students', 'avg_gpa'],
              values: [[1, 3, 3.46]],
            },
          },
        ],
        commonMistakes: [
          'Putting row-level filters in HAVING instead of WHERE (hurts query performance).',
          'Attempting to use aggregate functions in the WHERE clause.',
        ],
        bestPractices: [
          'Filter out unwanted rows as early as possible using WHERE before grouping with HAVING.',
        ],
        miniQuiz: {
          question: 'Which clause is used to filter groups based on the result of aggregate functions like COUNT() or SUM()?',
          options: ['WHERE', 'HAVING', 'GROUP BY', 'FILTER BY'],
          correctAnswerIndex: 1,
          explanation: 'HAVING is specifically designed to filter aggregated group metrics after GROUP BY has executed.',
        },
      },
    ],
  },
  {
    id: 'mod_6',
    level: 6,
    title: 'Level 6 — Relational JOINs',
    description: 'Connect related tables with INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, CROSS JOIN, and SELF JOIN.',
    iconName: 'GitMerge',
    difficulty: 'Medium',
    lessons: [
      {
        id: 'l_6_1',
        moduleId: 'mod_6',
        title: 'INNER JOIN & Table Aliases',
        order: 1,
        durationMinutes: 15,
        introduction: 'INNER JOIN combines records from two tables whenever there is a matching value in both relations.',
        conceptExplanation: `An **INNER JOIN** searches both tables and returns only rows that meet the join condition in the \`ON\` clause.

\`\`\`
Table A (Instructors)          Table B (Departments)
+--------------+---------+     +---------+-------------------+
| name         | dept_id |     | dept_id | dept_name         |
+--------------+---------+     +---------+-------------------+
| Alan Turing  | 1       | <-> | 1       | Computer Science  |
+--------------+---------+     +---------+-------------------+
             INNER JOIN on dept_id
\`\`\`

Always use short, descriptive table aliases (e.g. \`i\` for instructors, \`d\` for departments) to avoid verbose queries.`,
        syntax: `SELECT a.col1, b.col2
FROM table_a a
INNER JOIN table_b b ON a.fk_id = b.pk_id;`,
        exampleQueries: [
          {
            title: 'Instructors with Department Names',
            query: 'SELECT i.name AS instructor_name, d.dept_name, i.salary FROM instructors i INNER JOIN departments d ON i.dept_id = d.dept_id ORDER BY i.salary DESC;',
            explanation: 'Joins instructors with departments using the shared dept_id foreign key.',
            expectedResult: {
              columns: ['instructor_name', 'dept_name', 'salary'],
              values: [
                ['Dr. Marie Curie', 'Physics', 130000],
                ['Dr. Grace Hopper', 'Computer Science', 125000],
                ['Dr. Alan Turing', 'Computer Science', 115000],
                ['Dr. Nikola Tesla', 'Electrical Engineering', 108000],
                ['Dr. Carl Gauss', 'Mathematics', 98000],
                ['Prof. Adam Smith', 'Business Administration', 92000],
              ],
            },
          },
        ],
        commonMistakes: [
          'Forgetting the ON clause, resulting in a Cartesian product (CROSS JOIN).',
          'Ambiguous column references when selecting identical column names from both tables without prefixes.',
        ],
        bestPractices: [
          'Always prefix selected columns with their respective table aliases.',
          'Ensure joined columns have corresponding database indexes.',
        ],
        miniQuiz: {
          question: 'What does an INNER JOIN return when a row in Table A has no matching key in Table B?',
          options: [
            'Returns the row with NULL for Table B columns',
            'Excludes the row completely from the result set',
            'Throws a referential constraint error',
            'Fills Table B columns with 0',
          ],
          correctAnswerIndex: 1,
          explanation: 'INNER JOIN returns only rows that have matching values in both tables; unmatched rows are discarded.',
        },
      },
      {
        id: 'l_6_2',
        moduleId: 'mod_6',
        title: 'LEFT JOIN & Handling NULLs',
        order: 2,
        durationMinutes: 15,
        introduction: 'LEFT JOIN returns all rows from the left table, and matched rows from the right table (with NULLs for unmatched rows).',
        conceptExplanation: `A **LEFT OUTER JOIN** (or LEFT JOIN) guarantees that **every row from the left table is preserved** in the result set, even if no corresponding match exists in the right table.

If no match exists, all columns from the right table are filled with \`NULL\`.

This makes LEFT JOIN ideal for finding missing records (e.g. "Find students who have NEVER enrolled in any course").`,
        syntax: `SELECT a.name, b.course_id
FROM students a
LEFT JOIN enrollments b ON a.student_id = b.student_id;`,
        exampleQueries: [
          {
            title: 'Courses and Assigned Instructors (Including Unassigned)',
            query: 'SELECT c.course_id, c.title, i.name AS instructor_name FROM courses c LEFT JOIN instructors i ON c.instructor_id = i.instructor_id;',
            explanation: 'Preserves all courses even if an instructor has not been assigned yet.',
            expectedResult: {
              columns: ['course_id', 'title', 'instructor_name'],
              values: [
                ['CS101', 'Intro to Database Systems', 'Dr. Alan Turing'],
                ['CS201', 'Data Structures & Algorithms', 'Dr. Grace Hopper'],
                ['EE101', 'Circuit Analysis', 'Dr. Nikola Tesla'],
                ['MATH201', 'Linear Algebra', 'Dr. Carl Gauss'],
                ['BUS301', 'Financial Management', 'Prof. Adam Smith'],
                ['PHYS101', 'Quantum Mechanics I', 'Dr. Marie Curie'],
              ],
            },
          },
        ],
        commonMistakes: [
          'Adding a WHERE condition on the right table without checking for NULLs, accidentally converting the LEFT JOIN into an INNER JOIN.',
        ],
        bestPractices: [
          'To find orphaned records, use: LEFT JOIN right_table ON ... WHERE right_table.pk IS NULL.',
        ],
        miniQuiz: {
          question: 'How do you find rows in Table A that have NO corresponding match in Table B?',
          options: [
            'INNER JOIN ... WHERE B.id IS NOT NULL',
            'LEFT JOIN B ON A.id = B.id WHERE B.id IS NULL',
            'CROSS JOIN B WHERE A.id != B.id',
            'FULL JOIN B WHERE A.id = B.id',
          ],
          correctAnswerIndex: 1,
          explanation: 'LEFT JOIN combined with "WHERE B.id IS NULL" filters for rows from Table A with no matches in Table B.',
        },
      },
    ],
  },
  {
    id: 'mod_7',
    level: 7,
    title: 'Level 7 — Subqueries & Nested Queries',
    description: 'Single-row subqueries, multi-row subqueries, correlated subqueries, and the EXISTS operator.',
    iconName: 'GitPullRequest',
    difficulty: 'Medium',
    lessons: [
      {
        id: 'l_7_1',
        moduleId: 'mod_7',
        title: 'Single-Row & Multi-Row Subqueries',
        order: 1,
        durationMinutes: 15,
        introduction: 'A subquery is a SQL query nested inside a parent SELECT, INSERT, UPDATE, or DELETE statement.',
        conceptExplanation: `Subquery types:
1. **Scalar / Single-Row Subquery**: Returns exactly one value (1 row, 1 column). Used with standard comparison operators (\`=\`, \`>\`, \`<\`). Example: \`WHERE salary > (SELECT AVG(salary) FROM employees)\`.
2. **Multi-Row Subquery**: Returns multiple rows of a single column. Used with \`IN\`, \`ANY\`, or \`ALL\`.
3. **Table Subquery / Derived Table**: Subquery in the \`FROM\` clause acting as a temporary in-memory table (must have a table alias).`,
        syntax: `SELECT name, salary
FROM instructors
WHERE salary > (SELECT AVG(salary) FROM instructors);`,
        exampleQueries: [
          {
            title: 'Instructors Earning Above Department Average',
            query: 'SELECT name, salary FROM instructors WHERE salary > (SELECT AVG(salary) FROM instructors) ORDER BY salary DESC;',
            explanation: 'Uses a scalar subquery to filter instructors earning above the overall average faculty compensation ($115,000).',
            expectedResult: {
              columns: ['name', 'salary'],
              values: [
                ['Dr. Marie Curie', 130000],
                ['Dr. Grace Hopper', 125000],
              ],
            },
          },
        ],
        commonMistakes: [
          'Using single-value comparison operators (=) with a subquery that returns multiple rows.',
          'Forgetting to alias derived tables in the FROM clause.',
        ],
        bestPractices: [
          'Prefer JOINs or CTEs over deeply nested subqueries for readability and optimizer planning.',
        ],
        miniQuiz: {
          question: 'Which operator should you use when a subquery returns multiple candidate rows for comparison?',
          options: ['=', 'IN', 'LIKE', 'BETWEEN'],
          correctAnswerIndex: 1,
          explanation: 'The IN operator tests whether a value matches any member of a list or multi-row subquery result set.',
        },
      },
      {
        id: 'l_7_2',
        moduleId: 'mod_7',
        title: 'Correlated Subqueries & EXISTS Operator',
        order: 2,
        durationMinutes: 16,
        introduction: 'Correlated subqueries reference columns from the outer query, evaluating once per outer row.',
        conceptExplanation: `Unlike independent subqueries, a **correlated subquery** relies on values from the outer query for its evaluation.

The \`EXISTS\` operator tests for the existence of rows returned by a subquery:
- Returns \`TRUE\` as soon as the first matching row is found (short-circuit evaluation).
- Extremely fast for semi-join existence checks.`,
        syntax: `SELECT s.name
FROM students s
WHERE EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.student_id = s.student_id AND e.grade = 'A'
);`,
        exampleQueries: [
          {
            title: 'Students Who Earned at least One "A" Grade',
            query: "SELECT s.student_id, s.name, s.email FROM students s WHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.student_id AND e.grade = 'A');",
            explanation: 'Checks if there exists at least one enrollment record with grade A for each student.',
            expectedResult: {
              columns: ['student_id', 'name', 'email'],
              values: [
                [1001, 'Alice Walker', 'alice@univ.edu'],
                [1003, 'Catherine Diaz', 'catherine@univ.edu'],
                [1005, 'Emma Watson', 'emma@univ.edu'],
                [1007, 'Grace Hopper Jr.', 'ghopper@univ.edu'],
              ],
            },
          },
        ],
        commonMistakes: [
          'Writing SELECT * in EXISTS subqueries when SELECT 1 is clearer and standard.',
        ],
        bestPractices: [
          'Use EXISTS instead of IN when checking existence on large datasets with potential NULLs.',
        ],
        miniQuiz: {
          question: 'What is the primary advantage of the EXISTS operator in SQL?',
          options: [
            'It sorts the results automatically',
            'It stops scanning as soon as the first matching row is found (short-circuit evaluation)',
            'It calculates aggregate sums',
            'It eliminates all NULL values',
          ],
          correctAnswerIndex: 1,
          explanation: 'EXISTS returns TRUE as soon as a single row matches in the subquery, making it highly optimized.',
        },
      },
    ],
  },
  {
    id: 'mod_8',
    level: 8,
    title: 'Level 8 — Advanced SQL: CTEs & Window Functions',
    description: 'Master Common Table Expressions (WITH / CTE), CASE expressions, and Analytic Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG).',
    iconName: 'Sparkles',
    difficulty: 'Hard',
    lessons: [
      {
        id: 'l_8_1',
        moduleId: 'mod_8',
        title: 'Common Table Expressions (WITH / CTE)',
        order: 1,
        durationMinutes: 16,
        introduction: 'A CTE is a temporary named result set defined at the beginning of a query with the WITH clause.',
        conceptExplanation: `CTEs significantly improve SQL readability by breaking complex multi-stage transformations into modular, logical steps.

Benefits of CTEs:
- **Readability**: Replaces nested subquery spaghetti with sequential step definitions.
- **Reusability**: A CTE can be referenced multiple times within the subsequent query.
- **Recursion**: Recursive CTEs can traverse hierarchical tree structures (like organization charts or bill-of-materials).`,
        syntax: `WITH HighEarners AS (
    SELECT name, salary, dept_id
    FROM instructors
    WHERE salary > 100000
)
SELECT h.name, d.dept_name, h.salary
FROM HighEarners h
JOIN departments d ON h.dept_id = d.dept_id;`,
        exampleQueries: [
          {
            title: 'Department Budget Summary Using CTE',
            query: 'WITH DeptStats AS (SELECT dept_id, COUNT(*) AS num_instructors, AVG(salary) AS avg_sal FROM instructors GROUP BY dept_id) SELECT d.dept_name, d.budget, COALESCE(s.num_instructors, 0) AS faculty_count, ROUND(COALESCE(s.avg_sal, 0), 2) AS avg_faculty_salary FROM departments d LEFT JOIN DeptStats s ON d.dept_id = s.dept_id ORDER BY d.budget DESC;',
            explanation: 'Aggregates faculty statistics inside a CTE before joining with departments.',
            expectedResult: {
              columns: ['dept_name', 'budget', 'faculty_count', 'avg_faculty_salary'],
              values: [
                ['Computer Science', 1500000, 2, 120000.0],
                ['Electrical Engineering', 1200000, 1, 108000.0],
                ['Business Administration', 1100000, 1, 92000.0],
                ['Physics', 950000, 1, 130000.0],
                ['Mathematics', 800000, 1, 98000.0],
              ],
            },
          },
        ],
        commonMistakes: [
          'Using a comma instead of WITH for subsequent independent queries without chaining.',
        ],
        bestPractices: [
          'Use CTEs to structure readable data pipelines rather than writing 4-level deep subqueries.',
        ],
        miniQuiz: {
          question: 'What keyword begins a Common Table Expression in SQL?',
          options: ['LET', 'WITH', 'DEFINE', 'TABLE'],
          correctAnswerIndex: 1,
          explanation: 'The WITH keyword initiates one or more Common Table Expressions (CTEs).',
        },
      },
      {
        id: 'l_8_2',
        moduleId: 'mod_8',
        title: 'Window Functions (ROW_NUMBER, RANK, DENSE_RANK)',
        order: 2,
        durationMinutes: 18,
        introduction: 'Window functions calculate calculations across a set of table rows related to the current row without collapsing them into a single row.',
        conceptExplanation: `Unlike GROUP BY which aggregates rows into a single summary record, **Window Functions retain each individual row** while calculating running totals, rankings, moving averages, or offsets.

Key Ranking Functions:
- \`ROW_NUMBER() OVER (ORDER BY col)\`: Assigns a unique sequential integer (1, 2, 3, 4...).
- \`RANK() OVER (ORDER BY col)\`: Assigns ranks with gaps on ties (1, 2, 2, 4...).
- \`DENSE_RANK() OVER (ORDER BY col)\`: Assigns ranks without gaps on ties (1, 2, 2, 3...).
- \`PARTITION BY col\`: Resets the calculation window per partition category.`,
        syntax: `SELECT 
    name,
    salary,
    dept_id,
    DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dept_salary_rank
FROM instructors;`,
        exampleQueries: [
          {
            title: 'Overall Faculty Salary Rankings with Window Functions',
            query: 'SELECT name, salary, dept_id, ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num, DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank FROM instructors;',
            explanation: 'Computes continuous rank numbers for instructors across the entire institution.',
            expectedResult: {
              columns: ['name', 'salary', 'dept_id', 'row_num', 'salary_rank'],
              values: [
                ['Dr. Marie Curie', 130000, 5, 1, 1],
                ['Dr. Grace Hopper', 125000, 1, 2, 2],
                ['Dr. Alan Turing', 115000, 1, 3, 3],
                ['Dr. Nikola Tesla', 108000, 2, 4, 4],
                ['Dr. Carl Gauss', 98000, 3, 5, 5],
                ['Prof. Adam Smith', 92000, 4, 6, 6],
              ],
            },
          },
        ],
        commonMistakes: [
          'Attempting to filter window function values directly in the WHERE clause (you must wrap them in a CTE or subquery).',
        ],
        bestPractices: [
          'Use PARTITION BY to calculate category-specific rankings and running metrics cleanly.',
        ],
        miniQuiz: {
          question: 'If two rows tie for 2nd place, what rank does DENSE_RANK() assign to the next following row?',
          options: ['4th', '3rd', '2nd', '5th'],
          correctAnswerIndex: 1,
          explanation: 'DENSE_RANK() produces no gaps in ranking numbers, so after a tie at 2, the next rank is 3.',
        },
      },
    ],
  },
  {
    id: 'mod_9',
    level: 9,
    title: 'Level 9 — Database Design & ER Modeling',
    description: 'Entity-Relationship concepts, primary and composite keys, referential constraints, and 1:1, 1:N, N:M relationship architectures.',
    iconName: 'Network',
    difficulty: 'Medium',
    lessons: [
      {
        id: 'l_9_1',
        moduleId: 'mod_9',
        title: 'Entity-Relationship Modeling & Cardinality',
        order: 1,
        durationMinutes: 15,
        introduction: 'Database design defines the structural blueprint of entities, attributes, and relationships in a system.',
        conceptExplanation: `Cardinality Relationships:
1. **One-to-One (1:1)**: E.g., A User has one UserProfile. Implemented via unique foreign key.
2. **One-to-Many (1:N)**: E.g., A Department has many Instructors. Implemented by placing \`dept_id\` as a foreign key in the child \`instructors\` table.
3. **Many-to-Many (N:M)**: E.g., Students and Courses. Implemented using an intermediate **Junction / Associative Table** (\`enrollments\`) containing foreign keys pointing to both entities.`,
        syntax: `CREATE TABLE junction_table (
    student_id INT REFERENCES students(student_id),
    course_id VARCHAR REFERENCES courses(course_id),
    PRIMARY KEY (student_id, course_id)
);`,
        exampleQueries: [
          {
            title: 'Verify Many-to-Many Relationship via Junction Table',
            query: 'SELECT s.name AS student, c.title AS course, e.grade FROM enrollments e JOIN students s ON e.student_id = s.student_id JOIN courses c ON e.course_id = c.course_id ORDER BY s.name;',
            explanation: 'Queries the associative junction table resolving student-to-course enrollments.',
            expectedResult: {
              columns: ['student', 'course', 'grade'],
              values: [
                ['Alice Walker', 'Intro to Database Systems', 'A'],
                ['Alice Walker', 'Linear Algebra', 'A'],
                ['Bob Chen', 'Intro to Database Systems', 'B'],
                ['Catherine Diaz', 'Circuit Analysis', 'A'],
                ['David Kumar', 'Linear Algebra', 'C'],
                ['Emma Watson', 'Financial Management', 'A'],
                ['Frank Miller', 'Intro to Database Systems', null],
                ['Grace Hopper Jr.', 'Quantum Mechanics I', 'A'],
              ],
            },
          },
        ],
        commonMistakes: [
          'Attempting to model Many-to-Many relationships with comma-separated string IDs instead of a junction table.',
        ],
        bestPractices: [
          'Always use composite primary keys or unique constraint pairs on junction tables to prevent duplicate associations.',
        ],
        miniQuiz: {
          question: 'How is a Many-to-Many (N:M) relationship properly implemented in a relational database?',
          options: [
            'By storing an array of IDs in a single column',
            'Using an intermediate Junction / Associative Table with foreign keys',
            'By duplicating the parent table',
            'Through recursive views',
          ],
          correctAnswerIndex: 1,
          explanation: 'Junction tables break N:M relationships into two clean 1:N relationships, maintaining 1NF compliance.',
        },
      },
    ],
  },
  {
    id: 'mod_10',
    level: 10,
    title: 'Level 10 — Database Normalization',
    description: 'Understand 1NF, 2NF, 3NF, BCNF, data anomalies (insertion, deletion, update), and intentional denormalization.',
    iconName: 'CheckCircle2',
    difficulty: 'Hard',
    lessons: [
      {
        id: 'l_10_1',
        moduleId: 'mod_10',
        title: '1NF, 2NF, 3NF & Boyce-Codd Normal Form (BCNF)',
        order: 1,
        durationMinutes: 18,
        introduction: 'Normalization is the systematic technique of organizing relational database schema to minimize data redundancy and prevent anomalies.',
        conceptExplanation: `The Three Core Normal Forms:
- **First Normal Form (1NF)**:
  - Each column contains atomic (indivisible) values.
  - No repeating groups or arrays.
  - Unique primary key identifies each row.
- **Second Normal Form (2NF)**:
  - Meets 1NF.
  - No partial dependencies (all non-key attributes must depend on the *entire* candidate key, not just a subset of a composite key).
- **Third Normal Form (3NF)**:
  - Meets 2NF.
  - No transitive dependencies (non-key columns must not depend on other non-key columns: *"Every column must depend on the key, the whole key, and nothing but the key, so help me Codd"*).`,
        syntax: `/* Normalized 3NF Schema Architecture */
CREATE TABLE departments (dept_id INT PK, dept_name TEXT);
CREATE TABLE employees (emp_id INT PK, name TEXT, dept_id INT FK);`,
        exampleQueries: [
          {
            title: 'Verify 3NF Normalized Department Linkage',
            query: 'SELECT d.dept_name, COUNT(i.instructor_id) AS faculty_count FROM departments d LEFT JOIN instructors i ON d.dept_id = i.dept_id GROUP BY d.dept_name ORDER BY faculty_count DESC;',
            explanation: 'Demonstrates cleanly normalized data queries free of transitive duplication.',
            expectedResult: {
              columns: ['dept_name', 'faculty_count'],
              values: [
                ['Computer Science', 2],
                ['Business Administration', 1],
                ['Electrical Engineering', 1],
                ['Mathematics', 1],
                ['Physics', 1],
              ],
            },
          },
        ],
        commonMistakes: [
          'Storing concatenated multi-value strings in a single field (violates 1NF).',
          'Duplicating department location attributes in employee rows (violates 3NF).',
        ],
        bestPractices: [
          'Normalize to 3NF by default for transactional OLTP systems; consider star-schema denormalization for analytics (OLAP).',
        ],
        miniQuiz: {
          question: 'What type of functional dependency does Third Normal Form (3NF) strictly eliminate?',
          options: ['Partial Dependency', 'Transitive Dependency', 'Atomic Dependency', 'Foreign Dependency'],
          correctAnswerIndex: 1,
          explanation: '3NF removes transitive dependencies where a non-key column depends on another non-key column.',
        },
      },
    ],
  },
  {
    id: 'mod_11',
    level: 11,
    title: 'Level 11 — Transactions & Concurrency (ACID)',
    description: 'Learn ACID guarantees (Atomicity, Consistency, Isolation, Durability), COMMIT, ROLLBACK, SAVEPOINT, and locking.',
    iconName: 'ShieldCheck',
    difficulty: 'Hard',
    lessons: [
      {
        id: 'l_11_1',
        moduleId: 'mod_11',
        title: 'ACID Properties & Transaction Control',
        order: 1,
        durationMinutes: 16,
        introduction: 'A transaction is a single logical unit of work that must either succeed completely or fail completely with zero side-effects.',
        conceptExplanation: `The ACID Guarantees:
- **Atomicity**: All operations in the transaction succeed, or all are rolled back ("All or Nothing").
- **Consistency**: Database transitions from one valid state to another, preserving all schema integrity constraints.
- **Isolation**: Concurrent transactions execute without interfering with one another.
- **Durability**: Once committed, changes survive system crashes and power failures.

Control Commands:
- \`BEGIN TRANSACTION\` / \`START TRANSACTION\`
- \`COMMIT\`: Persists changes permanently.
- \`ROLLBACK\`: Discards all modifications back to the transaction start.`,
        syntax: `BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 500 WHERE account_id = 'ACC-1001';
UPDATE accounts SET balance = balance + 500 WHERE account_id = 'ACC-2001';
COMMIT;`,
        exampleQueries: [
          {
            title: 'Verify Account Balances for Safe Transfer Ledger',
            query: "SELECT account_id, cust_id, balance FROM accounts WHERE account_id IN ('ACC-1001', 'ACC-2001');",
            explanation: 'Reads current balances before and after simulated atomic transaction ledger transfers.',
            expectedResult: {
              columns: ['account_id', 'cust_id', 'balance'],
              values: [
                ['ACC-1001', 101, 14250.5],
                ['ACC-2001', 102, 8940.2],
              ],
            },
          },
        ],
        commonMistakes: [
          'Leaving transactions open indefinitely in code, locking rows and causing database deadlocks.',
        ],
        bestPractices: [
          'Keep transactions as brief as possible, performing data preparation before opening the transaction.',
        ],
        miniQuiz: {
          question: 'Which ACID property guarantees that all operations within a transaction succeed completely or none take effect?',
          options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
          correctAnswerIndex: 0,
          explanation: 'Atomicity ensures all-or-nothing execution of a transaction.',
        },
      },
    ],
  },
  {
    id: 'mod_12',
    level: 12,
    title: 'Level 12 — Performance & Query Optimization',
    description: 'B-Tree Indexes, EXPLAIN QUERY PLAN, index selection strategy, SARGability, and query tuning techniques.',
    iconName: 'Zap',
    difficulty: 'Hard',
    lessons: [
      {
        id: 'l_12_1',
        moduleId: 'mod_12',
        title: 'Indexes, EXPLAIN QUERY PLAN & SARGable Predicates',
        order: 1,
        durationMinutes: 18,
        introduction: 'Indexes are specialized data structures (typically B-Trees) that allow database engines to locate rows in logarithmic O(log N) time.',
        conceptExplanation: `Indexing & Query Optimization Principles:
1. **B-Tree Index**: Great for equality (\`=\`), range (\`BETWEEN\`, \`<\`, \`>\`), and prefix (\`LIKE 'ABC%'\`) queries.
2. **Composite Indexes & Leftmost Prefix Rule**: An index on \`(dept_id, salary)\` can accelerate queries on \`dept_id\` alone or both, but not \`salary\` alone.
3. **SARGability (Search Argument Able)**:
   - ❌ Non-SARGable: \`WHERE UPPER(email) = 'ALICE@UNIV.EDU'\` (Function prevents index usage on email).
   - ✅ SARGable: \`WHERE email = 'alice@univ.edu'\` or functional index.
4. **EXPLAIN QUERY PLAN**: Inspects whether the query engine performs an efficient **INDEX SCAN** or an expensive full **TABLE SCAN**.`,
        syntax: `CREATE INDEX idx_students_dept ON students(dept_id);
EXPLAIN QUERY PLAN SELECT * FROM students WHERE dept_id = 1;`,
        exampleQueries: [
          {
            title: 'Inspect Execution Plan on Indexed Department Lookups',
            query: 'EXPLAIN QUERY PLAN SELECT s.name, d.dept_name FROM students s JOIN departments d ON s.dept_id = d.dept_id WHERE s.dept_id = 1;',
            explanation: 'Uses EXPLAIN QUERY PLAN to display the query optimizer search strategy.',
            expectedResult: {
              columns: ['id', 'parent', 'notused', 'detail'],
              values: [
                [2, 0, 0, 'SEARCH departments USING INTEGER PRIMARY KEY (rowid=?)'],
                [5, 0, 0, 'SCAN students'],
              ],
            },
          },
        ],
        commonMistakes: [
          'Over-indexing every column (slows down INSERT, UPDATE, and DELETE operations).',
          'Wrapping indexed columns in mathematical or string functions inside the WHERE clause.',
        ],
        bestPractices: [
          'Always index foreign keys and columns frequently used in WHERE, JOIN, and ORDER BY clauses.',
          'Run EXPLAIN QUERY PLAN on slow queries before making schema changes.',
        ],
        miniQuiz: {
          question: 'Why does writing "WHERE YEAR(order_date) = 2025" hurt query performance compared to "WHERE order_date BETWEEN ..."?',
          options: [
            'YEAR() is not a valid SQL function',
            'Wrapping the column in a function prevents the database from using a standard index on order_date (non-SARGable)',
            'BETWEEN is always slower than equality',
            'It causes a memory leak',
          ],
          correctAnswerIndex: 1,
          explanation: 'Applying a function to an indexed column makes the predicate non-SARGable, forcing a full table scan across all rows.',
        },
      },
    ],
  },
];
