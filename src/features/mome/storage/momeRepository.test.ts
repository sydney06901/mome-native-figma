import { describe, expect, it } from 'vitest';

import type { MomePhoto, PrintableSheet } from '../domain';
import { createInitialMomeSession } from '../state/momeReducer';
import {
  InMemoryMomeStorage,
  MomeRepository,
  type MomeStorageAdapter,
} from './momeRepository';

function photo(sessionId: string): MomePhoto {
  return {
    id: 'photo-1',
    sessionId,
    fileName: 'memory.png',
    mimeType: 'image/png',
    width: 12,
    height: 24,
    thumbnailBlob: new Blob(['thumb'], { type: 'image/png' }),
    originalBlob: new Blob(['original'], { type: 'image/png' }),
    importedAt: 1,
  };
}

describe('MomeRepository', () => {
  it('saves and loads the active session', async () => {
    const repository = new MomeRepository(new InMemoryMomeStorage());
    const session = createInitialMomeSession('session-1', 1);

    await repository.saveSession(session);

    expect((await repository.loadActiveSession())?.id).toBe('session-1');
  });

  it('round-trips photo blobs', async () => {
    const repository = new MomeRepository(new InMemoryMomeStorage());
    const stored = photo('session-1');

    await repository.savePhoto(stored);
    const loaded = await repository.loadPhotos('session-1');

    expect(loaded[0].originalBlob).toBeInstanceOf(Blob);
    expect(loaded[0].originalBlob.size).toBe(8);
    expect(loaded[0].thumbnailBlob).toBeInstanceOf(Blob);
    expect(loaded[0].thumbnailBlob.size).toBe(5);
  });

  it('promotes only completed sheets to the library', async () => {
    const repository = new MomeRepository(new InMemoryMomeStorage());
    const sheet: PrintableSheet = {
      id: 'sheet-1',
      creationSessionId: 'session-1',
      sourcePhotoIds: ['photo-1'],
      subjectIds: ['subject-1'],
      styleId: 'pixel-art',
      imageBlob: new Blob(['png'], { type: 'image/png' }),
      mimeType: 'image/png',
      aspectRatio: '1:4',
      imageSize: '2K',
      printWidthMm: 58,
      createdAt: 3,
      libraryEligible: true,
    };

    await repository.saveLibrarySheet(sheet);

    expect(await repository.loadLibrarySheets()).toHaveLength(1);
  });

  it('replaces the active pointer when a fresh session is saved', async () => {
    const repository = new MomeRepository(new InMemoryMomeStorage());
    await repository.saveSession(createInitialMomeSession('old', 1));
    await repository.saveSession(createInitialMomeSession('fresh', 2));

    expect((await repository.loadActiveSession())?.id).toBe('fresh');
  });

  it('maps quota errors without mutating the in-memory session', async () => {
    const adapter: MomeStorageAdapter = {
      get: async () => undefined,
      getAll: async () => [],
      delete: async () => undefined,
      put: async () => {
        throw new DOMException('Disk full', 'QuotaExceededError');
      },
    };
    const repository = new MomeRepository(adapter);
    const session = createInitialMomeSession('session', 1);
    const snapshot = structuredClone(session);

    await expect(repository.saveSession(session)).rejects.toMatchObject({
      code: 'STORAGE_QUOTA',
      message: 'Disk full',
    });
    expect(session).toEqual(snapshot);
  });
});
