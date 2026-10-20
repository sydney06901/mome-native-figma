import { useEffect, useState } from 'react';
import { Download, Folder, ImagePlus, Printer, X } from 'lucide-react';

import type { PrintableSheet } from '../domain';

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function downloadJpeg(sheet: PrintableSheet) {
  const bitmap = await createImageBitmap(sheet.imageBlob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
  canvas.toBlob((blob) => blob && triggerDownload(blob, `mome-${sheet.id}.jpg`), 'image/jpeg', 0.94);
}

export function ResultPage({ sheet, onLibrary, onCreate }: { sheet: PrintableSheet; onLibrary?: () => void; onCreate?: () => void }) {
  const [imageUrl, setImageUrl] = useState('');
  const [printOpen, setPrintOpen] = useState(false);
  useEffect(() => {
    if (typeof URL.createObjectURL !== 'function') return;
    const url = URL.createObjectURL(sheet.imageBlob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [sheet.imageBlob]);
  return (
    <section className="min-h-dvh px-5 pb-32 pt-[max(24px,env(safe-area-inset-top))] text-center sm:min-h-[884px]">
      <div className="mb-5 flex justify-between">
        <button type="button" onClick={onLibrary} className="flex min-h-11 items-center gap-2 rounded-full bg-[#f5f1fa] px-4 text-sm font-semibold"><Folder size={17} />Collection</button>
        <button type="button" onClick={onCreate} className="flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold"><ImagePlus size={17} />New</button>
      </div>
      <p className="font-mome-hand text-xl text-[#613eea]">Made from your memories</p>
      <h1 className="mt-1 font-mome-hand text-4xl">Your sticker sheet!</h1>
      <p className="mt-2 text-sm opacity-55">Color PNG · 1:4 · 2K · designed for a 58 mm print width</p>
      <div className="mx-auto mt-7 w-[58mm] max-w-full overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-xl" style={{ aspectRatio: '1 / 4' }}>
        {imageUrl && <img src={imageUrl} alt="Generated Mome printable sticker sheet" className="h-full w-full object-contain" />}
      </div>
      <div className="fixed inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] z-20 mx-auto grid w-[min(398px,calc(100%-32px))] grid-cols-3 gap-2 rounded-[24px] bg-white p-2 shadow-2xl">
        <button type="button" onClick={() => triggerDownload(sheet.imageBlob, `mome-${sheet.id}.png`)} className="flex min-h-12 items-center justify-center gap-1 rounded-[18px] bg-[#f2efff] text-xs font-semibold"><Download size={16} />Download PNG</button>
        <button type="button" onClick={() => void downloadJpeg(sheet)} className="flex min-h-12 items-center justify-center gap-1 rounded-[18px] bg-[#fff3e9] text-xs font-semibold"><Download size={16} />Download JPG</button>
        <button type="button" onClick={() => setPrintOpen(true)} className="flex min-h-12 items-center justify-center gap-1 rounded-[18px] bg-black text-xs font-semibold text-white"><Printer size={16} />Print</button>
      </div>
      {printOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-6">
          <div className="relative max-w-sm rounded-[28px] bg-white p-7 text-left shadow-2xl">
            <button type="button" onClick={() => setPrintOpen(false)} aria-label="Close" className="absolute right-4 top-4 grid size-10 place-items-center"><X /></button>
            <Printer size={34} className="text-[#ff8951]" />
            <h2 className="mt-4 font-mome-hand text-3xl">Wi-Fi printing comes next</h2>
            <p className="mt-3 text-sm leading-6 opacity-65">The Raspberry Pi print-task connection is intentionally not connected in this build. Your printable sheet is ready to download now.</p>
          </div>
        </div>
      )}
    </section>
  );
}
