export type GeneratedMaterialType =
  | 'subject_sticker'
  | 'line_art'
  | 'torn_photo'
  | 'photo_card'
  | 'background_texture'
  | 'decorative_shape'
  | 'date_label'
  | 'keyword_label';

export interface GeneratedMaterial {
  id: string;
  projectId: string;
  sourcePhotoId: string;
  name: string;
  type: GeneratedMaterialType;
  previewUrl: string;
  fullUrl: string;
  mood: string;
  primaryStyle: string;
  secondaryStyles: string[];
  generationStatus: 'queued' | 'generating' | 'completed' | 'failed';
  createdAt: number;
}

export type MaterialCreationStep =
  | 'selectingPhotos'
  | 'confirmingPhotos'
  | 'choosingMood'
  | 'choosingStyle'
  | 'confirmingDirection'
  | 'generatingMaterials'
  | 'reviewingMaterials'
  | 'completed'
  | 'error';

export interface MaterialGenerationProgress {
  current: number;
  total: number;
  stepDescription: string;
  completedMaterial?: GeneratedMaterial;
  failedCount?: number;
}

export interface MaterialGenerationRequest {
  projectId: string;
  photos: {
    id: string;
    name: string;
    url: string;
    capturedAt?: string;
    tags?: string[];
    description?: string;
  }[];
  mood: string;
  primaryStyle: string;
  secondaryStyles: string[];
  signal?: AbortSignal;
  onProgress?: (progress: MaterialGenerationProgress) => void;
}

export interface MaterialGenerationProvider {
  generate(request: MaterialGenerationRequest): Promise<GeneratedMaterial[]>;
}
