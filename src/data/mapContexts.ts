import type { MapContext } from "../types/map";

export const MAP_CONTEXTS: MapContext[] = [
  {
    id: "surface",
    label: "Surface island",
    environment: "surface",
    description: "The normalized surface-world map and coastline.",
    hasSurfaceImage: true,
  },
  {
    id: "cave-interior",
    label: "Cave interiors",
    environment: "cave",
    description: "Separate coordinate space for source records marked inside caves.",
    hasSurfaceImage: false,
    warning: "Interior coordinates are not surface-map coordinates. Use the linked cave entrance and route notes as the navigation reference.",
  },
  {
    id: "bunker-interior",
    label: "Bunker interiors",
    environment: "bunker",
    description: "Separate coordinate space for source records marked inside bunkers.",
    hasSurfaceImage: false,
    warning: "Interior coordinates are not surface-map coordinates. Do not use them as GPS positions on the island.",
  },
];

export const MAP_CONTEXT_BY_ID = new Map(MAP_CONTEXTS.map((context) => [context.id, context]));
