import initSqlJs, { Database } from 'sql.js';
import { PRACTICE_DATABASES } from '../data/practiceDatabases';
import { QueryResult, ValidationResult } from '../types';

// Cache active database instances
const dbInstances = new Map<string, Database>();
let SQL: any = null;
let sqlInitPromise: Promise<any> | null = null;

async function fetchWasmBinary(): Promise<ArrayBuffer | null> {
  const candidateUrls = [
    '/sql-wasm.wasm',
    '/assets/sql-wasm.wasm',
    'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-wasm.wasm',
    'https://unpkg.com/sql.js@1.14.2/dist/sql-wasm.wasm',
    'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.2/sql-wasm.wasm',
    'https://sql.js.org/dist/sql-wasm.wasm',
  ];

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        if (buffer && buffer.byteLength > 1000) {
          return buffer;
        }
      }
    } catch {
      // Continue to next candidate
    }
  }
  return null;
}

async function getSqlJs() {
  if (SQL) return SQL;
  if (sqlInitPromise) return sqlInitPromise;

  sqlInitPromise = (async () => {
    try {
      const binary = await fetchWasmBinary();
      if (binary) {
        SQL = await initSqlJs({ wasmBinary: binary });
        return SQL;
      }
    } catch (e) {
      console.warn('Direct WASM binary instantiation failed, attempting locateFile...', e);
    }

    try {
      SQL = await initSqlJs({
        locateFile: (file: string) => `/${file}`,
      });
      return SQL;
    } catch (e2) {
      console.warn('Local locator failed, attempting CDN locator...', e2);
      SQL = await initSqlJs({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/${file}`,
      });
      return SQL;
    }
  })();

  return sqlInitPromise;
}

export async function getOrInitDatabase(dbId: string): Promise<Database> {
  if (dbInstances.has(dbId)) {
    return dbInstances.get(dbId)!;
  }

  const sqlLib = await getSqlJs();
  const db = new sqlLib.Database();

  const dbSchema = PRACTICE_DATABASES.find((d) => d.id === dbId) || PRACTICE_DATABASES[0];
  if (dbSchema) {
    db.run(dbSchema.initSql);
  }

  dbInstances.set(dbId, db);
  return db;
}

export async function resetDatabase(dbId: string): Promise<void> {
  if (dbInstances.has(dbId)) {
    const db = dbInstances.get(dbId)!;
    db.close();
    dbInstances.delete(dbId);
  }
  await getOrInitDatabase(dbId);
}

export async function executeSqlQuery(
  dbId: string,
  query: string,
  maxRows = 500
): Promise<QueryResult> {
  const startTime = performance.now();
  const trimmed = query.trim();

  if (!trimmed) {
    return {
      columns: [],
      values: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: 'Query string is empty. Please enter a valid SQL query.',
    };
  }

  try {
    const db = await getOrInitDatabase(dbId);

    // Guard against harmful operations in practice sandbox
    const dangerousPatterns = [/ATTACH\s+DATABASE/i, /DETACH\s+DATABASE/i, /PRAGMA\s+writable_schema/i];
    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        return {
          columns: [],
          values: [],
          rowCount: 0,
          executionTimeMs: 0,
          error: 'Security Notice: This administrative command is restricted in the practice sandbox.',
        };
      }
    }

    const res = db.exec(trimmed);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    if (!res || res.length === 0) {
      return {
        columns: ['status'],
        values: [['Query executed successfully. (0 rows affected / no output returned)']],
        rowCount: 0,
        executionTimeMs,
      };
    }

    const firstResult = res[res.length - 1]; // Return the last statement's output
    const columns = firstResult.columns;
    const allValues = firstResult.values;
    const values = allValues.slice(0, maxRows);

    return {
      columns,
      values,
      rowCount: allValues.length,
      executionTimeMs,
    };
  } catch (error: any) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      columns: [],
      values: [],
      rowCount: 0,
      executionTimeMs,
      error: formatSqlError(error.message || String(error)),
    };
  }
}

function formatSqlError(raw: string): string {
  if (raw.includes('no such table')) {
    const match = raw.match(/no such table:\s*(\w+)/i);
    return `Table not found: "${match ? match[1] : 'unknown'}". Please inspect the Schema Explorer on the left to verify table names.`;
  }
  if (raw.includes('no such column')) {
    const match = raw.match(/no such column:\s*([\w.]+)/i);
    return `Column not found: "${match ? match[1] : 'unknown'}". Please check spelling or verify if you need to prefix it with the table name.`;
  }
  if (raw.includes('syntax error')) {
    return `SQL Syntax Error: Please check your query near: ${raw.replace(/.*syntax error near/i, 'near')}`;
  }
  if (raw.includes('misuse of aggregate function')) {
    return `Aggregate Function Misuse: In SQL, aggregate functions like COUNT() or SUM() cannot be used directly in the WHERE clause. Use a HAVING clause or subquery instead.`;
  }
  return raw;
}

export const executeQuery = executeSqlQuery;

export async function validateSolution(
  dbId: string,
  userSql: string,
  expectedSql: string,
  xpReward = 20
) {
  const res = await validateUserQuery(dbId, userSql, expectedSql, xpReward);
  return {
    isCorrect: res.success,
    feedback: res.message,
    ...res,
  };
}

export async function validateUserQuery(
  dbId: string,
  userQuery: string,
  expectedQuery: string,
  xpReward = 20
): Promise<ValidationResult> {
  const userResult = await executeSqlQuery(dbId, userQuery);

  if (userResult.error) {
    return {
      success: false,
      message: `Execution Error: ${userResult.error}`,
      userResult,
    };
  }

  const expectedResult = await executeSqlQuery(dbId, expectedQuery);

  if (expectedResult.error) {
    console.error('Expected query configuration error:', expectedResult.error);
  }

  // Compare Column Counts
  if (userResult.columns.length !== expectedResult.columns.length) {
    return {
      success: false,
      message: `Column count mismatch: Expected ${expectedResult.columns.length} columns (${expectedResult.columns.join(', ')}), but your query returned ${userResult.columns.length} columns (${userResult.columns.join(', ')}).`,
      userResult,
      expectedResult,
    };
  }

  // Compare Row Counts
  if (userResult.rowCount !== expectedResult.rowCount) {
    return {
      success: false,
      message: `Row count mismatch: Expected ${expectedResult.rowCount} rows, but your query returned ${userResult.rowCount} rows. Check your filtering WHERE conditions or JOIN clauses.`,
      userResult,
      expectedResult,
    };
  }

  // Check data values comparison (normalized)
  const isValuesMatch = compareResultValues(userResult.values, expectedResult.values);

  if (!isValuesMatch) {
    return {
      success: false,
      message: `Data mismatch: Your query executed and returned ${userResult.rowCount} rows, but the values do not match the expected solution. Check your calculations, column selections, or sorting ORDER BY criteria.`,
      userResult,
      expectedResult,
    };
  }

  return {
    success: true,
    message: `✓ Correct! Your query executed successfully and matched the expected dataset perfectly!`,
    userResult,
    expectedResult,
    xpEarned: xpReward,
  };
}

function compareResultValues(userRows: any[][], expectedRows: any[][]): boolean {
  if (userRows.length !== expectedRows.length) return false;

  for (let i = 0; i < userRows.length; i++) {
    const uRow = userRows[i];
    const eRow = expectedRows[i];

    if (uRow.length !== eRow.length) return false;

    for (let j = 0; j < uRow.length; j++) {
      let uVal = uRow[j];
      let eVal = eRow[j];

      // Handle nulls
      if (uVal === null || uVal === undefined) {
        if (eVal !== null && eVal !== undefined) return false;
        continue;
      }

      // Handle numeric comparisons (e.g. 199.99 vs "199.99")
      if (!isNaN(Number(uVal)) && !isNaN(Number(eVal))) {
        if (Math.abs(Number(uVal) - Number(eVal)) > 0.001) return false;
      } else {
        // String comparison case-insensitive & trimmed
        if (String(uVal).trim().toLowerCase() !== String(eVal).trim().toLowerCase()) {
          return false;
        }
      }
    }
  }

  return true;
}
