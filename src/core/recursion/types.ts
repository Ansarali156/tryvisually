/**
 * Recursion Visualizer Types and Call Stack Models
 */

export interface StackFrame {
  readonly id: string;
  readonly functionName: string;
  readonly args: Readonly<Record<string, string | number>>;
  readonly returnValue?: string | number | null;
  readonly status: "calling" | "waiting" | "returning" | "resolved";
  readonly depth: number;
  readonly parentId?: string | null;
}

export interface RecursionTreeNode {
  readonly id: string;
  readonly label: string;
  readonly depth: number;
  readonly status: "active" | "completed" | "pending";
  readonly returnValue?: string | number | null;
  readonly children: readonly string[];
}

export interface RecursionExecutionState {
  readonly functionName: string;
  readonly callStack: readonly StackFrame[];
  readonly activeFrameId: string | null;
  readonly callTree: readonly RecursionTreeNode[];
  readonly totalCalls: number;
  readonly maxDepth: number;
  readonly finalResult?: string | number | null;
  readonly phaseDescription: string;
}
