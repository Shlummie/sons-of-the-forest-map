import type { CursorCoordinates } from "../types/map";

interface ToolbarProps {
  mapContextId: string;
  onContextChange: (id: string) => void;
  onToggleFilters: () => void;
  onResetView: () => void;
  onToggleGrid: () => void;
  onToggleLegend: () => void;
  onToggleContrast: () => void;
  onFullscreen: () => void;
  gridEnabled: boolean;
  legendOpen: boolean;
  highContrast: boolean;
  editorEnabled: boolean;
  isFullscreen: boolean;
  cursor: CursorCoordinates | null;
}

const contexts = [
  ["surface", "Surface"],
  ["cave-interior", "Cave interiors"],
  ["bunker-interior", "Bunker interiors"],
] as const;

export function Toolbar({
  mapContextId,
  onContextChange,
  onToggleFilters,
  onResetView,
  onToggleGrid,
  onToggleLegend,
  onToggleContrast,
  onFullscreen,
  gridEnabled,
  legendOpen,
  highContrast,
  editorEnabled,
  isFullscreen,
}: ToolbarProps) {
  return (
    <div className="map-toolbar">
      <div className="toolbar-contexts" role="tablist" aria-label="Map context">
        {contexts.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={mapContextId === id} className={mapContextId === id ? "is-active" : ""} onClick={() => onContextChange(id)}>{label}</button>)}
      </div>
      <div className="toolbar-actions">
        <button className="toolbar-button mobile-filter-button" type="button" onClick={onToggleFilters}>☷ <span>Filters</span></button>
        <button className="toolbar-button" type="button" onClick={onResetView} data-tooltip="Reset map view">⌂ <span className="toolbar-label">Reset</span></button>
        <button className={`toolbar-button${gridEnabled ? " is-active" : ""}`} type="button" aria-pressed={gridEnabled} onClick={onToggleGrid}>▦ <span className="toolbar-label">Grid</span></button>
        <button className={`toolbar-button${legendOpen ? " is-active" : ""}`} type="button" aria-pressed={legendOpen} onClick={onToggleLegend}>◈ <span className="toolbar-label">Legend</span></button>
        <button className={`toolbar-button${highContrast ? " is-active" : ""}`} type="button" aria-pressed={highContrast} onClick={onToggleContrast}>◐ <span className="toolbar-label">Contrast</span></button>
        <button className="toolbar-button" type="button" onClick={onFullscreen}>{isFullscreen ? "⤢" : "⛶"} <span className="toolbar-label">{isFullscreen ? "Exit" : "Full"}</span></button>
      </div>
      {editorEnabled && <span className="editor-badge" title="Coordinate editor enabled">EDITOR</span>}
    </div>
  );
}
