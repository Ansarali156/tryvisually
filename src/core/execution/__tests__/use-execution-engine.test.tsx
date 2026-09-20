import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useExecutionEngine } from "../hooks/use-execution-engine";
import { createSampleDemoTrace } from "../demonstration/sample-trace";

describe("Execution Engine - useExecutionEngine Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("subscribes to execution runtime state and provides reactive updates", () => {
    const trace = createSampleDemoTrace();
    const { result } = renderHook(() => useExecutionEngine(trace));

    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.totalSteps).toBe(4);
    expect(result.current.status).toBe("idle");
    expect(result.current.currentState?.accumulator).toBe(0);

    // Advance step
    act(() => {
      result.current.next();
    });

    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.currentState?.accumulator).toBe(10);
    expect(result.current.currentStep?.operation).toBe("update");

    // Jump to step 3
    act(() => {
      result.current.jumpTo(3);
    });

    expect(result.current.currentStepIndex).toBe(3);
    expect(result.current.currentState?.accumulator).toBe(60);
    expect(result.current.isCompleted).toBe(true);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.status).toBe("idle");
  });

  it("cleans up timer and controller on unmount", () => {
    const trace = createSampleDemoTrace();
    const { result, unmount } = renderHook(() =>
      useExecutionEngine(trace, { baseDelayMs: 200 })
    );

    act(() => {
      result.current.play();
    });
    expect(result.current.isPlaying).toBe(true);

    unmount();

    // Advancing timers after unmount should not cause errors
    expect(() => {
      vi.advanceTimersByTime(1000);
    }).not.toThrow();
  });
});
