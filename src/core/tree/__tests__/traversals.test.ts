import { describe, it, expect } from "vitest";
import { generateTreeTraversalTrace } from "../trace-generators";
import { createSampleBSTState, createEmptyTreeState } from "../validation";

describe("Tree Traversals", () => {
  it("should handle empty tree traversals", () => {
    const empty = createEmptyTreeState();
    const trace = generateTreeTraversalTrace(empty, "inorder");
    const lastStep = trace.steps[trace.steps.length - 1];

    expect(lastStep.explanation).toContain("Tree is empty");
    expect(lastStep.state.traversalOutput).toEqual([]);
  });

  it("should produce sorted order for BST inorder traversal (20, 30, 40, 50, 60, 70, 80)", () => {
    const sample = createSampleBSTState();
    const trace = generateTreeTraversalTrace(sample, "inorder", "bst");
    const lastStep = trace.steps[trace.steps.length - 1];

    expect(lastStep.state.traversalOutput).toEqual([20, 30, 40, 50, 60, 70, 80]);

    // Check progressive output builds step-by-step
    const outputs = trace.steps.map((s) => s.state.traversalOutput?.length || 0);
    expect(outputs).toContain(1);
    expect(outputs).toContain(2);
    expect(outputs).toContain(7);
  });

  it("should produce correct preorder traversal (50, 30, 20, 40, 70, 60, 80)", () => {
    const sample = createSampleBSTState();
    const trace = generateTreeTraversalTrace(sample, "preorder", "bst");
    const lastStep = trace.steps[trace.steps.length - 1];

    expect(lastStep.state.traversalOutput).toEqual([50, 30, 20, 40, 70, 60, 80]);
  });

  it("should produce correct postorder traversal (20, 40, 30, 60, 80, 70, 50)", () => {
    const sample = createSampleBSTState();
    const trace = generateTreeTraversalTrace(sample, "postorder", "bst");
    const lastStep = trace.steps[trace.steps.length - 1];

    expect(lastStep.state.traversalOutput).toEqual([20, 40, 30, 60, 80, 70, 50]);
  });

  it("should produce level-order traversal using queue (50, 30, 70, 20, 40, 60, 80)", () => {
    const sample = createSampleBSTState();
    const trace = generateTreeTraversalTrace(sample, "level-order", "bst");
    const lastStep = trace.steps[trace.steps.length - 1];

    expect(lastStep.state.traversalOutput).toEqual([50, 30, 70, 20, 40, 60, 80]);

    // Verify queue was actively tracked in steps
    const stepWithQueue = trace.steps.find((s) => s.variables?.queue && (s.variables.queue as unknown[]).length > 0);
    expect(stepWithQueue).toBeDefined();
  });
});
