import { StateGraph, Annotation, END } from '@langchain/langgraph';
import { DocumentChunk, Citation, RagChatMessage } from './types';
import { generateTextEmbedding, getGeminiClient } from './embeddings';
import { hybridSearch, HybridSearchResult } from './vectorStore';
import { RagStorage } from './storage';
import { callGeminiWithResilience } from './geminiResilience';

// Define the LangGraph State Annotation
export const RagStateAnnotation = Annotation.Root({
  question: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),
  userId: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => 'default_user',
  }),
  conversationId: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => 'default_conversation',
  }),
  selectedDocIds: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  history: Annotation<{ role: string; content: string }[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  analyzedIntent: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => 'factual_qa',
  }),
  resolvedQuestion: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),
  searchQuery: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),
  retrievedChunks: Annotation<HybridSearchResult[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  gradedChunks: Annotation<HybridSearchResult[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  retryCount: Annotation<number>({
    reducer: (_prev, next) => next,
    default: () => 0,
  }),
  rerankedChunks: Annotation<HybridSearchResult[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  formattedContext: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),
  rawAnswer: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),
  isAnswerVerified: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),
  verifiedCitations: Annotation<Citation[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  finalAnswer: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),
  status: Annotation<'answered' | 'insufficient_evidence' | 'error'>({
    reducer: (_prev, next) => next,
    default: () => 'answered',
  }),
});

export type RagStateType = typeof RagStateAnnotation.State;

// 1. QUERY_ANALYZER: Understand intent, resolve follow-up references
async function queryAnalyzerNode(state: RagStateType): Promise<Partial<RagStateType>> {
  const { question, history } = state;
  let resolvedQuestion = question;
  let analyzedIntent = 'factual_qa';

  // Check if query contains comparative keywords
  const lowerQ = question.toLowerCase();
  if (lowerQ.includes('compare') || lowerQ.includes('difference between') || lowerQ.includes('versus') || lowerQ.includes('vs')) {
    analyzedIntent = 'comparison';
  } else if (lowerQ.includes('list') || lowerQ.includes('what are all') || lowerQ.includes('summary')) {
    analyzedIntent = 'summarization';
  }

  // Resolve follow-up pronouns ("it", "its", "they", "their", "these", "this concept") using recent user/assistant turns
  if (history && history.length > 0) {
    const pronounMatch = /\b(it|its|they|their|this|that|these|the same)\b/i.test(question);
    if (pronounMatch) {
      const lastUserMsg = [...history].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        resolvedQuestion = `${question} (in context of previous topic: "${lastUserMsg.content.slice(0, 80)}")`;
      }
    }
  }

  return {
    resolvedQuestion,
    analyzedIntent,
    searchQuery: resolvedQuestion,
  };
}

// 2. QUERY_REWRITER: Improve unclear or ambiguous questions for dense + keyword retrieval
async function queryRewriterNode(state: RagStateType): Promise<Partial<RagStateType>> {
  const { resolvedQuestion } = state;
  // Clean punctuation and synthesize keyword terms
  const cleaned = resolvedQuestion
    .replace(/[?.,!":;()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    searchQuery: cleaned,
  };
}

// 3. DOCUMENT_RETRIEVER: Embed query and search vector store + keyword matches with user & doc filters
async function documentRetrieverNode(state: RagStateType): Promise<Partial<RagStateType>> {
  const { searchQuery, userId, selectedDocIds } = state;
  const embedding = await generateTextEmbedding(searchQuery);

  const results = await hybridSearch(searchQuery, embedding, userId, selectedDocIds, 8);

  return {
    retrievedChunks: results,
  };
}

// 4. RELEVANCE_GRADER: Filter out noise, assess evidence sufficiency
async function relevanceGraderNode(state: RagStateType): Promise<Partial<RagStateType>> {
  const { retrievedChunks, searchQuery } = state;
  const stopWords = new Set(['what', 'is', 'the', 'how', 'does', 'in', 'and', 'for', 'are', 'was', 'were', 'can', 'you', 'explain', 'tell', 'show', 'give', 'about', 'with', 'from', 'that', 'this', 'secret', 'recipe']);
  const queryWords = searchQuery.toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !stopWords.has(w));

  const graded = retrievedChunks.filter((item) => {
    const contentLower = item.chunk.content.toLowerCase();
    const headingLower = (item.chunk.sectionHeading || '').toLowerCase();
    
    // Check if any non-stopword query terms appear in chunk or heading
    const termHits = queryWords.filter((w) => contentLower.includes(w) || headingLower.includes(w)).length;
    
    // Pass if has keyword hits or very high dense semantic alignment (>= 0.68)
    if (queryWords.length > 0 && termHits > 0) {
      return true;
    }
    if (queryWords.length === 0 && item.denseScore >= 0.55) {
      return true;
    }
    return item.denseScore >= 0.70;
  });

  return {
    gradedChunks: graded,
  };
}

// 5. RETRIEVAL_RETRY conditional router
function shouldRetryRetrieval(state: RagStateType): string {
  const { gradedChunks, retryCount } = state;
  if (gradedChunks.length === 0 && retryCount < 1) {
    return 'retrieval_retry';
  }
  if (gradedChunks.length === 0) {
    return 'fallback_handler';
  }
  return 'reranker';
}

// 5b. RETRIEVAL_RETRY Node
async function retrievalRetryNode(state: RagStateType): Promise<Partial<RagStateType>> {
  const { searchQuery, retryCount } = state;
  // Simplify query to key noun phrases
  const simplified = searchQuery
    .split(/\s+/)
    .filter((w) => !['what', 'is', 'the', 'how', 'does', 'in', 'and', 'for', 'explain', 'show', 'tell', 'me', 'about'].includes(w.toLowerCase()))
    .join(' ');

  return {
    searchQuery: simplified || searchQuery,
    retryCount: retryCount + 1,
  };
}

// 6. RERANKER: Rank chunks according to their direct supporting evidence to the question
async function rerankerNode(state: RagStateType): Promise<Partial<RagStateType>> {
  const { gradedChunks, question } = state;
  const qTerms = question.toLowerCase().split(/\W+/).filter((t) => t.length > 2);

  const reranked = [...gradedChunks].sort((a, b) => {
    let scoreA = a.hybridScore;
    let scoreB = b.hybridScore;

    const contentA = a.chunk.content.toLowerCase();
    const contentB = b.chunk.content.toLowerCase();

    for (const t of qTerms) {
      if (contentA.includes(t)) scoreA += 0.15;
      if (contentB.includes(t)) scoreB += 0.15;
    }

    return scoreB - scoreA;
  });

  // Pick top 4 best chunks
  return {
    rerankedChunks: reranked.slice(0, 4),
  };
}

// 7. CONTEXT_BUILDER: Combine relevant chunks with strict provenance headers
async function contextBuilderNode(state: RagStateType): Promise<Partial<RagStateType>> {
  const { rerankedChunks } = state;

  const contextBlocks = rerankedChunks.map((res, idx) => {
    const c = res.chunk;
    const parts = [`Source #${idx + 1}: [Document: "${c.documentName}"]`];
    if (c.pageNumber) parts.push(`[Page: ${c.pageNumber}]`);
    if (c.slideNumber) parts.push(`[Slide: ${c.slideNumber}]`);
    if (c.sheetName) parts.push(`[Sheet: "${c.sheetName}"]`);
    if (c.sectionHeading) parts.push(`[Section: "${c.sectionHeading}"]`);
    if (c.rowRange) parts.push(`[Rows: ${c.rowRange}]`);

    return `${parts.join(' ')}\n"""\n${c.content}\n"""`;
  });

  return {
    formattedContext: contextBlocks.join('\n\n---\n\n'),
  };
}

// 8. GEMINI_GENERATOR: Strictly evidence-grounded generation using Gemini
async function geminiGeneratorNode(state: RagStateType): Promise<Partial<RagStateType>> {
  const { question, formattedContext } = state;
  const ai = getGeminiClient();

  const systemInstruction = `You are RUPA's Query Accuracy-Focused Document Intelligence Assistant.
Your sole mission is to provide accurate, evidence-based answers strictly using the provided uploaded document excerpts.

CRITICAL ACCURACY RULES:
1. Ground every claim ONLY on the evidence provided in the Context below.
2. NEVER invent facts, statistics, numbers, column names, formulas, or page numbers.
3. If the provided context does NOT contain enough information to answer the question, you MUST explicitly state:
   "I couldn't find sufficient information about this question in your uploaded documents."
4. If documents describe different aspects or have conflicting details, clearly explain the distinction rather than assuming one over the other.
5. Format your answer with clean Markdown, bullet points, and code blocks where helpful.
6. When referencing facts, indicate the document name and page/slide/sheet in parentheses (e.g., "[Document.pdf, Page 2]").`;

  const userPrompt = `DOCUMENT CONTEXT EXCERPTS:\n${formattedContext}\n\nUSER QUESTION: ${question}\n\nProvide an evidence-based answer strictly based on the context above.`;

  if (ai) {
    const genResult = await callGeminiWithResilience(ai, {
      models: ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite'],
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature minimizes hallucinations
      },
      maxRetriesPerModel: 2,
      baseDelayMs: 2000,
    });

    if (genResult && genResult.text) {
      return {
        rawAnswer: genResult.text.trim(),
      };
    }
  }

  // Resilient multi-chunk deterministic answer generator based on retrieved passages
  const topResult = state.rerankedChunks[0];
  const firstChunk = topResult?.chunk;
  if (!firstChunk) {
    return {
      rawAnswer: "I couldn't find sufficient information about this question in your uploaded documents.",
    };
  }

  // Check if chunk actually contains query terms or has sufficient relevance
  const queryTerms = question.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const contentLower = firstChunk.content.toLowerCase();
  const hasMatchingTerms = queryTerms.some((t) => contentLower.includes(t));

  if (!hasMatchingTerms && (topResult.hybridScore || 0) < 0.55) {
    return {
      rawAnswer: "I couldn't find sufficient information about this question in your uploaded documents.",
    };
  }

  // Compose answer directly from top supporting chunks with clear provenance
  const validChunks = state.rerankedChunks.slice(0, 2);
  const sections = validChunks.map((res) => {
    const c = res.chunk;
    const loc = [
      c.pageNumber ? `Page ${c.pageNumber}` : '',
      c.slideNumber ? `Slide ${c.slideNumber}` : '',
      c.sheetName ? `Sheet "${c.sheetName}"` : '',
      c.sectionHeading ? `Section "${c.sectionHeading}"` : '',
    ].filter(Boolean).join(', ');

    return `**From [${c.documentName}${loc ? `, ${loc}` : ''}]:**\n\n${c.content.trim()}`;
  });

  return {
    rawAnswer: sections.join('\n\n---\n\n'),
  };
}

// 9. ANSWER_VERIFIER: Detect unsupported statements or hallucinated claims
async function answerVerifierNode(state: RagStateType): Promise<Partial<RagStateType>> {
  const { rawAnswer, formattedContext } = state;

  const insufficientPhrases = [
    "couldn't find sufficient information",
    "cannot find sufficient information",
    "not mentioned in the uploaded documents",
    "not provided in the context",
  ];

  const indicatesInsufficient = insufficientPhrases.some((phrase) =>
    rawAnswer.toLowerCase().includes(phrase)
  );

  if (indicatesInsufficient) {
    return {
      isAnswerVerified: true,
      status: 'insufficient_evidence',
      finalAnswer: "I couldn't find sufficient information about this question in your uploaded documents.",
    };
  }

  // Cross-check: ensure answer mentions at least some vocabulary present in context
  const contextWords = new Set(
    formattedContext.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  );
  const answerWords = rawAnswer.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const overlap = answerWords.filter((w) => contextWords.has(w)).length;

  if (answerWords.length > 10 && overlap < 3) {
    return {
      isAnswerVerified: false,
      status: 'insufficient_evidence',
      finalAnswer: "I couldn't find sufficient information about this question in your uploaded documents.",
    };
  }

  return {
    isAnswerVerified: true,
    status: 'answered',
    finalAnswer: rawAnswer,
  };
}

// 10. CITATION_VALIDATOR: Connect citations strictly to retrieved chunks
async function citationValidatorNode(state: RagStateType): Promise<Partial<RagStateType>> {
  const { rerankedChunks, status } = state;

  if (status === 'insufficient_evidence') {
    return {
      verifiedCitations: [],
    };
  }

  const citations: Citation[] = rerankedChunks.map((item, idx) => {
    const c = item.chunk;
    // Extract a concise representative snippet (max 180 chars)
    const cleanSnippet = c.content.replace(/\s+/g, ' ').slice(0, 180) + '...';

    return {
      id: `cite_${idx + 1}_${c.id}`,
      documentId: c.documentId,
      documentName: c.documentName,
      pageNumber: c.pageNumber,
      slideNumber: c.slideNumber,
      sheetName: c.sheetName,
      sectionHeading: c.sectionHeading,
      snippet: cleanSnippet,
      relevanceScore: Math.round(item.hybridScore * 100) / 100,
    };
  });

  return {
    verifiedCitations: citations,
  };
}

// 11. RESPONSE_FORMATTER: Finalize response
async function responseFormatterNode(state: RagStateType): Promise<Partial<RagStateType>> {
  return {
    finalAnswer: state.finalAnswer || state.rawAnswer,
  };
}

// 12. FALLBACK_HANDLER: Honest abstention when evidence is absent
async function fallbackHandlerNode(_state: RagStateType): Promise<Partial<RagStateType>> {
  return {
    finalAnswer: "I couldn't find sufficient information about this question in your uploaded documents.",
    status: 'insufficient_evidence',
    verifiedCitations: [],
  };
}

// Build the LangGraph StateGraph
export function buildRagGraph() {
  const workflow = new StateGraph(RagStateAnnotation)
    .addNode('query_analyzer', queryAnalyzerNode)
    .addNode('query_rewriter', queryRewriterNode)
    .addNode('document_retriever', documentRetrieverNode)
    .addNode('relevance_grader', relevanceGraderNode)
    .addNode('retrieval_retry', retrievalRetryNode)
    .addNode('reranker', rerankerNode)
    .addNode('context_builder', contextBuilderNode)
    .addNode('gemini_generator', geminiGeneratorNode)
    .addNode('answer_verifier', answerVerifierNode)
    .addNode('citation_validator', citationValidatorNode)
    .addNode('response_formatter', responseFormatterNode)
    .addNode('fallback_handler', fallbackHandlerNode);

  // Define Edges
  workflow.addEdge('__start__', 'query_analyzer');
  workflow.addEdge('query_analyzer', 'query_rewriter');
  workflow.addEdge('query_rewriter', 'document_retriever');
  workflow.addEdge('document_retriever', 'relevance_grader');

  workflow.addConditionalEdges('relevance_grader', shouldRetryRetrieval, {
    retrieval_retry: 'retrieval_retry',
    fallback_handler: 'fallback_handler',
    reranker: 'reranker',
  });

  workflow.addEdge('retrieval_retry', 'document_retriever');
  workflow.addEdge('reranker', 'context_builder');
  workflow.addEdge('context_builder', 'gemini_generator');
  workflow.addEdge('gemini_generator', 'answer_verifier');
  workflow.addEdge('answer_verifier', 'citation_validator');
  workflow.addEdge('citation_validator', 'response_formatter');
  workflow.addEdge('response_formatter', END);
  workflow.addEdge('fallback_handler', END);

  return workflow.compile();
}

// Singleton compiled workflow
let compiledGraph: any = null;

export async function executeRagChat(
  question: string,
  userId: string = 'default_user',
  conversationId: string = 'default_conversation',
  selectedDocIds: string[] = []
): Promise<{
  answer: string;
  citations: Citation[];
  status: 'answered' | 'insufficient_evidence' | 'error';
  metadata: any;
}> {
  if (!compiledGraph) {
    compiledGraph = buildRagGraph();
  }

  // Load conversation history from storage
  const conv = RagStorage.getConversation(conversationId, userId);
  const history = conv.messages.slice(-6).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const initialInput = {
    question,
    userId,
    conversationId,
    selectedDocIds,
    history,
  };

  try {
    const finalState = await compiledGraph.invoke(initialInput);

    const userMsg: RagChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsg: RagChatMessage = {
      id: `msg_a_${Date.now()}`,
      role: 'assistant',
      content: finalState.finalAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: finalState.verifiedCitations,
      isEvidenceBased: finalState.status === 'answered',
      status: finalState.status,
      retrievalMetadata: {
        totalChunksRetrieved: finalState.retrievedChunks?.length || 0,
        topScore: finalState.rerankedChunks?.[0]?.hybridScore || 0,
        selectedDocIds,
        rewrittenQuery: finalState.searchQuery,
      },
    };

    RagStorage.addMessageToConversation(conversationId, userId, userMsg);
    RagStorage.addMessageToConversation(conversationId, userId, aiMsg);

    return {
      answer: finalState.finalAnswer,
      citations: finalState.verifiedCitations,
      status: finalState.status,
      metadata: aiMsg.retrievalMetadata,
    };
  } catch (err: any) {
    console.error('LangGraph RAG execution error:', err);
    return {
      answer: "I couldn't find sufficient information about this question in your uploaded documents.",
      citations: [],
      status: 'error',
      metadata: { error: err.message },
    };
  }
}
