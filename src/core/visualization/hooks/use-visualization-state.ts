/**
 * React Hook: useVisualizationState
 *
 * Derives renderer-ready VisualizationState and precomputed lookup maps from
 * the active ExecutionRuntimeState (or direct state snapshot and step) and a VisualizationAdapter.
 *
 * Pure, memoized, zero mutations.
 */

import { useMemo } from "react";
import type { ExecutionRuntimeState, ExecutionStep } from "@/core/execution/types";
import type {
  VisualizationState,
  VisualizationElement,
  VisualizationConnection,
  VisualizationHighlight,
} from "../types";
import type { VisualizationAdapter } from "../adapters/adapter-interface";
import { resolveHighlightsByElement } from "../utils/highlight-priority";

export interface UseVisualizationStateOptions<TState> {
  /** Visualization adapter responsible for transforming TState */
  readonly adapter: VisualizationAdapter<TState>;

  /** Full execution runtime state from useExecutionEngine */
  readonly runtimeState?: ExecutionRuntimeState<TState> | null;

  /** Direct state snapshot override if not using runtimeState */
  readonly state?: TState | null;

  /** Direct step snapshot override if not using runtimeState */
  readonly step?: ExecutionStep<TState> | null;
}

export interface UseVisualizationStateReturn<TState> {
  /** The full frozen visualization state */
  readonly visualizationState: VisualizationState<TState> | null;

  /** O(1) lookup map of elementId -> VisualizationElement */
  readonly elementsById: ReadonlyMap<string, VisualizationElement>;

  /** O(1) lookup map of connectionId -> VisualizationConnection */
  readonly connectionsById: ReadonlyMap<string, VisualizationConnection>;

  /** O(1) lookup map of elementId -> winning resolved VisualizationHighlight */
  readonly resolvedHighlights: ReadonlyMap<string, VisualizationHighlight>;

  /** Convenience getter for element highlight */
  readonly getHighlight: (elementId: string) => VisualizationHighlight | undefined;
}

export function useVisualizationState<TState>({
  adapter,
  runtimeState,
  state: explicitState,
  step: explicitStep,
}: UseVisualizationStateOptions<TState>): UseVisualizationStateReturn<TState> {
  const activeState = explicitState !== undefined
    ? explicitState
    : runtimeState?.currentState ?? null;

  const activeStep = explicitStep !== undefined
    ? explicitStep
    : runtimeState?.currentStep ?? null;

  const visualizationState = useMemo<VisualizationState<TState> | null>(() => {
    if (activeState === null || activeState === undefined) {
      return null;
    }
    return adapter.transform(activeState, activeStep);
  }, [adapter, activeState, activeStep]);

  const elementsById = useMemo<ReadonlyMap<string, VisualizationElement>>(() => {
    if (!visualizationState) return new Map();
    const map = new Map<string, VisualizationElement>();
    for (const elem of visualizationState.elements) {
      map.set(elem.id, elem);
    }
    return map;
  }, [visualizationState]);

  const connectionsById = useMemo<ReadonlyMap<string, VisualizationConnection>>(() => {
    if (!visualizationState) return new Map();
    const map = new Map<string, VisualizationConnection>();
    for (const conn of visualizationState.connections) {
      map.set(conn.id, conn);
    }
    return map;
  }, [visualizationState]);

  const resolvedHighlights = useMemo<ReadonlyMap<string, VisualizationHighlight>>(() => {
    if (!visualizationState) return new Map();
    return resolveHighlightsByElement(visualizationState.highlights);
  }, [visualizationState]);

  const getHighlight = useMemo(() => {
    return (elementId: string) => resolvedHighlights.get(elementId);
  }, [resolvedHighlights]);

  return {
    visualizationState,
    elementsById,
    connectionsById,
    resolvedHighlights,
    getHighlight,
  };
}
