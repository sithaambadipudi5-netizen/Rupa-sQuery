import { QdrantClient } from '@qdrant/js-client-rest';
import { DocumentChunk } from './types';
import { RagStorage } from './storage';

const COLLECTION_NAME = 'rupas_query_documents';
const VECTOR_DIM = 768;

let qdrantClientInstance: QdrantClient | null = null;
let isQdrantInitialized = false;

// In-memory vector mirror for ultra-fast local retrieval and fallback
interface VectorEntry {
  id: string;
  documentId: string;
  userId: string;
  vector: number[];
  chunk: DocumentChunk;
}

const localVectorStore: Map<string, VectorEntry> = new Map();

export function getQdrantClient(): QdrantClient | null {
  if (!qdrantClientInstance && process.env.QDRANT_URL) {
    try {
      qdrantClientInstance = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
      });
    } catch (err) {
      console.warn('Failed to initialize Qdrant Cloud Client:', err);
    }
  }
  return qdrantClientInstance;
}

export async function initQdrantCollection(): Promise<boolean> {
  const client = getQdrantClient();
  if (!client) {
    return false;
  }

  if (isQdrantInitialized) return true;

  try {
    const collections = await client.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_DIM,
          distance: 'Cosine',
        },
      });
      console.log(`Created Qdrant Cloud collection: ${COLLECTION_NAME}`);
    }
    isQdrantInitialized = true;
    return true;
  } catch (err: any) {
    console.warn('Failed to verify/create Qdrant collection, using local fallback:', err.message);
    return false;
  }
}

export async function upsertChunksToVectorStore(
  chunks: DocumentChunk[],
  embeddings: number[][]
): Promise<void> {
  // Always update local vector mirror
  chunks.forEach((chunk, idx) => {
    let vector = embeddings[idx] || [];
    if (vector.length > VECTOR_DIM) {
      vector = vector.slice(0, VECTOR_DIM);
    }
    localVectorStore.set(chunk.id, {
      id: chunk.id,
      documentId: chunk.documentId,
      userId: chunk.userId,
      vector,
      chunk,
    });
  });

  // Also push to Qdrant Cloud if available
  const client = getQdrantClient();
  if (client) {
    try {
      await initQdrantCollection();
      const points = chunks.map((chunk, idx) => {
        let vector = embeddings[idx] || [];
        if (vector.length > VECTOR_DIM) {
          vector = vector.slice(0, VECTOR_DIM);
        }
        return {
          id: chunk.id,
          vector,
          payload: {
            documentId: chunk.documentId,
            documentName: chunk.documentName,
            userId: chunk.userId,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            pageNumber: chunk.pageNumber,
            slideNumber: chunk.slideNumber,
            sheetName: chunk.sheetName,
            sectionHeading: chunk.sectionHeading,
            rowRange: chunk.rowRange,
          },
        };
      });

      // Batch upload in chunks of 50
      const batchSize = 50;
      for (let i = 0; i < points.length; i += batchSize) {
        const batch = points.slice(i, i + batchSize);
        await client.upsert(COLLECTION_NAME, {
          wait: true,
          points: batch,
        });
      }
      console.log(`Uploaded ${points.length} vectors to Qdrant collection ${COLLECTION_NAME}`);
    } catch (err: any) {
      console.warn('Error pushing vectors to Qdrant Cloud, relying on local index:', err.message);
    }
  }
}

export async function deleteDocumentVectors(documentId: string): Promise<void> {
  // Purge from local mirror
  for (const [id, entry] of localVectorStore.entries()) {
    if (entry.documentId === documentId) {
      localVectorStore.delete(id);
    }
  }

  // Purge from Qdrant Cloud
  const client = getQdrantClient();
  if (client) {
    try {
      await client.delete(COLLECTION_NAME, {
        filter: {
          must: [
            {
              key: 'documentId',
              match: { value: documentId },
            },
          ],
        },
      });
      console.log(`Purged vectors for document ${documentId} in Qdrant Cloud`);
    } catch (err: any) {
      console.warn(`Failed to delete vectors from Qdrant for document ${documentId}:`, err.message);
    }
  }
}

export interface HybridSearchResult {
  chunk: DocumentChunk;
  denseScore: number;
  keywordScore: number;
  hybridScore: number;
}

export async function hybridSearch(
  query: string,
  queryEmbedding: number[],
  userId: string,
  selectedDocIds?: string[],
  topK: number = 6
): Promise<HybridSearchResult[]> {
  // Ensure local vector store has chunks from RagStorage if empty
  if (localVectorStore.size === 0) {
    const allUserChunks = RagStorage.getChunksForUser(userId);
    for (const chunk of allUserChunks) {
      if (chunk.embedding && chunk.embedding.length > 0) {
        let v = chunk.embedding;
        if (v.length > VECTOR_DIM) v = v.slice(0, VECTOR_DIM);
        localVectorStore.set(chunk.id, {
          id: chunk.id,
          documentId: chunk.documentId,
          userId: chunk.userId,
          vector: v,
          chunk,
        });
      }
    }
  }

  // Filter candidates by user and selected document IDs
  const candidates: VectorEntry[] = [];
  for (const entry of localVectorStore.values()) {
    if (entry.userId === userId || entry.userId === 'default_user') {
      if (!selectedDocIds || selectedDocIds.length === 0 || selectedDocIds.includes(entry.documentId)) {
        candidates.push(entry);
      }
    }
  }

  if (candidates.length === 0) {
    return [];
  }

  const queryTerms = query.toLowerCase().split(/\W+/).filter((t) => t.length > 1);

  const scoredResults: HybridSearchResult[] = candidates.map((entry) => {
    // 1. Dense Cosine Similarity
    const denseScore = computeCosineSimilarity(queryEmbedding, entry.vector);

    // 2. Keyword / BM25 term overlap score
    const contentLower = entry.chunk.content.toLowerCase();
    const headingLower = (entry.chunk.sectionHeading || '').toLowerCase();
    let keywordHits = 0;

    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        keywordHits += 1.0;
        // Extra boost for whole word match
        const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
        if (regex.test(contentLower)) keywordHits += 0.5;
      }
      if (headingLower.includes(term)) {
        keywordHits += 1.5;
      }
    }

    const keywordScore = queryTerms.length > 0 ? Math.min(1.0, keywordHits / queryTerms.length) : 0;

    // Combined Hybrid Score: 70% dense + 30% keyword
    const hybridScore = 0.7 * Math.max(0, denseScore) + 0.3 * keywordScore;

    return {
      chunk: entry.chunk,
      denseScore,
      keywordScore,
      hybridScore,
    };
  });

  // Sort descending by hybridScore
  scoredResults.sort((a, b) => b.hybridScore - a.hybridScore);

  return scoredResults.slice(0, topK);
}

function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getVectorStoreStats(): {
  totalVectors: number;
  qdrantCloudConnected: boolean;
  collectionName: string;
} {
  return {
    totalVectors: localVectorStore.size,
    qdrantCloudConnected: !!process.env.QDRANT_URL,
    collectionName: COLLECTION_NAME,
  };
}
