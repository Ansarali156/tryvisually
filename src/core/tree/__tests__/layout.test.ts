import { describe, it, expect } from "vitest";
import { computeTreeLayout } from "../layout";
import { createSampleBSTState, createSkewedBSTState, createEmptyTreeState } from "../validation";

describe("Tree Layout Engine", () => {
  it("should handle empty tree without crashing", () => {
    const empty = createEmptyTreeState();
    const layout = computeTreeLayout(empty);
    expect(layout.maxDepth).toBe(-1);
    expect(Object.keys(layout.positions).length).toBe(0);
    expect(layout.boundingBox.viewBox).toBeDefined();
  });

  it("should position nodes preserving horizontal ordering (left < parent < right)", () => {
    const balanced = createSampleBSTState();
    const layout = computeTreeLayout(balanced);

    expect(Object.keys(layout.positions).length).toBe(7);

    const root = layout.positions["node-50"];
    const leftChild = layout.positions["node-30"];
    const rightChild = layout.positions["node-70"];
    const leftGrandChild = layout.positions["node-20"];
    const rightGrandChild = layout.positions["node-40"];

    // In-order horizontal progression: 20 < 30 < 40 < 50 < 60 < 70 < 80
    expect(leftChild.x).toBeLessThan(root.x);
    expect(rightChild.x).toBeGreaterThan(root.x);
    expect(leftGrandChild.x).toBeLessThan(leftChild.x);
    expect(rightGrandChild.x).toBeGreaterThan(leftChild.x);

    // Vertical stratification: depth 0 < depth 1 < depth 2
    expect(root.y).toBeLessThan(leftChild.y);
    expect(leftChild.y).toBe(rightChild.y);
    expect(leftChild.y).toBeLessThan(leftGrandChild.y);
  });

  it("should lay out skewed trees with strict depth and horizontal spacing", () => {
    const skewed = createSkewedBSTState();
    const layout = computeTreeLayout(skewed);

    expect(layout.maxDepth).toBe(4);
    expect(Object.keys(layout.positions).length).toBe(5);

    const n10 = layout.positions["node-10"];
    const n20 = layout.positions["node-20"];
    const n30 = layout.positions["node-30"];

    expect(n10.x).toBeLessThan(n20.x);
    expect(n20.x).toBeLessThan(n30.x);
    expect(n10.y).toBeLessThan(n20.y);
    expect(n20.y).toBeLessThan(n30.y);
  });
});
