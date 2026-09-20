import { describe, it, expect } from "vitest";
import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import { ExecutionController } from "@/core/execution/controller/execution-controller";
import { computeVariableDiffs } from "../utils/variable-diff";
import { resolveActiveLines } from "../utils/code-mapping";
import type { UnifiedExecutionViewContext } from "../types";

describe("CRITICAL INTEGRATION TEST — Synchronization Invariant (Prompt 5, Section 31)", () => {
  interface TestState {
    i: number;
  }

  // 1. Build test trace exactly as specified in Section 31
  const builder = createExecutionTrace<TestState>({
    initialState: { i: 0 },
    metadata: { algorithmName: "Synchronization Invariant Test" },
  });

  builder.addStep({
    codeLine: 1,
    variables: { i: 0 },
    operation: "custom",
    explanation: "Initial state",
    highlightedElements: ["elem-0"],
    state: { i: 0 },
  });

  builder.addStep({
    codeLine: 4,
    variables: { i: 1 },
    operation: "compare",
    explanation: "Compare the current elements.",
    highlightedElements: ["elem-1"],
    state: { i: 1 },
  });

  builder.addStep({
    codeLine: 7,
    variables: { i: 2 },
    operation: "swap",
    explanation: "Swap the selected elements.",
    highlightedElements: ["elem-1", "elem-2"],
    state: { i: 2 },
  });

  builder.addStep({
    codeLine: 10,
    variables: { i: 3 },
    operation: "found",
    explanation: "The target has been found.",
    highlightedElements: ["elem-3"],
    state: { i: 3 },
  });

  const trace = builder.build();

  // Helper to derive synchronized context for any controller step
  function getSynchronizedContext(
    controller: ExecutionController<TestState>
  ): UnifiedExecutionViewContext<TestState> {
    const runtime = controller.getRuntimeState();
    const step = runtime.currentStep;
    const prevStep = runtime.currentStepIndex > 0 ? trace.steps[runtime.currentStepIndex - 1] : null;

    const variables = step ? step.variables : {};
    const variableDiffs = computeVariableDiffs(prevStep?.variables, variables);
    const activeCodeLines = resolveActiveLines(step, "python");

    return {
      step,
      stepIndex: runtime.currentStepIndex,
      totalSteps: runtime.totalSteps,
      state: runtime.currentState,
      variables,
      variableDiffs,
      activeCodeLines,
      primaryCodeLine: activeCodeLines[0],
      explanation: step?.explanation ?? "",
      operation: step?.operation,
      highlightedElements: step?.highlightedElements ?? [],
      progress: runtime.progress,
      status: runtime.status,
      language: "python",
    };
  }

  it("verifies Step 0 -> 1 -> 2 -> 1 -> jumpTo(3) -> reset() invariant across all views", () => {
    const controller = new ExecutionController<TestState>(trace);

    // Initial state: Step 0
    let ctx = getSynchronizedContext(controller);
    expect(ctx.stepIndex).toBe(0);
    expect(ctx.primaryCodeLine).toBe(1);
    expect(ctx.variables).toEqual({ i: 0 });
    expect(ctx.operation).toBe("custom");
    expect(ctx.explanation).toBe("Initial state");
    expect(ctx.highlightedElements).toEqual(["elem-0"]);

    // Transition 1: Step 0 -> Step 1
    controller.next();
    ctx = getSynchronizedContext(controller);
    expect(ctx.stepIndex).toBe(1);
    expect(ctx.primaryCodeLine).toBe(4);
    expect(ctx.variables).toEqual({ i: 1 });
    expect(ctx.variableDiffs.i.hasChanged).toBe(true);
    expect(ctx.variableDiffs.i.previousValue).toBe(0);
    expect(ctx.variableDiffs.i.currentValue).toBe(1);
    expect(ctx.operation).toBe("compare");
    expect(ctx.explanation).toBe("Compare the current elements.");
    expect(ctx.highlightedElements).toEqual(["elem-1"]);

    // Transition 2: Step 1 -> Step 2
    controller.next();
    ctx = getSynchronizedContext(controller);
    expect(ctx.stepIndex).toBe(2);
    expect(ctx.primaryCodeLine).toBe(7);
    expect(ctx.variables).toEqual({ i: 2 });
    expect(ctx.variableDiffs.i.previousValue).toBe(1);
    expect(ctx.variableDiffs.i.currentValue).toBe(2);
    expect(ctx.operation).toBe("swap");
    expect(ctx.explanation).toBe("Swap the selected elements.");
    expect(ctx.highlightedElements).toEqual(["elem-1", "elem-2"]);

    // Transition 3: Step 2 -> Step 1 (Backward Navigation)
    controller.previous();
    ctx = getSynchronizedContext(controller);
    expect(ctx.stepIndex).toBe(1);
    expect(ctx.primaryCodeLine).toBe(4);
    expect(ctx.variables).toEqual({ i: 1 });
    expect(ctx.operation).toBe("compare");
    expect(ctx.explanation).toBe("Compare the current elements.");
    expect(ctx.highlightedElements).toEqual(["elem-1"]);

    // Transition 4: jumpTo(3) (Direct Jump)
    controller.jumpTo(3);
    ctx = getSynchronizedContext(controller);
    expect(ctx.stepIndex).toBe(3);
    expect(ctx.primaryCodeLine).toBe(10);
    expect(ctx.variables).toEqual({ i: 3 });
    expect(ctx.operation).toBe("found");
    expect(ctx.explanation).toBe("The target has been found.");
    expect(ctx.highlightedElements).toEqual(["elem-3"]);

    // Transition 5: reset() (Return to Initial)
    controller.reset();
    ctx = getSynchronizedContext(controller);
    expect(ctx.stepIndex).toBe(0);
    expect(ctx.primaryCodeLine).toBe(1);
    expect(ctx.variables).toEqual({ i: 0 });
    expect(ctx.operation).toBe("custom");
    expect(ctx.explanation).toBe("Initial state");
    expect(ctx.highlightedElements).toEqual(["elem-0"]);
  });
});
