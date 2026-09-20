import { describe, it, expect, beforeEach } from "vitest";
import { getQueueSourceCodes } from "../code-snippets";
import { createQueueState, resetQueueIdCounter } from "../validation";
import { createEnqueueTrace, createDequeueTrace } from "../trace-generators";

describe("Queue Code & Execution Synchronization", () => {
  beforeEach(() => {
    resetQueueIdCounter(1);
  });

  it("should provide source code for all operations in Python and TypeScript", () => {
    const ops = [
      "enqueue",
      "dequeue",
      "front",
      "rear",
      "isEmpty",
      "isFull",
      "size",
      "clear",
    ] as const;

    for (const op of ops) {
      const code = getQueueSourceCodes(op);
      expect(code.python).toBeDefined();
      expect(code.typescript).toBeDefined();
      expect(code.python!.lines.length).toBeGreaterThan(0);
      expect(code.typescript!.lines.length).toBeGreaterThan(0);
    }
  });

  it("should synchronize enqueue execution steps with code lines and variables", () => {
    const state = createQueueState([10, 20], "circular", 4);
    const trace = createEnqueueTrace(state, 30);
    const codeDef = getQueueSourceCodes("enqueue").typescript!;

    for (const step of trace.steps) {
      expect(step.explanation).toBeTruthy();
      expect(step.variables).toBeDefined();

      if (step.codeLine) {
        expect(step.codeLine).toBeGreaterThan(0);
        expect(step.codeLine).toBeLessThanOrEqual(codeDef.lines.length);
      }
    }
  });

  it("should synchronize dequeue steps with front advancement and size diff", () => {
    const state = createQueueState([10, 20, 30], "circular", 4);
    const trace = createDequeueTrace(state);

    const dequeueStep = trace.steps.find((s) => s.variables.dequeuedValue !== undefined);
    expect(dequeueStep).toBeDefined();
    expect(dequeueStep?.variables.dequeuedValue).toBe(10);
    expect(dequeueStep?.variables.size).toBe(2);
  });
});
