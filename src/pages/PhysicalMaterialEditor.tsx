import React, { useState, useRef } from 'react';
import { PhysicalMaterial, PhysicalMaterialType } from '../models/PhysicalMaterial.ts';
import { ArrowLeft, Upload, Check, Trash2, Camera, Sparkles } from 'lucide-react';
import { PHYSICAL_CATEGORIES } from '../services/physicalMaterialPresets.ts';

interface PhysicalMaterialEditorProps {
  material?: PhysicalMaterial | null;
  onSave: (item: PhysicalMaterial) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export const PhysicalMaterialEditor: React.FC<PhysicalMaterialEditorProps> = ({
  material,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [type, setType] = useState<PhysicalMaterialType>(material?.type || 'paper');
  const [subType, setSubType] = useState<string>(material?.subType || '');
  const [name, setName] = useState(material?.name || '');
  const [imageUrl, setImageUrl] = useState(material?.imageUrl || '');
  const [backImageUrl, setBackImageUrl] = useState(material?.backImageUrl || '');
  const [widthMm, setWidthMm] = useState<string>(material?.widthMm ? String(material.widthMm) : '');
  const [heightMm, setHeightMm] = useState<string>(material?.heightMm ? String(material.heightMm) : '');
  const [remainingText, setRemainingText] = useState(material?.remainingText || '');
  const [allowTrim, setAllowTrim] = useState<boolean>(material?.allowTrim ?? true);
  const [notes, setNotes] = useState(material?.notes || '');

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const currentCategory = PHYSICAL_CATEGORIES.find((c) => c.type === type) || PHYSICAL_CATEGORIES[0];

  const handleSubtypeSelect = (sub: string) => {
    setSubType(sub);
    if (!name.trim()) {
      setName(sub);
    }
  };

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setBackImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('请填写材料名称');
      return;
    }
    if (!imageUrl) {
      alert('请上传材料照片或素材图');
      return;
    }

    const item: PhysicalMaterial = {
      id: material?.id || `pm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      subType: subType.trim() || undefined,
      name: name.trim(),
      imageUrl,
      backImageUrl: type === 'ticket' ? backImageUrl : undefined,
      widthMm: widthMm ? parseFloat(widthMm) : undefined,
      heightMm: type !== 'tape' && heightMm ? parseFloat(heightMm) : undefined,
      remainingText: remainingText.trim() || undefined,
      allowTrim: type === 'ticket' || type === 'tape' || type === 'paper' ? allowTrim : undefined,
      notes: notes.trim() || undefined,
      createdAt: material?.createdAt || Date.now(),
    };

    onSave(item);
  };

  return (
    <div className="min-h-full pb-20 bg-[#F2F0F6]">
      {/* Top Header with 20px padding */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#2a2336]/[0.06] px-5 h-15 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onCancel}
          className="w-11 h-11 -ml-2 rounded-full bg-white border border-[#2a2336]/[0.06] flex items-center justify-center text-[#17171B] hover:bg-[#FBFAFD] active:scale-95 shadow-xs cursor-pointer"
          aria-label="返回"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-[16px] font-bold text-[#17171B] tracking-tight">
          {material ? '编辑材料档案' : '录入实体材料'}
        </h1>
        <div className="w-11" />
      </div>

      <form onSubmit={handleFormSubmit} className="px-5 py-4 space-y-4">
        {/* Type Selector (5 Major Categories) */}
        <div>
          <label className="text-xs font-semibold text-[#17171B] block mb-1.5">材料大类</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PHYSICAL_CATEGORIES.map((c) => (
              <button
                key={c.type}
                type="button"
                onClick={() => {
                  setType(c.type);
                  setSubType('');
                }}
                className={`p-3 rounded-[20px] border text-left transition-all active:scale-95 cursor-pointer ${
                  type === c.type
                    ? 'border-[#9684DF] bg-[#E7E1FA] text-[#55429E] font-semibold shadow-xs'
                    : 'border-[#2a2336]/[0.07] bg-white text-[#747078] hover:border-[#2a2336]/[0.15]'
                }`}
              >
                <p className="text-xs font-bold">{c.label}</p>
                <p className="text-[10px] text-[#A19CA6] mt-0.5">{c.en}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Subtype quick select chips */}
        <div className="p-3 bg-white rounded-2xl border border-[#eeeae2] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#2c2825]">
              细分类别 · {currentCategory.label}
            </span>
            <span className="text-[10px] text-[#9e978e]">点击快捷填入名称</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentCategory.subtypes.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => handleSubtypeSelect(sub)}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all active:scale-95 ${
                  subType === sub
                    ? 'bg-[#3b6e8c] text-white border-[#3b6e8c] font-medium shadow-xs'
                    : 'bg-[#faf8f4] text-[#5c5449] border-[#e2dcd0] hover:border-[#3b6e8c]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-[#2c2825] block mb-1">材料名称 *</label>
          <input
            type="text"
            required
            placeholder="例如：半透明磨砂硫酸纸 / 经典热敏电影票"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-3 text-xs rounded-xl bg-white border border-[#e0dad0] text-[#2c2825] outline-none focus:border-[#3b6e8c]"
          />
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="text-xs font-semibold text-[#2c2825] block mb-1">
            正面照片 / 扫描图 *
          </label>
          <div
            onClick={() => frontInputRef.current?.click()}
            className="aspect-[16/9] rounded-2xl bg-white border-2 border-dashed border-[#ded8cc] flex flex-col items-center justify-center p-3 cursor-pointer hover:border-[#3b6e8c] transition-colors overflow-hidden"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Front preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center text-[#7c756d]">
                <Camera className="w-6 h-6 mx-auto mb-1 text-[#b4aa9b]" />
                <p className="text-xs font-medium">点击拍摄或选取材料正面照</p>
                <p className="text-[10px] text-[#9e978e] mt-0.5">支持实物平铺拍摄</p>
              </div>
            )}
          </div>
          <input
            ref={frontInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFrontUpload}
          />
        </div>

        {/* Optional Back Side Image for Ticket / Paper */}
        {type === 'ticket' && (
          <div>
            <label className="text-xs font-semibold text-[#2c2825] block mb-1">
              背面照片 (选填，常用于印章或背面说明)
            </label>
            <div
              onClick={() => backInputRef.current?.click()}
              className="aspect-[16/9] rounded-2xl bg-white border-2 border-dashed border-[#ded8cc] flex flex-col items-center justify-center p-3 cursor-pointer hover:border-[#3b6e8c] transition-colors overflow-hidden"
            >
              {backImageUrl ? (
                <img
                  src={backImageUrl}
                  alt="Back preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-[#7c756d]">
                  <Upload className="w-5 h-5 mx-auto mb-1 text-[#b4aa9b]" />
                  <p className="text-xs font-medium">补充票根背面或印章面</p>
                </div>
              )}
            </div>
            <input
              ref={backInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBackUpload}
            />
          </div>
        )}

        {/* Dynamic Dimensions: mm */}
        <div className="p-3.5 bg-white rounded-2xl border border-[#eeeae2] space-y-3">
          <p className="text-xs font-semibold text-[#2c2825]">实物规格 (手账实际尺寸，单位 mm)</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#7c756d] block mb-1">
                宽度 (mm) {type === 'tape' && '*'}
              </label>
              <input
                type="number"
                step="0.5"
                placeholder={type === 'tape' ? '例：15' : '例：50'}
                value={widthMm}
                onChange={(e) => setWidthMm(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#fbf9f5] border border-[#e0dad0] text-[#2c2825] outline-none focus:border-[#3b6e8c]"
              />
            </div>

            {type !== 'tape' ? (
              <div>
                <label className="text-[11px] text-[#7c756d] block mb-1">高度 (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="例：70"
                  value={heightMm}
                  onChange={(e) => setHeightMm(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl bg-[#fbf9f5] border border-[#e0dad0] text-[#2c2825] outline-none focus:border-[#3b6e8c]"
                />
              </div>
            ) : (
              <div>
                <label className="text-[11px] text-[#7c756d] block mb-1">胶带规格说明</label>
                <div className="h-10 px-3 text-xs rounded-xl bg-[#fbf9f5] border border-dashed border-[#e0dad0] text-[#9e978e] flex items-center">
                  连续卷装，无需单张高度
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] text-[#7c756d] block mb-1">
              数量或剩余情况 (由用户自主记录)
            </label>
            <input
              type="text"
              placeholder={type === 'tape' ? '例：整卷 / 约剩 5m' : '例：3 张 / 仅余 1 枚'}
              value={remainingText}
              onChange={(e) => setRemainingText(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl bg-[#fbf9f5] border border-[#e0dad0] text-[#2c2825] outline-none focus:border-[#3b6e8c]"
            />
          </div>

          {/* Trimming allowed toggle */}
          {(type === 'ticket' || type === 'tape') && (
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs text-[#2c2825] font-medium">是否允许剪裁使用</p>
                <p className="text-[10px] text-[#9e978e]">若为珍贵纪念原票，可标记不可剪裁</p>
              </div>
              <input
                type="checkbox"
                checked={allowTrim}
                onChange={(e) => setAllowTrim(e.target.checked)}
                className="w-4 h-4 accent-[#3b6e8c]"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-[#2c2825] block mb-1">材料备注</label>
          <textarea
            rows={2}
            placeholder="质感、购买地或拼贴搭配建议..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3.5 text-xs rounded-[18px] bg-white border border-[#2a2336]/[0.08] text-[#17171B] outline-none focus:border-[#9684DF]"
          />
        </div>

        {/* Buttons */}
        <div className="pt-2 flex gap-2.5">
          {material && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(material.id)}
              className="w-12 h-12 rounded-full bg-[#FDF5F5] text-[#C86666] flex items-center justify-center shrink-0 border border-[#C86666]/20 active:scale-95 transition-all cursor-pointer"
              title="删除此材料"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="flex-1 min-h-[48px] rounded-full bg-[#E8925A] hover:bg-[#d97d43] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 text-white" />
            <span>保存材料档案</span>
          </button>
        </div>
      </form>
    </div>
  );
};
