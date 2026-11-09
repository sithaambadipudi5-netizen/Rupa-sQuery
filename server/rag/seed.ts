import fs from 'fs';
import path from 'path';
import { RagStorage } from './storage';
import { parseDocumentFile } from './parsers';
import { chunkExtractedSections } from './chunker';
import { generateBatchEmbeddings } from './embeddings';
import { upsertChunksToVectorStore } from './vectorStore';
import { UploadedDocumentRecord } from './types';

export async function seedInitialDocumentsIfNeeded(): Promise<void> {
  const existingDocs = RagStorage.listDocuments('default_user');
  if (existingDocs.length > 0) {
    return;
  }

  const sampleDocPath = path.join(RagStorage.getUploadDir(), 'RUPA_SQL_Database_Mastery_Guide.md');
  const sampleContent = `# RUPA's Query: Interactive SQL & Database Systems Knowledge Guide
Author: Ambadipudi Rupavani

## Section 1: Relational Database Architecture & Integrity
Relational database management systems (RDBMS) organize data into structured tables consisting of rows and columns.
Key constraints enforce data integrity:
- **Primary Key (PK)**: A unique, non-null identifier for each record in a relation.
- **Foreign Key (FK)**: A referential constraint linking a column to a primary key in another table.
- **Unique Constraint**: Ensures all values in a column are distinct while allowing one NULL.
- **Check Constraint**: Enforces domain-specific boolean rules (e.g., \`salary > 0\`).

## Section 2: ANSI SQL Clauses & Execution Order
Standard SQL clauses are evaluated by relational engines in a specific logical processing order:
1. \`FROM\` & \`JOIN\`: Identifies tables and builds intermediate Cartesian or joined sets.
2. \`WHERE\`: Filters rows prior to grouping. Cannot reference aggregate functions.
3. \`GROUP BY\`: Aggregates filtered rows into distinct bucket partitions.
4. \`HAVING\`: Filters aggregated groups based on summary conditions (e.g., \`COUNT(*) > 5\`).
5. \`SELECT\`: Projects desired columns, expressions, and column aliases.
6. \`DISTINCT\`: Eliminates duplicate rows from the projected result.
7. \`ORDER BY\`: Sorts the resulting records (ASC or DESC).
8. \`LIMIT\` / \`OFFSET\`: Restricts the returned page size and row offset.

## Section 3: Relational JOINs
SQL supports several join types to correlate data across multiple entities:
- **INNER JOIN**: Returns only matching rows where join conditions evaluate to true in both relations.
- **LEFT (OUTER) JOIN**: Preserves all records from the left relation, substituting NULL placeholders when no matching record exists in the right relation.
- **RIGHT (OUTER) JOIN**: Preserves all records from the right relation, inserting NULL for missing left records.
- **FULL OUTER JOIN**: Combines left and right joins, preserving all rows from both tables.
- **CROSS JOIN**: Produces the Cartesian product of every row in table A with every row in table B.

## Section 4: Database Normalization (1NF, 2NF, 3NF, BCNF)
Normalization reduces data redundancy and prevents insert, update, and delete anomalies:
- **1NF (First Normal Form)**: Requires atomic (indivisible) column values, a defined primary key, and no repeating groups.
- **2NF (Second Normal Form)**: Must be in 1NF and eliminate partial functional dependencies (all non-key attributes must depend on the whole primary key).
- **3NF (Third Normal Form)**: Must be in 2NF and eliminate transitive dependencies (non-key attributes must not depend on other non-key attributes).
- **BCNF (Boyce-Codd Normal Form)**: A stricter version of 3NF where every determinant must be a candidate key.

## Section 5: Modern SQL Window Functions
Window functions calculate aggregate or analytical metrics over a window of rows while preserving individual row identity:
- \`ROW_NUMBER()\`: Assigns a strict sequential integer (1, 2, 3...) to each row within a partition.
- \`RANK()\`: Assigns identical ranks to ties and skips subsequent rank numbers (e.g., 1, 2, 2, 4).
- \`DENSE_RANK()\`: Assigns identical ranks to ties without skipping subsequent ranks (e.g., 1, 2, 2, 3).
- \`LEAD()\` and \`LAG()\`: Accesses data from following or preceding rows without a self-join.
`;

  try {
    fs.writeFileSync(sampleDocPath, sampleContent, 'utf-8');

    const docId = `doc_seed_${Date.now()}`;
    const parsed = await parseDocumentFile(sampleDocPath, 'RUPA_SQL_Database_Mastery_Guide.md', 'text/markdown');

    const docRecord: UploadedDocumentRecord = {
      id: docId,
      userId: 'default_user',
      name: 'RUPA_SQL_Database_Mastery_Guide.md',
      originalName: 'RUPA_SQL_Database_Mastery_Guide.md',
      fileType: 'md',
      mimeType: 'text/markdown',
      fileSize: Buffer.byteLength(sampleContent),
      filePath: sampleDocPath,
      totalChunks: 0,
      status: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    RagStorage.saveDocument(docRecord);

    const chunks = chunkExtractedSections(
      parsed.sections,
      docId,
      docRecord.name,
      'default_user',
      { chunkSize: 650, chunkOverlap: 80 }
    );

    const texts = chunks.map((c) => c.content);
    const embeddings = await generateBatchEmbeddings(texts);

    chunks.forEach((c, idx) => {
      c.embedding = embeddings[idx];
    });

    RagStorage.saveChunks(docId, chunks);
    await upsertChunksToVectorStore(chunks, embeddings);

    RagStorage.updateDocumentStatus(docId, 'ready', chunks.length);
    console.log(`Seeded default knowledge document: ${docRecord.name} with ${chunks.length} chunks`);
  } catch (err) {
    console.warn('Failed to seed initial RAG document:', err);
  }
}
