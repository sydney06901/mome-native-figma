import { describe, expect, it, vi } from 'vitest';

import { runAnalysisBatches } from './batchScheduler';

describe('runAnalysisBatches', () => {
  it('uses 10–12 item batches and at most two active calls', async () => {
    let active = 0;
    let peak = 0;
    const sizes: number[] = [];
    const result = await runAnalysisBatches(Array.from({ length: 31 }, (_, id) => ({ id })), {
      getId: (item) => String(item.id),
      analyzeBatch: async (batch) => {
        active += 1;
        peak = Math.max(peak, active);
        sizes.push(batch.length);
        await Promise.resolve();
        active -= 1;
        return batch;
      },
    });
    expect(sizes.every((size, index) => size >= 10 || index === sizes.length - 1)).toBe(true);
    expect(sizes.every((size) => size <= 12)).toBe(true);
    expect(peak).toBeLessThanOrEqual(2);
    expect(result.completed).toHaveLength(31);
  });

  it('preserves completed batches and exposes only failed IDs for retry', async () => {
    const result = await runAnalysisBatches(Array.from({ length: 24 }, (_, id) => ({ id })), {
      getId: (item) => String(item.id),
      analyzeBatch: async (batch, batchIndex) => {
        if (batchIndex === 1) throw new Error('network');
        return batch;
      },
    });
    expect(result.completed).toHaveLength(12);
    expect(result.failedPhotoIds).toEqual(Array.from({ length: 12 }, (_, index) => String(index + 12)));
  });

  it('does not send queued batches after abort', async () => {
    const controller = new AbortController();
    const analyzeBatch = vi.fn(async (batch: { id: number }[]) => {
      controller.abort();
      return batch;
    });
    await runAnalysisBatches(Array.from({ length: 40 }, (_, id) => ({ id })), {
      getId: (item) => String(item.id),
      analyzeBatch,
      signal: controller.signal,
      concurrency: 1,
    });
    expect(analyzeBatch).toHaveBeenCalledTimes(1);
  });
});
