export interface CanvasItem {
  id: string;
  materialId: string;
  sourceType: 'memory' | 'physical';
  name: string;
  url: string;
  x: number; // percentage of canvas width (0-100) or pixel
  y: number; // percentage of canvas height (0-100) or pixel
  scale: number; // default 1.0 (0.3 - 3.0)
  rotation: number; // degrees -180 to 180
  zIndex: number;
  width: number; // natural or display base width
  height: number;
}
