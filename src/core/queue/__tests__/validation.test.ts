import { describe, it, expect, beforeEach } from "vitest";
import {
  parseQueueInput,
  createQueueState,
  resetQueueIdCounter,
  MAX_QUEUE_CAPACITY,
} from "../validation";

describe("Queue Validation & Creation", () => {
  beforeEach(() => {
    resetQueueIdCounter(1);
  });

  describe("parseQueueInput", () => {
    it("should parse valid comma- and space-separated strings", () => {
      const res1 = parseQueueInput("10, 20, 30");
      expect(res1.isValid).toBe(true);
      expect(res1.data).toEqual([10, 20, 30]);

      const res2 = parseQueueInput("10 20 30");
      expect(res2.isValid).toBe(true);
      expect(res2.data).toEqual([10, 20, 30]);
    });

    it("should reject non-numeric values", () => {
      const res = parseQueueInput("10, abc, 30");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Invalid value "abc"');
    });

    it("should reject inputs exceeding capacity", () => {
      const largeArray = Array.from({ length: MAX_QUEUE_CAPACITY + 5 }, (_, i) => i + 1).join(",");
      const res = parseQueueInput(largeArray, MAX_QUEUE_CAPACITY);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain(`Please enter ${MAX_QUEUE_CAPACITY} or fewer elements`);
    });
  });

  describe("createQueueState", () => {
    it("should create a valid Linear Queue with FRONT and REAR pointers", () => {
      const state = createQueueState([10, 20, 30], "linear");
      expect(state.variant).toBe("linear");
      expect(state.size).toBe(3);
      expect(state.frontIndex).toBe(0);
      expect(state.rearIndex).toBe(2);
      expect(state.frontId).toBe("queue-item-1");
      expect(state.rearId).toBe("queue-item-3");
    });

    it("should create a valid Circular Queue with bounded slot buffers", () => {
      const state = createQueueState([10, 20], "circular", 5);
      expect(state.variant).toBe("circular");
      expect(state.capacity).toBe(5);
      expect(state.items).toHaveLength(5);
      expect(state.items[0]?.value).toBe(10);
      expect(state.items[1]?.value).toBe(20);
      expect(state.items[2]).toBeNull();
      expect(state.frontIndex).toBe(0);
      expect(state.rearIndex).toBe(1);
    });

    it("should handle empty queue state", () => {
      const state = createQueueState([], "linear");
      expect(state.size).toBe(0);
      expect(state.frontIndex).toBe(-1);
      expect(state.rearIndex).toBe(-1);
      expect(state.frontId).toBeNull();
      expect(state.rearId).toBeNull();
    });
  });
});
