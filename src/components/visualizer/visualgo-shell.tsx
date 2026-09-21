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
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  X,
} from "lucide-react";
import type { SupportedLanguage, SourceCode } from "@/core/synchronization/types";
import type { PlaybackSpeed } from "@/core/execution/types";

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
  children,
  className,
}: VisuAlgoShellProps) {
  const effectiveAction = statusBadge ?? currentAction ?? "Ready";
  const effectiveExplanation =
    statusExplanation ??
    stepExplanation ??
    "Select an operation from the bottom-left menu to begin visualization.";
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
      if (activeActionId === action.id && isActionTrayOpen) {
        setIsActionTrayOpen(false);
      } else {
        setIsActionTrayOpen(true);
      }
    } else if (action.onClick) {
      action.onClick();
      setIsActionTrayOpen(false);
    } else if (!action.params || action.params.length === 0) {
      action.onExecute?.({});
      setIsActionTrayOpen(false);
    } else {
      if (activeActionId === action.id && isActionTrayOpen) {
        setIsActionTrayOpen(false);
      } else {
        setIsActionTrayOpen(true);
      }
    }
  };

  const handleExecute = () => {
    if (activeAction) {
      activeAction.onExecute?.(paramValues);
      setIsActionTrayOpen(false);
    }
  };

  // Resolve code string if object passed
  const resolvedCodeString = React.useMemo(() => {
    if (!code) return "";
    if (typeof code === "string") return code;
    const codeObj = code as Record<string, string | undefined>;
    return codeObj[language] || codeObj["python"] || Object.values(codeObj)[0] || "";
  }, [code, language]);

  // Convert raw code string to code lines if provided
  const resolvedCodeLines: VisuAlgoCodeLine[] = React.useMemo(() => {
    if (codeLines && codeLines.length > 0) return codeLines;
    if (!resolvedCodeString) return [];
    return resolvedCodeString.split("\n").map((text: string, idx: number) => ({
      lineNumber: idx + 1,
      text,
      active: activeCodeLines.includes(idx + 1),
    }));
  }, [codeLines, resolvedCodeString, activeCodeLines]);

  return (
    <div
      className={cn(
        "relative w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 select-none overflow-hidden transition-colors font-sans",
        className
      )}
    >
      {/* 1. TOP SUB-HEADER: Algorithm Variants & Category Strip */}
      <div className="shrink-0 h-10 px-4 sm:px-6 bg-white/90 dark:bg-[#0a0f1d]/90 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between gap-3 text-xs font-mono backdrop-blur z-20">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          {category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-900/60 shrink-0">
              {category}
            </span>
          )}
          <span className="font-bold tracking-tight text-slate-800 dark:text-slate-200 shrink-0">
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
                        ? "bg-cyan-600 text-white shadow-2xs dark:bg-cyan-500 dark:text-slate-950 font-bold"
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

      {/* 2. MAIN INTERACTIVE VISUALIZATION STAGE */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}

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
              className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:border-cyan-500 transition-colors cursor-pointer"
              title="Show Step Explanation"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{effectiveAction}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          ) : (
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0c1220]/95 shadow-xl backdrop-blur-md overflow-hidden text-xs">
              {/* Header */}
              <div className="px-3.5 py-2 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-[#080d1a]/70">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-700 dark:text-cyan-300">
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic border-l-2 border-cyan-500/40 pl-2">
                    {whyExplanation}
                  </p>
                )}

                {/* Complexity Footer */}
                {(effectiveTimeComplexity || spaceComplexity) && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {effectiveTimeComplexity && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-cyan-500" />
                        <span>Time:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{effectiveTimeComplexity}</strong>
                      </span>
                    )}
                    {spaceComplexity && (
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3 text-cyan-500" />
                        <span>Space:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{spaceComplexity}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. BOTTOM-RIGHT COLLAPSIBLE CODE / PSEUDOCODE HUD */}
        {(resolvedCodeString || resolvedCodeLines.length > 0) && (
          <div
            className={cn(
              "absolute bottom-20 sm:bottom-4 right-4 z-30 transition-all duration-200 w-full sm:w-[380px] max-w-[calc(100vw-2rem)]",
              isCodeCollapsed && "w-auto sm:w-auto"
            )}
          >
            {isCodeCollapsed ? (
              <button
                onClick={() => setIsCodeCollapsed(false)}
                className="px-3 py-2 rounded-xl bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 hover:border-cyan-500 transition-colors cursor-pointer"
                title="Show Algorithm Code"
              >
                <Code2 className="h-3.5 w-3.5 text-cyan-500" />
                <span>Code HUD</span>
                <ChevronUp className="h-3 w-3 text-slate-400" />
              </button>
            ) : (
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0c1220]/95 shadow-xl backdrop-blur-md overflow-hidden text-xs flex flex-col max-h-[300px] sm:max-h-[360px]">
                {/* Header */}
                <div className="px-3.5 py-2 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-[#080d1a]/70 shrink-0">
                  <div className="flex items-center gap-2 font-mono">
                    <Code2 className="h-3.5 w-3.5 text-cyan-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                      Execution Code
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onLanguageChange && (
                      <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                        className="h-5 px-1 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
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
                <div className="p-2 overflow-y-auto font-mono text-[11px] leading-5 divide-y divide-transparent">
                  {resolvedCodeLines.map((line) => {
                    const isActive = line.active || activeCodeLines.includes(line.lineNumber);
                    return (
                      <div
                        key={line.lineNumber}
                        className={cn(
                          "px-2 py-0.5 rounded flex items-center gap-3 transition-colors",
                          isActive
                            ? "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-bold border-l-2 border-cyan-500 pl-2 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        )}
                      >
                        <span className="text-[10px] text-slate-400 w-5 text-right shrink-0 select-none">
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
      </div>

      {/* 5. VISUALGO BOTTOM HUD: Action Menu (Left) + Media Controller (Center) */}
      <div className="shrink-0 p-3 sm:p-4 bg-white/95 dark:bg-[#070b14]/95 border-t border-slate-200 dark:border-slate-850 flex flex-col md:flex-row items-center justify-between gap-3 z-30 shadow-lg backdrop-blur">
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
                    ? "bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md ring-2 ring-cyan-500/30"
                    : isSelected
                    ? "bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                )}
                title={action.description || action.label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{action.label}</span>
              </button>
            );
          })}

          {/* Action Parameter Popover Tray (Pops up directly above actions) */}
          {isActionTrayOpen && activeAction && (
            <div className="absolute bottom-full left-0 mb-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xl backdrop-blur-md flex flex-col gap-2.5 z-40 min-w-[280px] max-w-[340px] animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-850">
                <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-cyan-500" />
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
                            className="h-7 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
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
                            className="h-7 px-2 w-32 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
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
                    className="w-full h-8 mt-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
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
                className="h-7 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-40"
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

          {/* Step Scrubber & Counter */}
          <div className="flex items-center gap-2 px-2 min-w-[140px] sm:min-w-[180px]">
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
              className="w-24 sm:w-28 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:opacity-40"
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
                    ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-bold shadow-2xs"
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
