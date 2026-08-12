# Data methodology

## Public baseline

The committed dataset is synthetic. `npm run example-data` writes three fictional locations, a compact index, derived category/environment slices, and an import summary. These records exist only to verify application behavior.

Every canonical record contains a stable ID, name/aliases, category, map context, normalized coordinate, precision, environment, description, confidence, and source IDs. Optional fields cover danger, contents, requirements, spawn behavior, alternative coordinates, and notes.

## Optional upstream import

`npm run research-data` fetches a community JSON dataset and converts it to the local schema. Running that command is an explicit research action. Before publishing its output:

1. verify the upstream URL and current license;
2. inspect whether individual fields or linked assets came from other sources;
3. remove images, copied prose, or records that are not authorized for redistribution;
4. update access dates and game-version context;
5. review coordinate and category diffs manually;
6. run validation and source-specific checks;
7. label community information as unofficial and potentially patch-dependent.

## Coordinate contract

The optional importer assumes a source-world range of `[-2000, 2000]` on both axes and normalizes it to `[0, 1]`:

```text
normalized = clamp((world + 2000) / 4000)
```

Leaflet uses `CRS.Simple`; the renderer converts normalized coordinates to its image bounds and supplies `[y, x]`. Interior cave/bunker records occupy separate contexts and must not be treated as surface GPS positions.

## Confidence and precision

`coordinatePrecision` describes whether a marker is exact, approximate, or an area. `confidence` describes evidence quality, not gameplay danger. Community records should not be upgraded to high confidence solely because they are precise-looking numbers.

Random/renewable/resource areas must be represented as areas where appropriate. A point marker should never imply a guaranteed spawn when the evidence only supports a region.
