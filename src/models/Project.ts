export interface Project {
  id: string;
  name: string;
  title?: string;
  coverUrl?: string;
  createdAt: number | string;
  updatedAt: number | string;
  isDemo?: boolean;
  description?: string;
  targetDate?: string; // e.g. "2026-10-10"
  targetKeyword?: string; // e.g. "建筑"
  stylePreference?: string; // e.g. "黑白线稿"
  candidatePhotoIds?: string[];
  canvasLayers?: any[]; // saved canvas state
  sourcePhotoIds?: string[];
  stickerIds?: string[];
  canvasState?: any;
}
