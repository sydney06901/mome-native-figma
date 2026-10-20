import { PhotoItem } from '../models/PhotoItem.ts';

export interface FileImportResult {
  photos: PhotoItem[];
  errors: string[];
  heicWarningCount: number;
}

/**
 * photoSource handles file importing via browser file picker.
 * It enforces clear mobile web boundaries:
 * - Does not claim native PhotoKit or full system album access.
 * - Validates MIME types.
 * - Detects HEIC/HEIF files and provides friendly guidance to export as JPEG/PNG.
 * - Marks captured date as "日期未知" rather than falsely using file upload timestamp.
 */
export async function importPhotosFromFiles(
  files: FileList | File[],
  projectId: string
): Promise<FileImportResult> {
  const photos: PhotoItem[] = [];
  const errors: string[] = [];
  let heicWarningCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Check for HEIC / HEIF
    const fileName = file.name.toLowerCase();
    const isHeic =
      fileName.endsWith('.heic') ||
      fileName.endsWith('.heif') ||
      file.type === 'image/heic' ||
      file.type === 'image/heif';

    if (isHeic) {
      heicWarningCount++;
      errors.push(
        `《${file.name}》是 HEIC 格式。当前浏览器无法直接硬件解码高动态 HEIC，请在 iPhone 照片中选择“以兼容格式共享”或导出为 JPEG/PNG 后导入。`
      );
      continue;
    }

    if (!file.type.startsWith('image/')) {
      errors.push(`《${file.name}》不是受支持的图片文件。`);
      continue;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const dimensions = await getImageDimensions(dataUrl);

      const newPhoto: PhotoItem = {
        id: `photo-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        projectId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: dataUrl,
        capturedAt: '日期未知',
        dateUnknown: true,
        tags: ['导入照片'],
        isBuilding: false, // Default false; user manually selects/tags
        description: '用户自主导入的照片',
        width: dimensions.width,
        height: dimensions.height,
        isDemo: false,
      };

      photos.push(newPhoto);
    } catch (err) {
      errors.push(`读取《${file.name}》失败，文件可能已损坏。`);
    }
  }

  return { photos, errors, heicWarningCount };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || 600, height: img.naturalHeight || 450 });
    };
    img.onerror = () => {
      resolve({ width: 600, height: 450 });
    };
    img.src = src;
  });
}
