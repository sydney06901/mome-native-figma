import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface PageHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  title,
  subtitle,
  onBack,
  rightAction,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-white/90 border border-[#2a2336]/[0.08] text-[#17171B] flex items-center justify-center hover:bg-white active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs"
              aria-label="返回"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {badge && (
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white/80 text-[#55429E] border border-[#9684DF]/20 shadow-2xs">
              {badge}
            </span>
          )}
        </div>
        {rightAction && <div className="shrink-0">{rightAction}</div>}
      </div>

      <h1 className="font-display text-[26px] sm:text-[30px] font-bold text-[#17171B] tracking-tight leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[13px] text-[#747078] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex items-end justify-between gap-3 ${className}`}>
      <div>
        <h3 className="font-display text-[17px] font-bold text-[#17171B] tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[12px] text-[#747078] mt-0.5">{subtitle}</p>
        )}
      </div>
      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-semibold text-[#55429E] hover:underline pb-0.5 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
