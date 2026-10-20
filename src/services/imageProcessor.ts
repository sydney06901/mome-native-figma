import { CropBounds } from '../models/Material.ts';

/**
 * imageProcessor handles exact rectangular cropping of images.
 * Keeps canvas coordinate calculations pixel-accurate to natural dimensions.
 */
export async function cropImageToDataUrl(
  sourceUrl: string,
  bounds: CropBounds
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const naturalW = img.naturalWidth;
        const naturalH = img.naturalHeight;

        // Convert percentage bounds (0-100) or pixel bounds to pixel
        const pixelX = Math.max(0, Math.min(naturalW, (bounds.x / 100) * naturalW));
        const pixelY = Math.max(0, Math.min(naturalH, (bounds.y / 100) * naturalH));
        const pixelW = Math.max(10, Math.min(naturalW - pixelX, (bounds.width / 100) * naturalW));
        const pixelH = Math.max(10, Math.min(naturalH - pixelY, (bounds.height / 100) * naturalH));

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(pixelW);
        canvas.height = Math.round(pixelH);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(
          img,
          pixelX,
          pixelY,
          pixelW,
          pixelH,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const croppedDataUrl = canvas.toDataURL('image/png');
        resolve(croppedDataUrl);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => reject(new Error('Failed to load image for cropping'));
    img.src = sourceUrl;
  });
}
