import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnimatedElementsContainer } from "../animated-elements-container";
import type { VisualizationState } from "@/core/visualization/types";

describe("AnimatedElementsContainer Component", () => {
  const sampleState: VisualizationState = {
    sourceState: {},
    elements: [
      { id: "elem-0", type: "item", value: 42, position: { x: 0, y: 0 } },
      { id: "elem-1", type: "item", value: 99, position: { x: 60, y: 0 } },
    ],
    connections: [],
    highlights: [],
    annotations: [],
  };

  it("renders elements with stable IDs and values", () => {
    render(<AnimatedElementsContainer visualizationState={sampleState} />);

    expect(screen.getByText("elem-0")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("elem-1")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(screen.getByText("Animated State Presentation")).toBeInTheDocument();
  });

  it("renders null safely when visualizationState is null", () => {
    const { container } = render(
      <AnimatedElementsContainer visualizationState={null} />
    );
    expect(container.firstChild).toBeNull();
  });
});
