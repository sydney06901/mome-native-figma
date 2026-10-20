import {
  blobToDataUrl,
  generateMaterialSheet,
  type GenerateMaterialSheetRequest,
  type GenerateMaterialSheetResponse,
} from '../../../services/materialGeneration/materialSheetClient';
import type { MaterialStyleId, MomeSession } from '../domain';

export interface StrictMaterialSheetRequest extends GenerateMaterialSheetRequest {
  subjectVersion: number;
  styleId: MaterialStyleId;
  idempotencyKey: string;
}

function stableSubjectVersion(session: MomeSession): number {
  const identity = session.subjects
    .filter((subject) => subject.enabled)
    .slice(0, 5)
    .map((subject) => `${subject.id}|${subject.sourcePhotoId}|${subject.label}|${subject.description}`)
    .join('::');
  let hash = 2166136261;
  for (let index = 0; index < identity.length; index += 1) {
    hash ^= identity.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.max(1, hash >>> 0);
}

export async function buildMaterialSheetRequest(
  session: MomeSession,
  toDataUrl: (blob: Blob) => Promise<string> = blobToDataUrl,
): Promise<StrictMaterialSheetRequest> {
  if (!session.styleId) throw new Error('Choose a style before generating');
  const subjects = session.subjects.filter((subject) => subject.enabled).slice(0, 5);
  if (subjects.length === 0) throw new Error('Choose at least one subject');
  const photos = new Map(session.photos.map((photo) => [photo.id, photo]));
  const referenceImages = await Promise.all(subjects.map(async (subject) => {
    const photo = photos.get(subject.sourcePhotoId);
    if (!photo) throw new Error(`Missing source photo for ${subject.label}`);
    return {
      photoId: photo.id,
      mimeType: photo.mimeType,
      imageData: await toDataUrl(photo.originalBlob),
    };
  }));
  const subjectVersion = stableSubjectVersion(session);
  return {
    creationSessionId: session.id,
    subjectVersion,
    styleId: session.styleId,
    idempotencyKey: `${session.id}:${subjectVersion}:${session.styleId}`,
    mood: 'warm, memorable and tactile',
    subjects: subjects.map((subject) => ({
      id: subject.id,
      sourcePhotoId: subject.sourcePhotoId,
      title: subject.label,
      description: subject.description,
    })),
    referenceImages,
  };
}

type GenerationApi = (
  request: GenerateMaterialSheetRequest,
  signal: AbortSignal,
) => Promise<GenerateMaterialSheetResponse>;

export class MaterialSheetGenerationController {
  private jobs = new Map<string, Promise<GenerateMaterialSheetResponse>>();

  constructor(private readonly api: GenerationApi = generateMaterialSheet) {}

  generate(request: StrictMaterialSheetRequest, signal: AbortSignal): Promise<GenerateMaterialSheetResponse> {
    const existing = this.jobs.get(request.idempotencyKey);
    if (existing) return existing;
    const job = this.api(request, signal).catch((error) => {
      this.jobs.delete(request.idempotencyKey);
      throw error;
    });
    this.jobs.set(request.idempotencyKey, job);
    return job;
  }
}

export const materialSheetGenerationController = new MaterialSheetGenerationController();
