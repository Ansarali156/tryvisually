import { describe, it, expect, beforeEach } from "vitest";
import { createStackState, resetStackIdCounter } from "../validation";
import {
  createPushTrace,
  createPopTrace,
  createPeekTrace,
  createIsEmptyTrace,
  createSizeTrace,
  createClearTrace,
  generateStackTrace,
} from "../trace-generators";
import type { StackState } from "../types";

describe("Stack Trace Generators", () => {
  beforeEach(() => {
    resetStackIdCounter(1);
  });

  describe("Push", () => {
    it("should push element onto top of stack and preserve existing stable IDs", () => {
      const state = createStackState([10, 20]);
      const initialId1 = state.items[0].id;
      const initialId2 = state.items[1].id;

      const trace = createPushTrace(state, 30);
      expect(trace.steps.length).toBeGreaterThan(0);

      const finalState = trace.steps[trace.steps.length - 1].state as StackState;
      expect(finalState.items).toHaveLength(3);
      // Existing IDs preserved
      expect(finalState.items[0].id).toBe(initialId1);
      expect(finalState.items[1].id).toBe(initialId2);
      // New element on top
      expect(finalState.items[2].value).toBe(30);
      expect(finalState.topId).toBe(finalState.items[2].id);
    });

    it("should prevent push and emit error when stack is at capacity (Overflow)", () => {
      const state = createStackState([10, 20, 30], 3);
      const trace = createPushTrace(state, 40);

      const overflowStep = trace.steps.find((s) => s.variables.error === "Stack Overflow");
      expect(overflowStep).toBeDefined();
      expect(overflowStep?.explanation).toContain("Stack Overflow");
    });
  });

  describe("Pop", () => {
    it("should pop top element according to LIFO order", () => {
      const state = createStackState([10, 20, 30]);
      const trace = createPopTrace(state);

      const finalStep = trace.steps[trace.steps.length - 1];
      const finalState = finalStep.state as StackState;

      expect(finalState.items).toHaveLength(2);
      expect(finalState.items[0].value).toBe(10);
      expect(finalState.items[1].value).toBe(20);
      expect(finalState.topId).toBe("stack-item-2");
      expect(finalStep.variables.poppedValue).toBe(30);
    });

    it("should handle Stack Underflow gracefully when popping from empty stack", () => {
      const state = createStackState([]);
      const trace = createPopTrace(state);

      const underflowStep = trace.steps.find((s) => s.variables.error === "Stack Underflow");
      expect(underflowStep).toBeDefined();
      expect(underflowStep?.explanation).toContain("Stack Underflow");
    });
  });

  describe("Peek", () => {
    it("should inspect top element without removing it", () => {
      const state = createStackState([10, 20, 30]);
      const trace = createPeekTrace(state);

      const peekStep = trace.steps.find((s) => s.variables.topValue === 30);
      expect(peekStep).toBeDefined();

      const finalState = trace.steps[trace.steps.length - 1].state as StackState;
      expect(finalState.items).toHaveLength(3); // Unchanged!
      expect(finalState.topId).toBe("stack-item-3");
    });

    it("should handle peek on empty stack gracefully", () => {
      const state = createStackState([]);
      const trace = createPeekTrace(state);

      expect(trace.steps[0].explanation).toContain("Stack is empty");
    });
  });

  describe("Is Empty & Size", () => {
    it("should report isEmpty = true for empty stack and false for non-empty", () => {
      const emptyState = createStackState([]);
      const traceEmpty = createIsEmptyTrace(emptyState);
      expect(traceEmpty.steps[0].variables.isEmpty).toBe(true);

      const populatedState = createStackState([10, 20]);
      const tracePopulated = createIsEmptyTrace(populatedState);
      expect(tracePopulated.steps[0].variables.isEmpty).toBe(false);
    });

    it("should report current size", () => {
      const state = createStackState([10, 20, 30]);
      const trace = createSizeTrace(state);
      expect(trace.steps[0].variables.size).toBe(3);
    });
  });

  describe("Clear", () => {
    it("should clear populated stack to empty state", () => {
      const state = createStackState([10, 20, 30]);
      const trace = createClearTrace(state);

      const finalState = trace.steps[trace.steps.length - 1].state as StackState;
      expect(finalState.items).toHaveLength(0);
      expect(finalState.topId).toBeNull();
    });
  });

  describe("Dispatcher & LIFO Correctness", () => {
    it("should correctly dispatch operations via generateStackTrace", () => {
      const state = createStackState([10, 20]);
      const trace = generateStackTrace(state, "push", { value: 99 });
      const finalState = trace.steps[trace.steps.length - 1].state as StackState;
      expect(finalState.items[2].value).toBe(99);
    });
  });
});
