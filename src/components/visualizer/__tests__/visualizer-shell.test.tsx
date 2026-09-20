import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VisualizerShell } from "../visualizer-shell";

describe("VisualizerShell Component", () => {
  it("renders wireframe panels: topics, visualization, code, state, controls, explanation", () => {
    render(<VisualizerShell />);

    // Check header and topics
    expect(screen.getByText("Data Structures")).toBeInTheDocument();
    expect(screen.getByText("Algorithms")).toBeInTheDocument();
    expect(screen.getByText("Binary Search Code")).toBeInTheDocument();

    // Check state inspector
    expect(
      screen.getByText("Variables / Data / Execution State")
    ).toBeInTheDocument();

    // Check timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first step/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next step/i)).toBeInTheDocument();

    // Check step 1 content initially
    expect(screen.getByText("Initialize Search Pointers")).toBeInTheDocument();
    expect(screen.getByText(/Set left pointer to index 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Why this step\?/i)).toBeInTheDocument();
  });

  it("advances step when Next button is clicked", () => {
    render(<VisualizerShell />);

    const nextButton = screen.getByLabelText(/next step/i);
    fireEvent.click(nextButton);

    // Step 2 action is "Calculate Midpoint"
    expect(screen.getByText("Calculate Midpoint")).toBeInTheDocument();
  });
});
