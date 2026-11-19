# NeuroAtlas

**WIC Team 2.** An interactive atlas of how neurodegenerative diseases move through the brain, built as a step toward a machine learning project on brain imaging.

Pick a disease and scrub through its stages: the regions it reaches light up on a scan-style view of the brain, like a PET heat map. Click any region to see what it does and when each disease reaches it.

> Educational project. Not medical advice and not a diagnostic tool.

## What it covers

| Disease | Protein | Staging scheme the atlas follows |
|---|---|---|
| Alzheimer's | Tau, amyloid-β | Braak neurofibrillary stages (1991) |
| Parkinson's | α-synuclein | Braak α-synuclein stages (2003) |
| ALS | TDP-43 | Brettschneider pTDP-43 stages (2013) |
| Huntington's | Mutant huntingtin | Vonsattel striatal grades (1985) plus imaging |

Full citations and the atlas's simplifications are on the in-app **Methods** page.

## Roadmap

1. **Atlas** (built): scan viewer, 15 regions, four disease layers with stage playback.
2. **MRI classifier** (planned): a model trained on structural MRI to tell Alzheimer's from healthy controls, with Grad-CAM heatmaps mapped back onto atlas regions. Wrapped in an MLOps pipeline: versioned data, tracked experiments, CI, and a FastAPI inference endpoint.
3. **Connectome** (planned): cell-type prediction on FlyWire wiring data with a graph neural network.

The navbar already has placeholder pages for the planned modules.

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # type-check and build into dist/
npm run preview    # serve the production build
npm run lint       # type-check only
```

## Project structure

```
src/
├── App.tsx                  # routes, boot sequence, background
├── index.css                # theme: colors, fonts, scanline and grain effects
├── data/
│   ├── regions.ts           # region names, functions, and SVG shapes
│   └── diseases.ts          # staging sequences and heat colormap
├── components/
│   ├── ScanViewport.tsx     # the brain scan view
│   ├── Controls.tsx         # disease picker, stage slider, legend
│   ├── Panels.tsx           # region and disease info panels
│   ├── Navbar.tsx
│   └── Hud.tsx              # shared HUD pieces: panels, headings, grid, boot
└── pages/
    ├── AtlasPage.tsx
    └── OtherPages.tsx       # methods, plus classifier and connectome placeholders
```

To add a region, add an entry to `REGIONS` in `src/data/regions.ts`. To change how a disease spreads, edit its `stages` in `src/data/diseases.ts`. Both drive the whole UI.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS 4, Motion, lucide-react. Routing uses `HashRouter`, so the build works on GitHub Pages with no extra config.

## Deploying to GitHub Pages

```bash
npm run build
rm -rf docs && mv dist docs && touch docs/.nojekyll
git add docs && git commit -m "Deploy" && git push
```

Then in the repo's **Settings → Pages**, serve from the `main` branch, `/docs` folder.

## Contributing

1. Pull first: `git pull`
2. Branch off `main`: `git checkout -b your-name/feature`
3. Commit, push, and open a pull request for review.

## Known limitations

- The brain is a hand-drawn schematic, not real imaging data. Deep structures are projected onto the surface view so they can be clicked; they aren't in their true positions.
- Each staging scheme is simplified to three or four steps. Colors show order of spread, not measured severity, and real patients vary.
