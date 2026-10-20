import { describe, expect, it, vi } from 'vitest';

import type { MomeSession } from '../domain';
import { buildMaterialSheetRequest, MaterialSheetGenerationController } from './generationController';

function session(): MomeSession {
  return {
    id: 'session-1', screen: 'generating', history: [], explorationQuery: 'buildings', agentAcknowledgement: '', suggestions: [],
    photos: [
      { id: 'p1', sessionId: 'session-1', fileName: 'one.jpg', mimeType: 'image/jpeg', width: 100, height: 200, thumbnailBlob: new Blob(), originalBlob: new Blob(['one'], { type: 'image/jpeg' }), importedAt: 1 },
      { id: 'p2', sessionId: 'session-1', fileName: 'two.png', mimeType: 'image/png', width: 100, height: 200, thumbnailBlob: new Blob(), originalBlob: new Blob(['two'], { type: 'image/png' }), importedAt: 2 },
    ], candidates: [],
    subjects: [
      { id: 's1', sourcePhotoId: 'p1', label: 'Door', description: 'Blue door', enabled: true, order: 0 },
      { id: 's2', sourcePhotoId: 'p2', label: 'Cat', description: 'Sleeping cat', enabled: true, order: 1 },
    ],
    styleId: 'printmaking', analysis: { status: 'completed', reviewed: 2, total: 2, matched: 2 }, generation: { status: 'idle' }, storageError: null, createdAt: 1, updatedAt: 1,
  };
}

describe('material sheet generation controller', () => {
  it('builds one bounded request with a stable generation identity', async () => {
    const request = await buildMaterialSheetRequest(session(), async (blob) => `data:${blob.type};base64,QQ==`);
    expect(request.subjects).toHaveLength(2);
    expect(request.referenceImages).toHaveLength(2);
    expect(request.styleId).toBe('printmaking');
    expect(request.idempotencyKey).toBe(`session-1:${request.subjectVersion}:printmaking`);
  });

  it('deduplicates repeated clicks for the same identity', async () => {
    const api = vi.fn(async () => ({ success: true as const, creationSessionId: 'session-1', idempotencyKey: 'session-1:1:printmaking', sheet: { mimeType: 'image/png', base64Data: 'QQ==', dataUrl: 'data:image/png;base64,QQ==', generatedAt: 1, aspectRatio: '1:4' as const, imageSize: '2K' as const, printWidthMm: 58 as const } }));
    const controller = new MaterialSheetGenerationController(api);
    const request = await buildMaterialSheetRequest(session(), async (blob) => `data:${blob.type};base64,QQ==`);
    const signal = new AbortController().signal;
    const [a, b] = await Promise.all([controller.generate(request, signal), controller.generate(request, signal)]);
    expect(api).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });
});
