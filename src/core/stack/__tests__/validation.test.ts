import { describe, it, expect, beforeEach } from "vitest";
import {
  parseStackInput,
  createStackState,
  resetStackIdCounter,
  MAX_STACK_SIZE,
} from "../validation";

describe("Stack Validation & Creation", () => {
  beforeEach(() => {
    resetStackIdCounter(1);
  });

  describe("parseStackInput", () => {
    it("should parse valid comma- and space-separated strings", () => {
      const res1 = parseStackInput("10, 20, 30");
      expect(res1.isValid).toBe(true);
      expect(res1.data).toEqual([10, 20, 30]);

      const res2 = parseStackInput("10 20 30");
      expect(res2.isValid).toBe(true);
      expect(res2.data).toEqual([10, 20, 30]);

      const res3 = parseStackInput("-5, 0, 99");
      expect(res3.isValid).toBe(true);
      expect(res3.data).toEqual([-5, 0, 99]);
    });

    it("should reject non-numeric values", () => {
      const res = parseStackInput("10, abc, 30");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Invalid value "abc"');
    });

    it("should reject empty strings or whitespace", () => {
      const res = parseStackInput("   ");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("Please enter at least one number");
    });

    it("should reject inputs exceeding MAX_STACK_SIZE", () => {
      const largeArray = Array.from({ length: MAX_STACK_SIZE + 5 }, (_, i) => i + 1).join(",");
      const res = parseStackInput(largeArray);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain(`Please enter ${MAX_STACK_SIZE} or fewer elements`);
    });
  });

  describe("createStackState", () => {
    it("should create a valid stack state with stable IDs and correct TOP", () => {
      const state = createStackState([10, 20, 30]);
      expect(state.items).toHaveLength(3);
      expect(state.items[0]).toEqual({ id: "stack-item-1", value: 10 }); // Bottom
      expect(state.items[1]).toEqual({ id: "stack-item-2", value: 20 });
      expect(state.items[2]).toEqual({ id: "stack-item-3", value: 30 }); // Top
      expect(state.topId).toBe("stack-item-3");
    });

    it("should handle empty stack creation gracefully", () => {
      const state = createStackState([]);
      expect(state.items).toHaveLength(0);
      expect(state.topId).toBeNull();
    });
  });
});
