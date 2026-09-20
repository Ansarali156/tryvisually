"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/core/sandbox/multi-compiler";
import { useTraceSession } from "@/core/trace/trace-session-context";
import { CallTreeCanvas } from "@/components/trace/call-tree-canvas";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Terminal,
  Trash2,
  AlertTriangle,
  Square,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Tv,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_STARTER_CODE = `# Write or paste code to trace
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total

values = [10, 20, 30, 40]
result = calculate_sum(values)
print("Total sum:", result)
`;

export default function TracePage() {
  const {
    code,
    setCode,
    language,
    setLanguage,
    isDirty,
    executionStatus,
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
  } = useTraceSession();

  // If user opens page and code is blank, load default starter code
  React.useEffect(() => {
    if (!code && typeof window !== "undefined") {
      const stored = localStorage.getItem("try-visually:trace-session:v1");
      if (!stored) {
        setCode(DEFAULT_STARTER_CODE);
      }
    }
  }, [code, setCode]);

  // Local UI States - Terminal view is the default view
  const [cursorPos, setCursorPos] = React.useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const [currentInputValue, setCurrentInputValue] = React.useState<string>("");
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [activeTabMode, setActiveTabMode] = React.useState<"canvas" | "terminal">("terminal");
  const [isDockCollapsed, setIsDockCollapsed] = React.useState<boolean>(false);
  const [breakpoints, setBreakpoints] = React.useState<Set<number>>(new Set());

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmLabel: "",
    onConfirm: () => {},
  });

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const inlineInputRef = React.useRef<HTMLInputElement>(null);
  const terminalBottomRef = React.useRef<HTMLDivElement>(null);

  const isRunning = executionStatus === "RUNNING";

  // Toggle breakpoint on line number
  const toggleBreakpoint = (lineNum: number) => {
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(lineNum)) next.delete(lineNum);
      else next.add(lineNum);
      return next;
    });
  };

  // Auto-focus input and switch to terminal when waiting for stdin
  React.useEffect(() => {
    if (needsInput) {
      setActiveTabMode("terminal");
      setTimeout(() => {
        inlineInputRef.current?.focus();
        terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [needsInput]);

  // Request user confirmation if dirty before clearing
  const handleClearRequest = () => {
    if (isDirty) {
      setConfirmModal({
        isOpen: true,
        title: "Clear Editor & Output?",
        description: "You have written code that will be permanently lost. Are you sure you want to clear the editor?",
        confirmLabel: "Clear Everything",
        onConfirm: () => {
          clearSession();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          if (textareaRef.current) textareaRef.current.focus();
        },
      });
    } else {
      clearSession();
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  // Submit dynamic input
  const handleInputSubmit = (val: string) => {
    if (!val.trim()) return;
    submitInput(val);
    setCurrentInputValue("");
  };

  // Active line marker in editor - only active during live execution
  const activeLineNumber = currentStep ? currentStep.line : null;

  // Split lines for line numbers
  const lines = code ? code.split("\n") : [];

  // Track cursor position (Ln, Col)
  const updateCursorPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, value } = textarea;
    const textBefore = value.substring(0, selectionStart);
    const lineNum = textBefore.split("\n").length;
    const colNum = selectionStart - textBefore.lastIndexOf("\n");
    setCursorPos({ line: lineNum, col: colNum });
  };

  // Auto-indentation & Smart Code Editing Keyboard Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;

    // 1. Run Keyboard Shortcuts: Ctrl+Enter (Run)
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      executeCode("visualise");
      return;
    }

    // 2. Tab Key -> 4-space Indent / Shift+Tab Unindent
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
        const lineEnd = value.indexOf("\n", selectionEnd);
        const effectiveEnd = lineEnd === -1 ? value.length : lineEnd;
        const selectedBlock = value.slice(lineStart, effectiveEnd);

        const unindented = selectedBlock
          .split("\n")
          .map((l) => (l.startsWith("    ") ? l.slice(4) : l.replace(/^ {1,3}/, "")))
          .join("\n");

        const diff = selectedBlock.length - unindented.length;
        const newCode = value.slice(0, lineStart) + unindented + value.slice(effectiveEnd);
        setCode(newCode);

        setTimeout(() => {
          textarea.selectionStart = Math.max(selectionStart - (selectedBlock.startsWith("    ") ? 4 : 0), lineStart);
          textarea.selectionEnd = Math.max(selectionEnd - diff, lineStart);
          updateCursorPosition();
        }, 0);
      } else {
        const newCode = value.substring(0, selectionStart) + "    " + value.substring(selectionEnd);
        setCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
          updateCursorPosition();
        }, 0);
      }
      return;
    }

    // 3. Enter Key -> Intelligent Auto-Indentation
    if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = value.substring(lineStart, selectionStart);
      const indentMatch = currentLine.match(/^\s*/);
      let indent = indentMatch ? indentMatch[0] : "";

      const trimmed = currentLine.trim();
      const isBlockOpener =
        trimmed.endsWith(":") ||
        trimmed.endsWith("{") ||
        trimmed.endsWith("(") ||
        trimmed.endsWith("[");

      const charBefore = value[selectionStart - 1];
      const charAfter = value[selectionStart];
      const isBetweenPair =
        (charBefore === "{" && charAfter === "}") ||
        (charBefore === "(" && charAfter === ")") ||
        (charBefore === "[" && charAfter === "]");

      if (isBetweenPair) {
        const extraIndent = indent + "    ";
        const insertion = `\n${extraIndent}\n${indent}`;
        const newCode = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
        setCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + extraIndent.length + 1;
          updateCursorPosition();
        }, 0);
        return;
      }

      if (isBlockOpener) {
        indent += "    ";
      }

      const insertion = "\n" + indent;
      const newCode = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + insertion.length;
        updateCursorPosition();
      }, 0);
      return;
    }

    // 4. Auto-closing pairs: (), [], {}, "", '', ``
    const PAIRS: Record<string, string> = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
      "`": "`",
    };
    const CLOSING_CHARS = new Set([")", "]", "}", '"', "'", "`"]);

    if (CLOSING_CHARS.has(e.key) && value[selectionStart] === e.key && selectionStart === selectionEnd) {
      e.preventDefault();
      textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      updateCursorPosition();
      return;
    }

    if (PAIRS[e.key] && selectionStart === selectionEnd) {
      e.preventDefault();
      const closing = PAIRS[e.key];
      const newCode = value.substring(0, selectionStart) + e.key + closing + value.substring(selectionEnd);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        updateCursorPosition();
      }, 0);
      return;
    }
  };

  // Active Array or Memory variables
  const activeArrayVar = React.useMemo(() => {
    if (!currentStep || !currentStep.variables) return null;
    for (const [key, val] of Object.entries(currentStep.variables)) {
      if (Array.isArray(val)) {
        return { name: key, values: val as (number | string)[] };
      }
    }
    return null;
  }, [currentStep]);

  // Active pointers
  const activePointers = React.useMemo(() => {
    if (!currentStep || !currentStep.variables) return {};
    const pointers: Record<number, string[]> = {};
    for (const [key, val] of Object.entries(currentStep.variables)) {
      if (
        typeof val === "number" &&
        (key === "mid" || key === "low" || key === "high" || key === "i" || key === "j")
      ) {
        if (!pointers[val]) pointers[val] = [];
        pointers[val].push(key);
      }
    }
    return pointers;
  }, [currentStep]);

  // Current execution frame variables for LOCALS & WATCH table
  const currentVariables = React.useMemo(() => {
    if (!currentStep?.variables || Object.keys(currentStep.variables).length === 0) {
      return [];
    }
    return Object.entries(currentStep.variables).map(([k, v]) => {
      let typeStr: string = typeof v;
      if (Array.isArray(v)) typeStr = "list";
      else if (v !== null && typeof v === "object") typeStr = "dict";
      else if (typeof v === "number") typeStr = Number.isInteger(v) ? "int" : "float";

      return {
        name: k,
        value: typeof v === "object" ? JSON.stringify(v) : String(v),
        type: typeStr,
        highlighted: false,
      };
    });
  }, [currentStep]);

  // Call stack items for CALL STACK (LIFO) panel
  const callStackItems = React.useMemo(() => {
    if (currentStep?.callStack && currentStep.callStack.length > 0) {
      return currentStep.callStack.map((name, idx) => ({
        name: name.replace("()", "") + ` (line ${currentStep.line})`,
        line: currentStep.line,
        active: idx === currentStep.callStack!.length - 1,
      }));
    }
    if (currentStep) {
      return [
        {
          name: (currentStep.func && currentStep.func !== "<module>" ? currentStep.func : "<module>") + ` (line ${currentStep.line})`,
          line: currentStep.line,
          active: true,
        },
      ];
    }
    return [];
  }, [currentStep]);

  // Frame function name
  const currentFrameName = React.useMemo(() => {
    if (!currentStep) return "IDLE";
    if (!currentStep.func || currentStep.func === "<module>") return "GLOBAL";
    return currentStep.func.toUpperCase();
  }, [currentStep]);

  return (
    <AppShell hideFooter>
      <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 select-none overflow-hidden transition-colors">
        
        {/* Main Split Grid (Left: Editor | Right: Canvas + Visualise Dock) */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 border-t border-slate-200 dark:border-slate-850">
          
          {/* ================================================================ */}
          {/* LEFT COLUMN: CODING SCREEN & WORKBENCH                           */}
          {/* ================================================================ */}
          <div className="w-full lg:w-1/2 flex flex-col h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#070b14] overflow-hidden">
            
            {/* Editor Sub-Header Toolbar */}
            <div className="shrink-0 px-3.5 py-2 bg-slate-100 dark:bg-[#0a0f1d] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto sm:overflow-visible">
              <div className="flex items-center gap-2 shrink-0">
                {/* Language Dropdown */}
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                  <span className="text-[11px] text-slate-500">Language:</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    aria-label="Language selection"
                    className="h-7 px-2.5 rounded-lg border border-slate-300 dark:border-slate-750 bg-white dark:bg-[#0e1626] text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-xs"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active File Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1626] text-xs font-mono font-medium text-cyan-700 dark:text-cyan-300 shrink-0 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span>{SUPPORTED_LANGUAGES.find((l) => l.id === language)?.filename || "main.py"}</span>
                </div>
              </div>

              {/* Action Buttons: Reset & RUN - shrink-0 ensures buttons are never cut off */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={resetExecution}
                  className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                  title="Reset execution to step 1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>

                {isRunning ? (
                  <button
                    onClick={cancelExecution}
                    className="h-7 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                    title="Stop running process"
                  >
                    <Square className="h-3 w-3 fill-current" />
                    <span>STOP</span>
                  </button>
                ) : (
                  <button
                    onClick={() => executeCode("visualise")}
                    className="h-7 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all active:scale-95 tracking-wide shrink-0"
                    title="Run code and trace execution (Ctrl+Enter)"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>RUN</span>
                  </button>
                )}

                <button
                  onClick={handleClearRequest}
                  className="h-7 w-7 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 flex items-center justify-center transition-colors shadow-xs shrink-0"
                  title="Clear editor"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Code Textarea with Breakpoint Dots & Current Execution Frame Pointer */}
            <div className="flex-1 relative flex overflow-hidden font-mono bg-white dark:bg-[#060913]">
              
              {/* Line Numbers Column with Breakpoint Dots */}
              <div className="w-12 bg-slate-50 dark:bg-[#070c18] border-r border-slate-200 dark:border-slate-800 py-3 text-right pr-2.5 text-slate-400 dark:text-slate-500 select-none overflow-hidden shrink-0 text-xs">
                {lines.map((_, i) => {
                  const lineNum = i + 1;
                  const isCurrent = lineNum === activeLineNumber;
                  const hasBreakpoint = breakpoints.has(lineNum);

                  return (
                    <div
                      key={i}
                      onClick={() => toggleBreakpoint(lineNum)}
                      className={cn(
                        "h-5 leading-5 flex items-center justify-end gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors",
                        isCurrent ? "text-cyan-600 dark:text-cyan-400 font-bold" : ""
                      )}
                      title={`Toggle breakpoint line ${lineNum}`}
                    >
                      {hasBreakpoint && (
                        <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                      )}
                      <span>{lineNum}</span>
                    </div>
                  );
                })}
              </div>

              {/* Editable Code Editor with Active Line Overlay */}
              <div className="flex-1 relative overflow-auto">
                {/* Glowing Highlight Bar for Active Execution Line */}
                {activeLineNumber && lines.length >= activeLineNumber && (
                  <div
                    className="absolute left-0 right-0 h-5 bg-cyan-500/10 dark:bg-cyan-500/15 border-l-2 border-cyan-500 dark:border-cyan-400 pointer-events-none z-10 flex items-center justify-end pr-4 transition-all duration-100"
                    style={{ top: `${(activeLineNumber - 1) * 20 + 12}px` }}
                  >
                    <span className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/90 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/60 text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs whitespace-nowrap">
                      <span>◀</span>
                      <span>
                        {currentStep?.func && currentStep.func !== "<module>"
                          ? `${currentStep.func}() • line ${activeLineNumber}`
                          : `line ${activeLineNumber}`}
                      </span>
                    </span>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    updateCursorPosition();
                  }}
                  onKeyDown={handleKeyDown}
                  onClick={updateCursorPosition}
                  onKeyUp={updateCursorPosition}
                  spellCheck={false}
                  className="w-full h-full p-3 font-mono text-xs text-slate-900 dark:text-slate-100 bg-transparent outline-none resize-none leading-5 whitespace-pre focus:ring-0 selection:bg-cyan-500/20"
                  placeholder="# Enter Python or algorithm code here..."
                />
              </div>
            </div>

            {/* Editor Footer Status Bar */}
            <div className="shrink-0 h-9 px-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090e1b] text-slate-500 dark:text-slate-400 text-[11px] font-mono flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Ready</span>
              </div>
              <span>
                Ln {cursorPos.line}, Col {cursorPos.col} • Spaces: 4 • UTF-8
              </span>
            </div>
          </div>

          {/* ================================================================ */}
          {/* RIGHT COLUMN: TERMINAL CONSOLE OR TRACING CANVAS                 */}
          {/* ================================================================ */}
          <div className="w-full lg:w-1/2 flex flex-col h-full bg-slate-50 dark:bg-[#050811] overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="shrink-0 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090d19] flex items-center justify-between gap-2 select-none">
              <div className="flex items-center gap-2">
                {activeTabMode === "canvas" ? (
                  <>
                    <Tv className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                      TRACING CANVAS
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-bold">
                      Call Tree Active
                    </span>
                  </>
                ) : (
                  <>
                    <Terminal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                      TERMINAL CONSOLE
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800 text-[10px] font-mono font-bold">
                      Interactive Stream
                    </span>
                  </>
                )}
              </div>

              {/* View toggle (Terminal View / Canvas View) & Zoom controls */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                <div className="flex items-center rounded-lg bg-slate-200/80 dark:bg-slate-800/80 p-0.5 border border-slate-300 dark:border-slate-700">
                  <button
                    onClick={() => setActiveTabMode("terminal")}
                    className={cn(
                      "px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer",
                      activeTabMode === "terminal"
                        ? "bg-white dark:bg-[#0f172a] text-emerald-600 dark:text-emerald-300 shadow-xs border border-emerald-500/40"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    Terminal View
                  </button>
                  <button
                    onClick={() => setActiveTabMode("canvas")}
                    className={cn(
                      "px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer",
                      activeTabMode === "canvas"
                        ? "bg-white dark:bg-[#0f172a] text-cyan-700 dark:text-cyan-300 shadow-xs border border-cyan-500/40"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    Canvas View
                  </button>
                </div>

                {activeTabMode === "canvas" && (
                  <div className="flex items-center gap-1 pl-1 border-l border-slate-300 dark:border-slate-800 animate-in fade-in">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                      className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Zoom out"
                    >
                      <ZoomOut className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-center">
                      {zoomLevel}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                      className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Zoom in"
                    >
                      <ZoomIn className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Upper / Main Content Area: Interactive Canvas OR Pure Terminal Console */}
            <div className="flex-1 relative min-h-0 overflow-hidden">
              {activeTabMode === "canvas" ? (
                <CallTreeCanvas
                  currentStep={currentStep}
                  activeArrayVar={activeArrayVar}
                  activePointers={activePointers}
                  zoomLevel={zoomLevel}
                />
              ) : (
                /* Pure Real-Time Interactive Terminal Console */
                <div
                  onClick={() => inlineInputRef.current?.focus()}
                  className="w-full h-full p-4 font-mono text-xs bg-slate-900 dark:bg-[#070b15] text-slate-100 overflow-y-auto leading-relaxed cursor-text select-text flex flex-col"
                >
                  {outputLogs.length === 0 && !executionError && !needsInput && (
                    <div className="text-slate-400 italic py-10 text-center select-none">
                      (No standard output recorded. Press RUN to execute.)
                    </div>
                  )}

                  {/* Preceding output lines */}
                  {(needsInput ? outputLogs.slice(0, -1) : outputLogs).map((l, i) => (
                    <div key={i} className="py-0.5 text-emerald-400 font-medium whitespace-pre-wrap break-all">
                      {l}
                    </div>
                  ))}

                  {/* Active Inline Real-Time Terminal Input Line */}
                  {needsInput && (
                    <div className="flex items-center flex-wrap py-0.5 leading-relaxed font-mono">
                      <span className="text-emerald-400 font-bold whitespace-pre">
                        {outputLogs.length > 0 ? outputLogs[outputLogs.length - 1] : inputPrompt || "❯ "}
                      </span>
                      <input
                        ref={inlineInputRef}
                        type="text"
                        value={currentInputValue}
                        onChange={(e) => setCurrentInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleInputSubmit(currentInputValue);
                          }
                        }}
                        autoFocus
                        spellCheck={false}
                        className="flex-1 min-w-[60px] bg-transparent text-cyan-300 font-mono text-xs outline-none border-none p-0 m-0 focus:ring-0 selection:bg-cyan-500/30 caret-cyan-400"
                      />
                    </div>
                  )}

                  {executionError && (
                    <div className="py-1 text-rose-400 font-bold whitespace-pre-wrap">
                      Error: {executionError}
                    </div>
                  )}

                  {/* Real-time process completion status */}
                  {!needsInput && hasExecuted && (
                    <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5 select-none font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>[Process completed {executionTime !== null ? `in ${executionTime}ms` : ""}]</span>
                    </div>
                  )}

                  <div ref={terminalBottomRef} />
                </div>
              )}
            </div>

            {/* Lower Section: VISUALISE OR TRACE Panel - Only appears on Canvas View, and is collapsable VisuAlgo-style */}
            {activeTabMode === "canvas" && (
              <div
                className={cn(
                  "flex flex-col shrink-0 bg-white dark:bg-[#060913] select-none border-t border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out",
                  isDockCollapsed ? "h-9" : "h-60 sm:h-64"
                )}
              >
                {/* Dock Header Toolbar */}
                <div className="shrink-0 h-9 px-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#080d1a] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <button
                      onClick={() => setIsDockCollapsed(!isDockCollapsed)}
                      className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                      title={isDockCollapsed ? "Expand panel" : "Collapse panel"}
                    >
                      {isDockCollapsed ? (
                        <ChevronUp className="h-3.5 w-3.5 text-cyan-500" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span className="uppercase tracking-wider">VISUALISE OR TRACE</span>
                    </button>
                    {traceSteps.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-mono font-bold border border-cyan-300 dark:border-cyan-800">
                        Step {currentStepIndex + 1}/{traceSteps.length}
                      </span>
                    )}
                  </div>

                  {/* Playback Controls & Speed Dropdown */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={stepPrev}
                        disabled={traceSteps.length === 0}
                        className="h-6 w-6 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                        title="Step previous"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={togglePlay}
                        disabled={traceSteps.length === 0}
                        className="h-6 px-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-1 shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                        title={isPlaying ? "Pause execution" : "Resume execution"}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-3 w-3 fill-current" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-current" />
                            <span>Play</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={stepNext}
                        disabled={traceSteps.length === 0}
                        className="h-6 w-6 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                        title="Step next"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Playback Speed */}
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      aria-label="Playback speed"
                      className="h-6 px-1.5 rounded bg-white dark:bg-[#0b101e] border border-slate-300 dark:border-slate-750 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-300 focus:outline-none cursor-pointer shadow-2xs"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1.0x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2.0x</option>
                    </select>

                    <button
                      onClick={() => setIsDockCollapsed(!isDockCollapsed)}
                      className="h-6 px-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 text-[11px] font-mono transition-colors ml-1 cursor-pointer"
                      title={isDockCollapsed ? "Expand panel" : "Collapse panel"}
                    >
                      <span>{isDockCollapsed ? "Expand" : "Hide"}</span>
                      {isDockCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Clean 2-Column Dock: [ CALL STACK (LIFO) | LOCALS & WATCH ] */}
                {!isDockCollapsed && (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 min-h-0 text-xs font-mono overflow-hidden">
                    {/* Column 1: CALL STACK (LIFO) */}
                    <div className="flex flex-col p-2.5 bg-white dark:bg-[#060a14] overflow-y-auto space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-850">
                        <span>CALL STACK (LIFO)</span>
                        <span className="text-cyan-600 dark:text-cyan-400">DEPTH: {callStackItems.length}</span>
                      </div>

                      <div className="space-y-1">
                        {callStackItems.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 dark:text-slate-500 italic text-[11px]">
                            {hasExecuted ? "Execution finished" : "No active execution frames"}
                          </div>
                        ) : (
                          callStackItems.map((item, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "px-2 py-1 rounded font-mono text-[11px] flex items-center justify-between transition-colors",
                                item.active
                                  ? "bg-cyan-50 dark:bg-[#0c1e33] border border-cyan-400 dark:border-cyan-500/60 text-cyan-900 dark:text-cyan-200 font-bold shadow-xs dark:shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                                  : "bg-slate-50 dark:bg-[#090e1a] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850"
                              )}
                            >
                              <span className="truncate">{item.name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                line {item.line}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Column 2: LOCALS & WATCH */}
                    <div className="flex flex-col p-2.5 bg-white dark:bg-[#060a14] overflow-y-auto space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-850">
                        <span>LOCALS &amp; WATCH</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">FRAME: {currentFrameName}</span>
                      </div>

                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="text-slate-400 dark:text-slate-500 text-[9px] uppercase border-b border-slate-200 dark:border-slate-850">
                            <th className="py-1">Variable</th>
                            <th className="py-1">Value</th>
                            <th className="py-1 text-right">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
                          {currentVariables.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-slate-400 dark:text-slate-500 italic text-[11px]">
                                {hasExecuted
                                  ? "No local variables initialized yet in current scope."
                                  : "Run code to trace and inspect variables."}
                              </td>
                            </tr>
                          ) : (
                            currentVariables.map((v, i) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                <td className="py-1 text-amber-700 dark:text-amber-300 font-semibold">{v.name}</td>
                                <td className={cn("py-1 truncate max-w-[140px]", v.highlighted ? "text-cyan-700 dark:text-cyan-300 font-bold" : "text-slate-800 dark:text-slate-300")}>
                                  {v.value}
                                </td>
                                <td className="py-1 text-right text-slate-400 dark:text-slate-500 text-[10px]">{v.type}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Unsaved Changes / Clear Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-mono">
          <div className="w-full max-w-md rounded-2xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-[#090e1c] p-5 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-800">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-sans">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="h-8 px-3.5 rounded-xl border border-slate-300 dark:border-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="h-8 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
