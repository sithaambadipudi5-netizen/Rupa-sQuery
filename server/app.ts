import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import { RagStorage } from "./rag/storage";
import { parseDocumentFile, detectFileType } from "./rag/parsers";
import { chunkExtractedSections } from "./rag/chunker";
import { generateBatchEmbeddings } from "./rag/embeddings";
import { upsertChunksToVectorStore, deleteDocumentVectors, getVectorStoreStats } from "./rag/vectorStore";
import { executeRagChat } from "./rag/langgraphRag";
import { runRagAccuracyEvaluation } from "./rag/evaluator";
import { seedInitialDocumentsIfNeeded } from "./rag/seed";
import { UploadedDocumentRecord } from "./rag/types";
import { callGeminiWithResilience } from "./rag/geminiResilience";

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
app.get(["/health", "/api/health"], (_req, res) => {
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

// Configure Multer for Secure Multi-Format Document Ingestion
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, RagStorage.getUploadDir());
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${sanitizedBase}_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    const allowed = ["pdf", "docx", "txt", "md", "pptx", "xlsx", "csv", "json", "html"];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file format .${ext}. Supported formats: ${allowed.join(", ")}`));
    }
  },
});

// Helper for asynchronous background document ingestion
async function processDocumentAsync(docRecord: UploadedDocumentRecord): Promise<void> {
  try {
    const ai = getAiClient();
    const parseResult = await parseDocumentFile(
      docRecord.filePath,
      docRecord.originalName,
      docRecord.mimeType,
      ai
    );

    const chunks = chunkExtractedSections(
      parseResult.sections,
      docRecord.id,
      docRecord.name,
      docRecord.userId,
      { chunkSize: 750, chunkOverlap: 100 }
    );

    if (chunks.length === 0) {
      RagStorage.updateDocumentStatus(
        docRecord.id,
        "error",
        0,
        "Document contained no extractable textual content."
      );
      return;
    }

    const texts = chunks.map((c) => c.content);
    const embeddings = await generateBatchEmbeddings(texts, ai);

    chunks.forEach((c, idx) => {
      c.embedding = embeddings[idx];
    });

    RagStorage.saveChunks(docRecord.id, chunks);
    await upsertChunksToVectorStore(chunks, embeddings);

    RagStorage.updateDocumentStatus(docRecord.id, "ready", chunks.length, undefined, {
      pageCount: parseResult.pageCount,
      slideCount: parseResult.slideCount,
      sheetNames: parseResult.sheetNames,
    });

    console.log(`Successfully processed document "${docRecord.name}" (${chunks.length} chunks indexed)`);
  } catch (err: any) {
    console.error(`Error processing document "${docRecord.name}":`, err);
    RagStorage.updateDocumentStatus(docRecord.id, "error", 0, err.message || "Failed to parse document");
  }
}

// RAG Document Upload Endpoint (supports single or multiple files)
app.post("/api/rag/documents/upload", upload.array("files", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const userId = (req.body.userId as string) || "default_user";
    const uploadedRecords: UploadedDocumentRecord[] = [];

    for (const file of files) {
      const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fileType = detectFileType(file.originalname, file.mimetype);

      const record: UploadedDocumentRecord = {
        id: docId,
        userId,
        name: file.originalname,
        originalName: file.originalname,
        fileType,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        totalChunks: 0,
        status: "processing",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      RagStorage.saveDocument(record);
      uploadedRecords.push(record);

      // Launch ingestion asynchronously
      processDocumentAsync(record);
    }

    res.json({
      success: true,
      message: `Uploaded ${uploadedRecords.length} document(s). Processing has started.`,
      documents: uploadedRecords,
    });
  } catch (err: any) {
    console.error("Document upload failed:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

// List uploaded documents for user
app.get("/api/rag/documents", (req, res) => {
  try {
    const userId = (req.query.userId as string) || "default_user";
    const documents = RagStorage.listDocuments(userId);
    res.json({ documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single document details & chunk previews
app.get("/api/rag/documents/:id", (req, res) => {
  try {
    const docId = req.params.id;
    const userId = (req.query.userId as string) || "default_user";
    const doc = RagStorage.getDocument(docId, userId);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    const chunks = RagStorage.getChunks(docId);
    res.json({
      document: doc,
      totalChunks: chunks.length,
      sampleChunks: chunks.slice(0, 5).map((c) => ({
        id: c.id,
        chunkIndex: c.chunkIndex,
        pageNumber: c.pageNumber,
        slideNumber: c.slideNumber,
        sheetName: c.sheetName,
        sectionHeading: c.sectionHeading,
        rowRange: c.rowRange,
        preview: c.content.slice(0, 200),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete document and purge vectors
app.delete("/api/rag/documents/:id", async (req, res) => {
  try {
    const docId = req.params.id;
    const userId = (req.query.userId as string) || "default_user";

    const deleted = RagStorage.deleteDocument(docId, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Document not found or unauthorized" });
    }

    await deleteDocumentVectors(docId);
    res.json({ success: true, message: `Document ${docId} deleted and vectors purged.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// LangGraph RAG Chat Endpoint
app.post("/api/rag/chat", async (req, res) => {
  try {
    const {
      userId = "default_user",
      conversationId = "default_conversation",
      selectedDocIds = [],
    } = req.body;

    const rawQuestion = req.body.question || req.body.query || req.body.prompt || req.body.message || "";
    if (!rawQuestion || typeof rawQuestion !== "string" || !rawQuestion.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }

    const response = await executeRagChat(
      rawQuestion.trim(),
      userId,
      conversationId,
      Array.isArray(selectedDocIds) ? selectedDocIds : []
    );

    res.json(response);
  } catch (err: any) {
    console.error("RAG chat error:", err);
    res.status(500).json({
      answer: "I couldn't find sufficient information about this question in your uploaded documents.",
      citations: [],
      status: "error",
      error: err.message,
    });
  }
});

// Clear conversation history
app.post("/api/rag/conversation/clear", (req, res) => {
  try {
    const { conversationId = "default_conversation", userId = "default_user" } = req.body;
    RagStorage.clearConversation(conversationId, userId);
    res.json({ success: true, message: "Conversation history cleared" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// RAG Pipeline Health & Vector Store Stats (serves both /api/rag/health and /api/rag/stats)
app.get(["/api/rag/health", "/api/rag/stats"], (_req, res) => {
  try {
    const stats = getVectorStoreStats();
    const docs = RagStorage.listDocuments("default_user");
    res.json({
      status: "ok",
      vectorStore: stats,
      totalDocuments: docs.length,
      readyDocuments: docs.filter((d) => d.status === "ready").length,
      aiClientReady: !!getAiClient(),
      qdrantCloudConnected: stats.qdrantCloudConnected,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Run Accuracy Evaluation Benchmark
app.post("/api/rag/eval", async (req, res) => {
  try {
    const userId = (req.body.userId as string) || "default_user";
    const evalResults = await runRagAccuracyEvaluation(userId);
    res.json(evalResults);
  } catch (err: any) {
    console.error("Accuracy evaluation failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI SQL Tutor Endpoints & Compatibility Aliases (/api/ai/tutor, /api/tutor/chat, /api/tutor/explain)
app.post(["/api/ai/tutor", "/api/tutor/chat", "/api/tutor/explain"], async (req, res) => {
  try {
    const reqPath = req.path || "";
    let defaultMode = "general";
    if (reqPath.includes("explain")) defaultMode = "explain";
    
    const { mode = defaultMode, context = {} } = req.body;
    const prompt = req.body.prompt || req.body.message || req.body.query || (req.body.query ? `Explain query: ${req.body.query}` : "");
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAiClient();
    if (!ai) {
      const fallbackText = generateFallbackAiResponse(prompt, mode, context);
      return res.json({
        text: fallbackText,
        answer: fallbackText,
        response: fallbackText,
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

    const genResult = await callGeminiWithResilience(ai, {
      models: ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite"],
      contents: userContent,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      maxRetriesPerModel: 2,
      baseDelayMs: 2000,
    });

    if (genResult && genResult.text) {
      return res.json({
        text: genResult.text,
        answer: genResult.text,
        response: genResult.text,
        source: "gemini",
        model: genResult.modelUsed,
      });
    }

    const fallbackText = generateFallbackAiResponse(prompt, mode, context);
    return res.json({
      text: fallbackText,
      answer: fallbackText,
      response: fallbackText,
      source: "fallback_on_demand",
      note: "High demand on live AI models. Switched smoothly to educational fallback engine.",
    });
  } catch (error: any) {
    console.warn("AI Tutor endpoint caught error:", error.message);
    const fallbackText = generateFallbackAiResponse(req.body?.prompt || req.body?.message || "", req.body?.mode || "general", req.body?.context || {});
    return res.json({
      text: fallbackText,
      answer: fallbackText,
      response: fallbackText,
      source: "fallback_on_error",
      note: "Offline guidance engine provided response.",
    });
  }
});

// Dynamic AI Quiz Generation Endpoint
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
      const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite"];
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
              temperature: 0.85,
            },
          });

          if (response && response.text) {
            const parsedQuestions = JSON.parse(response.text);
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
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

function generateDynamicFallbackQuiz(
  _topicTitle: string,
  _moduleId: string,
  _difficulty: string,
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

  const shuffled = questionPool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((fn) => {
    const q = fn();
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
}

function generateFallbackAiResponse(_prompt: string, mode: string, context: any): string {
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
export async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const distIndexPath = path.join(distPath, "index.html");
  const hasDist = fs.existsSync(distIndexPath);

  const isDev = process.env.npm_lifecycle_event === "dev" || process.env.FORCE_DEV === "true";

  // Google Search Console Verification Endpoint
  app.get("/google36840834d382036d.html", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send("google-site-verification: google36840834d382036d.html\n");
  });

  // Crawlers & Search Engine Robots
  app.get("/robots.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    const robotsPath = path.join(process.cwd(), "public", "robots.txt");
    if (fs.existsSync(robotsPath)) {
      return res.sendFile(robotsPath);
    }
    res.send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://rupa-s-query-791008235723.asia-southeast1.run.app/sitemap.xml\n");
  });

  // XML Sitemap for Google Indexing
  app.get("/sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
    if (fs.existsSync(sitemapPath)) {
      return res.sendFile(sitemapPath);
    }
    res.status(404).send("<error>Sitemap not found</error>");
  });

  // System Architecture Diagram Vector Asset
  app.get(["/architecture-diagram.svg", "/assets/architecture-diagram.svg"], (_req, res) => {
    res.setHeader("Content-Type", "image/svg+xml");
    const pubSvg = path.join(process.cwd(), "public", "architecture-diagram.svg");
    const distSvg = path.join(process.cwd(), "dist", "architecture-diagram.svg");
    const target = fs.existsSync(pubSvg) ? pubSvg : distSvg;
    if (fs.existsSync(target)) {
      return res.sendFile(target);
    }
    res.status(404).send("<error>Architecture diagram not found</error>");
  });

  const isProd = (!isDev && hasDist) || process.env.NODE_ENV === "production" || process.argv[1]?.endsWith("server.cjs");

  if (!isProd) {
    console.log("🛠️ Starting server in DEVELOPMENT mode with Vite middleware (HMR disabled)...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("⚡ Starting server in PRODUCTION mode (serving compiled dist)...");
    app.use(express.static(distPath, { maxAge: "1d", index: false }));
    app.get("*", (_req, res) => {
      res.sendFile(distIndexPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=========================================`);
    console.log(`🚀 RUPA's Query Platform is running!`);
    console.log(`🔗 Port: ${PORT} (0.0.0.0:${PORT})`);
    console.log(`⚡ Mode: ${isProd ? "PRODUCTION (Compiled Assets)" : "DEVELOPMENT (Vite Middleware)"}`);
    console.log(`👤 Author: Ambadipudi Rupavani`);
    console.log(`=========================================`);
  });

  seedInitialDocumentsIfNeeded().catch((err) => {
    console.warn("Error seeding initial RAG documents:", err);
  });
}

// Auto-start server when run as primary process or bundle
startServer().catch((err) => {
  console.error("Fatal startup error in app.ts:", err);
});
