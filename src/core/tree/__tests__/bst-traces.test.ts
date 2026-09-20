import { describe, it, expect } from "vitest";
import {
  generateBSTInsertTrace,
  generateBSTSearchTrace,
  generateBSTExtremeTrace,
  generateBSTSuccessorPredecessorTrace,
  generateBSTDeleteTrace,
} from "../trace-generators";
import {
  createSampleBSTState,
  createEmptyTreeState,
  isValidBST,
  validateTreeInvariants,
} from "../validation";

describe("BST Trace Generators", () => {
  describe("BST Insert", () => {
    it("should insert into an empty tree and make it root", () => {
      const empty = createEmptyTreeState();
      const trace = generateBSTInsertTrace(empty, 50);
      expect(trace.steps.length).toBeGreaterThanOrEqual(2);

      const finalState = trace.steps[trace.steps.length - 1].state;
      expect(finalState.rootId).toBe("node-50");
      expect(finalState.nodes["node-50"].value).toBe(50);
      expect(isValidBST(finalState)).toBe(true);
      expect(validateTreeInvariants(finalState).valid).toBe(true);
    });

    it("should navigate comparisons and insert preserving BST invariant", () => {
      const sample = createSampleBSTState();
      const trace = generateBSTInsertTrace(sample, 25);
      const finalState = trace.steps[trace.steps.length - 1].state;

      expect(finalState.nodes["node-25"]).toBeDefined();
      expect(finalState.nodes["node-25"].parentId).toBe("node-20");
      expect(finalState.nodes["node-20"].rightId).toBe("node-25");
      expect(isValidBST(finalState)).toBe(true);
      expect(validateTreeInvariants(finalState).valid).toBe(true);
    });

    it("should reject duplicate value with educational explanation", () => {
      const sample = createSampleBSTState();
      const trace = generateBSTInsertTrace(sample, 30);
      const lastStep = trace.steps[trace.steps.length - 2];

      expect(lastStep.explanation).toContain("already exists");
      expect(lastStep.variables?.status).toBe("duplicate rejected");
    });
  });

  describe("BST Search & Contains", () => {
    it("should find an existing value and highlight found node", () => {
      const sample = createSampleBSTState();
      const trace = generateBSTSearchTrace(sample, 60, "search");
      const finalStep = trace.steps.find((s) => s.variables?.status === "FOUND");

      expect(finalStep).toBeDefined();
      expect(finalStep?.highlightedElements).toContain("node-60");
    });

    it("should return not found when target does not exist in BST", () => {
      const sample = createSampleBSTState();
      const trace = generateBSTSearchTrace(sample, 999, "search");
      const notFoundStep = trace.steps[trace.steps.length - 1];

      expect(notFoundStep.variables?.status).toBe("NOT FOUND");
      expect(notFoundStep.explanation).toContain("does not exist");
    });

    it("should return boolean in contains trace", () => {
      const sample = createSampleBSTState();
      const traceTrue = generateBSTSearchTrace(sample, 40, "contains");
      const stepTrue = traceTrue.steps.find((s) => s.variables?.result === true);
      expect(stepTrue).toBeDefined();

      const traceFalse = generateBSTSearchTrace(sample, 45, "contains");
      const stepFalse = traceFalse.steps[traceFalse.steps.length - 1];
      expect(stepFalse.variables?.result).toBe(false);
    });
  });

  describe("BST Extreme (Min / Max)", () => {
    it("should follow left pointers to minimum", () => {
      const sample = createSampleBSTState();
      const trace = generateBSTExtremeTrace(sample, true);
      const lastStep = trace.steps[trace.steps.length - 1];

      expect(lastStep.variables?.result).toBe(20);
      expect(lastStep.highlightedElements).toContain("node-20");
    });

    it("should follow right pointers to maximum", () => {
      const sample = createSampleBSTState();
      const trace = generateBSTExtremeTrace(sample, false);
      const lastStep = trace.steps[trace.steps.length - 1];

      expect(lastStep.variables?.result).toBe(80);
      expect(lastStep.highlightedElements).toContain("node-80");
    });
  });

  describe("BST Successor & Predecessor", () => {
    it("should find successor using right subtree minimum when right child exists", () => {
      const sample = createSampleBSTState();
      // Successor of 50 is minimum of right subtree (60)
      const trace = generateBSTSuccessorPredecessorTrace(sample, 50, true);
      const foundStep = trace.steps.find((s) => s.variables?.successor === 60);

      expect(foundStep).toBeDefined();
    });

    it("should find successor by walking up ancestors when no right child exists", () => {
      const sample = createSampleBSTState();
      // Successor of 40: 40 has no right child; ancestor walk gives 50
      const trace = generateBSTSuccessorPredecessorTrace(sample, 40, true);
      const foundStep = trace.steps.find((s) => s.variables?.successor === 50);

      expect(foundStep).toBeDefined();
    });

    it("should find predecessor of 50 as maximum of left subtree (40)", () => {
      const sample = createSampleBSTState();
      const trace = generateBSTSuccessorPredecessorTrace(sample, 50, false);
      const foundStep = trace.steps.find((s) => s.variables?.predecessor === 40);

      expect(foundStep).toBeDefined();
    });
  });

  describe("BST Delete (All 3 Cases)", () => {
    it("Case 1: should delete a leaf node cleanly", () => {
      const sample = createSampleBSTState();
      const trace = generateBSTDeleteTrace(sample, 20);
      const finalState = trace.steps[trace.steps.length - 1].state;

      expect(finalState.nodes["node-20"]).toBeUndefined();
      expect(finalState.nodes["node-30"].leftId).toBeNull();
      expect(isValidBST(finalState)).toBe(true);
      expect(validateTreeInvariants(finalState).valid).toBe(true);
    });

    it("Case 2: should delete a node with one child and reconnect", () => {
      // Create a tree with a 1-child node
      const sample = createSampleBSTState();
      // Delete 20 first, so 30 has only one child (40)
      const t1 = generateBSTDeleteTrace(sample, 20);
      const stateWithOneChild = t1.steps[t1.steps.length - 1].state;

      const trace = generateBSTDeleteTrace(stateWithOneChild, 30);
      const finalState = trace.steps[trace.steps.length - 1].state;

      expect(finalState.nodes["node-30"]).toBeUndefined();
      expect(finalState.nodes["node-50"].leftId).toBe("node-40");
      expect(finalState.nodes["node-40"].parentId).toBe("node-50");
      expect(isValidBST(finalState)).toBe(true);
      expect(validateTreeInvariants(finalState).valid).toBe(true);
    });

    it("Case 3 (Mandatory Acceptance Test 44): should delete two-child node 70 using inorder successor", () => {
      const sample = createSampleBSTState();
      // Node 70 has left child 60 and right child 80
      const trace = generateBSTDeleteTrace(sample, 70);

      // Verify trace step details
      const twoChildStep = trace.steps.find((s) => s.variables?.case === "Case 3: Two children");
      expect(twoChildStep).toBeDefined();
      expect(twoChildStep?.explanation).toContain("Finding inorder successor");

      const successorFoundStep = trace.steps.find((s) => s.variables?.successor !== undefined);
      expect(successorFoundStep).toBeDefined();
      expect(successorFoundStep?.variables?.successor).toBe(80);

      const finalState = trace.steps[trace.steps.length - 1].state;
      // In the final state, the node formerly 70 now has value 80
      expect(finalState.nodes["node-70"].value).toBe(80);
      expect(finalState.nodes["node-80"]).toBeUndefined();
      expect(isValidBST(finalState)).toBe(true);
      expect(validateTreeInvariants(finalState).valid).toBe(true);
    });
  });
});
