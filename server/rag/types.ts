export type DocumentFileType =
  | 'pdf'
  | 'docx'
  | 'txt'
  | 'md'
  | 'pptx'
  | 'xlsx'
  | 'csv'
  | 'json'
  | 'html';

export interface UploadedDocumentRecord {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  fileType: DocumentFileType;
  mimeType: string;
  fileSize: number;
  filePath: string;
  pageCount?: number;
  slideCount?: number;
  sheetNames?: string[];
  totalChunks: number;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  userId: string;
  chunkIndex: number;
  content: string;
  pageNumber?: number;
  slideNumber?: number;
  sheetName?: string;
  sectionHeading?: string;
  rowRange?: string;
  metadata?: Record<string, any>;
  embedding?: number[];
  score?: number;
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

export interface RagChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Citation[];
  isEvidenceBased?: boolean;
  status?: 'answered' | 'insufficient_evidence' | 'error';
  retrievalMetadata?: {
    totalChunksRetrieved: number;
    topScore: number;
    selectedDocIds: string[];
    rewrittenQuery?: string;
  };
}

export interface RagConversation {
  id: string;
  userId: string;
  title: string;
  messages: RagChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface RagEvaluationResult {
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
