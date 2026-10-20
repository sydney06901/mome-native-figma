import { describe, expect, it, vi } from 'vitest';

import { composeMaterialSheetPrompt, createIdempotentRunner, IMAGE_OUTPUT_CONFIG, validateMaterialSheetRequest } from './materialSheet';

const request = {
  creationSessionId: 'session', subjectVersion: 1, styleId: 'printmaking' as const, idempotencyKey: 'session:1:printmaking', mood: 'warm',
  subjects: [{ id: 's1', sourcePhotoId: 'p1', title: 'Door', description: 'Blue door' }],
  referenceImages: [{ photoId: 'p1', mimeType: 'image/png', imageData: 'aGVsbG8=' }],
};

describe('material sheet helpers', () => {
  it('rejects invalid counts, references, and style before invocation', () => {
    expect(() => validateMaterialSheetRequest({ ...request, subjects: [] })).toThrow();
    expect(() => validateMaterialSheetRequest({ ...request, subjects: Array(6).fill(request.subjects[0]) })).toThrow();
    expect(() => validateMaterialSheetRequest({ ...request, referenceImages: [] })).toThrow();
    expect(() => validateMaterialSheetRequest({ ...request, referenceImages: [{ ...request.referenceImages[0], photoId: 'wrong' }] })).toThrow();
    expect(() => validateMaterialSheetRequest({ ...request, styleId: 'oil' })).toThrow();
  });

  it('requires cuttable vertical elements, white background, no text, and no collage', () => {
    const prompt = composeMaterialSheetPrompt(validateMaterialSheetRequest(request));
    expect(prompt).toMatch(/pure white/i);
    expect(prompt).toMatch(/independent vertical/i);
    expect(prompt).toMatch(/no text/i);
    expect(prompt).toMatch(/not a collage/i);
    expect(IMAGE_OUTPUT_CONFIG).toEqual({ type: 'image', mime_type: 'image/png', aspect_ratio: '1:4', image_size: '2K' });
  });

  it('shares one model promise per identity and does not cache failures', async () => {
    const run = createIdempotentRunner<string>();
    const model = vi.fn(async () => 'image');
    const [a, b] = await Promise.all([run('same', model), run('same', model)]);
    expect([a, b]).toEqual(['image', 'image']);
    expect(model).toHaveBeenCalledTimes(1);
    await run('same', model);
    expect(model).toHaveBeenCalledTimes(1);

    const failing = vi.fn().mockRejectedValueOnce(new Error('no')).mockResolvedValueOnce('ok');
    await expect(run('failed', failing)).rejects.toThrow('no');
    await expect(run('failed', failing)).resolves.toBe('ok');
    expect(failing).toHaveBeenCalledTimes(2);
  });
});
