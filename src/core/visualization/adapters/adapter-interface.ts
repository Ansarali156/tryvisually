/**
 * Visualization Adapter Interface
 *
 * A VisualizationAdapter bridges the Execution Engine and the Visualizer.
 * It is a pure, side-effect-free transformer that maps algorithm state snapshots (TState)
 * and execution steps into renderer-independent VisualizationState.
 *
 * Requirements:
 * 1. Purity: Given identical state & step, it MUST return structurally identical output.
 * 2. Immutability: It MUST NOT mutate the input state or previous visualization states.
 * 3. Stable IDs: Elements must retain consistent IDs across steps.
 */

import type { ExecutionStep } from "@/core/execution/types";
import type { VisualizationState } from "../types";

export interface VisualizationAdapter<TState = unknown> {
  /** Unique name / key of the adapter (e.g. "array-adapter", "tree-adapter") */
  readonly name: string;

  /**
   * Generates the initial visualization state before any steps are executed.
   */
  createInitialState(state: TState): VisualizationState<TState>;

  /**
   * Transforms an execution state snapshot and active execution step into a
   * complete visualization state ready for rendering.
   */
  transform(
    state: TState,
    step?: ExecutionStep<TState> | null
  ): VisualizationState<TState>;
}
