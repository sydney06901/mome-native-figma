import { describe, expect, it } from 'vitest';

import type { MomeSession, PrintableSheet } from '../domain';
import { createInitialMomeSession, momeReducer } from './momeReducer';

describe('momeReducer', () => {
  it('starts a genuinely new exploration and clears previous photos', () => {
    const previous = {
      ...createInitialMomeSession('old-session'),
      screen: 'exploring' as const,
      photos: [{ id: 'old-photo' }] as never[],
    };

    const next = momeReducer(previous, {
      type: 'START_NEW_EXPLORATION',
      sessionId: 'new-session',
      now: 20,
    });

    expect(next.id).toBe('new-session');
    expect(next.screen).toBe('prompt');
    expect(next.photos).toEqual([]);
  });

  it('goes back within a flow without replacing the session', () => {
    const state: MomeSession = {
      ...createInitialMomeSession('same-session'),
      screen: 'style' as const,
      history: ['home', 'prompt', 'exploring', 'subjects'],
    };

    const next = momeReducer(state, { type: 'BACK_WITHIN_FLOW' });

    expect(next.id).toBe('same-session');
    expect(next.screen).toBe('subjects');
  });

  it('stores the selected query and its acknowledgement', () => {
    const next = momeReducer(createInitialMomeSession('session'), {
      type: 'SELECT_SUGGESTION',
      suggestion: {
        id: 'buildings',
        label: 'Find buildings',
        query: 'Find memorable buildings for stickers',
        acknowledgement: 'Got it — let us explore them together!',
      },
    });

    expect(next.explorationQuery).toContain('buildings');
    expect(next.agentAcknowledgement).toContain('explore');
  });

  it('updates generation without changing analysis state', () => {
    const state = {
      ...createInitialMomeSession('session'),
      analysis: { status: 'reviewing' as const, reviewed: 4, total: 12, matched: 2 },
    };

    const next = momeReducer(state, {
      type: 'SET_GENERATION_STATUS',
      status: 'generating',
      taskId: 'generation-1',
    });

    expect(next.analysis).toEqual(state.analysis);
    expect(next.generation.status).toBe('generating');
  });

  it('marks a completed sheet as eligible for the media library', () => {
    const state = createInitialMomeSession('session');
    const sheet: PrintableSheet = {
      id: 'sheet-1',
      creationSessionId: state.id,
      sourcePhotoIds: ['photo-1'],
      subjectIds: ['subject-1'],
      styleId: 'printmaking' as const,
      imageBlob: new Blob(['image'], { type: 'image/png' }),
      mimeType: 'image/png',
      aspectRatio: '1:4' as const,
      imageSize: '2K' as const,
      printWidthMm: 58 as const,
      createdAt: 10,
      libraryEligible: false,
    };

    const next = momeReducer(state, { type: 'COMPLETE_SHEET', sheet });

    expect(next.generation.status).toBe('completed');
    if (next.generation.status !== 'completed') throw new Error('Expected completed generation');
    expect(next.generation.sheet.libraryEligible).toBe(true);
    expect(next.screen).toBe('result');
  });
});
