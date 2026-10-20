import { ArrowLeft, ArrowUp, Check } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { MomeAgent } from '../components/MomeAgent';
import type { MaterialSubject, MomePhoto } from '../domain';

function SubjectRow({ subject, photo, disabled, onToggle, onMoveUp }: { subject: MaterialSubject; photo?: MomePhoto; disabled: boolean; onToggle: () => void; onMoveUp: () => void }) {
  const url = useMemo(() => photo ? URL.createObjectURL(photo.thumbnailBlob) : '', [photo]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return (
    <article className={`flex items-center gap-3 rounded-[18px] border p-3 ${subject.enabled ? 'border-[#527999] bg-[#f5f9fc]' : 'border-black/10 bg-white'}`}>
      {url ? <img src={url} alt="" className="size-16 rounded-xl object-cover" /> : <div className="size-16 rounded-xl bg-black/5" />}
      <div className="min-w-0 flex-1"><h3 className="font-semibold">{subject.label}</h3><p className="truncate text-xs opacity-55">{subject.description}</p></div>
      <button type="button" aria-label={`Move ${subject.label} up`} onClick={onMoveUp} className="grid size-9 place-items-center rounded-full bg-black/5"><ArrowUp size={16} /></button>
      <label className="grid size-10 place-items-center rounded-full bg-black/5">
        <input type="checkbox" aria-label={subject.label} className="sr-only" checked={subject.enabled} disabled={disabled} onChange={onToggle} />
        {subject.enabled && <Check size={20} />}
      </label>
    </article>
  );
}

interface SubjectSelectionPageProps {
  photos: MomePhoto[];
  subjects: MaterialSubject[];
  onChange: (subjects: MaterialSubject[]) => void;
  onConfirm: () => void;
  onBack?: () => void;
}

export function SubjectSelectionPage({ photos, subjects, onChange, onConfirm, onBack }: SubjectSelectionPageProps) {
  const enabledCount = subjects.filter((subject) => subject.enabled).length;
  const photoById = new Map(photos.map((photo) => [photo.id, photo]));
  return (
    <section className="min-h-dvh px-4 pb-28 pt-[max(18px,env(safe-area-inset-top))] sm:min-h-[884px]">
      <header className="flex items-center justify-between"><button type="button" onClick={onBack} aria-label="Back"><ArrowLeft /></button><span className="font-mome-hand text-2xl">Choose your memories</span><MomeAgent state="match" size={54} /></header>
      <div className="my-5 rounded-[18px] bg-[#fff8ee] p-4"><h1 className="font-mome-hand text-3xl">I found these!</h1><p className="mt-1 text-sm opacity-60">Keep up to five main subjects for one printable sheet.</p><p className="mt-3 font-semibold">{enabledCount} / 5 selected</p></div>
      <div className="space-y-3">
        {subjects.map((subject, index) => (
          <SubjectRow
            key={subject.id}
            subject={subject}
            photo={photoById.get(subject.sourcePhotoId)}
            disabled={!subject.enabled && enabledCount >= 5}
            onToggle={() => onChange(subjects.map((item) => item.id === subject.id ? { ...item, enabled: !item.enabled } : item))}
            onMoveUp={() => {
              if (index === 0) return;
              const next = [...subjects];
              [next[index - 1], next[index]] = [next[index], next[index - 1]];
              onChange(next.map((item, order) => ({ ...item, order })));
            }}
          />
        ))}
      </div>
      <div className="fixed inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] z-20 mx-auto w-[min(398px,calc(100%-32px))]"><button type="button" disabled={enabledCount === 0 || enabledCount > 5} onClick={onConfirm} className="min-h-14 w-full rounded-full bg-black font-semibold text-white shadow-xl disabled:opacity-35">Next: choose a style</button></div>
    </section>
  );
}
