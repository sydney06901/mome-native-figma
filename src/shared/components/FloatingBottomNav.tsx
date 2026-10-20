import React from 'react';
import { MainTab } from '../../app/routes.ts';
import { Sparkles, Layers, Scissors, Settings } from 'lucide-react';

export interface FloatingBottomNavProps {
  activeTab: MainTab | string;
  onTabChange: (tab: MainTab) => void;
  className?: string;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  activeTab,
  onTabChange,
  className = '',
}) => {
  // Normalize legacy tab names if any
  const normalizedActive = (() => {
    if (activeTab === 'home') return 'create';
    if (activeTab === 'library') return 'memory';
    if (activeTab === 'profile') return 'settings';
    return activeTab as MainTab;
  })();

  const navItems: Array<{
    id: MainTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'create', label: '创作', icon: Sparkles },
    { id: 'memory', label: '记忆素材', icon: Layers },
    { id: 'physical', label: '我的材料', icon: Scissors },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <div
      className={`fixed bottom-3 sm:bottom-4 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none ${className}`}
    >
      <nav
        aria-label="主要导航"
        className="pointer-events-auto flex items-center bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-full border border-[#2a2336]/[0.08] shadow-[0_8px_30px_rgba(42,35,54,0.12)] gap-1 max-w-sm w-full justify-around"
      >
        {navItems.map((item) => {
          const isActive = normalizedActive === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`min-h-[44px] flex-1 flex flex-col items-center justify-center rounded-full transition-all duration-200 cursor-pointer select-none px-2 py-1 ${
                isActive
                  ? 'bg-[#17171B] text-white shadow-xs scale-[1.02]'
                  : 'text-[#747078] hover:text-[#17171B] hover:bg-[#F2F0F6]/60 active:scale-95'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                  isActive ? 'font-semibold text-white' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
