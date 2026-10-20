import type { MomePhoto } from '../domain';
import type { MomeRepository } from '../storage/momeRepository';

export const MAX_PHOTO_SELECTION = 200;
export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface RejectedPhoto {
  file: File;
  code: 'SELECTION_LIMIT' | 'UNSUPPORTED_TYPE' | 'FILE_TOO_LARGE' | 'PROCESSING_FAILED';
  reason: string;
}

export interface PhotoImportSummary {
  accepted: MomePhoto[];
  rejected: RejectedPhoto[];
}

export interface ImportPhotoOptions {
  sessionId: string;
  repository?: Pick<MomeRepository, 'savePhoto'>;
  processPhoto?: (file: File, sessionId: string, index: number) => Promise<MomePhoto>;
  concurrency?: number;
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Unable to encode thumbnail'))), type, quality);
  });
}

export async function processImportedPhoto(file: File, sessionId: string, index: number): Promise<MomePhoto> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const thumbnailBlob = await canvasToBlob(canvas, 'image/jpeg', 0.78);
    return {
      id: `${sessionId}-${index}-${crypto.randomUUID()}`,
      sessionId,
      fileName: file.name,
      mimeType: file.type as MomePhoto['mimeType'],
      width: bitmap.width,
      height: bitmap.height,
      thumbnailBlob,
      originalBlob: file,
      importedAt: Date.now(),
    };
  } finally {
    bitmap.close();
  }
}

export async function importPhotos(filesInput: File[] | FileList, options: ImportPhotoOptions): Promise<PhotoImportSummary> {
  const files = Array.from(filesInput);
  const accepted: MomePhoto[] = [];
  const rejected: RejectedPhoto[] = [];
  const valid: Array<{ file: File; index: number }> = [];

  files.forEach((file, index) => {
    if (index >= MAX_PHOTO_SELECTION) {
      rejected.push({ file, code: 'SELECTION_LIMIT', reason: `Only the first ${MAX_PHOTO_SELECTION} photos can be imported.` });
    } else if (!ALLOWED_TYPES.has(file.type)) {
      rejected.push({ file, code: 'UNSUPPORTED_TYPE', reason: 'Only JPEG, PNG, and WebP photos are supported.' });
    } else if (file.size > MAX_PHOTO_BYTES) {
      rejected.push({ file, code: 'FILE_TOO_LARGE', reason: 'Each photo must be 25 MB or smaller.' });
    } else {
      valid.push({ file, index });
    }
  });

  const processor = options.processPhoto ?? processImportedPhoto;
  const concurrency = Math.max(1, Math.min(4, options.concurrency ?? 4));
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, valid.length) }, async () => {
    while (cursor < valid.length) {
      const current = valid[cursor++];
      try {
        const photo = await processor(current.file, options.sessionId, current.index);
        await options.repository?.savePhoto(photo);
        accepted.push(photo);
      } catch (error) {
        rejected.push({
          file: current.file,
          code: 'PROCESSING_FAILED',
          reason: error instanceof Error ? error.message : 'Photo processing failed.',
        });
      }
    }
  });
  await Promise.all(workers);
  accepted.sort((a, b) => a.importedAt - b.importedAt || a.fileName.localeCompare(b.fileName));
  return { accepted, rejected };
}
