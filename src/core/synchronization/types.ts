/**
 * Code ↔ Execution Synchronization Types
 *
 * The synchronization layer binds:
 * EXECUTION STEP ↔ SOURCE CODE ↔ CODE LINE HIGHLIGHT ↔ VARIABLES ↔ VISUALIZATION STATE ↔ EXPLANATION
 *
 * Invariant: For any current step S, all views (code line, variables,
 * visualization state, explanation, operation, highlights) represent the SAME step S.
 */

import type {
  ExecutionOperation,
  ExecutionRuntimeState,
  ExecutionStatus,
  ExecutionStep,
} from "@/core/execution/types";
import type { VisualizationState } from "@/core/visualization/types";

export type SupportedLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "java"
  | "cpp";

export interface SourceCodeLine {
  /** 1-indexed line number corresponding to source display */
  readonly lineNumber: number;

  /** Text content of the source line */
  readonly content: string;

  /** Optional metadata (e.g. indentation level, token hints) */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface SourceCode {
  /** Programming language of this code snippet */
  readonly language: SupportedLanguage;

  /** Raw complete source code string */
  readonly code: string;

  /** Parsed line-by-line representation with 1-indexed line numbers */
  readonly lines: readonly SourceCodeLine[];

  /** Optional metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface CodeHighlightState {
  /** All 1-indexed line numbers currently highlighted */
  readonly activeLines: readonly number[];

  /** Primary focal line number if multiple lines are highlighted */
  readonly primaryLine?: number;

  /** Execution step ID that triggered this highlight */
  readonly executionStepId?: number;
}

export interface LanguageCodeMapping {
  /** Target programming language */
  readonly language: SupportedLanguage;

  /** Conceptual execution step ID */
  readonly stepId: number;

  /** 1-indexed line numbers in that language's source code */
  readonly codeLines: readonly number[];
}

export interface VariableDiff {
  /** Name/identifier of the variable */
  readonly key: string;

  /** Previous value before this step executed (undefined if variable is new) */
  readonly previousValue?: unknown;

  /** Current value at this step */
  readonly currentValue?: unknown;

  /** Whether the value changed between Step N-1 and Step N */
  readonly hasChanged: boolean;

  /** Whether the variable first appeared at this step */
  readonly isNew: boolean;
}

export interface UnifiedExecutionViewContext<TState = unknown> {
  /** Active execution step snapshot, or null if empty trace */
  readonly step: ExecutionStep<TState> | null;

  /** 0-indexed step number */
  readonly stepIndex: number;

  /** Total steps in the active trace */
  readonly totalSteps: number;

  /** Underlying algorithm state data */
  readonly state: Readonly<TState> | null;

  /** All active variables captured at this step */
  readonly variables: Readonly<Record<string, unknown>>;

  /** Detected variable changes relative to preceding step */
  readonly variableDiffs: Readonly<Record<string, VariableDiff>>;

  /** 1-indexed active code lines for the current language */
  readonly activeCodeLines: readonly number[];

  /** Primary active code line (defaults to first active line) */
  readonly primaryCodeLine?: number;

  /** Human-readable explanation of this step */
  readonly explanation: string;

  /** Canonical algorithm operation */
  readonly operation?: ExecutionOperation;

  /** Stable IDs of highlighted elements */
  readonly highlightedElements: readonly string[];

  /** Overall trace progress (0.0 to 1.0) */
  readonly progress: number;

  /** Current execution status (idle, playing, paused, completed) */
  readonly status: ExecutionStatus;

  /** Optional active source code */
  readonly sourceCode?: SourceCode;

  /** Currently selected programming language */
  readonly language: SupportedLanguage;

  /** Optional visualization state snapshot if integrated */
  readonly visualizationState?: VisualizationState<TState> | null;
}
