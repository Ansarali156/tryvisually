import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  Alert,
  EmptyState,
  LoadingState,
  ErrorState,
} from "../feedback";

describe("Component Library - Feedback", () => {
  it("renders Alert with title and handles close", () => {
    const handleClose = vi.fn();
    render(
      <Alert title="Success Alert" variant="success" onClose={handleClose}>
        Operation completed successfully.
      </Alert>
    );

    expect(screen.getByText("Success Alert")).toBeInTheDocument();
    expect(
      screen.getByText("Operation completed successfully.")
    ).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /close alert/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders EmptyState with action button", () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No algorithms found"
        description="Try adjusting your search query."
        actionText="Clear Filters"
        onAction={handleAction}
      />
    );

    expect(screen.getByText("No algorithms found")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search query.")
    ).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: /clear filters/i });
    fireEvent.click(btn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("renders LoadingState with message", () => {
    render(<LoadingState message="Processing trace..." />);
    expect(screen.getByText("Processing trace...")).toBeInTheDocument();
  });

  it("renders ErrorState with retry button", () => {
    const handleRetry = vi.fn();
    render(
      <ErrorState
        title="Execution Error"
        message="Failed to compute step trace."
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText("Execution Error")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to compute step trace.")
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
