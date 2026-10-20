import { PhotoAnalysis } from '../../domain/types.ts';

export interface BatchPhotoInput {
  photoId: string;
  imageData?: string; // Base64 data URL or thumbnail
  metadata?: {
    fileName?: string;
    capturedAt?: string;
    description?: string;
    tags?: string[];
    isBuilding?: boolean;
  };
}

export interface BatchAnalysisInput {
  taskId: string;
  userQuery: string;
  photos: BatchPhotoInput[];
  batchIndex?: number;
  totalBatches?: number;
}

export interface AgentRequestError {
  stage:
    | 'client_request'
    | 'server_route'
    | 'authentication'
    | 'image_conversion'
    | 'gemini_request'
    | 'response_parsing'
    | 'response_validation';
  status?: number;
  code?: string;
  message: string;
  batchIndex?: number;
}

export interface BatchAnalysisResponse {
  results: PhotoAnalysis[];
  isMock: boolean;
  modelUsed?: string;
  error?: string;
}
