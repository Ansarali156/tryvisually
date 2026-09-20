/**
 * Core Language-Independent Execution Engine Types
 * 
 * Philosophy:
 * ALGORITHM LOGIC -> EXECUTION TRACE -> EXECUTION STATE -> VISUALIZATION -> CODE HIGHLIGHT -> VARIABLES -> EXPLANATION
 * 
 * The execution engine is the SINGLE SOURCE OF TRUTH for all runtime states.
 * Visualizers and animations are strictly presentational consumers and never mutate or compute state.
 */

export type ExecutionOperation =
  | "compare"
  | "swap"
  | "insert"
  | "delete"
  | "visit"
  | "enqueue"
  | "dequeue"
  | "push"
  | "pop"
  | "update"
  | "found"
  | "call"
  | "return"
  | "relax"
  | "select"
  | "partition"
  | "merge"
  | "custom";

export interface ExecutionStep<TState = unknown> {
  /** Discrete, zero-indexed unique step identifier */
  readonly id: number;

  /** Canonical operation category */
  readonly operation: ExecutionOperation;

  /** Optional 1-indexed line number in source code */
  readonly codeLine?: number;

  /** All active variables and values captured at this step */
  readonly variables: Readonly<Record<string, unknown>>;

  /** Complete, immutable state snapshot of the data structure / algorithm */
  readonly state: Readonly<TState>;

  /** Stable string identifiers of elements relevant to this step (e.g. "node-17", "item-2") */
  readonly highlightedElements: readonly string[];

  /** Human-readable explanation of what happened in this step */
  readonly explanation: string;

  /** Optional arbitrary metadata for specialized visualizers */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface ExecutionTraceMetadata {
  algorithmId?: string;
  algorithmName?: string;
  category?: string;
  input?: unknown;
  language?: string;
  complexity?: {
    time?: string;
    space?: string;
  };
  [key: string]: unknown;
}

export interface ExecutionTrace<TState = unknown> {
  /** The complete deterministic sequence of execution steps */
  readonly steps: readonly ExecutionStep<TState>[];

  /** The initial state snapshot before any operations execute */
  readonly initialState: Readonly<TState>;

  /** The terminal state snapshot after all operations complete */
  readonly finalState: Readonly<TState>;

  /** Optional metadata describing the algorithm and initial parameters */
  readonly metadata?: Readonly<ExecutionTraceMetadata>;
}

export type ExecutionStatus = "idle" | "playing" | "paused" | "completed";

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 1.5 | 2 | 4;

export interface ExecutionRuntimeState<TState = unknown> {
  /** Current step index (0 to totalSteps - 1) */
  readonly currentStepIndex: number;

  /** The active step snapshot, or null if the trace is empty */
  readonly currentStep: ExecutionStep<TState> | null;

  /** The active state data, or initialState if step 0, or null if empty */
  readonly currentState: Readonly<TState> | null;

  /** Runtime playback status */
  readonly status: ExecutionStatus;

  /** Playback speed multiplier */
  readonly speed: PlaybackSpeed;

  /** Total number of steps in the trace */
  readonly totalSteps: number;

  /** Completion progress from 0.0 to 1.0 */
  readonly progress: number;
}
