import { ANIMATION_TIMING, type AnimationTiming } from '../config/animation';

export type ReviewPhase = 'travelling' | 'observing' | 'thinking' | 'matched' | 'mismatch' | 'revealed';

export interface VisualReviewResult {
  photoId: string;
  match: boolean;
  confidence?: number;
  reason?: string;
}

export interface ReviewPhaseEvent extends VisualReviewResult {
  index: number;
  phase: ReviewPhase;
}

interface VisualReviewPlayerOptions {
  timing?: AnimationTiming;
  onPhase?: (event: ReviewPhaseEvent) => void;
  onReveal?: (result: VisualReviewResult, index: number) => void;
}

export function abortableDelay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted || milliseconds <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = setTimeout(done, milliseconds);
    function done() {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', done);
      resolve();
    }
    signal?.addEventListener('abort', done, { once: true });
  });
}

export class VisualReviewPlayer {
  private paused = false;
  private skipping = false;
  private resumeWaiters: Array<() => void> = [];
  private queuedResults: VisualReviewResult[] = [];
  private queueClosed = false;
  private queueWaiters = new Set<() => void>();
  private readonly timing: AnimationTiming;

  constructor(private readonly options: VisualReviewPlayerOptions = {}) {
    this.timing = options.timing ?? ANIMATION_TIMING;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.resumeWaiters.splice(0).forEach((resolve) => resolve());
  }

  skip() {
    this.skipping = true;
    this.resume();
  }

  enqueue(results: VisualReviewResult[]) {
    if (this.queueClosed || results.length === 0) return;
    this.queuedResults.push(...results);
    this.wakeQueueWaiters();
  }

  closeQueue() {
    this.queueClosed = true;
    this.wakeQueueWaiters();
  }

  private wakeQueueWaiters() {
    [...this.queueWaiters].forEach((resolve) => resolve());
  }

  private waitForQueueChange(signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => {
        this.queueWaiters.delete(done);
        signal?.removeEventListener('abort', done);
        resolve();
      };
      this.queueWaiters.add(done);
      signal?.addEventListener('abort', done, { once: true });
    });
  }

  private async waitWhilePaused(signal?: AbortSignal) {
    while (this.paused && !signal?.aborted) {
      await new Promise<void>((resolve) => {
        const done = () => {
          this.resumeWaiters = this.resumeWaiters.filter((waiter) => waiter !== done);
          signal?.removeEventListener('abort', done);
          resolve();
        };
        this.resumeWaiters.push(done);
        signal?.addEventListener('abort', done, { once: true });
      });
    }
  }

  private async playResult(result: VisualReviewResult, index: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return;
    await this.waitWhilePaused(signal);
    if (signal?.aborted) return;
    if (this.skipping) {
      this.options.onReveal?.(result, index);
      this.options.onPhase?.({ ...result, index, phase: 'revealed' });
      return;
    }
    const timing = index < this.timing.fullReviewCount ? this.timing.full : this.timing.fast;
    for (const [phase, duration] of [
      ['travelling', timing.travel],
      ['observing', timing.observe],
      ['thinking', timing.think],
      [result.match ? 'matched' : 'mismatch', timing.reveal],
    ] as const) {
      this.options.onPhase?.({ ...result, index, phase });
      await abortableDelay(duration, signal);
      await this.waitWhilePaused(signal);
      if (signal?.aborted) return;
      if (this.skipping) break;
    }
    this.options.onReveal?.(result, index);
    this.options.onPhase?.({ ...result, index, phase: 'revealed' });
  }

  async play(results: VisualReviewResult[], signal?: AbortSignal): Promise<void> {
    this.skipping = false;
    for (let index = 0; index < results.length; index += 1) {
      await this.playResult(results[index], index, signal);
      if (signal?.aborted) return;
    }
  }

  async playQueued(signal?: AbortSignal): Promise<void> {
    this.skipping = false;
    let index = 0;
    while (!signal?.aborted) {
      const result = this.queuedResults.shift();
      if (result) {
        await this.playResult(result, index, signal);
        index += 1;
        continue;
      }
      if (this.queueClosed) return;
      await this.waitForQueueChange(signal);
    }
  }
}
