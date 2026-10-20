import React from 'react';
import { MOOD_OPTIONS, STYLE_OPTIONS } from '../../../services/materialGeneration/presets.ts';
import { PhotoItem } from '../../../models/PhotoItem.ts';
import { Sparkles, Layers, ArrowLeft, Wand2, CheckCircle2 } from 'lucide-react';

interface DirectionConfirmationProps {
  photos: PhotoItem[];
  selectedPhotoIds: string[];
  selectedMood: string;
  customMoodText: string;
  primaryStyle: string;
  secondaryStyles: string[];
  onStartGeneration: () => void;
  onBackToEdit: () => void;
}

export const DirectionConfirmation: React.FC<DirectionConfirmationProps> = ({
  photos,
  selectedPhotoIds,
  selectedMood,
  customMoodText,
  primaryStyle,
  secondaryStyles,
  onStartGeneration,
  onBackToEdit,
}) => {
  const selectedPhotos = photos.filter((p) => selectedPhotoIds.includes(p.id));
  const moodObj = MOOD_OPTIONS.find((m) => m.id === selectedMood);
  const moodTitle = selectedMood === 'custom' ? (customMoodText || '自定义心情') : (moodObj?.title || selectedMood);
  const palette = moodObj?.palette || ['#3b6e8c', '#e09867', '#fbf9f5'];

  const primaryStyleObj = STYLE_OPTIONS.find((s) => s.id === primaryStyle);
  const secondaryStyleObjs = STYLE_OPTIONS.filter((s) => secondaryStyles.includes(s.id));


  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="p-4 rounded-3xl bg-white border border-[#eae5dc] shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#fbf5ee] text-[#946d45] flex items-center justify-center">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1c1a18]">
              从 {selectedPhotos.length} 张候选照片中整理 1 张实体打印素材页
            </h3>
            <p className="text-[11px] text-[#7c756d]">AI 将推荐最多 5 个核心主要对象，原图完好保留</p>
          </div>
        </div>

        {/* Selected Photos Row */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-semibold text-[#8e877e] uppercase tracking-wider">
            候选照片池 ({selectedPhotos.length} 张)
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {selectedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#e4ded4] bg-[#f5f2eb] shadow-2xs relative"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mood & Style Summary Badges */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#f0ece4]">
          <div className="p-2.5 rounded-2xl bg-[#faf8f5] border border-[#eeeae2]">
            <span className="text-[10px] text-[#8e877e] block">设定的心情氛围</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-[#1c1a18] truncate">{moodTitle}</span>
              <div className="flex items-center gap-0.5 shrink-0">
                {palette.map((c, i) => (
                  <span key={i} className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#faf8f5] border border-[#eeeae2]">
            <span className="text-[10px] text-[#8e877e] block">艺术风格组合</span>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-xs font-bold text-[#3b6e8c]">
                {primaryStyleObj?.name || '黑白线稿'}
              </span>
              {secondaryStyleObjs.map((s) => (
                <span
                  key={s.id}
                  className="text-[9px] px-1 py-0.2 rounded-md bg-[#ede6da] text-[#7c7062] font-medium"
                >
                  +{s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sheet Specifications Breakdown */}
      <div className="p-4 rounded-3xl bg-white border border-[#eae5dc] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1c1a18] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#3b6e8c]" />
            <span>实体彩色素材页规格</span>
          </span>
          <span className="text-[10px] font-semibold text-[#2b7354] bg-[#ddf3e9] px-2 py-0.5 rounded-full">
            单次合成 · 1张打印页
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fdfcf9] border border-[#f0ece4]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#507d64]" />
              <span className="font-semibold text-[#2c2825]">候选照片规模</span>
            </div>
            <span className="text-[11px] text-[#7c756d]">入选 {selectedPhotos.length} 张（不为每张单独生图）</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fdfcf9] border border-[#f0ece4]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#507d64]" />
              <span className="font-semibold text-[#2c2825]">主要素材对象</span>
            </div>
            <span className="text-[11px] text-[#7c756d]">AI 精选推荐最多 5 个代表性元素</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fdfcf9] border border-[#f0ece4]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#507d64]" />
              <span className="font-semibold text-[#2c2825]">参考图上限</span>
            </div>
            <span className="text-[11px] text-[#7c756d]">最多使用 5 张参考照片提炼轮廓</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fdfcf9] border border-[#f0ece4]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#507d64]" />
              <span className="font-semibold text-[#2c2825]">最终交付物</span>
            </div>
            <span className="text-[11px] font-medium text-[#3b6e8c]">1 张彩色排版打印页（方便剪刀裁剪）</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToEdit}
            className="flex-1 min-h-[46px] rounded-2xl border border-[#ded8cc] bg-white text-[#504a44] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#f6f3ee] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回修改风格</span>
          </button>

          <button
            type="button"
            onClick={onStartGeneration}
            className="flex-2 min-h-[46px] rounded-2xl bg-[#1c1a18] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#eed8be]" />
            <span>开始制作素材</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-[#7c756d] leading-relaxed">
          下一步先确认最多 5 个主要对象，此操作暂时不会产生生图费用。
        </p>
      </div>
    </div>
  );
};
