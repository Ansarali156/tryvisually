import { describe, it, expect } from "vitest";
import {
  generateBubbleSortTrace,
  generateSelectionSortTrace,
  generateInsertionSortTrace,
  generateMergeSortTrace,
  generateQuickSortTrace,
} from "../trace-generators";

describe("Sorting Algorithm Traces", () => {
  const unsorted = [64, 34, 25, 12, 22, 11, 90];
  const sortedExpected = [11, 12, 22, 25, 34, 64, 90];

  it("Bubble sort correctly sorts array and terminates with sorted indices", () => {
    const trace = generateBubbleSortTrace(unsorted);
    expect(trace.steps.length).toBeGreaterThan(5);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.array).toEqual(sortedExpected);
    expect(last.state.sortedIndices.length).toBe(unsorted.length);
  });

  it("Selection sort correctly sorts array", () => {
    const trace = generateSelectionSortTrace(unsorted);
    expect(trace.steps.length).toBeGreaterThan(5);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.array).toEqual(sortedExpected);
    expect(last.state.sortedIndices.length).toBe(unsorted.length);
  });

  it("Insertion sort correctly sorts array", () => {
    const trace = generateInsertionSortTrace(unsorted);
    expect(trace.steps.length).toBeGreaterThan(5);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.array).toEqual(sortedExpected);
    expect(last.state.sortedIndices.length).toBe(unsorted.length);
  });

  it("Merge sort correctly sorts array", () => {
    const trace = generateMergeSortTrace(unsorted);
    expect(trace.steps.length).toBeGreaterThan(5);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.array).toEqual(sortedExpected);
  });

  it("Quick sort correctly sorts array", () => {
    const trace = generateQuickSortTrace(unsorted);
    expect(trace.steps.length).toBeGreaterThan(5);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.array).toEqual(sortedExpected);
  });
});
