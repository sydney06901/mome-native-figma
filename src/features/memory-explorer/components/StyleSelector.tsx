import React from 'react';
import { STYLE_OPTIONS, StyleOption } from '../../../services/materialGeneration/presets.ts';
import { Check, Star, Sparkles } from 'lucide-react';

interface StyleSelectorProps {
  primaryStyle: string;
  onSelectPrimaryStyle: (styleId: string) => void;
  secondaryStyles: string[];
  onToggleSecondaryStyle: (styleId: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  primaryStyle,
  onSelectPrimaryStyle,
  secondaryStyles,
  onToggleSecondaryStyle,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[11px] text-[#7c756d] px-0.5">
        <span>点击卡片设定「主风格」，点击右侧标牌添加「辅助风格 (最多2个)」</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {STYLE_OPTIONS.map((style) => {
          const isPrimary = primaryStyle === style.id;
          const isSecondary = secondaryStyles.includes(style.id);

          return (
            <div
              key={style.id}
              className={`p-3 rounded-2xl border transition-all duration-200 bg-white ${
                isPrimary
                  ? 'border-[#3b6e8c] ring-2 ring-[#3b6e8c]/25 shadow-sm'
                  : isSecondary
                  ? 'border-[#a89578] ring-1 ring-[#a89578]/40 shadow-2xs'
                  : 'border-[#eae5dc] hover:border-[#ded8cc] shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left Clickable Area: Sets as Primary */}
                <div
                  onClick={() => onSelectPrimaryStyle(style.id)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {/* Visual Preview Swatch */}
                    <div
                      className="w-4 h-4 rounded-md shrink-0 shadow-2xs border border-black/10"
                      style={{ background: style.previewBg }}
                    />
                    <h4 className="text-xs font-bold text-[#1c1a18] flex items-center gap-1.5">
                      <span>{style.name}</span>
                      {isPrimary && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#3b6e8c] text-white font-semibold">
                          主风格
                        </span>
                      )}
                      {isSecondary && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#ede6da] text-[#7c7062] font-semibold border border-[#d8cdbd]">
                          辅助
                        </span>
                      )}
                    </h4>
                  </div>

                  <p className="text-[11px] text-[#6d675e] mt-1 line-clamp-1 leading-tight">
                    {style.description}
                  </p>

                  <p className="text-[10px] text-[#9c9489] mt-0.5 truncate">
                    适于：{style.suitableTypes}
                  </p>
                </div>

                {/* Right Action: Auxiliary Style Toggle */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectPrimaryStyle(style.id)}
                    className={`min-h-[30px] px-2 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all ${
                      isPrimary
                        ? 'bg-[#3b6e8c] text-white shadow-xs'
                        : 'bg-[#faf8f5] text-[#554e44] border border-[#e4ded4] hover:bg-[#ede8df]'
                    }`}
                  >
                    {isPrimary ? <Check className="w-3 h-3 stroke-[2.5]" /> : null}
                    <span>{isPrimary ? '主风格' : '设为主风格'}</span>
                  </button>

                  {!isPrimary && (
                    <button
                      type="button"
                      disabled={!isSecondary && secondaryStyles.length >= 2}
                      onClick={() => onToggleSecondaryStyle(style.id)}
                      className={`min-h-[26px] px-2 rounded-lg text-[10px] font-medium transition-all ${
                        isSecondary
                          ? 'bg-[#946d45] text-white shadow-2xs'
                          : 'bg-white text-[#7c756d] border border-[#e8e2d6] hover:bg-[#f6f3ee] disabled:opacity-40'
                      }`}
                    >
                      {isSecondary ? '✓ 辅助风格' : '+ 设为辅助'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
