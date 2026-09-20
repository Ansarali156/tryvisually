import { describe, it, expect, beforeEach } from "vitest";
import { createQueueState, resetQueueIdCounter } from "../validation";
import {
  createEnqueueTrace,
  createDequeueTrace,
  createFrontTrace,
  createRearTrace,
  createIsEmptyTrace,
  createIsFullTrace,
  createSizeTrace,
  createClearTrace,
  generateQueueTrace,
} from "../trace-generators";
import type { QueueState } from "../types";

describe("Queue Trace Generators", () => {
  beforeEach(() => {
    resetQueueIdCounter(1);
  });

  describe("Linear Queue Operations", () => {
    it("should enqueue element at REAR and preserve existing element IDs", () => {
      const state = createQueueState([10, 20], "linear");
      const initialFrontId = state.frontId;

      const trace = createEnqueueTrace(state, 30);
      const finalState = trace.steps[trace.steps.length - 1].state as QueueState;

      expect(finalState.size).toBe(3);
      expect(finalState.items[0]?.value).toBe(10);
      expect(finalState.items[1]?.value).toBe(20);
      expect(finalState.items[2]?.value).toBe(30);
      expect(finalState.frontId).toBe(initialFrontId);
      expect(finalState.rearId).toBe(finalState.items[2]?.id);
    });

    it("should dequeue element from FRONT following FIFO", () => {
      const state = createQueueState([10, 20, 30], "linear");
      const trace = createDequeueTrace(state);
      const finalStep = trace.steps[trace.steps.length - 1];
      const finalState = finalStep.state as QueueState;

      expect(finalStep.variables.dequeuedValue).toBe(10);
      expect(finalState.size).toBe(2);
      expect(finalState.items[0]?.value).toBe(20);
      expect(finalState.frontId).toBe("queue-item-2");
    });

    it("should handle Queue Underflow on empty dequeue", () => {
      const state = createQueueState([], "linear");
      const trace = createDequeueTrace(state);
      const underflowStep = trace.steps.find((s) => s.variables.error === "Queue Underflow");
      expect(underflowStep).toBeDefined();
    });
  });

  describe("Circular Queue Operations & Wrap-around", () => {
    it("should enqueue and wrap around to slot 0 when rear reaches capacity", () => {
      // Create a circular queue with capacity 4, occupied at slots 2 and 3
      // front = 2, rear = 3, size = 2
      let state = createQueueState([10, 20], "circular", 4);
      // Manually set slots to simulate front=2, rear=3
      const customSlots = [null, null, { id: "queue-item-1", value: 30 }, { id: "queue-item-2", value: 40 }];
      state = Object.freeze({
        ...state,
        items: Object.freeze(customSlots),
        frontIndex: 2,
        rearIndex: 3,
        size: 2,
        frontId: "queue-item-1",
        rearId: "queue-item-2",
      });

      // Enqueue 50: rear should wrap to slot 0!
      const trace = createEnqueueTrace(state, 50);
      const finalState = trace.steps[trace.steps.length - 1].state as QueueState;

      expect(finalState.rearIndex).toBe(0); // Wrapped around!
      expect(finalState.items[0]?.value).toBe(50);
      expect(finalState.size).toBe(3);

      const wrapStep = trace.steps.find((s) => s.variables.wrappedAround === true);
      expect(wrapStep).toBeDefined();
      expect(wrapStep?.explanation).toContain("Wrap-around");
    });

    it("should dequeue and advance front with wrap-around", () => {
      // Circular queue with front at slot 3 (last slot of capacity 4)
      const customSlots = [{ id: "queue-item-2", value: 20 }, null, null, { id: "queue-item-1", value: 10 }];
      const state: QueueState = Object.freeze({
        variant: "circular",
        items: Object.freeze(customSlots),
        frontIndex: 3,
        rearIndex: 0,
        size: 2,
        capacity: 4,
        frontId: "queue-item-1",
        rearId: "queue-item-2",
      });

      // Dequeue 10: front should advance from slot 3 to slot 0!
      const trace = createDequeueTrace(state);
      const finalState = trace.steps[trace.steps.length - 1].state as QueueState;

      expect(finalState.frontIndex).toBe(0); // Wrapped around!
      expect(finalState.size).toBe(1);
      expect(finalState.items[3]).toBeNull();
      expect(finalState.items[0]?.value).toBe(20);
    });

    it("should reject enqueue and emit Queue Overflow when circular buffer is full", () => {
      const state = createQueueState([10, 20, 30], "circular", 3);
      const trace = createEnqueueTrace(state, 40);

      const overflowStep = trace.steps.find((s) => s.variables.error === "Queue Overflow");
      expect(overflowStep).toBeDefined();
      expect(overflowStep?.explanation).toContain("Queue Overflow");
    });
  });

  describe("Inspection & Clear Operations", () => {
    it("should read front and rear elements without modifying queue", () => {
      const state = createQueueState([10, 20, 30], "linear");

      const frontTrace = createFrontTrace(state);
      expect(frontTrace.steps.find((s) => s.variables.frontValue === 10)).toBeDefined();

      const rearTrace = createRearTrace(state);
      expect(rearTrace.steps.find((s) => s.variables.rearValue === 30)).toBeDefined();
    });

    it("should check isFull and isEmpty correctly", () => {
      const fullState = createQueueState([10, 20], "circular", 2);
      expect(createIsFullTrace(fullState).steps[0].variables.isFull).toBe(true);

      const emptyState = createQueueState([], "circular", 4);
      expect(createIsEmptyTrace(emptyState).steps[0].variables.isEmpty).toBe(true);
    });

    it("should clear the queue completely", () => {
      const state = createQueueState([10, 20, 30], "circular", 4);
      const trace = createClearTrace(state);
      const finalState = trace.steps[trace.steps.length - 1].state as QueueState;

      expect(finalState.size).toBe(0);
      expect(finalState.frontIndex).toBe(-1);
      expect(finalState.rearIndex).toBe(-1);
      expect(finalState.items.every((it) => it === null)).toBe(true);
    });
  });

  describe("Dispatcher", () => {
    it("should dispatch operations via generateQueueTrace", () => {
      const state = createQueueState([10, 20], "linear");
      const trace = generateQueueTrace(state, "enqueue", { value: 99 });
      const finalState = trace.steps[trace.steps.length - 1].state as QueueState;
      expect(finalState.items[2]?.value).toBe(99);
    });
  });
});
