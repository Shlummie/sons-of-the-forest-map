import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const data = JSON.parse(await readFile(resolve("src/data/locations.json"), "utf8"));
const importSummary = JSON.parse(await readFile(resolve("src/data/import-summary.json"), "utf8"));
const groups = (values) => Object.fromEntries(Object.entries(Object.groupBy(values, (value) => value)).map(([key, list]) => [key, list.length]));
const categoryCounts = groups(data.map((location) => location.category));
const confidenceCounts = groups(data.map((location) => location.confidence));
const unresolved = data.filter((location) => location.confidence === "low" || location.notes?.includes("review"));

const coordinateBuckets = new Map();
for (const location of data) {
  const bucket = `${Math.round(location.coordinates.x * 1000)}:${Math.round(location.coordinates.y * 1000)}:${location.mapContextId}`;
  const records = coordinateBuckets.get(bucket) ?? [];
  records.push(location);
  coordinateBuckets.set(bucket, records);
}

const duplicateWarnings = [...coordinateBuckets.entries()]
  .filter(([, records]) => records.length > 4)
  .map(([bucket, records]) => ({ bucket, records }));
const unresolvedCoordinates = data.filter((location) => location.coordinatePrecision !== "exact" || location.confidence === "low");
const requiredFields = ["id", "name", "category", "mapContextId", "coordinates", "environment", "description", "confidence", "sourceIds"];
const audit = {
  uniqueIds: new Set(data.map((location) => location.id)).size === data.length,
  requiredFields: data.every((location) => requiredFields.every((field) => location[field] !== undefined && location[field] !== null && location[field] !== "")),
  sourceReferences: data.every((location) => Array.isArray(location.sourceIds) && location.sourceIds.length > 0),
  normalizedBounds: data.every((location) => location.coordinates.x >= 0 && location.coordinates.x <= 1 && location.coordinates.y >= 0 && location.coordinates.y <= 1),
};

const auditLines = Object.entries(audit).map(([name, passed]) => `- ${passed ? "PASS" : "FAIL"}: ${name}`).join("\n");
const duplicateLines = duplicateWarnings.map(({ bucket, records }) => `- ${bucket}: ${records.length} records - ${records.map((location) => `${location.id} (${location.name})`).join(", ")}`).join("\n") || "No suspicious duplicate-coordinate buckets exceeded the review threshold.";
const omittedLines = importSummary.omittedRecords.map((record) => `- ${record.id}: ${record.title || "Untitled"} (${record.type || "unknown"}) - ${record.reason}`).join("\n") || "No source records were omitted for missing coordinates.";
const unresolvedCoordinateLines = unresolvedCoordinates.slice(0, 100).map((location) => `- ${location.id} - ${location.name} (${location.coordinatePrecision}, ${location.mapContextId})`).join("\n") || "No unresolved or area coordinates.";
const lowConfidenceLines = unresolved.slice(0, 100).map((location) => `- ${location.id} - ${location.name} (${location.mapContextId})`).join("\n") || "No low-confidence records.";

const report = `# Verification report

Generated: ${new Date().toISOString()}

## Dataset totals

- Source records fetched: ${importSummary.rawRecords}
- Total normalized records: ${data.length}
- Omitted source records: ${importSummary.omittedRecords.length}
- High confidence: ${confidenceCounts.high ?? 0}
- Medium confidence: ${confidenceCounts.medium ?? 0}
- Low confidence: ${confidenceCounts.low ?? 0}

## Records by category

${Object.entries(categoryCounts).map(([category, count]) => `- ${category}: ${count}`).join("\n")}

## Omitted source records

${omittedLines}

## Unresolved or area coordinates

${unresolvedCoordinateLines}

## Duplicate-coordinate warnings

${duplicateLines}

## Final audit results

${auditLines}

## Low-confidence review queue

${lowConfidenceLines}
`;

await writeFile(resolve("VERIFICATION_REPORT.md"), report, "utf8");

const unresolvedReport = `# Unresolved locations

Generated from the current research snapshot. Records remain visible when a credible source exists, but unresolved, approximate, area, and low-confidence entries are labeled rather than presented as exact gameplay guarantees.

- Source records omitted for missing coordinates: ${importSummary.omittedRecords.length}
- Unresolved or area coordinate records: ${unresolvedCoordinates.length}
- Low-confidence review records: ${unresolved.length}
- Suspicious duplicate-coordinate buckets: ${duplicateWarnings.length}

See [VERIFICATION_REPORT.md](./VERIFICATION_REPORT.md) for the complete lists and final audit results.
`;
await writeFile(resolve("UNRESOLVED_LOCATIONS.md"), unresolvedReport, "utf8");
console.log(`Wrote ${unresolved.length} low-confidence records to VERIFICATION_REPORT.md and refreshed UNRESOLVED_LOCATIONS.md`);
