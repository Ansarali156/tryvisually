import { describe, it, expect } from "vitest";
import { generateLinearSearchTrace, generateBinarySearchTrace } from "../trace-generators";

describe("Searching Trace Generators", () => {
  const sampleArr = [12, 24, 37, 45, 59, 68, 83, 91];

  describe("Linear Search", () => {
    it("finds element that exists", () => {
      const trace = generateLinearSearchTrace(sampleArr, 45);
      expect(trace.steps.length).toBeGreaterThan(3);
      const last = trace.steps[trace.steps.length - 1];
      expect(last.state.foundIndex).toBe(3);
      expect(last.state.phaseDescription).toContain("Found target 45 at index 3");
    });

    it("returns -1 when element does not exist", () => {
      const trace = generateLinearSearchTrace(sampleArr, 999);
      const last = trace.steps[trace.steps.length - 1];
      expect(last.state.foundIndex).toBe(-1);
    });

    it("handles empty array gracefully", () => {
      const trace = generateLinearSearchTrace([], 10);
      expect(trace.steps.length).toBe(1);
      expect(trace.steps[0].state.phaseDescription).toContain("Array is empty");
    });
  });

  describe("Binary Search", () => {
    it("finds element via logarithmic halving", () => {
      const trace = generateBinarySearchTrace(sampleArr, 59);
      expect(trace.steps.length).toBeGreaterThan(2);
      const last = trace.steps[trace.steps.length - 1];
      expect(last.state.foundIndex).toBe(4);
    });

    it("terminates with -1 when target not found", () => {
      const trace = generateBinarySearchTrace(sampleArr, 50);
      const last = trace.steps[trace.steps.length - 1];
      expect(last.state.foundIndex).toBe(-1);
      expect(last.state.eliminatedIndices?.length).toBe(sampleArr.length);
    });
  });
});
