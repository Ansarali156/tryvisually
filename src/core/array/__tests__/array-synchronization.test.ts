import { describe, it, expect, beforeEach } from "vitest";
import { createBubbleSortTrace } from "../trace-generators";
import { createArrayState, resetElementIdCounter } from "../validation";
import { defaultArrayAdapter } from "../array-adapter";
import { getArrayOperationSourceCodes } from "../code-snippets";
import { getSourceLine } from "@/core/synchronization/utils/source-code";

describe("Bubble Sort Execution Synchronization", () => {
  beforeEach(() => {
    resetElementIdCounter(1);
  });

  it("every step synchronously maps state, code line, variables, and visualization state", () => {
    const initialState = createArrayState([4, 2, 5, 1]);
    const trace = createBubbleSortTrace(initialState);
    const sourceCodes = getArrayOperationSourceCodes("bubble-sort");
    const pythonCode = sourceCodes.python!;

    expect(trace.steps.length).toBeGreaterThan(0);

    for (const step of trace.steps) {
      // 1. Step ID and state match
      expect(step.id).toBeGreaterThanOrEqual(0);
      expect(step.state.items.length).toBe(4);

      // 2. Visualization State aligns with step state
      const visState = defaultArrayAdapter.transform(step.state, step);
      expect(visState.elements.length).toBe(step.state.items.length);

      // Each visual element has corresponding array item ID
      for (let i = 0; i < step.state.items.length; i++) {
        expect(visState.elements[i].id).toBe(step.state.items[i].id);
        expect(visState.elements[i].value).toBe(step.state.items[i].value);
      }

      // 3. Code line is within valid source code bounds
      if (step.codeLine !== undefined) {
        expect(step.codeLine).toBeGreaterThanOrEqual(1);
        expect(step.codeLine).toBeLessThanOrEqual(pythonCode.lines.length);

        const sourceLine = getSourceLine(pythonCode, step.codeLine);
        expect(sourceLine).toBeDefined();
        expect(sourceLine?.content).toBeTruthy();
      }

      // 4. Variables and Explanation are present and learner-friendly
      expect(step.variables).toBeDefined();
      expect(typeof step.explanation).toBe("string");
      expect(step.explanation.length).toBeGreaterThan(5);

      // 5. Operation-specific checks
      if (step.operation === "compare") {
        expect(step.variables.shouldSwap).toBeDefined();
        expect(step.highlightedElements.length).toBe(2);
      } else if (step.operation === "swap") {
        expect(step.variables.swappedLeft).toBeDefined();
        expect(step.variables.swappedRight).toBeDefined();
        expect(step.highlightedElements.length).toBe(2);
      }
    }
  });
});
