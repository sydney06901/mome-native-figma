import React from 'react';
import { MainTab } from './routes.ts';
import { ErrorBoundary } from '../shared/components/ErrorBoundary.tsx';
import { FloatingBottomNav } from '../shared/components/FloatingBottomNav.tsx';

interface AppLayoutProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  hideTabBar?: boolean;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onTabChange,
  hideTabBar = false,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#ede8df] text-[#1c1a18] antialiased flex flex-col items-center justify-start">
      {/* Centered Single Mobile Viewport (No desktop dashboards, no fake phone frames) */}
      <div className="mobile-app-shell flex flex-col justify-between shadow-2xl">
        {/* Main Content Area with safe area support */}
        <main className="flex-1 pb-24 pt-safe">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        {/* Floating Capsule Bottom Navigation */}
        {!hideTabBar && (
          <div className="sticky bottom-0 z-40 pb-safe">
            <FloatingBottomNav
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
