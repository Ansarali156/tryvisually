import { describe, it, expect, beforeEach } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueueVisualizerShell } from "../queue-visualizer-shell";
import { resetQueueIdCounter } from "@/core/queue/validation";

describe("QueueVisualizerShell Component", () => {
  beforeEach(() => {
    resetQueueIdCounter(1);
  });

  it("renders linear queue visualizer workspace with initial elements, FRONT/REAR indicators, timeline, and panels", () => {
    render(<QueueVisualizerShell initialValues={[10, 20, 30]} initialVariant="linear" />);

    // Header and title
    expect(screen.getByText("Queue Visualizer")).toBeDefined();
    expect(
      screen.getByText("Master FIFO principles, enqueue at rear, and dequeue at front.")
    ).toBeDefined();

    // Initial elements rendered
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("20")).toBeDefined();
    expect(screen.getByText("30")).toBeDefined();

    // FRONT and REAR indicators
    expect(screen.getAllByText("FRONT").length).toBeGreaterThan(0);
    expect(screen.getAllByText("REAR").length).toBeGreaterThan(0);

    // Timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /next/i })).toBeDefined();

    // Panels
    expect(screen.getByText("Synchronized Implementation")).toBeDefined();
    expect(screen.getByText("Runtime Variables")).toBeDefined();
    expect(screen.getByText("Step Explanation")).toBeDefined();
  });

  it("switches to Circular Queue variant and displays circular ring buffer mechanics", () => {
    render(<QueueVisualizerShell initialValues={[10, 20]} initialVariant="linear" />);

    // Switch to Circular variant
    const circularBtn = screen.getByRole("button", { name: /circular queue/i });
    fireEvent.click(circularBtn);

    // Title updates
    expect(screen.getByText("Circular Queue Visualizer")).toBeDefined();
    expect(
      screen.getByText(/Observe modulo arithmetic and bounded buffer ring reuse/i)
    ).toBeDefined();

    // Modulo Wrap-Around educational note visible
    expect(screen.getByText(/Modulo Wrap-Around/i)).toBeDefined();

    // Is Full operation tab is now available in circular mode
    expect(screen.getByRole("button", { name: "Is Full" })).toBeDefined();
  });

  it("switches operation to Dequeue and Front and updates complexity card", () => {
    render(<QueueVisualizerShell initialValues={[10, 20, 30]} initialVariant="linear" />);

    // Click "Dequeue" operation button
    const dequeueOpBtn = screen.getByRole("button", { name: "Dequeue" });
    fireEvent.click(dequeueOpBtn);
    expect(screen.getByText(/Dequeue Complexity/i)).toBeDefined();

    // Click "Front" operation button
    const frontOpBtn = screen.getByRole("button", { name: "Front" });
    fireEvent.click(frontOpBtn);
    expect(screen.getByText(/Front Complexity/i)).toBeDefined();
  });

  it("advances execution step when Next button is clicked", () => {
    render(<QueueVisualizerShell initialValues={[10, 20]} initialVariant="linear" />);

    expect(screen.getByText(/Step 1 of/i)).toBeDefined();

    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2 of/i)).toBeDefined();
  });

  it("allows entering a valid custom queue and re-renders elements", () => {
    render(<QueueVisualizerShell initialValues={[1, 2, 3]} initialVariant="linear" />);

    const input = screen.getByPlaceholderText(/Custom queue/i);
    fireEvent.change(input, { target: { value: "50, 60, 70" } });

    const loadBtn = screen.getByRole("button", { name: /load queue/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText("50")).toBeDefined();
    expect(screen.getByText("60")).toBeDefined();
    expect(screen.getByText("70")).toBeDefined();
  });

  it("displays a clear error when invalid custom queue is submitted", () => {
    render(<QueueVisualizerShell initialValues={[1, 2, 3]} initialVariant="linear" />);

    const input = screen.getByPlaceholderText(/Custom queue/i);
    fireEvent.change(input, { target: { value: "10, xyz, 30" } });

    const loadBtn = screen.getByRole("button", { name: /load queue/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText(/Invalid value "xyz"/i)).toBeDefined();
  });
});
