export interface PhotoItem {
  id: string;
  projectId: string;
  name: string;
  url: string; // Base64 data URL or SVG data URL
  capturedAt?: string; // e.g. "2026-10-10" or "日期未知"
  dateUnknown?: boolean;
  tags?: string[];
  isBuilding?: boolean; // preset tag for demo evaluation
  description?: string;
  width?: number;
  height?: number;
  isDemo?: boolean;
  thumbnailBase64?: string;
  thumbnailBlob?: Blob;
  originalBlob?: Blob;
}
