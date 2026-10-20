import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface IllustratedActionCardProps {
  theme: 'mint' | 'peach' | 'lavender';
  tag: string;
  title: string;
  description: string;
  onClick: () => void;
  illustrationNode: React.ReactNode;
  className?: string;
}

export const IllustratedActionCard: React.FC<IllustratedActionCardProps> = ({
  theme,
  tag,
  title,
  description,
  onClick,
  illustrationNode,
  className = '',
}) => {
  const themeStyles = {
    mint: {
      card: 'bg-gradient-to-br from-[#EBF7F1] via-[#F4FAF6] to-[#FAF9FD] border-[#72C9A3]/30 hover:border-[#72C9A3]/50',
      tag: 'bg-white/90 text-[#2B7354] border-[#72C9A3]/25',
      arrow: 'bg-[#DDF3E9] text-[#2B7354]',
    },
    peach: {
      card: 'bg-gradient-to-br from-[#FDF0E7] via-[#FAF3EC] to-[#FAF9FD] border-[#E8925A]/30 hover:border-[#E8925A]/50',
      tag: 'bg-white/90 text-[#93491E] border-[#E8925A]/25',
      arrow: 'bg-[#F8E2D4] text-[#93491E]',
    },
    lavender: {
      card: 'bg-gradient-to-br from-[#EFEAFC] via-[#F6F3FD] to-[#FAF9FD] border-[#9684DF]/30 hover:border-[#9684DF]/50',
      tag: 'bg-white/90 text-[#55429E] border-[#9684DF]/25',
      arrow: 'bg-[#E7E1FA] text-[#55429E]',
    },
  }[theme];

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-[28px] p-5 border shadow-[0_4px_20px_rgba(42,35,54,0.04)] cursor-pointer transition-all duration-200 active:scale-[0.985] ${themeStyles.card} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs ${themeStyles.tag}`}>
            {tag}
          </span>
          <h3 className="font-display text-[18px] sm:text-[20px] font-bold text-[#17171B] tracking-tight">
            {title}
          </h3>
          <p className="text-[13px] text-[#747078] leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-center gap-3">
          <div className="transition-transform duration-300 group-hover:scale-105">
            {illustrationNode}
          </div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5 ${themeStyles.arrow}`}>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
