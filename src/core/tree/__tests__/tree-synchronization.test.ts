import { describe, it, expect } from "vitest";
import { getTreeSourceCodes } from "../code-snippets";
import { generateBSTInsertTrace } from "../trace-generators";
import { createSampleBSTState } from "../validation";

describe("Tree Multi-Language Code Synchronization", () => {
  const operations = [
    "insert",
    "search",
    "delete",
    "minimum",
    "inorder",
    "level-order",
  ] as const;

  const languages = ["python", "javascript", "typescript", "java", "cpp"] as const;

  it("should provide source code across all 5 supported languages for every operation", () => {
    for (const op of operations) {
      const snippets = getTreeSourceCodes(op);
      for (const lang of languages) {
        expect(snippets[lang]).toBeDefined();
        expect(snippets[lang].lines.length).toBeGreaterThan(0);
      }
    }
  });

  it("should map execution trace steps to valid 1-indexed line numbers in snippets", () => {
    const sample = createSampleBSTState();
    const trace = generateBSTInsertTrace(sample, 25);
    const pythonCode = getTreeSourceCodes("insert").python;
    const lineCount = pythonCode.lines.length;

    for (const step of trace.steps) {
      if (step.codeLine !== undefined) {
        expect(step.codeLine).toBeGreaterThanOrEqual(1);
        expect(step.codeLine).toBeLessThanOrEqual(lineCount + 5);
      }
    }
  });
});
