import type { CategoryDefinition, Confidence, Environment } from "../types/map";

export interface FilterStateView {
  query: string;
  enabledCategories: Set<string>;
  showFavorites: boolean;
  showUndiscovered: boolean;
  fixedOnly: boolean;
  environments: Set<Environment>;
  dangerLevels: Set<number>;
  confidences: Set<Confidence>;
}

interface FilterSidebarProps {
  open: boolean;
  categories: CategoryDefinition[];
  counts: Record<string, number>;
  totalVisible: number;
  filters: FilterStateView;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onToggleCategory: (id: string) => void;
  onToggleGroup: (group: string) => void;
  onToggleBoolean: (key: "showFavorites" | "showUndiscovered" | "fixedOnly") => void;
  onToggleEnvironment: (value: Environment) => void;
  onToggleDanger: (value: number) => void;
  onToggleConfidence: (value: Confidence) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onReset: () => void;
}

const environments: Environment[] = ["surface", "cave", "bunker", "underwater", "other"];
const confidences: Confidence[] = ["high", "medium", "low"];

export function FilterSidebar({
  open,
  categories,
  counts,
  totalVisible,
  filters,
  onClose,
  onQueryChange,
  onToggleCategory,
  onToggleGroup,
  onToggleBoolean,
  onToggleEnvironment,
  onToggleDanger,
  onToggleConfidence,
  onSelectAll,
  onClearAll,
  onReset,
}: FilterSidebarProps) {
  const groups = [...new Set(categories.map((category) => category.group))];
  return (
    <aside className={`filter-sidebar${open ? " is-open" : ""}`} aria-label="Map filters">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Marker filters</p>
          <h2>Explore the island</h2>
        </div>
        <button className="icon-button mobile-only" type="button" onClick={onClose} aria-label="Close filters">×</button>
      </div>

      <label className="search-field">
        <span className="sr-only">Search locations</span>
        <span aria-hidden="true">⌕</span>
        <input value={filters.query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search names, items, aliases…" />
        {filters.query && <button type="button" onClick={() => onQueryChange("")} aria-label="Clear search">×</button>}
      </label>

      <div className="filter-actions">
        <button type="button" onClick={onSelectAll}>Select all</button>
        <button type="button" onClick={onClearAll}>Clear all</button>
        <button type="button" onClick={onReset}>Reset</button>
      </div>
      <p className="filter-result-count"><strong>{totalVisible.toLocaleString()}</strong> visible records</p>

      <div className="filter-groups">
        {groups.map((group) => {
          const groupCategories = categories.filter((category) => category.group === group);
          const enabledCount = groupCategories.filter((category) => filters.enabledCategories.has(category.id)).length;
          return (
            <section key={group} className="filter-group">
              <label className="group-toggle">
                <input type="checkbox" checked={enabledCount === groupCategories.length} ref={(element) => { if (element) element.indeterminate = enabledCount > 0 && enabledCount < groupCategories.length; }} onChange={() => onToggleGroup(group)} />
                <span>{group}</span>
                <span className="count-badge">{groupCategories.reduce((sum, category) => sum + (counts[category.id] ?? 0), 0).toLocaleString()}</span>
              </label>
              <div className="category-list">
                {groupCategories.map((category) => (
                  <label className="category-toggle" key={category.id}>
                    <input type="checkbox" checked={filters.enabledCategories.has(category.id)} onChange={() => onToggleCategory(category.id)} />
                    <span className="category-swatch" style={{ backgroundColor: category.color }} aria-hidden="true">{category.glyph}</span>
                    <span>{category.label}</span>
                    <span className="count-badge">{(counts[category.id] ?? 0).toLocaleString()}</span>
                  </label>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <details className="advanced-filters" open>
        <summary>Progress & confidence</summary>
        <div className="advanced-content">
          <label className="check-row"><input type="checkbox" checked={filters.showFavorites} onChange={() => onToggleBoolean("showFavorites")} /> Favorites only</label>
          <label className="check-row"><input type="checkbox" checked={filters.showUndiscovered} onChange={() => onToggleBoolean("showUndiscovered")} /> Undiscovered only</label>
          <label className="check-row"><input type="checkbox" checked={filters.fixedOnly} onChange={() => onToggleBoolean("fixedOnly")} /> Fixed spawns only</label>
          <fieldset>
            <legend>Environment</legend>
            {environments.map((environment) => <label className="check-row" key={environment}><input type="checkbox" checked={filters.environments.has(environment)} onChange={() => onToggleEnvironment(environment)} /> {environment}</label>)}
          </fieldset>
          <fieldset>
            <legend>Confidence</legend>
            {confidences.map((confidence) => <label className="check-row" key={confidence}><input type="checkbox" checked={filters.confidences.has(confidence)} onChange={() => onToggleConfidence(confidence)} /> {confidence}</label>)}
          </fieldset>
          <fieldset>
            <legend>Danger level</legend>
            <div className="danger-options">{[1, 2, 3, 4, 5].map((danger) => <label className="check-row" key={danger}><input type="checkbox" checked={filters.dangerLevels.has(danger)} onChange={() => onToggleDanger(danger)} /> {danger}</label>)}</div>
          </fieldset>
        </div>
      </details>
    </aside>
  );
}
