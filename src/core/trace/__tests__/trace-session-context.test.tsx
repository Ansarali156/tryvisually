import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  TraceSessionProvider,
  useTraceSession,
} from "../trace-session-context";
import { TRACE_EXAMPLES } from "../trace-examples";

describe("TraceSessionContext & State Management", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TraceSessionProvider>{children}</TraceSessionProvider>
  );

  it("initializes with strictly blank code by default (no sample code or comments)", () => {
    const { result } = renderHook(() => useTraceSession(), { wrapper });

    expect(result.current.code).toBe("");
    expect(result.current.language).toBe("python");
    expect(result.current.isDirty).toBe(false);
    expect(result.current.hasExecuted).toBe(false);
    expect(result.current.traceSteps.length).toBe(0);
    expect(result.current.outputLogs.length).toBe(0);
  });

  it("updates code and sets isDirty to true when user types", () => {
    const { result } = renderHook(() => useTraceSession(), { wrapper });

    act(() => {
      result.current.setCode("print('Hello from user')");
    });

    expect(result.current.code).toBe("print('Hello from user')");
    expect(result.current.isDirty).toBe(true);
  });

  it("persists written code to localStorage across sessions", () => {
    const { result } = renderHook(() => useTraceSession(), { wrapper });

    act(() => {
      result.current.setCode("x = [1, 2, 3]\nprint(x)");
    });

    const stored = window.localStorage.getItem("try-visually:trace-session:v1");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.code).toBe("x = [1, 2, 3]\nprint(x)");
  });

  it("loads an explicit example from TRACE_EXAMPLES on demand", () => {
    const { result } = renderHook(() => useTraceSession(), { wrapper });
    const bubbleSort = TRACE_EXAMPLES.find((e) => e.id === "py-bubble-sort")!;

    act(() => {
      result.current.loadExample(bubbleSort);
    });

    expect(result.current.code).toBe(bubbleSort.code);
    expect(result.current.language).toBe(bubbleSort.language);
    expect(result.current.executionStatus).toBe("IDLE");
  });

  it("clears code and execution cleanly with clearSession()", () => {
    const { result } = renderHook(() => useTraceSession(), { wrapper });

    act(() => {
      result.current.setCode("a = 10\nb = 20");
    });
    expect(result.current.code).toBe("a = 10\nb = 20");

    act(() => {
      result.current.clearSession();
    });

    expect(result.current.code).toBe("");
    expect(result.current.isDirty).toBe(false);
    expect(result.current.outputLogs.length).toBe(0);
    expect(result.current.executionStatus).toBe("IDLE");
  });

  it("resetExecution() resets the step index without wiping user's source code", () => {
    const { result } = renderHook(() => useTraceSession(), { wrapper });

    act(() => {
      result.current.setCode("arr = [3, 1, 2]\narr.sort()");
    });

    act(() => {
      result.current.resetExecution();
    });

    // Source code is preserved intact!
    expect(result.current.code).toBe("arr = [3, 1, 2]\narr.sort()");
    expect(result.current.currentStepIndex).toBe(0);
  });
});
