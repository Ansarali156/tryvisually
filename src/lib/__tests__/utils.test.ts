import { describe, it, expect } from "vitest";
import { cn, formatTime } from "../utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("px-2", "py-1")).toBe("px-2 py-1");
    });

    it("handles conditional classes and falsy values", () => {
      expect(cn("base", false && "ignored", undefined, null, "active")).toBe(
        "base active"
      );
    });

    it("resolves Tailwind class conflicts in favor of the later class", () => {
      expect(cn("px-2 text-red-500", "px-4 text-blue-500")).toBe(
        "px-4 text-blue-500"
      );
    });
  });

  describe("formatTime", () => {
    it("formats milliseconds to seconds with two decimal places", () => {
      expect(formatTime(1500)).toBe("1.50s");
      expect(formatTime(250)).toBe("0.25s");
      expect(formatTime(0)).toBe("0.00s");
    });
  });
});
