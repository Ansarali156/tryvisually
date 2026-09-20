import { describe, it, expect, beforeEach } from "vitest";
import { getLinkedListSourceCodes } from "../code-snippets";
import { createLinkedListState, resetNodeIdCounter } from "../validation";
import { generateTraverseTrace, generateReverseTrace, generateSearchTrace } from "../trace-generators";

describe("LinkedList Code and Execution Synchronization", () => {
  beforeEach(() => {
    resetNodeIdCounter(1);
  });

  it("should have code snippets for all operations in both languages", () => {
    const ops = [
      "traverse",
      "search",
      "access",
      "insert-beginning",
      "insert-end",
      "insert-position",
      "delete-beginning",
      "delete-end",
      "delete-position",
      "update",
      "reverse",
    ] as const;

    for (const op of ops) {
      const codeData = getLinkedListSourceCodes(op);
      expect(codeData).toBeDefined();
      expect(codeData.python).toBeDefined();
      expect(codeData.typescript).toBeDefined();
      expect(codeData.python!.lines.length).toBeGreaterThan(0);
      expect(codeData.typescript!.lines.length).toBeGreaterThan(0);
    }
  });

  it("should synchronize execution steps with code lines and variable states for traversal", () => {
    const state = createLinkedListState([10, 20, 30], "singly");
    const trace = generateTraverseTrace(state);
    const codeDef = getLinkedListSourceCodes("traverse").typescript!;

    for (const step of trace.steps) {
      expect(step.explanation).toBeTruthy();
      expect(step.variables).toBeDefined();

      if (step.codeLine) {
        expect(step.codeLine).toBeGreaterThan(0);
        expect(step.codeLine).toBeLessThanOrEqual(codeDef.lines.length);
      }
    }
  });

  it("should synchronize reverse execution steps with 3-pointer variables (prev, current, next)", () => {
    const state = createLinkedListState([10, 20], "singly");
    const trace = generateReverseTrace(state);

    const stepWithPointers = trace.steps.find(
      (s) => s.variables.current !== undefined && s.variables.prev !== undefined
    );
    expect(stepWithPointers).toBeDefined();
  });

  it("should synchronize search steps with found boolean variable and target", () => {
    const state = createLinkedListState([15, 25, 35], "singly");
    const trace = generateSearchTrace(state, 25);

    const foundStep = trace.steps.find((s) => s.variables.found === true);
    expect(foundStep).toBeDefined();
    expect(foundStep?.variables.target).toBe(25);
  });
});
