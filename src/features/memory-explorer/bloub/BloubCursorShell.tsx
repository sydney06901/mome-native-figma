import React, { useEffect } from 'react';
import { BloubCursorShellProps } from './types.ts';
import { getVisualStateDescription } from './mapping.ts';

/**
 * Bloub AI Cursor Visual Shell
 *
 * Visual characteristics:
 * - Quiet, curious, friendly memory assistant.
 * - Organic droplet shape with expressive eyes.
 * - Gentle breathing animation (2.4s - 3.2s).
 * - Calming pastel tokens: Mint, Lavender, Peach, Yellow.
 * - Respects prefers-reduced-motion.
 */
export const BloubCursorShell: React.FC<BloubCursorShellProps> = ({
  visualState,
  targetPhotoId,
  progress = 0,
  reducedMotion = false,
  onTransitionComplete,
  className = '',
}) => {
  useEffect(() => {
    if (onTransitionComplete) {
      const timer = setTimeout(() => {
        onTransitionComplete();
      }, reducedMotion ? 50 : 350);
      return () => clearTimeout(timer);
    }
  }, [visualState, onTransitionComplete, reducedMotion]);

  // Design Token Colors based on Bloub's emotional state
  const getShellColors = () => {
    switch (visualState) {
      case 'matched':
      case 'confirming':
      case 'celebrating':
        return {
          bg: '#72C9A3',
          glow: 'rgba(114, 201, 163, 0.35)',
          eye: '#FFFFFF',
          pupil: '#1E5840',
        };
      case 'thinking':
        return {
          bg: '#E8925A',
          glow: 'rgba(232, 146, 90, 0.35)',
          eye: '#FFFFFF',
          pupil: '#7B3B13',
        };
      case 'paused':
        return {
          bg: '#F1CB55',
          glow: 'rgba(241, 203, 85, 0.3)',
          eye: '#FFFFFF',
          pupil: '#634E11',
        };
      case 'confused':
        return {
          bg: '#C86666',
          glow: 'rgba(200, 102, 102, 0.3)',
          eye: '#FFFFFF',
          pupil: '#6D2B2B',
        };
      case 'observing':
      case 'travelling':
      default:
        return {
          bg: '#9684DF',
          glow: 'rgba(150, 132, 223, 0.35)',
          eye: '#FFFFFF',
          pupil: '#41327F',
        };
    }
  };

  const colors = getShellColors();
  const stateText = getVisualStateDescription(visualState);

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Bloub Organic Droplet Shell */}
      <div
        className={`relative w-9 h-9 flex items-center justify-center shrink-0 ${
          reducedMotion ? '' : 'transition-all duration-300'
        }`}
        style={{
          filter: `drop-shadow(0 4px 10px ${colors.glow})`,
        }}
        title={`Bloub: ${stateText}`}
      >
        <svg
          viewBox="0 0 36 36"
          className={`w-9 h-9 ${
            !reducedMotion && visualState === 'observing'
              ? 'animate-pulse'
              : !reducedMotion && visualState === 'celebrating'
              ? 'scale-110'
              : ''
          }`}
        >
          {/* Organic soft character body */}
          <path
            d="M18,3 C26,3 32,9 32,18 C32,26.5 25.5,33 18,33 C10.5,33 4,26.5 4,18 C4,9 10,3 18,3 Z"
            fill={colors.bg}
            className="transition-colors duration-300"
          />

          {/* Eye 1 */}
          <circle cx="14" cy="16" r="3.2" fill={colors.eye} />
          <circle
            cx={visualState === 'observing' ? '15' : '14'}
            cy="16"
            r="1.6"
            fill={colors.pupil}
            className="transition-all duration-200"
          />

          {/* Eye 2 */}
          <circle cx="22" cy="16" r="3.2" fill={colors.eye} />
          <circle
            cx={visualState === 'observing' ? '23' : '22'}
            cy="16"
            r="1.6"
            fill={colors.pupil}
            className="transition-all duration-200"
          />

          {/* Subtle blush for celebrating / matched */}
          {(visualState === 'matched' || visualState === 'celebrating') && (
            <>
              <ellipse cx="10" cy="21" rx="2" ry="1" fill="#FFFFFF" opacity="0.4" />
              <ellipse cx="26" cy="21" rx="2" ry="1" fill="#FFFFFF" opacity="0.4" />
            </>
          )}
        </svg>

        {/* Progress Arc if scanning */}
        {progress > 0 && progress < 1 && (
          <svg className="absolute -inset-1 w-11 h-11 -rotate-90 pointer-events-none" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="#E7E1FA"
              strokeWidth="2.5"
            />
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke={colors.bg}
              strokeWidth="2.5"
              strokeDasharray={119}
              strokeDashoffset={119 * (1 - progress)}
              className="transition-all duration-200"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Accessible Text Status */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#17171B] tracking-tight">Bloub</span>
          <span className="text-[10px] text-[#A19CA6] uppercase tracking-wider font-mono">
            {visualState}
          </span>
        </div>
        <p className="text-[12px] text-[#747078] truncate leading-tight mt-0.5">{stateText}</p>
      </div>
    </div>
  );
};
