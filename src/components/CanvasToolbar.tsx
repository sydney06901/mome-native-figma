import React from 'react';
import { CanvasItem } from '../models/CanvasItem.ts';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Trash2,
  Layers,
} from 'lucide-react';

interface CanvasToolbarProps {
  selectedLayer: CanvasItem | null;
  onUpdateLayer: (updated: Partial<CanvasItem>) => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onDeleteLayer: () => void;
  canMoveForward: boolean;
  canMoveBackward: boolean;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  selectedLayer,
  onUpdateLayer,
  onMoveForward,
  onMoveBackward,
  onDeleteLayer,
  canMoveForward,
  canMoveBackward,
}) => {
  if (!selectedLayer) {
    return (
      <div className="mx-auto max-w-sm px-4">
        <div className="py-2.5 px-4 text-center rounded-full bg-white/90 backdrop-blur-md border border-[#2a2336]/[0.07] shadow-xs text-xs text-[#747078] flex items-center justify-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#9684DF]" />
          <span>点击素材图层以移动、缩放、旋转或调整层级</span>
        </div>
      </div>
    );
  }

  const handleScaleChange = (newScale: number) => {
    const clamped = Math.max(0.3, Math.min(3.0, parseFloat(newScale.toFixed(2))));
    onUpdateLayer({ scale: clamped });
  };

  const handleRotationChange = (newRotation: number) => {
    let rot = newRotation % 360;
    if (rot > 180) rot -= 360;
    if (rot < -180) rot += 360;
    onUpdateLayer({ rotation: Math.round(rot) });
  };

  return (
    <div className="mx-auto max-w-sm px-3">
      <div className="p-3.5 bg-white/95 backdrop-blur-md rounded-[24px] border border-[#2a2336]/[0.08] shadow-[0_10px_28px_rgba(42,35,54,0.08)] space-y-3">
        {/* Layer Header & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8925A] shrink-0" />
            <p className="font-display text-[14px] font-bold text-[#17171B] truncate">
              {selectedLayer.name}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Layer Up */}
            <button
              type="button"
              disabled={!canMoveForward}
              onClick={onMoveForward}
              className="w-9 h-9 rounded-full bg-[#F2F0F6] text-[#747078] hover:text-[#17171B] hover:bg-[#E7E1FA] flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all cursor-pointer"
              title="前移一层"
              aria-label="前移一层"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            {/* Layer Down */}
            <button
              type="button"
              disabled={!canMoveBackward}
              onClick={onMoveBackward}
              className="w-9 h-9 rounded-full bg-[#F2F0F6] text-[#747078] hover:text-[#17171B] hover:bg-[#E7E1FA] flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all cursor-pointer"
              title="后移一层"
              aria-label="后移一层"
            >
              <ArrowDown className="w-4 h-4" />
            </button>

            {/* Delete Layer */}
            <button
              type="button"
              onClick={onDeleteLayer}
              className="w-9 h-9 rounded-full bg-[#FDF5F5] text-[#C86666] hover:bg-[#FBE8E8] flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title="删除此图层"
              aria-label="删除此图层"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sliders & Controls */}
        <div className="grid grid-cols-2 gap-3 pt-0.5">
          {/* Scale Control */}
          <div className="space-y-1 bg-[#FBFAFD] p-2 rounded-[16px] border border-[#2a2336]/[0.05]">
            <div className="flex items-center justify-between text-[11px] text-[#747078]">
              <span>缩放</span>
              <span className="font-mono text-[#17171B] font-semibold">
                {Math.round(selectedLayer.scale * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScaleChange(selectedLayer.scale - 0.1)}
                className="w-8 h-8 rounded-full bg-white border border-[#2a2336]/[0.08] flex items-center justify-center text-[#747078] hover:text-[#17171B] active:scale-90 cursor-pointer"
                aria-label="缩小"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.05"
                value={selectedLayer.scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="flex-1 accent-[#E8925A] h-1.5 bg-[#E7E1FA] rounded-full cursor-pointer"
                aria-label="缩放滑块"
              />
              <button
                type="button"
                onClick={() => handleScaleChange(selectedLayer.scale + 0.1)}
                className="w-8 h-8 rounded-full bg-white border border-[#2a2336]/[0.08] flex items-center justify-center text-[#747078] hover:text-[#17171B] active:scale-90 cursor-pointer"
                aria-label="放大"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rotation Control */}
          <div className="space-y-1 bg-[#FBFAFD] p-2 rounded-[16px] border border-[#2a2336]/[0.05]">
            <div className="flex items-center justify-between text-[11px] text-[#747078]">
              <span>旋转</span>
              <span className="font-mono text-[#17171B] font-semibold">{selectedLayer.rotation}°</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleRotationChange(selectedLayer.rotation - 15)}
                className="w-8 h-8 rounded-full bg-white border border-[#2a2336]/[0.08] flex items-center justify-center text-[#747078] hover:text-[#17171B] active:scale-90 cursor-pointer"
                aria-label="逆时针旋转"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={selectedLayer.rotation}
                onChange={(e) => handleRotationChange(parseInt(e.target.value, 10))}
                className="flex-1 accent-[#9684DF] h-1.5 bg-[#E7E1FA] rounded-full cursor-pointer"
                aria-label="旋转滑块"
              />
              <button
                type="button"
                onClick={() => handleRotationChange(selectedLayer.rotation + 15)}
                className="w-8 h-8 rounded-full bg-white border border-[#2a2336]/[0.08] flex items-center justify-center text-[#747078] hover:text-[#17171B] active:scale-90 cursor-pointer"
                aria-label="顺时针旋转"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
