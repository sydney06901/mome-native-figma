import type { PropsWithChildren } from 'react';

export function AgentBubble({ children }: PropsWithChildren) {
  return (
    <div className="relative max-w-[176px] rounded-[18px] bg-[#f7f7f9] px-4 py-3 text-[17px] leading-[1.45] shadow-sm before:absolute before:-left-2 before:bottom-5 before:size-4 before:rotate-45 before:bg-[#f7f7f9]">
      {children}
    </div>
  );
}
