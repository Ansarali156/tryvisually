import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VisualizerShell } from "../visualizer-shell";

describe("VisualizerShell Component", () => {
  it("renders VisuAlgo shell with canvas, code HUD, dock actions, and controls", () => {
    render(<VisualizerShell />);

    // Check title and category
    expect(screen.getByText("Binary Search")).toBeInTheDocument();
    expect(screen.getByText("Searching Algorithms")).toBeInTheDocument();

    // Check dock actions
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();

    // Check timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first step/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/step forward/i)).toBeInTheDocument();

    // Check initial step explanation
    expect(screen.getByText("Initialize Pointers")).toBeInTheDocument();
    expect(screen.getByText(/Set left pointer to index 0/i)).toBeInTheDocument();
  });

  it("advances step when Step forward button is clicked", () => {
    render(<VisualizerShell />);

    const nextButton = screen.getByLabelText(/step forward/i);
    fireEvent.click(nextButton);

    // Step 2 action is "Calculate Midpoint"
    expect(screen.getByText("Calculate Midpoint")).toBeInTheDocument();
  });
});
