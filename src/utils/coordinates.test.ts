import { describe, expect, it } from "vitest";
import { normalizedToWorld, worldToNormalized } from "./coordinates";

describe("coordinate normalization", () => {
  it("round-trips the normalized world bounds", () => {
    expect(worldToNormalized(normalizedToWorld({ x: 0, y: 0 }))).toEqual({ x: 0, y: 0 });
    expect(worldToNormalized(normalizedToWorld({ x: 0.25, y: 0.75 }))).toEqual({ x: 0.25, y: 0.75 });
    expect(worldToNormalized(normalizedToWorld({ x: 1, y: 1 }))).toEqual({ x: 1, y: 1 });
  });
});
