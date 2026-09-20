import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useVisualizationAnimation } from "../hooks/use-visualization-animation";
import type { VisualizationState } from "@/core/visualization/types";

describe("useVisualizationAnimation Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const state0: VisualizationState = {
    sourceState: {},
    elements: [{ id: "n1", type: "node", value: 10, position: { x: 0, y: 0 } }],
    connections: [],
    highlights: [],
    annotations: [],
  };

  const state1: VisualizationState = {
    sourceState: {},
    elements: [{ id: "n1", type: "node", value: 10, position: { x: 100, y: 0 } }],
    connections: [],
    highlights: [],
    annotations: [],
  };

  it("handles initial mount and completes transition", () => {
    const { result } = renderHook(() =>
      useVisualizationAnimation({
        visualizationState: state0,
        baseDurationMs: 200,
      })
    );

    expect(result.current.transitions).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.isAnimating).toBe(false);
  });

  it("triggers animation when visualizationState updates", () => {
    let currentState = state0;

    const { result, rerender } = renderHook(() =>
      useVisualizationAnimation({
        visualizationState: currentState,
        baseDurationMs: 200,
      })
    );

    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Update state
    currentState = state1;
    rerender();

    expect(result.current.isAnimating).toBe(true);

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.isAnimating).toBe(false);
  });

  it("cleans up on unmount without throwing", () => {
    const { unmount } = renderHook(() =>
      useVisualizationAnimation({
        visualizationState: state0,
        baseDurationMs: 200,
      })
    );

    expect(() => {
      unmount();
    }).not.toThrow();
  });
});
