import type { MapLocation, MapLocationSummary } from "../types/map";

export function searchableText(location: MapLocation | MapLocationSummary): string {
  if ("searchText" in location && location.searchText) return location.searchText;
  return [
    location.name,
    ...location.aliases,
    location.category,
    location.subcategory,
    location.description,
    ...(location.contains ?? []),
    ...(location.requirements ?? []),
    location.storyStage,
    location.notes,
    "sourceType" in location ? location.sourceType : undefined,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

export function matchesSearch(location: MapLocation | MapLocationSummary, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  return normalized.length === 0 || searchableText(location).includes(normalized);
}
