import React, { useState } from 'react';
import { Material } from '../models/Material.ts';
import { PhysicalMaterial } from '../models/PhysicalMaterial.ts';
import { ChevronUp, ChevronDown, Sparkles, Scissors, Layers, Bookmark } from 'lucide-react';

interface MaterialDrawerProps {
  memoryMaterials: Material[];
  physicalMaterials: PhysicalMaterial[];
  currentLayerCount: number;
  maxLayers: number;
  isOpen: boolean;
  onToggle: () => void;
  onAddMemoryMaterial: (m: Material) => void;
  onAddPhysicalMaterial: (pm: PhysicalMaterial) => void;
  onGoToMaterialLibrary: () => void;
}

export const MaterialDrawer: React.FC<MaterialDrawerProps> = ({
  memoryMaterials,
  physicalMaterials,
  currentLayerCount,
  maxLayers,
  isOpen,
  onToggle,
  onAddMemoryMaterial,
  onAddPhysicalMaterial,
  onGoToMaterialLibrary,
}) => {
  const [tab, setTab] = useState<'memory' | 'physical'>('memory');
  const isFull = currentLayerCount >= maxLayers;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#2a2336]/[0.08] shadow-[0_-12px_32px_rgba(42,35,54,0.08)] transition-all duration-300 max-w-md mx-auto ${
        isOpen ? 'h-[320px]' : 'h-15'
      }`}
      style={{
        borderTopLeftRadius: '28px',
        borderTopRightRadius: '28px',
      }}
    >
      {/* Drawer Grab Header (Always visible) */}
      <div
        onClick={onToggle}
        className="h-15 px-5 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E7E1FA] text-[#55429E] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-[15px] font-bold text-[#17171B]">素材抽屉</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F2F0F6] text-[#747078]">
                图层: <strong className={isFull ? 'text-[#C86666]' : 'text-[#72C9A3]'}>{currentLayerCount}</strong>/{maxLayers}
              </span>
            </div>
            <p className="text-[11px] text-[#747078]">点击素材可直接置入画布拼贴</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#747078] font-medium min-h-[44px] items-center">
          <span>{isOpen ? '收起' : '展开抽屉'}</span>
          <div className="w-7 h-7 rounded-full bg-[#F2F0F6] flex items-center justify-center text-[#17171B]">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Drawer Area */}
      {isOpen && (
        <div className="h-[260px] flex flex-col bg-[#F2F0F6]/60">
          {/* Sub Header & Tab Switcher */}
          <div className="px-5 py-2.5 flex items-center justify-between bg-white border-y border-[#2a2336]/[0.06] shrink-0">
            <div className="flex items-center gap-1.5 p-1 bg-[#F2F0F6] rounded-full">
              <button
                type="button"
                onClick={() => setTab('memory')}
                className={`min-h-[32px] px-3.5 text-xs font-medium rounded-full transition-all ${
                  tab === 'memory'
                    ? 'bg-white text-[#17171B] shadow-xs'
                    : 'text-[#747078] hover:text-[#17171B]'
                }`}
              >
                记忆素材 ({memoryMaterials.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('physical')}
                className={`min-h-[32px] px-3.5 text-xs font-medium rounded-full transition-all ${
                  tab === 'physical'
                    ? 'bg-white text-[#17171B] shadow-xs'
                    : 'text-[#747078] hover:text-[#17171B]'
                }`}
              >
                我的材料 ({physicalMaterials.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onGoToMaterialLibrary}
              className="text-xs text-[#E8925A] font-medium hover:underline flex items-center gap-0.5"
            >
              管理素材库
            </button>
          </div>

          {/* Full Layers Warning */}
          {isFull && (
            <div className="px-4 py-1.5 bg-[#FDF5F5] text-[#8E3232] text-[11px] font-medium border-b border-[#C86666]/20 text-center">
              画布图层已达上限 (5/5)，请先删除或移动现有图层
            </div>
          )}

          {/* Material Items List (Horizontal scroll) */}
          <div className="flex-1 p-3.5 overflow-x-auto no-scrollbar flex items-center gap-3">
            {tab === 'memory' ? (
              memoryMaterials.length === 0 ? (
                <div className="w-full text-center py-6 text-xs text-[#747078] space-y-2">
                  <p>暂无记忆贴纸素材</p>
                  <button
                    type="button"
                    onClick={onGoToMaterialLibrary}
                    className="min-h-[36px] px-4 rounded-full bg-white border border-[#2a2336]/[0.08] text-[#17171B] text-xs font-medium"
                  >
                    从照片裁剪或生成贴纸
                  </button>
                </div>
              ) : (
                memoryMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => !isFull && onAddMemoryMaterial(mat)}
                    className={`shrink-0 w-32 h-44 bg-white rounded-[22px] border p-2.5 flex flex-col justify-between transition-all select-none shadow-[0_4px_16px_rgba(42,35,54,0.04)] ${
                      isFull
                        ? 'opacity-40 cursor-not-allowed border-[#2a2336]/[0.08]'
                        : 'cursor-pointer hover:border-[#72C9A3] hover:shadow-md active:scale-95 border-[#2a2336]/[0.07]'
                    }`}
                  >
                    <div className="h-28 bg-[#FBFAFD] rounded-[16px] flex items-center justify-center p-2 overflow-hidden border border-[#2a2336]/[0.04]">
                      <img
                        src={mat.previewUrl}
                        alt={mat.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain drop-shadow-xs"
                      />
                    </div>
                    <div className="pt-1">
                      <p className="text-[12px] font-bold text-[#17171B] line-clamp-1">{mat.name}</p>
                      <p className="text-[10px] text-[#747078] flex items-center gap-1 mt-0.5">
                        {mat.type === 'ai_sketch' ? (
                          <Sparkles className="w-3 h-3 text-[#9684DF]" />
                        ) : (
                          <Scissors className="w-3 h-3 text-[#72C9A3]" />
                        )}
                        <span>{mat.type === 'ai_sketch' ? '线稿贴纸' : '原图裁剪'}</span>
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : physicalMaterials.length === 0 ? (
              <div className="w-full text-center py-6 text-xs text-[#747078] space-y-2">
                <p>暂无物理素材 (胶带/贴纸/纸张)</p>
                <button
                  type="button"
                  onClick={onGoToMaterialLibrary}
                  className="min-h-[36px] px-4 rounded-full bg-white border border-[#2a2336]/[0.08] text-[#17171B] text-xs font-medium"
                >
                  前往录入材料
                </button>
              </div>
            ) : (
              physicalMaterials.map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => !isFull && onAddPhysicalMaterial(pm)}
                  className={`shrink-0 w-32 h-44 bg-white rounded-[22px] border p-2.5 flex flex-col justify-between transition-all select-none shadow-[0_4px_16px_rgba(42,35,54,0.04)] ${
                    isFull
                      ? 'opacity-40 cursor-not-allowed border-[#2a2336]/[0.08]'
                      : 'cursor-pointer hover:border-[#E8925A] hover:shadow-md active:scale-95 border-[#2a2336]/[0.07]'
                  }`}
                >
                  <div className="h-28 bg-[#FBFAFD] rounded-[16px] flex items-center justify-center p-2 overflow-hidden border border-[#2a2336]/[0.04]">
                    <img
                      src={pm.imageUrl}
                      alt={pm.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="pt-1">
                    <p className="text-[12px] font-bold text-[#17171B] line-clamp-1">{pm.name}</p>
                    <p className="text-[10px] text-[#747078] flex items-center gap-1 mt-0.5">
                      <Bookmark className="w-3 h-3 text-[#E8925A]" />
                      <span>
                        {pm.type === 'tape'
                          ? '胶带'
                          : pm.type === 'sticker'
                          ? '贴纸'
                          : pm.type === 'ticket'
                          ? '票据'
                          : '纸张'}
                        {pm.widthMm ? ` · ${pm.widthMm}mm` : ''}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
