import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { parse as parseCsv } from 'csv-parse/sync';
import * as cheerio from 'cheerio';
import { DocumentFileType } from './types';
import { GoogleGenAI } from '@google/genai';

export interface ExtractedSection {
  content: string;
  pageNumber?: number;
  slideNumber?: number;
  sheetName?: string;
  sectionHeading?: string;
  rowRange?: string;
  metadata?: Record<string, any>;
}

export interface ParseResult {
  fileType: DocumentFileType;
  sections: ExtractedSection[];
  totalChars: number;
  pageCount?: number;
  slideCount?: number;
  sheetNames?: string[];
  extractedWithOcr?: boolean;
}

export function detectFileType(filename: string, mimeType?: string): DocumentFileType {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  if (ext === 'pdf' || mimeType === 'application/pdf') return 'pdf';
  if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (ext === 'txt' || mimeType === 'text/plain') return 'txt';
  if (ext === 'md' || ext === 'markdown') return 'md';
  if (ext === 'pptx' || mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'pptx';
  if (ext === 'xlsx' || ext === 'xls' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
  if (ext === 'csv' || mimeType === 'text/csv') return 'csv';
  if (ext === 'json' || mimeType === 'application/json') return 'json';
  if (ext === 'html' || ext === 'htm' || mimeType === 'text/html') return 'html';
  return 'txt';
}

export async function parseDocumentFile(
  filePath: string,
  filename: string,
  mimeType?: string,
  geminiClient?: GoogleGenAI | null
): Promise<ParseResult> {
  const fileType = detectFileType(filename, mimeType);
  const fileBuffer = fs.readFileSync(filePath);

  switch (fileType) {
    case 'pdf':
      return await parsePdf(fileBuffer, geminiClient);
    case 'docx':
      return await parseDocx(fileBuffer);
    case 'txt':
      return parseTxt(fileBuffer.toString('utf-8'));
    case 'md':
      return parseMarkdown(fileBuffer.toString('utf-8'));
    case 'pptx':
      return parsePptx(fileBuffer);
    case 'xlsx':
      return parseXlsx(fileBuffer);
    case 'csv':
      return parseCsvFile(fileBuffer.toString('utf-8'));
    case 'json':
      return parseJson(fileBuffer.toString('utf-8'));
    case 'html':
      return parseHtml(fileBuffer.toString('utf-8'));
    default:
      return parseTxt(fileBuffer.toString('utf-8'));
  }
}

// 1. PDF Parser with Page Preservation & OCR Fallback
async function parsePdf(
  buffer: Buffer,
  geminiClient?: GoogleGenAI | null
): Promise<ParseResult> {
  const sections: ExtractedSection[] = [];
  let pageCount = 0;

  try {
    const parser = new PDFParse({ data: buffer });
    try {
      const textResult = await parser.getText();
      if (textResult && textResult.pages && Array.isArray(textResult.pages)) {
        pageCount = textResult.pages.length;
        for (const p of textResult.pages) {
          const pageText = (p.text || '').trim();
          if (pageText.length > 0) {
            sections.push({
              content: pageText,
              pageNumber: p.num,
              sectionHeading: `Page ${p.num}`,
            });
          }
        }
      } else if (textResult && textResult.text && textResult.text.trim()) {
        const pages = textResult.text.split(/\f|\n\s*\n\s*\n/);
        pageCount = pages.length;
        pages.forEach((pText, idx) => {
          const trimmed = pText.trim();
          if (trimmed) {
            sections.push({
              content: trimmed,
              pageNumber: idx + 1,
              sectionHeading: `Page ${idx + 1}`,
            });
          }
        });
      }
    } finally {
      await parser.destroy().catch(() => {});
    }

    const totalExtractedLength = sections.reduce((sum, s) => sum + s.content.length, 0);

    // OCR Fallback for scanned or image-only PDFs
    if (totalExtractedLength < 50 && buffer.length > 500 && geminiClient) {
      try {
        console.log('PDF text is empty or scanned. Invoking Gemini OCR fallback...');
        const base64Data = buffer.toString('base64');
        const ocrModels = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
        let ocrResponse: any = null;
        for (const ocrModel of ocrModels) {
          try {
            ocrResponse = await geminiClient.models.generateContent({
              model: ocrModel,
              contents: [
                {
                  text: 'You are an OCR and document text extraction engine. Extract all text, tables, and structured content from this document with high fidelity. Preserve headings, list items, and structure. If there are multiple pages, separate them clearly with --- Page [N] --- markers.',
                },
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Data,
                  },
                },
              ],
            });
            if (ocrResponse && ocrResponse.text) break;
          } catch (ocrErr: any) {
            console.warn(`OCR model ${ocrModel} failed:`, ocrErr?.message?.slice(0, 80));
          }
        }

        const ocrText = ocrResponse?.text || '';
        if (ocrText.trim().length > 50) {
          const ocrPages = ocrText.split(/---\s*Page\s*(\d+)\s*---/i);
          if (ocrPages.length > 1) {
            for (let i = 1; i < ocrPages.length; i += 2) {
              const pNum = parseInt(ocrPages[i], 10) || Math.floor(i / 2) + 1;
              const pContent = ocrPages[i + 1]?.trim();
              if (pContent) {
                sections.push({
                  content: pContent,
                  pageNumber: pNum,
                  sectionHeading: `Page ${pNum} (OCR)`,
                });
              }
            }
          } else {
            sections.push({
              content: ocrText.trim(),
              pageNumber: 1,
              sectionHeading: 'Page 1 (OCR)',
            });
          }

          return {
            fileType: 'pdf',
            sections,
            totalChars: sections.reduce((acc, s) => acc + s.content.length, 0),
            pageCount: pageCount || sections.length,
            extractedWithOcr: true,
          };
        }
      } catch (ocrErr) {
        console.warn('Gemini OCR fallback encountered error:', ocrErr);
      }
    }

    return {
      fileType: 'pdf',
      sections,
      totalChars: sections.reduce((acc, s) => acc + s.content.length, 0),
      pageCount: pageCount || sections.length || 1,
      extractedWithOcr: false,
    };
  } catch (err: any) {
    console.error('Error parsing PDF:', err);
    throw new Error(`Failed to parse PDF document: ${err.message}`);
  }
}

// 2. Word (.docx) Parser
async function parseDocx(buffer: Buffer): Promise<ParseResult> {
  try {
    const rawResult = await mammoth.extractRawText({ buffer });
    const text = rawResult.value;

    // Split text into paragraphs / sections by blank lines
    const paragraphs = text.split(/\n\s*\n+/);
    const sections: ExtractedSection[] = [];
    let currentHeading = 'Document Content';

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      // Detect potential heading (short line, uppercase or title-case)
      if (trimmed.length < 80 && !trimmed.endsWith('.') && !trimmed.includes('\n')) {
        currentHeading = trimmed;
      }

      sections.push({
        content: trimmed,
        sectionHeading: currentHeading,
      });
    }

    return {
      fileType: 'docx',
      sections: sections.length > 0 ? sections : [{ content: text, sectionHeading: 'Main Document' }],
      totalChars: text.length,
    };
  } catch (err: any) {
    throw new Error(`Failed to parse Word document: ${err.message}`);
  }
}

// 3. Plain Text (.txt) Parser
function parseTxt(text: string): ParseResult {
  const paragraphs = text.split(/\n\s*\n+/);
  const sections: ExtractedSection[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const trimmed = paragraphs[i].trim();
    if (trimmed) {
      sections.push({
        content: trimmed,
        sectionHeading: `Section ${i + 1}`,
      });
    }
  }

  return {
    fileType: 'txt',
    sections: sections.length > 0 ? sections : [{ content: text, sectionHeading: 'Document' }],
    totalChars: text.length,
  };
}

// 4. Markdown (.md) Parser
function parseMarkdown(content: string): ParseResult {
  const sections: ExtractedSection[] = [];
  const lines = content.split('\n');

  let currentHeading = 'Introduction';
  let currentBlock: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      if (currentBlock.length > 0) {
        const text = currentBlock.join('\n').trim();
        if (text) {
          sections.push({
            content: text,
            sectionHeading: currentHeading,
          });
        }
        currentBlock = [];
      }
      currentHeading = headerMatch[2].trim();
    } else {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    const text = currentBlock.join('\n').trim();
    if (text) {
      sections.push({
        content: text,
        sectionHeading: currentHeading,
      });
    }
  }

  return {
    fileType: 'md',
    sections: sections.length > 0 ? sections : [{ content, sectionHeading: 'Markdown Document' }],
    totalChars: content.length,
  };
}

// 5. PowerPoint (.pptx) Parser
// PPTX is a zip container with XML slide files in ppt/slides/slide{N}.xml
function parsePptx(buffer: Buffer): ParseResult {
  try {
    const sections: ExtractedSection[] = [];
    const bufferStr = buffer.toString('binary');

    // Slide search pattern in zip file
    // Look for <a:t> text elements inside slide XML representations
    const slideMatches = bufferStr.match(/<p:sld[\s\S]*?<\/p:sld>/g) || [];
    let slideIndex = 1;

    if (slideMatches.length > 0) {
      for (const slideXml of slideMatches) {
        const textMatches = slideXml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) || [];
        const slideTexts: string[] = [];
        for (const t of textMatches) {
          const cleanText = t.replace(/<[^>]+>/g, '').trim();
          if (cleanText) slideTexts.push(cleanText);
        }

        if (slideTexts.length > 0) {
          const content = slideTexts.join(' ');
          sections.push({
            content,
            slideNumber: slideIndex,
            sectionHeading: `Slide ${slideIndex}`,
          });
          slideIndex++;
        }
      }
    }

    // Fallback: extract all <a:t>...</a:t> tags directly if slide wrapping was zipped in parts
    if (sections.length === 0) {
      const allTextTags = bufferStr.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) || [];
      const extracted: string[] = [];
      for (const tag of allTextTags) {
        const clean = tag.replace(/<[^>]+>/g, '').trim();
        if (clean && clean.length > 1) {
          extracted.push(clean);
        }
      }

      if (extracted.length > 0) {
        // Group into chunks representing slides (~10 elements each)
        const chunkSize = 12;
        for (let i = 0; i < extracted.length; i += chunkSize) {
          const sNum = Math.floor(i / chunkSize) + 1;
          const slideContent = extracted.slice(i, i + chunkSize).join(' ');
          sections.push({
            content: slideContent,
            slideNumber: sNum,
            sectionHeading: `Slide ${sNum}`,
          });
        }
      }
    }

    const totalChars = sections.reduce((acc, s) => acc + s.content.length, 0);

    return {
      fileType: 'pptx',
      sections: sections.length > 0 ? sections : [{ content: 'PowerPoint Presentation', slideNumber: 1, sectionHeading: 'Slide 1' }],
      totalChars,
      slideCount: sections.length,
    };
  } catch (err: any) {
    throw new Error(`Failed to parse PowerPoint presentation: ${err.message}`);
  }
}

// 6. Excel (.xlsx) Parser
function parseXlsx(buffer: Buffer): ParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sections: ExtractedSection[] = [];
    const sheetNames = workbook.SheetNames;

    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (jsonData.length === 0) continue;

      const headers = (jsonData[0] || []).map((h) => String(h || '').trim());
      const headerStr = headers.filter(Boolean).join(' | ');

      // Group rows into blocks of 20
      const rowsPerBatch = 20;
      for (let i = 1; i < jsonData.length; i += rowsPerBatch) {
        const batch = jsonData.slice(i, i + rowsPerBatch);
        const rowStrings: string[] = [];

        batch.forEach((row, rowIdx) => {
          const nonNull = row.some((val) => val !== null && val !== undefined && String(val).trim() !== '');
          if (nonNull) {
            const formattedRow = row.map((val, cIdx) => {
              const colName = headers[cIdx] || `Col_${cIdx + 1}`;
              return `${colName}: ${val ?? 'NULL'}`;
            }).join(', ');
            rowStrings.push(`[Row ${i + rowIdx}] ${formattedRow}`);
          }
        });

        if (rowStrings.length > 0) {
          const content = `Worksheet: "${sheetName}"\nColumns: ${headerStr}\nData:\n${rowStrings.join('\n')}`;
          sections.push({
            content,
            sheetName,
            sectionHeading: `Sheet: ${sheetName} (Rows ${i}-${Math.min(i + rowsPerBatch - 1, jsonData.length - 1)})`,
            rowRange: `${i}-${Math.min(i + rowsPerBatch - 1, jsonData.length - 1)}`,
          });
        }
      }
    }

    return {
      fileType: 'xlsx',
      sections,
      totalChars: sections.reduce((acc, s) => acc + s.content.length, 0),
      sheetNames,
    };
  } catch (err: any) {
    throw new Error(`Failed to parse Excel document: ${err.message}`);
  }
}

// 7. CSV (.csv) Parser
function parseCsvFile(csvContent: string): ParseResult {
  try {
    const records: string[][] = parseCsv(csvContent, {
      skip_empty_lines: true,
      relax_column_count: true,
    });

    if (records.length === 0) {
      return { fileType: 'csv', sections: [], totalChars: 0 };
    }

    const headers = records[0].map((h) => String(h).trim());
    const headerStr = headers.join(' | ');
    const sections: ExtractedSection[] = [];

    const rowsPerBatch = 25;
    for (let i = 1; i < records.length; i += rowsPerBatch) {
      const batch = records.slice(i, i + rowsPerBatch);
      const rowLines = batch.map((row, rIdx) => {
        const fields = row.map((cell, cIdx) => `${headers[cIdx] || `Col_${cIdx + 1}`}: ${cell}`).join(', ');
        return `[Row ${i + rIdx}] ${fields}`;
      });

      sections.push({
        content: `CSV Dataset (Columns: ${headerStr})\n${rowLines.join('\n')}`,
        sectionHeading: `Rows ${i} to ${Math.min(i + rowsPerBatch - 1, records.length - 1)}`,
        rowRange: `${i}-${Math.min(i + rowsPerBatch - 1, records.length - 1)}`,
      });
    }

    return {
      fileType: 'csv',
      sections,
      totalChars: csvContent.length,
    };
  } catch (err: any) {
    throw new Error(`Failed to parse CSV dataset: ${err.message}`);
  }
}

// 8. JSON (.json) Parser
function parseJson(jsonString: string): ParseResult {
  try {
    const parsed = JSON.parse(jsonString);
    const sections: ExtractedSection[] = [];

    if (Array.isArray(parsed)) {
      // Chunk array of objects into groups of 10
      const batchSize = 10;
      for (let i = 0; i < parsed.length; i += batchSize) {
        const slice = parsed.slice(i, i + batchSize);
        sections.push({
          content: JSON.stringify(slice, null, 2),
          sectionHeading: `Items ${i + 1} to ${Math.min(i + batchSize, parsed.length)}`,
          rowRange: `${i + 1}-${Math.min(i + batchSize, parsed.length)}`,
        });
      }
    } else if (typeof parsed === 'object' && parsed !== null) {
      // Top-level keys
      for (const [key, value] of Object.entries(parsed)) {
        sections.push({
          content: `Key: "${key}"\nValue:\n${JSON.stringify(value, null, 2)}`,
          sectionHeading: `Section: ${key}`,
        });
      }
    } else {
      sections.push({
        content: String(parsed),
        sectionHeading: 'JSON Root Value',
      });
    }

    return {
      fileType: 'json',
      sections,
      totalChars: jsonString.length,
    };
  } catch (err: any) {
    throw new Error(`Failed to parse JSON file: ${err.message}`);
  }
}

// 9. HTML (.html) Parser
function parseHtml(htmlContent: string): ParseResult {
  try {
    const $ = cheerio.load(htmlContent);

    // Remove script, style, nav, footer tags
    $('script, style, noscript, svg, nav, footer').remove();

    const sections: ExtractedSection[] = [];
    const docTitle = $('title').text().trim() || 'HTML Document';

    // Extract headings and associated paragraphs
    $('h1, h2, h3, h4, table, p').each((_idx, el) => {
      const tagName = el.tagName.toLowerCase();
      const text = $(el).text().trim();

      if (!text) return;

      if (tagName === 'table') {
        const tableRows: string[] = [];
        $(el).find('tr').each((_rIdx, tr) => {
          const cells: string[] = [];
          $(tr).find('th, td').each((_cIdx, cell) => {
            cells.push($(cell).text().trim());
          });
          if (cells.length > 0) tableRows.push(cells.join(' | '));
        });
        if (tableRows.length > 0) {
          sections.push({
            content: `HTML Table:\n${tableRows.join('\n')}`,
            sectionHeading: `${docTitle} - Table`,
          });
        }
      } else if (tagName.startsWith('h')) {
        sections.push({
          content: `${tagName.toUpperCase()}: ${text}`,
          sectionHeading: text,
        });
      } else if (text.length > 20) {
        sections.push({
          content: text,
          sectionHeading: docTitle,
        });
      }
    });

    return {
      fileType: 'html',
      sections: sections.length > 0 ? sections : [{ content: $('body').text().trim(), sectionHeading: docTitle }],
      totalChars: htmlContent.length,
    };
  } catch (err: any) {
    throw new Error(`Failed to parse HTML document: ${err.message}`);
  }
}
