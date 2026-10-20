export interface ReviewPhaseTiming {
  travel: number;
  observe: number;
  think: number;
  reveal: number;
}

export interface AnimationTiming {
  fullReviewCount: number;
  full: ReviewPhaseTiming;
  fast: ReviewPhaseTiming;
}

export const ANIMATION_TIMING: Readonly<AnimationTiming> = Object.freeze({
  fullReviewCount: 12,
  full: Object.freeze({ travel: 850, observe: 1050, think: 750, reveal: 800 }),
  fast: Object.freeze({ travel: 300, observe: 280, think: 240, reveal: 280 }),
});

export const MOME_MOTION_EASE = [0.22, 1, 0.36, 1] as const;
