import { describe, it, expect } from "vitest";
import {
  generateFibonacciDpTrace,
  generateClimbingStairsTrace,
  generateKnapsackTrace,
  generateLcsTrace,
} from "../trace-generators";

describe("Dynamic Programming Trace Generators", () => {
  it("Fibonacci DP computes fib(5) = 5 correctly", () => {
    const trace = generateFibonacciDpTrace(5);
    expect(trace.steps.length).toBeGreaterThan(4);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.finalAnswer).toBe(5);
    expect(last.state.table.grid[0][5]).toBe(5);
  });

  it("Climbing Stairs computes ways to climb 4 stairs = 5", () => {
    const trace = generateClimbingStairsTrace(4);
    expect(trace.steps.length).toBeGreaterThan(3);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.finalAnswer).toBe(5);
  });

  it("0/1 Knapsack computes optimal value for 3 items", () => {
    const weights = [1, 2, 3];
    const values = [6, 10, 12];
    const capacity = 5;
    const trace = generateKnapsackTrace(weights, values, capacity);
    expect(trace.steps.length).toBeGreaterThan(5);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.finalAnswer).toBe(22); // items 2 and 3 = wt 5, val 22
  });

  it("LCS computes longest common subsequence length", () => {
    const trace = generateLcsTrace("ABCDE", "ACE");
    expect(trace.steps.length).toBeGreaterThan(5);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.finalAnswer).toBe(3); // "ACE" has length 3
  });
});
