import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

import { AgentBubble } from '../components/AgentBubble';
import { MomeAgent } from '../components/MomeAgent';

interface GenerationPageProps {
  status: 'preparing' | 'generating' | 'error';
  message?: string;
  onRetry: () => void;
  onBack: () => void;
}

export function GenerationPage({ status, message, onRetry, onBack }: GenerationPageProps) {
  const failed = status === 'error';
  return (
    <section className="flex min-h-dvh flex-col px-5 pb-12 pt-[max(18px,env(safe-area-inset-top))] sm:min-h-[884px]">
      <button type="button" onClick={onBack} className="grid size-11 place-items-center rounded-full" aria-label="Back"><ArrowLeft /></button>
      <div className="flex flex-1 flex-col items-center justify-center pb-24 text-center">
        <div className="mb-8 flex items-center gap-3">
          <MomeAgent state={failed ? 'mismatch' : 'thinking'} size={98} className={failed ? '' : 'animate-float-gentle'} />
          <AgentBubble>{failed ? 'I hit a snag. Your choices are still safe.' : 'I’m turning your memories into one printable sticker sheet…'}</AgentBubble>
        </div>
        {failed ? (
          <>
            <h1 className="font-mome-hand text-4xl">Not quite yet</h1>
            <p className="mt-4 max-w-sm break-words text-sm leading-6 text-red-700">{message || 'Image generation failed.'}</p>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={onBack} className="min-h-12 rounded-full border-2 border-black px-5 font-semibold">Back</button>
              <button type="button" onClick={onRetry} className="flex min-h-12 items-center gap-2 rounded-full bg-black px-6 font-semibold text-white"><RefreshCw size={17} />Try again</button>
            </div>
          </>
        ) : (
          <>
            <Sparkles className="mb-4 text-[#613eea]" />
            <h1 className="font-mome-hand text-4xl">Making your stickers</h1>
            <p className="mt-3 max-w-xs text-sm leading-6 opacity-55">One generation call · one 1:4 color sheet · up to five cuttable memories.</p>
            <div className="mt-8 h-2 w-56 overflow-hidden rounded-full bg-[#edeaf2]"><div className="h-full w-2/3 animate-pulse rounded-full bg-[#613eea]" /></div>
          </>
        )}
      </div>
    </section>
  );
}
