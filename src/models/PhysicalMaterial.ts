export type PhysicalMaterialType = 'tape' | 'sticker' | 'ticket' | 'paper' | 'embellishment';

export interface PhysicalMaterial {
  id: string;
  type: PhysicalMaterialType;
  subType?: string;
  name: string;
  imageUrl: string;
  backImageUrl?: string;
  widthMm?: number;
  heightMm?: number;
  remainingText?: string; // 数量或是否仍有剩余, e.g. "5张", "整卷", "约剩余30cm"
  allowTrim?: boolean; // 是否允许剪裁 (常用于票根或纸片)
  notes?: string;
  createdAt: number;
}
