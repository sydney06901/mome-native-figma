import React from 'react';
import { Search, Sparkles, X } from 'lucide-react';

interface TaskInputProps {
  value: string;
  onChange: (val: string) => void;
  onQuickFill: (example: string) => void;
  disabled?: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  value,
  onChange,
  onQuickFill,
  disabled = false,
}) => {
  const exampleTasks = [
    '找出周六拍到的建筑，做成可以拼贴的线稿素材。',
    '找出街景中的招牌与立面物件',
  ];

  return (
    <div className="p-4 rounded-[26px] bg-white border border-[#2a2336]/[0.06] shadow-sm space-y-2.5">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-[#A19CA6]" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="你想从这次经历中找到什么？"
          className="w-full h-11 pl-10 pr-9 text-[14px] rounded-full bg-[#F2F0F6] border border-transparent focus:border-[#9684DF] focus:bg-white text-[#17171B] placeholder:text-[#A19CA6] outline-none transition-all"
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 w-8 h-8 flex items-center justify-center text-[#747078] hover:text-[#17171B] active:scale-90"
            aria-label="清空输入"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Prompt Shortcuts */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] text-[#747078] shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#9684DF]" /> 快捷填入:
        </span>
        {exampleTasks.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onQuickFill(ex)}
            disabled={disabled}
            className="shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-[#E7E1FA] hover:bg-[#d9d0f7] text-[#55429E] transition-colors whitespace-nowrap active:scale-95 min-h-[30px] flex items-center"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};
