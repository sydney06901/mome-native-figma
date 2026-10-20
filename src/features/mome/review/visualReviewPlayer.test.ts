import { afterEach, describe, expect, it, vi } from 'vitest';

import { VisualReviewPlayer } from './visualReviewPlayer';

afterEach(() => vi.useRealTimers());

describe('VisualReviewPlayer', () => {
  it('uses full phases for 0–11 and fast timing from index 12', async () => {
    vi.useFakeTimers();
    const states: string[] = [];
    const player = new VisualReviewPlayer({
      onPhase: (event) => states.push(`${event.index}:${event.phase}`),
      timing: { fullReviewCount: 12, full: { travel: 10, observe: 10, think: 10, reveal: 10 }, fast: { travel: 1, observe: 1, think: 1, reveal: 1 } },
    });
    const promise = player.play(Array.from({ length: 13 }, (_, index) => ({ photoId: String(index), match: index % 2 === 0 })));
    await vi.runAllTimersAsync();
    await promise;
    expect(states).toContain('11:observing');
    expect(states).toContain('12:revealed');
  });

  it('pauses, resumes, and skips queued results', async () => {
    vi.useFakeTimers();
    const revealed: string[] = [];
    const player = new VisualReviewPlayer({ onReveal: (result) => revealed.push(result.photoId) });
    const promise = player.play([{ photoId: 'a', match: true }, { photoId: 'b', match: false }]);
    player.pause();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(revealed).toHaveLength(0);
    player.resume();
    player.skip();
    await vi.runAllTimersAsync();
    await promise;
    expect(revealed).toEqual(['a', 'b']);
  });

  it('aborts without later events', async () => {
    vi.useFakeTimers();
    const revealed: string[] = [];
    const controller = new AbortController();
    const player = new VisualReviewPlayer({ onReveal: (result) => revealed.push(result.photoId) });
    const promise = player.play([{ photoId: 'a', match: true }], controller.signal);
    controller.abort();
    await vi.runAllTimersAsync();
    await promise;
    expect(revealed).toEqual([]);
  });

  it('plays results as they arrive and finishes only after the queue closes', async () => {
    vi.useFakeTimers();
    const revealed: string[] = [];
    const player = new VisualReviewPlayer({
      onReveal: (result) => revealed.push(result.photoId),
      timing: { fullReviewCount: 12, full: { travel: 1, observe: 1, think: 1, reveal: 1 }, fast: { travel: 1, observe: 1, think: 1, reveal: 1 } },
    });
    let finished = false;
    const promise = player.playQueued().then(() => {
      finished = true;
    });

    player.enqueue([{ photoId: 'first-batch-photo', match: true }]);
    await vi.runAllTimersAsync();
    expect(revealed).toEqual(['first-batch-photo']);
    expect(finished).toBe(false);

    player.enqueue([{ photoId: 'last-batch-photo', match: false }]);
    player.closeQueue();
    await vi.runAllTimersAsync();
    await promise;

    expect(revealed).toEqual(['first-batch-photo', 'last-batch-photo']);
    expect(finished).toBe(true);
  });

  it('stops a queued review when it is aborted while paused', async () => {
    const controller = new AbortController();
    const player = new VisualReviewPlayer();
    let finished = false;
    player.pause();
    const promise = player.playQueued(controller.signal).then(() => {
      finished = true;
    });

    player.enqueue([{ photoId: 'paused-photo', match: true }]);
    await Promise.resolve();
    await Promise.resolve();
    controller.abort();
    const stoppedWhilePaused = await Promise.race([
      promise.then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 25)),
    ]);
    player.resume();
    player.closeQueue();
    await promise;
    expect(stoppedWhilePaused).toBe(true);
  });
});
