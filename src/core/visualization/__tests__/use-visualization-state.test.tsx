import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useVisualizationState } from "../hooks/use-visualization-state";
import { GenericDemoAdapter } from "../adapters/generic-demo-adapter";
import type { DemoState } from "@/core/execution/demonstration/sample-trace";
import type { ExecutionStep, ExecutionRuntimeState } from "@/core/execution/types";

describe("useVisualizationState Hook", () => {
  const adapter = new GenericDemoAdapter();

  const mockState: DemoState = {
    counter: 0,
    accumulator: 0,
    items: [
      { id: "elem-0", value: 10, status: "default" },
      { id: "elem-1", value: 20, status: "default" },
    ],
  };

  const mockStep: ExecutionStep<DemoState> = {
    id: 0,
    operation: "compare",
    variables: { counter: 0 },
    state: mockState,
    highlightedElements: ["elem-0"],
    explanation: "Compare elem-0",
  };

  it("returns null visualizationState when no state is provided", () => {
    const { result } = renderHook(() =>
      useVisualizationState<DemoState>({
        adapter,
        state: null,
      })
    );

    expect(result.current.visualizationState).toBeNull();
    expect(result.current.elementsById.size).toBe(0);
    expect(result.current.connectionsById.size).toBe(0);
  });

  it("transforms direct state snapshot and step into visualization state and lookup maps", () => {
    const { result } = renderHook(() =>
      useVisualizationState<DemoState>({
        adapter,
        state: mockState,
        step: mockStep,
      })
    );

    expect(result.current.visualizationState).not.toBeNull();
    expect(result.current.visualizationState?.elements).toHaveLength(2);
    expect(result.current.elementsById.size).toBe(2);
    expect(result.current.elementsById.get("elem-0")?.value).toBe(10);
    expect(result.current.connectionsById.size).toBe(1);

    // Check O(1) highlight lookup
    const hl = result.current.getHighlight("elem-0");
    expect(hl).toBeDefined();
    expect(hl?.type).toBe("compare");
  });

  it("extracts state and step from runtimeState automatically", () => {
    const mockRuntimeState: ExecutionRuntimeState<DemoState> = {
      currentStepIndex: 0,
      currentStep: mockStep,
      currentState: mockState,
      status: "idle",
      speed: 1,
      totalSteps: 1,
      progress: 0,
    };

    const { result } = renderHook(() =>
      useVisualizationState<DemoState>({
        adapter,
        runtimeState: mockRuntimeState,
      })
    );

    expect(result.current.visualizationState).not.toBeNull();
    expect(result.current.visualizationState?.elements).toHaveLength(2);
    expect(result.current.getHighlight("elem-0")?.type).toBe("compare");
  });

  it("updates memoized result when step or state updates", () => {
    const currentState = mockState;
    let currentStep = mockStep;

    const { result, rerender } = renderHook(() =>
      useVisualizationState<DemoState>({
        adapter,
        state: currentState,
        step: currentStep,
      })
    );

    const initialVisState = result.current.visualizationState;
    expect(result.current.getHighlight("elem-0")?.type).toBe("compare");

    // Re-render with same values -> same reference
    rerender();
    expect(result.current.visualizationState).toBe(initialVisState);

    // Update step
    currentStep = {
      id: 1,
      operation: "swap",
      variables: { counter: 1 },
      state: currentState,
      highlightedElements: ["elem-1"],
      explanation: "Swap elem-1",
    };

    rerender();
    expect(result.current.visualizationState).not.toBe(initialVisState);
    expect(result.current.getHighlight("elem-1")?.type).toBe("swapped");
  });
});
