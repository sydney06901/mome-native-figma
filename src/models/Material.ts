export type MaterialType =
  | 'crop'
  | 'ai_sketch'
  | 'subject_sticker'
  | 'line_art'
  | 'torn_photo'
  | 'photo_card'
  | 'background_texture'
  | 'decorative_shape'
  | 'date_label'
  | 'keyword_label';

export interface CropBounds {
  x: number; // percentage or pixel relative to natural image
  y: number;
  width: number;
  height: number;
}

export interface Material {
  id: string;
  projectId: string;
  projectName?: string;
  sourcePhotoId: string;
  sourcePhotoUrl?: string;
  name: string;
  type: MaterialType;
  previewUrl: string; // cropped or sketch image data URL
  fullUrl: string;
  style?: string;
  cropBounds?: CropBounds;
  isDemo?: boolean;
  isDemoSketch?: boolean;
  capturedAt?: string; // 拍摄时间，如 "2026-10-10 14:30"
  historyVersions?: {
    id: string;
    url: string;
    createdAt: number;
    style: string;
    versionIndex: number;
  }[];
  createdAt: number;
}
