import { describe, it, expect, beforeEach } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArrayVisualizerShell } from "../array-visualizer-shell";
import { resetElementIdCounter } from "@/core/array/validation";

describe("ArrayVisualizerShell Component", () => {
  beforeEach(() => {
    resetElementIdCounter(1);
  });

  it("renders array visualizer workspace with initial elements, timeline controls, code and variables", () => {
    render(<ArrayVisualizerShell initialValues={[10, 20, 30]} />);

    // 1. Header and title
    expect(screen.getByText("Array Visualizer")).toBeInTheDocument();

    // 2. Initial elements rendered
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();

    // 3. Timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/step forward/i)).toBeInTheDocument();

    // 4. Operations Dock
    expect(screen.getByRole("button", { name: "Access" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Insert" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("switches operation and updates controls and complexity", () => {
    render(<ArrayVisualizerShell initialValues={[10, 20, 30]} />);

    // Click "Search" operation button
    const searchOpBtn = screen.getByRole("button", { name: "Search" });
    fireEvent.click(searchOpBtn);

    // Target parameter input should appear in popover tray
    expect(screen.getByPlaceholderText(/Value to search/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go/i })).toBeInTheDocument();
  });

  it("advances execution step when Step forward button is clicked", () => {
    render(<ArrayVisualizerShell initialValues={[20, 10]} />);

    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("0");

    const nextBtn = screen.getByLabelText(/step forward/i);
    fireEvent.click(nextBtn);

    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("1");
  });

  it("allows entering a valid custom array and re-renders elements", () => {
    render(<ArrayVisualizerShell initialValues={[1, 2, 3]} />);

    // Click Create action dock button
    const setArrayBtn = screen.getByRole("button", { name: "Create" });
    fireEvent.click(setArrayBtn);

    const input = screen.getByPlaceholderText(/comma separated/i);
    fireEvent.change(input, { target: { value: "50, 60, 70" } });

    const goBtn = screen.getByRole("button", { name: /go/i });
    fireEvent.click(goBtn);

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
  });
});
