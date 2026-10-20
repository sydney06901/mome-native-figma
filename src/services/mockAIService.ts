import { Task } from '../models/Task.ts';
import { PhotoItem } from '../models/PhotoItem.ts';
import { DEMO_PHOTO_SKETCHES, svgToDataUrl } from './demoAssets.ts';

export interface ScanEvent {
  currentPhotoId: string | null;
  scannedCount: number;
  matchedCount: number;
  matchedIds: string[];
  stageName: string;
}

export type ScanEventListener = (event: ScanEvent) => void;

class MockAIService {
  private activeJobs = new Map<string, { cancelled: boolean }>();

  /**
   * Parse user natural query for the demo scenario
   */
  async parseQuery(queryText: string): Promise<{
    date: string;
    keyword: string;
    style: string;
    dateLabel: string;
  }> {
    // Standard prompt: "找出周六拍到的建筑，做成可以拼贴的线稿素材。"
    const lower = queryText.toLowerCase();
    let date = '2026-10-10';
    let dateLabel = '2026年10月10日 (周六)';
    let keyword = '建筑';
    let style = '黑白线稿';

    if (lower.includes('周六') || lower.includes('10月10日') || lower.includes('10-10')) {
      date = '2026-10-10';
      dateLabel = '2026年10月10日 (周六)';
    }

    if (lower.includes('食物') || lower.includes('咖啡') || lower.includes('蛋糕')) {
      keyword = '食物';
    } else if (lower.includes('植物') || lower.includes('树') || lower.includes('叶')) {
      keyword = '植物';
    } else if (lower.includes('动物') || lower.includes('猫')) {
      keyword = '动物';
    } else {
      keyword = '建筑';
    }

    return { date, keyword, style, dateLabel };
  }

  /**
   * Run photo search across photo items with event-driven progress
   */
  async searchPhotos(
    taskId: string,
    photos: PhotoItem[],
    targetDate: string,
    targetKeyword: string,
    onProgress?: ScanEventListener
  ): Promise<{ matchedPhotoIds: string[]; status: 'succeeded' | 'cancelled' }> {
    this.activeJobs.set(taskId, { cancelled: false });

    const matchedPhotoIds: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      const job = this.activeJobs.get(taskId);
      if (job?.cancelled) {
        return { matchedPhotoIds, status: 'cancelled' };
      }

      const photo = photos[i];
      // Notify scanning this photo
      onProgress?.({
        currentPhotoId: photo.id,
        scannedCount: i + 1,
        matchedCount: matchedPhotoIds.length,
        matchedIds: [...matchedPhotoIds],
        stageName: `正在查看第 ${i + 1}/${photos.length} 张照片...`,
      });

      // Small realistic cognitive delay per photo card (450ms)
      await new Promise((resolve) => setTimeout(resolve, 450));

      const isDateMatch = photo.capturedAt === targetDate;
      const isKeywordMatch =
        (targetKeyword === '建筑' && photo.isBuilding) ||
        (photo.tags && photo.tags.includes(targetKeyword));

      if (isDateMatch && isKeywordMatch) {
        matchedPhotoIds.push(photo.id);
        onProgress?.({
          currentPhotoId: photo.id,
          scannedCount: i + 1,
          matchedCount: matchedPhotoIds.length,
          matchedIds: [...matchedPhotoIds],
          stageName: `找到匹配建筑：《${photo.name}》`,
        });
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }

    onProgress?.({
      currentPhotoId: null,
      scannedCount: photos.length,
      matchedCount: matchedPhotoIds.length,
      matchedIds: [...matchedPhotoIds],
      stageName: `检索完成，共找到 ${matchedPhotoIds.length} 张候选照片`,
    });

    this.activeJobs.delete(taskId);
    return { matchedPhotoIds, status: 'succeeded' };
  }

  /**
   * Cancel an in-flight search or generation job
   */
  cancelJob(taskId: string): void {
    const job = this.activeJobs.get(taskId);
    if (job) {
      job.cancelled = true;
    }
  }

  /**
   * Generate demo stylized line art illustration
   */
  async generateIllustration(
    taskId: string,
    photoId: string,
    style: string,
    onStageChange?: (stage: string) => void
  ): Promise<{ sketchUrl: string; name: string } | null> {
    this.activeJobs.set(taskId, { cancelled: false });

    const stages = [
      '提取建筑主体轮廓与透视骨架...',
      '绘制墨线结构与拱券细节...',
      '添加建筑阴影排线与手账质感...',
    ];

    for (const stage of stages) {
      const job = this.activeJobs.get(taskId);
      if (job?.cancelled) {
        this.activeJobs.delete(taskId);
        return null;
      }
      onStageChange?.(stage);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    const sketchData = DEMO_PHOTO_SKETCHES[photoId] || DEMO_PHOTO_SKETCHES['demo-photo-church'];
    const sketchUrl = svgToDataUrl(sketchData.svg);

    this.activeJobs.delete(taskId);
    return { sketchUrl, name: sketchData.name };
  }
}

export const mockAIService = new MockAIService();
