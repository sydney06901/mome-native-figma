import React, { useState, useRef, useEffect } from 'react';
import { PhotoItem } from '../models/PhotoItem.ts';
import { CropBounds } from '../models/Material.ts';
import { cropImageToDataUrl } from '../services/imageProcessor.ts';
import { X, Check, Scissors, RotateCcw } from 'lucide-react';

interface CropEditorProps {
  photo: PhotoItem;
  onSaveCrop: (croppedDataUrl: string, bounds: CropBounds, materialName: string) => void;
  onCancel: () => void;
}

export const CropEditor: React.FC<CropEditorProps> = ({
  photo,
  onSaveCrop,
  onCancel,
}) => {
  // Default crop box: center 60% x 60%
  const [bounds, setBounds] = useState<CropBounds>({
    x: 20,
    y: 20,
    width: 60,
    height: 60,
  });

  const [materialName, setMaterialName] = useState(`${photo.name}·原图素材`);
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<'move' | 'se' | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startBounds: CropBounds } | null>(null);

  // Touch and mouse dragging
  const handlePointerDown = (mode: 'move' | 'se', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragMode(mode);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startBounds: { ...bounds },
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragMode || !dragStartRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;
      const start = dragStartRef.current.startBounds;

      if (dragMode === 'move') {
        let newX = Math.max(0, Math.min(100 - start.width, start.x + deltaXPercent));
        let newY = Math.max(0, Math.min(100 - start.height, start.y + deltaYPercent));
        setBounds((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (dragMode === 'se') {
        let newW = Math.max(15, Math.min(100 - start.x, start.width + deltaXPercent));
        let newH = Math.max(15, Math.min(100 - start.y, start.height + deltaYPercent));
        setBounds((prev) => ({ ...prev, width: newW, height: newH }));
      }
    };

    const handlePointerUp = () => {
      setDragMode(null);
      dragStartRef.current = null;
    };

    if (dragMode) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragMode]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const croppedUrl = await cropImageToDataUrl(photo.url, bounds);
      onSaveCrop(croppedUrl, bounds, materialName);
    } catch (err) {
      alert('裁剪处理异常，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetBounds = () => {
    setBounds({ x: 15, y: 15, width: 70, height: 70 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1f1d1b] text-white flex flex-col justify-between">
      {/* Top Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-semibold">原图裁剪</h2>
          <p className="text-[10px] text-white/50">保留真实物件比例与坐标</p>
        </div>
        <button
          type="button"
          onClick={resetBounds}
          className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white"
          title="重置选框"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Image Viewport with Draggable Box */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden select-none">
        <div
          ref={containerRef}
          className="relative max-w-full max-h-[60vh] aspect-[4/3] bg-black/40 rounded-lg overflow-hidden touch-none"
        >
          <img
            src={photo.url}
            alt={photo.name}
            className="w-full h-full object-contain pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Semi-transparent dark overlay */}
          <div className="absolute inset-0 bg-black/55 pointer-events-none" />

          {/* Clear Cropped Viewport Box */}
          <div
            style={{
              left: `${bounds.x}%`,
              top: `${bounds.y}%`,
              width: `${bounds.width}%`,
              height: `${bounds.height}%`,
            }}
            onPointerDown={(e) => handlePointerDown('move', e)}
            className="absolute border-2 border-[#fff] shadow-2xl cursor-move touch-none"
          >
            {/* Show clear image slice behind the cutout */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                backgroundImage: `url(${photo.url})`,
                backgroundSize: `${(100 / bounds.width) * 100}% ${(100 / bounds.height) * 100}%`,
                backgroundPosition: `${(bounds.x / (100 - bounds.width || 1)) * 100}% ${(bounds.y / (100 - bounds.height || 1)) * 100}%`,
              }}
            />

            {/* Rule of thirds grid lines */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-b border-white/25" />
              <div className="border-r border-white/25" />
              <div className="border-r border-white/25" />
              <div />
            </div>

            {/* Southeast Resize Handle */}
            <div
              onPointerDown={(e) => handlePointerDown('se', e)}
              className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#3b6e8c] border-2 border-white rounded-full flex items-center justify-center cursor-nwse-resize shadow-md touch-none"
            >
              <div className="w-2 h-2 bg-white rounded-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#292623] p-4 border-t border-white/10 space-y-3 shrink-0">
        <div>
          <label className="text-[11px] text-white/60 block mb-1">素材名称</label>
          <input
            type="text"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            className="w-full h-10 px-3 text-xs bg-white/10 rounded-lg text-white border border-white/15 outline-none focus:border-[#3b6e8c]"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/60">
          <span>拖拽选框移动 · 右下角圆点调整尺寸</span>
          <span className="text-white/40">注：后续将预留精细透明抠图</span>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/15 active:scale-98 transition-transform"
          >
            取消
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="flex-1 h-11 rounded-xl bg-[#3b6e8c] text-white text-xs font-semibold hover:bg-[#325e77] active:scale-98 transition-transform flex items-center justify-center gap-1.5 shadow-md"
          >
            <Scissors className="w-4 h-4" />
            {isProcessing ? '正在裁剪...' : '保存素材'}
          </button>
        </div>
      </div>
    </div>
  );
};
