import { describe, it, expect, beforeEach } from "vitest";
import { defaultArrayAdapter, ARRAY_ITEM_WIDTH } from "../array-adapter";
import { createArrayState, resetElementIdCounter } from "../validation";
import { createBubbleSortTrace, createLinearSearchTrace } from "../trace-generators";

describe("ArrayAdapter", () => {
  beforeEach(() => {
    resetElementIdCounter(1);
  });

  it("builds visual elements with stable IDs, numeric values, and spatial coordinates", () => {
    const state = createArrayState([10, 20, 30]);
    const visState = defaultArrayAdapter.createInitialState(state);

    expect(visState.elements).toHaveLength(3);
    expect(visState.elements[0].id).toBe("array-item-1");
    expect(visState.elements[0].value).toBe(10);
    expect(visState.elements[0].position).toEqual({ x: 0, y: 0 });

    expect(visState.elements[1].id).toBe("array-item-2");
    expect(visState.elements[1].value).toBe(20);
    expect(visState.elements[1].position).toEqual({ x: ARRAY_ITEM_WIDTH, y: 0 });

    expect(visState.elements[2].id).toBe("array-item-3");
    expect(visState.elements[2].value).toBe(30);
    expect(visState.elements[2].position).toEqual({ x: 2 * ARRAY_ITEM_WIDTH, y: 0 });
  });

  it("extracts educational pointer annotations from step metadata", () => {
    const state = createArrayState([10, 20, 30]);
    const trace = createLinearSearchTrace(state, 20);

    const stepWithPointer = trace.steps.find(
      (s) => s.metadata?.pointers && (s.metadata.pointers as unknown[]).length > 0
    );
    expect(stepWithPointer).toBeDefined();

    const visState = defaultArrayAdapter.transform(stepWithPointer!.state, stepWithPointer);
    expect(visState.annotations.length).toBeGreaterThan(0);
    expect(visState.annotations[0].type).toBe("pointer");
    expect(visState.annotations[0].targetId).toBeDefined();
  });

  it("derives comparison and swap highlights according to step operation", () => {
    const state = createArrayState([20, 10]);
    const trace = createBubbleSortTrace(state);

    const compareStep = trace.steps.find((s) => s.operation === "compare");
    expect(compareStep).toBeDefined();

    const compareVis = defaultArrayAdapter.transform(compareStep!.state, compareStep);
    expect(compareVis.highlights.some((h) => h.type === "compare")).toBe(true);

    const swapStep = trace.steps.find((s) => s.operation === "swap");
    expect(swapStep).toBeDefined();

    const swapVis = defaultArrayAdapter.transform(swapStep!.state, swapStep);
    expect(swapVis.highlights.some((h) => h.type === "swapped")).toBe(true);
  });
});
