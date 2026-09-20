import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { SearchingVisualizerShell } from "../searching-visualizer-shell";

describe("SearchingVisualizerShell Component", () => {
  it("renders searching visualizer with header, buttons, and array track", () => {
    render(<SearchingVisualizerShell initialAlgorithm="binary-search" />);
    expect(screen.getByText(/Searching Visualizer/i)).toBeDefined();
    expect(screen.getByText(/Binary Search \(O\(log n\)\)/i)).toBeDefined();
    expect(screen.getByText(/Linear Search \(O\(n\)\)/i)).toBeDefined();
    expect(screen.getByText(/Run Search/i)).toBeDefined();
  });
});
