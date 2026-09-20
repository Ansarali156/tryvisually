import { describe, it, expect } from "vitest";
import {
  generatePQEnqueueTrace,
  generatePQDequeueTrace,
  generatePQPeekTrace,
  generatePQChangePriorityTrace,
  generatePQRemoveTrace,
  generatePQSizeTrace,
  generateClearPQTrace,
  generatePriorityQueueTrace,
} from "../trace-generators";
import {
  createSamplePriorityQueueState,
  isValidPriorityQueue,
} from "../validation";

describe("Priority Queue Trace Generators", () => {
  it("should enqueue tasks and maintain priority order", () => {
    const initialState = createSamplePriorityQueueState("min");
    const trace = generatePQEnqueueTrace(initialState, "Critical Bug", 0); // highest priority in min mode

    expect(trace.steps.length).toBeGreaterThan(1);
    const finalState = trace.finalState;
    expect(finalState.items.length).toBe(initialState.items.length + 1);
    expect(finalState.items[0].value).toBe("Critical Bug");
    expect(isValidPriorityQueue(finalState)).toBe(true);
  });

  it("should dequeue highest priority task and sift down remaining elements", () => {
    const initialState = createSamplePriorityQueueState("min");
    const trace = generatePQDequeueTrace(initialState);

    expect(trace.steps.length).toBeGreaterThan(1);
    const finalState = trace.finalState;
    expect(finalState.items.length).toBe(initialState.items.length - 1);
    expect(isValidPriorityQueue(finalState)).toBe(true);
  });

  it("should peek root task without removing it", () => {
    const initialState = createSamplePriorityQueueState("min");
    const trace = generatePQPeekTrace(initialState);

    expect(trace.steps.length).toBe(1);
    expect(trace.finalState.items.length).toBe(initialState.items.length);
    expect(trace.steps[0].highlightedElements).toEqual([initialState.items[0].id]);
  });

  it("should change task priority and restore heap invariant", () => {
    const initialState = createSamplePriorityQueueState("min");
    const targetId = initialState.items[3].id;
    const trace = generatePQChangePriorityTrace(initialState, targetId, 0);

    expect(trace.steps.length).toBeGreaterThan(1);
    const finalState = trace.finalState;
    expect(finalState.items[0].id).toBe(targetId);
    expect(isValidPriorityQueue(finalState)).toBe(true);
  });

  it("should remove task by ID", () => {
    const initialState = createSamplePriorityQueueState("min");
    const targetId = initialState.items[1].id;
    const trace = generatePQRemoveTrace(initialState, targetId);

    expect(trace.steps.length).toBeGreaterThan(1);
    const finalState = trace.finalState;
    expect(finalState.items.some((i) => i.id === targetId)).toBe(false);
    expect(isValidPriorityQueue(finalState)).toBe(true);
  });

  it("should inspect size and clear queue via dispatcher", () => {
    const initialState = createSamplePriorityQueueState("min");
    const sizeTrace = generatePriorityQueueTrace("size", initialState);
    expect(sizeTrace.steps[0].variables?.size).toBe(5);

    const clearTrace = generatePriorityQueueTrace("clear", initialState);
    expect(clearTrace.finalState.items.length).toBe(0);
  });
});
