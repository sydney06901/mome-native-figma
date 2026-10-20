import { ArrowLeft, Pause, Play, Sparkles } from 'lucide-react';

import { FloatingMomeCursor } from '../components/FloatingMomeCursor';
import { MomeAgent } from '../components/MomeAgent';
import { PhotoWaterfall } from '../components/PhotoWaterfall';
import type { MomePhoto } from '../domain';
import type { ReviewPhase } from '../review/visualReviewPlayer';

interface ExplorationPageProps {
  photos: MomePhoto[];
  rejectedCount?: number;
  registerPhotoElement: (photoId: string, element: HTMLElement | null) => void;
  onStartReview?: () => void;
  onBack?: () => void;
  currentPhotoId?: string;
  cursorPhase?: ReviewPhase;
  targetElement?: HTMLElement | null;
  reviewActive?: boolean;
  reviewedCount?: number;
  matchedCount?: number;
  paused?: boolean;
  onPauseToggle?: () => void;
  onSkip?: () => void;
  onStop?: () => void;
}

export function ExplorationPage({ photos, rejectedCount = 0, registerPhotoElement, onStartReview, onBack, currentPhotoId, cursorPhase = 'travelling', targetElement = null, reviewActive = false, reviewedCount = 0, matchedCount = 0, paused = false, onPauseToggle, onSkip, onStop }: ExplorationPageProps) {
  return (
    <section className="min-h-dvh bg-white pb-[max(20px,env(safe-area-inset-bottom))] sm:min-h-[884px]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/8 bg-white/95 px-4 pb-3 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur">
        <button type="button" onClick={onBack} aria-label="Back"><ArrowLeft /></button>
        <div className="text-center"><h1 className="font-mome-hand text-2xl">Memory Explorer</h1><p className="text-xs opacity-55">{photos.length} photos ready</p></div>
        <MomeAgent state="thinking" size={52} />
      </header>
      {rejectedCount > 0 && <p role="status" className="mx-4 my-3 rounded-xl bg-[#fff4dc] px-3 py-2 text-sm">{rejectedCount} photos were not imported.</p>}
      {reviewActive && (
        <div className="sticky top-[74px] z-20 mx-4 my-3 flex items-center gap-2 rounded-full border border-black/8 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
          <MomeAgent state={cursorPhase === 'thinking' ? 'thinking' : cursorPhase === 'matched' ? 'match' : 'describing'} size={42} />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Mome is exploring…</p><p className="text-xs opacity-55">{reviewedCount} / {photos.length} reviewed · {matchedCount} found</p></div>
          <button type="button" aria-label={paused ? 'Resume review' : 'Pause review'} onClick={onPauseToggle} className="grid size-9 place-items-center rounded-full bg-black/5">{paused ? <Play size={16} /> : <Pause size={16} />}</button>
          <button type="button" onClick={onSkip} className="text-xs font-semibold">Skip</button>
          <button type="button" onClick={onStop} className="text-xs text-red-600">Stop</button>
        </div>
      )}
      <PhotoWaterfall photos={photos} registerPhotoElement={registerPhotoElement} activePhotoId={currentPhotoId} />
      <FloatingMomeCursor phase={cursorPhase} targetElement={targetElement} visible={reviewActive && Boolean(currentPhotoId)} />
      <div className="fixed inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] z-20 mx-auto w-[min(398px,calc(100%-32px))]">
        {!reviewActive && <button type="button" onClick={onStartReview} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-black px-6 font-semibold text-white shadow-xl"><Sparkles size={20} />Start AI review</button>}
      </div>
    </section>
  );
}
