/**
 * Unified Domain Models & Types
 * AI Memory Scrapbook Web App
 */

import { Material } from '../models/Material.ts';
import { PhysicalMaterial } from '../models/PhysicalMaterial.ts';
import { CanvasItem } from '../models/CanvasItem.ts';

// Re-export existing models for seamless backward-compatibility
export type { Material, PhysicalMaterial, CanvasItem };

export type ImportStatus = 'pending' | 'processing' | 'ready' | 'error';

export type AnalysisStatus =
  | 'unprocessed'
  | 'queued'
  | 'scanning'
  | 'analyzed'
  | 'failed';

export interface PhotoAsset {
  id: string;
  projectId: string;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  createdAt?: string;
  capturedAt?: string;
  objectUrl: string;
  thumbnailUrl: string;
  thumbnailBlob?: Blob;
  originalBlob?: Blob;
  thumbnailBase64?: string;
  importStatus: ImportStatus;
  analysisStatus: AnalysisStatus;
  analysis?: PhotoAnalysis;
  tags?: string[];
  isBuilding?: boolean;
  isDemo?: boolean;
  description?: string;
}

export type MemoryAgentAction =
  | {
      type: 'START_PHOTO_SEARCH';
      query: string;
    }
  | {
      type: 'PAUSE_PHOTO_SEARCH';
    }
  | {
      type: 'RESUME_PHOTO_SEARCH';
    }
  | {
      type: 'STOP_PHOTO_SEARCH';
    }
  | {
      type: 'SKIP_VISUAL_REVIEW';
    };

export interface PhotoAnalysis {
  photoId: string;
  summary: string;
  labels: string[];
  detectedSubjects: string[];
  match: boolean;
  confidence: number; // 0.0 - 1.0
  reason: string;
  analyzedAt: string;
}

export type SearchTaskStatus =
  | 'idle'
  | 'preparing'
  | 'filtering'
  | 'uploading'
  | 'scanning'
  | 'reviewing'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'error';

export interface SearchTask {
  id: string;
  projectId: string;
  query: string;
  status: SearchTaskStatus;
  totalPhotos: number;
  processedPhotos: number;
  matchedPhotoIds: string[];
  currentPhotoId?: string;
  currentBatchIndex: number;
  totalBatches: number;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Candidate {
  photoId: string;
  confidence: number;
  reason: string;
  selected: boolean;
  summary?: string;
  detectedSubjects?: string[];
}

export type MaterialCreationStep =
  | 'reviewingCandidates'
  | 'confirmingSelection'
  | 'choosingMood'
  | 'choosingStyle'
  | 'readyToGenerate'
  | 'planningSheet'
  | 'confirmingSubjects'
  | 'generatingSheet'
  | 'reviewingSheet'
  | 'completed'
  | 'error';

export interface MaterialSheetSubject {
  id: string;
  sourcePhotoId: string;
  title: string;
  description: string;
  reason: string;
  enabled: boolean;
}

export interface PrintableMaterialSheet {
  id: string;
  creationSessionId: string;
  sourcePhotoIds: string[];
  subjects: MaterialSheetSubject[];
  mood: string;
  primaryStyle: string;
  secondaryStyles: string[];
  imageBlob: Blob;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: number;
}

export interface MaterialCreationSession {
  id: string;
  sourceExploreSessionId: string;
  selectedPhotoIds: string[];
  selectedMoodIds: string[];
  selectedStyleId: string | null;
  status:
    | 'choosing_preferences'
    | 'ready'
    | 'generating'
    | 'reviewing'
    | 'completed'
    | 'failed';
  subjectPlan?: MaterialSheetSubject[];
  printableSheet?: PrintableMaterialSheet;
  generationRequestId?: string;
  generationError?: {
    code?: string;
    message: string;
    stage?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface MaterialSourcePhoto {
  id: string;
  creationSessionId: string;
  originalPhotoId: string;
  fileName: string;
  mimeType: string;
  originalBlob: Blob;
  thumbnailBlob: Blob;
  width: number;
  height: number;
  analysisSummary?: string;
  detectedSubjects?: string[];
}

export interface Project {
  id: string;
  title: string;
  name: string; // compatibility with existing UI
  coverUrl?: string;
  createdAt: string | number;
  updatedAt: string | number;
  isDemo?: boolean;
  description?: string;
  targetDate?: string;
  targetKeyword?: string;
  stylePreference?: string;
  sourcePhotoIds: string[];
  candidatePhotoIds?: string[]; // compatibility
  materialCreationStep?: MaterialCreationStep;
  selectedMood?: string;
  selectedPrimaryStyle?: string;
  selectedSecondaryStyles?: string[];
  stickerIds: string[];
  canvasState?: any;
  canvasLayers?: CanvasItem[]; // compatibility
}

export type CursorEvent =
  | 'taskStarted'
  | 'batchStarted'
  | 'photoFocused'
  | 'photoSkipped'
  | 'matchFound'
  | 'candidateAdded'
  | 'batchCompleted'
  | 'paused'
  | 'resumed'
  | 'completed'
  | 'error';

export type CursorVisualState =
  | 'idle'
  | 'preparing'
  | 'travelling'
  | 'observing'
  | 'thinking'
  | 'matched'
  | 'confirming'
  | 'paused'
  | 'celebrating'
  | 'confused';
