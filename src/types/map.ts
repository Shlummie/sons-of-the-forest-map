export type Environment = "surface" | "cave" | "bunker" | "underwater" | "other";
export type Confidence = "high" | "medium" | "low";
export type CoordinatePrecision = "exact" | "approximate" | "area";
export type SpawnType = "fixed" | "area" | "random" | "renewable" | "unknown";

export interface NormalizedCoordinate {
  x: number;
  y: number;
}

export interface CoordinateCandidate {
  coordinates: NormalizedCoordinate;
  sourceIds: string[];
  notes?: string;
}

export interface MapLocation {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  subcategory?: string;
  mapContextId: string;
  coordinates: NormalizedCoordinate;
  rawCoordinates?: NormalizedCoordinate;
  coordinatePrecision: CoordinatePrecision;
  geometry?: { type: "polygon"; points: NormalizedCoordinate[] };
  environment: Environment;
  description: string;
  contains?: string[];
  requirements?: string[];
  storyStage?: string;
  dangerLevel?: 1 | 2 | 3 | 4 | 5;
  spawnType?: SpawnType;
  respawns?: boolean | "unknown";
  versionVerified?: string;
  confidence: Confidence;
  sourceIds: string[];
  coordinateCandidates?: CoordinateCandidate[];
  notes?: string;
  sourceType?: string;
  searchText?: string;
}

export type MapLocationSummary = Pick<
  MapLocation,
  | "id"
  | "name"
  | "aliases"
  | "category"
  | "subcategory"
  | "mapContextId"
  | "coordinates"
  | "coordinatePrecision"
  | "environment"
  | "dangerLevel"
  | "spawnType"
  | "confidence"
> & Partial<Pick<MapLocation, "description" | "contains" | "requirements" | "storyStage" | "notes" | "sourceIds" | "coordinateCandidates">>;

export interface MapSource {
  id: string;
  title: string;
  url: string;
  kind: "official" | "wiki" | "community-map" | "repository" | "guide";
  accessed: string;
  informationUsed: string;
  reliability: string;
  concerns: string;
}

export interface CategoryDefinition {
  id: string;
  group: string;
  label: string;
  color: string;
  glyph: string;
  description: string;
  defaultVisible: boolean;
}

export interface MapContext {
  id: string;
  label: string;
  environment: Environment;
  description: string;
  hasSurfaceImage: boolean;
  warning?: string;
}

export interface CursorCoordinates {
  normalized: NormalizedCoordinate;
  raw: NormalizedCoordinate;
}

export interface ProgressState {
  favorites: string[];
  discovered: string[];
  coordinateOverrides: Record<string, NormalizedCoordinate>;
  verificationFlags: string[];
  highContrast: boolean;
}
