/**
 * Trace Generators for Dynamic Programming Algorithms
 *
 * Implements deterministic traces for:
 * 1. Fibonacci (1D Table)
 * 2. Climbing Stairs (1D Table)
 * 3. 0/1 Knapsack (2D Table)
 * 4. Longest Common Subsequence (2D Table)
 */

import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type { ExecutionTrace } from "@/core/execution/types";
import type { DPExecutionState, DPTableState } from "./types";

/**
 * 1. Fibonacci DP Trace Generator (1D)
 */
export function generateFibonacciDpTrace(
  n: number
): ExecutionTrace<DPExecutionState> {
  const targetN = Math.max(2, Math.min(n, 8));

  const colLabels = Array.from({ length: targetN + 1 }, (_, i) => `i=${i}`);
  const grid: (number | null)[][] = [new Array(targetN + 1).fill(null)];

  const initialState: DPExecutionState = {
    algorithm: "fibonacci",
    table: {
      is2D: false,
      rowLabels: ["dp[i]"],
      colLabels,
      grid: grid.map((r) => [...r]),
    },
    activeCell: null,
    dependentCells: [],
    formula: "dp[i] = dp[i - 1] + dp[i - 2]",
    finalAnswer: null,
    phaseDescription: `Ready to compute fib(${targetN}) via 1D bottom-up DP table.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "fibonacci-dp",
      algorithmName: "Fibonacci (DP Table)",
      category: "Dynamic Programming",
    },
  });

  // Base cases
  grid[0][0] = 0;
  builder.addStep({
    operation: "insert",
    codeLine: 4,
    variables: { "dp[0]": 0 },
    state: {
      algorithm: "fibonacci",
      table: { is2D: false, rowLabels: ["dp[i]"], colLabels, grid: grid.map((r) => [...r]) },
      activeCell: [0, 0],
      dependentCells: [],
      formula: "Base case: dp[0] = 0",
      finalAnswer: null,
      phaseDescription: "Base Case: dp[0] = 0.",
    },
    highlightedElements: ["cell-0-0"],
    explanation: "Base case: fib(0) is defined as 0.",
  });

  grid[0][1] = 1;
  builder.addStep({
    operation: "insert",
    codeLine: 5,
    variables: { "dp[1]": 1 },
    state: {
      algorithm: "fibonacci",
      table: { is2D: false, rowLabels: ["dp[i]"], colLabels, grid: grid.map((r) => [...r]) },
      activeCell: [0, 1],
      dependentCells: [],
      formula: "Base case: dp[1] = 1",
      finalAnswer: null,
      phaseDescription: "Base Case: dp[1] = 1.",
    },
    highlightedElements: ["cell-0-1"],
    explanation: "Base case: fib(1) is defined as 1.",
  });

  for (let i = 2; i <= targetN; i++) {
    const prev1 = grid[0][i - 1] as number;
    const prev2 = grid[0][i - 2] as number;
    const val = prev1 + prev2;
    grid[0][i] = val;

    builder.addStep({
      operation: "insert",
      codeLine: 7,
      variables: {
        i,
        "dp[i-1]": prev1,
        "dp[i-2]": prev2,
        "dp[i]": val,
      },
      state: {
        algorithm: "fibonacci",
        table: { is2D: false, rowLabels: ["dp[i]"], colLabels, grid: grid.map((r) => [...r]) },
        activeCell: [0, i],
        dependentCells: [
          [0, i - 1],
          [0, i - 2],
        ],
        formula: `dp[${i}] = dp[${i - 1}] (${prev1}) + dp[${i - 2}] (${prev2}) = ${val}`,
        finalAnswer: i === targetN ? val : null,
        phaseDescription: `Computed dp[${i}] = ${prev1} + ${prev2} = ${val}.`,
      },
      highlightedElements: [`cell-0-${i}`, `cell-0-${i - 1}`, `cell-0-${i - 2}`],
      explanation: `Solved subproblem dp[${i}] using overlapping precomputed values dp[${i - 1}] and dp[${i - 2}].`,
    });
  }

  builder.addStep({
    operation: "call",
    codeLine: 9,
    variables: { result: grid[0][targetN] },
    state: {
      algorithm: "fibonacci",
      table: { is2D: false, rowLabels: ["dp[i]"], colLabels, grid: grid.map((r) => [...r]) },
      activeCell: [0, targetN],
      dependentCells: [],
      formula: `Answer: dp[${targetN}] = ${grid[0][targetN]}`,
      finalAnswer: grid[0][targetN],
      phaseDescription: `Fibonacci DP complete! fib(${targetN}) = ${grid[0][targetN]}.`,
    },
    highlightedElements: [`cell-0-${targetN}`],
    explanation: `Optimal solution found at dp[${targetN}] in O(n) time and O(n) space.`,
  });

  return builder.build();
}

/**
 * 2. Climbing Stairs DP Trace Generator (1D)
 */
export function generateClimbingStairsTrace(
  n: number
): ExecutionTrace<DPExecutionState> {
  const targetN = Math.max(3, Math.min(n, 7));
  const colLabels = Array.from({ length: targetN + 1 }, (_, i) => `Step ${i}`);
  const grid: (number | null)[][] = [new Array(targetN + 1).fill(null)];

  const initialState: DPExecutionState = {
    algorithm: "climbing-stairs",
    table: {
      is2D: false,
      rowLabels: ["ways[i]"],
      colLabels,
      grid: grid.map((r) => [...r]),
    },
    activeCell: null,
    dependentCells: [],
    formula: "ways[i] = ways[i-1] + ways[i-2]",
    finalAnswer: null,
    phaseDescription: `Ready to compute distinct ways to climb ${targetN} stairs.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "climbing-stairs",
      algorithmName: "Climbing Stairs (DP)",
      category: "Dynamic Programming",
    },
  });

  grid[0][1] = 1;
  builder.addStep({
    operation: "insert",
    codeLine: 4,
    variables: { "ways[1]": 1 },
    state: {
      algorithm: "climbing-stairs",
      table: { is2D: false, rowLabels: ["ways[i]"], colLabels, grid: grid.map((r) => [...r]) },
      activeCell: [0, 1],
      dependentCells: [],
      formula: "ways[1] = 1 (1 step)",
      finalAnswer: null,
      phaseDescription: "Base Case: 1 way to reach step 1 (single 1-step hop).",
    },
    highlightedElements: ["cell-0-1"],
    explanation: "Base case: Only 1 way to climb 1 step.",
  });

  grid[0][2] = 2;
  builder.addStep({
    operation: "insert",
    codeLine: 4,
    variables: { "ways[2]": 2 },
    state: {
      algorithm: "climbing-stairs",
      table: { is2D: false, rowLabels: ["ways[i]"], colLabels, grid: grid.map((r) => [...r]) },
      activeCell: [0, 2],
      dependentCells: [],
      formula: "ways[2] = 2 (1+1 or 2)",
      finalAnswer: null,
      phaseDescription: "Base Case: 2 ways to reach step 2 ([1,1] or [2]).",
    },
    highlightedElements: ["cell-0-2"],
    explanation: "Base case: 2 ways to reach step 2.",
  });

  for (let i = 3; i <= targetN; i++) {
    const prev1 = grid[0][i - 1] as number;
    const prev2 = grid[0][i - 2] as number;
    const val = prev1 + prev2;
    grid[0][i] = val;

    builder.addStep({
      operation: "insert",
      codeLine: 6,
      variables: { i, "ways[i-1]": prev1, "ways[i-2]": prev2, "ways[i]": val },
      state: {
        algorithm: "climbing-stairs",
        table: { is2D: false, rowLabels: ["ways[i]"], colLabels, grid: grid.map((r) => [...r]) },
        activeCell: [0, i],
        dependentCells: [
          [0, i - 1],
          [0, i - 2],
        ],
        formula: `ways[${i}] = ways[${i - 1}] (${prev1}) + ways[${i - 2}] (${prev2}) = ${val}`,
        finalAnswer: i === targetN ? val : null,
        phaseDescription: `Step ${i}: Can arrive from step ${i - 1} or step ${i - 2} -> ${val} total ways.`,
      },
      highlightedElements: [`cell-0-${i}`, `cell-0-${i - 1}`, `cell-0-${i - 2}`],
      explanation: `Sum of ways from step ${i - 1} and ${i - 2}.`,
    });
  }

  builder.addStep({
    operation: "call",
    codeLine: 8,
    variables: { totalWays: grid[0][targetN] },
    state: {
      algorithm: "climbing-stairs",
      table: { is2D: false, rowLabels: ["ways[i]"], colLabels, grid: grid.map((r) => [...r]) },
      activeCell: [0, targetN],
      dependentCells: [],
      formula: `Answer: ${grid[0][targetN]} distinct ways`,
      finalAnswer: grid[0][targetN],
      phaseDescription: `Climbing Stairs finished! ${grid[0][targetN]} ways to reach step ${targetN}.`,
    },
    highlightedElements: [`cell-0-${targetN}`],
    explanation: `Total unique combinations calculated.`,
  });

  return builder.build();
}

/**
 * 3. 0/1 Knapsack Trace Generator (2D Table)
 */
export function generateKnapsackTrace(
  weights: readonly number[],
  values: readonly number[],
  capacity: number
): ExecutionTrace<DPExecutionState> {
  const W = Math.min(capacity, 7);
  const n = Math.min(weights.length, 4);

  const rowLabels = ["0 (empty)", ...Array.from({ length: n }, (_, i) => `Item ${i + 1} (w=${weights[i]}, v=${values[i]})`)];
  const colLabels = Array.from({ length: W + 1 }, (_, w) => `cap ${w}`);

  const grid: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    new Array(W + 1).fill(0)
  );

  const initialState: DPExecutionState = {
    algorithm: "knapsack",
    table: {
      is2D: true,
      rowLabels,
      colLabels,
      grid: grid.map((r) => [...r]),
    },
    activeCell: null,
    dependentCells: [],
    formula: "dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])",
    finalAnswer: null,
    phaseDescription: `Ready to compute 0/1 Knapsack with ${n} items and capacity ${W}.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "knapsack",
      algorithmName: "0/1 Knapsack Problem",
      category: "Dynamic Programming",
    },
  });

  // Base row 0 initialized to 0
  builder.addStep({
    operation: "call",
    codeLine: 3,
    variables: { row: 0, items: 0 },
    state: {
      ...initialState,
      phaseDescription: "Initialized row 0 (0 items) to 0 value.",
    },
    highlightedElements: colLabels.map((_, c) => `cell-0-${c}`),
    explanation: "With 0 items available, maximum value is 0 across all capacities.",
  });

  for (let i = 1; i <= n; i++) {
    const wt = weights[i - 1];
    const val = values[i - 1];

    for (let w = 1; w <= W; w++) {
      const withoutItem = grid[i - 1][w] as number;

      if (wt <= w) {
        const withItem = val + (grid[i - 1][w - wt] as number);
        const best = Math.max(withoutItem, withItem);
        grid[i][w] = best;

        builder.addStep({
          operation: "insert",
          codeLine: 6,
          variables: {
            item: i,
            capacity: w,
            withoutItem,
            withItem: `${val} + dp[${i - 1}][${w - wt}] (${grid[i - 1][w - wt]}) = ${withItem}`,
            chosen: best,
          },
          state: {
            algorithm: "knapsack",
            table: { is2D: true, rowLabels, colLabels, grid: grid.map((r) => [...r]) },
            activeCell: [i, w],
            dependentCells: [
              [i - 1, w],
              [i - 1, w - wt],
            ],
            formula: `dp[${i}][${w}] = max(${withoutItem}, ${val} + ${grid[i - 1][w - wt]}) = ${best}`,
            finalAnswer: i === n && w === W ? best : null,
            phaseDescription: `Item ${i} fits (wt ${wt} <= cap ${w}). Compare exclude (${withoutItem}) vs include (${withItem}) -> ${best}.`,
          },
          highlightedElements: [`cell-${i}-${w}`, `cell-${i - 1}-${w}`, `cell-${i - 1}-${w - wt}`],
          explanation: `Taking max of excluding item (${withoutItem}) and including item (${withItem}).`,
        });
      } else {
        grid[i][w] = withoutItem;

        builder.addStep({
          operation: "insert",
          codeLine: 9,
          variables: { item: i, capacity: w, itemWeight: wt, fits: false },
          state: {
            algorithm: "knapsack",
            table: { is2D: true, rowLabels, colLabels, grid: grid.map((r) => [...r]) },
            activeCell: [i, w],
            dependentCells: [[i - 1, w]],
            formula: `Item ${i} too heavy (${wt} > ${w}). dp[${i}][${w}] = dp[${i - 1}][${w}] = ${withoutItem}`,
            finalAnswer: i === n && w === W ? withoutItem : null,
            phaseDescription: `Item ${i} exceeds capacity (${wt} > ${w}). Carry forward ${withoutItem}.`,
          },
          highlightedElements: [`cell-${i}-${w}`, `cell-${i - 1}-${w}`],
          explanation: `Item cannot fit. Retain best value without this item.`,
        });
      }
    }
  }

  builder.addStep({
    operation: "call",
    codeLine: 12,
    variables: { maxKnapsackValue: grid[n][W] },
    state: {
      algorithm: "knapsack",
      table: { is2D: true, rowLabels, colLabels, grid: grid.map((r) => [...r]) },
      activeCell: [n, W],
      dependentCells: [],
      formula: `Optimal Knapsack Value: ${grid[n][W]}`,
      finalAnswer: grid[n][W],
      phaseDescription: `Knapsack complete! Maximum value achievable is ${grid[n][W]}.`,
    },
    highlightedElements: [`cell-${n}-${W}`],
    explanation: `Optimal solution calculated at bottom-right cell dp[${n}][${W}].`,
  });

  return builder.build();
}

/**
 * 4. Longest Common Subsequence Trace Generator (2D Table)
 */
export function generateLcsTrace(
  text1: string,
  text2: string
): ExecutionTrace<DPExecutionState> {
  const s1 = text1.slice(0, 5).toUpperCase();
  const s2 = text2.slice(0, 5).toUpperCase();
  const m = s1.length;
  const n = s2.length;

  const rowLabels = ["''", ...s1.split("").map((c, i) => `${c} (i=${i + 1})`)];
  const colLabels = ["''", ...s2.split("").map((c, j) => `${c} (j=${j + 1})`)];

  const grid: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  const initialState: DPExecutionState = {
    algorithm: "lcs",
    table: {
      is2D: true,
      rowLabels,
      colLabels,
      grid: grid.map((r) => [...r]),
    },
    activeCell: null,
    dependentCells: [],
    formula: "dp[i][j] = match ? 1 + dp[i-1][j-1] : max(dp[i-1][j], dp[i][j-1])",
    finalAnswer: null,
    phaseDescription: `Ready to compute LCS for "${s1}" and "${s2}".`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "lcs",
      algorithmName: "Longest Common Subsequence",
      category: "Dynamic Programming",
    },
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = s1[i - 1] === s2[j - 1];

      if (match) {
        const val = 1 + (grid[i - 1][j - 1] as number);
        grid[i][j] = val;

        builder.addStep({
          operation: "insert",
          codeLine: 6,
          variables: {
            charA: s1[i - 1],
            charB: s2[j - 1],
            match: true,
            length: val,
          },
          state: {
            algorithm: "lcs",
            table: { is2D: true, rowLabels, colLabels, grid: grid.map((r) => [...r]) },
            activeCell: [i, j],
            dependentCells: [[i - 1, j - 1]],
            formula: `'${s1[i - 1]}' == '${s2[j - 1]}'! dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] (${grid[i - 1][j - 1]}) = ${val}`,
            finalAnswer: i === m && j === n ? val : null,
            phaseDescription: `Characters match ('${s1[i - 1]}'). Diagonal transition + 1 -> ${val}.`,
          },
          highlightedElements: [`cell-${i}-${j}`, `cell-${i - 1}-${j - 1}`],
          explanation: `Characters match at (${i}, ${j}). Subsequence extended by 1 from diagonal.`,
        });
      } else {
        const top = grid[i - 1][j] as number;
        const left = grid[i][j - 1] as number;
        const val = Math.max(top, left);
        grid[i][j] = val;

        builder.addStep({
          operation: "insert",
          codeLine: 8,
          variables: {
            charA: s1[i - 1],
            charB: s2[j - 1],
            match: false,
            top,
            left,
            maxVal: val,
          },
          state: {
            algorithm: "lcs",
            table: { is2D: true, rowLabels, colLabels, grid: grid.map((r) => [...r]) },
            activeCell: [i, j],
            dependentCells: [
              [i - 1, j],
              [i, j - 1],
            ],
            formula: `'${s1[i - 1]}' != '${s2[j - 1]}'. dp[${i}][${j}] = max(${top}, ${left}) = ${val}`,
            finalAnswer: i === m && j === n ? val : null,
            phaseDescription: `Characters mismatch ('${s1[i - 1]}' != '${s2[j - 1]}'). Max of top (${top}) and left (${left}) -> ${val}.`,
          },
          highlightedElements: [`cell-${i}-${j}`, `cell-${i - 1}-${j}`, `cell-${i}-${j - 1}`],
          explanation: `Characters do not match. Taking maximum of top and left subproblems.`,
        });
      }
    }
  }

  builder.addStep({
    operation: "call",
    codeLine: 11,
    variables: { lcsLength: grid[m][n] },
    state: {
      algorithm: "lcs",
      table: { is2D: true, rowLabels, colLabels, grid: grid.map((r) => [...r]) },
      activeCell: [m, n],
      dependentCells: [],
      formula: `LCS Length: ${grid[m][n]}`,
      finalAnswer: grid[m][n],
      phaseDescription: `LCS complete! Longest common subsequence length is ${grid[m][n]}.`,
    },
    highlightedElements: [`cell-${m}-${n}`],
    explanation: `Finished computing LCS 2D table.`,
  });

  return builder.build();
}
