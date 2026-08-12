import L from "leaflet";
import type { MapLocationSummary } from "../types/map";
import { CATEGORY_BY_ID } from "../data/categories";

export function markerIcon(location: MapLocationSummary, selected: boolean): L.DivIcon {
  const category = CATEGORY_BY_ID.get(location.category);
  const glyph = category?.glyph ?? "?";
  const color = category?.color ?? "#aab4b0";
  return L.divIcon({
    className: "sotf-marker-host",
    html: `<span class="sotf-marker${selected ? " is-selected" : ""}" style="--marker-color:${color}" aria-hidden="true">${glyph}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    tooltipAnchor: [0, -15],
  });
}

export function clusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count > 99 ? "large" : count > 9 ? "medium" : "small";
  return L.divIcon({
    className: "sotf-cluster-host",
    html: `<span class="sotf-cluster sotf-cluster-${size}">${count}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}
