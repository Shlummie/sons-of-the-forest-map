import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import rawLocationIndex from "./data/locations-index.json";
import { CATEGORIES } from "./data/categories";
import { MAP_CONTEXTS } from "./data/mapContexts";
import type { Confidence, Environment, MapLocation, MapLocationSummary } from "./types/map";
import { matchesSearch } from "./utils/search";
import { normalizedToWorld } from "./utils/coordinates";
import { useMapProgress } from "./hooks/useMapProgress";
import { FilterSidebar, type FilterStateView } from "./components/FilterSidebar";
import { Toolbar } from "./components/Toolbar";
import { MapCanvas } from "./map/MapCanvas";
import { Legend } from "./components/Legend";
import { DetailPanel } from "./components/DetailPanel";
import "./styles.css";

const locations = rawLocationIndex as MapLocationSummary[];
const allEnvironments: Environment[] = ["surface", "cave", "bunker", "underwater", "other"];
const allConfidences: Confidence[] = ["high", "medium", "low"];

interface FilterState extends FilterStateView {}

function initialFilters(): FilterState {
  return {
    query: "",
    enabledCategories: new Set(CATEGORIES.map((category) => category.id)),
    showFavorites: false,
    showUndiscovered: false,
    fixedOnly: false,
    environments: new Set(allEnvironments),
    dangerLevels: new Set([1, 2, 3, 4, 5]),
    confidences: new Set(allConfidences),
  };
}

export default function App() {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [contextId, setContextId] = useState("surface");
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const id = new URLSearchParams(window.location.search).get("location");
    return id && locations.some((location) => location.id === id) ? id : null;
  });
  const [filtersOpen, setFiltersOpen] = useState(() => !window.matchMedia("(max-width: 900px)").matches);
  const [legendOpen, setLegendOpen] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [resetViewToken, setResetViewToken] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editorPoint, setEditorPoint] = useState<{ x: number; y: number } | null>(null);
  const [fullLocations, setFullLocations] = useState<MapLocation[] | null>(null);
  const { progress, toggleListValue, setCoordinateOverride, toggleVerificationFlag, setHighContrast } = useMapProgress();
  const editorEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_COORDINATE_EDITOR === "true";

  useEffect(() => {
    if (!selectedId && !filters.query.trim()) return;
    let cancelled = false;
    import("./data/locations.json").then(({ default: records }) => {
      if (cancelled) return;
      setFullLocations(records as MapLocation[]);
    });
    return () => { cancelled = true; };
  }, [filters.query, selectedId]);

  useEffect(() => {
    document.body.classList.toggle("high-contrast", progress.highContrast);
  }, [progress.highContrast]);

  useEffect(() => {
    const handleFullscreen = () => setIsFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  useEffect(() => {
    const timeout = notice ? window.setTimeout(() => setNotice(null), 2600) : undefined;
    return () => { if (timeout) window.clearTimeout(timeout); };
  }, [notice]);

  const displayedLocations = useMemo(() => (fullLocations ?? locations).map((location) => {
    const override = progress.coordinateOverrides[location.id];
    return override ? { ...location, coordinates: override } : location;
  }), [fullLocations, progress.coordinateOverrides]);

  const matchesFilters = useCallback((location: MapLocation | MapLocationSummary, ignoreCategory = false) => {
    if (!ignoreCategory && !filters.enabledCategories.has(location.category)) return false;
    if (location.mapContextId !== contextId) return false;
    if (!matchesSearch(location, filters.query)) return false;
    if (!filters.environments.has(location.environment)) return false;
    if (location.dangerLevel && !filters.dangerLevels.has(location.dangerLevel)) return false;
    if (!filters.confidences.has(location.confidence)) return false;
    if (filters.fixedOnly && location.spawnType !== "fixed") return false;
    if (filters.showFavorites && !progress.favorites.includes(location.id)) return false;
    if (filters.showUndiscovered && progress.discovered.includes(location.id)) return false;
    return true;
  }, [contextId, filters, progress.discovered, progress.favorites]);

  const visibleLocations = useMemo(() => displayedLocations.filter((location) => matchesFilters(location)), [displayedLocations, matchesFilters]);
  const categoryCounts = useMemo(() => Object.fromEntries(CATEGORIES.map((category) => [category.id, displayedLocations.filter((location) => location.category === category.id && matchesFilters(location, true)).length])), [displayedLocations, matchesFilters]);
  const selectedSummary = displayedLocations.find((location) => location.id === selectedId) ?? null;
  const selectedRecord = fullLocations?.find((location) => location.id === selectedId);
  const selectedLocation = selectedSummary ? (selectedRecord ? { ...selectedRecord, ...selectedSummary } : {
    ...selectedSummary,
    description: "Loading the full source record…",
    environment: selectedSummary.environment,
    confidence: selectedSummary.confidence,
    sourceIds: [],
  } as MapLocation) : null;
  const currentContext = MAP_CONTEXTS.find((context) => context.id === contextId);

  const updateUrl = (id: string | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("location", id); else url.searchParams.delete("location");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const selectLocation = (id: string) => { setSelectedId(id); updateUrl(id); };
  const closeDetails = () => { setSelectedId(null); updateUrl(null); };
  const copyCoordinates = async () => {
    if (!selectedLocation) return;
    const coordinates = normalizedToWorld(selectedLocation.coordinates);
    const text = `[${coordinates.x.toFixed(2)}, ${coordinates.y.toFixed(2)}]`;
    try { await navigator.clipboard.writeText(text); setNotice("Coordinates copied"); } catch { setNotice(text); }
  };
  const exportCoordinateJson = async (coordinates: { x: number; y: number }) => {
    if (!selectedLocation) return;
    const payload = JSON.stringify({
      id: selectedLocation.id,
      name: selectedLocation.name,
      mapContextId: selectedLocation.mapContextId,
      normalizedCoordinates: coordinates,
      worldCoordinates: normalizedToWorld(coordinates),
      coordinatePrecision: selectedLocation.coordinatePrecision,
      sourceIds: selectedLocation.sourceIds,
    }, null, 2);
    try { await navigator.clipboard.writeText(payload); setNotice("Candidate JSON copied"); } catch { setNotice(payload); }
  };
  const shareLocation = async () => {
    if (!selectedLocation) return;
    const url = new URL(window.location.href);
    url.searchParams.set("location", selectedLocation.id);
    try {
      if (navigator.share) await navigator.share({ title: selectedLocation.name, text: selectedLocation.description, url: url.toString() });
      else { await navigator.clipboard.writeText(url.toString()); setNotice("Share link copied"); }
    } catch {
      setNotice("Share cancelled");
    }
  };
  const toggleSet = <T,>(key: "environments" | "dangerLevels" | "confidences", value: T) => setFilters((current) => { const next = new Set(current[key] as Set<T>); if (next.has(value)) next.delete(value); else next.add(value); return { ...current, [key]: next }; });
  const resetFilters = () => setFilters(initialFilters());
  const toggleGroup = (group: string) => setFilters((current) => { const ids = CATEGORIES.filter((category) => category.group === group).map((category) => category.id); const allEnabled = ids.every((id) => current.enabledCategories.has(id)); const next = new Set(current.enabledCategories); ids.forEach((id) => allEnabled ? next.delete(id) : next.add(id)); return { ...current, enabledCategories: next }; });
  const toggleCategory = (id: string) => setFilters((current) => { const next = new Set(current.enabledCategories); if (next.has(id)) next.delete(id); else next.add(id); return { ...current, enabledCategories: next }; });
  const toggleBoolean = (key: "showFavorites" | "showUndiscovered" | "fixedOnly") => setFilters((current) => ({ ...current, [key]: !current[key] }));
  const toggleFullscreen = async () => { if (!shellRef.current) return; if (document.fullscreenElement) await document.exitFullscreen(); else await shellRef.current.requestFullscreen(); };

  return (
    <div className="app-shell" ref={shellRef}>
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark" aria-hidden="true">✦</div><div><p className="eyebrow">Unofficial field guide</p><h1>Sons of the Forest <span>MAP</span></h1></div></div>
        <div className="topbar-meta"><span className="dataset-count">{locations.length.toLocaleString()} source records</span><span className="offline-pill">● Offline ready</span></div>
      </header>
      <div className="workspace">
        <FilterSidebar open={filtersOpen} categories={CATEGORIES} counts={categoryCounts} totalVisible={visibleLocations.length} filters={filters} onClose={() => setFiltersOpen(false)} onQueryChange={(query) => setFilters((current) => ({ ...current, query }))} onToggleCategory={toggleCategory} onToggleGroup={toggleGroup} onToggleBoolean={toggleBoolean} onToggleEnvironment={(value) => toggleSet("environments", value)} onToggleDanger={(value) => toggleSet("dangerLevels", value)} onToggleConfidence={(value) => toggleSet("confidences", value)} onSelectAll={() => setFilters((current) => ({ ...current, enabledCategories: new Set(CATEGORIES.map((category) => category.id)) }))} onClearAll={() => setFilters((current) => ({ ...current, enabledCategories: new Set() }))} onReset={resetFilters} />
        <main className="map-column">
          <Toolbar mapContextId={contextId} onContextChange={(id) => { setContextId(id); setSelectedId(null); updateUrl(null); }} onToggleFilters={() => setFiltersOpen((open) => !open)} onResetView={() => setResetViewToken((token) => token + 1)} onToggleGrid={() => setGridEnabled((enabled) => !enabled)} onToggleLegend={() => setLegendOpen((open) => !open)} onToggleContrast={() => setHighContrast(!progress.highContrast)} onFullscreen={toggleFullscreen} gridEnabled={gridEnabled} legendOpen={legendOpen} highContrast={progress.highContrast} editorEnabled={editorEnabled} isFullscreen={isFullscreen} cursor={null} />
          <div className="map-stage">
            <MapCanvas locations={visibleLocations} selectedId={selectedId} mapContextId={contextId} editorEnabled={editorEnabled} gridEnabled={gridEnabled} resetViewToken={resetViewToken} onSelect={selectLocation} onCoordinateChange={setCoordinateOverride} onEditorPoint={setEditorPoint} />
            {legendOpen && <Legend categories={CATEGORIES} counts={categoryCounts} />}
            <div className="context-caption"><strong>{currentContext?.label}</strong><span>{currentContext?.description}</span></div>
            {editorEnabled && editorPoint && <div className="editor-point-popover"><strong>Editor point</strong><code>[{editorPoint.x.toFixed(4)}, {editorPoint.y.toFixed(4)}]</code><button type="button" onClick={() => setEditorPoint(null)}>Dismiss</button></div>}
          </div>
        </main>
        <DetailPanel location={selectedLocation} favorite={selectedLocation ? progress.favorites.includes(selectedLocation.id) : false} discovered={selectedLocation ? progress.discovered.includes(selectedLocation.id) : false} flagged={selectedLocation ? progress.verificationFlags.includes(selectedLocation.id) : false} editorEnabled={editorEnabled} onClose={closeDetails} onToggleFavorite={() => selectedLocation && toggleListValue("favorites", selectedLocation.id)} onToggleDiscovered={() => selectedLocation && toggleListValue("discovered", selectedLocation.id)} onCopyCoordinates={copyCoordinates} onExportCoordinateJson={exportCoordinateJson} onShare={shareLocation} onApplyCoordinate={(coordinate) => selectedLocation && setCoordinateOverride(selectedLocation.id, coordinate)} onFlag={() => selectedLocation && toggleVerificationFlag(selectedLocation.id)} />
      </div>
      <footer className="statusbar"><span>{visibleLocations.length.toLocaleString()} visible in {currentContext?.label.toLowerCase()}</span><span>Data snapshot: v1.0 / Patch 16 Hotfix 2</span><a href="./sources.html">Sources & methodology</a></footer>
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}
