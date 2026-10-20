export const MATERIAL_STYLE_IDS = ['printmaking', 'pixel-art', 'retro-manga-ink', 'dreamy-anime'] as const;
export type MaterialStyleId = (typeof MATERIAL_STYLE_IDS)[number];
const MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type ImageMimeType = (typeof MIME_TYPES)[number];

export interface MaterialSheetRequest {
  creationSessionId: string;
  subjectVersion: number;
  styleId: MaterialStyleId;
  idempotencyKey: string;
  mood?: string;
  subjects: Array<{ id: string; sourcePhotoId: string; title: string; description: string }>;
  referenceImages: Array<{ photoId: string; mimeType: ImageMimeType; imageData: string }>;
}

export const IMAGE_OUTPUT_CONFIG = Object.freeze({
  type: 'image',
  mime_type: 'image/png',
  aspect_ratio: '1:4',
  image_size: '2K',
} as const);

const STYLE_PROMPT: Record<MaterialStyleId, string> = {
  printmaking: 'hand-carved printmaking, tactile ink grain, warm artisan color registration',
  'pixel-art': 'clean expressive pixel art, crisp block shapes, carefully limited vivid palette',
  'retro-manga-ink': 'retro manga ink, bold contour lines, controlled halftone texture, selective color accents',
  'dreamy-anime': 'dreamy anime illustration, soft luminous color, gentle atmospheric highlights',
};

function nonEmpty(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required`);
  return value.trim();
}

export function validateMaterialSheetRequest(value: unknown): MaterialSheetRequest {
  if (!value || typeof value !== 'object') throw new Error('Request body is required');
  const input = value as Record<string, unknown>;
  const creationSessionId = nonEmpty(input.creationSessionId, 'creationSessionId');
  const idempotencyKey = nonEmpty(input.idempotencyKey, 'idempotencyKey');
  if (!Number.isInteger(input.subjectVersion) || Number(input.subjectVersion) < 1) throw new Error('subjectVersion must be a positive integer');
  if (!MATERIAL_STYLE_IDS.includes(input.styleId as MaterialStyleId)) throw new Error('styleId is not supported');
  if (!Array.isArray(input.subjects) || input.subjects.length < 1 || input.subjects.length > 5) throw new Error('subjects must contain 1–5 items');
  if (!Array.isArray(input.referenceImages) || input.referenceImages.length < 1 || input.referenceImages.length > 5) throw new Error('referenceImages must contain 1–5 items');

  const referenceImages = input.referenceImages.map((raw, index) => {
    const item = raw as Record<string, unknown>;
    const photoId = nonEmpty(item.photoId, `referenceImages[${index}].photoId`);
    if (!MIME_TYPES.includes(item.mimeType as ImageMimeType)) throw new Error(`referenceImages[${index}].mimeType is not supported`);
    const imageData = nonEmpty(item.imageData, `referenceImages[${index}].imageData`).replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    return { photoId, mimeType: item.mimeType as ImageMimeType, imageData };
  });
  const referenceIds = new Set(referenceImages.map((item) => item.photoId));
  const subjects = input.subjects.map((raw, index) => {
    const item = raw as Record<string, unknown>;
    const subject = {
      id: nonEmpty(item.id, `subjects[${index}].id`),
      sourcePhotoId: nonEmpty(item.sourcePhotoId, `subjects[${index}].sourcePhotoId`),
      title: nonEmpty(item.title, `subjects[${index}].title`),
      description: typeof item.description === 'string' ? item.description.slice(0, 500) : '',
    };
    if (!referenceIds.has(subject.sourcePhotoId)) throw new Error(`No reference image for subject ${subject.id}`);
    return subject;
  });
  return { creationSessionId, subjectVersion: Number(input.subjectVersion), styleId: input.styleId as MaterialStyleId, idempotencyKey, mood: typeof input.mood === 'string' ? input.mood.slice(0, 120) : undefined, subjects, referenceImages };
}

export function composeMaterialSheetPrompt(request: MaterialSheetRequest): string {
  const subjects = request.subjects.map((subject, index) => `${index + 1}. ${subject.title}: ${subject.description} (reference ${subject.sourcePhotoId})`).join('\n');
  return `Create ONE tall 1:4 printable physical-journal sticker sheet from these references.
Style: ${STYLE_PROMPT[request.styleId]}.
Mood: ${request.mood || 'warm, memorable and tactile'}.
Subjects:\n${subjects}

Hard requirements:
- Pure white RGB 255,255,255 background.
- Render 1–5 independent vertical cuttable elements, arranged from top to bottom with generous white gaps.
- Each element has a clean closed silhouette and subtle die-cut white border.
- Preserve each reference subject's recognizable identity while translating it into the chosen style.
- Rich color suitable for a color printer at a logical 58 mm print width.
- No text, captions, letters, logos, watermarks, frames, or labels.
- This is not a collage: no overlapping photographs, no full-scene background, and no merged objects.`;
}

export function createIdempotentRunner<T>() {
  const jobs = new Map<string, Promise<T>>();
  return async (identity: string, work: () => Promise<T>): Promise<T> => {
    const existing = jobs.get(identity);
    if (existing) return existing;
    const promise = work();
    jobs.set(identity, promise);
    try {
      return await promise;
    } catch (error) {
      jobs.delete(identity);
      throw error;
    }
  };
}
