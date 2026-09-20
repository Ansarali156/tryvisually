/**
 * Dynamic Programming State Models and Types
 */

export type DPAlgorithmType =
  | "fibonacci"
  | "climbing-stairs"
  | "knapsack"
  | "lcs";

export interface DPCell {
  readonly row: number;
  readonly col: number;
  readonly value: number | string | null;
  readonly state: "unfilled" | "computing" | "filled" | "dependency" | "result";
}

export interface DPTableState {
  readonly is2D: boolean;
  readonly rowLabels: readonly string[];
  readonly colLabels: readonly string[];
  readonly grid: readonly (readonly (number | string | null)[])[];
}

export interface DPExecutionState {
  readonly algorithm: DPAlgorithmType;
  readonly table: DPTableState;
  readonly activeCell: readonly [number, number] | null;
  readonly dependentCells: readonly (readonly [number, number])[];
  readonly formula: string;
  readonly finalAnswer?: number | string | null;
  readonly phaseDescription: string;
}
