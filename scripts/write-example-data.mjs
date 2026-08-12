import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const locations = [
  {
    id: "example-lookout",
    name: "Example Lookout",
    aliases: ["Demo Landmark"],
    category: "navigation",
    mapContextId: "surface",
    coordinates: { x: 0.24, y: 0.31 },
    coordinatePrecision: "area",
    environment: "surface",
    description: "Fictional marker included only to demonstrate landmarks, filtering, and detail panels.",
    dangerLevel: 1,
    spawnType: "fixed",
    confidence: "high",
    sourceIds: ["synthetic-example"],
    notes: "Synthetic example; not a real game location."
  },
  {
    id: "example-cave-entrance",
    name: "Example Cave Entrance",
    aliases: [],
    category: "cave",
    mapContextId: "surface",
    coordinates: { x: 0.56, y: 0.46 },
    coordinatePrecision: "area",
    environment: "surface",
    description: "Fictional surface entrance used to exercise underground categories and warnings.",
    dangerLevel: 3,
    spawnType: "fixed",
    confidence: "high",
    sourceIds: ["synthetic-example"],
    notes: "Synthetic example; not a real game location."
  },
  {
    id: "example-supply-cache",
    name: "Example Supply Cache",
    aliases: ["Demo Cache"],
    category: "resources",
    mapContextId: "surface",
    coordinates: { x: 0.73, y: 0.68 },
    coordinatePrecision: "area",
    environment: "surface",
    description: "Fictional resource marker used to demonstrate progress and search behavior.",
    dangerLevel: 2,
    spawnType: "renewable",
    respawns: true,
    confidence: "high",
    sourceIds: ["synthetic-example"],
    notes: "Synthetic example; not a real game location."
  }
];

const index = locations.map(({ description, sourceIds, notes, ...summary }) => summary);
const sliceNames = [
  "bunker", "cave", "equipment", "navigation", "npc", "other",
  "resources", "story", "surface", "transport", "underwater", "water"
];

await mkdir(resolve("src/data/locations"), { recursive: true });
await writeFile(resolve("src/data/locations.json"), `${JSON.stringify(locations, null, 2)}\n`, "utf8");
await writeFile(resolve("src/data/locations-index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
await writeFile(
  resolve("src/data/import-summary.json"),
  `${JSON.stringify({
    sourceUrl: null,
    generatedAt: null,
    rawRecords: locations.length,
    normalizedRecords: locations.length,
    omittedRecords: [],
    note: "Synthetic demonstration data; no game coordinates are bundled."
  }, null, 2)}\n`,
  "utf8"
);

for (const name of sliceNames) {
  const records = locations.filter(
    (location) => location.category === name || location.environment === name
  );
  await writeFile(
    resolve("src/data/locations", `${name}.json`),
    `${JSON.stringify(records, null, 2)}\n`,
    "utf8"
  );
}

console.log(`Wrote ${locations.length} synthetic example locations.`);
