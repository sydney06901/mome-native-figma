import { ArrowUpRight, Folder, Image, Pencil, UserRound } from 'lucide-react';

import { MomeAgent } from '../components/MomeAgent';

interface MainViewPageProps {
  onStart: () => void;
  onOpenLibrary: () => void;
}

export function MainViewPage({ onStart, onOpenLibrary }: MainViewPageProps) {
  return (
    <section className="relative min-h-dvh overflow-hidden px-5 pb-24 pt-[max(22px,env(safe-area-inset-top))] sm:min-h-[884px]">
      <header className="flex items-start justify-between">
        <span className="font-mome-hand text-[30px]">mome</span>
        <button type="button" onClick={onStart} className="grid justify-items-center" aria-label="Open Memory Agent">
          <MomeAgent state="main" size={84} />
          <span className="font-mome-hand -mt-2 text-base">spark</span>
        </button>
      </header>

      <h1 className="font-mome-hand mt-4 text-[clamp(46px,13vw,56px)] leading-[1.16] tracking-tight">
        <span className="text-[var(--mome-pink)]">What</span>{' '}
        <span className="text-[#e8b92f]">are</span>{' '}
        <span className="text-[#28d708]">we</span><br />
        <span className="text-[var(--mome-blue)]">making</span>{' '}
        <span className="text-[var(--mome-orange)]">today</span> ?
      </h1>

      <div className="relative mx-auto mt-9 h-[320px] max-w-[370px]" aria-hidden="true">
        <div className="absolute left-2 top-7 h-56 w-40 -rotate-[11deg] bg-[#fafafa] shadow-xl"><div className="m-5 mt-14 h-28 rounded-[55%_45%_48%_52%] bg-[#60b276]" /></div>
        <div className="absolute right-0 top-14 h-56 w-40 rotate-[13deg] bg-[#fafafa] shadow-xl"><div className="m-5 mt-12 h-32 bg-[#f0b75e]" /></div>
        <div className="absolute left-1/2 top-20 h-56 w-36 -translate-x-1/2 -rotate-[7deg] bg-white shadow-xl"><div className="m-4 mt-10 h-36 rounded-full bg-[#ff8a5c]" /></div>
        <span className="absolute left-0 top-2 h-5 w-24 -rotate-[38deg] bg-[#188cef]" />
        <span className="absolute right-8 top-6 h-5 w-28 -rotate-[18deg] bg-[#f04b13]" />
      </div>

      <button type="button" onClick={onStart} className="mx-auto mt-2 flex w-[88%] min-h-[102px] items-end justify-between rounded-[15px] border-2 border-[var(--mome-border)] bg-white px-4 py-3 text-left shadow-[var(--mome-shadow-card)]">
        <span className="font-mome-hand self-start text-xl text-[var(--mome-muted-ink)]">a little thought...</span>
        <span className="grid size-9 place-items-center rounded bg-black text-white"><ArrowUpRight size={24} /></span>
      </button>
      <button type="button" onClick={onStart} className="font-mome-hand mx-auto mt-4 flex items-center gap-2 text-[25px] underline decoration-1 underline-offset-4">
        <Pencil /> or start with a photo <ArrowUpRight size={22} />
      </button>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-black/8 bg-white pb-[max(8px,env(safe-area-inset-bottom))] pt-3">
        <button type="button" onClick={onOpenLibrary} aria-label="Open media library" className="grid size-14 place-items-center rounded-full"><Folder size={30} strokeWidth={1.7} /></button>
        <button type="button" onClick={onStart} aria-label="Start with photos" className="grid size-14 place-items-center rounded-full ring-4 ring-[#d9c4ef]"><Image size={30} strokeWidth={1.7} /></button>
        <UserRound size={30} strokeWidth={1.7} />
      </div>
    </section>
  );
}
