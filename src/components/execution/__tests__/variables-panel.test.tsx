import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VariablesPanel } from "../variables-panel";
import type { VariableDiff } from "@/core/synchronization/types";

describe("VariablesPanel Component", () => {
  it("renders variables and their values", () => {
    render(<VariablesPanel variables={{ low: 0, high: 9 }} />);

    expect(screen.getByText("low")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("shows change indicator badge when variable diff indicates change", () => {
    const diffs: Record<string, VariableDiff> = {
      low: {
        key: "low",
        previousValue: 0,
        currentValue: 5,
        hasChanged: true,
        isNew: false,
      },
    };

    render(<VariablesPanel variables={{ low: 5 }} variableDiffs={diffs} />);

    expect(screen.getByText("updated")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
