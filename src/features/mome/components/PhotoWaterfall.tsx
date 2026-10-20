import type { MomePhoto } from '../domain';
import { PhotoCard } from './PhotoCard';

interface PhotoWaterfallProps {
  photos: MomePhoto[];
  registerPhotoElement: (photoId: string, element: HTMLElement | null) => void;
  activePhotoId?: string;
}

export function PhotoWaterfall({ photos, registerPhotoElement, activePhotoId }: PhotoWaterfallProps) {
  return (
    <div data-testid="photo-waterfall" className="grid grid-cols-2 gap-3 px-4 pb-28">
      {photos.map((photo) => <PhotoCard key={photo.id} photo={photo} registerPhotoElement={registerPhotoElement} active={photo.id === activePhotoId} />)}
    </div>
  );
}
