"use client";

import * as React from "react";
import {
  SUPPORTED_LANGUAGES,
  compileAndExecute,
  type SupportedLanguage,
  type LanguageConfig,
} from "@/core/sandbox/multi-compiler";
import { type TraceStep } from "@/core/sandbox/python-tracer";
import { type TraceExample } from "./trace-examples";

export type ExecutionStatus =
  | "IDLE"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "ERROR"
  | "CANCELLED";

export interface StoredSessionV1 {
  version: 1;
  code: string;
  language: SupportedLanguage;
  codeByLanguage?: Partial<Record<SupportedLanguage, string>>;
  fontSize?: "12px" | "13px" | "14px" | "16px";
}

const STORAGE_KEY = "try-visually:trace-session:v1";

export interface TraceSessionContextValue {
  // Source Code State (Canonical source of truth, persisted across navigation)
  code: string;
  language: SupportedLanguage;
  languageConfig: LanguageConfig;
  fontSize: "12px" | "13px" | "14px" | "16px";
  isDirty: boolean;

  // Execution State (Separated from Source Code)
  executionStatus: ExecutionStatus;
  viewMode: "output" | "visualise";
  outputLogs: readonly string[];
  executionError: string | null;
  executionTime: number | null;
  traceSteps: readonly TraceStep[];
  currentStepIndex: number;
  currentStep: TraceStep | null;
  prevStep: TraceStep | null;
  isPlaying: boolean;
  playbackSpeed: number;
  hasExecuted: boolean;

  // Interactive Dynamic Input State
  needsInput: boolean;
  inputPrompt: string;
  sessionInputs: readonly string[];

  // Actions
  setCode: (newCode: string) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setFontSize: (size: "12px" | "13px" | "14px" | "16px") => void;
  setViewMode: (mode: "output" | "visualise") => void;
  loadExample: (example: TraceExample) => void;
  clearSession: () => void;
  resetExecution: () => void;
  executeCode: (targetMode: "output" | "visualise", overrideInputs?: string[]) => Promise<void>;
  cancelExecution: () => void;
  submitInput: (val: string) => void;
  stepNext: () => void;
  stepPrev: () => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setCurrentStepIndex: (index: number | ((prev: number) => number)) => void;
}

const TraceSessionContext = React.createContext<TraceSessionContextValue | null>(null);

function safeLoadStoredSession(): StoredSessionV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.version === 1 && typeof parsed.code === "string") {
      const validLangs = SUPPORTED_LANGUAGES.map((l) => l.id);
      const language: SupportedLanguage = validLangs.includes(parsed.language)
        ? parsed.language
        : "python";
      return {
        version: 1,
        code: parsed.code,
        language,
        codeByLanguage: parsed.codeByLanguage || {},
        fontSize: parsed.fontSize || "13px",
      };
    }
    return null;
  } catch {
    return null;
  }
}

function safeSaveStoredSession(data: StoredSessionV1): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Gracefully ignore quota or security exceptions
  }
}

export function TraceSessionProvider({ children }: { children: React.ReactNode }) {
  // 1. Source Code State - Default starts completely BLANK ("")
  const [code, setCodeState] = React.useState<string>("");
  const [language, setLanguageState] = React.useState<SupportedLanguage>("python");
  const [codeByLanguage, setCodeByLanguage] = React.useState<Partial<Record<SupportedLanguage, string>>>({});
  const [fontSize, setFontSizeState] = React.useState<"12px" | "13px" | "14px" | "16px">("13px");
  const [isHydrated, setIsHydrated] = React.useState(false);

  // 2. Execution State (Separated from Source Code)
  const [executionStatus, setExecutionStatus] = React.useState<ExecutionStatus>("IDLE");
  const [viewMode, setViewMode] = React.useState<"output" | "visualise">("output");
  const [outputLogs, setOutputLogs] = React.useState<string[]>([]);
  const [executionError, setExecutionError] = React.useState<string | null>(null);
  const [executionTime, setExecutionTime] = React.useState<number | null>(null);
  const [traceSteps, setTraceSteps] = React.useState<TraceStep[]>([]);
  const [currentStepIndex, setCurrentStepIndexState] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = React.useState<number>(1);
  const [hasExecuted, setHasExecuted] = React.useState(false);

  // 3. Dynamic Interactive Input State
  const [needsInput, setNeedsInput] = React.useState(false);
  const [inputPrompt, setInputPrompt] = React.useState("");
  const [sessionInputs, setSessionInputs] = React.useState<string[]>([]);

  // Execution concurrency & race-condition guards
  const executionIdRef = React.useRef<number>(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Hydrate from localStorage once on client mount
  React.useEffect(() => {
    const stored = safeLoadStoredSession();
    if (stored) {
      setCodeState(stored.code || "");
      setLanguageState(stored.language || "python");
      setCodeByLanguage(stored.codeByLanguage || {});
      if (stored.fontSize) setFontSizeState(stored.fontSize);
    }
    setIsHydrated(true);
  }, []);

  // Persist code & language when modified (after hydration)
  React.useEffect(() => {
    if (!isHydrated) return;
    safeSaveStoredSession({
      version: 1,
      code,
      language,
      codeByLanguage,
      fontSize,
    });
  }, [code, language, codeByLanguage, fontSize, isHydrated]);

  const languageConfig: LanguageConfig = React.useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.id === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const setCode = React.useCallback(
    (newCode: string) => {
      setCodeState(newCode);
      setCodeByLanguage((prev) => ({
        ...prev,
        [language]: newCode,
      }));
    },
    [language]
  );

  const setLanguage = React.useCallback(
    (newLang: SupportedLanguage) => {
      // Save current code under current language
      setCodeByLanguage((prev) => ({
        ...prev,
        [language]: code,
      }));

      // Switch language and restore drafted code for that language, defaulting to blank ("")
      setLanguageState(newLang);
      const previousCodeForLang = codeByLanguage[newLang] !== undefined ? codeByLanguage[newLang]! : "";
      setCodeState(previousCodeForLang);

      // Reset execution state on language change
      setExecutionStatus("IDLE");
      setOutputLogs([]);
      setExecutionError(null);
      setTraceSteps([]);
      setCurrentStepIndexState(0);
      setIsPlaying(false);
      setNeedsInput(false);
      setSessionInputs([]);
    },
    [language, code, codeByLanguage]
  );

  const setFontSize = React.useCallback((size: "12px" | "13px" | "14px" | "16px") => {
    setFontSizeState(size);
  }, []);

  const loadExample = React.useCallback((example: TraceExample) => {
    setLanguageState(example.language);
    setCodeState(example.code);
    setCodeByLanguage((prev) => ({
      ...prev,
      [example.language]: example.code,
    }));
    setExecutionStatus("IDLE");
    setOutputLogs([]);
    setExecutionError(null);
    setTraceSteps([]);
    setCurrentStepIndexState(0);
    setIsPlaying(false);
    setNeedsInput(false);
    setSessionInputs([]);
  }, []);

  const clearSession = React.useCallback(() => {
    // Explicit New/Clear action
    setCodeState("");
    setCodeByLanguage((prev) => ({
      ...prev,
      [language]: "",
    }));
    setExecutionStatus("IDLE");
    setOutputLogs([]);
    setExecutionError(null);
    setExecutionTime(null);
    setTraceSteps([]);
    setCurrentStepIndexState(0);
    setIsPlaying(false);
    setHasExecuted(false);
    setNeedsInput(false);
    setSessionInputs([]);
  }, [language]);

  const resetExecution = React.useCallback(() => {
    // Reset execution step back to beginning without touching source code
    setIsPlaying(false);
    setCurrentStepIndexState(0);
    if (traceSteps.length > 0) {
      setExecutionStatus("COMPLETED");
    } else {
      setExecutionStatus("IDLE");
    }
  }, [traceSteps.length]);

  const cancelExecution = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setExecutionStatus("CANCELLED");
  }, []);

  const executeCode = React.useCallback(
    async (targetMode: "output" | "visualise", overrideInputs?: string[]) => {
      // Abort any in-flight requests to eliminate race conditions
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Unique monotonic request ID: only latest response wins
      const reqId = ++executionIdRef.current;

      setIsPlaying(false);
      setViewMode(targetMode);
      setExecutionStatus("RUNNING");
      setExecutionError(null);

      // Check for empty code
      if (!code.trim()) {
        setExecutionStatus("IDLE");
        setExecutionError("Editor is empty. Write code or select an example to run.");
        setOutputLogs([]);
        setTraceSteps([]);
        setHasExecuted(true);
        return;
      }

      if (overrideInputs === undefined) {
        setSessionInputs([]);
      }
      const activeInputs = overrideInputs !== undefined ? overrideInputs : [];
      const formattedStdin = activeInputs.length > 0 ? activeInputs.join("\n") + "\n" : "";

      try {
        const resp = await fetch("/api/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            language,
            code,
            action: targetMode,
            stdin: formattedStdin,
          }),
        });

        // Stale response check: discard if newer execution was triggered
        if (reqId !== executionIdRef.current) return;

        if (resp.ok) {
          const data = await resp.json();
          if (reqId !== executionIdRef.current) return;

          if (!data.fallback) {
            setExecutionTime(data.executionTimeMs ?? 0);
            setExecutionError(data.error || null);

            // Handle program asking for dynamic input
            if (data.needsInput) {
              setNeedsInput(true);
              setInputPrompt(data.prompt || "Enter input:");
              setOutputLogs(data.output || []);
              setHasExecuted(true);
              setExecutionStatus("PAUSED");
              return;
            }

            // Normal completion
            setNeedsInput(false);
            setInputPrompt("");
            setOutputLogs(data.output || []);

            if (data.steps && data.steps.length > 0) {
              setTraceSteps(data.steps);
            } else if (targetMode === "visualise") {
              const localRes = compileAndExecute(language, code);
              setTraceSteps([...localRes.steps]);
            }

            setHasExecuted(true);
            setCurrentStepIndexState(0);
            setExecutionStatus(data.error ? "ERROR" : "COMPLETED");
            return;
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return; // Intentionally aborted by newer execution
        }
        if (reqId !== executionIdRef.current) return;
      }

      // Fallback local execution if network/server is offline
      const result = compileAndExecute(language, code);
      if (reqId !== executionIdRef.current) return;

      setExecutionTime(result.executionTimeMs);
      setOutputLogs([...result.output]);
      setExecutionError(result.error || null);
      setTraceSteps([...result.steps]);
      setHasExecuted(true);
      setCurrentStepIndexState(0);
      setNeedsInput(false);
      setExecutionStatus(result.error ? "ERROR" : "COMPLETED");
    },
    [code, language]
  );

  const submitInput = React.useCallback(
    (val: string) => {
      const newInputs = [...sessionInputs, val];
      setSessionInputs(newInputs);
      executeCode(viewMode, newInputs);
    },
    [sessionInputs, viewMode, executeCode]
  );

  // Auto playback effect in Visualise mode - automatically resets after completion of tracing
  React.useEffect(() => {
    if (!isPlaying || viewMode !== "visualise") return;
    const intervalMs = Math.max(Math.round(1000 / playbackSpeed), 100);
    let resetTimer: NodeJS.Timeout | null = null;

    const interval = setInterval(() => {
      setCurrentStepIndexState((prev) => {
        if (prev >= traceSteps.length - 1) {
          setIsPlaying(false);
          // After completion of tracing, hold final result briefly then reset automatically to step 0
          resetTimer = setTimeout(() => {
            setCurrentStepIndexState(0);
          }, Math.max(Math.round(1000 / playbackSpeed), 800));
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      clearInterval(interval);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [isPlaying, traceSteps.length, viewMode, playbackSpeed]);

  const currentStep = traceSteps[currentStepIndex] || traceSteps[0] || null;
  const prevStep = currentStepIndex > 0 ? traceSteps[currentStepIndex - 1] : null;

  const stepNext = React.useCallback(() => {
    setCurrentStepIndexState((prev) => {
      if (prev >= traceSteps.length - 1) {
        // Automatically reset to step 0 after completing all trace steps
        return 0;
      }
      return prev + 1;
    });
  }, [traceSteps.length]);

  const stepPrev = React.useCallback(() => {
    setCurrentStepIndexState((prev) => Math.max(prev - 1, 0));
  }, []);

  const togglePlay = React.useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && currentStepIndex >= traceSteps.length - 1) {
        // If starting playback at the end of trace, reset to beginning
        setCurrentStepIndexState(0);
      }
      return !prev;
    });
  }, [currentStepIndex, traceSteps.length]);

  const setPlaybackSpeed = React.useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
  }, []);

  const setCurrentStepIndex = React.useCallback((val: number | ((prev: number) => number)) => {
    setCurrentStepIndexState(val);
  }, []);

  const isDirty = code.trim().length > 0;

  const value = React.useMemo<TraceSessionContextValue>(() => {
    return {
      code,
      language,
      languageConfig,
      fontSize,
      isDirty,
      executionStatus,
      viewMode,
      outputLogs,
      executionError,
      executionTime,
      traceSteps,
      currentStepIndex,
      currentStep,
      prevStep,
      isPlaying,
      playbackSpeed,
      hasExecuted,
      needsInput,
      inputPrompt,
      sessionInputs,
      setCode,
      setLanguage,
      setFontSize,
      setViewMode,
      loadExample,
      clearSession,
      resetExecution,
      executeCode,
      cancelExecution,
      submitInput,
      stepNext,
      stepPrev,
      togglePlay,
      setPlaybackSpeed,
      setCurrentStepIndex,
    };
  }, [
    code,
    language,
    languageConfig,
    fontSize,
    isDirty,
    executionStatus,
    viewMode,
    outputLogs,
    executionError,
    executionTime,
    traceSteps,
    currentStepIndex,
    currentStep,
    prevStep,
    isPlaying,
    playbackSpeed,
    hasExecuted,
    needsInput,
    inputPrompt,
    sessionInputs,
    setCode,
    setLanguage,
    setFontSize,
    setViewMode,
    loadExample,
    clearSession,
    resetExecution,
    executeCode,
    cancelExecution,
    submitInput,
    stepNext,
    stepPrev,
    togglePlay,
    setPlaybackSpeed,
    setCurrentStepIndex,
  ]);

  return <TraceSessionContext.Provider value={value}>{children}</TraceSessionContext.Provider>;
}

export function useTraceSession(): TraceSessionContextValue {
  const ctx = React.useContext(TraceSessionContext);
  if (!ctx) {
    throw new Error("useTraceSession must be used within a TraceSessionProvider");
  }
  return ctx;
}
