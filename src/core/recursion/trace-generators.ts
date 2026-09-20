/**
 * Trace Generators for Recursion Visualizer
 *
 * Implements deterministic traces for:
 * 1. Factorial: n! call stack accumulation & unwinding
 * 2. Fibonacci: Branching recursive call tree and return synthesis
 * 3. Tower of Hanoi: 3-peg disk transfer recursion
 */

import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type { ExecutionTrace } from "@/core/execution/types";
import type { RecursionExecutionState, StackFrame, RecursionTreeNode } from "./types";

/**
 * 1. Factorial Recursion Trace Generator
 */
export function generateFactorialTrace(
  n: number
): ExecutionTrace<RecursionExecutionState> {
  const targetN = Math.max(0, Math.min(n, 7)); // bounded between 0 and 7 for visual clarity

  const initialState: RecursionExecutionState = {
    functionName: "factorial",
    callStack: [],
    activeFrameId: null,
    callTree: [],
    totalCalls: 0,
    maxDepth: 0,
    finalResult: null,
    phaseDescription: `Ready to compute factorial(${targetN}) via recursion.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "factorial",
      algorithmName: "Factorial Recursion",
      category: "Recursion",
    },
  });

  let callCount = 0;
  let maxDepth = 0;
  const treeNodes: RecursionTreeNode[] = [];
  const currentStack: StackFrame[] = [];

  function computeFactorial(val: number, parentId: string | null): number {
    callCount++;
    const frameId = `frame-${callCount}`;
    const depth = currentStack.length + 1;
    if (depth > maxDepth) maxDepth = depth;

    const newFrame: StackFrame = {
      id: frameId,
      functionName: "factorial",
      args: { n: val },
      status: "calling",
      depth,
      parentId,
    };
    currentStack.push(newFrame);

    const treeNode: RecursionTreeNode = {
      id: frameId,
      label: `factorial(${val})`,
      depth,
      status: "active",
      children: [],
    };
    treeNodes.push(treeNode);

    builder.addStep({
      operation: "call",
      codeLine: 1,
      variables: { n: val, stackDepth: depth, totalCalls: callCount },
      state: {
        functionName: "factorial",
        callStack: [...currentStack],
        activeFrameId: frameId,
        callTree: [...treeNodes],
        totalCalls: callCount,
        maxDepth,
        finalResult: null,
        phaseDescription: `Call factorial(${val}). Pushed new frame to call stack (depth ${depth}).`,
      },
      highlightedElements: [frameId],
      explanation: `Calling factorial(${val}). Stack frame allocated in memory.`,
    });

    if (val <= 1) {
      builder.addStep({
        operation: "select",
        codeLine: 3,
        variables: { n: val, isBaseCase: true, returns: 1 },
        state: {
          functionName: "factorial",
          callStack: currentStack.map((f) =>
            f.id === frameId ? { ...f, status: "returning" as const, returnValue: 1 } : f
          ),
          activeFrameId: frameId,
          callTree: [...treeNodes],
          totalCalls: callCount,
          maxDepth,
          finalResult: null,
          phaseDescription: `Base case reached for factorial(${val})! Returning 1.`,
        },
        highlightedElements: [frameId],
        explanation: `Base case satisfied (n <= 1). Returning 1 immediately without further calls.`,
      });

      currentStack.pop();
      return 1;
    }

    // Recursive call step
    builder.addStep({
      operation: "call",
      codeLine: 5,
      variables: { n: val, recursiveCall: `factorial(${val - 1})` },
      state: {
        functionName: "factorial",
        callStack: currentStack.map((f) =>
          f.id === frameId ? { ...f, status: "waiting" as const } : f
        ),
        activeFrameId: frameId,
        callTree: [...treeNodes],
        totalCalls: callCount,
        maxDepth,
        finalResult: null,
        phaseDescription: `factorial(${val}) paused, awaiting result from factorial(${val - 1}).`,
      },
      highlightedElements: [frameId],
      explanation: `Calling recursive child factorial(${val - 1}). Current frame waits on stack.`,
    });

    const subResult = computeFactorial(val - 1, frameId);
    const result = val * subResult;

    builder.addStep({
      operation: "insert",
      codeLine: 5,
      variables: {
        n: val,
        subResult,
        calculation: `${val} * ${subResult} = ${result}`,
      },
      state: {
        functionName: "factorial",
        callStack: currentStack.map((f) =>
          f.id === frameId ? { ...f, status: "returning" as const, returnValue: result } : f
        ),
        activeFrameId: frameId,
        callTree: [...treeNodes],
        totalCalls: callCount,
        maxDepth,
        finalResult: currentStack.length === 1 ? result : null,
        phaseDescription: `Unwinding: factorial(${val}) = ${val} * ${subResult} = ${result}. Popping frame.`,
      },
      highlightedElements: [frameId],
      explanation: `Calculated ${val} * factorial(${val - 1}) = ${result}. Frame pops from stack.`,
    });

    currentStack.pop();
    return result;
  }

  const finalRes = computeFactorial(targetN, null);

  builder.addStep({
    operation: "call",
    codeLine: 5,
    variables: { result: finalRes, totalCalls: callCount, maxDepth },
    state: {
      functionName: "factorial",
      callStack: [],
      activeFrameId: null,
      callTree: [...treeNodes],
      totalCalls: callCount,
      maxDepth,
      finalResult: finalRes,
      phaseDescription: `Recursion complete! factorial(${targetN}) = ${finalRes}. All frames popped.`,
    },
    highlightedElements: [],
    explanation: `All recursion frames cleanly unwound. Final answer is ${finalRes}.`,
  });

  return builder.build();
}

/**
 * 2. Fibonacci Recursion Trace Generator
 */
export function generateFibonacciTrace(
  n: number
): ExecutionTrace<RecursionExecutionState> {
  const targetN = Math.max(0, Math.min(n, 5)); // bounded to 5 for manageable visual tree

  const initialState: RecursionExecutionState = {
    functionName: "fibonacci",
    callStack: [],
    activeFrameId: null,
    callTree: [],
    totalCalls: 0,
    maxDepth: 0,
    finalResult: null,
    phaseDescription: `Ready to compute fibonacci(${targetN}) via branching recursion.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "fibonacci-recursion",
      algorithmName: "Fibonacci Recursion",
      category: "Recursion",
    },
  });

  let callCount = 0;
  let maxDepth = 0;
  const treeNodes: RecursionTreeNode[] = [];
  const currentStack: StackFrame[] = [];

  function computeFib(val: number, parentId: string | null): number {
    callCount++;
    const frameId = `frame-${callCount}`;
    const depth = currentStack.length + 1;
    if (depth > maxDepth) maxDepth = depth;

    const frame: StackFrame = {
      id: frameId,
      functionName: "fibonacci",
      args: { n: val },
      status: "calling",
      depth,
      parentId,
    };
    currentStack.push(frame);

    treeNodes.push({
      id: frameId,
      label: `fib(${val})`,
      depth,
      status: "active",
      children: [],
    });

    builder.addStep({
      operation: "call",
      codeLine: 1,
      variables: { n: val, depth },
      state: {
        functionName: "fibonacci",
        callStack: [...currentStack],
        activeFrameId: frameId,
        callTree: [...treeNodes],
        totalCalls: callCount,
        maxDepth,
        finalResult: null,
        phaseDescription: `Call fibonacci(${val}) at depth ${depth}.`,
      },
      highlightedElements: [frameId],
      explanation: `Entering fibonacci(${val}).`,
    });

    if (val <= 0) {
      builder.addStep({
        operation: "select",
        codeLine: 2,
        variables: { n: val, baseCase: 0 },
        state: {
          functionName: "fibonacci",
          callStack: currentStack.map((f) =>
            f.id === frameId ? { ...f, status: "returning" as const, returnValue: 0 } : f
          ),
          activeFrameId: frameId,
          callTree: [...treeNodes],
          totalCalls: callCount,
          maxDepth,
          finalResult: null,
          phaseDescription: `Base case fib(${val}) = 0. Returning 0.`,
        },
        highlightedElements: [frameId],
        explanation: `Base case: fib(0) = 0.`,
      });
      currentStack.pop();
      return 0;
    }

    if (val === 1) {
      builder.addStep({
        operation: "select",
        codeLine: 3,
        variables: { n: val, baseCase: 1 },
        state: {
          functionName: "fibonacci",
          callStack: currentStack.map((f) =>
            f.id === frameId ? { ...f, status: "returning" as const, returnValue: 1 } : f
          ),
          activeFrameId: frameId,
          callTree: [...treeNodes],
          totalCalls: callCount,
          maxDepth,
          finalResult: null,
          phaseDescription: `Base case fib(${val}) = 1. Returning 1.`,
        },
        highlightedElements: [frameId],
        explanation: `Base case: fib(1) = 1.`,
      });
      currentStack.pop();
      return 1;
    }

    const left = computeFib(val - 1, frameId);
    const right = computeFib(val - 2, frameId);
    const sum = left + right;

    builder.addStep({
      operation: "insert",
      codeLine: 4,
      variables: {
        n: val,
        leftFib: left,
        rightFib: right,
        sum,
      },
      state: {
        functionName: "fibonacci",
        callStack: currentStack.map((f) =>
          f.id === frameId ? { ...f, status: "returning" as const, returnValue: sum } : f
        ),
        activeFrameId: frameId,
        callTree: [...treeNodes],
        totalCalls: callCount,
        maxDepth,
        finalResult: currentStack.length === 1 ? sum : null,
        phaseDescription: `fib(${val}) = fib(${val - 1}) [${left}] + fib(${val - 2}) [${right}] = ${sum}.`,
      },
      highlightedElements: [frameId],
      explanation: `Combined subproblems: fib(${val}) = ${left} + ${right} = ${sum}.`,
    });

    currentStack.pop();
    return sum;
  }

  const finalVal = computeFib(targetN, null);

  builder.addStep({
    operation: "call",
    codeLine: 4,
    variables: { finalResult: finalVal, totalCalls: callCount },
    state: {
      functionName: "fibonacci",
      callStack: [],
      activeFrameId: null,
      callTree: [...treeNodes],
      totalCalls: callCount,
      maxDepth,
      finalResult: finalVal,
      phaseDescription: `Fibonacci(${targetN}) finished with answer ${finalVal} across ${callCount} calls.`,
    },
    highlightedElements: [],
    explanation: `Branching recursion complete. Final answer: ${finalVal}.`,
  });

  return builder.build();
}

/**
 * 3. Tower of Hanoi Trace Generator
 */
export function generateHanoiTrace(
  disks: number
): ExecutionTrace<RecursionExecutionState> {
  const n = Math.max(1, Math.min(disks, 4));

  const initialState: RecursionExecutionState = {
    functionName: "hanoi",
    callStack: [],
    activeFrameId: null,
    callTree: [],
    totalCalls: 0,
    maxDepth: 0,
    phaseDescription: `Ready to solve Tower of Hanoi for ${n} disks. (Total moves = 2^${n} - 1 = ${Math.pow(2, n) - 1}).`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "tower-of-hanoi",
      algorithmName: "Tower of Hanoi",
      category: "Recursion",
    },
  });

  let moveCount = 0;
  let callCount = 0;
  const currentStack: StackFrame[] = [];

  function solveHanoi(k: number, from: string, to: string, aux: string) {
    callCount++;
    const frameId = `frame-${callCount}`;
    const frame: StackFrame = {
      id: frameId,
      functionName: "hanoi",
      args: { k, from, to, aux },
      status: "calling",
      depth: currentStack.length + 1,
    };
    currentStack.push(frame);

    builder.addStep({
      operation: "call",
      codeLine: 1,
      variables: { disk: k, fromRod: from, toRod: to, auxRod: aux },
      state: {
        functionName: "hanoi",
        callStack: [...currentStack],
        activeFrameId: frameId,
        callTree: [],
        totalCalls: callCount,
        maxDepth: n,
        phaseDescription: `Call hanoi(${k}, ${from} -> ${to}).`,
      },
      highlightedElements: [frameId],
      explanation: `Calling hanoi to transfer ${k} disk(s) from rod ${from} to rod ${to}.`,
    });

    if (k === 1) {
      moveCount++;
      builder.addStep({
        operation: "insert",
        codeLine: 3,
        variables: { moveNumber: moveCount, disk: 1, from, to },
        state: {
          functionName: "hanoi",
          callStack: [...currentStack],
          activeFrameId: frameId,
          callTree: [],
          totalCalls: callCount,
          maxDepth: n,
          phaseDescription: `Move #${moveCount}: Move disk 1 directly from ${from} to ${to}.`,
        },
        highlightedElements: [frameId],
        explanation: `Base case (disk 1): Move disk 1 from ${from} to ${to}.`,
      });
      currentStack.pop();
      return;
    }

    // 1. Move k - 1 from -> aux
    solveHanoi(k - 1, from, aux, to);

    // 2. Move disk k from -> to
    moveCount++;
    builder.addStep({
      operation: "insert",
      codeLine: 6,
      variables: { moveNumber: moveCount, disk: k, from, to },
      state: {
        functionName: "hanoi",
        callStack: [...currentStack],
        activeFrameId: frameId,
        callTree: [],
        totalCalls: callCount,
        maxDepth: n,
        phaseDescription: `Move #${moveCount}: Move disk ${k} from ${from} to ${to}.`,
      },
      highlightedElements: [frameId],
      explanation: `Move disk ${k} from ${from} to ${to}.`,
    });

    // 3. Move k - 1 aux -> to
    solveHanoi(k - 1, aux, to, from);

    currentStack.pop();
  }

  solveHanoi(n, "A", "C", "B");

  builder.addStep({
    operation: "call",
    codeLine: 7,
    variables: { totalMoves: moveCount, totalCalls: callCount },
    state: {
      functionName: "hanoi",
      callStack: [],
      activeFrameId: null,
      callTree: [],
      totalCalls: callCount,
      maxDepth: n,
      finalResult: moveCount,
      phaseDescription: `Tower of Hanoi solved in ${moveCount} moves!`,
    },
    highlightedElements: [],
    explanation: `All disks successfully transferred respecting invariant.`,
  });

  return builder.build();
}
