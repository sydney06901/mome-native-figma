import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../models/Project.ts';
import { CanvasItem } from '../models/CanvasItem.ts';
import { Material } from '../models/Material.ts';
import { PhysicalMaterial } from '../models/PhysicalMaterial.ts';
import { CanvasToolbar } from '../components/CanvasToolbar.tsx';
import { MaterialDrawer } from '../components/MaterialDrawer.tsx';
import { exportCollageToPNG } from '../services/exportService.ts';
import {
  ArrowLeft,
  Download,
  Save,
  Check,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

const MAX_LAYERS = 5;

interface CollageCanvasProps {
  project: Project;
  memoryMaterials: Material[];
  physicalMaterials: PhysicalMaterial[];
  onBack: () => void;
  onSaveCanvasState: (projectId: string, layers: CanvasItem[]) => Promise<void>;
  onGoToMaterialLibrary: () => void;
}

export const CollageCanvas: React.FC<CollageCanvasProps> = ({
  project,
  memoryMaterials,
  physicalMaterials,
  onBack,
  onSaveCanvasState,
  onGoToMaterialLibrary,
}) => {
  // Initialize layers from project.canvasLayers or start empty
  const [layers, setLayers] = useState<CanvasItem[]>(() => {
    if (project.canvasLayers && project.canvasLayers.length > 0) {
      return project.canvasLayers;
    }
    // If demo project and has demo sketch, seed 1 initial layer for immediate tactile delight!
    const churchSketch = memoryMaterials.find((m) => m.type === 'ai_sketch');
    if (churchSketch && project.isDemo) {
      return [
        {
          id: `layer-${Date.now()}-init`,
          materialId: churchSketch.id,
          sourceType: 'memory',
          name: churchSketch.name,
          url: churchSketch.previewUrl,
          x: 50,
          y: 45,
          scale: 1.0,
          rotation: 0,
          zIndex: 1,
          width: 220,
          height: 220,
        },
      ];
    }
    return [];
  });

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(() => {
    return layers.length > 0 ? layers[0].id : null;
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState<'saved' | 'saving'>('saved');

  // Dragging interaction state
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragInfoRef = useRef<{
    layerId: string;
    startX: number;
    startY: number;
    layerStartX: number;
    layerStartY: number;
  } | null>(null);

  // Auto-save whenever layers change
  useEffect(() => {
    setSaveStatusText('saving');
    const timer = setTimeout(async () => {
      await onSaveCanvasState(project.id, layers);
      setSaveStatusText('saved');
    }, 600);
    return () => clearTimeout(timer);
  }, [layers, project.id]);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  // Touch and pointer dragging
  const handlePointerDown = (layer: CanvasItem, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedLayerId(layer.id);

    dragInfoRef.current = {
      layerId: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      layerStartX: layer.x,
      layerStartY: layer.y,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragInfoRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragInfoRef.current.startX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragInfoRef.current.startY) / rect.height) * 100;

      const newX = Math.max(5, Math.min(95, dragInfoRef.current.layerStartX + deltaXPercent));
      const newY = Math.max(5, Math.min(95, dragInfoRef.current.layerStartY + deltaYPercent));

      setLayers((prev) =>
        prev.map((l) => (l.id === dragInfoRef.current?.layerId ? { ...l, x: newX, y: newY } : l))
      );
    };

    const handlePointerUp = () => {
      dragInfoRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // Update selected layer attributes (scale, rotate)
  const handleUpdateLayer = (updated: Partial<CanvasItem>) => {
    if (!selectedLayerId) return;
    setLayers((prev) =>
      prev.map((l) => (l.id === selectedLayerId ? { ...l, ...updated } : l))
    );
  };

  // Reordering layers (move up / down in zIndex)
  const handleMoveForward = () => {
    if (!selectedLayer) return;
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((l) => l.id === selectedLayer.id);
    if (idx < sorted.length - 1) {
      const next = sorted[idx + 1];
      const tempZ = selectedLayer.zIndex;
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id === selectedLayer.id) return { ...l, zIndex: next.zIndex };
          if (l.id === next.id) return { ...l, zIndex: tempZ };
          return l;
        })
      );
    }
  };

  const handleMoveBackward = () => {
    if (!selectedLayer) return;
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((l) => l.id === selectedLayer.id);
    if (idx > 0) {
      const prev = sorted[idx - 1];
      const tempZ = selectedLayer.zIndex;
      setLayers((prevList) =>
        prevList.map((l) => {
          if (l.id === selectedLayer.id) return { ...l, zIndex: prev.zIndex };
          if (l.id === prev.id) return { ...l, zIndex: tempZ };
          return l;
        })
      );
    }
  };

  const handleDeleteLayer = () => {
    if (!selectedLayerId) return;
    setLayers((prev) => prev.filter((l) => l.id !== selectedLayerId));
    setSelectedLayerId(null);
  };

  // Add Material to canvas
  const handleAddMemoryMaterial = (m: Material) => {
    if (layers.length >= MAX_LAYERS) {
      alert(`画布图层已达上限 (${MAX_LAYERS}/${MAX_LAYERS})，请先删除现有图层。`);
      return;
    }

    const nextZ = layers.length > 0 ? Math.max(...layers.map((l) => l.zIndex)) + 1 : 1;
    const newLayer: CanvasItem = {
      id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      materialId: m.id,
      sourceType: 'memory',
      name: m.name,
      url: m.previewUrl,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      scale: 1.0,
      rotation: Math.round((Math.random() - 0.5) * 12),
      zIndex: nextZ,
      width: 220,
      height: 200,
    };

    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const handleAddPhysicalMaterial = (pm: PhysicalMaterial) => {
    if (layers.length >= MAX_LAYERS) {
      alert(`画布图层已达上限 (${MAX_LAYERS}/${MAX_LAYERS})，请先删除现有图层。`);
      return;
    }

    const nextZ = layers.length > 0 ? Math.max(...layers.map((l) => l.zIndex)) + 1 : 1;
    const newLayer: CanvasItem = {
      id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      materialId: pm.id,
      sourceType: 'physical',
      name: pm.name,
      url: pm.imageUrl,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      scale: 1.0,
      rotation: Math.round((Math.random() - 0.5) * 16),
      zIndex: nextZ,
      width: pm.type === 'tape' ? 240 : 180,
      height: pm.type === 'tape' ? 80 : 160,
    };

    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  // Export PNG
  const handleExportPNG = async () => {
    if (layers.length === 0) {
      alert('画布上暂无素材，请先从底部抽屉添加素材');
      return;
    }

    setIsExporting(true);
    try {
      await exportCollageToPNG(layers, project.name);
    } catch (e) {
      alert('导出生成失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-full pb-20 bg-[#F2F0F6] flex flex-col justify-between select-none">
      {/* Top Bar with 20px padding */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#2a2336]/[0.06] px-4 sm:px-5 h-15 flex items-center justify-between shrink-0 shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="w-11 h-11 -ml-1 rounded-full bg-white border border-[#2a2336]/[0.06] flex items-center justify-center text-[#17171B] hover:bg-[#FBFAFD] active:scale-95 transition-all shadow-xs cursor-pointer"
          aria-label="返回"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center min-w-0 max-w-[50%]">
          <h1 className="font-display text-[16px] font-bold text-[#17171B] truncate tracking-tight">{project.name}</h1>
          <p className="text-[11px] text-[#747078] flex items-center justify-center gap-1 font-medium">
            {saveStatusText === 'saving' ? (
              <span>正在保存草稿...</span>
            ) : (
              <>
                <Check className="w-3 h-3 text-[#2B7354]" />
                <span>草稿已保存</span>
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          disabled={isExporting || layers.length === 0}
          onClick={handleExportPNG}
          className="min-h-[44px] px-4 rounded-full bg-[#E8925A] hover:bg-[#d97d43] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? '导出中' : '导出PNG'}</span>
        </button>
      </div>

      {/* Main 3:4 Paper Canvas Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 overflow-hidden">
        {/* Fixed 3:4 Aspect Paper Canvas */}
        <div
          ref={canvasRef}
          onClick={() => setSelectedLayerId(null)}
          className="relative w-full max-w-[340px] aspect-[3/4] bg-[#FAF8F5] rounded-[28px] shadow-[0_12px_36px_rgba(42,35,54,0.08)] border border-[#2a2336]/[0.08] overflow-hidden touch-none"
          style={{
            backgroundImage: `radial-gradient(#dcd5c9 0.75px, transparent 0.75px)`,
            backgroundSize: '20px 20px',
          }}
        >
          {/* Subtle paper grain header date stamp */}
          <div className="absolute top-3.5 left-4 text-[10px] font-mono tracking-widest text-[#A19CA6] uppercase pointer-events-none">
            {project.targetDate || '2026.10.10'} · JOURNAL COLLAGE
          </div>

          {/* Empty Canvas Guidance */}
          {layers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#747078] pointer-events-none space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#E7E1FA] text-[#55429E] flex items-center justify-center">
                <Layers className="w-6 h-6 stroke-[1.8]" />
              </div>
              <p className="font-display text-[15px] font-bold text-[#17171B]">画布空白</p>
              <p className="text-[12px] text-[#747078] max-w-[200px] leading-relaxed">
                展开下方素材抽屉，点击素材即可加入并自由排版
              </p>
            </div>
          )}

          {/* Render Layers */}
          {layers.map((layer) => {
            const isSelected = selectedLayerId === layer.id;

            return (
              <div
                key={layer.id}
                onPointerDown={(e) => handlePointerDown(layer, e)}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                  zIndex: layer.zIndex,
                  width: `${layer.width}px`,
                  height: `${layer.height}px`,
                }}
                className={`absolute flex items-center justify-center cursor-move touch-none select-none transition-shadow ${
                  isSelected
                    ? 'ring-2 ring-[#9684DF] ring-offset-2 ring-offset-transparent shadow-xl rounded-xl'
                    : 'hover:ring-1 hover:ring-[#A19CA6]'
                }`}
              >
                <img
                  src={layer.url}
                  alt={layer.name}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-md"
                />

                {/* Selection Handle Badge */}
                {isSelected && (
                  <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-[#9684DF] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md pointer-events-none">
                    {layer.zIndex}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tactile guidance */}
        <p className="text-[11px] text-[#747078] mt-2 text-center">
          单指拖拽素材移动位置 · 最多 5 个图层 · 导出尺寸 1200×1600 px
        </p>
      </div>

      {/* Canvas Layer Editing Toolbar */}
      <div className="shrink-0 mb-14">
        <CanvasToolbar
          selectedLayer={selectedLayer}
          onUpdateLayer={handleUpdateLayer}
          onMoveForward={handleMoveForward}
          onMoveBackward={handleMoveBackward}
          onDeleteLayer={handleDeleteLayer}
          canMoveForward={
            !!selectedLayer &&
            layers.length > 1 &&
            selectedLayer.zIndex < Math.max(...layers.map((l) => l.zIndex))
          }
          canMoveBackward={
            !!selectedLayer &&
            layers.length > 1 &&
            selectedLayer.zIndex > Math.min(...layers.map((l) => l.zIndex))
          }
        />
      </div>

      {/* Expandable Bottom Material Drawer */}
      <MaterialDrawer
        memoryMaterials={memoryMaterials}
        physicalMaterials={physicalMaterials}
        currentLayerCount={layers.length}
        maxLayers={MAX_LAYERS}
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        onAddMemoryMaterial={handleAddMemoryMaterial}
        onAddPhysicalMaterial={handleAddPhysicalMaterial}
        onGoToMaterialLibrary={onGoToMaterialLibrary}
      />
    </div>
  );
};
