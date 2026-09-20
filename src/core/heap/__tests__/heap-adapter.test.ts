import { describe, it, expect } from "vitest";
import { HeapAdapter } from "../heap-adapter";
import { createSampleHeapState } from "../validation";
import { generateHeapInsertTrace } from "../trace-generators";

describe("HeapAdapter", () => {
  it("should transform HeapState into VisualizationElements with complete binary tree positions", () => {
    const adapter = new HeapAdapter();
    const state = createSampleHeapState("min");
    const elements = adapter.buildElements(state);

    expect(elements.length).toBe(7);
    expect(elements[0].metadata?.isRoot).toBe(true);
    expect(elements[0].position?.x).toBeGreaterThan(0);
    expect(elements[0].position?.y).toBeGreaterThan(0);

    // Left child of root is index 1, right child is index 2
    expect(elements[0].metadata?.leftId).toBe(state.items[1].id);
    expect(elements[0].metadata?.rightId).toBe(state.items[2].id);
  });

  it("should generate proper connections between parent and children", () => {
    const adapter = new HeapAdapter();
    const state = createSampleHeapState("min");
    const connections = adapter.buildConnections(state);

    // 7 elements in full binary tree has 6 edges
    expect(connections.length).toBe(6);
    expect(connections.some((c) => c.label === "L")).toBe(true);
    expect(connections.some((c) => c.label === "R")).toBe(true);
  });

  it("should generate highlights according to execution step operation", () => {
    const adapter = new HeapAdapter();
    const state = createSampleHeapState("min");
    const trace = generateHeapInsertTrace(state, 5);

    const stepWithSwap = trace.steps.find((s) => s.operation === "swap");
    if (stepWithSwap) {
      const highlights = adapter.buildCustomHighlights(stepWithSwap.state, stepWithSwap);
      expect(highlights.length).toBe(2);
      expect(highlights[0].type).toBe("swapped");
    }
  });
});
