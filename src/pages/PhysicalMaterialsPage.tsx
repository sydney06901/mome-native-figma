import React, { useState } from 'react';
import { PhysicalMaterial, PhysicalMaterialType } from '../models/PhysicalMaterial.ts';
import { PHYSICAL_CATEGORIES } from '../services/physicalMaterialPresets.ts';
import {
  Bookmark,
  Plus,
  Trash2,
  Edit2,
  Layers,
  ArrowRight,
  Package,
} from 'lucide-react';

interface PhysicalMaterialsPageProps {
  physicalMaterials: PhysicalMaterial[];
  onAddNewPhysicalMaterial: () => void;
  onEditPhysicalMaterial: (item: PhysicalMaterial) => void;
  onDeletePhysicalMaterial: (id: string) => void;
  onOpenCanvas: () => void;
  onAddPhysicalMaterialToCanvas?: (item: PhysicalMaterial) => void;
}

export const PhysicalMaterialsPage: React.FC<PhysicalMaterialsPageProps> = ({
  physicalMaterials,
  onAddNewPhysicalMaterial,
  onEditPhysicalMaterial,
  onDeletePhysicalMaterial,
  onOpenCanvas,
  onAddPhysicalMaterialToCanvas,
}) => {
  // Category filter under 已录入材料: tape, sticker, ticket, paper, embellishment
  const [physicalFilter, setPhysicalFilter] = useState<'all' | PhysicalMaterialType>('all');
  const [physicalSubFilter, setPhysicalSubFilter] = useState<string>('all');

  // Filtered physical materials
  const filteredPhysicalMaterials = physicalMaterials.filter((item) => {
    if (physicalFilter !== 'all' && item.type !== physicalFilter) return false;
    if (physicalSubFilter !== 'all') {
      const matchSub = item.subType === physicalSubFilter || item.name.includes(physicalSubFilter);
      if (!matchSub) return false;
    }
    return true;
  });

  const tapeCount = physicalMaterials.filter((m) => m.type === 'tape').length;
  const stickerCount = physicalMaterials.filter((m) => m.type === 'sticker').length;
  const ticketCount = physicalMaterials.filter((m) => m.type === 'ticket').length;
  const paperCount = physicalMaterials.filter((m) => m.type === 'paper').length;
  const embellishmentCount = physicalMaterials.filter((m) => m.type === 'embellishment').length;

  const activeCategoryMeta = PHYSICAL_CATEGORIES.find((c) => c.type === physicalFilter);

  return (
    <div className="min-h-full pb-24 bg-[#fbf9f5]">
      {/* Top Header with 20px padding */}
      <div className="sticky top-0 z-30 bg-[#fdfcf9]/95 backdrop-blur-md border-b border-[#eeeae2] px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[#946d45]" />
          <h1 className="text-sm font-bold text-[#1c1a18] tracking-tight">我的材料</h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#f0ece4] text-[#7c756d]">
            {physicalMaterials.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddNewPhysicalMaterial}
            className="min-h-[44px] px-3.5 rounded-xl bg-[#3b6e8c] text-white text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-transform shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>录入材料</span>
          </button>
        </div>
      </div>

      {/* Content Viewport with 20px horizontal padding */}
      <div className="px-5 py-4 space-y-4">
        {/* Prominent Eye-catching "录入实体材料" Card */}
        <div
          onClick={onAddNewPhysicalMaterial}
          className="group relative overflow-hidden bg-gradient-to-br from-[#fefdfb] via-white to-[#f7f3eb] rounded-3xl border-2 border-[#ded4c3] hover:border-[#3b6e8c] p-5 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#946d45]" />
                <span className="text-[11px] font-mono tracking-wider text-[#946d45] uppercase font-semibold">
                  实物材料管理
                </span>
              </div>
              <h3 className="text-base font-bold text-[#2c2825] group-hover:text-[#3b6e8c] transition-colors">
                录入实体材料
              </h3>
              <p className="text-xs text-[#7c756d] leading-relaxed">
                拍摄并收纳纸张、票根、胶带、贴纸与立体配件档案，设置真实 mm 尺寸随时用于拼贴。
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-[#3b6e8c] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#eee6d8] flex items-center justify-between text-[11px]">
            <span className="text-[#9e978e]">点击立即新增材料档案</span>
            <div className="flex items-center gap-1 font-semibold text-[#3b6e8c]">
              <span>立即录入</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* List of Physical Materials Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-[#7c756d]">
            <h3 className="font-bold text-[#2c2825] text-xs">
              已录入材料 ({physicalMaterials.length})
            </h3>
            <span className="text-[11px] text-[#9e978e]">点击卡片可查看或编辑规格</span>
          </div>

          {/* 5 Major Categories (Paper, Tickets, Tape, Stickers, 3D) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => {
                setPhysicalFilter('all');
                setPhysicalSubFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap active:scale-95 ${
                physicalFilter === 'all'
                  ? 'bg-[#2c2825] text-white border-[#2c2825] shadow-xs'
                  : 'bg-white text-[#7c756d] border-[#ded8cc] hover:text-[#2c2825]'
              }`}
            >
              全部 ({physicalMaterials.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setPhysicalFilter('paper');
                setPhysicalSubFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap active:scale-95 ${
                physicalFilter === 'paper'
                  ? 'bg-[#2c2825] text-white border-[#2c2825] shadow-xs'
                  : 'bg-white text-[#7c756d] border-[#ded8cc] hover:text-[#2c2825]'
              }`}
            >
              纸张类 Paper {paperCount > 0 ? `(${paperCount})` : ''}
            </button>

            <button
              type="button"
              onClick={() => {
                setPhysicalFilter('ticket');
                setPhysicalSubFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap active:scale-95 ${
                physicalFilter === 'ticket'
                  ? 'bg-[#2c2825] text-white border-[#2c2825] shadow-xs'
                  : 'bg-white text-[#7c756d] border-[#ded8cc] hover:text-[#2c2825]'
              }`}
            >
              展馆票根 Tickets {ticketCount > 0 ? `(${ticketCount})` : ''}
            </button>

            <button
              type="button"
              onClick={() => {
                setPhysicalFilter('tape');
                setPhysicalSubFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap active:scale-95 ${
                physicalFilter === 'tape'
                  ? 'bg-[#2c2825] text-white border-[#2c2825] shadow-xs'
                  : 'bg-white text-[#7c756d] border-[#ded8cc] hover:text-[#2c2825]'
              }`}
            >
              和纸胶带 Tape {tapeCount > 0 ? `(${tapeCount})` : ''}
            </button>

            <button
              type="button"
              onClick={() => {
                setPhysicalFilter('sticker');
                setPhysicalSubFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap active:scale-95 ${
                physicalFilter === 'sticker'
                  ? 'bg-[#2c2825] text-white border-[#2c2825] shadow-xs'
                  : 'bg-white text-[#7c756d] border-[#ded8cc] hover:text-[#2c2825]'
              }`}
            >
              贴纸类 Stickers {stickerCount > 0 ? `(${stickerCount})` : ''}
            </button>

            <button
              type="button"
              onClick={() => {
                setPhysicalFilter('embellishment');
                setPhysicalSubFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap active:scale-95 ${
                physicalFilter === 'embellishment'
                  ? 'bg-[#2c2825] text-white border-[#2c2825] shadow-xs'
                  : 'bg-white text-[#7c756d] border-[#ded8cc] hover:text-[#2c2825]'
              }`}
            >
              立体装饰 3D {embellishmentCount > 0 ? `(${embellishmentCount})` : ''}
            </button>
          </div>

          {/* Subtype Quick Filter Chips (when a specific category is active) */}
          {activeCategoryMeta && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 bg-[#f4efe6]/60 p-1.5 rounded-xl border border-[#ece4d6]">
              <span className="text-[10px] text-[#8c7866] font-semibold whitespace-nowrap pl-1">
                细分:
              </span>
              <button
                type="button"
                onClick={() => setPhysicalSubFilter('all')}
                className={`px-2 py-0.5 text-[10px] rounded-lg whitespace-nowrap transition-all ${
                  physicalSubFilter === 'all'
                    ? 'bg-[#3b6e8c] text-white font-semibold'
                    : 'bg-white text-[#7c756d] border border-[#ded8cc]'
                }`}
              >
                全部
              </button>
              {activeCategoryMeta.subtypes.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setPhysicalSubFilter(sub)}
                  className={`px-2 py-0.5 text-[10px] rounded-lg whitespace-nowrap transition-all ${
                    physicalSubFilter === sub
                      ? 'bg-[#3b6e8c] text-white font-semibold'
                      : 'bg-white text-[#7c756d] border border-[#ded8cc] hover:text-[#2c2825]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Material Cards List */}
          {filteredPhysicalMaterials.length === 0 ? (
            <div className="py-10 text-center text-[#7c756d] bg-white rounded-2xl border border-dashed border-[#e2dcd0] p-6 space-y-2">
              <Package className="w-8 h-8 mx-auto text-[#b4aa9b] stroke-[1.5]" />
              <p className="text-xs font-medium text-[#2c2825]">
                {physicalFilter === 'all'
                  ? '尚未录入实体材料'
                  : `暂无${activeCategoryMeta ? activeCategoryMeta.label : ''}材料`}
              </p>
              <p className="text-[11px] text-[#9e978e]">
                点击上方「录入实体材料」即可建立材料档案
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {filteredPhysicalMaterials.map((pm) => (
                <div
                  key={pm.id}
                  className="bg-white rounded-2xl border border-[#e8e4dc] p-3 flex items-center justify-between gap-3 shadow-xs hover:border-[#cfc9bf] transition-colors"
                >
                  <div
                    onClick={() => onEditPhysicalMaterial(pm)}
                    className="w-16 h-16 rounded-xl bg-[#faf7f2] border border-[#f0ece4] overflow-hidden flex items-center justify-center p-1 shrink-0 cursor-pointer"
                  >
                    <img
                      src={pm.imageUrl}
                      alt={pm.name}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <div
                    onClick={() => onEditPhysicalMaterial(pm)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#f4f0e8] text-[#7c756d] font-medium">
                        {pm.type === 'tape'
                          ? '胶带'
                          : pm.type === 'sticker'
                          ? '贴纸'
                          : pm.type === 'ticket'
                          ? '票根'
                          : pm.type === 'paper'
                          ? '纸张'
                          : '立体'}
                      </span>
                      {pm.subType && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#3b6e8c]/10 text-[#3b6e8c] font-semibold">
                          {pm.subType}
                        </span>
                      )}
                      <h4 className="text-xs font-semibold text-[#2c2825] truncate">
                        {pm.name}
                      </h4>
                    </div>

                    <div className="mt-1 text-[11px] text-[#7c756d] flex items-center gap-2">
                      {pm.widthMm && <span>宽 {pm.widthMm}mm</span>}
                      {pm.heightMm && <span>高 {pm.heightMm}mm</span>}
                      {pm.remainingText && <span>· {pm.remainingText}</span>}
                    </div>

                    {pm.notes && (
                      <p className="text-[10px] text-[#9e978e] truncate mt-0.5">{pm.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onAddPhysicalMaterialToCanvas && (
                      <button
                        type="button"
                        onClick={() => onAddPhysicalMaterialToCanvas(pm)}
                        className="h-8 px-2 rounded-lg bg-[#faf7f2] hover:bg-[#3b6e8c] text-[#3b6e8c] hover:text-white border border-[#e2dcd0] text-[11px] font-medium flex items-center gap-1 transition-colors"
                        title="置入拼贴画布"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>拼贴</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onEditPhysicalMaterial(pm)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7c756d] hover:text-[#2c2825] hover:bg-[#f6f4ee]"
                      title="编辑材料"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`确定要删除材料《${pm.name}》吗？`)) {
                          onDeletePhysicalMaterial(pm.id);
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7c756d] hover:text-[#b34033] hover:bg-[#faeeec]"
                      title="删除材料"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
