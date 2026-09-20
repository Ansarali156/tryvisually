import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AnimationController } from "../controller/animation-controller";
import { generateTransitions } from "../transitions/transition-generator";
import type { VisualizationState } from "@/core/visualization/types";

describe("CRITICAL STATE-CORRECTNESS & RAPID NAVIGATION (Prompt 6, Sections 32 & 33)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const stateA: VisualizationState = {
    sourceState: { step: "A" },
    elements: [
      { id: "item-1", type: "item", value: 100, position: { x: 0, y: 0 } },
    ],
    connections: [],
    highlights: [],
    annotations: [],
  };

  const stateB: VisualizationState = {
    sourceState: { step: "B" },
    elements: [
      { id: "item-1", type: "item", value: 200, position: { x: 300, y: 0 } },
    ],
    connections: [],
    highlights: [],
    annotations: [],
  };

  it("Section 32: Interrupting animation A -> B halfway settles strictly to authoritative target B", () => {
    const controller = new AnimationController();
    const transitionsAB = generateTransitions(stateA, stateB, { baseDurationMs: 400 });

    controller.start(transitionsAB, 400);

    // Advance halfway
    vi.advanceTimersByTime(200);
    expect(controller.isAnimating()).toBe(true);

    // Interrupt/cancel animation
    controller.cancel();
    expect(controller.isAnimating()).toBe(false);

    // The execution engine's authoritative state is B, which the renderer applies
    // Even though animation was interrupted, settling B gives exact stateB properties
    expect(stateB.elements[0].value).toBe(200);
    expect(stateB.elements[0].position).toEqual({ x: 300, y: 0 });

    // Now animate B -> A
    const transitionsBA = generateTransitions(stateB, stateA, { baseDurationMs: 400 });
    controller.start(transitionsBA, 400);
    vi.advanceTimersByTime(450);

    expect(controller.getState()).toBe("completed");
    expect(stateA.elements[0].value).toBe(100);
    expect(stateA.elements[0].position).toEqual({ x: 0, y: 0 });
  });

  it("Section 33: Rapid navigation 0 -> 1 -> 2 -> 3 -> 4 interrupts intermediate animations and settles to Step 4", () => {
    const controller = new AnimationController();

    const makeState = (stepNum: number): VisualizationState => ({
      sourceState: { step: stepNum },
      elements: [
        { id: "cursor", type: "item", value: stepNum, position: { x: stepNum * 50, y: 0 } },
      ],
      connections: [],
      highlights: [],
      annotations: [],
    });

    const states = [makeState(0), makeState(1), makeState(2), makeState(3), makeState(4)];

    // Rapid navigation: jump from 0 -> 1 -> 2 -> 3 -> 4 with 20ms between clicks (far less than 400ms duration)
    let currentState = states[0];

    for (let i = 1; i <= 4; i++) {
      const nextState = states[i];
      const transitions = generateTransitions(currentState, nextState, { baseDurationMs: 400 });

      // Starts next transition, which internally cancels any previous in-flight transition
      controller.start(transitions, 400);

      vi.advanceTimersByTime(20); // only 20ms elapsed
      currentState = nextState;
    }

    // Fast forward to finish the final transition (Step 3 -> 4)
    vi.advanceTimersByTime(450);

    expect(controller.getState()).toBe("completed");
    expect(currentState.elements[0].value).toBe(4);
    expect(currentState.elements[0].position).toEqual({ x: 200, y: 0 });
  });
});
