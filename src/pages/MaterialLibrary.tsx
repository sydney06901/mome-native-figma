import React, { useState, useMemo } from 'react';
import { Project } from '../models/Project.ts';
import { Material } from '../models/Material.ts';
import { MaterialCard } from '../components/MaterialCard.tsx';
import {
  Sparkles,
  FolderOpen,
  Layers,
  ChevronRight,
  Compass,
  Calendar,
  ArrowUpDown,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface MaterialLibraryProps {
  demoProject?: Project | null;
  memoryMaterials: Material[];
  onOpenProject?: (projectId: string) => void;
  onOpenCollage?: (projectId: string) => void;
  onGenerate5MoreMaterials?: () => Promise<void>;
  onViewMaterialDetail: (material: Material) => void;
  onAddMaterialToCanvas: (material: Material) => void;
  onDeleteMaterial: (materialId: string, keepProjectCopy: boolean) => void;
  onViewSourcePhoto: (sourcePhotoId: string) => void;
  onOpenCanvas: () => void;
}

type MemoryGroup = 'date' | 'object';
export type MemorySortOption = 'shot_time' | 'added_time' | 'type';
export type SortDirection = 'desc' | 'asc';

export const MaterialLibrary: React.FC<MaterialLibraryProps> = ({
  demoProject,
  memoryMaterials,
  onOpenProject,
  onOpenCollage,
  onGenerate5MoreMaterials,
  onViewMaterialDetail,
  onAddMaterialToCanvas,
  onDeleteMaterial,
  onViewSourcePhoto,
  onOpenCanvas,
}) => {
  const [deletePendingMaterial, setDeletePendingMaterial] = useState<Material | null>(null);

  // Two major categories under 记忆素材: 日期 · 物件
  const [memoryGroup, setMemoryGroup] = useState<MemoryGroup>('date');

  // Sorting options for memory materials: 拍摄时间 · 添加时间 · 素材类型(插画/原图)
  const [sortOption, setSortOption] = useState<MemorySortOption>('shot_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSortChange = (option: MemorySortOption) => {
    if (sortOption === option) {
      // Toggle direction when clicking the active sort option
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortOption(option);
      setSortDirection('desc');
    }
  };

  // Sorted memory materials list
  const sortedMemoryMaterials = useMemo(() => {
    const list = [...memoryMaterials];
    list.sort((a, b) => {
      if (sortOption === 'shot_time') {
        const timeA = a.capturedAt || '';
        const timeB = b.capturedAt || '';
        if (timeA && timeB) {
          const comp = timeA.localeCompare(timeB);
          if (comp !== 0) {
            return sortDirection === 'desc' ? -comp : comp;
          }
        } else if (timeA && !timeB) {
          return -1;
        } else if (!timeA && timeB) {
          return 1;
        }
        return sortDirection === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
      }

      if (sortOption === 'added_time') {
        return sortDirection === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
      }

      if (sortOption === 'type') {
        // 'desc': 插画优先 (ai_sketch first), then 原图 (crop)
        // 'asc': 原图优先 (crop first), then 插画 (ai_sketch)
        if (a.type !== b.type) {
          if (sortDirection === 'desc') {
            return a.type === 'ai_sketch' ? -1 : 1;
          } else {
            return a.type === 'crop' ? -1 : 1;
          }
        }
        return b.createdAt - a.createdAt;
      }

      return 0;
    });
    return list;
  }, [memoryMaterials, sortOption, sortDirection]);

  const confirmDelete = (keepProjectCopy: boolean) => {
    if (deletePendingMaterial) {
      onDeleteMaterial(deletePendingMaterial.id, keepProjectCopy);
      setDeletePendingMaterial(null);
    }
  };

  return (
    <div className="min-h-full pb-24 bg-[#fbf9f5]">
      {/* Top Header with 20px padding */}
      <div className="sticky top-0 z-30 bg-[#fdfcf9]/95 backdrop-blur-md border-b border-[#eeeae2] px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#3b6e8c]" />
          <h1 className="text-sm font-bold text-[#1c1a18] tracking-tight">记忆素材</h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#f0ece4] text-[#7c756d]">
            {memoryMaterials.length}
          </span>
        </div>
      </div>

      {/* Content Viewport with 20px horizontal padding */}
      <div className="px-5 py-4 space-y-4">
        {/* Category Switcher: 日期 · 物件 */}
        <div className="space-y-3">
          {/* Two major categories: 日期 · 物件 */}
          <div className="flex items-center gap-1.5 p-1 bg-[#ede8df] rounded-2xl">
            <button
              type="button"
              onClick={() => setMemoryGroup('date')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                memoryGroup === 'date'
                  ? 'bg-white text-[#2c2825] shadow-xs'
                  : 'text-[#7c756d] hover:text-[#2c2825]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#3b6e8c]" />
              <span>日期</span>
            </button>

            <button
              type="button"
              onClick={() => setMemoryGroup('object')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                memoryGroup === 'object'
                  ? 'bg-white text-[#2c2825] shadow-xs'
                  : 'text-[#7c756d] hover:text-[#2c2825]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3b6e8c]" />
              <span>物件 ({memoryMaterials.length})</span>
            </button>
          </div>
        </div>

        {/* Category Groups Content */}
        {memoryGroup === 'date' ? (
          /* 日期组：周六漫步·街景与建筑手记整个控件放入日期组 */
          <div className="space-y-3 pt-1 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-[#7c756d]">
              <span className="font-semibold text-[#2c2825]">日期组 · 经历手记</span>
              <span className="text-[11px] text-[#9e978e]">按拍摄日期整理的经历</span>
            </div>

            {demoProject ? (
              <div className="bg-gradient-to-br from-[#fefdfb] via-[#faf6ee] to-[#f4eee2] rounded-3xl border border-[#ded4c3] p-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-[#eee7db] overflow-hidden shrink-0 border border-[#ded5c5]">
                    {demoProject.coverUrl ? (
                      <img
                        src={demoProject.coverUrl}
                        alt={demoProject.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Compass className="w-8 h-8 m-4 text-[#8c7866]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#946d45]/15 text-[#946d45] font-semibold">
                        {demoProject.targetDate || '2026.10.10 周六'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/70 text-[#7c756d] font-medium border border-[#e5ded4]">
                        示例手账
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#2c2825] mt-1.5 truncate">
                      {demoProject.name}
                    </h3>

                    <p className="text-[11px] text-[#7c756d] mt-1 line-clamp-2 leading-relaxed">
                      包含老教堂塔楼、转角咖啡馆、梧桐叶与猫咪等漫步素材记录。
                    </p>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-3.5 pt-3 border-t border-[#eae3d5] flex items-center gap-2">
                  {onOpenProject && (
                    <button
                      type="button"
                      onClick={() => onOpenProject(demoProject.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#ded6c7] hover:bg-[#faf7f2] text-xs font-semibold text-[#2c2825] flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[#3b6e8c]" />
                      <span>查看相册与提取</span>
                    </button>
                  )}

                  {onOpenCollage && (
                    <button
                      type="button"
                      onClick={() => onOpenCollage(demoProject.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#3b6e8c] hover:bg-[#325d76] text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-xs"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>进入拼贴创作</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-[#7c756d] bg-white rounded-2xl border border-dashed border-[#e2dcd0] p-6 space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-[#b4aa9b] stroke-[1.5]" />
                <p className="text-xs font-medium text-[#2c2825]">暂无按日期归档的项目</p>
                <p className="text-[11px] text-[#9e978e]">在「创作」中新建手账项目后将在此显示</p>
              </div>
            )}
          </div>
        ) : (
          /* 物件组：六个实例插画归纳到物件组 */
          <div className="space-y-3 pt-1 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-[#7c756d]">
              <span className="font-semibold text-[#2c2825]">
                物件组 · 提取素材 ({sortedMemoryMaterials.length})
              </span>
              <span className="text-[11px] text-[#9e978e]">
                {sortOption === 'shot_time'
                  ? `拍摄时间 · ${sortDirection === 'desc' ? '最新拍摄优先 ↓' : '最早拍摄优先 ↑'}`
                  : sortOption === 'added_time'
                  ? `添加时间 · ${sortDirection === 'desc' ? '最新添加优先 ↓' : '最早添加优先 ↑'}`
                  : `素材类型 · ${sortDirection === 'desc' ? '手绘插画在前' : '原图裁剪在前'}`}
              </span>
            </div>

            {/* 快速排序工具栏：拍摄时间、添加时间、素材类型（插画/原图） */}
            <div className="bg-[#f0ece4] p-1.5 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between px-2 pt-0.5 text-[11px] text-[#7c756d]">
                <div className="flex items-center gap-1 font-medium text-[#554e44]">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#3b6e8c]" />
                  <span>快速排序:</span>
                </div>
                <span className="text-[10px] text-[#9e978e]">再次点击当前项可翻转排序</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {/* 拍摄时间 */}
                <button
                  type="button"
                  onClick={() => handleSortChange('shot_time')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all active:scale-95 ${
                    sortOption === 'shot_time'
                      ? 'bg-[#3b6e8c] text-white shadow-xs font-semibold'
                      : 'bg-[#f8f6f1] text-[#554e44] hover:bg-[#ede8df] border border-[#e8e2d6]'
                  }`}
                  title="按照片拍摄时间排序（再次点击切换降序/升序）"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>拍摄时间</span>
                  {sortOption === 'shot_time' && (
                    <span className="text-[10px] font-mono opacity-85">
                      {sortDirection === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </button>

                {/* 添加时间 */}
                <button
                  type="button"
                  onClick={() => handleSortChange('added_time')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all active:scale-95 ${
                    sortOption === 'added_time'
                      ? 'bg-[#3b6e8c] text-white shadow-xs font-semibold'
                      : 'bg-[#f8f6f1] text-[#554e44] hover:bg-[#ede8df] border border-[#e8e2d6]'
                  }`}
                  title="按素材添加到素材库的时间排序（再次点击切换降序/升序）"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>添加时间</span>
                  {sortOption === 'added_time' && (
                    <span className="text-[10px] font-mono opacity-85">
                      {sortDirection === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </button>

                {/* 素材类型（插画/原图） */}
                <button
                  type="button"
                  onClick={() => handleSortChange('type')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all active:scale-95 ${
                    sortOption === 'type'
                      ? 'bg-[#3b6e8c] text-white shadow-xs font-semibold'
                      : 'bg-[#f8f6f1] text-[#554e44] hover:bg-[#ede8df] border border-[#e8e2d6]'
                  }`}
                  title="按素材类型排序（插画/原图，再次点击切换插画优先/原图优先）"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="truncate">素材类型</span>
                  {sortOption === 'type' && (
                    <span className="text-[10px] font-mono opacity-85">
                      {sortDirection === 'desc' ? '(插画)' : '(原图)'}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {sortedMemoryMaterials.length === 0 ? (
              <div className="py-12 text-center text-[#7c756d] bg-white rounded-2xl border border-dashed border-[#e2dcd0] p-6 space-y-2">
                <FolderOpen className="w-8 h-8 mx-auto text-[#b4aa9b] stroke-[1.5]" />
                <p className="text-xs font-medium text-[#2c2825]">暂无物件素材</p>
                <p className="text-[11px] text-[#9e978e]">
                  可点击上方「+ 随机再生成5个」补充手账插画
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                {sortedMemoryMaterials.map((mat) => (
                  <MaterialCard
                    key={mat.id}
                    material={mat}
                    onViewDetail={onViewMaterialDetail}
                    onAddToCanvas={onAddMaterialToCanvas}
                    onDelete={(m) => setDeletePendingMaterial(m)}
                    onViewSourcePhoto={onViewSourcePhoto}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal for Referenced Materials */}
      {deletePendingMaterial && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#fcf2f0] text-[#b34033] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2c2825]">删除素材副本</h3>
                <p className="text-xs text-[#7c756d] mt-1 leading-relaxed">
                  确定要从素材库移除《{deletePendingMaterial.name}》吗？这不会删除你的原始上传照片。
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => confirmDelete(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-[#ded8cc] hover:bg-[#f6f4ee] text-xs font-semibold text-[#2c2825] flex items-center justify-between"
              >
                <span>从素材库移除 (保留已拼贴图层)</span>
                <ChevronRight className="w-4 h-4 text-[#7c756d]" />
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#b34033] text-white text-xs font-semibold hover:bg-[#9d362a]"
              >
                彻底删除副本
              </button>
              <button
                type="button"
                onClick={() => setDeletePendingMaterial(null)}
                className="w-full py-2 text-xs text-[#7c756d] hover:text-[#2c2825]"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
