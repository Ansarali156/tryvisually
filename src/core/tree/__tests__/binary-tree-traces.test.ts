import { describe, it, expect } from "vitest";
import {
  generateBinaryTreeInsertNodeTrace,
  generateBinaryTreeUpdateTrace,
  generateClearTreeTrace,
} from "../trace-generators";
import {
  createSampleBinaryTreeState,
  createEmptyTreeState,
  validateTreeInvariants,
} from "../validation";

describe("General Binary Tree Traces", () => {
  it("should insert into empty binary tree as root", () => {
    const empty = createEmptyTreeState();
    const trace = generateBinaryTreeInsertNodeTrace(empty, null, "left", 10);
    const finalState = trace.steps[trace.steps.length - 1].state;

    expect(finalState.rootId).toBe("node-10");
    expect(finalState.nodes["node-10"].value).toBe(10);
    expect(validateTreeInvariants(finalState).valid).toBe(true);
  });

  it("should insert child under selected parent in chosen direction", () => {
    const sample = createSampleBinaryTreeState();
    // Node 15 in sample has no left or right child. Insert 18 as left child.
    const trace = generateBinaryTreeInsertNodeTrace(sample, "node-15", "left", 18);
    const finalState = trace.steps[trace.steps.length - 1].state;

    expect(finalState.nodes["node-15"].leftId).toBeDefined();
    const newChildId = finalState.nodes["node-15"].leftId!;
    expect(finalState.nodes[newChildId].value).toBe(18);
    expect(finalState.nodes[newChildId].parentId).toBe("node-15");
    expect(validateTreeInvariants(finalState).valid).toBe(true);
  });

  it("should reject insertion if selected child slot is already occupied", () => {
    const sample = createSampleBinaryTreeState();
    // Node 10 already has a left child (node-5)
    const trace = generateBinaryTreeInsertNodeTrace(sample, "node-10", "left", 99);
    const lastStep = trace.steps[trace.steps.length - 1];

    expect(lastStep.explanation).toContain("already has a left child");
  });

  it("should update node value in place", () => {
    const sample = createSampleBinaryTreeState();
    const trace = generateBinaryTreeUpdateTrace(sample, "node-2", 42);
    const finalState = trace.steps[trace.steps.length - 1].state;

    expect(finalState.nodes["node-2"].value).toBe(42);
    expect(validateTreeInvariants(finalState).valid).toBe(true);
  });

  it("should clear the entire tree", () => {
    const trace = generateClearTreeTrace();
    const finalState = trace.steps[0].state;

    expect(finalState.rootId).toBeNull();
    expect(Object.keys(finalState.nodes).length).toBe(0);
  });
});
