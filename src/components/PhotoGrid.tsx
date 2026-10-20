import React from 'react';
import { PhotoItem } from '../models/PhotoItem.ts';
import { Check } from 'lucide-react';

interface PhotoGridProps {
  photos: PhotoItem[];
  selectedPhotoIds: string[];
  activeScanPhotoId?: string | null;
  onToggleSelect: (photoId: string) => void;
  onPhotoClick?: (photo: PhotoItem) => void;
  isSelectMode?: boolean;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  selectedPhotoIds,
  activeScanPhotoId,
  onToggleSelect,
  onPhotoClick,
  isSelectMode = true,
}) => {
  if (photos.length === 0) {
    return (
      <div className="py-12 px-5 text-center text-[#7c756d]">
        <p className="text-sm">暂无照片，请先导入照片或打开示例项目</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 pb-4">
      {photos.map((photo) => {
        const isSelected = selectedPhotoIds.includes(photo.id);
        const isScanningCurrent = activeScanPhotoId === photo.id;

        return (
          <div
            key={photo.id}
            onClick={() => {
              if (onPhotoClick) {
                onPhotoClick(photo);
              } else {
                onToggleSelect(photo.id);
              }
            }}
            className={`group relative aspect-square rounded-2xl overflow-hidden bg-[#eeebe5] cursor-pointer transition-all border ${
              isScanningCurrent
                ? 'ring-2 ring-[#3b6e8c] border-[#3b6e8c] scale-[0.98]'
                : isSelected
                ? 'border-[#3b6e8c] shadow-sm'
                : 'border-[#e8e4dc] hover:border-[#cfc9bf]'
            }`}
          >
            {/* Image */}
            <img
              src={photo.url}
              alt={photo.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            {/* Scanning Focus Scanner Overlay */}
            {isScanningCurrent && (
              <div className="absolute inset-0 bg-[#3b6e8c]/15 pointer-events-none flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-white border-t-[#3b6e8c] animate-spin" />
              </div>
            )}

            {/* Checkmark or Selection Badge (44px touch area) */}
            {isSelectMode && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(photo.id);
                }}
                className="absolute top-0 right-0 w-11 h-11 flex items-start justify-end p-1.5 cursor-pointer"
                aria-label={isSelected ? '取消选中' : '选中照片'}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                    isSelected
                      ? 'bg-[#3b6e8c] text-white'
                      : 'bg-black/30 backdrop-blur-xs text-white/70 hover:bg-black/50'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-white/60" />
                  )}
                </div>
              </div>
            )}

            {/* Date Tag or Unknown Marker */}
            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-white/95 drop-shadow-md pointer-events-none">
              <span className="truncate max-w-[80%] font-medium tracking-tight">
                {photo.dateUnknown ? '日期未知' : photo.capturedAt || '2026.10.10'}
              </span>
              {photo.isBuilding && (
                <span className="shrink-0 text-[9px] bg-black/40 px-1.5 py-0.5 rounded font-medium">
                  建筑
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
