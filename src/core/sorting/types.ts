/**
 * Sorting Algorithm Types and State Models
 */

export type SortingAlgorithmType =
  | "bubble-sort"
  | "selection-sort"
  | "insertion-sort"
  | "merge-sort"
  | "quick-sort";

export interface SortingState {
  readonly array: readonly number[];
  readonly comparingIndices: readonly number[];
  readonly swappedIndices: readonly number[];
  readonly sortedIndices: readonly number[];
  readonly pivotIndex?: number | null;
  readonly partitionRange?: readonly [number, number];
  readonly phaseDescription: string;
}
