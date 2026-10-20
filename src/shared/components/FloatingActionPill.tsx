import React from 'react';

export interface FloatingActionPillProps {
  variant?: 'peach' | 'mint' | 'lavender' | 'primary';
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FloatingActionPill: React.FC<FloatingActionPillProps> = ({
  variant = 'peach',
  onClick,
  disabled = false,
  icon,
  children,
  className = '',
}) => {
  const variantStyles = {
    peach: 'bg-[#E8925A] hover:bg-[#d8824a] text-white shadow-[0_8px_20px_rgba(232,146,90,0.35)]',
    mint: 'bg-[#2B7354] hover:bg-[#235f45] text-white shadow-[0_8px_20px_rgba(43,115,84,0.3)]',
    lavender: 'bg-[#55429E] hover:bg-[#473686] text-white shadow-[0_8px_20px_rgba(85,66,158,0.35)]',
    primary: 'bg-[#17171B] hover:bg-black text-white shadow-[0_8px_20px_rgba(23,23,27,0.35)]',
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-[50px] px-5 py-3 rounded-full flex items-center justify-center gap-2 text-[14px] font-semibold tracking-tight transition-all duration-200 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none cursor-pointer ${variantStyles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
