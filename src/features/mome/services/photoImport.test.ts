import { describe, expect, it } from 'vitest';

import type { MomePhoto } from '../domain';
import { importPhotos, MAX_PHOTO_SELECTION } from './photoImport';

function imageFile(index: number, type = 'image/jpeg', size = 4): File {
  return new File([new Uint8Array(size)], `photo-${index}.jpg`, { type });
}

const processPhoto = async (file: File, sessionId: string, index: number): Promise<MomePhoto> => ({
  id: `${sessionId}-${index}`,
  sessionId,
  fileName: file.name,
  mimeType: file.type as MomePhoto['mimeType'],
  width: 10,
  height: 20,
  thumbnailBlob: file,
  originalBlob: file,
  importedAt: index,
});

describe('importPhotos', () => {
  it.each([0, 1, 5, 12, 50, 200])('accepts the valid bounded count %i', async (count) => {
    const result = await importPhotos(Array.from({ length: count }, (_, index) => imageFile(index)), {
      sessionId: 'session',
      processPhoto,
    });
    expect(result.accepted).toHaveLength(count);
  });

  it('accepts exactly 200 and reports photo 201+', async () => {
    const result = await importPhotos(Array.from({ length: 201 }, (_, index) => imageFile(index)), {
      sessionId: 'session',
      processPhoto,
    });
    expect(result.accepted).toHaveLength(MAX_PHOTO_SELECTION);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].reason).toMatch(/200/);
  });

  it('rejects unsupported MIME and oversized input', async () => {
    const result = await importPhotos([
      imageFile(1, 'image/gif'),
      imageFile(2, 'image/png', 25 * 1024 * 1024 + 1),
    ], { sessionId: 'session', processPhoto });
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected.map((item) => item.code)).toEqual(['UNSUPPORTED_TYPE', 'FILE_TOO_LARGE']);
  });

  it('never processes more than four photos at once', async () => {
    let active = 0;
    let peak = 0;
    await importPhotos(Array.from({ length: 20 }, (_, index) => imageFile(index)), {
      sessionId: 'session',
      processPhoto: async (...args) => {
        active += 1;
        peak = Math.max(peak, active);
        await Promise.resolve();
        const value = await processPhoto(...args);
        active -= 1;
        return value;
      },
    });
    expect(peak).toBeLessThanOrEqual(4);
  });
});
