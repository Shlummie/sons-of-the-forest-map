import type { CategoryDefinition } from "../types/map";

interface LegendProps {
  categories: CategoryDefinition[];
  counts: Record<string, number>;
}

export function Legend({ categories, counts }: LegendProps) {
  return (
    <section className="map-legend" aria-label="Map legend">
      <div className="legend-heading"><strong>Legend</strong><span>{categories.length} categories</span></div>
      <div className="legend-list">
        {categories.map((category) => <div className="legend-row" key={category.id}><span className="legend-glyph" style={{ backgroundColor: category.color }}>{category.glyph}</span><span>{category.label}</span><span className="count-badge">{(counts[category.id] ?? 0).toLocaleString()}</span></div>)}
      </div>
    </section>
  );
}
