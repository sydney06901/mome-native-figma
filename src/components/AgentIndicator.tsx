import React from 'react';
import { BloubCursorShell } from '../features/memory-explorer/bloub/BloubCursorShell.tsx';
import { CursorVisualState } from '../domain/types.ts';
import { Play, Pause, X, RotateCcw } from 'lucide-react';
import { useReducedMotion } from '../shared/hooks/useReducedMotion.ts';

interface AgentIndicatorProps {
  isScanning: boolean;
  stageText: string;
  matchedCount: number;
  totalCount: number;
  visualState?: CursorVisualState;
  targetPhotoId?: string;
  progress?: number;
  isPaused?: boolean;
  isError?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const AgentIndicator: React.FC<AgentIndicatorProps> = ({
  isScanning,
  stageText,
  matchedCount,
  totalCount,
  visualState = isScanning ? 'observing' : matchedCount > 0 ? 'celebrating' : 'idle',
  targetPhotoId,
  progress = 0,
  isPaused = false,
  isError = false,
  onPause,
  onResume,
  onCancel,
  onRetry,
}) => {
  const reducedMotion = useReducedMotion();

  if (!isScanning && matchedCount === 0 && !isError) return null;

  return (
    <div className="mx-5 my-2.5 p-3 rounded-2xl bg-white border border-[#e8e4dc] shadow-sm flex items-center justify-between gap-3 text-xs animate-in fade-in">
      <div className="flex items-center gap-2.5 min-w-0">
        <BloubCursorShell
          visualState={visualState}
          targetPhotoId={targetPhotoId}
          progress={progress}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Task Controls (Pause, Resume, Cancel, Retry - 44px min touch target) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isScanning && !isPaused && onPause && (
          <button
            onClick={onPause}
            type="button"
            className="w-11 h-11 rounded-xl border border-[#e0dad0] text-[#7c756d] hover:text-[#1c1a18] flex items-center justify-center active:scale-95 transition-transform"
            title="暂停分析"
            aria-label="暂停分析"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        {isPaused && onResume && (
          <button
            onClick={onResume}
            type="button"
            className="min-h-[44px] px-3.5 rounded-xl bg-[#3b6e8c] text-white flex items-center gap-1 active:scale-95 transition-transform font-medium"
            title="继续分析"
            aria-label="继续分析"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>继续</span>
          </button>
        )}

        {isError && onRetry && (
          <button
            onClick={onRetry}
            type="button"
            className="min-h-[44px] px-3.5 rounded-xl bg-[#ba3d3d] text-white flex items-center gap-1 active:scale-95 transition-transform font-medium"
            title="重试失败批次"
            aria-label="重试失败批次"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重试</span>
          </button>
        )}

        {(isScanning || isPaused) && onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="min-h-[44px] px-3 rounded-xl border border-[#e0dad0] text-[#7c756d] hover:text-[#1c1a18] text-xs font-medium active:scale-95 transition-transform"
            aria-label="取消巡视"
          >
            取消
          </button>
        )}
      </div>
    </div>
  );
};
