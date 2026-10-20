import { ArrowLeft, Heart } from 'lucide-react';

import type { MaterialStyleId } from '../domain';
import { MATERIAL_STYLE_PRESETS } from '../services/stylePresets';

interface StyleSelectionPageProps {
  selectedStyleId: MaterialStyleId | null;
  subjectCount: number;
  onSelect: (styleId: MaterialStyleId) => void;
  onConfirm: () => void;
  onBack?: () => void;
}

export function StyleSelectionPage({ selectedStyleId, subjectCount, onSelect, onConfirm, onBack }: StyleSelectionPageProps) {
  return (
    <section className="min-h-dvh px-4 pb-28 pt-[max(18px,env(safe-area-inset-top))] sm:min-h-[884px]">
      <header className="flex items-center gap-4"><button type="button" onClick={onBack} aria-label="Back"><ArrowLeft /></button><h1 className="font-mome-hand text-4xl">Pick a look!</h1></header>
      <p className="mt-2 text-sm opacity-55">One style will transform your {subjectCount} chosen subjects.</p>
      <div className="mt-8 grid grid-cols-2 gap-4">
        {MATERIAL_STYLE_PRESETS.map((preset) => (
          <button type="button" key={preset.id} aria-label={preset.label} onClick={() => onSelect(preset.id)} className={`overflow-hidden rounded-[22px] border-2 bg-white text-left shadow-md ${selectedStyleId === preset.id ? 'border-black' : 'border-transparent'}`}>
            <div className={`h-40 bg-gradient-to-br ${preset.swatch}`} />
            <div className="p-3"><h2 className="font-mome-hand text-xl">{preset.label}</h2><p className="mt-1 text-xs opacity-55">{preset.description}</p></div>
          </button>
        ))}
      </div>
      <div className="fixed inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] z-20 mx-auto w-[min(398px,calc(100%-32px))]"><button type="button" disabled={!selectedStyleId} onClick={onConfirm} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#f05a24] font-semibold text-white shadow-xl disabled:opacity-35"><Heart size={20} />Make my stickers!!</button></div>
    </section>
  );
}
