import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { RecursionVisualizerShell } from "../recursion-visualizer-shell";

describe("RecursionVisualizerShell Component", () => {
  it("renders recursion visualizer with call stack container and parameters", () => {
    render(<RecursionVisualizerShell />);
    expect(screen.getByText(/Recursion & Call Stack Visualizer/i)).toBeDefined();
    expect(screen.getByText(/Factorial \(Linear Stack\)/i)).toBeDefined();
    expect(screen.getByText(/Fibonacci \(Tree Stack\)/i)).toBeDefined();
    expect(screen.getByText(/Tower of Hanoi/i)).toBeDefined();
    expect(screen.getByText(/Run Recursion/i)).toBeDefined();
  });
});
