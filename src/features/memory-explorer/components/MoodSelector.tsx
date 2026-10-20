import React, { useState } from 'react';
import { MOOD_OPTIONS, MoodOption } from '../../../services/materialGeneration/presets.ts';
import { Check, Sparkles, Heart } from 'lucide-react';

interface MoodSelectorProps {
  selectedMood: string;
  onSelectMood: (moodIdOrTitle: string) => void;
  customMoodText: string;
  onChangeCustomMood: (text: string) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  customMoodText,
  onChangeCustomMood,
}) => {
  const [isCustomActive, setIsCustomActive] = useState(
    selectedMood === 'custom' || (!MOOD_OPTIONS.some((m) => m.id === selectedMood) && !!customMoodText)
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2.5">
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMood === mood.id && !isCustomActive;

          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => {
                setIsCustomActive(false);
                onSelectMood(mood.id);
              }}
              className={`w-full min-h-[58px] p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 active:scale-[0.99] ${
                isSelected
                  ? 'border-[#3b6e8c] bg-white ring-2 ring-[#3b6e8c]/25 shadow-sm'
                  : 'border-[#eae5dc] bg-white/80 hover:bg-white hover:border-[#ded8cc] shadow-2xs'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1c1a18]">{mood.title}</span>
                  {/* 3 color palette dots */}
                  <div className="flex items-center gap-1">
                    {mood.palette.map((color, cIdx) => (
                      <span
                        key={cIdx}
                        className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-[#7c756d] mt-0.5 truncate leading-tight">
                  {mood.description}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-[#3b6e8c] text-white shadow-xs' : 'border border-[#ded8cc] bg-[#faf8f5]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
              </div>
            </button>
          );
        })}

        {/* 6. Custom Mood Option */}
        <div
          onClick={() => {
            setIsCustomActive(true);
            onSelectMood('custom');
          }}
          className={`w-full p-3 rounded-2xl border transition-all duration-200 ${
            isCustomActive
              ? 'border-[#3b6e8c] bg-white ring-2 ring-[#3b6e8c]/25 shadow-sm'
              : 'border-[#eae5dc] bg-white/80 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e09867]" />
              <span className="text-xs font-bold text-[#1c1a18]">自定义心情</span>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                isCustomActive ? 'bg-[#3b6e8c] text-white' : 'border border-[#ded8cc]'
              }`}
            >
              {isCustomActive && <Check className="w-3 h-3 stroke-[2.5]" />}
            </div>
          </div>
          <p className="text-[10px] text-[#8e877e] mb-2">写下此刻独一无二的情绪、天气或散步随想</p>
          <input
            type="text"
            value={customMoodText}
            onChange={(e) => {
              onChangeCustomMood(e.target.value);
              setIsCustomActive(true);
              onSelectMood('custom');
            }}
            placeholder="例如：秋天下午独自散步，有一点孤独但很舒服..."
            className="w-full min-h-[38px] px-3 rounded-xl bg-[#faf8f5] border border-[#e4ded4] text-xs text-[#1c1a18] placeholder:text-[#a8a196] focus:outline-none focus:bg-white focus:border-[#3b6e8c]"
          />
        </div>
      </div>
    </div>
  );
};
