import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const data = JSON.parse(await readFile(resolve("src/data/locations.json"), "utf8"));
const errors = [];
const warnings = [];
const ids = new Set();
const coordinateBuckets = new Map();
const required = ["id", "name", "category", "mapContextId", "coordinates", "environment", "description", "confidence", "sourceIds"];

for (const location of data) {
  for (const field of required) if (location[field] === undefined || location[field] === null || location[field] === "") errors.push(`${location.id ?? "unknown"}: missing ${field}`);
  if (ids.has(location.id)) errors.push(`duplicate id: ${location.id}`);
  ids.add(location.id);
  if (!location.coordinates || location.coordinates.x < 0 || location.coordinates.x > 1 || location.coordinates.y < 0 || location.coordinates.y > 1) errors.push(`${location.id}: normalized coordinate outside [0,1]`);
  if (!Array.isArray(location.sourceIds) || location.sourceIds.length === 0) errors.push(`${location.id}: no source references`);
  const bucket = `${Math.round(location.coordinates.x * 1000)}:${Math.round(location.coordinates.y * 1000)}:${location.mapContextId}`;
  coordinateBuckets.set(bucket, (coordinateBuckets.get(bucket) ?? 0) + 1);
}

for (const [bucket, count] of coordinateBuckets) if (count > 4) warnings.push(`${bucket}: ${count} records share a close coordinate; review whether they represent one site.`);

const counts = Object.groupBy(data, (location) => location.category);
const confidence = Object.groupBy(data, (location) => location.confidence);
console.log(JSON.stringify({ total: data.length, categories: Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, value.length])), confidence: Object.fromEntries(Object.entries(confidence).map(([key, value]) => [key, value.length])), warnings: warnings.length }, null, 2));
if (warnings.length) console.warn(warnings.slice(0, 20).join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
