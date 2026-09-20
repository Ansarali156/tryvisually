import { describe, it, expect } from "vitest";
import {
  areValuesEqual,
  computeVariableDiffs,
  formatVariableValue,
} from "../utils/variable-diff";

describe("Variable Diff & Value Formatting Utilities", () => {
  describe("areValuesEqual", () => {
    it("should correctly compare primitives", () => {
      expect(areValuesEqual(42, 42)).toBe(true);
      expect(areValuesEqual(42, 43)).toBe(false);
      expect(areValuesEqual("hello", "hello")).toBe(true);
      expect(areValuesEqual("hello", "world")).toBe(false);
      expect(areValuesEqual(true, true)).toBe(true);
      expect(areValuesEqual(true, false)).toBe(false);
      expect(areValuesEqual(null, null)).toBe(true);
      expect(areValuesEqual(undefined, undefined)).toBe(true);
      expect(areValuesEqual(null, undefined)).toBe(false);
    });

    it("should correctly compare arrays", () => {
      expect(areValuesEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(areValuesEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(areValuesEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(areValuesEqual([], [])).toBe(true);
    });

    it("should correctly compare objects", () => {
      expect(areValuesEqual({ a: 1, b: "two" }, { a: 1, b: "two" })).toBe(true);
      expect(areValuesEqual({ a: 1, b: "two" }, { a: 1, b: "three" })).toBe(false);
      expect(areValuesEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });
  });

  describe("computeVariableDiffs", () => {
    it("should detect new variables", () => {
      const prev = {};
      const curr = { low: 0, high: 9 };

      const diffs = computeVariableDiffs(prev, curr);
      expect(diffs.low.isNew).toBe(true);
      expect(diffs.low.hasChanged).toBe(true);
      expect(diffs.low.currentValue).toBe(0);
      expect(diffs.low.previousValue).toBeUndefined();

      expect(diffs.high.isNew).toBe(true);
      expect(diffs.high.hasChanged).toBe(true);
    });

    it("should detect modified variables and unchanged variables", () => {
      const prev = { low: 0, high: 9, mid: 4 };
      const curr = { low: 5, high: 9, mid: 7 };

      const diffs = computeVariableDiffs(prev, curr);

      // low changed from 0 to 5
      expect(diffs.low.hasChanged).toBe(true);
      expect(diffs.low.isNew).toBe(false);
      expect(diffs.low.previousValue).toBe(0);
      expect(diffs.low.currentValue).toBe(5);

      // high is unchanged
      expect(diffs.high.hasChanged).toBe(false);
      expect(diffs.high.isNew).toBe(false);
      expect(diffs.high.currentValue).toBe(9);

      // mid changed from 4 to 7
      expect(diffs.mid.hasChanged).toBe(true);
      expect(diffs.mid.previousValue).toBe(4);
      expect(diffs.mid.currentValue).toBe(7);
    });
  });

  describe("formatVariableValue", () => {
    it("should format numbers, strings, and booleans", () => {
      expect(formatVariableValue(42)).toBe("42");
      expect(formatVariableValue("search")).toBe('"search"');
      expect(formatVariableValue(true)).toBe("true");
      expect(formatVariableValue(false)).toBe("false");
      expect(formatVariableValue(null)).toBe("null");
      expect(formatVariableValue(undefined)).toBe("undefined");
    });

    it("should format arrays and objects", () => {
      expect(formatVariableValue([1, 2, 3])).toBe("[1, 2, 3]");
      expect(formatVariableValue([])).toBe("[]");
      expect(formatVariableValue({ low: 0, high: 5 })).toBe('{ low: 0, high: 5 }');
    });
  });
});
