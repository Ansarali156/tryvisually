/**
 * Base Visualization Adapter
 *
 * Provides a solid foundation and reusable boilerplate for data structure adapters:
 * - Automatically derives highlights from ExecutionStep operations
 * - Automatically derives step explanation annotations
 * - Enforces deep-freezing on all generated visualization states
 */

import type { ExecutionStep } from "@/core/execution/types";
import type {
  VisualizationState,
  VisualizationElement,
  VisualizationConnection,
  VisualizationHighlight,
  VisualizationAnnotation,
} from "../types";
import type { VisualizationAdapter } from "./adapter-interface";
import { deriveStepHighlights } from "../utils/highlight-priority";
import { deepFreeze } from "@/core/execution/utils/clone";

export abstract class BaseVisualizationAdapter<TState = unknown>
  implements VisualizationAdapter<TState>
{
  abstract readonly name: string;

  /**
   * Subclasses implement this method to extract elements from the state snapshot.
   */
  abstract buildElements(
    state: TState,
    step?: ExecutionStep<TState> | null
  ): readonly VisualizationElement[];

  /**
   * Subclasses can override this method to define relational connections (edges/pointers).
   */
  buildConnections(
    _state: TState,
    _step?: ExecutionStep<TState> | null
  ): readonly VisualizationConnection[] {
    return [];
  }

  /**
   * Subclasses can override to inject domain-specific highlights before merging with step highlights.
   */
  buildCustomHighlights(
    _state: TState,
    _step?: ExecutionStep<TState> | null
  ): readonly VisualizationHighlight[] {
    return [];
  }

  /**
   * Subclasses can override to define domain-specific annotations.
   */
  buildCustomAnnotations(
    _state: TState,
    _step?: ExecutionStep<TState> | null
  ): readonly VisualizationAnnotation[] {
    return [];
  }

  /**
   * Generates initial state snapshot prior to step execution.
   */
  createInitialState(state: TState): VisualizationState<TState> {
    return this.transform(state, null);
  }

  /**
   * Pure transformation pipeline.
   */
  transform(
    state: TState,
    step?: ExecutionStep<TState> | null
  ): VisualizationState<TState> {
    const elements = this.buildElements(state, step);
    const connections = this.buildConnections(state, step);

    const customHighlights = this.buildCustomHighlights(state, step);
    const highlights = step
      ? deriveStepHighlights(step, customHighlights)
      : customHighlights;

    const annotations: VisualizationAnnotation[] = [
      ...this.buildCustomAnnotations(state, step),
    ];

    if (step && step.explanation) {
      annotations.push({
        id: `ann-step-${step.id}`,
        text: step.explanation,
        type: "callout",
      });
    }

    const visualizationState: VisualizationState<TState> = {
      sourceState: state,
      elements,
      connections,
      highlights,
      annotations,
      metadata: step?.metadata,
    };

    return deepFreeze(visualizationState);
  }
}
