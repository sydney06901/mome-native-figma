import React from 'react';

export interface SoftCardProps {
  variant?: 'white' | 'interactive' | 'mint' | 'lavender' | 'peach';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  children: React.ReactNode;
}

export const SoftCard: React.FC<SoftCardProps> = ({
  variant = 'white',
  padding = 'md',
  onClick,
  className = '',
  children,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-3.5',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8',
  }[padding];

  const variantStyles = {
    white: 'bg-white border-[#2a2336]/[0.06] shadow-[0_4px_16px_rgba(42,35,54,0.03)]',
    interactive:
      'bg-white border-[#2a2336]/[0.06] shadow-[0_4px_16px_rgba(42,35,54,0.03)] hover:border-[#2a2336]/[0.12] hover:shadow-[0_6px_20px_rgba(42,35,54,0.06)] active:scale-[0.99] cursor-pointer transition-all duration-200',
    mint: 'bg-gradient-to-br from-[#EBF7F1] to-white border-[#72C9A3]/25 shadow-sm',
    lavender: 'bg-gradient-to-br from-[#EFEAFC] to-white border-[#9684DF]/25 shadow-sm',
    peach: 'bg-gradient-to-br from-[#FDF0E7] to-white border-[#E8925A]/25 shadow-sm',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-[24px] border ${variantStyles} ${paddingStyles} ${className}`}
    >
      {children}
    </div>
  );
};
