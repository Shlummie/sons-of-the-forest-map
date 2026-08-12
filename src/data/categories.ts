import type { CategoryDefinition } from "../types/map";

export const CATEGORIES: CategoryDefinition[] = [
  { id: "navigation", group: "Navigation & landmarks", label: "Navigation & landmarks", color: "#b8d47b", glyph: "N", description: "Crash sites, landmarks, graves, villages, and points of interest.", defaultVisible: true },
  { id: "water", group: "Navigation & landmarks", label: "Water features", color: "#72c6d4", glyph: "W", description: "Lakes, ponds, waterfalls, and fishing locations.", defaultVisible: true },
  { id: "transport", group: "Navigation & landmarks", label: "Transport", color: "#ddb66a", glyph: "T", description: "Hang gliders, Knight V vehicles, golf carts, and related locations.", defaultVisible: true },
  { id: "equipment", group: "Equipment & weapons", label: "Equipment & weapons", color: "#e2a16c", glyph: "E", description: "Tools, weapons, armor, attachments, and permanent equipment.", defaultVisible: true },
  { id: "story", group: "Story & collectibles", label: "Story & collectibles", color: "#d6b2e7", glyph: "S", description: "Documents, emails, books, laptops, blueprints, and artifacts.", defaultVisible: true },
  { id: "resources", group: "Resources", label: "Resources & loot", color: "#9cd29b", glyph: "R", description: "Cases, crates, supplies, batteries, resin, and renewable pickups.", defaultVisible: true },
  { id: "npc", group: "NPCs & gameplay", label: "Camps & NPC gameplay", color: "#ee8f8f", glyph: "C", description: "Cannibal villages, camps, fishing huts, and gameplay areas.", defaultVisible: true },
  { id: "cave", group: "Underground", label: "Caves", color: "#8da7df", glyph: "C", description: "Cave entrances and internal cave points.", defaultVisible: true },
  { id: "bunker", group: "Underground", label: "Bunkers", color: "#b79ad8", glyph: "B", description: "Maintenance, residential, food, luxury, and final bunkers.", defaultVisible: true },
  { id: "other", group: "Other", label: "Other / review", color: "#aab4b0", glyph: "?", description: "Records that need further category review.", defaultVisible: true },
];

export const CATEGORY_BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]));

export const CATEGORY_GROUPS = [...new Set(CATEGORIES.map((category) => category.group))];
