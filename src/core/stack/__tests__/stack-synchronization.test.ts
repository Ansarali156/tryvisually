import { describe, it, expect, beforeEach } from "vitest";
import { getStackSourceCodes } from "../code-snippets";
import { createStackState, resetStackIdCounter } from "../validation";
import { createPushTrace, createPopTrace } from "../trace-generators";

describe("Stack Code & Execution Synchronization", () => {
  beforeEach(() => {
    resetStackIdCounter(1);
  });

  it("should provide source code for all operations in Python and TypeScript", () => {
    const ops = ["push", "pop", "peek", "isEmpty", "size", "clear"] as const;

    for (const op of ops) {
      const code = getStackSourceCodes(op);
      expect(code.python).toBeDefined();
      expect(code.typescript).toBeDefined();
      expect(code.python!.lines.length).toBeGreaterThan(0);
      expect(code.typescript!.lines.length).toBeGreaterThan(0);
    }
  });

  it("should synchronize push execution steps with code lines and variables", () => {
    const state = createStackState([10, 20]);
    const trace = createPushTrace(state, 30);
    const codeDef = getStackSourceCodes("push").typescript!;

    for (const step of trace.steps) {
      expect(step.explanation).toBeTruthy();
      expect(step.variables).toBeDefined();

      if (step.codeLine) {
        expect(step.codeLine).toBeGreaterThan(0);
        expect(step.codeLine).toBeLessThanOrEqual(codeDef.lines.length);
      }
    }
  });

  it("should synchronize pop execution steps with variables (topIndex, poppedValue, size)", () => {
    const state = createStackState([10, 20, 30]);
    const trace = createPopTrace(state);

    const popStep = trace.steps.find((s) => s.variables.poppedValue !== undefined);
    expect(popStep).toBeDefined();
    expect(popStep?.variables.poppedValue).toBe(30);
    expect(popStep?.variables.size).toBe(2);
  });
});
