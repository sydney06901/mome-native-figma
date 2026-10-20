import React from 'react';
import { Project } from '../../domain/types.ts';
import { Sparkles, ArrowRight, Eye } from 'lucide-react';

interface CreateTabProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onOpenCollage: (projectId: string) => void;
  onCreateNewProject: (name: string, isDemo?: boolean) => Promise<Project>;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onImportUserPhotos: (projectId: string, files: FileList) => Promise<void>;
  onOpenJournalReview?: () => void;
  onOpenPrintSimulator?: () => void;
}

export const CreateTab: React.FC<CreateTabProps> = ({
  projects,
  onOpenProject,
  onCreateNewProject,
}) => {
  const activeProj = projects[0];

  const handleStartExplore = async () => {
    if (activeProj) {
      onOpenProject(activeProj.id);
    } else {
      const projectName = `我的手账记忆 · ${new Date().toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      })}`;
      const newProj = await onCreateNewProject(projectName, false);
      onOpenProject(newProj.id);
    }
  };

  return (
    <div className="space-y-6 pt-4 px-4 select-none">
      {/* Top Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1c1a18]/5 text-[#7c756d] text-[11px] font-medium tracking-wide">
          <Sparkles className="w-3 h-3 text-[#3b6e8c]" />
          <span>创作 · Create</span>
        </div>
        <h1 className="text-xl font-bold text-[#1c1a18] tracking-tight">
          从记忆中开启手账创作
        </h1>
        <p className="text-xs text-[#7c756d] leading-relaxed">
          让 AI 帮你重新审视日常相片，寻找适合做成拼贴素材的片段。
        </p>
      </div>

      {/* Primary Feature: 探索记忆 */}
      <div className="rounded-3xl bg-gradient-to-br from-[#ffffff] to-[#f7f5ef] border border-[#e8e2d6] p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block text-[10px] font-semibold tracking-wider text-[#3b6e8c] uppercase bg-[#3b6e8c]/10 px-2 py-0.5 rounded-full">
              AI Memory Explorer
            </span>
            <h2 className="text-lg font-bold text-[#1c1a18] tracking-tight">
              探索记忆
            </h2>
            <p className="text-xs text-[#6e6860] leading-relaxed">
              让 Gemini 浏览你的真实照片，寻找值得转化成手账素材的记忆。
            </p>
          </div>

          {/* Organic Bloub-inspired Illustration */}
          <div className="relative w-14 h-14 rounded-2xl bg-[#ddf3e9] flex items-center justify-center border border-[#72c9a3]/30 shrink-0 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-[#72c9a3] flex items-center justify-center animate-pulse">
              <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#2b7354]" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 text-[11px] text-[#635c54]">
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#f4efe6]/60 border border-[#eae3d5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b6e8c]" />
            <span>支持高达 300 张照片</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#f4efe6]/60 border border-[#eae3d5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
            <span>Gemini 多模态画面理解</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleStartExplore}
          className="w-full min-h-[48px] rounded-2xl bg-[#1c1a18] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>开始探索记忆</span>
          <ArrowRight className="w-4 h-4 text-[#eed8be]" />
        </button>
      </div>
    </div>
  );
};
