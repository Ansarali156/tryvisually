import {
  ExecutionRuntimeState,
  ExecutionStatus,
  ExecutionStep,
  ExecutionTrace,
  PlaybackSpeed,
} from "../types";
import { PlaybackScheduler } from "../playback/playback-scheduler";

export interface ExecutionControllerOptions {
  initialSpeed?: PlaybackSpeed;
  baseDelayMs?: number;
}

export class ExecutionController<TState = unknown> {
  private readonly trace: ExecutionTrace<TState>;
  private readonly scheduler: PlaybackScheduler;
  private currentStepIndex = 0;
  private status: ExecutionStatus = "idle";
  private listeners = new Set<() => void>();
  private cachedRuntimeState: ExecutionRuntimeState<TState>;

  constructor(
    trace: ExecutionTrace<TState>,
    options: ExecutionControllerOptions = {}
  ) {
    this.trace = trace;
    const initialSpeed = options.initialSpeed ?? 1;
    this.scheduler = new PlaybackScheduler({
      initialSpeed,
      baseDelayMs: options.baseDelayMs ?? 1000,
    });

    // Handle empty trace initialization
    if (!this.trace.steps || this.trace.steps.length === 0) {
      this.currentStepIndex = 0;
      this.status = "idle";
    }

    this.cachedRuntimeState = this.computeRuntimeState();
  }

  /**
   * Subscribes a listener to state changes.
   * Returns an unsubscribe function.
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.cachedRuntimeState = this.computeRuntimeState();
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getTrace(): ExecutionTrace<TState> {
    return this.trace;
  }

  public getTotalSteps(): number {
    return this.trace.steps.length;
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  public getCurrentStep(): ExecutionStep<TState> | null {
    if (this.trace.steps.length === 0) return null;
    return this.trace.steps[this.currentStepIndex] ?? null;
  }

  public getCurrentState(): Readonly<TState> | null {
    if (this.trace.steps.length === 0) {
      return this.trace.initialState ?? null;
    }
    const current = this.getCurrentStep();
    return current ? current.state : this.trace.initialState;
  }

  public getStatus(): ExecutionStatus {
    return this.status;
  }

  public getSpeed(): PlaybackSpeed {
    return this.scheduler.getSpeed();
  }

  public isPlaying(): boolean {
    return this.status === "playing";
  }

  public isCompleted(): boolean {
    return this.status === "completed";
  }

  public getProgress(): number {
    const total = this.getTotalSteps();
    if (total <= 1) return this.status === "completed" ? 1.0 : 0.0;
    return Math.min(1.0, Math.max(0.0, this.currentStepIndex / (total - 1)));
  }

  private computeRuntimeState(): ExecutionRuntimeState<TState> {
    return Object.freeze({
      currentStepIndex: this.currentStepIndex,
      currentStep: this.getCurrentStep(),
      currentState: this.getCurrentState(),
      status: this.status,
      speed: this.getSpeed(),
      totalSteps: this.getTotalSteps(),
      progress: this.getProgress(),
    });
  }

  /**
   * Returns the stable cached runtime state snapshot.
   * Safe for React useSyncExternalStore comparison.
   */
  public getRuntimeState(): ExecutionRuntimeState<TState> {
    return this.cachedRuntimeState;
  }

  /**
   * Starts or resumes playback.
   */
  public play(): boolean {
    const total = this.getTotalSteps();
    if (total <= 1) {
      return false;
    }

    // If at the end, restart from step 0
    if (this.currentStepIndex >= total - 1) {
      this.currentStepIndex = 0;
    }

    this.status = "playing";
    this.notify();

    this.scheduler.start(() => {
      const moved = this.stepForwardInternal();
      if (!moved) {
        this.status = "completed";
        this.notify();
        return false; // Stop playback
      }
      this.notify();
      return true; // Continue playback
    });

    return true;
  }

  /**
   * Pauses active playback.
   */
  public pause(): void {
    if (this.status === "playing") {
      this.scheduler.stop();
      this.status = "paused";
      this.notify();
    }
  }

  /**
   * Resumes playback if paused or idle.
   */
  public resume(): boolean {
    return this.play();
  }

  /**
   * Advances exactly one step forward.
   */
  public next(): boolean {
    this.pause();
    const advanced = this.stepForwardInternal();
    if (advanced) {
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Internal advancement without pausing scheduler.
   */
  private stepForwardInternal(): boolean {
    const total = this.getTotalSteps();
    if (total === 0) return false;

    if (this.currentStepIndex < total - 1) {
      this.currentStepIndex++;
      if (this.currentStepIndex === total - 1) {
        this.status = "completed";
      }
      return true;
    }

    this.status = "completed";
    return false;
  }

  /**
   * Moves exactly one step backward.
   */
  public previous(): boolean {
    this.pause();
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.status = "paused";
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Jumps to a specific step index with safe boundary clamping.
   */
  public jumpTo(targetIndex: number): void {
    this.pause();
    const total = this.getTotalSteps();
    if (total === 0) return;

    const clampedIndex = Math.max(0, Math.min(targetIndex, total - 1));
    this.currentStepIndex = clampedIndex;

    if (clampedIndex === total - 1 && total > 1) {
      this.status = "completed";
    } else {
      this.status = "paused";
    }

    this.notify();
  }

  public jumpToStart(): void {
    this.jumpTo(0);
    this.status = "idle";
    this.notify();
  }

  public jumpToEnd(): void {
    const total = this.getTotalSteps();
    if (total > 0) {
      this.jumpTo(total - 1);
    }
  }

  /**
   * Resets execution to Step 0 and restores idle status.
   */
  public reset(): void {
    this.scheduler.stop();
    this.currentStepIndex = 0;
    this.status = "idle";
    this.notify();
  }

  /**
   * Resets and immediately begins playing.
   */
  public replay(): void {
    this.reset();
    this.play();
  }

  /**
   * Updates playback speed multiplier.
   */
  public setSpeed(speed: PlaybackSpeed): void {
    this.scheduler.setSpeed(speed);
    this.notify();
  }

  /**
   * Destroys the controller, stopping timers and clearing subscriptions.
   */
  public destroy(): void {
    this.scheduler.stop();
    this.listeners.clear();
  }
}
