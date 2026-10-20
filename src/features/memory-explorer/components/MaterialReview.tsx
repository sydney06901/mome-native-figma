import React, { useState } from 'react';
import { GeneratedMaterial } from '../../../services/materialGeneration/types.ts';
import { PhotoItem } from '../../../models/PhotoItem.ts';
import {
  Check,
  Trash2,
  Edit2,
  CheckCheck,
  RefreshCw,
  Eye,
  Grid,
  Filter,
  Layers,
} from 'lucide-react';

interface MaterialReviewProps {
  photos: PhotoItem[];
  materials: GeneratedMaterial[];
  selectedMaterialIds: string[];
  onToggleMaterialSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteMaterial: (id: string) => void;
  onRenameMaterial: (id: string, newName: string) => void;
  onPutIntoJournal: () => void;
  onBackToSettings: () => void;
}

export const MaterialReview: React.FC<MaterialReviewProps> = ({
  photos,
  materials,
  selectedMaterialIds,
  onToggleMaterialSelect,
  onSelectAll,
  onDeselectAll,
  onDeleteMaterial,
  onRenameMaterial,
  onPutIntoJournal,
  onBackToSettings,
}) => {
  const [viewMode, setViewMode] = useState<'byPhoto' | 'byType'>('byPhoto');
  const [showTransparencyGrid, setShowTransparencyGrid] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');

  const typeLabels: Record<string, string> = {
    photo_card: '照片卡片',
    torn_photo: '手工撕纸',
    line_art: '线稿素材',
    date_label: '日期便签',
    background_texture: '手账底纹',
    decorative_shape: '装饰色块',
    subject_sticker: '主体贴纸',
    keyword_label: '胶带便签',
  };

  const handleStartRename = (item: GeneratedMaterial) => {
    setEditingId(item.id);
    setEditNameText(item.name);
  };

  const handleSaveRename = (id: string) => {
    if (editNameText.trim()) {
      onRenameMaterial(id, editNameText.trim());
    }
    setEditingId(null);
  };

  // Group materials by photo
  const photosWithMaterials = photos
    .filter((p) => materials.some((m) => m.sourcePhotoId === p.id))
    .map((p) => ({
      photo: p,
      materials: materials.filter((m) => m.sourcePhotoId === p.id),
    }));

  const globalMaterials = materials.filter((m) => m.sourcePhotoId === 'global');

  // Group materials by type
  const materialTypes = Array.from(new Set(materials.map((m) => m.type)));

  return (
    <div className="space-y-4 pb-20">
      {/* Top Controller: View Mode Switch & Background Toggle */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-white border border-[#eae5dc] shadow-2xs">
        <div className="flex items-center gap-1 bg-[#f4f0e8] p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('byPhoto')}
            className={`min-h-[30px] px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'byPhoto'
                ? 'bg-white text-[#1c1a18] shadow-xs'
                : 'text-[#7c756d] hover:text-[#1c1a18]'
            }`}
          >
            <span>按照片查看</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('byType')}
            className={`min-h-[30px] px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'byType'
                ? 'bg-white text-[#1c1a18] shadow-xs'
                : 'text-[#7c756d] hover:text-[#1c1a18]'
            }`}
          >
            <span>按类型查看</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowTransparencyGrid((prev) => !prev)}
            className={`min-h-[30px] px-2 rounded-xl text-[11px] font-medium border flex items-center gap-1 transition-all ${
              showTransparencyGrid
                ? 'bg-[#3b6e8c] text-white border-[#3b6e8c]'
                : 'bg-[#faf8f5] text-[#554e44] border-[#ded8cc]'
            }`}
            title="切换透明棋盘格预览背景"
          >
            <Grid className="w-3 h-3" />
            <span>网格背景</span>
          </button>

          <button
            type="button"
            onClick={
              selectedMaterialIds.length === materials.length ? onDeselectAll : onSelectAll
            }
            className="text-[11px] text-[#3b6e8c] font-semibold px-2 py-1 hover:underline"
          >
            {selectedMaterialIds.length === materials.length ? '取消全选' : '全选'}
          </button>
        </div>
      </div>

      {/* Materials List: By Photo Mode */}
      {viewMode === 'byPhoto' && (
        <div className="space-y-4">
          {photosWithMaterials.map(({ photo, materials: photoMats }) => (
            <div
              key={photo.id}
              className="p-3.5 rounded-3xl bg-white border border-[#eae5dc] shadow-xs space-y-3"
            >
              {/* Photo Source Header */}
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#f0ece4]">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#e4ded4] bg-[#faf8f5]">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#1c1a18] truncate">{photo.name}</h4>
                  <p className="text-[10px] text-[#8e877e]">生成 {photoMats.length} 个专属素材</p>
                </div>
              </div>

              {/* Material Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {photoMats.map((mat) => (
                  <MaterialCardItem
                    key={mat.id}
                    material={mat}
                    isSelected={selectedMaterialIds.includes(mat.id)}
                    showTransparencyGrid={showTransparencyGrid}
                    typeLabel={typeLabels[mat.type] || '手账素材'}
                    isEditing={editingId === mat.id}
                    editNameText={editNameText}
                    onChangeEditNameText={setEditNameText}
                    onStartRename={() => handleStartRename(mat)}
                    onSaveRename={() => handleSaveRename(mat.id)}
                    onCancelRename={() => setEditingId(null)}
                    onToggleSelect={() => onToggleMaterialSelect(mat.id)}
                    onDelete={() => onDeleteMaterial(mat.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Shared Global Textures & Shapes */}
          {globalMaterials.length > 0 && (
            <div className="p-3.5 rounded-3xl bg-white border border-[#eae5dc] shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#f0ece4]">
                <Layers className="w-4 h-4 text-[#946d45]" />
                <h4 className="text-xs font-bold text-[#1c1a18]">专属手账底纸与氛围色块</h4>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {globalMaterials.map((mat) => (
                  <MaterialCardItem
                    key={mat.id}
                    material={mat}
                    isSelected={selectedMaterialIds.includes(mat.id)}
                    showTransparencyGrid={showTransparencyGrid}
                    typeLabel={typeLabels[mat.type] || '手账素材'}
                    isEditing={editingId === mat.id}
                    editNameText={editNameText}
                    onChangeEditNameText={setEditNameText}
                    onStartRename={() => handleStartRename(mat)}
                    onSaveRename={() => handleSaveRename(mat.id)}
                    onCancelRename={() => setEditingId(null)}
                    onToggleSelect={() => onToggleMaterialSelect(mat.id)}
                    onDelete={() => onDeleteMaterial(mat.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Materials List: By Type Mode */}
      {viewMode === 'byType' && (
        <div className="space-y-4">
          {materialTypes.map((type) => {
            const mats = materials.filter((m) => m.type === type);
            return (
              <div
                key={type}
                className="p-3.5 rounded-3xl bg-white border border-[#eae5dc] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#f0ece4]">
                  <h4 className="text-xs font-bold text-[#1c1a18]">
                    {typeLabels[type] || type} ({mats.length})
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {mats.map((mat) => (
                    <MaterialCardItem
                      key={mat.id}
                      material={mat}
                      isSelected={selectedMaterialIds.includes(mat.id)}
                      showTransparencyGrid={showTransparencyGrid}
                      typeLabel={typeLabels[mat.type] || '手账素材'}
                      isEditing={editingId === mat.id}
                      editNameText={editNameText}
                      onChangeEditNameText={setEditNameText}
                      onStartRename={() => handleStartRename(mat)}
                      onSaveRename={() => handleSaveRename(mat.id)}
                      onCancelRename={() => setEditingId(null)}
                      onToggleSelect={() => onToggleMaterialSelect(mat.id)}
                      onDelete={() => onDeleteMaterial(mat.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-2.5 pb-5 bg-gradient-to-t from-[#fbf9f5] via-[#fbf9f5]/90 to-transparent z-30 flex gap-2.5 max-w-[393px] mx-auto">
        <button
          type="button"
          onClick={onBackToSettings}
          className="flex-1 min-h-[44px] rounded-xl bg-white border border-[#ded8cc] text-[#554e44] text-xs font-semibold flex items-center justify-center hover:bg-[#f6f3ee] active:scale-[0.98] transition-all shadow-xs"
        >
          <span>重新调整风格</span>
        </button>

        <button
          type="button"
          disabled={selectedMaterialIds.length === 0}
          onClick={onPutIntoJournal}
          className="flex-2 min-h-[44px] rounded-xl bg-[#1c1a18] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-md disabled:opacity-40"
        >
          <CheckCheck className="w-4 h-4 text-[#eed8be]" />
          <span>将已选素材放入手账 ({selectedMaterialIds.length})</span>
        </button>
      </div>
    </div>
  );
};

interface MaterialCardItemProps {
  material: GeneratedMaterial;
  isSelected: boolean;
  showTransparencyGrid: boolean;
  typeLabel: string;
  isEditing: boolean;
  editNameText: string;
  onChangeEditNameText: (val: string) => void;
  onStartRename: () => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onToggleSelect: () => void;
  onDelete: () => void;
}

const MaterialCardItem: React.FC<MaterialCardItemProps> = ({
  material,
  isSelected,
  showTransparencyGrid,
  typeLabel,
  isEditing,
  editNameText,
  onChangeEditNameText,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onToggleSelect,
  onDelete,
}) => {
  return (
    <div
      className={`rounded-2xl border p-2 flex flex-col justify-between transition-all duration-200 relative group bg-white ${
        isSelected
          ? 'border-[#3b6e8c] ring-1.5 ring-[#3b6e8c]/30 shadow-xs'
          : 'border-[#eae5dc] opacity-75'
      }`}
    >
      {/* Thumbnail Frame */}
      <div
        onClick={onToggleSelect}
        className={`w-full aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center p-1.5 relative cursor-pointer ${
          showTransparencyGrid
            ? 'bg-[repeating-conic-gradient(#eee_0%_25%,_transparent_0%_50%)] bg-[length:12px_12px]'
            : 'bg-[#faf8f5]'
        }`}
      >
        <img
          src={material.previewUrl}
          alt={material.name}
          className="max-w-full max-h-full object-contain filter drop-shadow-xs"
        />

        {/* Top-Right Selection Checkbox */}
        <div className="absolute top-1.5 right-1.5 z-10">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              isSelected ? 'bg-[#3b6e8c] text-white shadow-xs' : 'border border-[#ded8cc] bg-white/80'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
          </div>
        </div>

        {/* Top-Left Type Tag */}
        <span className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.2 rounded-md bg-black/60 text-white font-medium backdrop-blur-xs">
          {typeLabel}
        </span>
      </div>

      {/* Bottom Name & Action Bar */}
      <div className="pt-1.5 flex items-center justify-between gap-1">
        {isEditing ? (
          <div className="flex-1 flex items-center gap-1">
            <input
              type="text"
              value={editNameText}
              onChange={(e) => onChangeEditNameText(e.target.value)}
              className="w-full text-[10px] px-1.5 py-0.5 rounded border border-[#3b6e8c] focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={onSaveRename}
              className="text-[10px] text-[#3b6e8c] font-bold shrink-0"
            >
              存
            </button>
          </div>
        ) : (
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-[11px] font-medium text-[#2c2825] truncate leading-tight">
              {material.name}
            </p>
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onStartRename}
              className="w-5 h-5 rounded-md flex items-center justify-center text-[#8e877e] hover:text-[#2c2825] hover:bg-[#f4f0e8]"
              title="重命名"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="w-5 h-5 rounded-md flex items-center justify-center text-[#8e877e] hover:text-[#b34033] hover:bg-[#faeeec]"
              title="删除此素材"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
