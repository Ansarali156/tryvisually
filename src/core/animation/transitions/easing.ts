/**
 * Easing Functions
 *
 * Smooth, subtle, educational easings avoiding excessive bounce or jarring motion.
 */

export type EasingFunction = (t: number) => number;

export const EASING_FUNCTIONS: Record<string, EasingFunction> = {
  linear: (t: number) => t,

  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),

  easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),

  easeInOutQuad: (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};

export function getEasingFunction(name?: string): EasingFunction {
  if (!name) return EASING_FUNCTIONS.easeOutCubic;
  return EASING_FUNCTIONS[name] ?? EASING_FUNCTIONS.easeOutCubic;
}
