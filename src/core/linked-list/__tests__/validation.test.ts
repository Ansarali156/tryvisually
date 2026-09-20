import { describe, it, expect, beforeEach } from "vitest";
import {
  parseLinkedListInput,
  createLinkedListState,
  validateNodePosition,
  validateIndex,
  resetNodeIdCounter,
  MAX_LINKED_LIST_SIZE,
} from "../validation";

describe("LinkedList Validation and Creation", () => {
  beforeEach(() => {
    resetNodeIdCounter(1);
  });

  describe("parseLinkedListInput", () => {
    it("should parse valid comma-separated and space-separated strings", () => {
      const res1 = parseLinkedListInput("10, 20, 30");
      expect(res1.isValid).toBe(true);
      expect(res1.data).toEqual([10, 20, 30]);

      const res2 = parseLinkedListInput("10 20 30");
      expect(res2.isValid).toBe(true);
      expect(res2.data).toEqual([10, 20, 30]);

      const res3 = parseLinkedListInput("15, -4, 99, 0");
      expect(res3.isValid).toBe(true);
      expect(res3.data).toEqual([15, -4, 99, 0]);
    });

    it("should reject non-numeric values", () => {
      const res = parseLinkedListInput("10, abc, 30");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Invalid value "abc"');
    });

    it("should reject empty strings or whitespace", () => {
      const res = parseLinkedListInput("   ");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("Please enter at least one node value");
    });

    it("should reject inputs exceeding MAX_LINKED_LIST_SIZE", () => {
      const largeArray = Array.from({ length: MAX_LINKED_LIST_SIZE + 5 }, (_, i) => i + 1).join(",");
      const res = parseLinkedListInput(largeArray);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain(`Please enter ${MAX_LINKED_LIST_SIZE} or fewer nodes`);
    });
  });

  describe("createLinkedListState", () => {
    it("should create a valid singly linked list with stable IDs and pointers", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      expect(state.variant).toBe("singly");
      expect(state.headId).toBe("node-1");
      expect(state.tailId).toBe("node-3");
      expect(state.nodes).toHaveLength(3);

      expect(state.nodes[0]).toEqual({ id: "node-1", value: 10 });
      expect(state.nodes[1]).toEqual({ id: "node-2", value: 20 });
      expect(state.nodes[2]).toEqual({ id: "node-3", value: 30 });

      expect(state.next["node-1"]).toBe("node-2");
      expect(state.next["node-2"]).toBe("node-3");
      expect(state.next["node-3"]).toBeNull();
      expect(state.previous).toBeUndefined();
    });

    it("should create a valid doubly linked list with bidirectional pointers", () => {
      const state = createLinkedListState([10, 20, 30], "doubly");
      expect(state.variant).toBe("doubly");
      expect(state.previous).toBeDefined();
      expect(state.previous!["node-1"]).toBeNull();
      expect(state.previous!["node-2"]).toBe("node-1");
      expect(state.previous!["node-3"]).toBe("node-2");

      expect(state.next["node-1"]).toBe("node-2");
      expect(state.next["node-2"]).toBe("node-3");
      expect(state.next["node-3"]).toBeNull();
    });

    it("should create a valid circular linked list with tail.next pointing to head", () => {
      const state = createLinkedListState([10, 20, 30], "circular");
      expect(state.variant).toBe("circular");
      expect(state.headId).toBe("node-1");
      expect(state.tailId).toBe("node-3");
      expect(state.next["node-3"]).toBe("node-1");
    });

    it("should handle single-node circular list pointing to itself", () => {
      const state = createLinkedListState([42], "circular");
      expect(state.headId).toBe("node-1");
      expect(state.tailId).toBe("node-1");
      expect(state.next["node-1"]).toBe("node-1");
    });

    it("should handle empty list creation gracefully", () => {
      const state = createLinkedListState([], "singly");
      expect(state.headId).toBeNull();
      expect(state.tailId).toBeNull();
      expect(state.nodes).toHaveLength(0);
      expect(Object.keys(state.next)).toHaveLength(0);
    });
  });

  describe("validateNodePosition & validateIndex", () => {
    it("should validate in-range and reject out-of-range indices", () => {
      expect(validateIndex(0, 3).isValid).toBe(true);
      expect(validateIndex(2, 3).isValid).toBe(true);
      expect(validateIndex(-1, 3).isValid).toBe(false);
      expect(validateIndex(3, 3).isValid).toBe(false);
    });

    it("should allow position === length when isInsert is true", () => {
      expect(validateIndex(3, 3, true).isValid).toBe(true);
      expect(validateIndex(4, 3, true).isValid).toBe(false);
    });
  });
});
