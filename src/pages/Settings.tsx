import React, { useState } from 'react';
import { PageHeader } from '../shared/components/PageHeader.tsx';
import { SoftCard } from '../shared/components/SoftCard.tsx';
import {
  Smartphone,
  Cloud,
  Trash2,
  CheckCircle2,
  RotateCcw,
  User,
  Heart,
  Palette,
  ShieldCheck,
} from 'lucide-react';

interface SettingsProps {
  onResetAllData: () => Promise<void>;
  onGoToHome: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onResetAllData, onGoToHome }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = async () => {
    if (
      confirm(
        '确定要清除本地保存的所有项目、素材与画布草稿吗？\n（注：这不会删除您 iPhone 系统的原图相册）'
      )
    ) {
      setIsResetting(true);
      try {
        await onResetAllData();
        setResetDone(true);
        setTimeout(() => {
          setResetDone(false);
          onGoToHome();
        }, 1200);
      } catch (err) {
        alert('重置失败');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-5 pb-32 pt-2">
      {/* Top Header */}
      <PageHeader
        badge="Profile & Settings"
        title="Settings & Profile"
        subtitle="Manage your memory workspace, local IndexedDB storage, and AI assistant preferences."
      />

      {/* User / Persona Card */}
      <SoftCard variant="white" padding="md" className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E7E1FA] to-[#DDF3E9] flex items-center justify-center text-[#55429E] shadow-sm shrink-0 border border-white">
          <User className="w-7 h-7 stroke-[1.8]" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[17px] font-bold text-[#17171B]">手账记忆探索者</h3>
            <span className="text-[10px] font-semibold text-[#2B7354] bg-[#DDF3E9] px-2 py-0.5 rounded-full border border-[#72C9A3]/30">
              Bloub 伴侣
            </span>
          </div>
          <p className="text-[12px] text-[#747078] truncate">
            记录生活细碎 · 探索街角建筑与光影
          </p>
        </div>
      </SoftCard>

      {/* Current Running Mode Card */}
      <SoftCard variant="white" padding="md" className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-display text-[15px] font-bold text-[#17171B]">当前运行模式</span>
          <span className="text-[11px] font-mono text-[#2B7354] bg-[#DDF3E9] px-2.5 py-0.5 rounded-full font-semibold border border-[#72C9A3]/30">
            原生体验演示模式
          </span>
        </div>
        <p className="text-[13px] text-[#747078] leading-relaxed">
          采用浅灰紫与柔和编辑感设计系统，支持真实相册导入、低分辨率缩略图流式缓冲、Bloub AI 情感光标巡视、矩形原图裁剪以及 1200×1600 px 手账画布排版导出。
        </p>
      </SoftCard>

      {/* Photo Privacy & Authorization Boundaries */}
      <SoftCard variant="white" padding="md" className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#DFE8FA] text-[#34579E] flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <h3 className="font-display text-[15px] font-bold text-[#17171B]">相册与隐私保障</h3>
        </div>
        <div className="text-[12px] text-[#747078] space-y-2 leading-relaxed">
          <p>
            • <strong>设备端优先</strong>：所有图片均在浏览器端生成低内存缩略图，避免 200 张照片时移动设备内存溢出。
          </p>
          <p>
            • <strong>数据持久化</strong>：项目与素材保存在本地 IndexedDB 中，离线即可翻阅回顾，隐私绝不未经授权上传。
          </p>
        </div>
      </SoftCard>

      {/* Cloud AI Integration Specification */}
      <SoftCard variant="white" padding="md" className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#DDF3E9] text-[#2B7354] flex items-center justify-center shrink-0">
            <Cloud className="w-4 h-4" />
          </div>
          <h3 className="font-display text-[15px] font-bold text-[#17171B]">AI 服务端点状态</h3>
        </div>
        <div className="p-3 bg-[#FBFAFD] rounded-[18px] border border-[#2a2336]/[0.05] text-[12px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#747078]">服务端代理</span>
            <span className="font-mono text-[#17171B] font-semibold">/api/gemini/analyze-batch</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#747078]">当前状态</span>
            <span className="text-[#2B7354] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#72C9A3]" />
              就绪 (支持无缝回退本地)
            </span>
          </div>
        </div>
      </SoftCard>

      {/* Data Persistence & Reset */}
      <SoftCard variant="white" padding="md" className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#FDF5F5] text-[#C86666] flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <h3 className="font-display text-[15px] font-bold text-[#17171B]">本地数据管理</h3>
        </div>
        <p className="text-[12px] text-[#747078] leading-relaxed">
          如需重置所有新建项目、线稿贴纸与画布草稿并恢复出厂演示状态，可点击下方按钮。
        </p>

        {resetDone && (
          <div className="p-3 rounded-full bg-[#DDF3E9] text-[#2B7354] text-xs font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>已成功重置所有本地演示数据</span>
          </div>
        )}

        <button
          type="button"
          disabled={isResetting}
          onClick={handleReset}
          className="w-full min-h-[46px] rounded-full bg-[#FDF5F5] hover:bg-[#FBE8E8] text-[#8E3232] text-xs font-medium flex items-center justify-center gap-1.5 border border-[#C86666]/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? '正在重置...' : '清除本地数据并重置演示'}</span>
        </button>
      </SoftCard>
    </div>
  );
};
