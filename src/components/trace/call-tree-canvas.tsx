"use client";

import * as React from "react";
import { type TraceStep } from "@/core/sandbox/python-tracer";
import { cn } from "@/lib/utils";
import { Layers, Variable, ArrowRight, CheckCircle, Code } from "lucide-react";

interface CallTreeCanvasProps {
  currentStep: TraceStep | null;
  activeArrayVar: { name: string; values: (number | string)[] } | null;
  activePointers: Record<number, string[]>;
  zoomLevel: number;
}

export function CallTreeCanvas({
  currentStep,
  activeArrayVar,
  activePointers,
  zoomLevel,
}: CallTreeCanvasProps) {
  // Extract function call or recursion context from currentStep
  const callStack = currentStep?.callStack || [];
  const funcName = currentStep?.func && currentStep.func !== "<module>" ? currentStep.func : "global";
  const currentDepth = callStack.length > 0 ? callStack.length : (currentStep ? 1 : 0);

  // Extract variables
  const variables = currentStep?.variables || {};
  const varEntries = Object.entries(variables);
  const memoObj = variables["memo"] as Record<string, unknown> | undefined;
  const memoHits = memoObj ? Object.keys(memoObj).length : null;

  // Real call stack labels
  const activeFrameLabel = callStack.length > 0 ? callStack[callStack.length - 1] : `${funcName}()`;
  const parentFrameLabel = callStack.length > 1 ? callStack[callStack.length - 2] : null;

  const isMultiFrame = callStack.length > 1;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#070b15] select-none">
      {/* Zoom transform container */}
      <div
        className="w-full h-full flex flex-col items-center justify-center p-4 transition-transform duration-150"
        style={{ transform: `scale(${zoomLevel / 100})` }}
      >
        {!currentStep ? (
          /* ============================================================== */
          /* IDLE / READY STATE                                             */
          /* ============================================================== */
          <div className="text-center space-y-3 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0a0f1d]/80 backdrop-blur-xs shadow-sm max-w-md">
            <div className="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto border border-cyan-200 dark:border-cyan-800">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                Trace Canvas Ready
              </div>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Click the green <strong className="font-mono text-emerald-600 dark:text-emerald-400">RUN</strong> button to trace execution step-by-step, inspect call stacks, and visualize memory state.
              </p>
            </div>
          </div>
        ) : activeArrayVar ? (
          /* ============================================================== */
          /* ARRAY / MEMORY OBJECT BLUEPRINT VIEW                           */
          /* ============================================================== */
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>Memory Array: {activeArrayVar.name}</span>
            </div>
            <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-3 py-2">
              {activeArrayVar.values.map((val, idx) => {
                const pointers = activePointers[idx] || [];
                const isTarget = pointers.length > 0;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    {isTarget ? (
                      <div className="flex items-center gap-0.5 mb-1.5 animate-bounce">
                        {pointers.map((p) => (
                          <span
                            key={p}
                            className={cn(
                              "text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-sm",
                              p === "mid"
                                ? "bg-amber-500 text-white"
                                : p === "low"
                                ? "bg-cyan-500 text-white"
                                : p === "high"
                                ? "bg-rose-500 text-white"
                                : "bg-emerald-500 text-white"
                            )}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="h-5" />
                    )}

                    <div
                      className={cn(
                        "h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2 font-mono font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-md",
                        isTarget
                          ? "border-cyan-500 dark:border-cyan-400 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-950 dark:text-cyan-200 ring-2 ring-cyan-500/30 scale-105"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200"
                      )}
                    >
                      {String(val)}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 mt-1.5">
                      [{idx}]
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : isMultiFrame ? (
          /* ============================================================== */
          /* CALL STACK / RECURSION HIERARCHY VIEW                          */
          /* ============================================================== */
          <div className="flex flex-col items-center gap-4 relative">
            {parentFrameLabel && (
              <div className="flex flex-col items-center">
                <div className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-750 bg-white dark:bg-[#0c192c] text-slate-700 dark:text-slate-300 text-xs font-mono font-medium flex items-center gap-2 shadow-xs">
                  <span>{parentFrameLabel}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                    caller
                  </span>
                </div>
                <div className="w-0.5 h-6 bg-cyan-500/50" />
              </div>
            )}

            {/* Active Evaluating Frame */}
            <div className="flex flex-col items-center">
              <div className="px-5 py-2.5 rounded-xl border-2 border-cyan-500 dark:border-cyan-400 bg-cyan-50 dark:bg-[#0e223d] text-cyan-950 dark:text-cyan-100 text-sm font-mono font-bold flex items-center gap-2.5 shadow-md dark:shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-2 ring-cyan-500/20">
                <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
                <span>{activeFrameLabel}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950/90 text-cyan-800 dark:text-cyan-300 font-mono font-bold border border-cyan-300 dark:border-cyan-500/50 uppercase tracking-wider">
                  evaluating
                </span>
              </div>
            </div>

            {/* Live variables in active frame */}
            {varEntries.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md pt-2">
                {varEntries.slice(0, 6).map(([k, v]) => (
                  <div
                    key={k}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a101f] text-[11px] font-mono shadow-xs flex items-center gap-1.5"
                  >
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">{k}:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[100px]">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* GENERAL EXECUTION FRAME BLUEPRINT                              */
          /* ============================================================== */
          <div className="flex flex-col items-center gap-4 max-w-lg w-full px-4">
            <div className="w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#090e1c]/80 backdrop-blur-xs shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Scope: {funcName}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-mono font-bold border border-cyan-300 dark:border-cyan-800">
                  Line {currentStep.line}
                </span>
              </div>

              {/* Variables in scope */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Variable className="h-3 w-3 text-cyan-500" />
                  <span>Variables in Scope ({varEntries.length})</span>
                </div>

                {varEntries.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 dark:text-slate-500 text-xs italic font-mono">
                    No variables initialized at this step
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {varEntries.map(([k, v]) => (
                      <div
                        key={k}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1527] flex flex-col"
                      >
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold truncate">
                          {k}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                          {typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Scope Badge - Cleanly anchored in top-left to avoid colliding with cards or bottom buttons */}
      {currentStep && (
        <div className="absolute top-3 left-3 px-3 py-1 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-[#080d1a]/90 backdrop-blur-xs text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2.5 shadow-2xs select-none pointer-events-none z-10 animate-in fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse shrink-0" />
          <span>
            Scope: <strong className="text-cyan-700 dark:text-cyan-300 font-bold">{funcName}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>
            Line: <strong className="text-slate-800 dark:text-slate-200 font-bold">{currentStep.line}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>
            Depth: <strong className="text-slate-800 dark:text-slate-200 font-bold">{currentDepth}</strong>
          </span>
          {memoHits !== null && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>
                Memo: <strong className="text-amber-600 dark:text-amber-400 font-bold">{memoHits}</strong>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
