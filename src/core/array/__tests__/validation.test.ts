import { describe, it, expect, beforeEach } from "vitest";
import {
  parseArrayInput,
  validateIndex,
  createArrayState,
  resetElementIdCounter,
  MAX_ARRAY_SIZE,
} from "../validation";

describe("Array Input Validation & State Creation", () => {
  beforeEach(() => {
    resetElementIdCounter(1);
  });

  it("should create valid ArrayState with stable sequential IDs", () => {
    const state = createArrayState([10, 20, 30]);
    expect(state.items).toHaveLength(3);
    expect(state.items[0]).toEqual({ id: "array-item-1", value: 10 });
    expect(state.items[1]).toEqual({ id: "array-item-2", value: 20 });
    expect(state.items[2]).toEqual({ id: "array-item-3", value: 30 });
  });

  it("should parse comma-separated integers with spaces", () => {
    const result = parseArrayInput("10, 20, 30, 40");
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual([10, 20, 30, 40]);
  });

  it("should parse whitespace-separated integers without commas", () => {
    const result = parseArrayInput("5 15 25 35");
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual([5, 15, 25, 35]);
  });

  it("should accept negative numbers and duplicates", () => {
    const result = parseArrayInput("-10, 0, 10, 10, -5");
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual([-10, 0, 10, 10, -5]);
  });

  it("should reject empty input", () => {
    const result = parseArrayInput("   ");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Please enter at least one number");
  });

  it("should reject non-numeric characters gracefully", () => {
    const result = parseArrayInput("10, abc, 20");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid value "abc"');
  });

  it("should reject input exceeding MAX_ARRAY_SIZE limit (30 elements)", () => {
    const largeList = Array.from({ length: MAX_ARRAY_SIZE + 5 }, (_, i) => i + 1).join(", ");
    const result = parseArrayInput(largeList);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`Please enter ${MAX_ARRAY_SIZE} or fewer elements`);
  });

  it("should reject numbers outside allowed display range", () => {
    const result = parseArrayInput("10, 9999999");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("out of display range");
  });

  describe("Index Validation", () => {
    it("should accept valid indices for standard operations", () => {
      expect(validateIndex(0, 5).isValid).toBe(true);
      expect(validateIndex(4, 5).isValid).toBe(true);
    });

    it("should reject negative indices", () => {
      const res = validateIndex(-1, 5);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("cannot be negative");
    });

    it("should reject out-of-bounds indices for access/update/delete", () => {
      const res = validateIndex(5, 5);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("out of bounds");
    });

    it("should allow index equal to array length for insertion", () => {
      expect(validateIndex(5, 5, true).isValid).toBe(true);
      expect(validateIndex(6, 5, true).isValid).toBe(false);
    });
  });
});
