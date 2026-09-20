import { PlaybackAction, PlaybackState } from "./types";

export const initialPlaybackState: PlaybackState = {
  currentStep: 0,
  totalSteps: 0,
  isPlaying: false,
  speed: 1,
  isFinished: false,
};

export function createInitialPlaybackState(totalSteps: number): PlaybackState {
  return {
    currentStep: 0,
    totalSteps: Math.max(0, totalSteps),
    isPlaying: false,
    speed: 1,
    isFinished: totalSteps <= 1,
  };
}

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  const maxStep = Math.max(0, state.totalSteps - 1);

  switch (action.type) {
    case "PLAY": {
      if (state.totalSteps <= 1) return state;
      // If we are at the end, wrap or stay
      if (state.currentStep >= maxStep) {
        return {
          ...state,
          currentStep: 0,
          isPlaying: true,
          isFinished: false,
        };
      }
      return {
        ...state,
        isPlaying: true,
        isFinished: false,
      };
    }

    case "PAUSE": {
      return {
        ...state,
        isPlaying: false,
      };
    }

    case "STEP_FORWARD": {
      if (state.currentStep >= maxStep) {
        return {
          ...state,
          isPlaying: false,
          isFinished: true,
        };
      }
      const nextStep = state.currentStep + 1;
      return {
        ...state,
        currentStep: nextStep,
        isFinished: nextStep >= maxStep,
      };
    }

    case "STEP_BACKWARD": {
      if (state.currentStep <= 0) {
        return state;
      }
      return {
        ...state,
        currentStep: state.currentStep - 1,
        isPlaying: false,
        isFinished: false,
      };
    }

    case "GO_TO_START": {
      return {
        ...state,
        currentStep: 0,
        isPlaying: false,
        isFinished: false,
      };
    }

    case "GO_TO_END": {
      return {
        ...state,
        currentStep: maxStep,
        isPlaying: false,
        isFinished: true,
      };
    }

    case "SEEK": {
      const targetStep = Math.min(Math.max(0, action.step), maxStep);
      return {
        ...state,
        currentStep: targetStep,
        isPlaying: false,
        isFinished: targetStep >= maxStep,
      };
    }

    case "SET_SPEED": {
      return {
        ...state,
        speed: action.speed,
      };
    }

    case "RESET": {
      return createInitialPlaybackState(action.totalSteps);
    }

    default:
      return state;
  }
}
