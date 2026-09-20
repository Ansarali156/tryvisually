import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  TopicCard,
  AlgorithmCard,
  FeatureCard,
  DifficultyBadge,
} from "../cards";
import { DATA_STRUCTURES_CATALOG, ALGORITHMS_CATALOG } from "@/config/dsa";
import { Eye } from "lucide-react";

describe("Component Library - Cards & Badges", () => {
  it("renders TopicCard with data structure info and complexity bounds", () => {
    const topic = DATA_STRUCTURES_CATALOG[0]; // Arrays
    render(<TopicCard topic={topic} />);

    expect(screen.getByText("Arrays")).toBeInTheDocument();
    expect(screen.getByText(topic.description)).toBeInTheDocument();
    expect(screen.getByText("Access")).toBeInTheDocument();
    expect(screen.getByText(topic.accessTime)).toBeInTheDocument();
  });

  it("renders AlgorithmCard with category and time complexity", () => {
    const algorithm = ALGORITHMS_CATALOG[1]; // Binary Search
    render(<AlgorithmCard algorithm={algorithm} />);

    expect(screen.getByText("Binary Search")).toBeInTheDocument();
    expect(screen.getByText(algorithm.description)).toBeInTheDocument();
    expect(screen.getByText(algorithm.timeComplexity)).toBeInTheDocument();
    expect(screen.getByText("Searching")).toBeInTheDocument();
  });

  it("renders FeatureCard with icon and text", () => {
    render(
      <FeatureCard
        title="Interactive Practice"
        description="Experiment with your own inputs and trace outputs."
        icon={Eye}
      />
    );

    expect(screen.getByText("Interactive Practice")).toBeInTheDocument();
    expect(
      screen.getByText("Experiment with your own inputs and trace outputs.")
    ).toBeInTheDocument();
  });

  it("renders DifficultyBadge for different tiers", () => {
    const { rerender } = render(<DifficultyBadge difficulty="Easy" />);
    expect(screen.getByText("Easy")).toBeInTheDocument();

    rerender(<DifficultyBadge difficulty="Hard" />);
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });
});
