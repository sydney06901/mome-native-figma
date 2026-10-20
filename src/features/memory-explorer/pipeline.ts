/**
 * Photo Import & Batch Pipeline
 *
 * Rules:
 * - Supports up to 200 photos per selection.
 * - Enforces file size limits (<25MB) and type validations.
 * - Generates low-resolution thumbnails on client to avoid memory pressure.
 * - Builds batch queue (12 photos/batch default, configurable 10-20).
 * - Concurrency limit: max 2 simultaneous batch requests.
 */

import { PhotoAsset } from '../../domain/types.ts';
import {
  createThumbnail,
  generateStablePhotoId,
  registerObjectUrl,
} from '../../shared/utils/image.ts';

export const MAX_PHOTO_SELECTION = 200;
export const MAX_SINGLE_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const DEFAULT_BATCH_SIZE = 10; // 8-12 photos per batch
export const MAX_CONCURRENT_BATCHES = 2; // Maximum 2 simultaneous Gemini batch requests

export interface ImportPipelineResult {
  assets: PhotoAsset[];
  warnings: string[];
  errors: string[];
  heicCount: number;
}

export async function processPhotosForImport(
  files: FileList | File[],
  projectId: string,
  onProgress?: (processed: number, total: number) => void
): Promise<ImportPipelineResult> {
  const assets: PhotoAsset[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  let heicCount = 0;

  const totalFiles = files.length;

  if (totalFiles > MAX_PHOTO_SELECTION) {
    warnings.push(
      `您单次选择了 ${totalFiles} 张照片，已自动截取前 ${MAX_PHOTO_SELECTION} 张进行导入处理。`
    );
  }

  const sliceCount = Math.min(totalFiles, MAX_PHOTO_SELECTION);

  // Process in small concurrent chunks (3 at a time) for smooth performance and no UI freeze
  const CONCURRENCY = 3;
  let processedCount = 0;

  for (let i = 0; i < sliceCount; i += CONCURRENCY) {
    const chunk = Array.from(files).slice(i, i + CONCURRENCY);

    const chunkPromises = chunk.map(async (file, chunkIdx) => {
      const photoIdx = i + chunkIdx;
      const fileName = file.name.toLowerCase();

      // Check HEIC
      const isHeic =
        fileName.endsWith('.heic') ||
        fileName.endsWith('.heif') ||
        file.type === 'image/heic' ||
        file.type === 'image/heif';

      if (isHeic) {
        heicCount++;
        warnings.push(
          `《${file.name}》是 HEIC 格式。建议在手机相册中选择“以兼容格式共享”或导出为 JPG/PNG。`
        );
        return;
      }

      // Check MIME type
      if (!file.type.startsWith('image/')) {
        errors.push(`《${file.name}》非图片文件，已被跳过。`);
        return;
      }

      // Check file size
      if (file.size > MAX_SINGLE_FILE_SIZE) {
        errors.push(`《${file.name}》单文件体积超过 25MB，已跳过。`);
        return;
      }

      try {
        const stableId = generateStablePhotoId(file, photoIdx);
        const originalObjectUrl = registerObjectUrl(URL.createObjectURL(file));

        // Generate ~480px lightweight thumbnail (0.78 quality) with base64 for Gemini
        const {
          thumbnailUrl,
          thumbnailBlob,
          thumbnailBase64,
          originalWidth,
          originalHeight,
        } = await createThumbnail(file, 480, 0.78);

        const asset: PhotoAsset = {
          id: stableId,
          projectId,
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          width: originalWidth,
          height: originalHeight,
          createdAt: new Date().toISOString(),
          capturedAt: '日期未知',
          objectUrl: originalObjectUrl,
          thumbnailUrl,
          thumbnailBlob,
          originalBlob: file,
          thumbnailBase64,
          importStatus: 'ready',
          analysisStatus: 'unprocessed',
          tags: [],
          isBuilding: false,
          isDemo: false,
          description: '',
        };

        assets.push(asset);
      } catch (err: any) {
        errors.push(`生成《${file.name}》预览失败: ${err?.message || '读取错误'}`);
      }
    });

    await Promise.all(chunkPromises);
    processedCount = Math.min(sliceCount, i + chunk.length);
    onProgress?.(processedCount, sliceCount);

    // Yield control to UI thread
    await new Promise((r) => setTimeout(r, 0));
  }

  return { assets, warnings, errors, heicCount };
}

/**
 * Splits array of items into chunks of batchSize
 */
export function chunkArray<T>(items: T[], batchSize = DEFAULT_BATCH_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    chunks.push(items.slice(i, i + batchSize));
  }
  return chunks;
}
