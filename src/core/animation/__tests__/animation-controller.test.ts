import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AnimationController } from "../controller/animation-controller";
import type { AnimationTransition } from "../types";

describe("AnimationController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const sampleTransitions: AnimationTransition[] = [
    {
      id: "tr-1",
      type: "move",
      targetIds: ["elem-0"],
      duration: 200,
      from: { position: { x: 0, y: 0 } },
      to: { position: { x: 100, y: 0 } },
    },
  ];

  it("starts in idle state and moves to running on start", () => {
    const controller = new AnimationController();
    expect(controller.getState()).toBe("idle");
    expect(controller.isAnimating()).toBe(false);

    controller.start(sampleTransitions, 200);
    expect(controller.getState()).toBe("running");
    expect(controller.isAnimating()).toBe(true);
  });

  it("advances progress and calls onComplete when duration elapses", () => {
    const onComplete = vi.fn();
    const controller = new AnimationController({ onComplete });

    controller.start(sampleTransitions, 200);

    // Fast-forward by 100ms
    vi.advanceTimersByTime(100);
    expect(controller.getProgress()).toBeGreaterThan(0);
    expect(controller.getProgress()).toBeLessThan(1);
    expect(controller.isAnimating()).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();

    // Fast-forward to end
    vi.advanceTimersByTime(150);
    expect(controller.getProgress()).toBe(1.0);
    expect(controller.getState()).toBe("completed");
    expect(controller.isAnimating()).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("supports pause and resume", () => {
    const controller = new AnimationController();
    controller.start(sampleTransitions, 200);

    vi.advanceTimersByTime(100);
    controller.pause();
    expect(controller.getState()).toBe("paused");
    const pausedProgress = controller.getProgress();

    // Advancing time while paused does not change progress
    vi.advanceTimersByTime(100);
    expect(controller.getProgress()).toBe(pausedProgress);

    controller.resume();
    expect(controller.getState()).toBe("running");
    vi.advanceTimersByTime(150);
    expect(controller.getState()).toBe("completed");
  });

  it("supports cancellation", () => {
    const onComplete = vi.fn();
    const controller = new AnimationController({ onComplete });

    controller.start(sampleTransitions, 200);
    vi.advanceTimersByTime(50);
    controller.cancel();

    expect(controller.getState()).toBe("cancelled");
    expect(controller.isAnimating()).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("completes immediately when duration is 0", () => {
    const onComplete = vi.fn();
    const controller = new AnimationController({ onComplete });

    controller.start(sampleTransitions, 0);

    expect(controller.getState()).toBe("completed");
    expect(controller.getProgress()).toBe(1.0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
