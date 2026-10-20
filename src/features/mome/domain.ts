import type { PhotoAnalysis } from '../../domain/types';

export type MomeScreen =
  | 'home'
  | 'prompt'
  | 'exploring'
  | 'subjects'
  | 'style'
  | 'generating'
  | 'result'
  | 'singlePhoto'
  | 'suggestions'
  | 'ideas'
  | 'library';

export type MaterialStyleId =
  | 'printmaking'
  | 'pixel-art'
  | 'retro-manga-ink'
  | 'dreamy-anime';

export interface ExplorationSuggestion {
  id: string;
  label: string;
  query: string;
  acknowledgement: string;
}

export interface MomePhoto {
  id: string;
  sessionId: string;
  fileName: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  width: number;
  height: number;
  thumbnailBlob: Blob;
  originalBlob: Blob;
  analysis?: PhotoAnalysis;
  importedAt: number;
}

export interface MomeCandidate {
  photoId: string;
  confidence: number;
  reason: string;
  revealed: boolean;
}

export interface MaterialSubject {
  id: string;
  sourcePhotoId: string;
  label: string;
  description: string;
  enabled: boolean;
  order: number;
}

export interface PrintableSheet {
  id: string;
  creationSessionId: string;
  sourcePhotoIds: string[];
  subjectIds: string[];
  styleId: MaterialStyleId;
  imageBlob: Blob;
  mimeType: 'image/png';
  aspectRatio: '1:4';
  imageSize: '2K';
  printWidthMm: 58;
  createdAt: number;
  libraryEligible: boolean;
}

export type AnalysisState =
  | { status: 'idle'; reviewed: 0; total: number; matched: 0 }
  | { status: 'running' | 'reviewing' | 'paused'; reviewed: number; total: number; matched: number }
  | { status: 'completed' | 'cancelled'; reviewed: number; total: number; matched: number }
  | { status: 'error'; reviewed: number; total: number; matched: number; message: string };

export type GenerationState =
  | { status: 'idle' }
  | { status: 'ready'; taskId: string }
  | { status: 'generating'; taskId: string }
  | { status: 'completed'; taskId: string; sheet: PrintableSheet }
  | { status: 'error'; taskId?: string; message: string };

export interface MomeSession {
  id: string;
  screen: MomeScreen;
  history: MomeScreen[];
  explorationQuery: string;
  agentAcknowledgement: string;
  suggestions: ExplorationSuggestion[];
  photos: MomePhoto[];
  candidates: MomeCandidate[];
  subjects: MaterialSubject[];
  styleId: MaterialStyleId | null;
  analysis: AnalysisState;
  generation: GenerationState;
  storageError: { code: 'STORAGE_QUOTA' | 'STORAGE_FAILED'; message: string } | null;
  createdAt: number;
  updatedAt: number;
}

export type MomeAction =
  | { type: 'START_NEW_EXPLORATION'; sessionId: string; now?: number }
  | { type: 'NAVIGATE'; screen: MomeScreen }
  | { type: 'BACK_WITHIN_FLOW' }
  | { type: 'SELECT_SUGGESTION'; suggestion: ExplorationSuggestion }
  | { type: 'SET_SUGGESTIONS'; suggestions: ExplorationSuggestion[] }
  | { type: 'IMPORT_PHOTOS'; photos: MomePhoto[] }
  | { type: 'SET_ANALYSIS'; analysis: AnalysisState }
  | { type: 'SET_CANDIDATES'; candidates: MomeCandidate[] }
  | { type: 'SET_SUBJECTS'; subjects: MaterialSubject[] }
  | { type: 'SET_STYLE'; styleId: MaterialStyleId }
  | { type: 'SET_GENERATION_STATUS'; status: 'ready' | 'generating'; taskId: string }
  | { type: 'SET_GENERATION_ERROR'; taskId?: string; message: string }
  | { type: 'COMPLETE_SHEET'; sheet: PrintableSheet }
  | { type: 'SET_STORAGE_ERROR'; error: MomeSession['storageError'] }
  | { type: 'HYDRATE'; session: MomeSession };
