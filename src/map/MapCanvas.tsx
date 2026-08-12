import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import type { CursorCoordinates, MapLocationSummary, NormalizedCoordinate } from "../types/map";
import { SURFACE_BOUNDS, normalizedToWorld, worldToNormalized } from "../utils/coordinates";
import { clusterIcon, markerIcon } from "./markerIcons";

interface MapCanvasProps {
  locations: MapLocationSummary[];
  selectedId: string | null;
  mapContextId: string;
  editorEnabled: boolean;
  gridEnabled: boolean;
  resetViewToken: number;
  onSelect: (id: string) => void;
  onCoordinateChange: (id: string, coordinate: NormalizedCoordinate) => void;
  onEditorPoint: (coordinate: NormalizedCoordinate) => void;
}

function createGridLayer(): L.GridLayer {
  const grid = L.gridLayer({ tileSize: 256, opacity: 0.65, zIndex: 2, minZoom: -3, maxZoom: 4, noWrap: true });
  (grid as unknown as { createTile: () => HTMLElement }).createTile = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      context.strokeStyle = "rgba(194, 225, 190, 0.22)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, 0.5);
      context.lineTo(256, 0.5);
      context.moveTo(0.5, 0);
      context.lineTo(0.5, 256);
      context.stroke();
    }
    return canvas;
  };
  return grid;
}

export function MapCanvas({
  locations,
  selectedId,
  mapContextId,
  editorEnabled,
  gridEnabled,
  resetViewToken,
  onSelect,
  onCoordinateChange,
  onEditorPoint,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.MarkerClusterGroup | null>(null);
  const baseLayerRef = useRef<L.Layer | null>(null);
  const gridLayerRef = useRef<L.GridLayer | null>(null);
  const contextLabelRef = useRef<L.Control | null>(null);
  const editorEnabledRef = useRef(editorEnabled);
  const onSelectRef = useRef(onSelect);
  const onCoordinateChangeRef = useRef(onCoordinateChange);
  const onEditorPointRef = useRef(onEditorPoint);
  const [cursor, setCursor] = useState<CursorCoordinates | null>(null);

  editorEnabledRef.current = editorEnabled;
  onSelectRef.current = onSelect;
  onCoordinateChangeRef.current = onCoordinateChange;
  onEditorPointRef.current = onEditorPoint;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 4,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 100,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [[-2600, -2600], [2600, 2600]],
      maxBoundsViscosity: 0.8,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.fitBounds(SURFACE_BOUNDS);

    const handleMouseMove = (event: L.LeafletMouseEvent) => {
      const world = { x: event.latlng.lng, y: event.latlng.lat };
      setCursor({ normalized: worldToNormalized(world), raw: world });
    };
    const handleMouseOut = () => setCursor(null);
    const handleClick = (event: L.LeafletMouseEvent) => {
      if (editorEnabledRef.current) onEditorPointRef.current(worldToNormalized({ x: event.latlng.lng, y: event.latlng.lat }));
    };

    map.on("mousemove", handleMouseMove);
    map.on("mouseout", handleMouseOut);
    map.on("click", handleClick);
    mapRef.current = map;

    const resize = () => map.invalidateSize();
    window.addEventListener("resize", resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    baseLayerRef.current?.remove();
    baseLayerRef.current = null;
    gridLayerRef.current?.remove();
    gridLayerRef.current = null;
    contextLabelRef.current?.remove();
    contextLabelRef.current = null;

    if (mapContextId === "surface") {
      baseLayerRef.current = L.imageOverlay("/map/example-map.svg", SURFACE_BOUNDS, { opacity: 0.94, interactive: false }).addTo(map);
    } else {
      baseLayerRef.current = L.rectangle(SURFACE_BOUNDS, { color: "#7f9a84", weight: 1, fillColor: "#0b1712", fillOpacity: 0.96 }).addTo(map);
      const ContextLabel = L.Control.extend({
        onAdd: () => {
        const node = L.DomUtil.create("div", "interior-map-label");
        node.textContent = mapContextId === "cave-interior" ? "CAVE INTERIOR COORDINATE SPACE" : "BUNKER INTERIOR COORDINATE SPACE";
        return node;
        },
      });
      contextLabelRef.current = new ContextLabel({ position: "topright" }).addTo(map);
    }
    if (gridEnabled || mapContextId !== "surface") gridLayerRef.current = createGridLayer().addTo(map);
    map.fitBounds(SURFACE_BOUNDS);
    setTimeout(() => map.invalidateSize(), 80);
  }, [gridEnabled, mapContextId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(SURFACE_BOUNDS);
  }, [resetViewToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!markerLayerRef.current || !map.hasLayer(markerLayerRef.current)) {
      markerLayerRef.current?.clearLayers();
      markerLayerRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        chunkInterval: 40,
        chunkDelay: 20,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        maxClusterRadius: 46,
        iconCreateFunction: clusterIcon,
      });
      markerLayerRef.current.addTo(map);
    } else {
      markerLayerRef.current.clearLayers();
    }

    for (const location of locations) {
      const world = normalizedToWorld(location.coordinates);
      const marker = L.marker([world.y, world.x], {
        icon: markerIcon(location, location.id === selectedId),
        title: location.name,
        alt: location.name,
        keyboard: true,
        draggable: editorEnabled,
      });
      marker.bindTooltip(location.name, { direction: "top", sticky: true, opacity: 0.96 });
      marker.on("click", () => onSelectRef.current(location.id));
      marker.on("keydown", (event) => {
        if (event.originalEvent.key === "Enter" || event.originalEvent.key === " ") onSelectRef.current(location.id);
      });
      if (editorEnabled) {
        marker.on("dragend", () => {
          const position = marker.getLatLng();
          onCoordinateChangeRef.current(location.id, worldToNormalized({ x: position.lng, y: position.lat }));
        });
      }
      markerLayerRef.current.addLayer(marker);
    }
  }, [editorEnabled, locations, selectedId]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const location = locations.find((item) => item.id === selectedId);
    if (!location) return;
    const world = normalizedToWorld(location.coordinates);
    mapRef.current.flyTo([world.y, world.x], Math.max(mapRef.current.getZoom(), 0.25), { duration: 0.45 });
  }, [locations, selectedId]);

  return (
    <div className="map-canvas-wrap">
      <div ref={containerRef} className="map-canvas" aria-label="Interactive Sons of the Forest map" role="application" />
      <div className="map-coordinate-readout" aria-live="polite">
        {cursor ? `World [${cursor.raw.x.toFixed(1)}, ${cursor.raw.y.toFixed(1)}] · Normalized [${cursor.normalized.x.toFixed(3)}, ${cursor.normalized.y.toFixed(3)}]` : "Move over the map for coordinates"}
      </div>
      {editorEnabled && <div className="editor-hint">Editor enabled · click to inspect · drag markers to revise coordinates</div>}
    </div>
  );
}
