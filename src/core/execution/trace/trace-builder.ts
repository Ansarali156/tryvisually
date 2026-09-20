import {
  ExecutionOperation,
  ExecutionStep,
  ExecutionTrace,
  ExecutionTraceMetadata,
} from "../types";
import { deepClone, deepFreeze } from "../utils/clone";

export interface StepInput<TState> {
  operation: ExecutionOperation;
  codeLine?: number;
  variables: Record<string, unknown>;
  state: TState;
  highlightedElements?: string[];
  explanation: string;
  metadata?: Record<string, unknown>;
}

export interface TraceBuilderOptions<TState> {
  initialState: TState;
  metadata?: ExecutionTraceMetadata;
}

export class ExecutionTraceBuilder<TState> {
  private readonly initialState: Readonly<TState>;
  private finalState: Readonly<TState>;
  private readonly metadata?: Readonly<ExecutionTraceMetadata>;
  private readonly steps: ExecutionStep<TState>[] = [];

  constructor(options: TraceBuilderOptions<TState>) {
    // Take an immutable deep copy of the initial state
    this.initialState = deepFreeze(deepClone(options.initialState));
    this.finalState = this.initialState;
    if (options.metadata) {
      this.metadata = deepFreeze(deepClone(options.metadata));
    }
  }

  /**
   * Adds a discrete execution step to the trace.
   * The state and variables are deep-cloned and frozen to ensure total immutability.
   */
  public addStep(input: StepInput<TState>): this {
    const stepId = this.steps.length;

    // Snapshot state immutably
    const frozenState = deepFreeze(deepClone(input.state));
    const frozenVariables = deepFreeze(deepClone(input.variables || {}));
    const frozenHighlights = deepFreeze(
      input.highlightedElements ? [...input.highlightedElements] : []
    );
    const frozenMetadata = input.metadata
      ? deepFreeze(deepClone(input.metadata))
      : undefined;

    const step: ExecutionStep<TState> = {
      id: stepId,
      operation: input.operation,
      codeLine: input.codeLine,
      variables: frozenVariables,
      state: frozenState,
      highlightedElements: frozenHighlights,
      explanation: input.explanation,
      metadata: frozenMetadata,
    };

    this.steps.push(Object.freeze(step));
    this.finalState = frozenState;
    return this;
  }

  /**
   * Returns current step count recorded so far.
   */
  public getStepCount(): number {
    return this.steps.length;
  }

  /**
   * Finalizes and builds the immutable ExecutionTrace.
   */
  public build(): ExecutionTrace<TState> {
    const trace: ExecutionTrace<TState> = {
      steps: Object.freeze([...this.steps]),
      initialState: this.initialState,
      finalState: this.finalState,
      metadata: this.metadata,
    };

    return Object.freeze(trace);
  }
}

/**
 * Convenience factory to create an ExecutionTraceBuilder
 */
export function createExecutionTrace<TState>(
  options: TraceBuilderOptions<TState>
): ExecutionTraceBuilder<TState> {
  return new ExecutionTraceBuilder(options);
}
