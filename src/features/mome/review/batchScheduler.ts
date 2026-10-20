export interface BatchSchedulerOptions<TInput, TResult> {
  analyzeBatch: (batch: TInput[], batchIndex: number, signal?: AbortSignal) => Promise<TResult[]>;
  getId: (item: TInput) => string;
  signal?: AbortSignal;
  concurrency?: number;
  batchSize?: number;
  onBatchCompleted?: (results: TResult[], batchIndex: number) => void;
}

export interface BatchSchedulerResult<TResult> {
  completed: TResult[];
  failedPhotoIds: string[];
  errors: Array<{ batchIndex: number; message: string }>;
}

export async function runAnalysisBatches<TInput, TResult = TInput>(
  items: TInput[],
  options: BatchSchedulerOptions<TInput, TResult>,
): Promise<BatchSchedulerResult<TResult>> {
  const batchSize = Math.max(10, Math.min(12, options.batchSize ?? 12));
  const batches: TInput[][] = [];
  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }
  const completed: TResult[] = [];
  const failedPhotoIds: string[] = [];
  const errors: Array<{ batchIndex: number; message: string }> = [];
  let cursor = 0;
  const concurrency = Math.max(1, Math.min(2, options.concurrency ?? 2));

  const workers = Array.from({ length: Math.min(concurrency, batches.length) }, async () => {
    while (cursor < batches.length && !options.signal?.aborted) {
      const batchIndex = cursor++;
      const batch = batches[batchIndex];
      try {
        const results = await options.analyzeBatch(batch, batchIndex, options.signal);
        completed.push(...results);
        options.onBatchCompleted?.(results, batchIndex);
      } catch (error) {
        if (options.signal?.aborted) break;
        failedPhotoIds.push(...batch.map(options.getId));
        errors.push({ batchIndex, message: error instanceof Error ? error.message : String(error) });
      }
    }
  });
  await Promise.all(workers);
  return { completed, failedPhotoIds, errors };
}
