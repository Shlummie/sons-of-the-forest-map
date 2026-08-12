import type { ProgressState } from "../types/map";

const STORAGE_KEY = "sotf-map:progress:v1";

const DEFAULT_PROGRESS: ProgressState = {
  favorites: [],
  discovered: [],
  coordinateOverrides: {},
  verificationFlags: [],
  highContrast: false,
};

export function readProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      discovered: Array.isArray(parsed.discovered) ? parsed.discovered : [],
      verificationFlags: Array.isArray(parsed.verificationFlags) ? parsed.verificationFlags : [],
      coordinateOverrides: parsed.coordinateOverrides && typeof parsed.coordinateOverrides === "object" ? parsed.coordinateOverrides : {},
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function writeProgress(progress: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Private browsing or storage-disabled environments should still render the map.
  }
}
