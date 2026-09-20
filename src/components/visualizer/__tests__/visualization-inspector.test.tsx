import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VisualizationInspector } from "../visualization-inspector";
import type { VisualizationState } from "@/core/visualization/types";

describe("VisualizationInspector Component", () => {
  const sampleVisState: VisualizationState = {
    sourceState: {},
    elements: [
      { id: "node-1", type: "node", value: 42, label: "42", state: "active" },
      { id: "node-2", type: "node", value: 84, label: "84" },
    ],
    connections: [
      { id: "conn-1-2", sourceId: "node-1", targetId: "node-2", type: "next", directed: true },
    ],
    highlights: [
      { elementId: "node-1", type: "current" },
    ],
    annotations: [
      { id: "ann-1", text: "Comparing current node", type: "callout" },
    ],
  };

  it("renders closed by default and toggles on click", () => {
    render(<VisualizationInspector visualizationState={sampleVisState} />);

    expect(screen.getByText("Visualization State Engine Inspector")).toBeInTheDocument();
    expect(screen.getByText("2 elems · 1 conns · 1 hls")).toBeInTheDocument();

    // Elements tab not visible when closed
    expect(screen.queryByText("Elements (2)")).not.toBeInTheDocument();

    // Click header to open
    fireEvent.click(screen.getByText("Visualization State Engine Inspector"));
    expect(screen.getByText("Elements (2)")).toBeInTheDocument();
  });

  it("switches tabs and displays connection and highlight details", () => {
    render(
      <VisualizationInspector
        visualizationState={sampleVisState}
        defaultExpanded={true}
      />
    );

    expect(screen.getByText("Elements (2)")).toBeInTheDocument();
    expect(screen.getByText("node-1")).toBeInTheDocument();
    expect(screen.getByText("val: 42")).toBeInTheDocument();

    // Switch to Connections tab
    fireEvent.click(screen.getByText("Connections (1)"));
    expect(screen.getByText("→")).toBeInTheDocument();
    expect(screen.getByText("node-2")).toBeInTheDocument();

    // Switch to Highlights tab
    fireEvent.click(screen.getByText("Highlights (1)"));
    expect(screen.getByText("current")).toBeInTheDocument();

    // Switch to Annotations tab
    fireEvent.click(screen.getByText("Annotations (1)"));
    expect(screen.getByText("Comparing current node")).toBeInTheDocument();
  });
});
