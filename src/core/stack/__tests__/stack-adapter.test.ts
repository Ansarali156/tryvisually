import { describe, it, expect, beforeEach } from "vitest";
import { StackAdapter } from "../stack-adapter";
import { createStackState, resetStackIdCounter } from "../validation";
import type { ExecutionStep } from "@/core/execution/types";
import type { StackState } from "../types";

describe("StackAdapter", () => {
  const adapter = new StackAdapter();

  beforeEach(() => {
    resetStackIdCounter(1);
  });

  it("should convert a stack state into vertically positioned visualization elements", () => {
    const state = createStackState([10, 20, 30]);
    const step: ExecutionStep<StackState> = {
      id: 0,
      operation: "custom",
      state,
      explanation: "Initial state",
      variables: {},
      highlightedElements: [],
    };

    const vizState = adapter.adapt(step);

    expect(vizState.elements).toHaveLength(3);
    // Index 0 (bottom: 10) is at highest y
    expect(vizState.elements[0].id).toBe("stack-item-1");
    expect(vizState.elements[0].value).toBe(10);

    // Index 2 (top: 30) is at y = 0
    expect(vizState.elements[2].id).toBe("stack-item-3");
    expect(vizState.elements[2].value).toBe(30);
    expect(vizState.elements[2].position?.y).toBe(0);

    // TOP annotation should point to stack-item-3
    const topAnnotation = vizState.annotations.find((a) => a.text === "TOP");
    expect(topAnnotation).toBeDefined();
    expect(topAnnotation?.targetId).toBe("stack-item-3");
  });

  it("should highlight elements based on step operation", () => {
    const state = createStackState([10, 20, 30]);
    const step: ExecutionStep<StackState> = {
      id: 1,
      operation: "insert",
      state,
      explanation: "Pushed 30",
      variables: {},
      highlightedElements: ["stack-item-3"],
    };

    const vizState = adapter.adapt(step);
    const highlight = vizState.highlights.find((h) => h.elementId === "stack-item-3");
    expect(highlight).toBeDefined();
    expect(highlight?.type).toBe("inserted");
  });
});
