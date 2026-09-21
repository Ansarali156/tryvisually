"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { RecursionExecutionState } from "@/core/recursion/types";
import {
  generateFactorialTrace,
  generateFibonacciTrace,
  generateHanoiTrace,
} from "@/core/recursion/trace-generators";
import { RECURSION_SNIPPETS } from "@/core/recursion/code-snippets";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";
import { CheckCircle2, ArrowDown, Sparkles } from "lucide-react";

type RecursionAlgorithm = "factorial" | "fibonacci" | "hanoi";

export function RecursionVisualizerShell() {
  const [algorithm, setAlgorithm] = React.useState<RecursionAlgorithm>("factorial");
  const [inputValue, setInputValue] = React.useState<number>(4);
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  const createTrace = React.useCallback((algo: RecursionAlgorithm, val: number) => {
    switch (algo) {
      case "factorial":
        return generateFactorialTrace(val);
      case "fibonacci":
        return generateFibonacciTrace(val);
      case "hanoi":
        return generateHanoiTrace(val);
    }
  }, []);

  const [trace, setTrace] = React.useState(() => createTrace(algorithm, inputValue));

  const handleRun = React.useCallback(
    (algo: RecursionAlgorithm = algorithm, val: number = inputValue) => {
      setTrace(createTrace(algo, val));
    },
    [algorithm, inputValue, createTrace]
  );

  const engine = useExecutionEngine<RecursionExecutionState>(trace, { initialSpeed: 1 });
  const currentStep = engine.currentStep;
  const runtimeState = currentStep?.state;

  const rawCode =
    RECURSION_SNIPPETS[algorithm]?.[activeLanguage] ??
    RECURSION_SNIPPETS.factorial.python;

  const activeLine = currentStep?.codeLine ?? 1;

  const actions: VisuAlgoAction[] = [
    {
      id: "set-n",
      label: "Parameter (n)",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Select Argument (n)</div>
          <div className="flex gap-1.5">
            {[2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setInputValue(val);
                  handleRun(algorithm, val);
                  setTimeout(() => engine.play(), 50);
                }}
                className={cn(
                  "px-3 py-1 text-xs font-mono font-bold rounded transition-colors",
                  inputValue === val
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-primary/20 text-foreground"
                )}
              >
                n={val}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "run",
      label: "Run Recursion",
      onClick: () => {
        handleRun(algorithm, inputValue);
        setTimeout(() => engine.play(), 50);
      },
    },
  ];

  return (
    <VisuAlgoShell
      title="Recursion & Call Stack"
      category="Algorithms"
      subVariants={[
        { id: "factorial", label: "Factorial (Linear)", active: algorithm === "factorial" },
        { id: "fibonacci", label: "Fibonacci (Tree)", active: algorithm === "fibonacci" },
        { id: "hanoi", label: "Tower of Hanoi", active: algorithm === "hanoi" },
      ]}
      activeSubVariant={algorithm}
      onSelectSubVariant={(id) => {
        const nextAlgo = id as RecursionAlgorithm;
        setAlgorithm(nextAlgo);
        const defaultN = nextAlgo === "hanoi" ? 3 : 4;
        setInputValue(defaultN);
        setTrace(createTrace(nextAlgo, defaultN));
        engine.reset();
      }}
      actions={actions}
      statusBadge={
        engine.isPlaying
          ? "Unwinding"
          : runtimeState?.finalResult !== null && runtimeState?.finalResult !== undefined
          ? "Completed"
          : "Ready"
      }
      statusExplanation={
        currentStep?.explanation ||
        runtimeState?.phaseDescription ||
        "Observe activation records push onto and pop off the call stack."
      }
      complexityBadge={
        algorithm === "factorial"
          ? "O(n)"
          : algorithm === "fibonacci"
          ? "O(2ⁿ)"
          : "O(2ⁿ)"
      }
      code={rawCode}
      activeCodeLines={[activeLine]}
      currentStep={engine.currentStepIndex}
      totalSteps={engine.totalSteps}
      isPlaying={engine.isPlaying}
      speed={engine.speed}
      onPlay={engine.play}
      onPause={engine.pause}
      onStepForward={engine.next}
      onStepBackward={engine.previous}
      onGoToStart={engine.jumpToStart}
      onGoToEnd={engine.jumpToEnd}
      onSeek={engine.jumpTo}
      onSpeedChange={(spd) => engine.setSpeed(spd)}
    >
      {/* Full-stage Interactive Stage: Visual Call Stack */}
      <div className="w-full h-full flex flex-col justify-end items-center p-8 select-none relative overflow-y-auto">
        {/* Call Stack Stats Overlay at Top */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 bg-card/80 backdrop-blur-md border border-border px-4 py-1.5 rounded-full shadow-sm text-xs">
          <div>
            Total Calls: <span className="font-mono font-bold text-foreground">{runtimeState?.totalCalls ?? 0}</span>
          </div>
          <div className="text-border">|</div>
          <div>
            Max Depth: <span className="font-mono font-bold text-foreground">{runtimeState?.maxDepth ?? 0}</span>
          </div>
          {runtimeState?.finalResult !== null && runtimeState?.finalResult !== undefined && (
            <>
              <div className="text-border">|</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Result: {runtimeState.finalResult}
              </div>
            </>
          )}
        </div>

        {/* Stack Activation Frames (Rendered Bottom to Top) */}
        <div className="w-full max-w-md flex flex-col-reverse gap-2.5 items-center pb-4">
          {runtimeState?.callStack.map((frame, idx) => {
            const isTop = idx === (runtimeState?.callStack.length ?? 0) - 1;

            return (
              <div
                key={frame.id}
                className={cn(
                  "w-full rounded-xl p-3.5 border-2 transition-all duration-200 shadow-md flex items-center justify-between",
                  isTop
                    ? "bg-primary/10 border-primary shadow-primary/20 scale-102 ring-2 ring-primary/30"
                    : "bg-card border-border/80 text-card-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold",
                      isTop
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {idx}
                  </span>
                  <div>
                    <div className="font-mono font-bold text-sm text-foreground">
                      {frame.functionName}({Object.values(frame.args || {}).join(", ")})
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Depth: {frame.depth}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {frame.returnValue !== null && frame.returnValue !== undefined ? (
                    <span className="font-mono font-bold text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                      return {frame.returnValue}
                    </span>
                  ) : isTop ? (
                    <span className="text-[11px] font-semibold text-primary animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Active Frame
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Waiting...</span>
                  )}
                </div>
              </div>
            );
          })}

          {(!runtimeState?.callStack || runtimeState.callStack.length === 0) && (
            <div className="text-sm text-muted-foreground font-mono italic">
              Stack is empty. Click Run to begin recursion.
            </div>
          )}
        </div>

        {/* Stack Base Indicator */}
        <div className="w-full max-w-md border-t-2 border-dashed border-border/80 pt-2 text-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
          ── Stack Bottom (Execution Frame Origin) ──
        </div>
      </div>
    </VisuAlgoShell>
  );
}
