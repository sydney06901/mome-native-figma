import { useEffect, useMemo } from 'react';

import type { MomePhoto } from '../domain';

interface PhotoCardProps {
  photo: MomePhoto;
  registerPhotoElement: (photoId: string, element: HTMLElement | null) => void;
  active?: boolean;
}

export function PhotoCard({ photo, registerPhotoElement, active = false }: PhotoCardProps) {
  const url = useMemo(() => URL.createObjectURL(photo.thumbnailBlob), [photo.thumbnailBlob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <article
      ref={(element) => registerPhotoElement(photo.id, element)}
      data-photo-id={photo.id}
      className={`relative aspect-[0.92] overflow-hidden rounded-[20px] bg-[#f4f1eb] shadow-sm [content-visibility:auto] ${active ? 'ring-3 ring-[var(--mome-violet)]' : ''}`}
    >
      <img src={url} alt={photo.fileName} loading="lazy" decoding="async" className="size-full object-cover" />
    </article>
  );
}
