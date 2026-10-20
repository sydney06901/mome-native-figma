import React, { useState } from 'react';
import { Project } from '../domain/types.ts';
import { PhotoItem } from '../models/PhotoItem.ts';
import { Material, CropBounds } from '../models/Material.ts';
import { CropEditor } from '../components/CropEditor.tsx';
import { PageHeader } from '../shared/components/PageHeader.tsx';
import { FloatingActionPill } from '../shared/components/FloatingActionPill.tsx';
import {
  ArrowLeft,
  Check,
  Scissors,
  Plus,
  Sparkles,
  ArrowRight,
  Info,
  X,
} from 'lucide-react';

interface CandidateReviewProps {
  project: Project;
  candidatePhotos: PhotoItem[];
  allPhotos: PhotoItem[];
  onBack: () => void;
  onConfirmMaterials: (confirmedPhotoIds: string[]) => void;
  onSaveCropMaterial: (material: Material) => void;
  onGoToMaterialDetail: (material: Material) => void;
}

export const CandidateReview: React.FC<CandidateReviewProps> = ({
  project,
  candidatePhotos,
  allPhotos,
  onBack,
  onConfirmMaterials,
  onSaveCropMaterial,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    candidatePhotos.map((p) => p.id)
  );

  const [croppingPhoto, setCroppingPhoto] = useState<PhotoItem | null>(null);
  const [showAddMoreModal, setShowAddMoreModal] = useState(false);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCropSave = (croppedDataUrl: string, bounds: CropBounds, materialName: string) => {
    if (!croppingPhoto) return;

    const newMaterial: Material = {
      id: `mat-crop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId: project.id,
      projectName: project.name,
      sourcePhotoId: croppingPhoto.id,
      sourcePhotoUrl: croppingPhoto.url,
      name: materialName,
      type: 'crop',
      previewUrl: croppedDataUrl,
      fullUrl: croppedDataUrl,
      style: 'line_art',
      cropBounds: bounds,
      isDemo: project.isDemo,
      capturedAt: croppingPhoto.capturedAt || new Date().toISOString().slice(0, 10),
      createdAt: Date.now(),
    };

    onSaveCropMaterial(newMaterial);
    setCroppingPhoto(null);
  };

  return (
    <div className="space-y-5 pb-32 pt-2">
      {/* Top Header */}
      <PageHeader
        onBack={onBack}
        badge="Review Candidates"
        title="Review candidates"
        subtitle={`AI 已根据条件初筛出 ${candidatePhotos.length} 张照片。可点击裁剪原图，或确认进入下一步。`}
        rightAction={
          <button
            type="button"
            onClick={() => setShowAddMoreModal(true)}
            className="min-h-[44px] px-3.5 rounded-full bg-white border border-[#2a2336]/[0.08] text-xs font-medium text-[#17171B] flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#E8925A]" />
            <span>补选照片</span>
          </button>
        }
      />

      {/* Candidate Photo List */}
      <div className="space-y-3.5">
        {candidatePhotos.length === 0 ? (
          <div className="py-12 text-center text-[#747078] bg-white rounded-[26px] border border-dashed border-[#2a2336]/[0.1] p-6 space-y-3">
            <Info className="w-7 h-7 mx-auto text-[#A19CA6]" />
            <p className="text-sm font-medium text-[#17171B]">暂无候选照片</p>
            <p className="text-xs text-[#747078]">可以从相册中补选想要制作手账素材的照片</p>
            <button
              type="button"
              onClick={() => setShowAddMoreModal(true)}
              className="min-h-[44px] px-4 text-xs bg-[#E8925A] text-white font-medium rounded-full active:scale-95 transition-transform"
            >
              从相册补选
            </button>
          </div>
        ) : (
          candidatePhotos.map((photo) => {
            const isSelected = selectedIds.includes(photo.id);

            return (
              <div
                key={photo.id}
                className={`bg-white rounded-[24px] border overflow-hidden transition-all shadow-[0_8px_24px_rgba(42,35,54,0.04)] ${
                  isSelected
                    ? 'border-[#72C9A3] ring-2 ring-[#72C9A3]/30'
                    : 'border-[#2a2336]/[0.06] opacity-75'
                }`}
              >
                {/* Photo Preview with Aspect Ratio */}
                <div className="relative aspect-[16/10] bg-[#F2F0F6] overflow-hidden group">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />

                  {/* Top-right Toggle Button (44px min target) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(photo.id);
                    }}
                    className="absolute top-1 right-1 w-11 h-11 flex items-center justify-center cursor-pointer z-10"
                    aria-label={isSelected ? '取消选入' : '选入候选'}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-transform ${
                        isSelected
                          ? 'bg-[#72C9A3] text-white scale-105'
                          : 'bg-white/85 text-[#747078] hover:bg-white border border-[#2a2336]/[0.1]'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-4 h-4 stroke-[2.8]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#A19CA6]" />
                      )}
                    </div>
                  </div>

                  {/* Crop Action Trigger on Image */}
                  <button
                    type="button"
                    onClick={() => setCroppingPhoto(photo)}
                    className="min-h-[44px] absolute bottom-2 right-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[12px] font-medium flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5 text-[#DDF3E9]" />
                    <span>原图裁剪</span>
                  </button>

                  {/* Match pill */}
                  {photo.isBuilding && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#DDF3E9]/95 text-[#2B7354] text-[10px] font-semibold border border-[#72C9A3]/30">
                      建筑匹配
                    </div>
                  )}
                </div>

                {/* Candidate Description */}
                <div className="p-3.5 flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="font-display text-[15px] font-bold text-[#17171B] truncate">
                      {photo.name}
                    </h3>
                    <p className="text-[12px] text-[#747078] leading-normal line-clamp-2">
                      {photo.description || '画面中包含特色建筑立面与结构特征，适合制作线稿贴纸。'}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono text-[#747078] bg-[#F2F0F6] px-2.5 py-1 rounded-full border border-[#2a2336]/[0.05]">
                    {photo.capturedAt || '2026.10.10'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add More Photos Modal */}
      {showAddMoreModal && (
        <div
          onClick={() => setShowAddMoreModal(false)}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[28px] w-full max-w-sm max-h-[80vh] flex flex-col p-5 shadow-2xl border border-[#2a2336]/[0.08]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2336]/[0.06]">
              <div>
                <h3 className="font-display text-[17px] font-bold text-[#17171B]">补选相册照片</h3>
                <p className="text-[11px] text-[#747078]">点击可添加到当前候选列表中</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMoreModal(false)}
                className="w-9 h-9 rounded-full bg-[#F2F0F6] flex items-center justify-center text-[#747078] hover:text-[#17171B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 grid grid-cols-3 gap-2 no-scrollbar">
              {allPhotos.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggle(p.id)}
                    className={`relative aspect-square rounded-[16px] overflow-hidden border cursor-pointer select-none ${
                      isSelected
                        ? 'border-[#72C9A3] ring-2 ring-[#72C9A3]'
                        : 'border-[#2a2336]/[0.08]'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-6 h-6 bg-[#72C9A3] text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowAddMoreModal(false)}
              className="w-full min-h-[46px] bg-[#17171B] text-white text-xs font-semibold rounded-full active:scale-98 transition-transform mt-2"
            >
              完成补选
            </button>
          </div>
        </div>
      )}

      {/* Rectangular Crop Editor Modal */}
      {croppingPhoto && (
        <CropEditor
          photo={croppingPhoto}
          onSaveCrop={handleCropSave}
          onCancel={() => setCroppingPhoto(null)}
        />
      )}

      {/* Sticky Bottom Confirmation Bar (Peach capsule action button) */}
      <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 px-4 sm:px-6 z-30 max-w-md mx-auto">
        <FloatingActionPill
          variant="peach"
          onClick={() => onConfirmMaterials(selectedIds)}
          disabled={selectedIds.length === 0}
          icon={<Sparkles className="w-4 h-4 text-[#FBF1C9]" />}
        >
          <span>确认选入 ({selectedIds.length})，下一步制贴纸</span>
        </FloatingActionPill>
      </div>
    </div>
  );
};
