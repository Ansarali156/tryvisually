import { describe, it, expect } from "vitest";
import {
  generateFactorialTrace,
  generateFibonacciTrace,
  generateHanoiTrace,
} from "../trace-generators";

describe("Recursion Trace Generators", () => {
  it("Factorial computes correct value and unwinds call stack to 0 frames", () => {
    const trace = generateFactorialTrace(4);
    expect(trace.steps.length).toBeGreaterThan(4);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.finalResult).toBe(24);
    expect(last.state.callStack.length).toBe(0);
    expect(last.state.maxDepth).toBe(4);
  });

  it("Fibonacci calculates correct branching recursion", () => {
    const trace = generateFibonacciTrace(4);
    expect(trace.steps.length).toBeGreaterThan(5);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.finalResult).toBe(3); // fib(4) = 3
    expect(last.state.totalCalls).toBeGreaterThan(5);
  });

  it("Tower of Hanoi completes in 2^n - 1 moves", () => {
    const trace = generateHanoiTrace(3);
    expect(trace.steps.length).toBeGreaterThan(7);
    const last = trace.steps[trace.steps.length - 1];
    expect(last.state.finalResult).toBe(7); // 2^3 - 1 = 7 moves
  });
});
