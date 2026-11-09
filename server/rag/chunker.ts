import { Document } from '@langchain/core/documents';
import { DocumentChunk } from './types';
import { ExtractedSection } from './parsers';

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export function chunkExtractedSections(
  sections: ExtractedSection[],
  documentId: string,
  documentName: string,
  userId: string,
  options: ChunkOptions = {}
): DocumentChunk[] {
  const { chunkSize = 750, chunkOverlap = 100 } = options;
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;

  for (const section of sections) {
    const text = section.content.trim();
    if (!text) continue;

    // If section content fits within chunkSize, keep as a single chunk
    if (text.length <= chunkSize) {
      const doc = new Document({
        pageContent: text,
        metadata: {
          documentId,
          documentName,
          userId,
          pageNumber: section.pageNumber,
          slideNumber: section.slideNumber,
          sheetName: section.sheetName,
          sectionHeading: section.sectionHeading,
          rowRange: section.rowRange,
          chunkIndex,
        },
      });

      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        documentId,
        documentName,
        userId,
        chunkIndex,
        content: doc.pageContent,
        pageNumber: section.pageNumber,
        slideNumber: section.slideNumber,
        sheetName: section.sheetName,
        sectionHeading: section.sectionHeading,
        rowRange: section.rowRange,
        metadata: doc.metadata,
      });
      chunkIndex++;
    } else {
      // Split large sections into overlapping chunks along paragraph or sentence boundaries
      const subChunks = splitTextIntoChunks(text, chunkSize, chunkOverlap);
      for (const subText of subChunks) {
        if (!subText.trim()) continue;

        const doc = new Document({
          pageContent: subText.trim(),
          metadata: {
            documentId,
            documentName,
            userId,
            pageNumber: section.pageNumber,
            slideNumber: section.slideNumber,
            sheetName: section.sheetName,
            sectionHeading: section.sectionHeading,
            rowRange: section.rowRange,
            chunkIndex,
          },
        });

        chunks.push({
          id: `${documentId}_chunk_${chunkIndex}`,
          documentId,
          documentName,
          userId,
          chunkIndex,
          content: doc.pageContent,
          pageNumber: section.pageNumber,
          slideNumber: section.slideNumber,
          sheetName: section.sheetName,
          sectionHeading: section.sectionHeading,
          rowRange: section.rowRange,
          metadata: doc.metadata,
        });
        chunkIndex++;
      }
    }
  }

  return chunks;
}

function splitTextIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= text.length) {
      chunks.push(text.slice(startIndex));
      break;
    }

    // Try finding natural breaking points: newline, period, comma, or space
    const windowSlice = text.slice(startIndex + Math.floor(chunkSize * 0.7), endIndex + 50);
    const breakMatch = windowSlice.match(/(\n\n|\.\s+|\n|\?\s+|!\s+)/);

    if (breakMatch && breakMatch.index !== undefined) {
      endIndex = startIndex + Math.floor(chunkSize * 0.7) + breakMatch.index + breakMatch[0].length;
    } else {
      const spaceIdx = text.lastIndexOf(' ', endIndex);
      if (spaceIdx > startIndex + Math.floor(chunkSize * 0.5)) {
        endIndex = spaceIdx + 1;
      }
    }

    chunks.push(text.slice(startIndex, endIndex));
    startIndex = endIndex - overlap;
    if (startIndex >= text.length - overlap) break;
  }

  return chunks;
}
