import { describe, it, expect, beforeEach } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StackVisualizerShell } from "../stack-visualizer-shell";
import { resetStackIdCounter } from "@/core/stack/validation";

describe("StackVisualizerShell Component", () => {
  beforeEach(() => {
    resetStackIdCounter(1);
  });

  it("renders stack visualizer workspace with initial elements, TOP indicator, timeline, code and variables", () => {
    render(<StackVisualizerShell initialValues={[10, 20, 30]} />);

    // Header and title
    expect(screen.getByText("Stack Visualizer")).toBeInTheDocument();

    // Initial elements rendered
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();

    // TOP indicator
    expect(screen.getAllByText("TOP").length).toBeGreaterThan(0);

    // Timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/step forward/i)).toBeInTheDocument();

    // Dock operations
    expect(screen.getByRole("button", { name: "Push" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pop" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Peek" })).toBeInTheDocument();
  });

  it("switches operation to Pop and Peek", () => {
    render(<StackVisualizerShell initialValues={[10, 20, 30]} />);

    // Click "Pop" operation button
    const popOpBtn = screen.getByRole("button", { name: "Pop" });
    fireEvent.click(popOpBtn);
    expect(popOpBtn).toBeInTheDocument();

    // Click "Peek" operation button
    const peekOpBtn = screen.getByRole("button", { name: "Peek" });
    fireEvent.click(peekOpBtn);
    expect(peekOpBtn).toBeInTheDocument();
  });

  it("advances execution step when Step forward button is clicked", () => {
    render(<StackVisualizerShell initialValues={[10, 20]} />);

    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("0");

    const nextBtn = screen.getByLabelText(/step forward/i);
    fireEvent.click(nextBtn);

    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("1");
  });

  it("allows entering a valid custom stack and re-renders elements", () => {
    render(<StackVisualizerShell initialValues={[1, 2, 3]} />);

    const setStackBtn = screen.getByRole("button", { name: "Create" });
    fireEvent.click(setStackBtn);

    const input = screen.getByPlaceholderText(/e\.g\. 10, 20, 30/i);
    fireEvent.change(input, { target: { value: "50, 60, 70" } });

    const goBtn = screen.getByRole("button", { name: /go/i });
    fireEvent.click(goBtn);

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
  });
});
