import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { GraphAlgorithmVisualizerShell } from "../graph-algorithm-visualizer-shell";

describe("GraphAlgorithmVisualizerShell Component", () => {
  it("renders graph algorithm visualizer with traversal options, canvas, and data structure inspector", () => {
    render(<GraphAlgorithmVisualizerShell initialAlgorithm="bfs" />);
    expect(screen.getByText(/Graph Algorithms Visualizer/i)).toBeDefined();
    expect(screen.getByText(/BFS \(Breadth-First\)/i)).toBeDefined();
    expect(screen.getByText(/Dijkstra's Algorithm/i)).toBeDefined();
    expect(screen.getByText(/Run Algorithm/i)).toBeDefined();
  });
});
