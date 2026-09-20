import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DangerButton,
  IconButton,
} from "../buttons";

describe("Component Library - Buttons", () => {
  it("renders PrimaryButton and handles clicks", () => {
    const handleClick = vi.fn();
    render(<PrimaryButton onClick={handleClick}>Start</PrimaryButton>);
    const button = screen.getByRole("button", { name: /start/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders SecondaryButton with appropriate styles", () => {
    render(<SecondaryButton>Secondary</SecondaryButton>);
    const button = screen.getByRole("button", { name: /secondary/i });
    expect(button).toBeInTheDocument();
  });

  it("renders DangerButton and disables when isLoading is true", () => {
    render(<DangerButton isLoading>Delete</DangerButton>);
    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toBeDisabled();
  });

  it("renders GhostButton", () => {
    render(<GhostButton>Ghost</GhostButton>);
    expect(screen.getByRole("button", { name: /ghost/i })).toBeInTheDocument();
  });

  it("renders IconButton with required aria-label", () => {
    const handleAction = vi.fn();
    render(
      <IconButton aria-label="Close dialog" onClick={handleAction}>
        <span>×</span>
      </IconButton>
    );
    const button = screen.getByRole("button", { name: /close dialog/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
