import React, { useState } from 'react';
import { PhotoItem } from '../../../models/PhotoItem.ts';
import { MaterialSheetSubject } from '../../../domain/types.ts';
import {
  Check,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Layers,
  AlertCircle,
  X,
  Plus,
} from 'lucide-react';

interface SubjectPlanConfirmationProps {
  subjects: MaterialSheetSubject[];
  candidatePhotos: PhotoItem[];
  maxSubjects?: number;
  onChange: (subjects: MaterialSheetSubject[]) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export const SubjectPlanConfirmation: React.FC<SubjectPlanConfirmationProps> = ({
  subjects,
  candidatePhotos,
  maxSubjects = 5,
  onChange,
  onBack,
  onConfirm,
}) => {
  const [swappingSubjectId, setSwappingSubjectId] = useState<string | null>(null);

  const enabledCount = subjects.filter((s) => s.enabled).length;

  const handleToggle = (id: string) => {
    const item = subjects.find((s) => s.id === id);
    if (!item) return;

    if (!item.enabled && enabledCount >= maxSubjects) {
      // Cannot exceed max enabled subjects
      return;
    }

    const updated = subjects.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    onChange(updated);
  };

  const handleReplaceWithPhoto = (subjectId: string, newPhoto: PhotoItem) => {
    const updated = subjects.map((s) => {
      if (s.id === subjectId) {
        return {
          ...s,
          sourcePhotoId: newPhoto.id,
          title: newPhoto.name || '替换主要对象',
          description: newPhoto.description || '用户自选手账素材参考',
          reason: '用户手动指定参考照片',
        };
      }
      return s;
    });
    onChange(updated);
    setSwappingSubjectId(null);
  };

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="p-4 rounded-3xl bg-white border border-[#eae5dc] shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#fbf5ee] text-[#946d45] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1c1a18]">
              AI 推荐的 {subjects.length} 个主要素材对象
            </h3>
            <p className="text-[11px] text-[#7c756d]">
              从 {candidatePhotos.length} 张候选照片中整理，最多启用 {maxSubjects} 个，至少选择 1 个
            </p>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#faf8f5] border border-[#eeeae2] flex items-center justify-between text-xs">
          <span className="text-[#6d675e]">当前已启用：</span>
          <div className="flex items-center gap-1.5 font-bold">
            <span className={enabledCount > 0 ? 'text-[#3b6e8c]' : 'text-[#b34033]'}>
              {enabledCount}
            </span>
            <span className="text-[#9c9489]">/ {maxSubjects} 个</span>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-2.5">
        {subjects.map((subject, index) => {
          const sourcePhoto = candidatePhotos.find((p) => p.id === subject.sourcePhotoId);
          const isSwapping = swappingSubjectId === subject.id;

          return (
            <div
              key={subject.id}
              className={`p-3.5 rounded-2xl border transition-all duration-200 bg-white ${
                subject.enabled
                  ? 'border-[#3b6e8c]/50 ring-1.5 ring-[#3b6e8c]/20 shadow-xs'
                  : 'border-[#eae5dc] opacity-60 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Photo Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#e4ded4] bg-[#f5f2eb] relative shadow-2xs">
                  {sourcePhoto?.url ? (
                    <img
                      src={sourcePhoto.url}
                      alt={subject.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#9c9489]">
                      无预览
                    </div>
                  )}
                  <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black/60 text-white text-[9px] flex items-center justify-center font-mono">
                    {index + 1}
                  </span>
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#1c1a18] truncate">
                      {subject.title}
                    </h4>
                    {/* Enable Checkbox button */}
                    <button
                      type="button"
                      onClick={() => handleToggle(subject.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        subject.enabled
                          ? 'bg-[#3b6e8c] text-white shadow-xs'
                          : 'border border-[#ded8cc] bg-[#faf8f5]'
                      }`}
                      title={subject.enabled ? '取消该对象' : '启用该对象'}
                    >
                      {subject.enabled && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#554e45] mt-1 line-clamp-1 leading-tight">
                    {subject.description || '精选手账素材元素'}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <span className="text-[10px] text-[#8e877e] truncate">
                      理由：{subject.reason}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSwappingSubjectId(isSwapping ? null : subject.id)}
                      className="text-[10px] font-medium text-[#3b6e8c] hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>{isSwapping ? '收起' : '替换照片'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Swap Picker Drawer */}
              {isSwapping && (
                <div className="mt-3 pt-2.5 border-t border-[#f0ece4] space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px] text-[#7c756d]">
                    <span>从候选照片池选择替换：</span>
                    <button
                      type="button"
                      onClick={() => setSwappingSubjectId(null)}
                      className="text-[#9c9489] hover:text-[#1c1a18]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {candidatePhotos.map((candidate) => {
                      const isCurrent = candidate.id === subject.sourcePhotoId;
                      return (
                        <div
                          key={candidate.id}
                          onClick={() => handleReplaceWithPhoto(subject.id, candidate)}
                          className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border cursor-pointer relative transition-all ${
                            isCurrent
                              ? 'ring-2 ring-[#3b6e8c] border-transparent'
                              : 'border-[#e4ded4] opacity-80 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <img
                            src={candidate.url}
                            alt={candidate.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 min-h-[46px] rounded-2xl border border-[#ded8cc] bg-white text-[#504a44] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#f6f3ee] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回方案页</span>
          </button>

          <button
            type="button"
            disabled={enabledCount === 0 || enabledCount > maxSubjects}
            onClick={onConfirm}
            className="flex-2 min-h-[46px] rounded-2xl bg-[#1c1a18] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-md disabled:opacity-40 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#eed8be]" />
            <span>确认 {enabledCount} 个对象并生成 1 张彩色素材页</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-[#7c756d] leading-relaxed">
          点击确认后，将按已选定的 {enabledCount} 个代表性对象组织生成，全流程仅 1 次生图调用。
        </p>
      </div>
    </div>
  );
};
