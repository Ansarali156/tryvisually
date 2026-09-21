"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Code2,
  Sparkles,
  Zap,
  Clock,
  Layers,
  X,
  Sliders,
  Maximize2,
} from "lucide-react";
import type { SupportedLanguage, SourceCode } from "@/core/synchronization/types";
import type { PlaybackSpeed } from "@/core/execution/types";
import { ZoomableCanvas } from "./zoomable-canvas";

export interface VisuAlgoActionParam {
  name: string;
  label: string;
  type: "number" | "text" | "select";
  defaultValue?: string | number;
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface VisuAlgoAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  params?: VisuAlgoActionParam[];
  presets?: { label: string; values: Record<string, string | number> }[];
  onExecute?: (params: Record<string, string | number>) => void;
  onClick?: () => void;
  popoverContent?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface VisuAlgoCodeLine {
  lineNumber: number;
  text: string;
  active?: boolean;
}

export interface VisuAlgoManualInput {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  onSubmit: (val: string) => void;
  presets?: { label: string; value: string }[];
}

export interface VisuAlgoShellProps {
  title: string;
  category?: string;
  subVariants?: { id: string; label: string; active?: boolean; onSelect?: () => void }[];
  activeSubVariant?: string;
  onSelectSubVariant?: (id: string) => void;
  // Status / e-Lecture (support both naming conventions)
  currentAction?: string;
  statusBadge?: string;
  stepExplanation?: string;
  statusExplanation?: string;
  whyExplanation?: string;
  timeComplexity?: string;
  complexityBadge?: string;
  spaceComplexity?: string;
  // Playback state & handlers
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  // Actions
  actions: VisuAlgoAction[];
  selectedActionId?: string;
  onSelectAction?: (actionId: string) => void;
  // Code Panel
  code?: string | SourceCode | Record<string, string>;
  codeLines?: VisuAlgoCodeLine[];
  activeCodeLines?: readonly number[] | number[];
  language?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  // Manual Input Bar
  manualInput?: VisuAlgoManualInput;
  // Canvas / Main Viewport
  children: React.ReactNode;
  className?: string;
}

export function VisuAlgoShell({
  title,
  category,
  subVariants,
  activeSubVariant,
  onSelectSubVariant,
  currentAction,
  statusBadge,
  stepExplanation,
  statusExplanation,
  whyExplanation,
  timeComplexity,
  complexityBadge,
  spaceComplexity,
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onGoToStart,
  onGoToEnd,
  onSeek,
  onSpeedChange,
  actions,
  selectedActionId: controlledActionId,
  onSelectAction,
  code,
  codeLines,
  activeCodeLines = [],
  language = "python",
  onLanguageChange,
  manualInput,
  children,
  className,
}: VisuAlgoShellProps) {
  const effectiveAction = statusBadge ?? currentAction ?? "Ready";
  const effectiveExplanation =
    statusExplanation ??
    stepExplanation ??
    "Select an operation from the bottom-left menu or enter custom input to begin visualization.";
  const effectiveTimeComplexity = complexityBadge ?? timeComplexity;

  // Local state for active action tray & parameters
  const [internalActionId, setInternalActionId] = React.useState<string | null>(
    actions[0]?.id || null
  );
  const activeActionId = controlledActionId !== undefined ? controlledActionId : internalActionId;
  const activeAction = actions.find((a) => a.id === activeActionId) || null;

  // Form parameter values for active tray
  const [paramValues, setParamValues] = React.useState<Record<string, string | number>>({});

  // Reset param values when action changes
  React.useEffect(() => {
    if (!activeAction) return;
    const initial: Record<string, string | number> = {};
    activeAction.params?.forEach((p) => {
      initial[p.name] = p.defaultValue ?? (p.type === "number" ? 0 : "");
    });
    setParamValues(initial);
  }, [activeActionId, activeAction]);

  // Collapsible HUD states
  const [isCodeCollapsed, setIsCodeCollapsed] = React.useState<boolean>(false);
  const [isStatusCollapsed, setIsStatusCollapsed] = React.useState<boolean>(false);
  const [isActionTrayOpen, setIsActionTrayOpen] = React.useState<boolean>(false);

  // Manual input state (either from prop or auto-discovered from create/manual action)
  const fallbackCreateAction = React.useMemo(() => {
    return actions.find((a) => a.id === "create" || a.id === "manual" || a.id === "custom" || a.id === "build");
  }, [actions]);

  const [manualInputValue, setManualInputValue] = React.useState<string>(
    manualInput?.defaultValue ||
      (fallbackCreateAction?.params?.[0]?.defaultValue as string) ||
      ""
  );

  React.useEffect(() => {
    if (manualInput?.defaultValue !== undefined) {
      setManualInputValue(manualInput.defaultValue);
    } else if (fallbackCreateAction?.params?.[0]?.defaultValue !== undefined) {
      setManualInputValue(String(fallbackCreateAction.params[0].defaultValue));
    }
  }, [manualInput?.defaultValue, fallbackCreateAction]);

  const handleManualInputSubmit = React.useCallback(
    (valueToSubmit?: string) => {
      const val = (valueToSubmit !== undefined ? valueToSubmit : manualInputValue).trim();
      if (!val) return;

      if (manualInput) {
        manualInput.onSubmit(val);
        return;
      }

      if (fallbackCreateAction?.onExecute) {
        const firstParam = fallbackCreateAction.params?.[0]?.name || "input";
        fallbackCreateAction.onExecute({ [firstParam]: val });
      }
    },
    [manualInput, fallbackCreateAction, manualInputValue]
  );

  const maxStep = Math.max(0, totalSteps - 1);
  const isAtStart = currentStep <= 0;
  const isAtEnd = currentStep >= maxStep;
  const speeds: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

  const handleActionClick = (action: VisuAlgoAction) => {
    if (onSelectAction) {
      onSelectAction(action.id);
    } else {
      setInternalActionId(action.id);
    }

    if (action.popoverContent) {
      setIsActionTrayOpen((prev) => (activeActionId === action.id ? !prev : true));
    } else if (action.onClick) {
      action.onClick();
      setIsActionTrayOpen(false);
    } else if (!action.params || action.params.length === 0) {
      action.onExecute?.({});
      setIsActionTrayOpen(false);
    } else {
      setIsActionTrayOpen((prev) => (activeActionId === action.id ? !prev : true));
    }
  };

  const handleExecute = () => {
    if (activeAction) {
      activeAction.onExecute?.(paramValues);
      setIsActionTrayOpen(false);
    }
  };

  // Resolve code lines with full support for SourceCode { code, lines }, maps, and strings
  const resolvedCodeLines: VisuAlgoCodeLine[] = React.useMemo(() => {
    if (codeLines && codeLines.length > 0) return codeLines;
    if (!code) return [];

    // Case 1: Object with lines array (SourceCode) or record
    if (typeof code === "object" && code !== null) {
      const sourceCodeCandidate = code as {
        code?: string;
        lines?: Array<{ lineNumber?: number; content?: string; text?: string }>;
      } & Record<string, string | undefined>;

      if (Array.isArray(sourceCodeCandidate.lines) && sourceCodeCandidate.lines.length > 0) {
        return sourceCodeCandidate.lines.map((l, idx: number) => {
          const num = typeof l.lineNumber === "number" ? l.lineNumber : idx + 1;
          const text = l.content ?? l.text ?? String(l);
          return {
            lineNumber: num,
            text,
            active: activeCodeLines.includes(num),
          };
        });
      }
      // Case 2: Object with raw .code string
      if (typeof sourceCodeCandidate.code === "string") {
        return sourceCodeCandidate.code.split("\n").map((text: string, idx: number) => ({
          lineNumber: idx + 1,
          text,
          active: activeCodeLines.includes(idx + 1),
        }));
      }
      // Case 3: Language-keyed dictionary: { python: "...", typescript: "..." }
      if (typeof sourceCodeCandidate[language] === "string") {
        const langStr = sourceCodeCandidate[language];
        if (langStr) {
          return langStr.split("\n").map((text: string, idx: number) => ({
            lineNumber: idx + 1,
            text,
            active: activeCodeLines.includes(idx + 1),
          }));
        }
      }
      if (typeof sourceCodeCandidate["python"] === "string") {
        const pyStr = sourceCodeCandidate["python"];
        if (pyStr) {
          return pyStr.split("\n").map((text: string, idx: number) => ({
            lineNumber: idx + 1,
            text,
            active: activeCodeLines.includes(idx + 1),
          }));
        }
      }
      // Fallback first non-empty string in values
      for (const val of Object.values(sourceCodeCandidate)) {
        if (typeof val === "string" && val.length > 15) {
          return val.split("\n").map((text: string, idx: number) => ({
            lineNumber: idx + 1,
            text,
            active: activeCodeLines.includes(idx + 1),
          }));
        }
      }
    }

    // Case 4: Plain string
    if (typeof code === "string") {
      return code.split("\n").map((text: string, idx: number) => ({
        lineNumber: idx + 1,
        text,
        active: activeCodeLines.includes(idx + 1),
      }));
    }

    return [];
  }, [codeLines, code, language, activeCodeLines]);

  return (
    <div
      className={cn(
        "relative w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 select-none overflow-hidden transition-colors font-sans",
        className
      )}
    >
      {/* 1. TOP SUB-HEADER: Algorithm Variants & Category Strip */}
      <div className="shrink-0 h-11 px-4 sm:px-6 bg-white/95 dark:bg-[#0e1424]/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs font-mono backdrop-blur z-20">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          {category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/60 shrink-0">
              {category}
            </span>
          )}
          <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100 shrink-0">
            {title}
          </span>

          {/* Sub-variant Pills (e.g. Bubble, Selection, Quick or Singly, Doubly) */}
          {subVariants && subVariants.length > 0 && (
            <div className="flex items-center gap-1 ml-2 border-l border-slate-200 dark:border-slate-800 pl-2 shrink-0">
              {subVariants.map((v) => {
                const isActive = v.active !== undefined ? v.active : activeSubVariant === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      if (v.onSelect) v.onSelect();
                      else if (onSelectSubVariant) onSelectSubVariant(v.id);
                    }}
                    className={cn(
                      "px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer",
                      isActive
                        ? "bg-amber-500 text-slate-950 shadow-2xs font-bold hover:bg-amber-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-time Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isPlaying
                  ? "bg-emerald-500 animate-pulse"
                  : currentStep > 0
                  ? "bg-amber-500"
                  : "bg-slate-400"
              )}
            />
            {isPlaying ? "Running" : currentStep > 0 ? "Paused" : "Ready"}
          </span>
        </div>
      </div>

      {/* 1.5 DEDICATED PROMINENT MANUAL INPUT BAR */}
      {(manualInput || fallbackCreateAction) && (
        <div className="shrink-0 px-4 sm:px-6 py-1.5 bg-amber-500/5 dark:bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs z-20 backdrop-blur">
          <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-xl">
            <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Sliders className="h-3.5 w-3.5 text-amber-500" />
              <span>{manualInput?.label || "Input Data"}:</span>
            </span>
            <input
              type="text"
              value={manualInputValue}
              onChange={(e) => setManualInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleManualInputSubmit();
                }
              }}
              placeholder={
                manualInput?.placeholder ||
                "Enter custom data (e.g. 15, 42, 8, 23)"
              }
              data-testid="visualgo-manual-input"
              className="flex-1 h-7 px-2.5 rounded-md text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={() => handleManualInputSubmit()}
              className="h-7 px-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              Load Data
            </button>
          </div>

          {/* Quick Presets */}
          {(manualInput?.presets || fallbackCreateAction?.presets) && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Presets:</span>
              {(manualInput?.presets ||
                fallbackCreateAction?.presets?.map((p) => ({
                  label: p.label,
                  value: String(Object.values(p.values)[0] ?? ""),
                })) ||
                []
              ).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setManualInputValue(preset.value);
                    handleManualInputSubmit(preset.value);
                  }}
                  className="h-6 px-2 rounded text-[10px] font-mono bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. MAIN INTERACTIVE VISUALIZATION STAGE WITH ZOOM & PAN */}
      <main
        className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center"
        aria-label="Algorithm visualization canvas"
      >
        <ZoomableCanvas>
          {children}
        </ZoomableCanvas>

        {/* 3. TOP-LEFT FLOATING STATUS & E-LECTURE HUD */}
        <div
          className={cn(
            "absolute top-4 left-4 z-30 transition-all duration-200 max-w-md w-full sm:w-[380px]",
            isStatusCollapsed && "w-auto max-w-none"
          )}
        >
          {isStatusCollapsed ? (
            <button
              onClick={() => setIsStatusCollapsed(false)}
              className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#0e1424]/95 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 hover:border-amber-500 transition-colors cursor-pointer"
              title="Show Step Explanation"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{effectiveAction}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          ) : (
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0e1424]/95 shadow-xl backdrop-blur-md overflow-hidden text-xs">
              {/* Header */}
              <div className="px-3.5 py-2 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-[#0a0f1d]/70">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-amber-700 dark:text-amber-400">
                    {effectiveAction}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsStatusCollapsed(true)}
                    className="h-5 w-5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="Minimize explanation"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Explanation Content */}
              <div className="p-3.5 space-y-2">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs sm:text-[13px]">
                  {effectiveExplanation}
                </p>
                {whyExplanation && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic border-l-2 border-amber-500/40 pl-2">
                    {whyExplanation}
                  </p>
                )}

                {/* Complexity Footer */}
                {(effectiveTimeComplexity || spaceComplexity) && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {effectiveTimeComplexity && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span>Time:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {effectiveTimeComplexity}
                        </strong>
                      </span>
                    )}
                    {spaceComplexity && (
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3 text-amber-500" />
                        <span>Space:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {spaceComplexity}
                        </strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. BOTTOM-RIGHT COLLAPSIBLE CODE / PSEUDOCODE HUD */}
        {resolvedCodeLines.length > 0 && (
          <div
            className={cn(
              "absolute bottom-20 sm:bottom-6 right-4 z-30 transition-all duration-200 w-full sm:w-[380px] max-w-[calc(100vw-2rem)]",
              isCodeCollapsed && "w-auto sm:w-auto"
            )}
          >
            {isCodeCollapsed ? (
              <button
                onClick={() => setIsCodeCollapsed(false)}
                className="px-3 py-2 rounded-xl bg-white/95 dark:bg-[#0e1424]/95 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 hover:border-amber-500 transition-colors cursor-pointer"
                title="Show Algorithm Code"
              >
                <Code2 className="h-3.5 w-3.5 text-amber-500" />
                <span>Code HUD</span>
                <ChevronUp className="h-3 w-3 text-slate-400" />
              </button>
            ) : (
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0e1424]/95 shadow-xl backdrop-blur-md overflow-hidden text-xs flex flex-col max-h-[280px] sm:max-h-[340px]">
                {/* Header */}
                <div className="px-3.5 py-2 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-[#0a0f1d]/70 shrink-0">
                  <div className="flex items-center gap-2 font-mono">
                    <Code2 className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                      Execution Code
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onLanguageChange && (
                      <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                        className="h-5 px-1 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="python">Python</option>
                        <option value="typescript">TypeScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                    )}

                    <button
                      onClick={() => setIsCodeCollapsed(true)}
                      className="h-5 w-5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      title="Minimize code HUD"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Code Lines Container */}
                <div className="p-2 overflow-y-auto font-mono text-[11px] leading-5 divide-y divide-transparent max-h-[260px]">
                  {resolvedCodeLines.map((line) => {
                    const isActive = line.active || activeCodeLines.includes(line.lineNumber);
                    return (
                      <div
                        key={line.lineNumber}
                        className={cn(
                          "px-2 py-0.5 rounded flex items-center gap-3 transition-colors",
                          isActive
                            ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border-l-2 border-amber-500 pl-2 shadow-2xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        )}
                      >
                        <span className="text-[10px] text-slate-400 w-5 text-right shrink-0 select-none font-mono">
                          {line.lineNumber}
                        </span>
                        <span className="whitespace-pre overflow-x-auto">{line.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 5. VISUALGO BOTTOM HUD: Action Menu (Left) + Media Controller (Center) */}
      <div className="shrink-0 p-3 sm:p-4 bg-white/95 dark:bg-[#0a0f1d]/95 border-t border-slate-200 dark:border-slate-850 flex flex-col md:flex-row items-center justify-between gap-3 z-30 shadow-lg backdrop-blur">
        {/* ============================================================ */}
        {/* BOTTOM-LEFT: VISUALGO ACTION MENU DOCK                       */}
        {/* ============================================================ */}
        <div className="relative w-full md:w-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {actions.map((action) => {
            const isSelected = activeActionId === action.id;
            const Icon = action.icon || Zap;

            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed",
                  isSelected && isActionTrayOpen
                    ? "bg-amber-500 text-slate-950 dark:bg-amber-500 dark:text-slate-950 shadow-md ring-2 ring-amber-500/30"
                    : isSelected
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/40"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40"
                )}
                title={action.description || action.label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{action.label}</span>
              </button>
            );
          })}

          {/* Action Parameter Popover Tray */}
          {isActionTrayOpen && activeAction && (
            <div className="absolute bottom-full left-0 mb-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1424] shadow-2xl backdrop-blur-md flex flex-col gap-2.5 z-40 min-w-[280px] max-w-[340px] animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-850">
                <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>{activeAction.label}</span>
                </span>
                <button
                  onClick={() => setIsActionTrayOpen(false)}
                  className="h-5 w-5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Custom Popover Content if present */}
              {activeAction.popoverContent ? (
                <div>{activeAction.popoverContent}</div>
              ) : activeAction.params && activeAction.params.length > 0 ? (
                <>
                  {/* Dynamic Inputs */}
                  <div className="flex flex-col gap-2">
                    {activeAction.params.map((param) => (
                      <div key={param.name} className="flex items-center justify-between gap-2 text-xs font-mono">
                        <label className="text-slate-600 dark:text-slate-400 font-semibold">{param.label}:</label>
                        {param.type === "select" && param.options ? (
                          <select
                            value={paramValues[param.name] ?? param.defaultValue}
                            onChange={(e) =>
                              setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))
                            }
                            className="h-7 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                          >
                            {param.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={param.type}
                            min={param.min}
                            max={param.max}
                            placeholder={param.placeholder}
                            value={paramValues[param.name] ?? ""}
                            onChange={(e) =>
                              setParamValues((prev) => ({
                                ...prev,
                                [param.name]:
                                  param.type === "number" ? Number(e.target.value) : e.target.value,
                              }))
                            }
                            className="h-7 px-2 w-32 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Presets */}
                  {activeAction.presets && activeAction.presets.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-850 overflow-x-auto">
                      <span className="text-[10px] text-slate-400 font-mono">Presets:</span>
                      {activeAction.presets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setParamValues((prev) => ({ ...prev, ...preset.values }))}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Execute / Go Button */}
                  <button
                    onClick={handleExecute}
                    className="w-full h-8 mt-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Go</span>
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* BOTTOM-CENTER: UNIFIED MEDIA PLAYBACK CONTROLLER             */}
        {/* ============================================================ */}
        <div className="w-full md:w-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {/* Step Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-850">
            <button
              onClick={onGoToStart}
              disabled={isAtStart}
              className="h-7 w-7 rounded flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              title="First Step (|◀)"
              aria-label="First Step (|◀)"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onStepBackward}
              disabled={isAtStart}
              className="h-7 w-7 rounded flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              title="Step Backward (◀)"
              aria-label="Step Backward (◀)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {isPlaying ? (
              <button
                onClick={onPause}
                className="h-7 px-3 rounded bg-amber-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Pause Execution"
                aria-label="Pause Execution"
              >
                <Pause className="h-3 w-3 fill-current" />
                <span className="hidden sm:inline">Pause</span>
              </button>
            ) : (
              <button
                onClick={onPlay}
                disabled={totalSteps <= 1}
                className="h-7 px-3 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                title="Play Execution"
                aria-label="Play Execution"
              >
                <Play className="h-3 w-3 fill-current" />
                <span className="hidden sm:inline">Play</span>
              </button>
            )}

            <button
              onClick={onStepForward}
              disabled={isAtEnd}
              className="h-7 w-7 rounded flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              title="Step Forward (▶)"
              aria-label="Step Forward (▶)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={onGoToEnd}
              disabled={isAtEnd}
              className="h-7 w-7 rounded flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              title="Last Step (▶|)"
              aria-label="Last Step (▶|)"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Step Counter */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <strong className="text-slate-800 dark:text-slate-200">
                {totalSteps > 0 ? currentStep + 1 : 0}
              </strong>
              /{totalSteps}
            </span>

            <input
              type="range"
              min={0}
              max={maxStep}
              value={currentStep}
              onChange={(e) => onSeek(Number(e.target.value))}
              disabled={totalSteps <= 1}
              className="sr-only"
              aria-label="Timeline scrubber"
            />
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-850">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-mono rounded transition-colors cursor-pointer",
                  speed === s
                    ? "bg-amber-500 text-slate-950 font-bold shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
