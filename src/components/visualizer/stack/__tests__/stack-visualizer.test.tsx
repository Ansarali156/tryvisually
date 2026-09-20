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
    expect(screen.getByText("Stack Visualizer")).toBeDefined();
    expect(
      screen.getByText("Master LIFO principles, push/pop mechanics, and top-pointer tracking.")
    ).toBeDefined();

    // Initial elements rendered
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("20")).toBeDefined();
    expect(screen.getByText("30")).toBeDefined();

    // TOP indicator
    expect(screen.getAllByText("TOP").length).toBeGreaterThan(0);

    // Timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /next/i })).toBeDefined();

    // Panels
    expect(screen.getByText("Synchronized Implementation")).toBeDefined();
    expect(screen.getByText("Runtime Variables")).toBeDefined();
    expect(screen.getByText("Step Explanation")).toBeDefined();
  });

  it("switches operation to Pop and Peek and updates complexity", () => {
    render(<StackVisualizerShell initialValues={[10, 20, 30]} />);

    // Click "Pop" operation button
    const popOpBtn = screen.getByRole("button", { name: "Pop" });
    fireEvent.click(popOpBtn);
    expect(screen.getByText(/Pop Complexity/i)).toBeDefined();

    // Click "Peek" operation button
    const peekOpBtn = screen.getByRole("button", { name: "Peek" });
    fireEvent.click(peekOpBtn);
    expect(screen.getByText(/Peek Complexity/i)).toBeDefined();
  });

  it("advances execution step when Next button is clicked", () => {
    render(<StackVisualizerShell initialValues={[10, 20]} />);

    expect(screen.getByText(/Step 1 of/i)).toBeDefined();

    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2 of/i)).toBeDefined();
  });

  it("allows entering a valid custom stack and re-renders elements", () => {
    render(<StackVisualizerShell initialValues={[1, 2, 3]} />);

    const input = screen.getByPlaceholderText(/Custom stack/i);
    fireEvent.change(input, { target: { value: "50, 60, 70" } });

    const loadBtn = screen.getByRole("button", { name: /load stack/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText("50")).toBeDefined();
    expect(screen.getByText("60")).toBeDefined();
    expect(screen.getByText("70")).toBeDefined();
  });

  it("displays a clear error when invalid custom stack is submitted", () => {
    render(<StackVisualizerShell initialValues={[1, 2, 3]} />);

    const input = screen.getByPlaceholderText(/Custom stack/i);
    fireEvent.change(input, { target: { value: "10, abc, 30" } });

    const loadBtn = screen.getByRole("button", { name: /load stack/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText(/Invalid value "abc"/i)).toBeDefined();
  });
});
