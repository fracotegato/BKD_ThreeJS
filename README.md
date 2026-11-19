# BKD_ThreeJS

Three.js visualization of the VW 2.0 TDI **BKD** engine as fitted to the Golf V: an interactive, real-scale (1 unit = 1 mm) model of the engine, its turbocharger, the 02Q gearbox, the clutch and everything that connects to them in the engine bay.

**Live page:** https://fracotegato.github.io/BKD_ThreeJS/

## What you can do

- Click any part or label for its description, specifications and connections (181 selectable parts).
- Filter by system on the left: mechanics, valve gear, injection, charge air, turbocharger, gearbox, clutch, exhaust and EGR, cooling, lubrication, electrics, ancillaries.
- Take one assembly apart at a time: crankcase, cylinder block, cylinder head, unit injectors, turbocharger, gearbox, clutch.
- Explode the whole engine, cut it open along the crankshaft, or make the housings transparent.
- Run the four-stroke cycle in slow motion.
- Watch the mechanisms work: the three **Watch it work** buttons show the turbocharger guide vanes, the clutch (cut open) or the gearbox without its housing, assembled and moving on their own. A control strip then lets you take over: move the vanes, press the pedal, or pick a gear (R, N, 1 – 6). The same strip appears when one of those assemblies is taken apart.

| Key | Action | Key | Action |
| --- | --- | --- | --- |
| Space | run / stop | 1 – 4 | crankcase, block, head, injector |
| X | X-ray | T, G, K | turbo, gearbox, clutch |
| C | cutaway | I | isolate the chosen assembly or system |
| V | covers | P | parts around the engine |
| L | labels | D | dimensions |
| E | explode all | Esc | back |
| H | housing of the open assembly | | |

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

```bash
npm run check              # build check (part sizes, belt length, kinematics) and part-data check
npm run overlap            # lists pairs of parts that run through each other
npm run numbers            # rewrites PART-NUMBERS.md from src/parts-numbers.js
npm run build              # production build in dist/
```

Pushing to `main` builds and publishes the page through the workflow in `.github/workflows/deploy.yml`. In the repository settings, **Pages → Source** must be set to **GitHub Actions**.

## How it is built

Notes for working on this project with Claude Code are in `CLAUDE.md`.

- Three.js 0.170 and Vite. All geometry is procedural; there are no imported meshes.
- `src/engine-core.js` engine, `engine-ancillaries.js` ancillaries, `engine-turbo.js` turbocharger, `engine-gearbox.js` gearbox and clutch, `engine-periphery.js` engine bay, `engine-detail.js` small parts and the unit injectors.
- `src/parts-data*.js` hold the text, specifications and connections of every part.

## Sources and accuracy

- Design facts follow the Volkswagen self-study programme 316, "The 2.0 ltr. TDI engine". The document itself is not part of this repository.
- Tooth counts, bearing and bolt sizes, part order on the shafts, hose connections and clamp sizes follow the manufacturer's parts catalogue for the Golf 2004–2005.
- Component positions were checked against photographs of a real engine.
- Part numbers are listed in [PART-NUMBERS.md](PART-NUMBERS.md) and shown per part under Specifications. Most were read in the parts catalogue; a few come from sellers' listings and say so. Numbers vary with build date and equipment, so check against the vehicle before ordering.
- Values marked ≈ in the part data are estimates. Pipe, hose and cable paths between their end points are modelled routes, and small-part sizes are scaled to fit; this is a teaching model, not a workshop reference.

Surface textures are from [ambientCG](https://ambientcg.com) (CC0); see `public/textures/CREDITS.txt`.
