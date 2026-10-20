import React, { useRef } from 'react';
import { Project } from '../domain/types.ts';
import { PageHeader, SectionHeader } from '../shared/components/PageHeader.tsx';
import { HorizontalCardRail } from '../shared/components/HorizontalCardRail.tsx';
import { SoftCard } from '../shared/components/SoftCard.tsx';
import {
  Sparkles,
  Scissors,
  Layers,
  BookOpen,
  ArrowRight,
  Plus,
  Compass,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';

interface HomeProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onOpenCollage: (projectId: string) => void;
  onCreateNewProject: (name: string, isDemo?: boolean) => Promise<Project>;
  onDeleteProject?: (projectId: string) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
  onImportUserPhotos: (projectId: string, files: FileList) => Promise<void>;
  onNavigateTab?: (tab: 'create' | 'library' | 'profile') => void;
  onOpenJournalReview?: () => void;
  onOpenPrintSimulator?: () => void;
}

export const Home: React.FC<HomeProps> = ({
  projects,
  onOpenProject,
  onOpenCollage,
  onCreateNewProject,
  onImportUserPhotos,
  onNavigateTab,
  onOpenJournalReview,
  onOpenPrintSimulator,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatted current date
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const handleStartNewMemory = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const projectName = `手账记忆 · ${today.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      })}`;
      const newProj = await onCreateNewProject(projectName, false);
      await onImportUserPhotos(newProj.id, e.target.files);
      onOpenProject(newProj.id);
    }
    e.target.value = '';
  };

  const activeProject = projects[0] || null;

  return (
    <div className="space-y-6 pt-2 pb-24">
      {/* Top Greeting & Title (Section V) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#747078] tracking-tight bg-white/80 px-3 py-1 rounded-full border border-[#2a2336]/[0.05]">
            {dateStr}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#2B7354] bg-[#DDF3E9] px-2.5 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#72C9A3] animate-pulse" />
            <span>Bloub 记忆助手已就绪</span>
          </div>
        </div>

        <h1 className="font-display text-[34px] sm:text-[38px] font-bold text-[#17171B] tracking-tight pt-2 leading-[1.12]">
          Your memories
        </h1>
        <p className="text-[14px] text-[#747078] font-normal leading-relaxed">
          把每次散步与旅途的照片，沉淀进有温度的数字手账。
        </p>
      </div>

      {/* Part 1: Horizontal scrolling memory highlight cards (Section V) */}
      <div className="space-y-2">
        <HorizontalCardRail itemGap="md">
          {/* Card 1: This week */}
          <div
            onClick={() => activeProject && onOpenProject(activeProject.id)}
            className="group relative w-72 h-44 rounded-[28px] overflow-hidden bg-gradient-to-br from-[#E7E1FA] to-[#FAF9FD] border border-[#9684DF]/20 shadow-[0_8px_24px_rgba(42,35,54,0.05)] p-5 flex flex-col justify-between cursor-pointer active:scale-[0.985] transition-all shrink-0"
          >
            {/* Organic soft shapes background */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-[#DDF3E9]/60 blur-xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#F8E2D4]/50 blur-xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-[#55429E] tracking-tight border border-[#9684DF]/20">
                This week
              </span>
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#55429E] group-hover:scale-105 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <h3 className="font-display text-[19px] font-bold text-[#17171B] tracking-tight">
                周末漫游与历史建筑
              </h3>
              <p className="text-[12px] text-[#747078] line-clamp-1">
                已记录 12 张照片 · 找到 4 处特色立面与门窗
              </p>
            </div>
          </div>

          {/* Card 2: Recent memories */}
          <div
            onClick={() => activeProject && onOpenProject(activeProject.id)}
            className="group relative w-72 h-44 rounded-[28px] overflow-hidden bg-gradient-to-br from-[#DDF3E9] to-[#F9FCFA] border border-[#72C9A3]/25 shadow-[0_8px_24px_rgba(42,35,54,0.05)] p-5 flex flex-col justify-between cursor-pointer active:scale-[0.985] transition-all shrink-0"
          >
            <div className="absolute top-2 right-4 w-20 h-20 rounded-full bg-[#FBF1C9]/50 blur-lg pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-[#2B7354] tracking-tight border border-[#72C9A3]/20">
                Recent memories
              </span>
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#2B7354] group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <h3 className="font-display text-[19px] font-bold text-[#17171B] tracking-tight">
                城市街角与光影碎片
              </h3>
              <p className="text-[12px] text-[#747078] line-clamp-1">
                AI 自动提取出线稿素材与原图贴纸
              </p>
            </div>
          </div>

          {/* Card 3: New creations */}
          <div
            onClick={() => activeProject && onOpenCollage(activeProject.id)}
            className="group relative w-72 h-44 rounded-[28px] overflow-hidden bg-gradient-to-br from-[#F8E2D4] to-[#FCF9F7] border border-[#E8925A]/25 shadow-[0_8px_24px_rgba(42,35,54,0.05)] p-5 flex flex-col justify-between cursor-pointer active:scale-[0.985] transition-all shrink-0"
          >
            <div className="absolute -bottom-4 right-2 w-24 h-24 rounded-full bg-[#E7E1FA]/40 blur-lg pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-[#93491E] tracking-tight border border-[#E8925A]/20">
                New creations
              </span>
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#E8925A] group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <h3 className="font-display text-[19px] font-bold text-[#17171B] tracking-tight">
                我的手账拼贴画布
              </h3>
              <p className="text-[12px] text-[#747078] line-clamp-1">
                4 个图层正在编排 · 支持导出高精度图片
              </p>
            </div>
          </div>
        </HorizontalCardRail>
      </div>

      {/* Part 2: Continue creating (Section V) */}
      <div className="space-y-3">
        <SectionHeader
          title="Continue creating"
          actionText={projects.length > 1 ? `全部 (${projects.length})` : undefined}
          onAction={() => onNavigateTab?.('create')}
        />

        <div className="grid grid-cols-1 gap-3">
          {projects.length > 0 ? (
            projects.slice(0, 3).map((project) => (
              <SoftCard
                key={project.id}
                variant="interactive"
                padding="md"
                onClick={() => onOpenProject(project.id)}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#F2F0F6] overflow-hidden shrink-0 border border-[#2a2336]/[0.06] flex items-center justify-center">
                    {project.coverUrl ? (
                      <img
                        src={project.coverUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#A19CA6]" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <h4 className="font-display text-[16px] font-bold text-[#17171B] truncate">
                      {project.name}
                    </h4>
                    <p className="text-[12px] text-[#747078] truncate">
                      {project.targetDate || '2026.10.10'} · 关键词: {project.targetKeyword || '建筑'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCollage(project.id);
                    }}
                    className="min-h-[44px] px-3.5 rounded-full bg-[#E7E1FA] hover:bg-[#ded6f8] text-[#55429E] text-xs font-medium flex items-center gap-1 transition-colors active:scale-95 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>拼贴</span>
                  </button>

                  <div className="w-9 h-9 rounded-full bg-[#F2F0F6] text-[#747078] flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </SoftCard>
            ))
          ) : (
            <SoftCard padding="lg" className="text-center py-8 space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-[#9684DF]" />
              <p className="text-xs text-[#747078]">暂无手账项目，从导入照片开始吧</p>
              <button
                type="button"
                onClick={handleStartNewMemory}
                className="min-h-[44px] px-5 rounded-full bg-[#E8925A] text-white text-xs font-medium active:scale-95 shadow-sm"
              >
                新建记忆项目
              </button>
            </SoftCard>
          )}
        </div>
      </div>

      {/* Part 3: Ideas for you (Section V) */}
      <div className="space-y-3">
        <SectionHeader title="Ideas for you" />

        <div className="grid grid-cols-2 gap-3">
          {/* Idea 1: Explore memories */}
          <div
            onClick={() => onNavigateTab ? onNavigateTab('create') : (activeProject && onOpenProject(activeProject.id))}
            className="p-4 rounded-[24px] bg-white border border-[#72C9A3]/25 shadow-xs hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#DDF3E9] text-[#2B7354] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display text-[15px] font-bold text-[#17171B]">
                Explore memories
              </h4>
              <p className="text-[11px] text-[#747078] mt-0.5 leading-snug">
                让 Bloub 自动巡视相册并锁定建筑立面
              </p>
            </div>
          </div>

          {/* Idea 2: Make stickers */}
          <div
            onClick={() => activeProject ? onOpenProject(activeProject.id) : handleStartNewMemory()}
            className="p-4 rounded-[24px] bg-white border border-[#E8925A]/25 shadow-xs hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#F8E2D4] text-[#93491E] flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display text-[15px] font-bold text-[#17171B]">
                Make stickers
              </h4>
              <p className="text-[11px] text-[#747078] mt-0.5 leading-snug">
                提取照片主体并生成黑白线稿贴纸
              </p>
            </div>
          </div>

          {/* Idea 3: Create a page */}
          <div
            onClick={() => activeProject ? onOpenCollage(activeProject.id) : handleStartNewMemory()}
            className="p-4 rounded-[24px] bg-white border border-[#9684DF]/25 shadow-xs hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#E7E1FA] text-[#55429E] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display text-[15px] font-bold text-[#17171B]">
                Create a page
              </h4>
              <p className="text-[11px] text-[#747078] mt-0.5 leading-snug">
                自由拖拽素材在纸张画布上拼贴手账
              </p>
            </div>
          </div>

          {/* Idea 4: Review journal */}
          <div
            onClick={() => onOpenJournalReview?.()}
            className="p-4 rounded-[24px] bg-white border border-[#91AEE8]/25 shadow-xs hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#DFE8FA] text-[#34579E] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display text-[15px] font-bold text-[#17171B]">
                Review journal
              </h4>
              <p className="text-[11px] text-[#747078] mt-0.5 leading-snug">
                拍下实体手账本，获取留白与版面优化建议
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
