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
import { TopicBar } from "@/components/visualizer/topic-bar";
import { TimelineControls } from "@/components/ui/timeline-controls";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { Button } from "@/components/ui/button";
import type { PlaybackSpeed } from "@/core/engine/types";
import { Layers, Play, CheckCircle2 } from "lucide-react";

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

  const handleRun = React.useCallback(() => {
    setTrace(createTrace(algorithm, inputValue));
  }, [algorithm, inputValue, createTrace]);

  const engine = useExecutionEngine<RecursionExecutionState>(trace, { initialSpeed: 1 });
  const currentStep = engine.currentStep;
  const runtimeState = currentStep?.state;

  // Code synchronization
  const rawCode =
    RECURSION_SNIPPETS[algorithm]?.[activeLanguage] ??
    RECURSION_SNIPPETS.factorial.python;

  const activeLine = currentStep?.codeLine ?? 1;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopicBar />

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-[1700px] w-full mx-auto gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              Recursion & Call Stack Visualizer
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Visualize LIFO call stack activation records, stack frames, unwinding, and return values.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={algorithm === "factorial" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setAlgorithm("factorial");
                setInputValue(4);
                setTrace(generateFactorialTrace(4));
              }}
            >
              Factorial (Linear Stack)
            </Button>
            <Button
              variant={algorithm === "fibonacci" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setAlgorithm("fibonacci");
                setInputValue(4);
                setTrace(generateFibonacciTrace(4));
              }}
            >
              Fibonacci (Tree Stack)
            </Button>
            <Button
              variant={algorithm === "hanoi" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setAlgorithm("hanoi");
                setInputValue(3);
                setTrace(generateHanoiTrace(3));
              }}
            >
              Tower of Hanoi
            </Button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">Parameter (n):</span>
            <div className="flex items-center gap-1">
              {[2, 3, 4, 5].map((val) => (
                <Button
                  key={val}
                  size="sm"
                  variant={inputValue === val ? "secondary" : "ghost"}
                  className="h-7 w-7 p-0 text-xs"
                  onClick={() => {
                    setInputValue(val);
                    setTrace(createTrace(algorithm, val));
                  }}
                >
                  {val}
                </Button>
              ))}
            </div>

            <Button size="sm" onClick={handleRun} className="h-8 gap-1.5 ml-2">
              <Play className="w-3.5 h-3.5" />
              Run Recursion
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <div>
              Total Calls: <span className="font-mono text-foreground font-semibold">{runtimeState?.totalCalls ?? 0}</span>
            </div>
            <div>
              Max Depth: <span className="font-mono text-foreground font-semibold">{runtimeState?.maxDepth ?? 0}</span>
            </div>
            {runtimeState?.finalResult !== null && runtimeState?.finalResult !== undefined && (
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Result: {runtimeState.finalResult}
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Visual Call Stack View */}
          <div className="lg:col-span-8 flex flex-col gap-3 min-h-[520px]">
            <div className="flex-1 relative rounded-xl border border-border bg-card p-6 flex flex-col justify-end items-center min-h-[460px] overflow-hidden">
              <div className="absolute top-4 left-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="w-4 h-4" />
                System Call Stack (LIFO)
              </div>

              {/* Stack Frame Container */}
              <div className="w-full max-w-md flex flex-col-reverse gap-2.5 pb-2">
                {runtimeState?.callStack.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-sm italic">
                    Call stack is empty (Execution finished or idle)
                  </div>
                ) : (
                  runtimeState?.callStack.map((frame) => {
                    const isActive = frame.id === runtimeState.activeFrameId;
                    return (
                      <div
                        key={frame.id}
                        className={cn(
                          "rounded-lg p-3 border-2 transition-all duration-300 flex items-center justify-between shadow-sm",
                          isActive
                            ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 scale-[1.02]"
                            : "border-border bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                            depth {frame.depth}
                          </span>
                          <div>
                            <span className="font-mono font-bold text-sm text-foreground">
                              {frame.functionName}({Object.entries(frame.args).map(([k, v]) => `${k}=${v}`).join(", ")})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {frame.status === "calling" && (
                            <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[11px] font-semibold px-2 py-0.5 rounded border border-sky-500/30">
                              Calling
                            </span>
                          )}
                          {frame.status === "waiting" && (
                            <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                              Waiting
                            </span>
                          )}
                          {frame.status === "returning" && (
                            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                              Returns: {frame.returnValue}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Memory Base */}
              <div className="w-full max-w-md h-2 bg-muted rounded-full mt-2 border border-border" />
              <span className="text-[10px] text-muted-foreground mt-1">Stack Base (Memory Offset 0x0)</span>
            </div>

            {/* Timeline Controls */}
            <TimelineControls
              isPlaying={engine.isPlaying}
              currentStep={engine.currentStepIndex}
              totalSteps={engine.totalSteps}
              speed={engine.speed as PlaybackSpeed}
              onPlay={engine.play}
              onPause={engine.pause}
              onStepForward={engine.next}
              onStepBackward={engine.previous}
              onGoToStart={engine.jumpToStart}
              onGoToEnd={engine.jumpToEnd}
              onSeek={engine.jumpTo}
              onSpeedChange={(spd: PlaybackSpeed) => engine.setSpeed(spd)}
            />
          </div>

          {/* Right Side: Code & Variables */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-[300px]">
              <CodeViewer
                rawCode={rawCode}
                language={activeLanguage}
                onLanguageChange={setActiveLanguage}
                activeLines={[activeLine]}
                primaryLine={activeLine}
              />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <VariablesPanel variables={currentStep?.variables ?? {}} />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <ExplanationPanel
                title="Recursion Step"
                explanation={currentStep?.explanation ?? "Click Run to trace recursive calls."}
                stepIndex={engine.currentStepIndex}
                totalSteps={engine.totalSteps}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
