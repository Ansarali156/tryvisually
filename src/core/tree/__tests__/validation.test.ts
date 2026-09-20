import { describe, it, expect } from "vitest";
import {
  validateNodeValue,
  generateTreeNodeId,
  createEmptyTreeState,
  createSampleBSTState,
  createSkewedBSTState,
  createSampleBinaryTreeState,
  buildBSTFromValues,
  isValidBST,
  validateTreeInvariants,
  calculateTreeHeight,
  getTreeStatistics,
} from "../validation";

describe("Tree Validation & Builders", () => {
  it("should correctly validate integer values and reject invalid inputs", () => {
    expect(validateNodeValue(42).isValid).toBe(true);
    expect(validateNodeValue("42").isValid).toBe(true);
    expect(validateNodeValue("  -15  ").isValid).toBe(true);
    expect(validateNodeValue("").isValid).toBe(false);
    expect(validateNodeValue(null).isValid).toBe(false);
    expect(validateNodeValue("abc").isValid).toBe(false);
    expect(validateNodeValue(3.14).isValid).toBe(false);
    expect(validateNodeValue(10000).isValid).toBe(false);
  });

  it("should generate deterministic IDs without hydration issues", () => {
    expect(generateTreeNodeId(50)).toBe("node-50");
    expect(generateTreeNodeId(50, "left")).toBe("node-50-left");
  });

  it("should create valid empty, balanced, and skewed tree states", () => {
    const empty = createEmptyTreeState();
    expect(empty.rootId).toBeNull();
    expect(Object.keys(empty.nodes).length).toBe(0);
    expect(isValidBST(empty)).toBe(true);
    expect(validateTreeInvariants(empty).valid).toBe(true);
    expect(calculateTreeHeight(empty)).toBe(-1);

    const balanced = createSampleBSTState();
    expect(balanced.rootId).toBe("node-50");
    expect(Object.keys(balanced.nodes).length).toBe(7);
    expect(isValidBST(balanced)).toBe(true);
    expect(validateTreeInvariants(balanced).valid).toBe(true);
    expect(calculateTreeHeight(balanced)).toBe(2);

    const skewed = createSkewedBSTState();
    expect(skewed.rootId).toBe("node-10");
    expect(Object.keys(skewed.nodes).length).toBe(5);
    expect(isValidBST(skewed)).toBe(true);
    expect(validateTreeInvariants(skewed).valid).toBe(true);
    expect(calculateTreeHeight(skewed)).toBe(4);
  });

  it("should build valid BST from custom values", () => {
    const tree = buildBSTFromValues([50, 30, 70, 20, 40, 60, 80]);
    expect(isValidBST(tree)).toBe(true);
    expect(validateTreeInvariants(tree).valid).toBe(true);
    expect(Object.keys(tree.nodes).length).toBe(7);

    const stats = getTreeStatistics(tree);
    expect(stats.minValue).toBe(20);
    expect(stats.maxValue).toBe(80);
    expect(stats.leafCount).toBe(4);
    expect(stats.isBST).toBe(true);
    expect(stats.isValidStructure).toBe(true);
  });

  it("should detect invalid BST invariants and broken tree structures", () => {
    // Manually break BST invariant: put 90 in left subtree of 50
    const invalidTree = {
      rootId: "node-50",
      nodes: {
        "node-50": { id: "node-50", value: 50, leftId: "node-90", rightId: null, parentId: null },
        "node-90": { id: "node-90", value: 90, leftId: null, rightId: null, parentId: "node-50" },
      },
    };
    expect(isValidBST(invalidTree)).toBe(false);

    // Pointer mismatch
    const brokenTree = {
      rootId: "node-50",
      nodes: {
        "node-50": { id: "node-50", value: 50, leftId: "node-30", rightId: null, parentId: null },
        "node-30": { id: "node-30", value: 30, leftId: null, rightId: null, parentId: "wrong-parent" },
      },
    };
    const inv = validateTreeInvariants(brokenTree);
    expect(inv.valid).toBe(false);
    expect(inv.errors.length).toBeGreaterThan(0);
  });
});
