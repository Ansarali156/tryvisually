import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { GraphAlgorithmVisualizerShell } from "../graph-algorithm-visualizer-shell";

describe("GraphAlgorithmVisualizerShell Component", () => {
  it("renders graph algorithm visualizer with traversal options, canvas, and data structure inspector", () => {
    render(<GraphAlgorithmVisualizerShell initialAlgorithm="bfs" />);
    expect(screen.getByText("Graph Algorithms Visualizer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "BFS" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dijkstra" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Execute" })).toBeInTheDocument();
  });
});
