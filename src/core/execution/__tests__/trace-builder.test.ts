import { describe, it, expect } from "vitest";
import { createExecutionTrace, ExecutionTraceBuilder } from "../trace/trace-builder";

describe("Execution Engine - Trace Builder", () => {
  it("initializes with immutable initial state and metadata", () => {
    const initialState = { count: 0, items: [1, 2, 3] };
    const builder = createExecutionTrace({
      initialState,
      metadata: { algorithmName: "Test Algorithm" },
    });

    const trace = builder.build();
    expect(trace.initialState).toEqual(initialState);
    expect(trace.steps).toHaveLength(0);
    expect(trace.metadata?.algorithmName).toBe("Test Algorithm");
  });

  it("adds steps with auto-incremented IDs and immutably freezes snapshots", () => {
    const builder = createExecutionTrace({ initialState: { val: 0 } });

    builder.addStep({
      operation: "insert",
      codeLine: 10,
      variables: { x: 5 },
      state: { val: 5 },
      highlightedElements: ["elem-1"],
      explanation: "Inserted element 1",
    });

    builder.addStep({
      operation: "compare",
      codeLine: 12,
      variables: { x: 10 },
      state: { val: 10 },
      highlightedElements: ["elem-1", "elem-2"],
      explanation: "Compared element 1 and 2",
    });

    const trace = builder.build();
    expect(trace.steps).toHaveLength(2);
    expect(trace.steps[0].id).toBe(0);
    expect(trace.steps[1].id).toBe(1);
    expect(trace.finalState).toEqual({ val: 10 });

    // Verify deep freeze: mutating step properties should throw or be ignored in strict mode
    expect(() => {
      // @ts-expect-error - testing immutability enforcement
      trace.steps[0].state.val = 999;
    }).toThrow();
  });

  it("subsequent mutations outside the builder do not mutate previously recorded steps", () => {
    const dynamicState = { items: [1, 2] };
    const builder = createExecutionTrace({ initialState: dynamicState });

    builder.addStep({
      operation: "push",
      variables: { len: 2 },
      state: dynamicState,
      explanation: "Step 0",
    });

    // Mutate dynamicState externally
    dynamicState.items.push(3);

    builder.addStep({
      operation: "push",
      variables: { len: 3 },
      state: dynamicState,
      explanation: "Step 1",
    });

    const trace = builder.build();
    expect(trace.steps[0].state.items).toEqual([1, 2]);
    expect(trace.steps[1].state.items).toEqual([1, 2, 3]);
  });
});
