import { describe, it, expect } from "vitest";
import {
  generateHeapInsertTrace,
  generateHeapExtractRootTrace,
  generateHeapPeekTrace,
  generateHeapDeleteTrace,
  generateHeapUpdateTrace,
  generateBuildHeapTrace,
  generateHeapifyTrace,
  generateClearHeapTrace,
  generateHeapTrace,
} from "../trace-generators";
import {
  createEmptyHeapState,
  createSampleHeapState,
  isValidHeap,
} from "../validation";

describe("Heap Trace Generators", () => {
  it("should insert into min heap with proper sift-up steps and maintain heap invariant", () => {
    const initialState = createSampleHeapState("min");
    const trace = generateHeapInsertTrace(initialState, 5); // 5 is smaller than root (10), must sift to top

    expect(trace.steps.length).toBeGreaterThan(2);
    expect(trace.metadata?.algorithmName).toContain("MIN Heap Insert");

    const finalState = trace.finalState;
    expect(finalState.items.length).toBe(initialState.items.length + 1);
    expect(finalState.items[0].value).toBe(5); // Now root
    expect(isValidHeap(finalState)).toBe(true);
  });

  it("should insert into max heap with proper sift-up steps and maintain heap invariant", () => {
    const initialState = createSampleHeapState("max");
    const trace = generateHeapInsertTrace(initialState, 99); // 99 is larger than root (70), must sift to top

    expect(trace.steps.length).toBeGreaterThan(2);
    const finalState = trace.finalState;
    expect(finalState.items[0].value).toBe(99);
    expect(isValidHeap(finalState)).toBe(true);
  });

  it("should extract root from min heap, sift down smallest child, and preserve invariant", () => {
    const initialState = createSampleHeapState("min");
    const oldRoot = initialState.items[0].value;
    const trace = generateHeapExtractRootTrace(initialState);

    expect(trace.steps.length).toBeGreaterThan(1);
    const finalState = trace.finalState;
    expect(finalState.items.length).toBe(initialState.items.length - 1);
    expect(finalState.items[0].value).toBeGreaterThanOrEqual(oldRoot);
    expect(isValidHeap(finalState)).toBe(true);
  });

  it("should handle extract root on empty and 1-element heap", () => {
    const emptyState = createEmptyHeapState("min");
    const emptyTrace = generateHeapExtractRootTrace(emptyState);
    expect(emptyTrace.steps.length).toBe(1);
    expect(emptyTrace.finalState.items.length).toBe(0);

    const oneElemState = {
      heapType: "min" as const,
      items: [{ id: "n1", value: 42 }],
    };
    const oneTrace = generateHeapExtractRootTrace(oneElemState);
    expect(oneTrace.finalState.items.length).toBe(0);
  });

  it("should peek root element in O(1) time without mutating state", () => {
    const initialState = createSampleHeapState("min");
    const trace = generateHeapPeekTrace(initialState);

    expect(trace.steps.length).toBe(1);
    expect(trace.finalState.items.length).toBe(initialState.items.length);
    expect(trace.steps[0].highlightedElements).toEqual([initialState.items[0].id]);
  });

  it("should delete arbitrary element by index and restore heap property", () => {
    const initialState = createSampleHeapState("min");
    // Delete element at index 2
    const targetVal = initialState.items[2].value;
    const trace = generateHeapDeleteTrace(initialState, 2);

    expect(trace.steps.length).toBeGreaterThan(1);
    const finalState = trace.finalState;
    expect(finalState.items.length).toBe(initialState.items.length - 1);
    expect(finalState.items.some((it) => it.value === targetVal)).toBe(false);
    expect(isValidHeap(finalState)).toBe(true);
  });

  it("should update element value and sift appropriately", () => {
    const initialState = createSampleHeapState("min");
    // Update index 5 to 2 (should sift up)
    const traceUp = generateHeapUpdateTrace(initialState, 5, 2);
    expect(isValidHeap(traceUp.finalState)).toBe(true);

    // Update index 0 to 100 (should sift down)
    const traceDown = generateHeapUpdateTrace(initialState, 0, 100);
    expect(isValidHeap(traceDown.finalState)).toBe(true);
  });

  it("should build heap in O(n) time bottom-up from floor(n/2)-1 down to 0", () => {
    const emptyMin = createEmptyHeapState("min");
    const arbitraryValues = [55, 20, 10, 80, 4, 32, 1, 99];
    const trace = generateBuildHeapTrace(emptyMin, arbitraryValues);

    expect(trace.steps.length).toBeGreaterThan(5);
    const finalState = trace.finalState;
    expect(finalState.items.length).toBe(arbitraryValues.length);
    expect(finalState.items[0].value).toBe(1); // Smallest at root for min heap
    expect(isValidHeap(finalState)).toBe(true);
  });

  it("should run heapify and clear operations via universal dispatcher", () => {
    const sample = createSampleHeapState("min");
    const heapifyTrace = generateHeapTrace("heapify", sample);
    expect(isValidHeap(heapifyTrace.finalState)).toBe(true);

    const clearTrace = generateHeapTrace("clear", sample);
    expect(clearTrace.finalState.items.length).toBe(0);
  });
});
