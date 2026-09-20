import { createExecutionTrace } from "../trace/trace-builder";
import { ExecutionTrace } from "../types";

export interface DemoState {
  counter: number;
  accumulator: number;
  items: Array<{ id: string; value: number; status: string }>;
}

const initialDemoState: DemoState = {
  counter: 0,
  accumulator: 0,
  items: [
    { id: "elem-0", value: 10, status: "default" },
    { id: "elem-1", value: 20, status: "default" },
    { id: "elem-2", value: 30, status: "default" },
    { id: "elem-3", value: 40, status: "default" },
  ],
};

export function createSampleDemoTrace(): ExecutionTrace<DemoState> {
  const builder = createExecutionTrace<DemoState>({
    initialState: initialDemoState,
    metadata: {
      algorithmId: "generic-accumulator-demo",
      algorithmName: "Generic Accumulator Demonstration",
      category: "Demonstration",
      language: "typescript",
      complexity: {
        time: "O(n)",
        space: "O(1)",
      },
    },
  });

  // Step 0
  builder.addStep({
    operation: "call",
    codeLine: 1,
    variables: { counter: 0, accumulator: 0, currentTarget: 10 },
    state: {
      counter: 0,
      accumulator: 0,
      items: [
        { id: "elem-0", value: 10, status: "active" },
        { id: "elem-1", value: 20, status: "default" },
        { id: "elem-2", value: 30, status: "default" },
        { id: "elem-3", value: 40, status: "default" },
      ],
    },
    highlightedElements: ["elem-0"],
    explanation: "Initialize accumulator to 0 and point to element 0.",
  });

  // Step 1
  builder.addStep({
    operation: "update",
    codeLine: 3,
    variables: { counter: 1, accumulator: 10, currentTarget: 10 },
    state: {
      counter: 1,
      accumulator: 10,
      items: [
        { id: "elem-0", value: 10, status: "visited" },
        { id: "elem-1", value: 20, status: "active" },
        { id: "elem-2", value: 30, status: "default" },
        { id: "elem-3", value: 40, status: "default" },
      ],
    },
    highlightedElements: ["elem-0", "elem-1"],
    explanation: "Add element 0 (10) to accumulator. Total accumulator is now 10.",
  });

  // Step 2
  builder.addStep({
    operation: "compare",
    codeLine: 4,
    variables: { counter: 2, accumulator: 30, currentTarget: 20 },
    state: {
      counter: 2,
      accumulator: 30,
      items: [
        { id: "elem-0", value: 10, status: "visited" },
        { id: "elem-1", value: 20, status: "visited" },
        { id: "elem-2", value: 30, status: "active" },
        { id: "elem-3", value: 40, status: "default" },
      ],
    },
    highlightedElements: ["elem-1", "elem-2"],
    explanation: "Add element 1 (20) to accumulator. Total accumulator is now 30.",
  });

  // Step 3
  builder.addStep({
    operation: "return",
    codeLine: 6,
    variables: { counter: 3, accumulator: 60, currentTarget: 30 },
    state: {
      counter: 3,
      accumulator: 60,
      items: [
        { id: "elem-0", value: 10, status: "visited" },
        { id: "elem-1", value: 20, status: "visited" },
        { id: "elem-2", value: 30, status: "visited" },
        { id: "elem-3", value: 40, status: "default" },
      ],
    },
    highlightedElements: ["elem-2"],
    explanation: "Add element 2 (30) to accumulator. Execution completes with accumulator = 60.",
  });

  return builder.build();
}
