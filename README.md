# Sons of the Forest Map Framework

An unofficial, static React/Leaflet framework for building an offline-friendly map with search, filters, marker clustering, progress tracking, confidence labels, source links, and a development coordinate editor.

The public repository intentionally ships with an original fictional basemap and three synthetic records. It does **not** redistribute the game's island map, screenshots, icons, or a copied bulk location dataset.

## Quick start

Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

The local app demonstrates the complete data/UI path with fictional markers. Build and verification commands:

```bash
npm run typecheck
npm run lint
npm test
npm run validate-data
npm run build
npm run test:e2e
```

## Architecture

```text
normalized JSON records -> search/filter/progress state -> Leaflet markers
original SVG basemap ----------------------------------> CRS.Simple overlay
localStorage <------------------------------------------ favorites, discovery, overrides
```

There is no runtime backend or tile server. The production service worker precaches the application shell, example data, and original map assets.

## Data workflow

`npm run example-data` regenerates the three fictional records and all derived slices. `src/data/locations.json` is canonical; `locations-index.json`, category/environment slices, and `import-summary.json` are generated representations.

An optional research command exists:

```bash
npm run research-data
```

It downloads and normalizes community records from `lmachens/sons-of-the-forest-map`. The upstream repository identifies itself as MIT licensed, but coordinates, descriptive facts, linked media, and game-derived content can carry separate rights or factual-quality concerns. Review the [upstream repository](https://github.com/lmachens/sons-of-the-forest-map), its current license, every imported field, and any downstream distribution plan before running or committing the result. Imported output is not part of this public baseline.

The normalization contract maps a documented source-world range of `[-2000, 2000]` to `[0, 1]`; see `DATA_METHODOLOGY.md`.

## Coordinate editor

The editor is enabled in development. Dragged positions and verification flags live in browser storage and do not rewrite canonical JSON. To expose it in a production-mode development build, set `VITE_ENABLE_COORDINATE_EDITOR=true` before starting Vite.

## Offline and privacy behavior

Once installed/built, the example app needs no account, analytics service, map server, or API. Progress and overrides are stored in localStorage. Exported data can reveal a user's play progress and custom coordinates.

## Trademark and content notice

This is an unofficial fan-development framework, unaffiliated with Endnight Games or the game's publishers. Game names and marks belong to their owners. The placeholder map is intentionally not the game's geography and the example markers are not directions.

## License

Original source is MIT licensed. Original public assets are CC0; see `ASSET_LICENSES.md`. Optional imported material remains subject to its own provenance and license review.
