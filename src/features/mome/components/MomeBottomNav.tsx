import { Folder, Image, UserRound } from 'lucide-react';

interface MomeBottomNavProps {
  active?: 'library' | 'create' | 'profile';
}

export function MomeBottomNav({ active = 'create' }: MomeBottomNavProps) {
  const item = (id: MomeBottomNavProps['active'], label: string, icon: React.ReactNode) => (
    <button type="button" aria-label={label} className={`grid min-h-14 min-w-14 place-items-center rounded-full ${active === id ? 'ring-4 ring-[#d9c4ef]' : ''}`}>
      {icon}
    </button>
  );
  return (
    <nav className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-black/8 bg-white/95 px-8 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      {item('library', 'Media library', <Folder strokeWidth={1.7} />)}
      {item('create', 'Create from photos', <Image strokeWidth={1.7} />)}
      {item('profile', 'Profile', <UserRound strokeWidth={1.7} />)}
    </nav>
  );
}
