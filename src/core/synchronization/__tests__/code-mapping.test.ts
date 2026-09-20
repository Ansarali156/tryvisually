import { describe, it, expect } from "vitest";
import {
  LanguageCodeMappingRegistry,
  resolveActiveLines,
} from "../utils/code-mapping";
import { parseSourceCode, getSourceLine } from "../utils/source-code";
import type { ExecutionStep } from "@/core/execution/types";

describe("Code Mapping & Source Code Model", () => {
  describe("Source Code Model", () => {
    it("should parse raw code into 1-indexed lines", () => {
      const raw = `def hello():\n    return "world"`;
      const parsed = parseSourceCode(raw, "python");

      expect(parsed.language).toBe("python");
      expect(parsed.lines).toHaveLength(2);
      expect(parsed.lines[0]).toEqual({ lineNumber: 1, content: "def hello():" });
      expect(parsed.lines[1]).toEqual({ lineNumber: 2, content: '    return "world"' });
    });

    it("should safely retrieve lines by 1-indexed line number", () => {
      const parsed = parseSourceCode("line1\nline2\nline3", "python");

      expect(getSourceLine(parsed, 1)?.content).toBe("line1");
      expect(getSourceLine(parsed, 3)?.content).toBe("line3");
      expect(getSourceLine(parsed, 0)).toBeUndefined();
      expect(getSourceLine(parsed, 4)).toBeUndefined();
    });
  });

  describe("LanguageCodeMappingRegistry", () => {
    it("should register and retrieve mappings per language and stepId", () => {
      const registry = new LanguageCodeMappingRegistry();
      registry.register({ language: "python", stepId: 5, codeLines: [10, 11] });
      registry.register({ language: "java", stepId: 5, codeLines: [14, 15] });

      expect(registry.getLines("python", 5)).toEqual([10, 11]);
      expect(registry.getLines("java", 5)).toEqual([14, 15]);
      expect(registry.getLines("cpp", 5)).toBeUndefined();
    });
  });

  describe("resolveActiveLines Priority", () => {
    const dummyStep: ExecutionStep = {
      id: 2,
      codeLine: 8,
      operation: "compare",
      variables: {},
      state: {},
      highlightedElements: [],
      explanation: "",
    };

    it("should prioritize registry mappings over canonical step.codeLine", () => {
      const registry = new LanguageCodeMappingRegistry();
      registry.register({ language: "python", stepId: 2, codeLines: [12] });

      const lines = resolveActiveLines(dummyStep, "python", registry);
      expect(lines).toEqual([12]);
    });

    it("should fallback to canonical step.codeLine when no registry mapping exists", () => {
      const lines = resolveActiveLines(dummyStep, "python");
      expect(lines).toEqual([8]);
    });

    it("should return empty array when no line is defined", () => {
      const noLineStep: ExecutionStep = {
        id: 0,
        operation: "visit",
        variables: {},
        state: {},
        highlightedElements: [],
        explanation: "",
      };

      expect(resolveActiveLines(noLineStep, "python")).toEqual([]);
      expect(resolveActiveLines(null, "python")).toEqual([]);
    });

    it("should support multiple code lines via metadata", () => {
      const multiLineStep: ExecutionStep = {
        id: 3,
        operation: "swap",
        variables: {},
        state: {},
        highlightedElements: [],
        explanation: "",
        metadata: {
          codeLines: [10, 11, 12],
        },
      };

      const lines = resolveActiveLines(multiLineStep, "typescript");
      expect(lines).toEqual([10, 11, 12]);
    });
  });
});
