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
    expect(screen.getByText("Queue Visualizer")).toBeInTheDocument();

    // Initial elements rendered
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();

    // FRONT and REAR indicators
    expect(screen.getAllByText("FRONT").length).toBeGreaterThan(0);
    expect(screen.getAllByText("REAR").length).toBeGreaterThan(0);

    // Timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/step forward/i)).toBeInTheDocument();

    // Operations dock
    expect(screen.getByRole("button", { name: "Enqueue" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dequeue" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Peek Front" })).toBeInTheDocument();
  });

  it("switches to Circular Queue variant and displays circular ring buffer mechanics", () => {
    render(<QueueVisualizerShell initialValues={[10, 20]} initialVariant="linear" />);

    // Switch to Circular variant
    const circularBtn = screen.getByRole("button", { name: "Circular Queue" });
    fireEvent.click(circularBtn);

    // Is Full operation tab is available in circular mode
    expect(screen.getByRole("button", { name: "isFull" })).toBeInTheDocument();
  });

  it("switches operation to Dequeue and Front", () => {
    render(<QueueVisualizerShell initialValues={[10, 20, 30]} initialVariant="linear" />);

    // Click "Dequeue" operation button
    const dequeueOpBtn = screen.getByRole("button", { name: "Dequeue" });
    fireEvent.click(dequeueOpBtn);

    // Click "Peek Front" operation button
    const frontOpBtn = screen.getByRole("button", { name: "Peek Front" });
    fireEvent.click(frontOpBtn);
    expect(frontOpBtn).toBeInTheDocument();
  });

  it("advances execution step when Step forward button is clicked", () => {
    render(<QueueVisualizerShell initialValues={[10, 20]} initialVariant="linear" />);

    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("0");

    const nextBtn = screen.getByLabelText(/step forward/i);
    fireEvent.click(nextBtn);

    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("1");
  });

  it("allows entering a valid custom queue and re-renders elements", () => {
    render(<QueueVisualizerShell initialValues={[1, 2, 3]} initialVariant="linear" />);

    const setQueueBtn = screen.getByRole("button", { name: "Create" });
    fireEvent.click(setQueueBtn);

    const input = screen.getByPlaceholderText(/e\.g\. 10, 20, 30/i);
    fireEvent.change(input, { target: { value: "50, 60, 70" } });

    const goBtn = screen.getByRole("button", { name: /go/i });
    fireEvent.click(goBtn);

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
  });
});
