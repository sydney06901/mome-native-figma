import type { MaterialStyleId } from '../domain';

export interface MaterialStylePreset {
  id: MaterialStyleId;
  label: string;
  description: string;
  swatch: string;
}

export const MATERIAL_STYLE_PRESETS: readonly MaterialStylePreset[] = [
  { id: 'printmaking', label: 'Printmaking styles', description: 'Carved lines, handmade ink and warm paper texture', swatch: 'from-[#ea6b3c] to-[#f3d48e]' },
  { id: 'pixel-art', label: 'Pixel art style', description: 'Playful low-resolution shapes with crisp edges', swatch: 'from-[#7b61ff] to-[#70d7ff]' },
  { id: 'retro-manga-ink', label: 'Retro Manga Ink', description: 'Bold black ink, halftone texture and vintage drama', swatch: 'from-[#25232b] to-[#e5ded0]' },
  { id: 'dreamy-anime', label: 'Dreamy Anime', description: 'Soft light, luminous color and expressive detail', swatch: 'from-[#f0a8dc] to-[#9bc8ff]' },
] as const;
