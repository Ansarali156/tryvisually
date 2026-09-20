import { PlaybackSpeed } from "../types";

export interface PlaybackSchedulerOptions {
  baseDelayMs?: number;
  initialSpeed?: PlaybackSpeed;
}

export class PlaybackScheduler {
  private baseDelayMs: number;
  private currentSpeed: PlaybackSpeed;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private isScheduled = false;
  private onTickCallback: (() => boolean) | null = null;

  constructor(options: PlaybackSchedulerOptions = {}) {
    this.baseDelayMs = options.baseDelayMs ?? 1000;
    this.currentSpeed = options.initialSpeed ?? 1;
  }

  /**
   * Starts playback. Invokes `onTick` repeatedly until stopped or until `onTick` returns false.
   * Multiple calls while running are safely ignored to prevent duplicate loops.
   */
  public start(onTick: () => boolean): void {
    this.onTickCallback = onTick;

    if (this.isScheduled) {
      return; // Already running
    }

    this.isScheduled = true;
    this.scheduleNextTick();
  }

  /**
   * Stops the playback scheduler and clears pending timers.
   */
  public stop(): void {
    this.isScheduled = false;
    this.onTickCallback = null;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Updates playback speed. If running, adjusts interval for the next tick immediately.
   */
  public setSpeed(speed: PlaybackSpeed): void {
    this.currentSpeed = speed;
    if (this.isScheduled && this.timerId !== null) {
      // Reschedule next tick with the updated speed
      clearTimeout(this.timerId);
      this.timerId = null;
      this.scheduleNextTick();
    }
  }

  public getSpeed(): PlaybackSpeed {
    return this.currentSpeed;
  }

  public isRunning(): boolean {
    return this.isScheduled;
  }

  private getDelay(): number {
    return Math.max(50, Math.round(this.baseDelayMs / this.currentSpeed));
  }

  private scheduleNextTick(): void {
    if (!this.isScheduled) return;

    this.timerId = setTimeout(() => {
      this.timerId = null;
      if (!this.isScheduled || !this.onTickCallback) return;

      const shouldContinue = this.onTickCallback();
      if (shouldContinue && this.isScheduled) {
        this.scheduleNextTick();
      } else {
        this.stop();
      }
    }, this.getDelay());
  }
}
