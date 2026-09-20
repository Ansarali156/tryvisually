import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useExecutionView } from "../hooks/use-execution-view";
import type { ExecutionRuntimeState, ExecutionStep } from "@/core/execution/types";
import { parseSourceCode } from "../utils/source-code";

describe("useExecutionView Hook", () => {
  const step0: ExecutionStep = {
    id: 0,
    codeLine: 1,
    operation: "call",
    variables: { counter: 0 },
    state: { data: [1, 2] },
    highlightedElements: ["item-0"],
    explanation: "Step 0 start",
  };

  const step1: ExecutionStep = {
    id: 1,
    codeLine: 4,
    operation: "compare",
    variables: { counter: 1 },
    state: { data: [1, 2] },
    highlightedElements: ["item-1"],
    explanation: "Step 1 compare",
  };

  const sampleSource = parseSourceCode("def foo():\n    pass\n    return", "python");

  it("produces a unified execution context where all fields represent the same step", () => {
    const runtimeState: ExecutionRuntimeState = {
      currentStepIndex: 1,
      currentStep: step1,
      currentState: { data: [1, 2] },
      status: "playing",
      speed: 1,
      totalSteps: 2,
      progress: 0.5,
    };

    const { result } = renderHook(() =>
      useExecutionView({
        runtimeState,
        previousStep: step0,
        language: "python",
        sourceCodes: { python: sampleSource },
      })
    );

    const ctx = result.current;
    expect(ctx.stepIndex).toBe(1);
    expect(ctx.step?.id).toBe(1);
    expect(ctx.operation).toBe("compare");
    expect(ctx.explanation).toBe("Step 1 compare");
    expect(ctx.primaryCodeLine).toBe(4);
    expect(ctx.activeCodeLines).toEqual([4]);
    expect(ctx.variables).toEqual({ counter: 1 });
    expect(ctx.variableDiffs.counter.hasChanged).toBe(true);
    expect(ctx.variableDiffs.counter.previousValue).toBe(0);
    expect(ctx.highlightedElements).toEqual(["item-1"]);
    expect(ctx.sourceCode).toBe(sampleSource);
  });

  it("handles null execution step safely without crashing", () => {
    const emptyRuntime: ExecutionRuntimeState = {
      currentStepIndex: 0,
      currentStep: null,
      currentState: null,
      status: "idle",
      speed: 1,
      totalSteps: 0,
      progress: 0,
    };

    const { result } = renderHook(() =>
      useExecutionView({
        runtimeState: emptyRuntime,
      })
    );

    expect(result.current.step).toBeNull();
    expect(result.current.activeCodeLines).toEqual([]);
    expect(result.current.explanation).toBe("Execution idle.");
    expect(result.current.variables).toEqual({});
  });
});
