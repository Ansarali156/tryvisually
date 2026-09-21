import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { DpVisualizerShell } from "../dp-visualizer-shell";

describe("DpVisualizerShell Component", () => {
  it("renders dynamic programming visualizer with grid table and algorithm options", () => {
    render(<DpVisualizerShell />);
    expect(screen.getByText(/Dynamic Programming Visualizer/i)).toBeDefined();
    expect(screen.getByText(/0\/1 Knapsack/i)).toBeDefined();
    expect(screen.getByText(/Longest Common Subsequence/i)).toBeDefined();
    expect(screen.getByText(/Solve DP/i)).toBeDefined();
  });
});
