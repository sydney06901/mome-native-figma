import { useEffect, useState } from 'react';
import { ArrowUpRight, Folder, ImagePlus } from 'lucide-react';

import type { PrintableSheet } from '../domain';
import { MomeAgent } from '../components/MomeAgent';
import { MATERIAL_STYLE_PRESETS } from '../services/stylePresets';

function SheetPreview({ sheet }: { sheet: PrintableSheet }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (typeof URL.createObjectURL !== 'function') return;
    const next = URL.createObjectURL(sheet.imageBlob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [sheet.imageBlob]);
  return url ? <img src={url} alt="Saved sticker sheet" className="h-full w-full object-contain" /> : <div className="h-full w-full bg-[#f5f1fa]" />;
}

interface LibraryPageProps {
  sheets: PrintableSheet[];
  onOpen: (sheet: PrintableSheet) => void;
  onCreate: () => void;
}

export function LibraryPage({ sheets, onOpen, onCreate }: LibraryPageProps) {
  return (
    <section className="min-h-dvh px-5 pb-28 pt-[max(22px,env(safe-area-inset-top))] sm:min-h-[884px]">
      <header className="flex items-start justify-between"><span className="font-mome-hand text-[30px]">mome</span><div className="grid justify-items-center"><MomeAgent state="main" size={72} /><span className="font-mome-hand -mt-2">spark</span></div></header>
      <div className="mt-5 flex items-center gap-3"><h1 aria-label="My little collection" className="font-mome-hand text-[48px] leading-none"><span className="text-[#3486f7]">My</span> <span className="text-[#49d900]">little</span><br /><span className="text-[#f05a24]">collection</span></h1><Folder size={54} strokeWidth={1.6} /></div>
      <div className="mt-8 flex items-end justify-between border-b-4 border-[#cdb4e7] pb-2"><button className="font-mome-hand text-2xl" type="button">made with mome</button><span className="text-xs opacity-45">{sheets.length} sheets</span></div>
      {sheets.length === 0 ? (
        <button type="button" onClick={onCreate} className="mt-16 flex min-h-28 w-full items-center justify-between rounded-[22px] border-2 border-dashed border-[#d7d1de] px-6 text-left"><span><strong className="font-mome-hand text-2xl">Your shelf is waiting</strong><br /><span className="text-sm opacity-50">Make your first printable memory sheet.</span></span><ImagePlus /></button>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-5">
          {sheets.map((sheet) => (
            <button type="button" aria-label="Open sticker sheet" key={sheet.id} onClick={() => onOpen(sheet)} className="rounded-[22px] bg-gradient-to-b from-[#efe7ff] to-[#c497ff] p-3 text-left shadow-lg">
              <div className="mx-auto w-[58%] overflow-hidden rounded-lg bg-white shadow-md" style={{ aspectRatio: '1 / 4' }}><SheetPreview sheet={sheet} /></div>
              <div className="mt-3 flex items-center justify-between"><span className="font-mome-hand text-lg">{MATERIAL_STYLE_PRESETS.find((preset) => preset.id === sheet.styleId)?.label}</span><ArrowUpRight size={18} /></div>
            </button>
          ))}
        </div>
      )}
      <button type="button" onClick={onCreate} className="fixed bottom-[max(18px,env(safe-area-inset-bottom))] left-1/2 flex min-h-14 w-[min(398px,calc(100%-32px))] -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-black font-semibold text-white shadow-xl"><ImagePlus />Make another sheet</button>
    </section>
  );
}
