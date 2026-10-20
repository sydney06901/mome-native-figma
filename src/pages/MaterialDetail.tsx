import React, { useState, useEffect } from 'react';
import { Project } from '../models/Project.ts';
import { PhotoItem } from '../models/PhotoItem.ts';
import { Material } from '../models/Material.ts';
import { Task, TaskStatusType } from '../models/Task.ts';
import { mockAIService } from '../services/mockAIService.ts';
import { apiAIService } from '../services/apiAIService.ts';
import { TaskStatus } from '../components/TaskStatus.tsx';
import {
  ArrowLeft,
  Sparkles,
  Scissors,
  Check,
  RotateCw,
  Plus,
  ExternalLink,
  History,
  AlertCircle,
} from 'lucide-react';

interface MaterialDetailProps {
  project: Project;
  photo: PhotoItem;
  existingMaterial?: Material | null;
  onBack: () => void;
  onSaveMaterial: (material: Material) => void;
  onAddToCollage: (material: Material) => void;
  onViewSourcePhoto: (photo: PhotoItem) => void;
}

export const MaterialDetail: React.FC<MaterialDetailProps> = ({
  project,
  photo,
  existingMaterial,
  onBack,
  onSaveMaterial,
  onAddToCollage,
  onViewSourcePhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'crop' | 'ai_sketch'>(
    existingMaterial?.type === 'ai_sketch'
      ? 'ai_sketch'
      : project.isDemo
      ? 'ai_sketch'
      : 'crop'
  );

  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(
    existingMaterial || null
  );

  // Generation Task State
  const [generationTask, setGenerationTask] = useState<Task | null>(null);
  const [historyVersions, setHistoryVersions] = useState<
    { id: string; url: string; createdAt: number; style: string; versionIndex: number }[]
  >(existingMaterial?.historyVersions || []);

  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number>(0);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Initialize or load material
  useEffect(() => {
    if (existingMaterial) {
      setCurrentMaterial(existingMaterial);
      if (existingMaterial.historyVersions && existingMaterial.historyVersions.length > 0) {
        setHistoryVersions(existingMaterial.historyVersions);
      }
    }
  }, [existingMaterial]);

  const handleGenerate = async (isRegenerate: boolean = false) => {
    // If not demo project and no real API configured
    if (!project.isDemo && !apiAIService.isConfigured()) {
      return;
    }

    const taskId = `task-gen-${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      type: 'generate_illustration',
      status: 'running',
      stageName: isRegenerate ? '重新解析结构，绘制新版本线稿...' : '解析透视结构，生成建筑线稿...',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGenerationTask(newTask);

    try {
      const result = await mockAIService.generateIllustration(
        taskId,
        photo.id,
        '黑白线稿',
        (stage: string) => {
          setGenerationTask((prev) =>
            prev && prev.id === taskId ? { ...prev, stageName: stage, updatedAt: Date.now() } : prev
          );
        }
      );

      if (!result) {
        // Cancelled
        setGenerationTask((prev) =>
          prev && prev.id === taskId ? { ...prev, status: 'cancelled', stageName: '已取消生成' } : prev
        );
        return;
      }

      const newVersion = {
        id: `ver-${Date.now()}`,
        url: result.sketchUrl,
        createdAt: Date.now(),
        style: '黑白线稿',
        versionIndex: historyVersions.length + 1,
      };

      const updatedHistory = [...historyVersions, newVersion];
      setHistoryVersions(updatedHistory);
      setSelectedVersionIndex(updatedHistory.length - 1);

      const updatedMaterial: Material = {
        id: currentMaterial?.id || `mat-sketch-${Date.now()}`,
        projectId: project.id,
        projectName: project.name,
        sourcePhotoId: photo.id,
        sourcePhotoUrl: photo.url,
        name: currentMaterial?.name || `${photo.name}·线稿素材`,
        type: 'ai_sketch',
        previewUrl: result.sketchUrl,
        fullUrl: result.sketchUrl,
        style: 'line_art',
        isDemo: project.isDemo,
        isDemoSketch: project.isDemo,
        capturedAt: photo.capturedAt || new Date().toISOString().slice(0, 10),
        historyVersions: updatedHistory,
        createdAt: currentMaterial?.createdAt || Date.now(),
      };

      setCurrentMaterial(updatedMaterial);
      onSaveMaterial(updatedMaterial);

      setGenerationTask({
        id: taskId,
        type: 'generate_illustration',
        status: 'succeeded',
        stageName: '线稿生成完成',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        resultAssetId: updatedMaterial.id,
      });

      setActiveTab('ai_sketch');
      showFeedback('已生成并保存线稿版本');
    } catch (e: any) {
      setGenerationTask({
        id: taskId,
        type: 'generate_illustration',
        status: 'failed',
        stageName: '生成失败',
        error: e?.message || '生成过程异常',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  };

  const handleCancelGeneration = () => {
    if (generationTask && generationTask.status === 'running') {
      mockAIService.cancelJob(generationTask.id);
      setGenerationTask((prev) =>
        prev ? { ...prev, status: 'cancelled', stageName: '用户已取消任务' } : null
      );
    }
  };

  const showFeedback = (msg: string) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(null), 2500);
  };

  const handleSaveCurrentVersion = () => {
    if (!currentMaterial) return;
    onSaveMaterial(currentMaterial);
    showFeedback('已保留当前版本');
  };

  const handleAddToCanvas = () => {
    if (!currentMaterial) {
      // Create a default material from photo if none exists
      const fallbackMaterial: Material = {
        id: `mat-crop-${Date.now()}`,
        projectId: project.id,
        projectName: project.name,
        sourcePhotoId: photo.id,
        sourcePhotoUrl: photo.url,
        name: `${photo.name}·原图`,
        type: 'crop',
        previewUrl: photo.url,
        fullUrl: photo.url,
        style: 'line_art',
        isDemo: project.isDemo,
        createdAt: Date.now(),
      };
      onSaveMaterial(fallbackMaterial);
      onAddToCollage(fallbackMaterial);
    } else {
      onAddToCollage(currentMaterial);
    }
  };

  // Determine which image to display in main viewport
  const displayImageUrl =
    activeTab === 'ai_sketch'
      ? currentMaterial?.type === 'ai_sketch'
        ? historyVersions[selectedVersionIndex]?.url || currentMaterial.previewUrl
        : null
      : currentMaterial?.cropBounds
      ? currentMaterial.previewUrl
      : photo.url;

  return (
    <div className="min-h-full pb-28 bg-[#fbf9f5]">
      {/* Top App Bar with 20px padding */}
      <div className="sticky top-0 z-30 bg-[#fdfcf9]/95 backdrop-blur-md border-b border-[#eeeae2] px-5 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-11 h-11 -ml-2 rounded-xl flex items-center justify-center text-[#7c756d] hover:text-[#1c1a18] active:scale-95"
          aria-label="返回上一页"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center min-w-0 max-w-[60%]">
          <h1 className="text-sm font-semibold text-[#1c1a18] truncate tracking-tight">
            {photo.name}
          </h1>
          <p className="text-[10px] text-[#7c756d] truncate">生成与比较</p>
        </div>

        <button
          type="button"
          onClick={() => onViewSourcePhoto(photo)}
          className="min-h-[44px] text-xs text-[#7c756d] hover:text-[#1c1a18] flex items-center gap-1 active:scale-95"
          title="查看完整原图"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>原图</span>
        </button>
      </div>

      {/* Mode Tabs: 原图裁剪 vs AI 插画 */}
      <div className="px-5 py-3 bg-white border-b border-[#eeeae2]">
        <div className="flex items-center gap-1 p-1 bg-[#f0ece4] rounded-xl max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('crop')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'crop'
                ? 'bg-white text-[#2c2825] shadow-xs'
                : 'text-[#7c756d] hover:text-[#2c2825]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-[#507d64]" />
            <span>原图裁剪</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai_sketch')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ai_sketch'
                ? 'bg-white text-[#2c2825] shadow-xs'
                : 'text-[#7c756d] hover:text-[#2c2825]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3b6e8c]" />
            <span>AI 插画 (黑白线稿)</span>
          </button>
        </div>
      </div>

      {/* Main Image Display Viewport (Complete image display, no clipping of subject) */}
      <div className="p-4 max-w-md mx-auto">
        <div className="relative aspect-[4/3] rounded-2xl bg-[#f4f0e8] border border-[#e8e4dc] overflow-hidden flex items-center justify-center p-3 shadow-xs">
          {displayImageUrl ? (
            <img
              src={displayImageUrl}
              alt={photo.name}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain drop-shadow-xs"
            />
          ) : (
            <div className="text-center p-6 text-[#7c756d]">
              <Sparkles className="w-8 h-8 mx-auto text-[#b4aa9b] mb-2" />
              <p className="text-xs font-medium text-[#2c2825]">尚未生成插画版本</p>
              <p className="text-[11px] text-[#9e978e] mt-1">
                点击下方按钮即可生成黑白手绘建筑线稿
              </p>
            </div>
          )}

          {/* Type Watermark Stamp */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#e8e4dc] text-[10px] font-medium text-[#2c2825]">
            {activeTab === 'ai_sketch'
              ? project.isDemo
                ? '示例生成结果 · 黑白线稿'
                : 'AI 手绘线稿'
              : '原图裁剪素材'}
          </div>

          {/* History Version Pill Selector */}
          {activeTab === 'ai_sketch' && historyVersions.length > 1 && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-black/40 backdrop-blur-xs p-1.5 rounded-xl">
              <span className="text-[10px] text-white/80 shrink-0 px-1">历史版本:</span>
              {historyVersions.map((ver, idx) => (
                <button
                  key={ver.id}
                  type="button"
                  onClick={() => setSelectedVersionIndex(idx)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-medium shrink-0 transition-colors ${
                    selectedVersionIndex === idx
                      ? 'bg-white text-[#2c2825] font-bold'
                      : 'text-white/80 hover:bg-white/20'
                  }`}
                >
                  第 {ver.versionIndex} 版
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Feedback message banner */}
        {savedSuccessMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#edf6f0] border border-[#d2ead8] text-[#366944] text-xs font-medium text-center flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* Notice for User Uploaded Photos without Real AI */}
        {!project.isDemo && !apiAIService.isConfigured() && activeTab === 'ai_sketch' && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#fbf5ee] border border-[#f2ded0] text-xs text-[#8c4820] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>云端 AI 重绘服务说明</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#7c756d]">
              用户自主上传的新照片，需要接入真实的云端 AI 视觉分析与绘图服务。我们不会套用无关的示例图片伪造实时生成。
            </p>
            <p className="text-[11px] leading-relaxed text-[#7c756d]">
              当前你可以直接保留「原图裁剪」素材加入画布拼贴，体验完整的手账拼贴与 PNG 导出流程。
            </p>
          </div>
        )}

        {/* Task Progress & Status */}
        <div className="mt-3">
          <TaskStatus
            task={generationTask}
            onCancel={handleCancelGeneration}
            onRetry={() => handleGenerate(false)}
          />
        </div>

        {/* Controls when Generated or Ready */}
        <div className="mt-4 space-y-2.5">
          {activeTab === 'ai_sketch' && project.isDemo && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleGenerate(historyVersions.length > 0)}
                disabled={generationTask?.status === 'running'}
                className="flex-1 h-11 rounded-xl bg-white border border-[#ded8cc] text-[#2c2825] text-xs font-semibold hover:bg-[#f6f4ee] flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:opacity-50"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#3b6e8c]" />
                <span>{historyVersions.length > 0 ? '重新生成 (保留历史)' : '生成线稿'}</span>
              </button>

              {currentMaterial && (
                <button
                  type="button"
                  onClick={handleSaveCurrentVersion}
                  className="px-4 h-11 rounded-xl bg-white border border-[#ded8cc] text-[#2c2825] text-xs font-medium hover:bg-[#f6f4ee] active:scale-98"
                >
                  保留这一版
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Primary Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#fbf9f5] via-[#fbf9f5] to-transparent z-20 max-w-md mx-auto">
        <button
          type="button"
          onClick={handleAddToCanvas}
          className="w-full h-12 rounded-xl bg-[#2c2825] hover:bg-[#1a1816] text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md"
        >
          <Plus className="w-4 h-4 text-[#eed8be]" />
          <span>加入手账画布</span>
        </button>
      </div>
    </div>
  );
};
