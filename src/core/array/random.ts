/**
 * Random Array Generation Utilities
 *
 * Used EXCLUSIVELY for initializing user input.
 * Invariant: Once an array is chosen/generated, all downstream trace generation is 100% deterministic.
 */

export interface RandomArrayOptions {
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly minValue?: number;
  readonly maxValue?: number;
  readonly allowDuplicates?: boolean;
}

/**
 * Generates a random array of numbers (default: 8 to 12 elements with values between 5 and 99).
 */
export function generateRandomArray(options: RandomArrayOptions = {}): number[] {
  const minLength = Math.max(2, options.minLength ?? 8);
  const maxLength = Math.max(minLength, options.maxLength ?? 10);
  const minValue = options.minValue ?? 5;
  const maxValue = options.maxValue ?? 95;

  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const result: number[] = [];

  for (let i = 0; i < length; i++) {
    const val = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    result.push(val);
  }

  return result;
}

/**
 * Default sample array for initial visualizer landing.
 */
export const DEFAULT_INITIAL_ARRAY: readonly number[] = Object.freeze([
  15, 32, 8, 45, 23, 67, 12, 54,
]);
