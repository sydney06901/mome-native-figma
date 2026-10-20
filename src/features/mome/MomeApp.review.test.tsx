import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MomePhoto, MomeSession } from './domain';
import { MomeApp } from './MomeApp';

const mocks = vi.hoisted(() => ({
  analyzePhotoBatch: vi.fn(),
  dispatch: vi.fn(),
  useMomeSession: vi.fn(),
}));

vi.mock('./services/analysisClient', () => ({
  analyzePhotoBatch: mocks.analyzePhotoBatch,
}));

vi.mock('./state/useMomeSession', () => ({
  useMomeSession: mocks.useMomeSession,
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function makePhoto(index: number): MomePhoto {
  const blob = new Blob([`photo-${index}`], { type: 'image/png' });
  return {
    id: `photo-${index}`,
    sessionId: 'session',
    fileName: `photo-${index}.png`,
    mimeType: 'image/png',
    width: 20,
    height: 30,
    thumbnailBlob: blob,
    originalBlob: blob,
    importedAt: index,
  };
}

function makeExploringSession(): MomeSession {
  return {
    id: 'session',
    screen: 'exploring',
    history: ['home', 'prompt'],
    explorationQuery: 'Find buildings',
    agentAcknowledgement: '',
    suggestions: [],
    photos: Array.from({ length: 24 }, (_, index) => makePhoto(index)),
    candidates: [],
    subjects: [],
    styleId: null,
    analysis: { status: 'idle', reviewed: 0, total: 24, matched: 0 },
    generation: { status: 'idle' },
    storageError: null,
    createdAt: 1,
    updatedAt: 1,
  };
}

beforeEach(() => {
  mocks.analyzePhotoBatch.mockReset();
  mocks.dispatch.mockReset();
  mocks.useMomeSession.mockReturnValue({
    session: makeExploringSession(),
    dispatch: mocks.dispatch,
    hydrated: true,
    repositoryError: null,
  });
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: (blob: Blob) => `blob:${blob.size}`,
    revokeObjectURL: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('MomeApp AI review', () => {
  it('starts the visual review when the first Gemini batch finishes', async () => {
    const firstBatch = deferred<Array<{ photoId: string; summary: string; labels: string[]; detectedSubjects: string[]; match: boolean; confidence: number; reason: string }>>();
    const secondBatch = deferred<Array<{ photoId: string; summary: string; labels: string[]; detectedSubjects: string[]; match: boolean; confidence: number; reason: string }>>();
    mocks.analyzePhotoBatch
      .mockReturnValueOnce(firstBatch.promise)
      .mockReturnValueOnce(secondBatch.promise);

    render(<MomeApp />);
    fireEvent.click(screen.getByRole('button', { name: /start ai review/i }));

    await act(async () => {
      firstBatch.resolve([
        {
          photoId: 'photo-0',
          summary: 'A stone building',
          labels: ['building'],
          detectedSubjects: ['building'],
          match: true,
          confidence: 0.92,
          reason: 'Clear silhouette',
        },
      ]);
      await Promise.resolve();
      await Promise.resolve();
    });

    const startedBeforeAllBatchesFinished = screen.queryByText('Moving…') !== null;

    fireEvent.click(screen.getByRole('button', { name: /stop/i }));
    await act(async () => {
      secondBatch.resolve([]);
      await Promise.resolve();
    });

    expect(startedBeforeAllBatchesFinished).toBe(true);
  });
});
