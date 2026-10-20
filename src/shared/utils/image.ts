/**
 * Image Utilities - Thumbnail Generation & Memory Management
 *
 * Rules:
 * - Generates fast, low-resolution thumbnails (max 240px) to prevent memory exhaustion
 *   when handling up to 200 photos on mobile browsers.
 * - Safely manages and revokes object URLs.
 */

const activeObjectUrls = new Set<string>();

export function registerObjectUrl(url: string): string {
  if (url && url.startsWith('blob:')) {
    activeObjectUrls.add(url);
  }
  return url;
}

export function revokeObjectUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
    activeObjectUrls.delete(url);
  }
}

export function revokeAllRegisteredObjectUrls(): void {
  for (const url of activeObjectUrls) {
    URL.revokeObjectURL(url);
  }
  activeObjectUrls.clear();
}

/**
 * Creates a client-side downscaled thumbnail Blob & ObjectUrl
 */
export async function createThumbnail(
  file: File | Blob,
  maxDimension = 480,
  quality = 0.78
): Promise<{
  thumbnailUrl: string;
  thumbnailBlob: Blob;
  thumbnailBase64?: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const originalWidth = img.naturalWidth || 800;
        const originalHeight = img.naturalHeight || 600;

        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        if (originalWidth > originalHeight) {
          if (originalWidth > maxDimension) {
            targetWidth = maxDimension;
            targetHeight = Math.round((originalHeight * maxDimension) / originalWidth);
          }
        } else {
          if (originalHeight > maxDimension) {
            targetHeight = maxDimension;
            targetWidth = Math.round((originalWidth * maxDimension) / originalHeight);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const thumbnailBase64 = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error('Failed to generate thumbnail blob'));
              return;
            }
            const thumbUrl = registerObjectUrl(URL.createObjectURL(blob));
            resolve({
              thumbnailUrl: thumbUrl,
              thumbnailBlob: blob,
              thumbnailBase64,
              width: targetWidth,
              height: targetHeight,
              originalWidth,
              originalHeight,
            });
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for thumbnail creation'));
    };

    img.src = objectUrl;
  });
}

/**
 * Generate stable photo ID based on file metadata and timestamp
 */
export function generateStablePhotoId(file: File, index: number): string {
  const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  return `photo-${file.size}-${file.lastModified}-${index}-${cleanName}`;
}

/**
 * Ensures a photo has a base64 data URL string for server multimodal processing
 */
export async function getPhotoBase64DataUrl(photo: {
  url: string;
  thumbnailBase64?: string;
}): Promise<string> {
  if (photo.thumbnailBase64 && photo.thumbnailBase64.startsWith('data:image/')) {
    return photo.thumbnailBase64;
  }
  if (photo.url && photo.url.startsWith('data:image/')) {
    return photo.url;
  }
  if (!photo.url || typeof window === 'undefined') return '';
  try {
    const res = await fetch(photo.url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}
