import React from 'react';
import { CursorVisualState } from '../../../domain/types.ts';

export interface BloubAvatarViewProps {
  visualState: CursorVisualState;
  speed?: 'normal' | 'fast';
  currentReason?: string;
  confidence?: number;
  prefersReducedMotion?: boolean;
}

export const BloubAvatarView: React.FC<BloubAvatarViewProps> = ({
  visualState,
  currentReason,
  confidence,
  prefersReducedMotion = false,
}) => {
  // Emotional color theme based on visual state
  const getTheme = () => {
    switch (visualState) {
      case 'thinking':
        return {
          bg: 'bg-[#d97706]', // amber/orange
          shadow: 'shadow-[#d97706]/40',
          halo: 'bg-[#d97706]/25',
          scale: 1.08,
          label: '正在理解画面内容',
        };
      case 'matched':
      case 'confirming':
      case 'celebrating':
        return {
          bg: 'bg-[#15803d]', // emerald/green
          shadow: 'shadow-[#15803d]/40',
          halo: 'bg-[#15803d]/30',
          scale: 1.15,
          label: confidence ? `符合要求 · ${Math.round(confidence * 100)}%` : '已选入手账候选',
        };
      case 'paused':
        return {
          bg: 'bg-[#eab308]', // warm yellow
          shadow: 'shadow-[#eab308]/40',
          halo: 'bg-[#eab308]/20',
          scale: 1.0,
          label: 'AI 巡视已暂停',
        };
      case 'confused':
        return {
          bg: 'bg-[#e11d48]', // rose red
          shadow: 'shadow-[#e11d48]/40',
          halo: 'bg-[#e11d48]/25',
          scale: 1.02,
          label: '未识别到明显特征',
        };
      case 'travelling':
        return {
          bg: 'bg-[#7c3aed]', // lavender / violet
          shadow: 'shadow-[#7c3aed]/35',
          halo: 'bg-[#7c3aed]/20',
          scale: 0.98,
          label: currentReason || '正在前往下一张照片',
        };
      case 'observing':
      default:
        return {
          bg: 'bg-[#3b6e8c]', // theme slate/blue
          shadow: 'shadow-[#3b6e8c]/35',
          halo: 'bg-[#3b6e8c]/20',
          scale: 1.02,
          label: currentReason || 'AI 正在细细观察',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="relative flex items-center gap-2 select-none pointer-events-none">
      {/* Organic AI Avatar Shell */}
      <div
        className={`relative w-8 h-8 rounded-full ${theme.bg} text-white flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/90 transition-colors duration-300`}
      >
        {/* Subtle breathing halo */}
        <div
          className={`absolute -inset-1 rounded-full ${theme.halo} ${
            prefersReducedMotion ? '' : 'animate-pulse'
          }`}
        />

        {/* Expressive Digital Eyes */}
        <div className="relative z-10 flex items-center gap-1">
          <div
            className={`w-1.5 h-1.5 rounded-full bg-white transition-all duration-200 ${
              visualState === 'thinking' && !prefersReducedMotion
                ? 'animate-bounce'
                : visualState === 'matched'
                ? 'scale-125 bg-[#fef08a]'
                : 'bg-white'
            }`}
          />
          <div
            className={`w-1.5 h-1.5 rounded-full bg-white transition-all duration-200 ${
              visualState === 'thinking' && !prefersReducedMotion
                ? 'animate-bounce delay-75'
                : visualState === 'matched'
                ? 'scale-125 bg-[#fef08a]'
                : 'bg-white'
            }`}
          />
        </div>

        {/* Serene mouth line */}
        <div
          className={`absolute bottom-2 w-2 h-[1px] bg-white/70 rounded-full transition-transform ${
            visualState === 'matched' ? 'scale-x-125 translate-y-[0.5px]' : ''
          }`}
        />

        {/* Status beacon dot */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
            visualState === 'matched'
              ? 'bg-[#4ade80]'
              : visualState === 'thinking'
              ? 'bg-[#fbbf24]'
              : 'bg-white'
          }`}
        />
      </div>

      {/* Floating Status Tooltip Pill */}
      <div className="flex flex-col bg-[#1c1a18]/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium shadow-md border border-white/20 whitespace-nowrap max-w-[180px] truncate animate-in fade-in duration-200">
        <div className="flex items-center gap-1 truncate">
          {visualState === 'matched' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shrink-0" />
          )}
          {visualState === 'thinking' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-ping shrink-0" />
          )}
          {visualState === 'observing' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shrink-0" />
          )}
          <span className="truncate">{theme.label}</span>
        </div>
      </div>
    </div>
  );
};
