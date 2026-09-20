import { describe, it, expect, beforeEach } from "vitest";
import {
  createAccessTrace,
  createUpdateTrace,
  createInsertTrace,
  createDeleteTrace,
  createLinearSearchTrace,
  createCompareTrace,
  createSwapTrace,
  createBubbleSortTrace,
} from "../trace-generators";
import { createArrayState, resetElementIdCounter } from "../validation";
import type { ArrayState } from "../types";

describe("Array Trace Generators", () => {
  beforeEach(() => {
    resetElementIdCounter(1);
  });

  describe("Access Operation Trace", () => {
    it("generates deterministic trace for valid index", () => {
      const state = createArrayState([10, 20, 30]);
      const trace = createAccessTrace(state, 1);

      expect(trace.steps.length).toBeGreaterThanOrEqual(3);
      expect(trace.steps[0].id).toBe(0);
      expect(trace.steps[1].operation).toBe("select");
      expect(trace.steps[1].variables.value).toBe(20);
      expect(trace.steps[1].highlightedElements).toContain("array-item-2");
      expect(trace.steps[2].operation).toBe("return");
      expect(trace.finalState.items[1].value).toBe(20);
    });

    it("handles out of bounds access gracefully without crashing", () => {
      const state = createArrayState([10, 20]);
      const trace = createAccessTrace(state, 99);
      expect(trace.steps[0].variables.error).toBe("Index out of bounds");
    });
  });

  describe("Update Operation Trace", () => {
    it("updates value while strictly preserving stable element ID", () => {
      const state = createArrayState([10, 20, 30]);
      const originalId = state.items[1].id; // "array-item-2"

      const trace = createUpdateTrace(state, 1, 99);
      expect(trace.finalState.items[1].value).toBe(99);
      expect(trace.finalState.items[1].id).toBe(originalId); // ID PRESERVED!

      // Other elements unchanged
      expect(trace.finalState.items[0].value).toBe(10);
      expect(trace.finalState.items[2].value).toBe(30);
    });
  });

  describe("Insert Operation Trace", () => {
    it("inserts in the middle and shifts subsequent elements", () => {
      const state = createArrayState([10, 20, 40]);
      const originalId0 = state.items[0].id;
      const originalId1 = state.items[1].id;
      const originalId2 = state.items[2].id;

      const trace = createInsertTrace(state, 2, 30);
      expect(trace.finalState.items.map((i) => i.value)).toEqual([10, 20, 30, 40]);

      // Previous elements retained their stable IDs
      expect(trace.finalState.items[0].id).toBe(originalId0);
      expect(trace.finalState.items[1].id).toBe(originalId1);
      expect(trace.finalState.items[3].id).toBe(originalId2);

      // New element has its own distinct ID
      expect(trace.finalState.items[2].value).toBe(30);
      expect(trace.finalState.items[2].id).toBeDefined();
      expect(trace.finalState.items[2].id).not.toBe(originalId2);
    });

    it("inserts at beginning (index 0)", () => {
      const state = createArrayState([20, 30]);
      const trace = createInsertTrace(state, 0, 10);
      expect(trace.finalState.items.map((i) => i.value)).toEqual([10, 20, 30]);
    });

    it("inserts at end (index equal to length)", () => {
      const state = createArrayState([10, 20]);
      const trace = createInsertTrace(state, 2, 30);
      expect(trace.finalState.items.map((i) => i.value)).toEqual([10, 20, 30]);
    });
  });

  describe("Delete Operation Trace", () => {
    it("deletes element at index and shifts remaining elements left", () => {
      const state = createArrayState([10, 20, 30, 40]);
      const deletedId = state.items[1].id;
      const retainedId2 = state.items[2].id;
      const retainedId3 = state.items[3].id;

      const trace = createDeleteTrace(state, 1);
      expect(trace.finalState.items.map((i) => i.value)).toEqual([10, 30, 40]);

      // Retained elements kept their exact IDs
      expect(trace.finalState.items[1].id).toBe(retainedId2);
      expect(trace.finalState.items[2].id).toBe(retainedId3);

      // Deleted element ID is not present in final state
      expect(trace.finalState.items.some((i) => i.id === deletedId)).toBe(false);
    });
  });

  describe("Linear Search Trace", () => {
    it("finds target value and marks step as found", () => {
      const state = createArrayState([10, 20, 30, 40]);
      const trace = createLinearSearchTrace(state, 30);

      const foundStep = trace.steps.find((s) => s.operation === "found");
      expect(foundStep).toBeDefined();
      expect(foundStep?.variables.resultIndex).toBe(2);
      expect(foundStep?.highlightedElements).toContain(state.items[2].id);
    });

    it("handles target not found cleanly", () => {
      const state = createArrayState([10, 20, 30]);
      const trace = createLinearSearchTrace(state, 99);

      const foundStep = trace.steps.find((s) => s.operation === "found");
      expect(foundStep).toBeUndefined();

      const lastStep = trace.steps[trace.steps.length - 1];
      expect(lastStep.variables.resultIndex).toBe(-1);
      expect(lastStep.explanation).toContain("not found");
    });
  });

  describe("Compare Operation Trace", () => {
    it("highlights both elements and evaluates comparison correctly", () => {
      const state = createArrayState([15, 30]);
      const trace = createCompareTrace(state, 0, 1);

      const compareStep = trace.steps.find((s) => s.operation === "compare");
      expect(compareStep).toBeDefined();
      expect(compareStep?.highlightedElements).toContain(state.items[0].id);
      expect(compareStep?.highlightedElements).toContain(state.items[1].id);
      expect(compareStep?.variables.comparisonResult).toBe("less");
    });
  });

  describe("Swap Operation Trace (Mandatory Stable ID Test)", () => {
    it("exchanges positions of elements while strictly preserving stable IDs", () => {
      const state = createArrayState([10, 20, 30]);
      const id0 = state.items[0].id; // "array-item-1" (10)
      const id1 = state.items[1].id; // "array-item-2" (20)

      const trace = createSwapTrace(state, 0, 1);

      expect(trace.finalState.items[0].value).toBe(20);
      expect(trace.finalState.items[0].id).toBe(id1); // Swapped element kept id1!

      expect(trace.finalState.items[1].value).toBe(10);
      expect(trace.finalState.items[1].id).toBe(id0); // Swapped element kept id0!

      expect(trace.finalState.items[2].id).toBe(state.items[2].id);
    });
  });

  describe("Bubble Sort Trace Correctness & Stable IDs", () => {
    it("correctly sorts [5, 3, 8, 1] to [1, 3, 5, 8]", () => {
      const state = createArrayState([5, 3, 8, 1]);
      const originalElements = new Map(state.items.map((i) => [i.value, i.id]));

      const trace = createBubbleSortTrace(state);
      const finalValues = trace.finalState.items.map((i) => i.value);
      expect(finalValues).toEqual([1, 3, 5, 8]);

      // Verify each element still has its original ID
      for (const item of trace.finalState.items) {
        expect(item.id).toBe(originalElements.get(item.value));
      }
    });

    it("correctly handles already sorted array [1, 2, 3, 4] with early termination", () => {
      const state = createArrayState([1, 2, 3, 4]);
      const trace = createBubbleSortTrace(state);
      expect(trace.finalState.items.map((i) => i.value)).toEqual([1, 2, 3, 4]);

      // Early termination step should be recorded
      const earlyTermStep = trace.steps.find((s) => s.variables.earlyTermination === true);
      expect(earlyTermStep).toBeDefined();
    });

    it("correctly sorts reverse sorted array [4, 3, 2, 1] to [1, 2, 3, 4]", () => {
      const state = createArrayState([4, 3, 2, 1]);
      const trace = createBubbleSortTrace(state);
      expect(trace.finalState.items.map((i) => i.value)).toEqual([1, 2, 3, 4]);
    });

    it("handles duplicates and negative values [-5, 10, -5, 0]", () => {
      const state = createArrayState([-5, 10, -5, 0]);
      const trace = createBubbleSortTrace(state);
      expect(trace.finalState.items.map((i) => i.value)).toEqual([-5, -5, 0, 10]);
    });

    it("handles single element trivially", () => {
      const state = createArrayState([42]);
      const trace = createBubbleSortTrace(state);
      expect(trace.finalState.items.map((i) => i.value)).toEqual([42]);
      expect(trace.steps.length).toBeGreaterThan(0);
    });
  });

  describe("Trace Invariants", () => {
    it("all step IDs must be sequential starting at 0", () => {
      const state = createArrayState([3, 1, 2]);
      const trace = createBubbleSortTrace(state);

      trace.steps.forEach((step, idx) => {
        expect(step.id).toBe(idx);
        expect(step.state).toBeDefined();
        expect(step.explanation).toBeTruthy();
      });
    });
  });
});
