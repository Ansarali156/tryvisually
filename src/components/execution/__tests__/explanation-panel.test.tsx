import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ExplanationPanel } from "../explanation-panel";

describe("ExplanationPanel Component", () => {
  it("renders explanation text, operation, and code line pointer", () => {
    render(
      <ExplanationPanel
        explanation="Compare the middle element with the target."
        operation="compare"
        codeLine={6}
        stepIndex={2}
        totalSteps={5}
      />
    );

    expect(
      screen.getByText("Compare the middle element with the target.")
    ).toBeInTheDocument();
    expect(screen.getByText("compare")).toBeInTheDocument();
    expect(screen.getByText("Line #6")).toBeInTheDocument();
    expect(screen.getByText("Step 3/5")).toBeInTheDocument();
  });
});
