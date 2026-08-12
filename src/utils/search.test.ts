import { describe, expect, it } from "vitest";
import { matchesSearch } from "./search";
import type { MapLocation } from "../types/map";

const location: MapLocation = {
  id: "test-shovel",
  name: "Shovel",
  aliases: ["Digging tool"],
  category: "equipment",
  mapContextId: "cave-interior",
  coordinates: { x: 0.3, y: 0.4 },
  coordinatePrecision: "exact",
  environment: "cave",
  description: "A shovel location.",
  requirements: ["Rebreather", "Rope Gun"],
  confidence: "high",
  sourceIds: ["test"],
};

describe("location search", () => {
  it("matches aliases and requirements", () => {
    expect(matchesSearch(location, "digging tool")).toBe(true);
    expect(matchesSearch(location, "rope gun")).toBe(true);
    expect(matchesSearch(location, "not here")).toBe(false);
  });
});
