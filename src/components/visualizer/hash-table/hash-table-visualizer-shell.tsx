"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  CollisionStrategy,
  HashTableOperationType,
  HashTableState,
} from "@/core/hash-table/types";
import {
  DEFAULT_HASH_ENTRIES,
  DEFAULT_HASH_TABLE_CAPACITY,
  createHashTableState,
} from "@/core/hash-table/validation";
import { defaultHashTableAdapter } from "@/core/hash-table/hash-table-adapter";
import { getHashTableSourceCodes } from "@/core/hash-table/code-snippets";
import { generateHashTableTrace } from "@/core/hash-table/trace-generators";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";
import { HashTableRenderer } from "./hash-table-renderer";

export interface HashTableVisualizerShellProps {
  initialPairs?: readonly { key: string; value: string }[];
  initialStrategy?: CollisionStrategy;
  initialCapacity?: number;
  className?: string;
}

export function HashTableVisualizerShell({
  initialPairs = DEFAULT_HASH_ENTRIES,
  initialStrategy = "chaining",
  initialCapacity = DEFAULT_HASH_TABLE_CAPACITY,
  className,
}: HashTableVisualizerShellProps) {
  // 1. Domain Configuration States
  const [pairs, setPairs] = React.useState<readonly { key: string; value: string }[]>(initialPairs);
  const [strategy, setStrategy] = React.useState<CollisionStrategy>(initialStrategy);
  const [capacity, setCapacity] = React.useState<number>(initialCapacity);
  const [currentOperation, setCurrentOperation] = React.useState<HashTableOperationType>("insert");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  // Operation parameters for deterministic trace generation
  const [currentParams, setCurrentParams] = React.useState<Record<string, string | number>>({
    key: "Frank",
    value: "50",
  });

  // Input states
  const [insertKey, setInsertKey] = React.useState("Frank");
  const [insertVal, setInsertVal] = React.useState("50");
  const [searchKey, setSearchKey] = React.useState("Alice");
  const [deleteKey, setDeleteKey] = React.useState("Bob");

  // 2. Base Hash Table State
  const hashTableState: HashTableState = React.useMemo(() => {
    return createHashTableState(pairs, strategy, capacity);
  }, [pairs, strategy, capacity]);

  // 3. Deterministic Trace Generation based on Operation & Parameters
  const trace = React.useMemo(() => {
    return generateHashTableTrace(hashTableState, currentOperation, currentParams);
  }, [hashTableState, currentOperation, currentParams]);

  // 4. Authoritative Execution Engine
  const engine = useExecutionEngine<HashTableState>(trace, { initialSpeed: 1 });

  // 5. Visualization State Engine derivation
  const { visualizationState, resolvedHighlights } = useVisualizationState<HashTableState>({
    adapter: defaultHashTableAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 6. Multi-language source code snippets
  const sourceCodes = React.useMemo(() => {
    return getHashTableSourceCodes(currentOperation, strategy);
  }, [currentOperation, strategy]);

  // 7. Synchronized Execution View Context
  const executionView = useExecutionView<HashTableState>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  const executeOp = (op: HashTableOperationType, params: Record<string, string | number>) => {
    setCurrentOperation(op);
    setCurrentParams(params);
    engine.reset();
    setTimeout(() => engine.play(), 50);
  };

  const actions: VisuAlgoAction[] = [
    {
      id: "insert",
      label: "Insert",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Insert Key-Value</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Key"
              value={insertKey}
              onChange={(e) => setInsertKey(e.target.value)}
              className="w-20 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <input
              type="text"
              placeholder="Val"
              value={insertVal}
              onChange={(e) => setInsertVal(e.target.value)}
              className="w-16 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => {
                if (insertKey.trim()) {
                  executeOp("insert", { key: insertKey.trim(), value: insertVal || "1" });
                }
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
          <div className="pt-2 border-t border-border/50">
            <div className="text-[11px] text-muted-foreground mb-1">Presets:</div>
            <div className="flex flex-wrap gap-1">
              {[
                { k: "Grace", v: "70" },
                { k: "Henry", v: "85" },
                { k: "Ivy", v: "92" },
              ].map((p) => (
                <button
                  key={p.k}
                  onClick={() => {
                    setInsertKey(p.k);
                    setInsertVal(p.v);
                    executeOp("insert", { key: p.k, value: p.v });
                  }}
                  className="px-2 py-0.5 text-[11px] rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors font-mono"
                >
                  {p.k}:{p.v}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "search",
      label: "Search",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Search Key</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="e.g. Alice"
              className="w-24 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => {
                if (searchKey.trim()) {
                  executeOp("search", { key: searchKey.trim() });
                }
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
          <div className="pt-2 border-t border-border/50">
            <div className="text-[11px] text-muted-foreground mb-1">Existing Keys:</div>
            <div className="flex flex-wrap gap-1">
              {pairs.slice(0, 4).map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setSearchKey(p.key);
                    executeOp("search", { key: p.key });
                  }}
                  className="px-2 py-0.5 text-[11px] rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors font-mono"
                >
                  {p.key}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "delete",
      label: "Delete",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Delete Key</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={deleteKey}
              onChange={(e) => setDeleteKey(e.target.value)}
              className="w-24 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => {
                if (deleteKey.trim()) {
                  executeOp("delete", { key: deleteKey.trim() });
                }
              }}
              className="px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "reset",
      label: "Reset Sample",
      onClick: () => {
        setPairs(DEFAULT_HASH_ENTRIES);
        setCurrentParams({ key: "Frank", value: "50" });
        engine.reset();
      },
    },
  ];

  return (
    <VisuAlgoShell
      title="Hash Table Visualizer"
      category="Data Structures"
      subVariants={[
        { id: "chaining", label: "Separate Chaining", active: strategy === "chaining" },
        { id: "linear-probing", label: "Linear Probing", active: strategy === "linear-probing" },
      ]}
      activeSubVariant={strategy}
      onSelectSubVariant={(id) => {
        setStrategy(id as CollisionStrategy);
        engine.reset();
      }}
      actions={actions}
      statusBadge={
        engine.isPlaying
          ? "Running"
          : currentOperation.toUpperCase()
      }
      statusExplanation={
        executionView.explanation ||
        "Select Insert, Search, or Delete from the bottom-left dock."
      }
      complexityBadge={
        strategy === "chaining" ? "Avg: O(1) / Worst: O(n)" : "Avg: O(1) / Cluster: O(n)"
      }
      code={executionView.sourceCode}
      activeCodeLines={executionView.activeCodeLines}
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
      className={className}
    >
      {/* Full-stage Interactive Stage */}
      <div className="w-full h-full flex flex-col items-center justify-center p-6 select-none overflow-x-auto">
        <HashTableRenderer
          visualizationState={visualizationState}
          resolvedHighlights={resolvedHighlights}
          speed={engine.speed}
        />
      </div>
    </VisuAlgoShell>
  );
}
