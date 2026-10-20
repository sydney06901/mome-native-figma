/**
 * Client service for calling POST /api/gemini/generate-material-sheet
 * Strictly calls single interaction endpoint, without mocks, retries, or LocalMaterialProvider fallback.
 */

export interface MaterialSheetSubjectPayload {
  id: string;
  sourcePhotoId: string;
  title: string;
  description: string;
}

export interface ReferenceImagePayload {
  photoId: string;
  mimeType: string;
  imageData: string;
}

export interface GenerateMaterialSheetRequest {
  creationSessionId: string;
  subjectVersion?: number;
  styleId?: 'printmaking' | 'pixel-art' | 'retro-manga-ink' | 'dreamy-anime';
  idempotencyKey?: string;
  mood?: string;
  /** Legacy fields are temporarily retained so the archived prototype still type-checks. */
  primaryStyle?: string;
  secondaryStyles?: string[];
  subjects: MaterialSheetSubjectPayload[];
  referenceImages: ReferenceImagePayload[];
}

export interface GenerateMaterialSheetResponse {
  success: true;
  creationSessionId: string;
  idempotencyKey: string;
  sheet: {
    mimeType: string;
    base64Data: string;
    dataUrl: string;
    generatedAt: number;
    aspectRatio: '1:4';
    imageSize: '2K';
    printWidthMm: 58;
  };
}

export class MaterialSheetGenerationError extends Error {
  code?: string;
  stage?: string;

  constructor(message: string, code?: string, stage?: string) {
    super(message);
    this.name = 'MaterialSheetGenerationError';
    this.code = code;
    this.stage = stage;
  }
}

/**
 * Invokes the server-side single interaction endpoint
 */
export async function generateMaterialSheet(
  request: GenerateMaterialSheetRequest,
  signal: AbortSignal
): Promise<GenerateMaterialSheetResponse> {
  const res = await fetch('/api/gemini/generate-material-sheet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok) {
    let errorData: { code?: string; stage?: string; message?: string; error?: string } = {};
    try {
      errorData = await res.json();
    } catch {
      // Fallback if response is not JSON
      const text = await res.text();
      throw new MaterialSheetGenerationError(
        text || `HTTP ${res.status}: ${res.statusText}`,
        `HTTP_${res.status}`,
        'network_request'
      );
    }

    const message = errorData.message || errorData.error || `生图请求失败 (HTTP ${res.status})`;
    throw new MaterialSheetGenerationError(message, errorData.code, errorData.stage);
  }

  const data: GenerateMaterialSheetResponse = await res.json();
  return data;
}

/**
 * Pure utility function to convert Blob to base64 Data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('无法将图片数据转换为 Data URL'));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error('FileReader 转换失败'));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Pure utility function to convert clean base64 or Data URL to Blob
 */
export function base64ToBlob(base64Data: string, mimeType: string): Blob {
  const cleanBase64 = base64Data.replace(/^data:[a-zA-Z0-9+/.-]+;base64,/, '');
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteNumbers.buffer as ArrayBuffer], { type: mimeType });
}
