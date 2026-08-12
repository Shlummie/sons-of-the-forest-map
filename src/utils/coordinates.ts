import type { NormalizedCoordinate } from "../types/map";

export const WORLD_MIN = -2000;
export const WORLD_MAX = 2000;
export const WORLD_SPAN = WORLD_MAX - WORLD_MIN;
export const SURFACE_BOUNDS: [[number, number], [number, number]] = [
  [WORLD_MIN, WORLD_MIN],
  [WORLD_MAX, WORLD_MAX],
];

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizedToWorld(coordinate: NormalizedCoordinate): NormalizedCoordinate {
  return {
    x: WORLD_MIN + clamp(coordinate.x) * WORLD_SPAN,
    y: WORLD_MIN + clamp(coordinate.y) * WORLD_SPAN,
  };
}

export function worldToNormalized(coordinate: NormalizedCoordinate): NormalizedCoordinate {
  return {
    x: clamp((coordinate.x - WORLD_MIN) / WORLD_SPAN),
    y: clamp((coordinate.y - WORLD_MIN) / WORLD_SPAN),
  };
}

export function formatCoordinate(coordinate: NormalizedCoordinate): string {
  return `[${coordinate.x.toFixed(2)}, ${coordinate.y.toFixed(2)}]`;
}
