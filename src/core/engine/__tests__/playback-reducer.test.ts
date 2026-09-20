import { describe, it, expect } from "vitest";
import {
  playbackReducer,
  createInitialPlaybackState,
} from "../playback-reducer";

describe("Playback Reducer", () => {
  it("initializes playback state correctly with positive step count", () => {
    const state = createInitialPlaybackState(5);
    expect(state.currentStep).toBe(0);
    expect(state.totalSteps).toBe(5);
    expect(state.isPlaying).toBe(false);
    expect(state.speed).toBe(1);
    expect(state.isFinished).toBe(false);
  });

  it("handles empty or 1-step traces gracefully", () => {
    const emptyState = createInitialPlaybackState(0);
    expect(emptyState.totalSteps).toBe(0);
    expect(emptyState.isFinished).toBe(true);

    const singleStep = createInitialPlaybackState(1);
    expect(singleStep.totalSteps).toBe(1);
    expect(singleStep.isFinished).toBe(true);
  });

  it("steps forward and marks finished when reaching the last step", () => {
    const state = createInitialPlaybackState(3); // steps 0, 1, 2

    const next1 = playbackReducer(state, { type: "STEP_FORWARD" });
    expect(next1.currentStep).toBe(1);
    expect(next1.isFinished).toBe(false);

    const next2 = playbackReducer(next1, { type: "STEP_FORWARD" });
    expect(next2.currentStep).toBe(2);
    expect(next2.isFinished).toBe(true);

    // Attempting step beyond last step should remain capped
    const next3 = playbackReducer(next2, { type: "STEP_FORWARD" });
    expect(next3.currentStep).toBe(2);
    expect(next3.isFinished).toBe(true);
  });

  it("steps backward and stops at 0", () => {
    const state = {
      ...createInitialPlaybackState(3),
      currentStep: 2,
    };

    const prev1 = playbackReducer(state, { type: "STEP_BACKWARD" });
    expect(prev1.currentStep).toBe(1);

    const prev2 = playbackReducer(prev1, { type: "STEP_BACKWARD" });
    expect(prev2.currentStep).toBe(0);

    // Attempting step backward below 0 should remain at 0
    const prev3 = playbackReducer(prev2, { type: "STEP_BACKWARD" });
    expect(prev3.currentStep).toBe(0);
  });

  it("handles GO_TO_START and GO_TO_END", () => {
    const state = createInitialPlaybackState(10);

    const endState = playbackReducer(state, { type: "GO_TO_END" });
    expect(endState.currentStep).toBe(9);
    expect(endState.isFinished).toBe(true);

    const startState = playbackReducer(endState, { type: "GO_TO_START" });
    expect(startState.currentStep).toBe(0);
    expect(startState.isFinished).toBe(false);
  });

  it("seeks to target steps and clamps within bounds", () => {
    const state = createInitialPlaybackState(10);

    const seekMid = playbackReducer(state, { type: "SEEK", step: 5 });
    expect(seekMid.currentStep).toBe(5);

    const seekUnder = playbackReducer(state, { type: "SEEK", step: -10 });
    expect(seekUnder.currentStep).toBe(0);

    const seekOver = playbackReducer(state, { type: "SEEK", step: 999 });
    expect(seekOver.currentStep).toBe(9);
    expect(seekOver.isFinished).toBe(true);
  });

  it("changes playback speed", () => {
    const state = createInitialPlaybackState(5);
    const updated = playbackReducer(state, { type: "SET_SPEED", speed: 2 });
    expect(updated.speed).toBe(2);
  });

  it("plays, pauses, and restarts when playing at the end", () => {
    const state = createInitialPlaybackState(5);
    const playing = playbackReducer(state, { type: "PLAY" });
    expect(playing.isPlaying).toBe(true);

    const paused = playbackReducer(playing, { type: "PAUSE" });
    expect(paused.isPlaying).toBe(false);

    // If at the end and user clicks play, it restarts from 0
    const atEnd = { ...paused, currentStep: 4, isFinished: true };
    const restarted = playbackReducer(atEnd, { type: "PLAY" });
    expect(restarted.currentStep).toBe(0);
    expect(restarted.isPlaying).toBe(true);
    expect(restarted.isFinished).toBe(false);
  });
});
