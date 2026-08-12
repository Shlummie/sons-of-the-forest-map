import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DATA_URL = "https://raw.githubusercontent.com/lmachens/sons-of-the-forest-map/main/src/lib/locations.json";
const OUTPUT = resolve("src/data/locations.json");
const SPLIT_OUTPUT = resolve("src/data/locations");
const WORLD_MIN = -2000;
const WORLD_SPAN = 4000;
const PATCH = "Patch 16 Hotfix 2 (January 2025 snapshot)";

const categoryLabels = {
  navigation: "navigation and landmark",
  water: "water feature",
  transport: "transport location",
  equipment: "equipment location",
  story: "story or collectible location",
  resources: "resource or loot location",
  npc: "camp or NPC gameplay location",
  cave: "cave location",
  bunker: "bunker location",
  other: "source-listed location",
};

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function normalize(value) {
  return clamp((value - WORLD_MIN) / WORLD_SPAN);
}

function cleanText(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function mapCategory(type = "") {
  const value = type.toLowerCase();
  if (value.includes("bunker") || value === "final-bunker" || value === "bunker-hatch") return "bunker";
  if (value.includes("cave")) return "cave";
  if (["pond", "lake", "waterfall"].includes(value)) return "water";
  if (["hang-glider", "golf-cart", "unicycle"].includes(value)) return "transport";
  if (["village", "abandoned-camp-y", "abandoned-camp-n", "fishing-hut"].includes(value)) return "npc";
  if (["grave", "spawnpoint", "spawnPoint", "helicopter", "poi"].includes(type) || value === "poi") return "navigation";
  if (["document", "document-bunker", "document-cave", "email", "email-bunker", "email-cave", "book", "book-bunker", "pamphlet", "laptop-bunker", "laptop-cave", "blueprint", "blueprint-cave", "artifact-a", "artifact-b", "artifact-c", "artifact-d", "artifact-e", "action-camera", "action-camera-bunker", "radio", "cross"].includes(value)) return "story";
  if (["modernaxe", "flashlight", "machete", "pistol", "stun-gun", "rebreather", "rope-gun", "shovel", "shotgun", "rifle", "firefighter-axe", "crossbow", "chainsaw", "compound-bow", "katana", "golden-armor", "binoculars", "printer", "putter", "keycard", "pistol-rail", "pistol-rail-bunker", "shotgun-rail", "shotgun-rail-bunker", "flashlight-attachment-cave", "flashlight-attachment-bunker", "laser-attachment", "suppressor", "suppressor-bunker", "night-vision", "stun-baton"].includes(value)) return "equipment";
  if (["pond", "herb", "large-battery", "solar-panel", "air-canister", "cooking-pot", "cooking-pot-bunker", "wooden-crate", "utility-crate", "utility-case", "dark-green-suitcase", "orange-suitcase", "supply"].some((part) => value.includes(part))) return "resources";
  return "other";
}

function environmentFor(record, category) {
  if (record.inBunker || record.type.includes("bunker")) return "bunker";
  if (record.inCave || record.type.includes("cave")) return "cave";
  if (category === "water") return "underwater";
  return "surface";
}

function dangerFor(record, category) {
  if (record.type === "final-bunker") return 5;
  if (category === "bunker") return 4;
  if (category === "cave") return 4;
  if (category === "npc" && record.type.includes("village")) return 4;
  if (category === "npc") return 3;
  if (category === "navigation" || category === "water") return 2;
  return 3;
}

function precisionFor(record, category) {
  if (["water", "npc"].includes(category) || record.type === "herb") return "area";
  return record.wiki ? "exact" : "approximate";
}

function spawnTypeFor(record, category) {
  if (["water", "npc"].includes(category) || record.type === "herb") return "area";
  if (["pond", "herb", "fishing-hut"].includes(record.type)) return "renewable";
  if (record.x === undefined || record.y === undefined) return "unknown";
  return "fixed";
}

function resolveTitles(ids, byId) {
  if (!Array.isArray(ids)) return undefined;
  const values = ids.map((id) => cleanText(byId.get(String(id))?.title)).filter(Boolean);
  return [...new Set(values)].slice(0, 12);
}

function aliasFor(title) {
  const aliases = [];
  if (/^Bunker/i.test(title)) aliases.push(title.replace(/^Bunker/i, "Bunker "));
  if (/^Maintenance [ABC]$/i.test(title)) aliases.push(`Maintenance Bunker ${title.slice(-1)}`);
  if (title === "Compact Pistol") aliases.push("Pistol");
  if (title === "Ancient Armor") aliases.push("Golden Armor");
  return [...new Set(aliases.filter((alias) => alias !== title))];
}

const response = await fetch(DATA_URL);
if (!response.ok) throw new Error(`Unable to fetch research data: ${response.status}`);
const raw = await response.json();
const byId = new Map(raw.map((record) => [String(record.id), record]));
const omitted = raw
  .filter((record) => !Number.isFinite(record.x) || !Number.isFinite(record.y))
  .map((record) => ({ id: String(record.id), title: cleanText(record.title), type: record.type, reason: "missing finite world x/y" }));

const locations = raw
  .filter((record) => Number.isFinite(record.x) && Number.isFinite(record.y))
  .map((record) => {
    const category = mapCategory(record.type);
    const environment = environmentFor(record, category);
    const mapContextId = record.inBunker ? "bunker-interior" : record.inCave ? "cave-interior" : "surface";
    const normalized = { x: normalize(record.x), y: normalize(record.y) };
    const name = cleanText(record.title) || `${categoryLabels[category]} ${record.id}`;
    const description = cleanText(record.description) || `Source-listed ${categoryLabels[category]}.`;
    const notes = [
      cleanText(record.warning),
      `Source marker type: ${record.type}.`,
      mapContextId !== "surface" ? "This coordinate belongs to a separate interior coordinate context and must not be read as a surface GPS position." : "",
      precisionFor(record, category) === "area" ? "Area marker: do not treat this point as an exact spawn." : "",
    ].filter(Boolean).join(" ");
    const sourceIds = ["open-map-repo", "wiki-locations"];
    if (record.wiki) sourceIds.push("wiki-map");
    return {
      id: `sotf-${record.id}`,
      name,
      aliases: aliasFor(name),
      category,
      subcategory: record.type,
      mapContextId,
      coordinates: normalized,
      rawCoordinates: { x: record.x, y: record.y },
      coordinatePrecision: precisionFor(record, category),
      environment,
      description,
      contains: resolveTitles(record.items, byId),
      requirements: resolveTitles(record.requirements, byId),
      storyStage: category === "bunker" && record.type === "final-bunker" ? "Endgame" : undefined,
      dangerLevel: dangerFor(record, category),
      spawnType: spawnTypeFor(record, category),
      respawns: ["pond", "herb", "fishing-hut"].includes(record.type) ? true : undefined,
      versionVerified: PATCH,
      confidence: record.wiki && record.title && !record.inCave && !record.inBunker ? "high" : record.wiki ? "medium" : "low",
      sourceIds: [...new Set(sourceIds)],
      coordinateCandidates: [{ coordinates: normalized, sourceIds: ["open-map-repo"], notes: "Normalized from the source project's world x/y coordinate." }],
      notes,
      sourceType: record.type,
    };
  });

locations.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
const index = locations.map((location) => ({
  id: location.id,
  name: location.name,
  aliases: location.aliases,
  category: location.category,
  subcategory: location.subcategory,
  mapContextId: location.mapContextId,
  coordinates: location.coordinates,
  coordinatePrecision: location.coordinatePrecision,
  environment: location.environment,
  dangerLevel: location.dangerLevel,
  spawnType: location.spawnType,
  confidence: location.confidence,
}));
await mkdir(dirname(OUTPUT), { recursive: true });
await mkdir(SPLIT_OUTPUT, { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(locations, null, 2)}\n`, "utf8");
await writeFile(resolve("src/data/locations-index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
await writeFile(resolve("src/data/import-summary.json"), `${JSON.stringify({ sourceUrl: DATA_URL, generatedAt: new Date().toISOString(), rawRecords: raw.length, normalizedRecords: locations.length, omittedRecords: omitted }, null, 2)}\n`, "utf8");
for (const [category, records] of Object.entries(Object.groupBy(locations, (location) => location.category))) {
  await writeFile(resolve(SPLIT_OUTPUT, `${category}.json`), `${JSON.stringify(records, null, 2)}\n`, "utf8");
}
for (const environment of ["surface", "cave", "bunker", "underwater", "other"]) {
  await writeFile(resolve(SPLIT_OUTPUT, `${environment}.json`), `${JSON.stringify(locations.filter((location) => location.environment === environment), null, 2)}\n`, "utf8");
}
console.log(`Wrote ${locations.length} normalized locations and a compact marker index.`);
