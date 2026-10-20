import { CanvasItem } from '../models/CanvasItem.ts';

const EXPORT_WIDTH = 1200;
const EXPORT_HEIGHT = 1600;

export async function exportCollageToPNG(
  layers: CanvasItem[],
  projectName: string = 'mome-手账拼贴'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D rendering context not available');
  }

  // 1. Draw warm paper textured background
  ctx.fillStyle = '#faf7f2';
  ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  // Subtle organic paper grid & speckles
  ctx.strokeStyle = 'rgba(164, 150, 134, 0.08)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < EXPORT_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, EXPORT_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < EXPORT_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(EXPORT_WIDTH, y);
    ctx.stroke();
  }

  // Draw quiet watermark text at bottom corner
  ctx.fillStyle = 'rgba(124, 117, 109, 0.35)';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('crafted with mome', EXPORT_WIDTH - 40, EXPORT_HEIGHT - 36);

  // 2. Sort layers by zIndex ascending
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  // 3. Pre-load all images
  const loadedImages = await Promise.all(
    sortedLayers.map((layer) => {
      return new Promise<{ layer: CanvasItem; img: HTMLImageElement | null }>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ layer, img });
        img.onerror = () => resolve({ layer, img: null });
        img.src = layer.url;
      });
    })
  );

  // 4. Render each layer with exact transforms
  for (const { layer, img } of loadedImages) {
    if (!img) continue;

    ctx.save();

    // Map percentage position (0-100) to export canvas coordinates
    const posX = (layer.x / 100) * EXPORT_WIDTH;
    const posY = (layer.y / 100) * EXPORT_HEIGHT;

    ctx.translate(posX, posY);
    ctx.rotate((layer.rotation * Math.PI) / 180);

    // Base display width scaled to 1200x1600 (e.g. 400 base width scaled by scale)
    const baseW = (layer.width || 320) * 1.6;
    const baseH = (layer.height || 240) * 1.6;
    const drawW = baseW * layer.scale;
    const drawH = baseH * layer.scale;

    // Subtle drop shadow for tactile paper feel
    ctx.shadowColor = 'rgba(44, 40, 37, 0.12)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 6;

    // Draw image centered at origin
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();
  }

  // 5. Export as PNG data URL & download
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  triggerDownload(dataUrl, `${projectName.replace(/\s+/g, '_')}_1200x1600.png`);
  return dataUrl;
}

function triggerDownload(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
