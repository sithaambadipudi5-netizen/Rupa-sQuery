import fs from 'fs';
import path from 'path';
import { UploadedDocumentRecord, DocumentChunk, RagConversation, RagChatMessage } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');
const METADATA_FILE = path.join(DATA_DIR, 'rag_metadata.json');

interface MetadataStore {
  documents: Record<string, UploadedDocumentRecord>;
  chunks: Record<string, DocumentChunk[]>; // keyed by documentId
  conversations: Record<string, RagConversation>;
}

// Ensure necessary directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function loadStore(): MetadataStore {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const raw = fs.readFileSync(METADATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        documents: parsed.documents || {},
        chunks: parsed.chunks || {},
        conversations: parsed.conversations || {},
      };
    }
  } catch (err) {
    console.error('Error loading RAG metadata store:', err);
  }
  return {
    documents: {},
    chunks: {},
    conversations: {},
  };
}

function saveStore(store: MetadataStore): void {
  try {
    const tempFile = `${METADATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tempFile, METADATA_FILE);
  } catch (err) {
    console.error('Error saving RAG metadata store:', err);
  }
}

export const RagStorage = {
  getUploadDir(): string {
    return UPLOAD_DIR;
  },

  // Documents
  listDocuments(userId: string): UploadedDocumentRecord[] {
    const store = loadStore();
    return Object.values(store.documents)
      .filter((doc) => doc.userId === userId || doc.userId === 'default_user')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getDocument(documentId: string, userId?: string): UploadedDocumentRecord | null {
    const store = loadStore();
    const doc = store.documents[documentId];
    if (!doc) return null;
    if (userId && doc.userId !== userId && doc.userId !== 'default_user') {
      return null;
    }
    return doc;
  },

  saveDocument(doc: UploadedDocumentRecord): void {
    const store = loadStore();
    store.documents[doc.id] = doc;
    saveStore(store);
  },

  updateDocumentStatus(
    documentId: string,
    status: 'processing' | 'ready' | 'error',
    totalChunks?: number,
    errorMessage?: string,
    metadata?: Partial<UploadedDocumentRecord>
  ): void {
    const store = loadStore();
    if (store.documents[documentId]) {
      store.documents[documentId].status = status;
      store.documents[documentId].updatedAt = new Date().toISOString();
      if (totalChunks !== undefined) store.documents[documentId].totalChunks = totalChunks;
      if (errorMessage !== undefined) store.documents[documentId].errorMessage = errorMessage;
      if (metadata) {
        Object.assign(store.documents[documentId], metadata);
      }
      saveStore(store);
    }
  },

  deleteDocument(documentId: string, userId?: string): boolean {
    const store = loadStore();
    const doc = store.documents[documentId];
    if (!doc) return false;
    if (userId && doc.userId !== userId && doc.userId !== 'default_user') {
      return false;
    }

    // Remove file if exists
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (e) {
        console.warn(`Failed to delete file ${doc.filePath}:`, e);
      }
    }

    delete store.documents[documentId];
    delete store.chunks[documentId];
    saveStore(store);
    return true;
  },

  // Chunks
  saveChunks(documentId: string, chunks: DocumentChunk[]): void {
    const store = loadStore();
    store.chunks[documentId] = chunks;
    saveStore(store);
  },

  getChunks(documentId: string): DocumentChunk[] {
    const store = loadStore();
    return store.chunks[documentId] || [];
  },

  getChunksForUser(userId: string, documentIds?: string[]): DocumentChunk[] {
    const store = loadStore();
    const allowedDocIds = new Set(
      Object.values(store.documents)
        .filter((d) => (d.userId === userId || d.userId === 'default_user') && d.status === 'ready')
        .map((d) => d.id)
    );

    const targetDocIds = documentIds && documentIds.length > 0
      ? documentIds.filter((id) => allowedDocIds.has(id))
      : Array.from(allowedDocIds);

    const result: DocumentChunk[] = [];
    for (const docId of targetDocIds) {
      if (store.chunks[docId]) {
        result.push(...store.chunks[docId]);
      }
    }
    return result;
  },

  // Conversations
  getConversation(conversationId: string, userId: string): RagConversation {
    const store = loadStore();
    if (store.conversations[conversationId]) {
      return store.conversations[conversationId];
    }
    const newConv: RagConversation = {
      id: conversationId,
      userId,
      title: 'New RAG Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.conversations[conversationId] = newConv;
    saveStore(store);
    return newConv;
  },

  addMessageToConversation(conversationId: string, userId: string, message: RagChatMessage): void {
    const store = loadStore();
    let conv = store.conversations[conversationId];
    if (!conv) {
      conv = {
        id: conversationId,
        userId,
        title: message.content.slice(0, 30) + '...',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.conversations[conversationId] = conv;
    }
    conv.messages.push(message);
    conv.updatedAt = new Date().toISOString();
    saveStore(store);
  },

  clearConversation(conversationId: string, userId: string): void {
    const store = loadStore();
    if (store.conversations[conversationId] && store.conversations[conversationId].userId === userId) {
      store.conversations[conversationId].messages = [];
      store.conversations[conversationId].updatedAt = new Date().toISOString();
      saveStore(store);
    }
  },
};
