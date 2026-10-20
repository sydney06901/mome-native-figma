import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import { MOME_MOTION_EASE } from '../config/animation';
import type { ReviewPhase } from '../review/visualReviewPlayer';
import { MomeAgent } from './MomeAgent';

interface FloatingMomeCursorProps {
  phase: ReviewPhase;
  targetElement: HTMLElement | null;
  visible: boolean;
}

export function FloatingMomeCursor({ phase, targetElement, visible }: FloatingMomeCursorProps) {
  const reduced = useReducedMotion();
  const [point, setPoint] = useState({ x: 24, y: 120 });

  useEffect(() => {
    if (!targetElement) return;
    targetElement.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    const update = () => {
      const rect = targetElement.getBoundingClientRect();
      setPoint({ x: Math.max(10, rect.left + 8), y: Math.max(76, rect.top + 42) });
    };
    const timer = window.setTimeout(update, reduced ? 0 : 320);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [reduced, targetElement]);

  const visualState = phase === 'thinking' ? 'thinking' : phase === 'matched' ? 'match' : phase === 'mismatch' ? 'mismatch' : 'describing';
  const label = phase === 'travelling' ? 'Moving…' : phase === 'observing' ? 'Looking closely…' : phase === 'thinking' ? 'Thinking…' : phase === 'matched' ? 'Found one!' : phase === 'mismatch' ? 'Reviewed' : '';

  if (!visible) return null;
  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-50 flex items-center gap-2"
      animate={{ x: reduced ? point.x : point.x, y: reduced ? point.y : point.y, opacity: 1, scale: phase === 'matched' && !reduced ? 1.08 : 1, rotate: phase === 'travelling' && !reduced ? 4 : 0 }}
      initial={{ opacity: 0 }}
      transition={{ x: { duration: reduced ? 0 : 0.85, ease: MOME_MOTION_EASE }, y: { duration: reduced ? 0 : 0.85, ease: MOME_MOTION_EASE }, opacity: { duration: 0.2 } }}
    >
      <MomeAgent state={visualState} size={70} />
      {label && <span className="rounded-full bg-black px-3 py-2 text-xs font-semibold text-white shadow-lg">{label}</span>}
    </motion.div>
  );
}
