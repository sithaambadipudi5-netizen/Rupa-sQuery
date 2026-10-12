import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Server-Side Gemini AI initialization
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.warn("Failed to initialize Gemini AI Client:", err);
    }
  }
  return aiClient;
}

// Serve sql-wasm.wasm locally with proper MIME type
app.get(["/sql-wasm.wasm", "/assets/sql-wasm.wasm"], (_req, res) => {
  const localPublicWasm = path.join(process.cwd(), "public", "sql-wasm.wasm");
  const nodeModulesWasm = path.join(process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm");
  
  res.type("application/wasm");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  
  res.sendFile(localPublicWasm, (err) => {
    if (err) {
      res.sendFile(nodeModulesWasm, (err2) => {
        if (err2) {
          console.warn("Could not find local sql-wasm.wasm:", err2);
          res.status(404).send("WASM file not found");
        }
      });
    }
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "RUPA's Query",
    author: "Ambadipudi Rupavani",
    timestamp: new Date().toISOString(),
    aiAvailable: !!process.env.GEMINI_API_KEY,
  });
});

// Explicit handler for author profile picture to prevent stale browser caching and ensure correct MIME type
app.get(["/rupavani_profile.jpg", "/rupavani_profile.png"], (_req, res) => {
  const publicPath = path.join(process.cwd(), "public", "rupavani_profile.jpg");
  const distPath = path.join(process.cwd(), "dist", "rupavani_profile.jpg");
  const filePath = fs.existsSync(publicPath) ? publicPath : distPath;
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Image not found");
  }

  const buffer = fs.readFileSync(filePath);
  const isPng = buffer.length > 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  res.setHeader("Content-Type", isPng ? "image/png" : "image/jpeg");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.send(buffer);
});

// Save original user-uploaded profile photo with exact fidelity
app.post("/api/upload-profile-image", (req, res) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== "string") {
      return res.status(400).json({ error: "Missing dataUrl" });
    }
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(dataUrl, "base64");
    }
    
    const targetPath = path.join(process.cwd(), "public", "rupavani_profile.jpg");
    fs.writeFileSync(targetPath, buffer);

    const targetPng = path.join(process.cwd(), "public", "rupavani_profile.png");
    fs.writeFileSync(targetPng, buffer);

    const distPath = path.join(process.cwd(), "dist", "rupavani_profile.jpg");
    if (fs.existsSync(path.dirname(distPath))) {
      fs.writeFileSync(distPath, buffer);
      fs.writeFileSync(path.join(process.cwd(), "dist", "rupavani_profile.png"), buffer);
    }
    
    console.log(`Saved original profile image (${buffer.length} bytes) to ${targetPath}`);
    res.json({ success: true, size: buffer.length });
  } catch (err: any) {
    console.error("Failed to save profile image:", err);
    res.status(500).json({ error: err.message || "Failed to save image" });
  }
});

// AI SQL Tutor Endpoints
app.post("/api/ai/tutor", async (req, res) => {
  try {
    const { prompt, mode = "general", context = {} } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAiClient();
    if (!ai) {
      // Return smart structured fallback when API key is not configured
      return res.json({
        text: generateFallbackAiResponse(prompt, mode, context),
        source: "fallback",
        note: "Educational SQL Engine active.",
      });
    }

    let systemInstruction = `You are RUPA's Query AI SQL Tutor, an expert database and SQL instructor created for Ambadipudi Rupavani's SQL platform.
Your mission is to provide clear, practical, pedagogically sound, and friendly explanations.
Follow these rules:
1. Always format SQL queries in clean markdown \`\`\`sql blocks.
2. Highlight standard SQL best practices, performance implications, and readable styling.
3. Be encouraging, concise, and structured. Use bullet points or step-by-step breakdowns when explaining queries.
4. If reviewing a student's query, point out syntactic errors, logic issues, edge-case behavior (like NULL handling or duplicates), and offer an optimized version.
5. If giving a hint, DO NOT give away the complete solution query immediately; guide the student towards formulating it.`;

    if (mode === "explain") {
      systemInstruction += "\nMode: EXPLAIN CONCEPT. Break down the concept with intuitive analogies, syntax rules, and a simple real-world example.";
    } else if (mode === "hint") {
      systemInstruction += "\nMode: HINT GENERATOR. Give a progressive, Socratic hint. Don't provide the complete query solution.";
    } else if (mode === "review") {
      systemInstruction += "\nMode: QUERY REVIEW. Review the user's SQL for syntax, logic, performance, and style.";
    } else if (mode === "debug") {
      systemInstruction += "\nMode: ERROR DEBUGGER. Explain why the SQL query produced the given error message and how to fix it.";
    } else if (mode === "interview") {
      systemInstruction += "\nMode: SQL MOCK INTERVIEWER. Evaluate the answer like a senior database engineer conducting a technical interview.";
    }

    let userContent = `Mode: ${mode}\n`;
    if (context.problemTitle) userContent += `Problem: ${context.problemTitle}\n`;
    if (context.schema) userContent += `Schema: ${JSON.stringify(context.schema)}\n`;
    if (context.userQuery) userContent += `User SQL Query:\n\`\`\`sql\n${context.userQuery}\n\`\`\`\n`;
    if (context.errorMessage) userContent += `Error: ${context.errorMessage}\n`;
    userContent += `\nUser Question/Prompt: ${prompt}`;

    // Resilient multi-model fallback chain using current supported Gemini models
    const modelsToTry = ["gemini-3.7-flash", "gemini-2.5-flash", "gemini-flash-latest"];
    let responseText = "";
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userContent,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} encountered error or high demand, trying next model...`);
      }
    }

    if (responseText) {
      return res.json({
        text: responseText,
        source: "gemini",
      });
    }

    // If all models encountered spikes or errors, fallback to offline pedagogical engine
    return res.json({
      text: generateFallbackAiResponse(prompt, mode, context),
      source: "fallback_on_demand",
      note: lastError?.message || "High demand on live AI models. Switched smoothly to educational fallback.",
    });
  } catch (error: any) {
    console.warn("AI Tutor endpoint caught error:", error.message);
    return res.json({
      text: generateFallbackAiResponse(req.body?.prompt || "", req.body?.mode || "general", req.body?.context || {}),
      source: "fallback_on_error",
      note: "Offline guidance engine provided response.",
    });
  }
});

// Dynamic AI Quiz Generation Endpoint - Generates unique, changing questions on every quiz attempt
app.post("/api/ai/quiz-generate", async (req, res) => {
  try {
    const {
      topicTitle = "SQL Fundamentals",
      moduleId = "mod_1",
      difficulty = "Medium",
      count = 5,
      excludeQuestions = [],
      customTopic = "",
    } = req.body;

    const targetTopic = customTopic ? customTopic : topicTitle;
    const ai = getAiClient();

    if (ai) {
      const modelsToTry = ["gemini-3.7-flash", "gemini-2.5-flash", "gemini-flash-latest"];
      const promptText = `You are RUPA's Query AI Engine, an expert SQL curriculum designer.
Generate exactly ${count} completely fresh, unique, high-quality, and varied SQL quiz questions for the topic: "${targetTopic}".
Difficulty level: ${difficulty}.
Module Reference: ${moduleId}.

Requirements:
1. Every time you are called, you MUST generate NEW, DIFFERENT questions. Do not repeat standard cookie-cutter questions.
${excludeQuestions.length > 0 ? `Avoid repeating these recent question concepts/titles: ${JSON.stringify(excludeQuestions.slice(0, 10))}` : ""}
2. Mix multiple question types:
   - "multiple_choice" (deep conceptual understanding & edge cases)
   - "output_prediction" (give a realistic SQL query and sample table rows, ask what output or count is returned)
   - "debug" (present a subtle SQL syntax, aggregate, or logic error and ask which line/clause has the defect)
   - "syntax" (test correct keyword usage, clause ordering, join predicates, or window function syntax)
3. For output_prediction and debug questions, provide a realistic SQL query in the 'codeSnippet' field.
4. Each question MUST have EXACTLY 4 distinct, plausible options.
5. 'correctAnswerIndex' MUST be an integer from 0 to 3 corresponding to the correct answer.
6. Provide a clear, educational, and thorough explanation in 'explanation' breaking down why the correct option is right and why distractors are wrong.
7. Set 'topic' to one of: 'SELECT', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'Subquery', 'CTE', 'Window Functions', 'Database Design'.`;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: promptText,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                description: "Array of generated SQL quiz questions",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique question id like gen_q_1" },
                    type: {
                      type: Type.STRING,
                      description: "One of: multiple_choice, output_prediction, debug, syntax",
                    },
                    question: { type: Type.STRING, description: "The question or scenario prompt" },
                    codeSnippet: {
                      type: Type.STRING,
                      description: "SQL query or schema snippet if applicable, else empty string",
                    },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exactly 4 multiple choice options",
                    },
                    correctAnswerIndex: {
                      type: Type.INTEGER,
                      description: "0-indexed integer (0, 1, 2, or 3) of the correct option",
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "Detailed pedagogical explanation for the correct answer",
                    },
                    topic: {
                      type: Type.STRING,
                      description: "SQL topic category",
                    },
                  },
                  required: [
                    "id",
                    "type",
                    "question",
                    "options",
                    "correctAnswerIndex",
                    "explanation",
                    "topic",
                  ],
                },
              },
              temperature: 0.85, // Higher temperature ensures fresh varied questions each time
            },
          });

          if (response && response.text) {
            const parsedQuestions = JSON.parse(response.text);
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
              // Sanitize and ensure valid indices and ids
              const validatedQuestions = parsedQuestions.map((q: any, idx: number) => ({
                id: q.id || `ai_q_${Date.now()}_${idx}`,
                type: ["multiple_choice", "output_prediction", "debug", "syntax"].includes(q.type)
                  ? q.type
                  : "multiple_choice",
                question: q.question || `SQL Assessment Question ${idx + 1}`,
                codeSnippet: q.codeSnippet || undefined,
                options:
                  Array.isArray(q.options) && q.options.length >= 4
                    ? q.options.slice(0, 4)
                    : ["Option A", "Option B", "Option C", "Option D"],
                correctAnswerIndex:
                  typeof q.correctAnswerIndex === "number" &&
                  q.correctAnswerIndex >= 0 &&
                  q.correctAnswerIndex < 4
                    ? q.correctAnswerIndex
                    : 0,
                explanation: q.explanation || "Review the official SQL documentation for details.",
                topic: q.topic || "SELECT",
              }));

              return res.json({
                questions: validatedQuestions,
                source: "gemini",
                model: modelName,
                topic: targetTopic,
                timestamp: new Date().toISOString(),
              });
            }
          }
        } catch (genError: any) {
          console.warn(`Quiz generation model ${modelName} encountered error:`, genError.message);
        }
      }
    }

    // Dynamic Randomized Educational Engine fallback (always delivers fresh changing questions)
    const dynamicFallbackQuestions = generateDynamicFallbackQuiz(targetTopic, moduleId, difficulty, count);
    return res.json({
      questions: dynamicFallbackQuestions,
      source: "fallback",
      topic: targetTopic,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in /api/ai/quiz-generate:", error);
    const emergencyQuestions = generateDynamicFallbackQuiz("SQL Fundamentals", "mod_1", "Medium", 5);
    return res.json({
      questions: emergencyQuestions,
      source: "fallback_emergency",
      error: error.message,
    });
  }
});

// Dynamic Algorithmic Fallback Generator to ensure questions change on every attempt even offline
function generateDynamicFallbackQuiz(
  topicTitle: string,
  moduleId: string,
  difficulty: string,
  count: number = 5
): any[] {
  const seed = Date.now() + Math.floor(Math.random() * 10000);
  const tables = ["employees", "orders", "customers", "products", "students", "enrollments", "departments", "invoices"];
  const columns = ["salary", "total_amount", "gpa", "stock_quantity", "order_date", "unit_price", "rating", "score"];
  const depts = ["Engineering", "Marketing", "Data Science", "Finance", "Healthcare", "Operations", "AI Lab"];

  const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const questionPool = [
    () => {
      const tbl = randomItem(tables);
      const col = randomItem(columns);
      const val = randomNum(50, 500) * 10;
      return {
        id: `dyn_${seed}_1`,
        type: "output_prediction",
        question: `Given a table '${tbl}' with numeric column '${col}', what is the behavior of the following query when some rows contain NULL?`,
        codeSnippet: `SELECT COUNT(*), COUNT(${col}), AVG(${col})\nFROM ${tbl}\nWHERE ${col} > ${val} OR ${col} IS NULL;`,
        options: [
          `COUNT(*) includes NULL rows, but COUNT(${col}) and AVG(${col}) ignore NULL values.`,
          `All three functions COUNT(*), COUNT(${col}), and AVG(${col}) include NULL values in calculations.`,
          `The query produces a runtime syntax error because NULL cannot be filtered in WHERE with OR.`,
          `AVG(${col}) converts all NULL values to 0 before calculating the arithmetic mean.`,
        ],
        correctAnswerIndex: 0,
        explanation: `In standard SQL, COUNT(*) counts all rows regardless of NULLs. Column-specific aggregate functions like COUNT(col) and AVG(col) eliminate NULL values from aggregate calculations.`,
        topic: "GROUP BY",
      };
    },
    () => {
      const dept = randomItem(depts);
      const limitVal = randomNum(3, 10);
      return {
        id: `dyn_${seed}_2`,
        type: "syntax",
        question: `Which of the following queries correctly retrieves the top ${limitVal} highest-paid staff members in the '${dept}' department?`,
        options: [
          `SELECT name, salary FROM employees WHERE department = '${dept}' ORDER BY salary DESC LIMIT ${limitVal};`,
          `SELECT name, salary FROM employees ORDER BY salary DESC WHERE department = '${dept}' LIMIT ${limitVal};`,
          `SELECT TOP ${limitVal} name, salary FROM employees WHERE department = '${dept}' SORT BY salary HIGH;`,
          `SELECT name, salary FROM employees WHERE department = '${dept}' GROUP BY salary LIMIT ${limitVal} DESC;`,
        ],
        correctAnswerIndex: 0,
        explanation: `The valid standard SQL clause order is SELECT -> FROM -> WHERE -> ORDER BY -> LIMIT. In SQL, ORDER BY must appear after WHERE, and sorting direction is DESC.`,
        topic: "ORDER BY",
      };
    },
    () => {
      return {
        id: `dyn_${seed}_3`,
        type: "multiple_choice",
        question: `What distinguishes a LEFT JOIN from an INNER JOIN in relational database systems?`,
        options: [
          `LEFT JOIN retains all records from the left table even if there are no matching rows in the right table (filling missing right columns with NULL).`,
          `LEFT JOIN only returns records where matching keys exist strictly in both tables.`,
          `INNER JOIN is exclusively used for self-referencing tables, while LEFT JOIN is used for foreign keys.`,
          `LEFT JOIN always generates a Cartesian product of all rows regardless of the ON condition.`,
        ],
        correctAnswerIndex: 0,
        explanation: `A LEFT (OUTER) JOIN preserves all rows from the left table. When the join condition is not satisfied on the right table, NULL placeholders are returned for right table columns.`,
        topic: "JOIN",
      };
    },
    () => {
      const threshold = randomNum(2, 6);
      return {
        id: `dyn_${seed}_4`,
        type: "debug",
        question: `Why does the following SQL query fail to execute properly?`,
        codeSnippet: `SELECT department_id, COUNT(*) AS total_staff\nFROM employees\nWHERE COUNT(*) >= ${threshold}\nGROUP BY department_id;`,
        options: [
          `Aggregate functions like COUNT(*) cannot be used in the WHERE clause; they must be placed in a HAVING clause.`,
          `The GROUP BY clause must appear before the WHERE clause.`,
          `The column alias 'total_staff' is a reserved SQL keyword and must be removed.`,
          `The department_id column cannot be selected when using aggregate functions.`,
        ],
        correctAnswerIndex: 0,
        explanation: `The WHERE clause filters individual rows before any grouping or aggregation takes place. To filter on aggregate metrics (like COUNT(*) >= ${threshold}), you must use the HAVING clause.`,
        topic: "HAVING",
      };
    },
    () => {
      const winFuncs = [
        { name: "ROW_NUMBER()", desc: "assigns a unique sequential integer to each row without duplicate ranks" },
        { name: "RANK()", desc: "assigns identical ranks to ties and skips subsequent rank numbers" },
        { name: "DENSE_RANK()", desc: "assigns identical ranks to ties without skipping subsequent rank numbers" },
      ];
      const picked = randomItem(winFuncs);
      return {
        id: `dyn_${seed}_5`,
        type: "multiple_choice",
        question: `In modern SQL window analytical functions, which function ${picked.desc}?`,
        options: [
          picked.name,
          ...winFuncs.filter((w) => w.name !== picked.name).map((w) => w.name),
          "NTILE(4)",
        ].slice(0, 4),
        correctAnswerIndex: 0,
        explanation: `${picked.name} ${picked.desc} when partitioned and ordered over a specific window specification.`,
        topic: "Window Functions",
      };
    },
    () => {
      return {
        id: `dyn_${seed}_6`,
        type: "multiple_choice",
        question: `What is the primary benefit of Common Table Expressions (CTEs) declared using the WITH clause?`,
        options: [
          `They improve query modularity and readability by breaking complex subqueries into named temporary result sets.`,
          `They physically write temporary index files to permanent disk storage to boost hardware cache.`,
          `They permanently alter the underlying database schema and table definitions.`,
          `They automatically encrypt query parameters to prevent SQL injection at the network level.`,
        ],
        correctAnswerIndex: 0,
        explanation: `CTEs (Common Table Expressions) enhance query clarity, enable recursive tree traversal, and allow developers to structure complex multi-step transformations cleanly.`,
        topic: "CTE",
      };
    },
    () => {
      return {
        id: `dyn_${seed}_7`,
        type: "output_prediction",
        question: `What is the result of evaluating 'NULL = NULL' and 'NULL IS NULL' in three-valued SQL logic?`,
        codeSnippet: `SELECT \n  CASE WHEN NULL = NULL THEN 'Equal' ELSE 'Not Equal / Unknown' END AS check1,\n  CASE WHEN NULL IS NULL THEN 'True' ELSE 'False' END AS check2;`,
        options: [
          `check1 returns 'Not Equal / Unknown' and check2 returns 'True'`,
          `Both expressions evaluate to 'Equal' and 'True'`,
          `Both expressions evaluate to 'Not Equal' and 'False'`,
          `The query produces a fatal syntax comparison exception`,
        ],
        correctAnswerIndex: 0,
        explanation: `In standard SQL, NULL represents an unknown value. Comparing NULL = NULL evaluates to UNKNOWN (which is falsey in conditional CASE statements). Testing with 'IS NULL' correctly evaluates to TRUE.`,
        topic: "Database Design",
      };
    },
  ];

  // Shuffle pool and return count items
  const shuffled = questionPool.sort(() => Math.random() - 0.5);
  const generated = shuffled.slice(0, count).map((fn) => {
    const q = fn();
    // Randomly shuffle options and update correctAnswerIndex so the correct answer isn't always at index 0
    const originalOptions = [...q.options];
    const correctOption = originalOptions[q.correctAnswerIndex];
    const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(correctOption);
    return {
      ...q,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex,
    };
  });

  return generated;
}

// Helper for offline / fallback guidance
function generateFallbackAiResponse(prompt: string, mode: string, context: any): string {
  const p = prompt.toLowerCase();
  
  if (mode === "review" && context.userQuery) {
    const q = context.userQuery.trim().toUpperCase();
    let tips = [];
    if (!q.includes("SELECT")) tips.push("Ensure your query begins with a valid `SELECT` clause.");
    if (!q.includes("FROM") && !q.startsWith("SELECT 1")) tips.push("Specify the target table using `FROM <table>`.");
    if (q.includes("SELECT *") && !q.includes("COUNT(*)")) tips.push("In production, prefer selecting explicit column names instead of `SELECT *` for better network and memory efficiency.");
    if (q.includes("WHERE") && q.includes("NULL")) {
      if (q.includes("= NULL") || q.includes("!= NULL")) {
        tips.push("⚠️ Use `IS NULL` or `IS NOT NULL` instead of `= NULL` or `!= NULL` because comparison operators evaluate to UNKNOWN with NULL in standard three-valued SQL logic.");
      }
    }
    if (q.includes("JOIN") && !q.includes(" ON ")) {
      tips.push("⚠️ Ensure your `JOIN` specifies an explicit join condition with `ON <table1.col> = <table2.col>` to avoid accidental Cartesian products.");
    }
    
    return `### 🔍 SQL Query Analysis
**Query evaluated:**
\`\`\`sql
${context.userQuery}
\`\`\`

**Assessment:**
${tips.length > 0 ? tips.map(t => `- ${t}`).join("\n") : "✓ Syntax structure looks clean and properly formatted according to ANSI SQL standards."}

**Key Best Practice:**
- Test with edge-case rows (empty tables, duplicate values, and NULL attributes).
- Use clear table aliases (e.g., \`e\` for \`employees\`, \`d\` for \`departments\`) when joining multiple relations.`;
  }

  if (mode === "hint") {
    return `### 💡 SQL Tutor Hint
- **Step 1:** Identify the primary tables involved and look at their primary/foreign key connections.
- **Step 2:** Decide what filtering condition belongs in \`WHERE\` (row level) versus \`HAVING\` (aggregated group level).
- **Step 3:** Break the query down: write the simple \`SELECT ... FROM ... WHERE ...\` first, then add sorting (\`ORDER BY\`) or groupings (\`GROUP BY\`) step-by-step.`;
  }

  if (mode === "debug") {
    return `### 🛠️ SQL Debugging Guide
**Error noticed:** ${context.errorMessage || "Syntax/Execution issue"}

**Common causes in SQL:**
1. **Misspelled Column/Table Name:** Check the Schema explorer to confirm exact column spelling.
2. **Missing Quotes on Strings:** Ensure text values are wrapped in single quotes: \`'Finance'\`, not \`"Finance"\` or \`Finance\`.
3. **GROUP BY Mismatch:** In SQL, any column in your \`SELECT\` that is NOT inside an aggregate function (like \`SUM()\` or \`COUNT()\`) MUST be present in your \`GROUP BY\` clause.
4. **Ambiguous Column Name:** If querying multiple joined tables with identical column names (e.g. \`id\` or \`dept_id\`), prefix the column with the table name: \`employees.dept_id\`.`;
  }

  if (p.includes("join")) {
    return `### 🔗 SQL JOINs Explained

In relational databases, JOINs combine columns from one or more tables based on a related column:

- **INNER JOIN**: Returns only matching rows from both tables.
- **LEFT JOIN**: Returns all rows from the left table, and matching rows from the right table (unmatched columns will be \`NULL\`).
- **RIGHT JOIN**: Returns all rows from the right table, and matching rows from the left table.
- **FULL OUTER JOIN**: Returns all rows when there is a match in either left or right table.
- **CROSS JOIN**: Produces the Cartesian product of both tables.

\`\`\`sql
-- Example: Get all employees with their department names
SELECT 
    e.employee_id,
    e.first_name,
    e.salary,
    d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;
\`\`\``;
  }

  return `### 🎓 SQL Tutor Response
SQL (Structured Query Language) is the standard declarative language for interacting with relational database management systems (RDBMS).

**Key SQL Clauses Order of Execution:**
1. \`FROM\` & \`JOIN\` (Gathers the tables and joins them)
2. \`WHERE\` (Filters individual rows)
3. \`GROUP BY\` (Groups rows into buckets)
4. \`HAVING\` (Filters aggregated groups)
5. \`SELECT\` (Picks columns and expressions)
6. \`DISTINCT\` (Removes duplicate result rows)
7. \`ORDER BY\` (Sorts the resulting dataset)
8. \`LIMIT\` / \`OFFSET\` (Restricts the number of output rows)

Feel free to write any query in the **SQL Playground** or ask me to explain specific concepts like Window Functions, CTEs, Transactions, or Normalization!`;
}

// Start Express Server with Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === "production" || process.argv[1]?.endsWith("server.cjs");
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=========================================`);
    console.log(`🚀 RUPA's Query Platform is running!`);
    console.log(`🔗 Port: ${PORT} (0.0.0.0:${PORT})`);
    console.log(`👤 Author: Ambadipudi Rupavani`);
    console.log(`=========================================`);
  });
}

startServer();
