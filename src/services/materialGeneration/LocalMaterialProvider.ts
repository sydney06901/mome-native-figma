import {
  GeneratedMaterial,
  MaterialGenerationProvider,
  MaterialGenerationRequest,
} from './types.ts';
import { MOOD_OPTIONS } from './presets.ts';

/**
 * Loads an image element asynchronously from URL/DataURL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

/**
 * Helper to get mood palette
 */
function getMoodPalette(moodIdOrTitle: string): [string, string, string] {
  const match = MOOD_OPTIONS.find(
    (m) => m.id === moodIdOrTitle || m.title === moodIdOrTitle
  );
  return match ? match.palette : ['#3b6e8c', '#e09867', '#fbf9f5'];
}

export class LocalMaterialProvider implements MaterialGenerationProvider {
  async generate(request: MaterialGenerationRequest): Promise<GeneratedMaterial[]> {
    const { projectId, photos, mood, primaryStyle, secondaryStyles, signal, onProgress } = request;
    const materials: GeneratedMaterial[] = [];
    const palette = getMoodPalette(mood);

    // Each photo produces up to 3-4 specialized materials:
    // 1. Photo card (rounded/styled)
    // 2. Torn paper photo
    // 3. Line art or vintage filter photo
    // 4. Date / washi tape label
    // Plus 1-2 shared mood textures
    const totalMaterialsEstimated = photos.length * 4 + 2;
    let completedCount = 0;

    for (let pIdx = 0; pIdx < photos.length; pIdx++) {
      if (signal?.aborted) break;

      const photo = photos[pIdx];
      let imgEl: HTMLImageElement | null = null;
      try {
        imgEl = await loadImage(photo.url);
      } catch {
        // If image loading fails, continue with fallback
      }

      // 1. Rounded Photo Card
      const photoCard = await this.createPhotoCard(photo, imgEl, projectId, mood, primaryStyle, secondaryStyles, palette);
      materials.push(photoCard);
      completedCount++;
      onProgress?.({
        current: completedCount,
        total: totalMaterialsEstimated,
        stepDescription: `正在为《${photo.name}》生成手账照片卡片...`,
        completedMaterial: photoCard,
      });

      // 2. Torn Paper Photo
      const tornPhoto = await this.createTornPhoto(photo, imgEl, projectId, mood, primaryStyle, secondaryStyles, palette);
      materials.push(tornPhoto);
      completedCount++;
      onProgress?.({
        current: completedCount,
        total: totalMaterialsEstimated,
        stepDescription: `正在为《${photo.name}》制作手工撕纸拼贴边缘...`,
        completedMaterial: tornPhoto,
      });

      // 3. Line Art / Contrast Sketch
      const lineArt = await this.createLineArtPhoto(photo, imgEl, projectId, mood, primaryStyle, secondaryStyles);
      materials.push(lineArt);
      completedCount++;
      onProgress?.({
        current: completedCount,
        total: totalMaterialsEstimated,
        stepDescription: `正在提取《${photo.name}》的结构线稿...`,
        completedMaterial: lineArt,
      });

      // 4. Date Label / Washi Tape Sticker
      const dateLabel = await this.createDateLabel(photo, projectId, mood, primaryStyle, secondaryStyles, palette);
      materials.push(dateLabel);
      completedCount++;
      onProgress?.({
        current: completedCount,
        total: totalMaterialsEstimated,
        stepDescription: `正在生成《${photo.name}》的复古打字机日期便签...`,
        completedMaterial: dateLabel,
      });
    }

    // 5. Generate Palette Background Texture
    const bgTexture = await this.createMoodBackground(projectId, mood, primaryStyle, secondaryStyles, palette);
    materials.push(bgTexture);
    completedCount++;
    onProgress?.({
      current: completedCount,
      total: totalMaterialsEstimated,
      stepDescription: '正在生成手账专属纸张底纹...',
      completedMaterial: bgTexture,
    });

    // 6. Generate Decorative Mood Accent Shape
    const decoShape = await this.createDecorativeShape(projectId, mood, primaryStyle, secondaryStyles, palette);
    materials.push(decoShape);
    completedCount++;
    onProgress?.({
      current: completedCount,
      total: totalMaterialsEstimated,
      stepDescription: '正在提取色彩装饰素材...',
      completedMaterial: decoShape,
    });

    return materials;
  }

  /**
   * 1. Creates a rounded, mood-bordered photo card
   */
  private async createPhotoCard(
    photo: any,
    img: HTMLImageElement | null,
    projectId: string,
    mood: string,
    primaryStyle: string,
    secondaryStyles: string[],
    palette: [string, string, string]
  ): Promise<GeneratedMaterial> {
    const canvas = document.createElement('canvas');
    const width = 400;
    const height = 300;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // White paper frame with rounded corners
    const radius = 16;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, radius);
    ctx.fill();

    // Mood border
    ctx.lineWidth = 4;
    ctx.strokeStyle = palette[1];
    ctx.stroke();

    // Draw image inside inner padding
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(8, 8, width - 16, height - 16, radius - 4);
      ctx.clip();
      ctx.drawImage(img, 8, 8, width - 16, height - 16);
      ctx.restore();
    }

    const dataUrl = canvas.toDataURL('image/png');
    return {
      id: `mat-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      sourcePhotoId: photo.id,
      name: `${photo.name} · 照片卡`,
      type: 'photo_card',
      previewUrl: dataUrl,
      fullUrl: dataUrl,
      mood,
      primaryStyle,
      secondaryStyles,
      generationStatus: 'completed',
      createdAt: Date.now(),
    };
  }

  /**
   * 2. Creates a torn-paper effect with jagged edge path
   */
  private async createTornPhoto(
    photo: any,
    img: HTMLImageElement | null,
    projectId: string,
    mood: string,
    primaryStyle: string,
    secondaryStyles: string[],
    palette: [string, string, string]
  ): Promise<GeneratedMaterial> {
    const canvas = document.createElement('canvas');
    const width = 380;
    const height = 280;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Generate jagged torn paper outline
    ctx.save();
    ctx.beginPath();
    const margin = 10;
    const w = width - margin * 2;
    const h = height - margin * 2;

    // Top edge with random teeth
    ctx.moveTo(margin, margin);
    for (let x = margin; x <= margin + w; x += 8) {
      ctx.lineTo(x, margin + (Math.sin(x * 0.4) * 3 + (Math.random() - 0.5) * 4));
    }
    // Right edge
    for (let y = margin; y <= margin + h; y += 8) {
      ctx.lineTo(margin + w + (Math.cos(y * 0.4) * 3 + (Math.random() - 0.5) * 4), y);
    }
    // Bottom edge
    for (let x = margin + w; x >= margin; x -= 8) {
      ctx.lineTo(x, margin + h + (Math.sin(x * 0.4) * 3 + (Math.random() - 0.5) * 4));
    }
    // Left edge
    for (let y = margin + h; y >= margin; y -= 8) {
      ctx.lineTo(margin + (Math.cos(y * 0.4) * 3 + (Math.random() - 0.5) * 4), y);
    }
    ctx.closePath();

    // White torn paper border
    ctx.fillStyle = '#faf8f5';
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fill();

    // Clip image inside with 6px inset
    ctx.clip();
    if (img) {
      ctx.drawImage(img, margin + 4, margin + 4, w - 8, h - 8);
    }

    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    return {
      id: `mat-torn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      sourcePhotoId: photo.id,
      name: `${photo.name} · 撕纸照片`,
      type: 'torn_photo',
      previewUrl: dataUrl,
      fullUrl: dataUrl,
      mood,
      primaryStyle,
      secondaryStyles,
      generationStatus: 'completed',
      createdAt: Date.now(),
    };
  }

  /**
   * 3. Creates high-contrast monochrome line art sketch via Canvas pixel filter
   */
  private async createLineArtPhoto(
    photo: any,
    img: HTMLImageElement | null,
    projectId: string,
    mood: string,
    primaryStyle: string,
    secondaryStyles: string[]
  ): Promise<GeneratedMaterial> {
    const canvas = document.createElement('canvas');
    const width = 360;
    const height = 270;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    if (img) {
      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const d = imgData.data;

      // Grayscale + High pass sketch threshold
      for (let i = 0; i < d.length; i += 4) {
        const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        // Contrast enhancement
        const sketchVal = gray > 115 ? 245 : 30;
        d[i] = sketchVal;
        d[i + 1] = sketchVal;
        d[i + 2] = sketchVal;
      }
      ctx.putImageData(imgData, 0, 0);

      // Fine line border
      ctx.strokeStyle = '#2c2825';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, width - 8, height - 8);
    } else {
      ctx.fillStyle = '#f5f3ef';
      ctx.fillRect(0, 0, width, height);
    }

    const dataUrl = canvas.toDataURL('image/png');
    return {
      id: `mat-line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      sourcePhotoId: photo.id,
      name: `${photo.name} · 线稿素材`,
      type: 'line_art',
      previewUrl: dataUrl,
      fullUrl: dataUrl,
      mood,
      primaryStyle,
      secondaryStyles,
      generationStatus: 'completed',
      createdAt: Date.now(),
    };
  }

  /**
   * 4. Creates vintage stamp date label
   */
  private async createDateLabel(
    photo: any,
    projectId: string,
    mood: string,
    primaryStyle: string,
    secondaryStyles: string[],
    palette: [string, string, string]
  ): Promise<GeneratedMaterial> {
    const canvas = document.createElement('canvas');
    const width = 280;
    const height = 90;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Distressed washi tape badge
    ctx.fillStyle = palette[2] || '#f4efe6';
    ctx.fillRect(8, 8, width - 16, height - 16);

    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(12, 12, width - 24, height - 24);
    ctx.setLineDash([]);

    // Typewriter text
    ctx.fillStyle = '#2c2825';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    const dateText = photo.capturedAt || '2026.10.10 MEMORY';
    ctx.fillText(dateText, width / 2, 42);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#7c756d';
    ctx.fillText(photo.name, width / 2, 64);

    const dataUrl = canvas.toDataURL('image/png');
    return {
      id: `mat-date-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      sourcePhotoId: photo.id,
      name: `${photo.name} · 日期便签`,
      type: 'date_label',
      previewUrl: dataUrl,
      fullUrl: dataUrl,
      mood,
      primaryStyle,
      secondaryStyles,
      generationStatus: 'completed',
      createdAt: Date.now(),
    };
  }

  /**
   * 5. Creates mood-tinted paper background texture
   */
  private async createMoodBackground(
    projectId: string,
    mood: string,
    primaryStyle: string,
    secondaryStyles: string[],
    palette: [string, string, string]
  ): Promise<GeneratedMaterial> {
    const canvas = document.createElement('canvas');
    const width = 360;
    const height = 360;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Soft gradient base
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, palette[2] || '#fbf9f5');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle kraft grid lines
    ctx.strokeStyle = `${palette[0]}22`; // 14% opacity
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const dataUrl = canvas.toDataURL('image/png');
    return {
      id: `mat-bg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      sourcePhotoId: 'global',
      name: `${mood} · 网格手账底纸`,
      type: 'background_texture',
      previewUrl: dataUrl,
      fullUrl: dataUrl,
      mood,
      primaryStyle,
      secondaryStyles,
      generationStatus: 'completed',
      createdAt: Date.now(),
    };
  }

  /**
   * 6. Creates decorative shape in mood palette
   */
  private async createDecorativeShape(
    projectId: string,
    mood: string,
    primaryStyle: string,
    secondaryStyles: string[],
    palette: [string, string, string]
  ): Promise<GeneratedMaterial> {
    const canvas = document.createElement('canvas');
    const width = 200;
    const height = 200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Draw organic botanical leaf or curved flower shape
    ctx.fillStyle = palette[0];
    ctx.beginPath();
    ctx.ellipse(100, 100, 70, 45, Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = palette[1];
    ctx.beginPath();
    ctx.ellipse(100, 100, 45, 25, -Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();

    const dataUrl = canvas.toDataURL('image/png');
    return {
      id: `mat-deco-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      sourcePhotoId: 'global',
      name: `${mood} · 氛围色块装饰`,
      type: 'decorative_shape',
      previewUrl: dataUrl,
      fullUrl: dataUrl,
      mood,
      primaryStyle,
      secondaryStyles,
      generationStatus: 'completed',
      createdAt: Date.now(),
    };
  }
}
