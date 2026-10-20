import React from 'react';

export interface HorizontalCardRailProps {
  itemGap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export const HorizontalCardRail: React.FC<HorizontalCardRailProps> = ({
  itemGap = 'md',
  className = '',
  children,
}) => {
  const gapStyles = {
    sm: 'gap-2.5',
    md: 'gap-3.5',
    lg: 'gap-5',
  }[itemGap];

  return (
    <div className={`-mx-4 sm:-mx-5 px-4 sm:px-5 overflow-x-auto no-scrollbar scroll-smooth py-1 ${className}`}>
      <div className={`flex items-stretch ${gapStyles}`}>
        {children}
      </div>
    </div>
  );
};
