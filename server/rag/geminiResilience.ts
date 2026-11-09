import { GoogleGenAI } from '@google/genai';

interface RetryOptions {
  models?: string[];
  contents: any;
  config?: any;
  maxRetriesPerModel?: number;
  baseDelayMs?: number;
}

/**
 * Extracts retry delay from Gemini 429 RESOURCE_EXHAUSTED errors if provided
 * by the Google API headers or error payload (e.g. retryDelay: "4s" or "Please retry in 4.33s").
 */
export function extractRetryDelayMs(err: any, fallbackMs: number = 3000): number {
  if (!err) return fallbackMs;

  const errStr = typeof err === 'string' ? err : `${err.message || ''} ${JSON.stringify(err.details || '')}`;

  // Check for RetryInfo in details array
  if (err.details && Array.isArray(err.details)) {
    const retryInfo = err.details.find((d: any) => d['@type']?.includes('RetryInfo') || d.retryDelay);
    if (retryInfo && retryInfo.retryDelay) {
      const match = String(retryInfo.retryDelay).match(/([\d\.]+)s/);
      if (match) {
        return Math.ceil(parseFloat(match[1]) * 1000) + 500;
      }
    }
  }

  // Check for "retry in Xs" or "retry in X.XXs" in error message
  const match = errStr.match(/retry in ([\d\.]+)s/i);
  if (match) {
    return Math.ceil(parseFloat(match[1]) * 1000) + 500;
  }

  return fallbackMs;
}

export function isRateLimitError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.code || err.statusCode;
  if (status === 429 || status === 'RESOURCE_EXHAUSTED') return true;

  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota exceeded') ||
    msg.includes('rate limit') ||
    msg.includes('free tier')
  );
}

/**
 * Robust Gemini model invocation with exponential backoff, retryDelay parsing,
 * and seamless fallback across Free Tier supported models.
 */
export async function callGeminiWithResilience(
  ai: GoogleGenAI,
  options: RetryOptions
): Promise<{ text: string; modelUsed: string } | null> {
  const models = options.models && options.models.length > 0
    ? options.models
    : ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite'];

  const maxRetries = options.maxRetriesPerModel ?? 2;
  const baseDelay = options.baseDelayMs ?? 2000;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });

        if (response && response.text) {
          return {
            text: response.text,
            modelUsed: model,
          };
        }
      } catch (err: any) {
        const rateLimited = isRateLimitError(err);

        if (rateLimited && attempt < maxRetries) {
          const delayMs = extractRetryDelayMs(
            err,
            Math.min(baseDelay * Math.pow(1.8, attempt) + Math.random() * 500, 8000)
          );
          console.info(
            `[Gemini Resilience] Free tier rate limit (429) on ${model}. Pausing ${Math.round(delayMs)}ms before retry ${attempt + 1}/${maxRetries}...`
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        if (rateLimited) {
          console.info(
            `[Gemini Resilience] Quota reached for ${model} after ${attempt + 1} attempts. Testing next model in fallback hierarchy...`
          );
          break; // Break retry loop to try next model in hierarchy
        }

        // For non-rate-limit errors (e.g. invalid arguments), log and break to next model
        console.warn(`[Gemini Resilience] Model ${model} encountered error:`, err.message || err);
        break;
      }
    }
  }

  return null;
}
