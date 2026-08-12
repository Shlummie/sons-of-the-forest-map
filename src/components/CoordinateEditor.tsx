import { useEffect, useState } from "react";
import type { MapLocation, NormalizedCoordinate } from "../types/map";
import { formatCoordinate } from "../utils/coordinates";

interface CoordinateEditorProps {
  location: MapLocation;
  flagged: boolean;
  onApply: (coordinate: NormalizedCoordinate) => void;
  onExport: (coordinate: NormalizedCoordinate) => void;
  onFlag: () => void;
}

export function CoordinateEditor({ location, flagged, onApply, onExport, onFlag }: CoordinateEditorProps) {
  const [candidate, setCandidate] = useState(location.coordinates);
  const { x, y } = location.coordinates;
  useEffect(() => setCandidate({ x, y }), [location.id, x, y]);
  const setValue = (key: "x" | "y", value: string) => setCandidate((current) => ({ ...current, [key]: Number(value) }));
  const clampedCandidate = { x: Math.min(1, Math.max(0, candidate.x)), y: Math.min(1, Math.max(0, candidate.y)) };
  return (
    <section className="editor-card" aria-label="Coordinate editor">
      <div className="editor-card-heading"><strong>Coordinate editor</strong><span className="editor-badge">DEV</span></div>
      <p className="muted">Drag the marker or revise its normalized position. Current: <code>{formatCoordinate(location.coordinates)}</code></p>
      <div className="coordinate-inputs">
        <label>X<input type="number" min="0" max="1" step="0.0001" value={candidate.x} onChange={(event) => setValue("x", event.target.value)} /></label>
        <label>Y<input type="number" min="0" max="1" step="0.0001" value={candidate.y} onChange={(event) => setValue("y", event.target.value)} /></label>
      </div>
      <div className="editor-actions"><button type="button" onClick={() => onApply(clampedCandidate)}>Apply candidate</button><button type="button" onClick={() => onExport(clampedCandidate)}>Copy JSON</button><button type="button" className={flagged ? "is-active" : ""} onClick={onFlag}>{flagged ? "Flagged" : "Needs verification"}</button></div>
    </section>
  );
}
