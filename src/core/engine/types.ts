/**
 * Core Execution Engine Abstraction Types
 * 
 * Philosophy:
 * ALGORITHM -> EXECUTION STATE -> EXECUTION TRACE -> VISUALIZATION -> CODE HIGHLIGHT -> VARIABLES -> EXPLANATION
 * 
 * The execution trace is an immutable sequence of state snapshots representing
 * the exact step-by-step progress of an algorithm or data structure operation.
 * The visualizer NEVER guesses what the algorithm is doing; it renders the trace directly.
 */

export type NodeStatus = "default" | "active" | "comparing" | "swapping" | "sorted" | "visited" | "inserted" | "deleted";
export type EdgeStatus = "default" | "traversed" | "highlighted" | "cut";

export interface VisualNode {
  id: string;
  label: string | number;
  status: NodeStatus;
  value?: unknown;
  meta?: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface VisualEdge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  status: EdgeStatus;
  directed?: boolean;
}

export interface VisualPointer {
  name: string;
  targetNodeId?: string;
  index?: number;
  label?: string;
  color?: string;
}

export interface VisualState {
  dataStructureType: "array" | "linked-list" | "stack" | "queue" | "tree" | "graph" | "hash-table" | "matrix";
  nodes: VisualNode[];
  edges?: VisualEdge[];
  pointers?: VisualPointer[];
  auxiliary?: Record<string, unknown>;
}

export interface VariableSnapshot {
  name: string;
  value: string | number | boolean | null | undefined | Array<unknown> | Record<string, unknown>;
  changed?: boolean;
  type?: string;
}

export interface TraceStep {
  /** 0-indexed step identifier */
  stepIndex: number;
  /** High-level human readable action title, e.g. "Compare elements" */
  action: string;
  /** Detailed natural explanation of WHAT is happening right now */
  explanation: string;
  /** Explicit pedagogical rationale: WHY did this step happen? */
  why?: string;
  /** Line numbers in the algorithm code to highlight (1-indexed) */
  codeLines: number[];
  /** Snapshot of all active variables at this step */
  variables: VariableSnapshot[];
  /** Complete visual representation data for the visualization renderer */
  visualState: VisualState;
  /** Current time and space complexity context for this step */
  complexitySnapshot?: {
    time: string;
    space: string;
    operationsCount?: number;
  };
}

export interface ExecutionTrace {
  algorithmId: string;
  algorithmName: string;
  category: string;
  code: {
    language: string;
    source: string;
  };
  steps: TraceStep[];
  metadata: {
    totalSteps: number;
    initialInput: unknown;
    bestTimeComplexity?: string;
    worstTimeComplexity?: string;
    spaceComplexity?: string;
  };
}

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 1.5 | 2;

export interface PlaybackState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  isFinished: boolean;
}

export type PlaybackAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "STEP_FORWARD" }
  | { type: "STEP_BACKWARD" }
  | { type: "GO_TO_START" }
  | { type: "GO_TO_END" }
  | { type: "SEEK"; step: number }
  | { type: "SET_SPEED"; speed: PlaybackSpeed }
  | { type: "RESET"; totalSteps: number };
