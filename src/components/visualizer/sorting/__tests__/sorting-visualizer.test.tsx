import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { SortingVisualizerShell } from "../sorting-visualizer-shell";

describe("SortingVisualizerShell Component", () => {
  it("renders sorting visualizer with bar charts, algorithms list, and shuffle button", () => {
    render(<SortingVisualizerShell initialAlgorithm="bubble-sort" />);
    expect(screen.getByText(/Sorting Visualizer/i)).toBeDefined();
    expect(screen.getAllByText(/Bubble Sort/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Quick Sort/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Shuffle/i)).toBeDefined();
  });
});
