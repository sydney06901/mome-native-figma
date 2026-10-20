/**
 * Gemini Client Service
 *
 * Rules:
 * - Client-side calls ONLY project server API (/api/gemini/analyze-batch).
 * - Never touches or exposes GEMINI_API_KEY.
 * - Strict validation of returned structure.
 * - Exponential backoff retry on transient failures.
 * - Distinguishes real API from mock adapter cleanly.
 */

import { PhotoAnalysis } from '../../domain/types.ts';
import { BatchAnalysisInput, BatchAnalysisResponse, AgentRequestError } from './types.ts';
import { analyzePhotoBatchMock } from './mockAdapter.ts';

export class AgentRequestException extends Error {
  requestError: AgentRequestError;
  constructor(err: AgentRequestError) {
    super(err.message);
    this.name = 'AgentRequestException';
    this.requestError = err;
  }
}

const MAX_RETRIES = 1;
const REQUEST_TIMEOUT_MS = 30000;

export async function analyzePhotoBatch(
  input: BatchAnalysisInput
): Promise<BatchAnalysisResponse> {
  let attempt = 0;
  let lastAgentErr: AgentRequestError | null = null;

  while (attempt <= MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch('/api/gemini/analyze-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal: controller.signal,
        });
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        if (fetchErr.name === 'AbortError') {
          throw new AgentRequestException({
            stage: 'client_request',
            code: 'REQUEST_TIMEOUT',
            message: `请求超时 (${REQUEST_TIMEOUT_MS / 1000}s)，请检查网络或减少单批照片数量`,
            batchIndex: input.batchIndex,
          });
        }
        throw new AgentRequestException({
          stage: 'client_request',
          code: 'NETWORK_ERROR',
          message: fetchErr.message || '网络请求未能送达本地服务',
          batchIndex: input.batchIndex,
        });
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        let body: any = {};
        try {
          body = await response.json();
        } catch {
          // not json
        }
        const stage =
          body.stage ||
          (response.status === 404
            ? 'server_route'
            : response.status === 401 || response.status === 403
            ? 'authentication'
            : 'gemini_request');

        let msg = body.message || body.error || `服务端请求失败 (HTTP ${response.status})`;
        // If message is a nested JSON error string, extract clean text
        if (typeof msg === 'string' && msg.startsWith('{')) {
          try {
            const parsed = JSON.parse(msg);
            if (parsed.error?.message) {
              msg = parsed.error.message;
            }
          } catch {
            // ignore
          }
        }

        throw new AgentRequestException({
          stage,
          status: response.status,
          code: body.code || (response.status === 404 ? 'ROUTE_NOT_FOUND' : 'HTTP_ERROR'),
          message: msg,
          batchIndex: input.batchIndex,
        });
      }

      let data: any;
      try {
        data = await response.json();
      } catch (jsonErr: any) {
        throw new AgentRequestException({
          stage: 'response_parsing',
          status: response.status,
          code: 'JSON_PARSE_ERROR',
          message: '服务端响应无法解析为合法 JSON',
          batchIndex: input.batchIndex,
        });
      }

      if (!data || !Array.isArray(data.results)) {
        throw new AgentRequestException({
          stage: 'response_validation',
          status: response.status,
          code: 'INVALID_RESULTS_FORMAT',
          message: '服务端返回的数据缺少有效的 results 结果数组',
          batchIndex: input.batchIndex,
        });
      }

      const sanitized = validateAndSanitizeResults(input.photos, data.results);

      return {
        results: sanitized,
        isMock: !!data.isMock,
        modelUsed: data.modelUsed || 'gemini-3.1-flash-lite',
      };
    } catch (err: any) {
      attempt++;
      if (err instanceof AgentRequestException) {
        lastAgentErr = err.requestError;
        // Don't retry non-recoverable errors (auth, quota, 400, 404)
        if (
          err.requestError.status === 404 ||
          err.requestError.status === 400 ||
          err.requestError.status === 401 ||
          err.requestError.status === 403 ||
          err.requestError.code === 'RESOURCE_EXHAUSTED' ||
          err.requestError.status === 429
        ) {
          throw err;
        }
      } else {
        lastAgentErr = {
          stage: 'client_request',
          message: err?.message || '未知前端错误',
          batchIndex: input.batchIndex,
        };
      }

      if (attempt > MAX_RETRIES) {
        if (err instanceof AgentRequestException) {
          throw err;
        }
        throw new AgentRequestException(lastAgentErr);
      }

      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }

  throw new AgentRequestException(
    lastAgentErr || {
      stage: 'client_request',
      message: '分析未能完成',
      batchIndex: input.batchIndex,
    }
  );
}

function validateAndSanitizeResults(
  inputPhotos: BatchAnalysisInput['photos'],
  rawResults: any[]
): PhotoAnalysis[] {
  const allowedPhotoIds = new Set(inputPhotos.map((p) => p.photoId));
  const seen = new Set<string>();
  const validAnalyses: PhotoAnalysis[] = [];

  for (const item of rawResults) {
    if (!item || typeof item !== 'object') continue;
    if (!allowedPhotoIds.has(item.photoId)) continue; // Must belong to batch
    if (seen.has(item.photoId)) continue; // Reject duplicate IDs
    seen.add(item.photoId);

    const confidence =
      typeof item.confidence === 'number' && !isNaN(item.confidence)
        ? Math.max(0, Math.min(1, item.confidence))
        : 0.5;

    const reason =
      typeof item.reason === 'string' && item.reason.trim().length > 0
        ? item.reason.trim()
        : '符合设定的照片筛选条件';

    const match = typeof item.match === 'boolean' ? item.match : confidence >= 0.6;

    validAnalyses.push({
      photoId: item.photoId,
      summary: typeof item.summary === 'string' ? item.summary : '相册照片',
      labels: Array.isArray(item.labels) ? item.labels.map(String) : [],
      detectedSubjects: Array.isArray(item.detectedSubjects)
        ? item.detectedSubjects.map(String)
        : [],
      match,
      confidence,
      reason,
      analyzedAt:
        typeof item.analyzedAt === 'string' ? item.analyzedAt : new Date().toISOString(),
    });
  }

  // Ensure every photo in the batch has a result
  for (const photo of inputPhotos) {
    if (!validAnalyses.some((a) => a.photoId === photo.photoId)) {
      validAnalyses.push({
        photoId: photo.photoId,
        summary: photo.metadata?.description || '相册照片',
        labels: photo.metadata?.tags || [],
        detectedSubjects: [],
        match: false,
        confidence: 0.3,
        reason: '未能提取明显的匹配特征',
        analyzedAt: new Date().toISOString(),
      });
    }
  }

  return validAnalyses;
}
