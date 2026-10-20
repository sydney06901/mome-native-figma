import { CursorEvent, CursorVisualState } from '../../../domain/types.ts';

export type { CursorEvent, CursorVisualState };

export interface BloubCursorShellProps {
  visualState: CursorVisualState;
  targetPhotoId?: string;
  progress?: number; // 0 to 1
  reducedMotion?: boolean;
  onTransitionComplete?: () => void;
  className?: string;
}
