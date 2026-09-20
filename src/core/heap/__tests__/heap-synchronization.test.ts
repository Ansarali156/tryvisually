import { describe, it, expect } from "vitest";
import { generateHeapInsertTrace, generateHeapExtractRootTrace } from "../trace-generators";
import { createSampleHeapState } from "../validation";
import { getHeapSourceCodes } from "../code-snippets";

describe("Heap Code ↔ Execution Synchronization", () => {
  it("should provide valid 1-indexed codeLine mappings matching the snippet lines", () => {
    const minHeap = createSampleHeapState("min");
    const insertTrace = generateHeapInsertTrace(minHeap, 5);
    const pythonSnippets = getHeapSourceCodes("insert");
    const pyLines = pythonSnippets.python.lines;

    for (const step of insertTrace.steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.codeLine!).toBeGreaterThanOrEqual(1);
      expect(step.codeLine!).toBeLessThanOrEqual(pyLines.length);
      // Ensure the referenced line exists
      expect(pyLines[step.codeLine! - 1]).toBeDefined();
    }

    const extractTrace = generateHeapExtractRootTrace(minHeap);
    const extractSnippets = getHeapSourceCodes("extract-root");
    const extractLines = extractSnippets.python.lines;

    for (const step of extractTrace.steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.codeLine!).toBeGreaterThanOrEqual(1);
      expect(step.codeLine!).toBeLessThanOrEqual(extractLines.length);
      expect(extractLines[step.codeLine! - 1]).toBeDefined();
    }
  });
});
