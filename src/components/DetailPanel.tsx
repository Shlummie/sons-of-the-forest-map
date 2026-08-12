import type { MapLocation } from "../types/map";
import { CATEGORY_BY_ID } from "../data/categories";
import { MAP_CONTEXT_BY_ID } from "../data/mapContexts";
import { SOURCE_BY_ID } from "../data/sources";
import { normalizedToWorld } from "../utils/coordinates";
import { CoordinateEditor } from "./CoordinateEditor";

interface DetailPanelProps {
  location: MapLocation | null;
  favorite: boolean;
  discovered: boolean;
  flagged: boolean;
  editorEnabled: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onToggleDiscovered: () => void;
  onCopyCoordinates: () => void;
  onExportCoordinateJson: (coordinate: { x: number; y: number }) => void;
  onShare: () => void;
  onApplyCoordinate: (coordinate: { x: number; y: number }) => void;
  onFlag: () => void;
}

export function DetailPanel({
  location,
  favorite,
  discovered,
  flagged,
  editorEnabled,
  onClose,
  onToggleFavorite,
  onToggleDiscovered,
  onCopyCoordinates,
  onExportCoordinateJson,
  onShare,
  onApplyCoordinate,
  onFlag,
}: DetailPanelProps) {
  if (!location) return <aside className="detail-panel empty-detail"><p className="eyebrow">Location details</p><h2>Select a marker</h2><p className="muted">Click a marker or search result to inspect its requirements, contents, confidence, and sources.</p></aside>;
  const category = CATEGORY_BY_ID.get(location.category);
  const context = MAP_CONTEXT_BY_ID.get(location.mapContextId);
  const world = normalizedToWorld(location.coordinates);
  return (
    <aside className="detail-panel" aria-label="Location details">
      <div className="detail-header">
        <div><p className="eyebrow">{category?.label ?? location.category}</p><h2>{location.name}</h2><p className="detail-subtitle">{location.subcategory ?? location.environment}</p></div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close location details">×</button>
      </div>
      <div className="detail-actions"><button type="button" className={favorite ? "is-active" : ""} onClick={onToggleFavorite}>{favorite ? "★ Favorited" : "☆ Favorite"}</button><button type="button" className={discovered ? "is-active" : ""} onClick={onToggleDiscovered}>{discovered ? "✓ Discovered" : "Mark discovered"}</button></div>
      <p className="detail-description">{location.description}</p>
      {context?.warning && <div className="warning-callout">{context.warning}</div>}
      <dl className="detail-facts">
        <div><dt>Environment</dt><dd>{location.environment}</dd></div>
        <div><dt>Coordinates</dt><dd><code>[{world.x.toFixed(2)}, {world.y.toFixed(2)}]</code><small>world x/y · normalized [{location.coordinates.x.toFixed(4)}, {location.coordinates.y.toFixed(4)}]</small></dd></div>
        <div><dt>Precision</dt><dd>{location.coordinatePrecision}</dd></div>
        {location.dangerLevel && <div><dt>Danger guide</dt><dd>{"●".repeat(location.dangerLevel)}<small>editorial guide rating</small></dd></div>}
        {location.spawnType && <div><dt>Spawn</dt><dd>{location.spawnType}</dd></div>}
        {location.respawns !== undefined && <div><dt>Respawns</dt><dd>{String(location.respawns)}</dd></div>}
        <div><dt>Confidence</dt><dd><span className={`confidence confidence-${location.confidence}`}>{location.confidence}</span></dd></div>
        {location.versionVerified && <div><dt>Verified for</dt><dd>{location.versionVerified}</dd></div>}
        {location.storyStage && <div><dt>Story stage</dt><dd>{location.storyStage}</dd></div>}
      </dl>
      {location.contains?.length ? <section className="detail-section"><h3>Found here</h3><div className="tag-list">{location.contains.map((item) => <span className="detail-tag" key={item}>{item}</span>)}</div></section> : null}
      {location.requirements?.length ? <section className="detail-section"><h3>Requirements</h3><div className="tag-list">{location.requirements.map((item) => <span className="detail-tag" key={item}>{item}</span>)}</div></section> : null}
      {location.notes && <section className="detail-section"><h3>Notes</h3><p className="muted">{location.notes}</p></section>}
      <div className="detail-actions secondary-actions"><button type="button" onClick={onCopyCoordinates}>Copy coordinates</button><button type="button" onClick={onShare}>Share location</button></div>
      <section className="detail-section"><h3>Sources</h3><ul className="source-list">{location.sourceIds.map((id) => { const source = SOURCE_BY_ID.get(id); return source ? <li key={id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li> : <li key={id}>{id}</li>; })}</ul></section>
      {editorEnabled && <CoordinateEditor location={location} flagged={flagged} onApply={onApplyCoordinate} onExport={onExportCoordinateJson} onFlag={onFlag} />}
    </aside>
  );
}
