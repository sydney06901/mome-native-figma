/**
 * Memory Explorer Task State Machine & Controller
 *
 * Rules:
 * - Independent, testable task control layer.
 * - Real task event driven transitions (not fake setTimeouts).
 * - Supported operations: start, pause, resume, cancel, retryFailedBatch, complete, reset.
 * - State flow:
 *   idle -> preparing -> filtering -> scanning -> reviewing -> completed
 *   scanning <-> paused
 *   any running -> error / cancelled
 * - Concurrency: default max 2 concurrent batch requests.
 * - One batch failing preserves already succeeded results.
 */

import {
  SearchTask,
  SearchTaskStatus,
  PhotoAsset,
  PhotoAnalysis,
  Candidate,
  CursorEvent,
} from '../../domain/types.ts';
import { chunkArray, DEFAULT_BATCH_SIZE, MAX_CONCURRENT_BATCHES } from './pipeline.ts';
import { analyzePhotoBatch } from '../../services/gemini/client.ts';

export interface TaskMachineListener {
  onStatusChange?: (status: SearchTaskStatus, task: SearchTask) => void;
  onProgress?: (task: SearchTask) => void;
  onPhotoFocused?: (photoId: string) => void;
  onAnalysisResult?: (analysis: PhotoAnalysis) => void;
  onCandidatesFound?: (newCandidates: Candidate[]) => void;
  onCursorEvent?: (event: CursorEvent, targetPhotoId?: string) => void;
  onError?: (error: string, failedBatchIndex?: number) => void;
}

export class MemoryExplorerMachine {
  private task: SearchTask;
  private photos: PhotoAsset[] = [];
  private batches: PhotoAsset[][] = [];
  private completedBatchIndices = new Set<number>();
  private failedBatchIndices = new Set<number>();
  private listeners: TaskMachineListener[] = [];
  private isPaused = false;
  private isCancelled = false;
  private activeConcurrency = 0;

  constructor(projectId: string, query = '') {
    this.task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      query,
      status: 'idle',
      totalPhotos: 0,
      processedPhotos: 0,
      matchedPhotoIds: [],
      currentBatchIndex: 0,
      totalBatches: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  getTask(): SearchTask {
    return { ...this.task };
  }

  getStatus(): SearchTaskStatus {
    return this.task.status;
  }

  subscribe(listener: TaskMachineListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyCursor(event: CursorEvent, targetPhotoId?: string) {
    for (const l of this.listeners) {
      l.onCursorEvent?.(event, targetPhotoId);
    }
  }

  private setStatus(status: SearchTaskStatus, error?: string) {
    this.task.status = status;
    this.task.updatedAt = Date.now();
    if (error) this.task.error = error;
    for (const l of this.listeners) {
      l.onStatusChange?.(status, { ...this.task });
    }
  }

  private notifyProgress() {
    this.task.updatedAt = Date.now();
    for (const l of this.listeners) {
      l.onProgress?.({ ...this.task });
    }
  }

  /**
   * Start or initialize search workflow with photos & query
   */
  async start(
    photos: PhotoAsset[],
    query: string,
    batchSize = DEFAULT_BATCH_SIZE
  ): Promise<void> {
    if (this.task.status === 'scanning' || this.task.status === 'preparing') {
      return;
    }

    this.photos = [...photos];
    this.task.query = query;
    this.task.totalPhotos = photos.length;
    this.task.processedPhotos = 0;
    this.task.matchedPhotoIds = [];
    this.task.currentBatchIndex = 0;
    this.task.error = undefined;
    this.completedBatchIndices.clear();
    this.failedBatchIndices.clear();
    this.isPaused = false;
    this.isCancelled = false;

    // Transition: idle -> preparing
    this.setStatus('preparing');
    this.notifyCursor('taskStarted');

    // Transition: preparing -> filtering
    this.setStatus('filtering');
    this.batches = chunkArray(photos, batchSize);
    this.task.totalBatches = this.batches.length;

    if (this.batches.length === 0) {
      this.setStatus('completed');
      this.notifyCursor('completed');
      return;
    }

    // Transition: filtering -> scanning
    this.setStatus('scanning');
    await this.processQueue();
  }

  /**
   * Pause currently running task
   */
  pause(): void {
    if (this.task.status === 'scanning') {
      this.isPaused = true;
      this.setStatus('paused');
      this.notifyCursor('paused');
    }
  }

  /**
   * Resume paused task
   */
  async resume(): Promise<void> {
    if (this.task.status === 'paused') {
      this.isPaused = false;
      this.setStatus('scanning');
      this.notifyCursor('resumed');
      await this.processQueue();
    }
  }

  /**
   * Cancel task
   */
  cancel(): void {
    this.isCancelled = true;
    this.isPaused = false;
    this.setStatus('cancelled');
    this.notifyCursor('paused');
  }

  /**
   * Reset state machine to idle
   */
  reset(): void {
    this.isPaused = false;
    this.isCancelled = false;
    this.completedBatchIndices.clear();
    this.failedBatchIndices.clear();
    this.task.processedPhotos = 0;
    this.task.matchedPhotoIds = [];
    this.task.currentPhotoId = undefined;
    this.task.error = undefined;
    this.setStatus('idle');
  }

  /**
   * Complete task and transition into reviewing
   */
  complete(): void {
    this.setStatus('reviewing');
    this.notifyCursor('batchCompleted');
    setTimeout(() => {
      this.setStatus('completed');
      this.notifyCursor('completed');
    }, 400);
  }

  /**
   * Retry a specifically failed batch
   */
  async retryFailedBatch(batchIndex: number): Promise<void> {
    if (batchIndex < 0 || batchIndex >= this.batches.length) return;
    this.failedBatchIndices.delete(batchIndex);
    this.setStatus('scanning');
    this.notifyCursor('resumed');
    await this.runBatch(batchIndex);
    await this.processQueue();
  }

  /**
   * Core concurrency queue processor
   */
  private async processQueue(): Promise<void> {
    while (
      !this.isPaused &&
      !this.isCancelled &&
      this.completedBatchIndices.size + this.failedBatchIndices.size < this.batches.length
    ) {
      // Find next pending batch indices
      const pendingIndices: number[] = [];
      for (let i = 0; i < this.batches.length; i++) {
        if (!this.completedBatchIndices.has(i) && !this.failedBatchIndices.has(i)) {
          pendingIndices.push(i);
        }
      }

      if (pendingIndices.length === 0) break;

      // Run up to MAX_CONCURRENT_BATCHES
      const sliceToRun = pendingIndices.slice(0, MAX_CONCURRENT_BATCHES);
      await Promise.all(sliceToRun.map((idx) => this.runBatch(idx)));
    }

    if (this.isCancelled || this.isPaused) return;

    if (this.completedBatchIndices.size === this.batches.length) {
      this.complete();
    } else if (this.failedBatchIndices.size > 0 && this.completedBatchIndices.size + this.failedBatchIndices.size === this.batches.length) {
      this.setStatus('error', `${this.failedBatchIndices.size} 个批次分析失败，已保留成功结果，可点击重试。`);
      this.notifyCursor('error');
    }
  }

  private async runBatch(batchIndex: number): Promise<void> {
    if (this.isPaused || this.isCancelled) return;

    const batch = this.batches[batchIndex];
    if (!batch || batch.length === 0) {
      this.completedBatchIndices.add(batchIndex);
      return;
    }

    this.task.currentBatchIndex = batchIndex + 1;
    this.notifyCursor('batchStarted');

    try {
      // Focus on first photo of batch
      this.task.currentPhotoId = batch[0].id;
      this.notifyCursor('photoFocused', batch[0].id);
      for (const l of this.listeners) {
        l.onPhotoFocused?.(batch[0].id);
      }

      const input = {
        taskId: this.task.id,
        userQuery: this.task.query,
        batchIndex,
        totalBatches: this.batches.length,
        photos: batch.map((p) => ({
          photoId: p.id,
          imageData: p.thumbnailUrl, // transfer lightweight thumbnail
          metadata: {
            fileName: p.fileName,
            capturedAt: p.capturedAt,
            description: p.description,
            tags: p.tags,
            isBuilding: p.isBuilding,
          },
        })),
      };

      const response = await analyzePhotoBatch(input);

      if (this.isCancelled) return;

      const newCandidates: Candidate[] = [];

      for (const analysis of response.results) {
        for (const l of this.listeners) {
          l.onAnalysisResult?.(analysis);
        }

        if (analysis.match) {
          this.task.matchedPhotoIds.push(analysis.photoId);
          newCandidates.push({
            photoId: analysis.photoId,
            confidence: analysis.confidence,
            reason: analysis.reason,
            selected: true,
            summary: analysis.summary,
            detectedSubjects: analysis.detectedSubjects,
          });
          this.notifyCursor('matchFound', analysis.photoId);
          this.notifyCursor('candidateAdded', analysis.photoId);
        } else {
          this.notifyCursor('photoSkipped', analysis.photoId);
        }
      }

      if (newCandidates.length > 0) {
        for (const l of this.listeners) {
          l.onCandidatesFound?.(newCandidates);
        }
      }

      this.task.processedPhotos += batch.length;
      this.completedBatchIndices.add(batchIndex);
      this.notifyProgress();
      this.notifyCursor('batchCompleted');
    } catch (err: any) {
      console.error(`Batch ${batchIndex + 1} analysis error:`, err);
      this.failedBatchIndices.add(batchIndex);
      for (const l of this.listeners) {
        l.onError?.(`批次 ${batchIndex + 1} 分析异常: ${err?.message || '未知错误'}`, batchIndex);
      }
    }
  }
}
