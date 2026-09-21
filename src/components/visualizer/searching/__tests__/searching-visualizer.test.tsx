import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { SearchingVisualizerShell } from "../searching-visualizer-shell";

describe("SearchingVisualizerShell Component", () => {
  it("renders searching visualizer with header, subvariants, and dock action", () => {
    render(<SearchingVisualizerShell initialAlgorithm="binary-search" />);
    expect(screen.getByText("Searching Visualizer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Binary Search" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Linear Search" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^search$/i })).toBeInTheDocument();
  });
});
