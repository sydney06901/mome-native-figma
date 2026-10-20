import type { PropsWithChildren } from 'react';

export function MobileShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh bg-[var(--mome-canvas)] sm:px-4 sm:py-6">
      <main className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-hidden bg-[var(--mome-paper)] text-[var(--mome-ink)] sm:min-h-[calc(100dvh-3rem)] sm:rounded-[var(--mome-radius-phone)] sm:shadow-[var(--mome-shadow-lifted)]">
        {children}
      </main>
    </div>
  );
}
