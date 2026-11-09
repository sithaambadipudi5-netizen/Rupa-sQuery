export interface UploadedDocument {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'pptx' | 'xlsx' | 'csv' | 'json' | 'html';
  mimeType: string;
  fileSize: number;
  pageCount?: number;
  slideCount?: number;
  sheetNames?: string[];
  totalChunks: number;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber?: number;
  slideNumber?: number;
  sheetName?: string;
  sectionHeading?: string;
  snippet: string;
  relevanceScore?: number;
}

export interface RagResponse {
  answer: string;
  citations: Citation[];
  status: 'answered' | 'insufficient_evidence' | 'error';
  metadata?: {
    totalChunksRetrieved?: number;
    topScore?: number;
    selectedDocIds?: string[];
    rewrittenQuery?: string;
  };
  error?: string;
}

export interface RagHealthStatus {
  status: string;
  vectorStore: {
    totalVectors: number;
    qdrantCloudConnected: boolean;
    collectionName: string;
  };
  totalDocuments: number;
  readyDocuments: number;
  aiClientReady: boolean;
  qdrantCloudConnected: boolean;
  timestamp: string;
}

export interface AccuracyEvalResult {
  totalTests: number;
  passedTests: number;
  precisionAtK: number;
  recallAtK: number;
  mrr: number;
  faithfulnessScore: number;
  citationAccuracy: number;
  abstentionAccuracy: number;
  details: {
    testId: string;
    question: string;
    expectedCategory: string;
    passed: boolean;
    precision: number;
    retrievedCount: number;
    answerSummary: string;
    notes?: string;
  }[];
  timestamp: string;
}

export async function uploadRagDocuments(
  files: File[],
  userId: string = 'default_user'
): Promise<{ success: boolean; documents: UploadedDocument[]; message: string }> {
  const formData = new FormData();
  formData.append('userId', userId);
  for (const file of files) {
    formData.append('files', file);
  }

  const res = await fetch('/api/rag/documents/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${res.status}`);
  }

  return await res.json();
}

export async function getRagDocuments(userId: string = 'default_user'): Promise<UploadedDocument[]> {
  const res = await fetch(`/api/rag/documents?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to fetch uploaded documents');
  const data = await res.json();
  return data.documents || [];
}

export async function deleteRagDocument(documentId: string, userId: string = 'default_user'): Promise<void> {
  const res = await fetch(`/api/rag/documents/${documentId}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete document');
}

export async function askRagAssistant(params: {
  question: string;
  userId?: string;
  conversationId?: string;
  selectedDocIds?: string[];
}): Promise<RagResponse> {
  const res = await fetch('/api/rag/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: params.question,
      userId: params.userId || 'default_user',
      conversationId: params.conversationId || 'default_conversation',
      selectedDocIds: params.selectedDocIds || [],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server responded with ${res.status}`);
  }

  return await res.json();
}

export async function clearRagConversation(
  conversationId: string = 'default_conversation',
  userId: string = 'default_user'
): Promise<void> {
  await fetch('/api/rag/conversation/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, userId }),
  });
}

export async function getRagHealth(): Promise<RagHealthStatus> {
  const res = await fetch('/api/rag/health');
  if (!res.ok) throw new Error('Failed to fetch RAG health');
  return await res.json();
}

export async function runRagAccuracyEval(userId: string = 'default_user'): Promise<AccuracyEvalResult> {
  const res = await fetch('/api/rag/eval', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to run accuracy benchmark');
  return await res.json();
}
