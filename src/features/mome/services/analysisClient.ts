import type { PhotoAnalysis } from '../../../domain/types';
import type { MomePhoto } from '../domain';
import type { VisualReviewResult } from '../review/visualReviewPlayer';

export interface AnalysisResult extends VisualReviewResult {
  summary: string;
  labels: string[];
  detectedSubjects: string[];
  confidence: number;
  reason: string;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read photo'));
    reader.readAsDataURL(blob);
  });
}

export async function analyzePhotoBatch(
  photos: MomePhoto[],
  options: { taskId: string; query: string; batchIndex: number; totalBatches: number; signal?: AbortSignal },
): Promise<AnalysisResult[]> {
  const payloadPhotos = await Promise.all(photos.map(async (photo) => ({
    id: photo.id,
    name: photo.fileName,
    imageData: await blobToDataUrl(photo.thumbnailBlob),
  })));
  const response = await fetch('/api/gemini/analyze-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: options.signal,
    body: JSON.stringify({ taskId: options.taskId, userQuery: options.query, photos: payloadPhotos, batchIndex: options.batchIndex, totalBatches: options.totalBatches }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Gemini analysis failed (HTTP ${response.status})`);
  }
  const body = await response.json();
  if (!Array.isArray(body.results)) throw new Error('Gemini analysis returned no results');
  return body.results.map((result: PhotoAnalysis) => ({
    photoId: result.photoId,
    summary: result.summary || '',
    labels: Array.isArray(result.labels) ? result.labels : [],
    detectedSubjects: Array.isArray(result.detectedSubjects) ? result.detectedSubjects : [],
    match: Boolean(result.match),
    confidence: Number(result.confidence) || 0,
    reason: result.reason || '',
  }));
}
