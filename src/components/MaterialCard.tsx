import React from 'react';
import { Material } from '../models/Material.ts';
import { Sparkles, Scissors, Plus, Trash2, ExternalLink } from 'lucide-react';

interface MaterialCardProps {
  material: Material;
  onViewDetail?: (material: Material) => void;
  onAddToCanvas?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  onViewSourcePhoto?: (sourcePhotoId: string) => void;
  inCanvasUsageCount?: number;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onViewDetail,
  onAddToCanvas,
  onDelete,
  onViewSourcePhoto,
  inCanvasUsageCount = 0,
}) => {
  const isSketch = material.type === 'ai_sketch';

  return (
    <div className="bg-white rounded-2xl border border-[#e8e4dc] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#cfc9bf] transition-colors">
      {/* Thumbnail Area */}
      <div
        onClick={() => onViewDetail?.(material)}
        className="relative aspect-square bg-[#fbf9f5] flex items-center justify-center p-3 cursor-pointer overflow-hidden group"
      >
        <img
          src={material.previewUrl}
          alt={material.name}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform group-hover:scale-105"
        />

        {/* Type Kicker Tag */}
        <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] text-[#7c756d] bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#e8e4dc] font-medium">
          {isSketch ? (
            <>
              <Sparkles className="w-3 h-3 text-[#3b6e8c]" />
              <span>{material.isDemoSketch ? '示例插画' : 'AI 线稿'}</span>
            </>
          ) : (
            <>
              <Scissors className="w-3 h-3 text-[#507d64]" />
              <span>原图裁剪</span>
            </>
          )}
        </div>

        {inCanvasUsageCount > 0 && (
          <div className="absolute top-2 right-2 text-[10px] bg-[#3b6e8c] text-white px-1.5 py-0.5 rounded-md font-medium">
            已拼贴 ×{inCanvasUsageCount}
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-3 border-t border-[#f0ece4] flex-1 flex flex-col justify-between">
        <div>
          <h4
            onClick={() => onViewDetail?.(material)}
            className="text-xs font-semibold text-[#2c2825] line-clamp-1 cursor-pointer hover:text-[#3b6e8c]"
          >
            {material.name}
          </h4>
          <p className="text-[11px] text-[#7c756d] truncate mt-0.5">
            {material.projectName || '未分类手账项目'}
          </p>
          {material.capturedAt && (
            <p className="text-[10px] text-[#9e978e] mt-1 flex items-center gap-1 font-mono">
              <span>📷 拍摄: {material.capturedAt}</span>
            </p>
          )}
        </div>

        {/* Action Buttons (44px min touch targets) */}
        <div className="mt-3 flex items-center justify-between gap-1.5 pt-2 border-t border-[#f4f0e8]">
          {onViewSourcePhoto && material.sourcePhotoId && (
            <button
              type="button"
              onClick={() => onViewSourcePhoto(material.sourcePhotoId)}
              className="min-h-[44px] px-2 rounded-xl text-[#7c756d] hover:text-[#1c1a18] hover:bg-[#f6f4ee] text-[11px] flex items-center gap-1 active:scale-95"
              title="查看来源照片"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>原图</span>
            </button>
          )}

          <div className="flex items-center gap-1 ml-auto">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(material)}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[#7c756d] hover:text-[#b34033] hover:bg-[#faeeec] transition-colors active:scale-90"
                title="删除素材副本"
                aria-label="删除素材副本"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {onAddToCanvas && (
              <button
                type="button"
                onClick={() => onAddToCanvas(material)}
                className="min-h-[44px] px-3 rounded-xl bg-[#3b6e8c] hover:bg-[#325e77] text-white text-xs font-medium flex items-center gap-1 shadow-xs active:scale-95 transition-transform"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>加入画布</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
