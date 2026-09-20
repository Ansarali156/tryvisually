import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExecutionController } from "../controller/execution-controller";
import { createExecutionTrace } from "../trace/trace-builder";
import { createSampleDemoTrace } from "../demonstration/sample-trace";

describe("Execution Engine - Execution Controller", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Empty execution trace
  it("handles empty execution trace safely without crashing", () => {
    const emptyTrace = createExecutionTrace({ initialState: { count: 0 } }).build();
    const controller = new ExecutionController(emptyTrace);

    expect(controller.getTotalSteps()).toBe(0);
    expect(controller.getCurrentStepIndex()).toBe(0);
    expect(controller.getCurrentStep()).toBeNull();
    expect(controller.getCurrentState()).toEqual({ count: 0 });
    expect(controller.getStatus()).toBe("idle");
    expect(controller.play()).toBe(false);
    expect(controller.next()).toBe(false);
    expect(controller.previous()).toBe(false);
    expect(controller.getProgress()).toBe(0);

    controller.jumpTo(5);
    expect(controller.getCurrentStepIndex()).toBe(0);
    controller.destroy();
  });

  // 2. Initial state & 3. Step 0
  it("initializes at Step 0 with correct initial state, variables, and status", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace);

    expect(controller.getCurrentStepIndex()).toBe(0);
    expect(controller.getTotalSteps()).toBe(4);
    expect(controller.getStatus()).toBe("idle");
    expect(controller.getCurrentStep()?.id).toBe(0);
    expect(controller.getCurrentStep()?.operation).toBe("call");
    expect(controller.getCurrentStep()?.variables).toEqual({
      counter: 0,
      accumulator: 0,
      currentTarget: 10,
    });
    expect(controller.getCurrentState()?.accumulator).toBe(0);
    expect(controller.getProgress()).toBe(0);
    controller.destroy();
  });

  // 4. next() & 5. previous()
  it("advances step by step with next() and moves backward with previous()", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace);

    expect(controller.next()).toBe(true);
    expect(controller.getCurrentStepIndex()).toBe(1);
    expect(controller.getCurrentStep()?.operation).toBe("update");
    expect(controller.getCurrentState()?.accumulator).toBe(10);

    expect(controller.next()).toBe(true);
    expect(controller.getCurrentStepIndex()).toBe(2);
    expect(controller.getCurrentState()?.accumulator).toBe(30);

    expect(controller.previous()).toBe(true);
    expect(controller.getCurrentStepIndex()).toBe(1);
    expect(controller.getCurrentState()?.accumulator).toBe(10);
    expect(controller.getStatus()).toBe("paused");
    controller.destroy();
  });

  // 6. reset()
  it("resets to step 0 and restores idle status without mutating the trace", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace);

    controller.jumpTo(3);
    expect(controller.getCurrentStepIndex()).toBe(3);

    controller.reset();
    expect(controller.getCurrentStepIndex()).toBe(0);
    expect(controller.getStatus()).toBe("idle");
    expect(controller.getCurrentState()?.accumulator).toBe(0);
    controller.destroy();
  });

  // 7. jumpTo(), 8. jumpToStart(), 9. jumpToEnd()
  it("supports jumpTo, jumpToStart, and jumpToEnd", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace);

    controller.jumpTo(2);
    expect(controller.getCurrentStepIndex()).toBe(2);
    expect(controller.getCurrentState()?.accumulator).toBe(30);

    controller.jumpToEnd();
    expect(controller.getCurrentStepIndex()).toBe(3);
    expect(controller.isCompleted()).toBe(true);

    controller.jumpToStart();
    expect(controller.getCurrentStepIndex()).toBe(0);
    expect(controller.getStatus()).toBe("idle");
    controller.destroy();
  });

  // 10. play(), 11. pause(), 12. resume(), 13. replay(), 14. completion
  it("plays through steps at timer interval, completes at end, and pauses on demand", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace, { baseDelayMs: 500, initialSpeed: 1 });

    const subscriber = vi.fn();
    controller.subscribe(subscriber);

    expect(controller.play()).toBe(true);
    expect(controller.isPlaying()).toBe(true);

    // Step 0 -> Step 1 after 500ms
    vi.advanceTimersByTime(500);
    expect(controller.getCurrentStepIndex()).toBe(1);

    // Pause
    controller.pause();
    expect(controller.isPlaying()).toBe(false);
    expect(controller.getStatus()).toBe("paused");

    // Advance timer while paused: step must NOT change
    vi.advanceTimersByTime(1000);
    expect(controller.getCurrentStepIndex()).toBe(1);

    // Resume
    controller.resume();
    expect(controller.isPlaying()).toBe(true);

    // Advance to Step 2
    vi.advanceTimersByTime(500);
    expect(controller.getCurrentStepIndex()).toBe(2);

    // Advance to Step 3 (terminal step)
    vi.advanceTimersByTime(500);
    expect(controller.getCurrentStepIndex()).toBe(3);
    expect(controller.isCompleted()).toBe(true);
    expect(controller.isPlaying()).toBe(false);

    // Further timer advancements should not move beyond terminal step
    vi.advanceTimersByTime(1000);
    expect(controller.getCurrentStepIndex()).toBe(3);

    // Replay restarts deterministically from 0
    controller.replay();
    expect(controller.getCurrentStepIndex()).toBe(0);
    expect(controller.isPlaying()).toBe(true);
    controller.destroy();
  });

  // 15. Speed changes
  it("adjusts playback pacing dynamically when speed changes", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace, { baseDelayMs: 1000, initialSpeed: 1 });

    controller.play();
    expect(controller.getSpeed()).toBe(1);

    // Change speed to 2x (delay becomes 500ms)
    controller.setSpeed(2);
    expect(controller.getSpeed()).toBe(2);

    vi.advanceTimersByTime(500);
    expect(controller.getCurrentStepIndex()).toBe(1);

    // Change speed to 0.5x (delay becomes 2000ms)
    controller.setSpeed(0.5);
    vi.advanceTimersByTime(1000);
    expect(controller.getCurrentStepIndex()).toBe(1); // not yet 2000ms

    vi.advanceTimersByTime(1000);
    expect(controller.getCurrentStepIndex()).toBe(2);
    controller.destroy();
  });

  // 16. Bounds clamping & invalid indexes
  it("clamps invalid indexes and handles boundary calls gracefully", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace);

    // Previous at step 0
    expect(controller.previous()).toBe(false);
    expect(controller.getCurrentStepIndex()).toBe(0);

    // jumpTo negative index clamps to 0
    controller.jumpTo(-99);
    expect(controller.getCurrentStepIndex()).toBe(0);

    // jumpTo oversized index clamps to totalSteps - 1
    controller.jumpTo(9999);
    expect(controller.getCurrentStepIndex()).toBe(3);
    expect(controller.isCompleted()).toBe(true);

    // next at terminal step
    expect(controller.next()).toBe(false);
    expect(controller.getCurrentStepIndex()).toBe(3);
    controller.destroy();
  });

  // 17. Deterministic replay test (Section 25)
  it("proves deterministic replay: Run 1 states === Run 2 states after reset", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace);

    // Run 1
    const run1States: Array<{ index: number; acc: number; vars: unknown }> = [];
    do {
      run1States.push({
        index: controller.getCurrentStepIndex(),
        acc: controller.getCurrentState()?.accumulator ?? -1,
        vars: controller.getCurrentStep()?.variables,
      });
    } while (controller.next());

    // Reset
    controller.reset();

    // Run 2
    const run2States: Array<{ index: number; acc: number; vars: unknown }> = [];
    do {
      run2States.push({
        index: controller.getCurrentStepIndex(),
        acc: controller.getCurrentState()?.accumulator ?? -1,
        vars: controller.getCurrentStep()?.variables,
      });
    } while (controller.next());

    expect(run1States).toHaveLength(4);
    expect(run2States).toEqual(run1States);
    controller.destroy();
  });

  // 18. Immutable state snapshots & 19. No state drift test (Section 6, 7, 24)
  it("proves time-travel has zero state drift: Step 4 -> 3 -> 2 -> 3 -> 4", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace);

    // Record original states
    controller.jumpTo(2);
    const originalStep2State = controller.getCurrentState();
    controller.jumpTo(3);
    const originalStep3State = controller.getCurrentState();

    // Move backward: Step 3 -> Step 2
    controller.previous();
    const backwardStep2State = controller.getCurrentState();
    expect(backwardStep2State).toEqual(originalStep2State);

    // Move forward again: Step 2 -> Step 3
    controller.next();
    const forwardStep3State = controller.getCurrentState();
    expect(forwardStep3State).toEqual(originalStep3State);

    // Verify external attempted mutation throws or does not affect state
    expect(() => {
      // @ts-expect-error - testing frozen immutability
      forwardStep3State.accumulator = 99999;
    }).toThrow();

    controller.destroy();
  });

  // 20. Variables, 21. CodeLine, 22. HighlightedElements synchronization
  it("synchronizes codeLine, variables, and stable highlightedElements for each step", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace);

    controller.jumpTo(1);
    const step1 = controller.getCurrentStep()!;
    expect(step1.codeLine).toBe(3);
    expect(step1.highlightedElements).toEqual(["elem-0", "elem-1"]);
    expect(step1.variables.accumulator).toBe(10);
    expect(step1.explanation).toContain("Add element 0 (10)");

    controller.jumpTo(2);
    const step2 = controller.getCurrentStep()!;
    expect(step2.codeLine).toBe(4);
    expect(step2.highlightedElements).toEqual(["elem-1", "elem-2"]);
    expect(step2.variables.accumulator).toBe(30);
    controller.destroy();
  });

  // 24. Multiple play calls do not create duplicate playback loops
  it("multiple play calls do not spawn duplicate timer loops", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace, { baseDelayMs: 500 });

    controller.play();
    controller.play(); // duplicate call
    controller.play(); // duplicate call

    vi.advanceTimersByTime(500);
    expect(controller.getCurrentStepIndex()).toBe(1);

    vi.advanceTimersByTime(500);
    expect(controller.getCurrentStepIndex()).toBe(2);
    controller.destroy();
  });

  // 26. Time-travel test (Section 26)
  it("performs complex non-linear time travel sequence with exact state preservation", () => {
    const trace = createSampleDemoTrace();
    const controller = new ExecutionController(trace);

    // jumpTo(3)
    controller.jumpTo(3);
    expect(controller.getCurrentState()?.accumulator).toBe(60);

    // jumpTo(1)
    controller.jumpTo(1);
    expect(controller.getCurrentState()?.accumulator).toBe(10);

    // jumpTo(2)
    controller.jumpTo(2);
    expect(controller.getCurrentState()?.accumulator).toBe(30);

    // previous() -> Step 1
    controller.previous();
    expect(controller.getCurrentState()?.accumulator).toBe(10);

    // next() -> Step 2
    controller.next();
    expect(controller.getCurrentState()?.accumulator).toBe(30);

    // reset() -> Step 0
    controller.reset();
    expect(controller.getCurrentState()?.accumulator).toBe(0);
    expect(controller.getCurrentStepIndex()).toBe(0);
    controller.destroy();
  });
});
