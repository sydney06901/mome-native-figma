import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { CursorVisualState } from '../../../domain/types.ts';
import { BloubAvatarView } from './BloubAvatarView.tsx';

export interface BloubFloatingCursorProps {
  visualState: CursorVisualState;
  targetElement: HTMLElement | null;
  anchorElement?: HTMLElement | null;
  progress?: number;
  visible: boolean;
  speed: 'normal' | 'fast';
  currentReason?: string;
  confidence?: number;
}

export const BloubFloatingCursor: React.FC<BloubFloatingCursorProps> = ({
  visualState,
  targetElement,
  anchorElement,
  visible,
  speed,
  currentReason,
  confidence,
}) => {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Update target coordinates using getBoundingClientRect() directly in viewport coordinates
  useEffect(() => {
    if (!visible) {
      setCoords(null);
      return;
    }

    const measureAndSet = () => {
      if (targetElement && targetElement.isConnected) {
        // Direct viewport coordinates (NEVER add window.scrollY for position:fixed!)
        const rect = targetElement.getBoundingClientRect();
        // Position at top-left quadrant of the target card, clear of top-right checkmark
        setCoords({
          x: Math.max(8, rect.left + 14),
          y: Math.max(8, rect.top + 14),
        });
      } else if (anchorElement && anchorElement.isConnected) {
        const rect = anchorElement.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2 - 16,
          y: rect.bottom + 12,
        });
      } else {
        setCoords(null);
      }
    };

    const handleUpdate = () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(measureAndSet);
    };

    // Initial measurement
    measureAndSet();

    window.addEventListener('scroll', handleUpdate, { passive: true, capture: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [targetElement, anchorElement, visible]);

  if (!visible || !coords || typeof document === 'undefined') return null;

  const transitionDuration = prefersReducedMotion
    ? 0.05
    : speed === 'fast'
    ? 0.45
    : 0.85;

  const cursorContent = (
    <motion.div
      className="fixed left-0 top-0 z-[9999] pointer-events-none select-none"
      style={{
        willChange: 'transform',
      }}
      animate={{
        x: coords.x,
        y: coords.y,
        scale: prefersReducedMotion
          ? 1
          : visualState === 'thinking'
          ? 1.08
          : visualState === 'matched'
          ? 1.15
          : 1,
        rotate: prefersReducedMotion
          ? 0
          : visualState === 'travelling'
          ? 4
          : visualState === 'thinking'
          ? -2
          : 0,
      }}
      transition={{
        x: {
          duration: transitionDuration,
          ease: [0.22, 1, 0.36, 1],
        },
        y: {
          duration: transitionDuration,
          ease: [0.22, 1, 0.36, 1],
        },
        scale: { duration: 0.25 },
        rotate: { duration: 0.3 },
      }}
    >
      <BloubAvatarView
        visualState={visualState}
        speed={speed}
        currentReason={currentReason}
        confidence={confidence}
        prefersReducedMotion={prefersReducedMotion}
      />
    </motion.div>
  );

  // Render via portal directly to document.body to escape any parent transform/overflow
  return createPortal(cursorContent, document.body);
};
