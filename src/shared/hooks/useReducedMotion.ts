import { useState, useEffect } from 'react';
import { LocalSettings } from '../../services/storage/localSettings.ts';

/**
 * Hook to read and listen to prefers-reduced-motion, respecting user toggle
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    LocalSettings.getReducedMotion()
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      // Only auto-update if not explicitly overridden in LocalSettings
      const stored = localStorage.getItem('mome_setting_reduced_motion');
      if (stored === null) {
        setReducedMotion(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
}
