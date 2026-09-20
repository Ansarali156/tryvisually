/**
 * React Hook: useExecutionView
 *
 * Provides a single unified, synchronized execution view context to all UI consumers:
 * Code Viewer, Variables Panel, Explanation Panel, and Visualizer.
 *
 * Invariant: Every property in UnifiedExecutionViewContext corresponds to the SAME step.
 */

import { useMemo } from "react";
import type { ExecutionRuntimeState, ExecutionStep } from "@/core/execution/types";
import type { VisualizationState } from "@/core/visualization/types";
import type {
  SourceCode,
  SupportedLanguage,
  UnifiedExecutionViewContext,
} from "../types";
import { computeVariableDiffs } from "../utils/variable-diff";
import { resolveActiveLines, LanguageCodeMappingRegistry } from "../utils/code-mapping";

export interface UseExecutionViewOptions<TState> {
  /** Runtime state from useExecutionEngine */
  readonly runtimeState: ExecutionRuntimeState<TState>;

  /**
   * Previous step snapshot (for variable diff detection).
   * If omitted, the hook computes it from the trace or treats previous variables as empty.
   */
  readonly previousStep?: ExecutionStep<TState> | null;

  /** Active programming language for source code display */
  readonly language?: SupportedLanguage;

  /** Map of available source code snippets per language */
  readonly sourceCodes?: Partial<Record<SupportedLanguage, SourceCode>>;

  /** Optional language code line mapping registry */
  readonly mappingRegistry?: LanguageCodeMappingRegistry;

  /** Optional pre-transformed visualization state from useVisualizationState */
  readonly visualizationState?: VisualizationState<TState> | null;
}

export function useExecutionView<TState>({
  runtimeState,
  previousStep,
  language = "python",
  sourceCodes,
  mappingRegistry,
  visualizationState,
}: UseExecutionViewOptions<TState>): UnifiedExecutionViewContext<TState> {
  const {
    currentStep,
    currentState,
    currentStepIndex,
    totalSteps,
    status,
    progress,
  } = runtimeState;

  // Memoize unified synchronized context
  const context = useMemo<UnifiedExecutionViewContext<TState>>(() => {
    const variables = currentStep ? currentStep.variables : {};
    const prevVariables = previousStep ? previousStep.variables : undefined;

    const variableDiffs = computeVariableDiffs(prevVariables, variables);
    const activeCodeLines = resolveActiveLines(currentStep, language, mappingRegistry);
    const primaryCodeLine = activeCodeLines.length > 0 ? activeCodeLines[0] : undefined;

    const explanation = currentStep?.explanation ?? "Execution idle.";
    const operation = currentStep?.operation;
    const highlightedElements = currentStep?.highlightedElements ?? [];
    const sourceCode = sourceCodes?.[language];

    return {
      step: currentStep,
      stepIndex: currentStepIndex,
      totalSteps,
      state: currentState,
      variables,
      variableDiffs,
      activeCodeLines,
      primaryCodeLine,
      explanation,
      operation,
      highlightedElements,
      progress,
      status,
      sourceCode,
      language,
      visualizationState,
    };
  }, [
    currentStep,
    previousStep,
    currentStepIndex,
    totalSteps,
    currentState,
    status,
    progress,
    language,
    sourceCodes,
    mappingRegistry,
    visualizationState,
  ]);

  return context;
}
