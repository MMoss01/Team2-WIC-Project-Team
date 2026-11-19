# NeuroAtlas

**WIC Team 2.** An interactive atlas of how neurodegenerative diseases move through the brain, built as a step toward a machine learning project on brain imaging.

Pick a disease and scrub through its stages: the regions it reaches light up like a PET heat map, on either a rotatable 3D brain or a 2D scan view. Click any region to see what it does and when each disease reaches it.

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

1. **Atlas** (built): a rotatable, clickable 3D brain plus a 2D scan view, 15 regions, four disease layers with stage playback.
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

## The 3D brain model

The model lives at `public/models/brain.glb` and is committed, so you only need to regenerate it if you change the regions. It's built by `scripts/build_brain_mesh.py` from FreeSurfer's `fsaverage` average brain:

- **Cortex:** the `fsaverage5` pial surface, split into lobes using the Desikan-Killiany labels.
- **Deep structures:** FreeSurfer's subcortical segmentation (`aseg`), turned into surfaces with marching cubes.
- **Markers:** the substantia nigra and olfactory bulb aren't in these atlases, so they're small ellipsoids at approximate positions.

This follows [Brainder's approach](https://brainder.org/2012/05/08/importing-freesurfer-cortical-meshes-into-blender/) to getting FreeSurfer meshes into Blender, but writes glTF directly from Python. You can still open `brain.glb` in Blender to inspect or tweak it.

To rebuild (Python 3.10 or newer):

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r scripts/requirements.txt
python scripts/build_brain_mesh.py
```

Each mesh is named `<RegionId>_<lh|rh|mid>`, matching `src/data/regions.ts`. The viewer strips the suffix to find the region, so a new mesh becomes clickable as soon as its name matches a region ID.

## Project structure

```
src/
├── App.tsx                  # routes, boot sequence, background
├── index.css                # theme: colors, fonts, scanline and grain effects
├── data/
│   ├── regions.ts           # region names, functions, and SVG shapes
│   └── diseases.ts          # staging sequences and heat colormap
├── components/
│   ├── Brain3D.tsx          # rotatable 3D brain (react-three-fiber)
│   ├── ScanViewport.tsx     # 2D scan view
│   ├── Controls.tsx         # disease picker, stage slider, legend
│   ├── Panels.tsx           # region and disease info panels
│   ├── Navbar.tsx
│   └── Hud.tsx              # shared HUD pieces: panels, headings, grid, boot
└── pages/
    ├── AtlasPage.tsx
    └── OtherPages.tsx       # methods, plus classifier and connectome placeholders
public/models/brain.glb      # generated 3D brain
scripts/build_brain_mesh.py  # builds brain.glb from FreeSurfer data
```

To add a region, add an entry to `REGIONS` in `src/data/regions.ts`. To change how a disease spreads, edit its `stages` in `src/data/diseases.ts`. Both drive the whole UI.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS 4, Motion, lucide-react, and three.js via react-three-fiber for the 3D view. Routing uses `HashRouter`, so the build works on GitHub Pages with no extra config.

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

- The 3D brain is one average template, not a real patient. Lobe boundaries are groupings of atlas regions, and the brainstem split and the nigra and olfactory markers are approximate.
- The 2D view is a hand-drawn schematic. Deep structures there are projected onto the surface so they can be clicked.
- Each staging scheme is simplified to three or four steps. Colors show order of spread, not measured severity, and real patients vary.
