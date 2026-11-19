# BKD engine model — working notes for Claude

Interactive, real-scale Three.js model of the VW 2.0 TDI engine **BKD** (Golf V): engine, GT1749VA
turbocharger, 02Q gearbox, clutch, and the engine-bay parts around them. Vite app, no backend.
Live at https://fracotegato.github.io/BKD_ThreeJS/ — repository `fracotegato/BKD_ThreeJS`.

## Commands

```bash
npm run dev        # dev server, http://localhost:5173 (strict port)
npm run check      # smoke build check + part-data check — run after every geometry or data change
npm run overlap    # parts that run through each other (about 20 s); keep the list from growing
npm run numbers    # rewrite PART-NUMBERS.md from src/parts-numbers.js (run after changing part numbers)
npm run build      # production build into dist/
```

`npm run smoke` alone prints every part's bounding box (x/y/z min–max): use it to measure the model.
Pushing to `main` runs the checks and deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Conventions that everything depends on

- **Units:** 1 unit = 1 mm, true scale. Do not rescale.
- **Axes:** X = crankshaft (belt end −X, gearbox +X); Y up; +Z = intake side = front of the car.
  Crank axis is y = 0, z = 0. Block deck y = 236, head from y = 237.5, camshafts y = 380.5 at z = ±80.
  Seen from the front of the car, right = +X.
- **Geometry is procedural only** (helpers in `src/helpers.js`: `cyl`, `box`, `sphere`, `torus`, `tube`,
  `latheX/Y`, `extrudeX/Y/Z`, `bar`, `rod`, `hex`, materials `M.*`). No imported meshes.
- **Connection points are hard-coded coordinates** spread across files. Moving or resizing a part means
  grepping for its coordinates and constants (`ALT`, `AC`, `OF`, `TX/TY/TZ`, `RAD`, `IC`, `AB`, `BT`, `ST`,
  `mw()` for the sloping manifold frame) and moving every hose end, cable end and label anchor with it.
- **Every part needs a data entry** and every connection must point to a real part; `npm run check` enforces it.

## File map

| File | Contents |
| --- | --- |
| `src/engine-core.js` | Constants `E`, belt solver, block, sump, crank, pistons, rods, head, valves, rockers, cams, bearing frame, injector bodies, glow plugs, head cover, toothed belt, guard |
| `src/engine-ancillaries.js` | Belt-driven units, oil filter module, pumps, flanges, sloping intake manifold, EGR valve, anti-shudder valve, charge pipe, exhaust manifold, catalyst, EGR cooler and pipe, senders |
| `src/engine-turbo.js` | GT1749VA in 30 parts |
| `src/engine-gearbox.js` | 02Q gearbox, dual-mass flywheel, clutch, hydraulic clutch control |
| `src/engine-periphery.js` | Intercooler, radiator, fans, condenser, all hoses and lines, air filter housing, battery, starter, loom, tank, fuel filter, front pipe; clamp and coupling helpers |
| `src/engine-detail.js` | Bearing shells, caps, bolts, rings, pins, valve small parts, unit injector parts; tags parts for the engine exploded views |
| `src/engine.js` | Assembles everything, kinematics (`update`), exploded-view offsets (`setExplode`) |
| `src/parts-data*.js` | Name, system, description, specs, connections per part. Later files override earlier entries (see the `Object.assign` near the end of `parts-data.js`) |
| `src/parts-numbers.js` | Part numbers per part (`NUMBERS`) and parts with no number of their own (`NONE`); merged into `PARTS` as `pn` / `noPn` |
| `src/main.js` | Scene, camera, picking, labels, panel, toolbar, views, status line |
| `scripts/` | `smoke.mjs`, `check-data.mjs`, `overlap.mjs`, `parts-table.mjs` |
| `PART-NUMBERS.md` | Generated table of all part numbers. Do not edit by hand |

## How parts and views work

- `A.part(id, { explode, cut, casing, cover, anchor }, fn)` registers a part. `explode` = travel in the
  engine-wide exploded view; `cut` = clipped by the cutaway; `casing` = ghosted by X-ray and skipped by
  the overlap check; `anchor` = label position.
- **Assembly views** (crank, block, head, injector, turbo, gearbox, clutch): a part belongs to one through
  `userData.group`, travels `userData.sub` in that view, and can ride along as a unit in another view via
  `userData.also = { view: Vector3 }`. `userData.subGlobal` scales `sub` in the engine-wide view (0 = stay assembled).
- **Loose pieces** inside a part (screws, rings, clips): wrap them in a `Group` and register it in
  `anim.pieces` with `{ o, home, sub, group, scale }`. They must be groups, not bare meshes, or
  `mergeStatic` will merge them away.
- **Parts that move with a piston or rod** but are separate parts: `anim.followers`.
- `mergeStatic` merges sibling meshes that share a material; set `userData.noMerge` on a mesh that is animated individually.
- Views are declared in `VIEWS` in `main.js` (`extra`, `skip`, `dir`, `lift`, `fit`). Adding one needs: an entry
  there and in `VIEW_NAMES`, a `state` flag and `viewT` key, a toolbar button with `data-tg`, and a key binding.
- `Isolate` hides everything outside the active view or system; `periph` parts are hidden by the Car parts toggle.

## Mechanisms the user works (guide vanes, clutch pedal, gears)

- `engine.ctl = { vnt, pedal, gear }` is what is asked for (`vnt` 1 = vanes steep/open … 0 = flat; `pedal` 0 … 1;
  `gear` `'N' | '1'…'6' | 'R'`). `engine.tick(dt)` runs every frame, eases the real state `engine.drive` towards it
  and calls the pose functions the builders register: `anim.vnt(open)` (turbo), `anim.clutch(p)` and `anim.shift(col)` (gearbox file).
- A gear change is a sequence inside `tick`: clutch down, old collar to neutral, new collar in, clutch up. Reverse waits until the differential has stopped.
- Spinners take a source: `anim.spinners.push({ o, ratio, src })`. No `src` = crankshaft; `'in'` = gearbox input shaft
  (clutch plate, input shaft, all loose gear wheels), `'o1'` / `'o2'` = output shafts, `'df'` = differential. `update()` sums the
  angles from `drive.rIn` and `drive.v`, both ratios to engine speed. `GEARS` in `engine-gearbox.js` holds teeth, synchroniser and collar direction per gear.
- Anything that must move inside a part or a loose piece goes in its own inner `Group` (the part and piece groups are
  repositioned by `setExplode`). The diaphragm spring is one unmerged mesh whose vertices `anim.clutch` moves.
- `DEMOS` / `startDemo` in `main.js` are the "Watch it work" toolbar buttons: one click opens the view assembled, hides the
  shell (the clutch is cut open instead), starts the engine and sets `state.auto`, which works the mechanism until the user touches a control.
- The control strip is `#mech` in `index.html`, filled by `MECH` / `renderMech` / `syncMech` in `main.js`, shown only in the
  turbo, clutch and gearbox views. `VIEWS[view].shell` lists the parts its housing button hides (`state.shell`, key H).
- Travel figures, vane angles and the position of the vane crank are estimates (≈); the tooth counts are from the catalogue.

## Part numbers

- One record per model part in `src/parts-numbers.js`: `e(number, what, qty, 'illustration', item, { alt, note })` for rows
  read in ETKA, `l(...)` for numbers that only come from a seller's listing. A part with no number of its own goes in `NONE`
  with the reason. The panel shows them under Specifications, and the part search finds them.
- `npm run check` validates the format and prints how many parts are still open; `node scripts/check-data.mjs --open` names them.
- Reading ETKA in bulk: open one catalogue page in the owner's Chrome, then `fetch()` the other pages from that tab
  (same origin) and parse the `<tr>` rows: columns are item, name, extra information, quantity, use, part number. Tool
  output is cut short, so write the rows into the page and read them with `get_page_text`. The site's firewall blocks the
  browser after about 40 requests in a few minutes: keep batches small and several seconds apart. When it blocks, stop and
  ask the owner to open a catalogue page themself.
- Rows whose "use" names other engine codes and not BKD are not for this engine. BKD rows often read `AZV,BKD`.
  The gearbox codes for this model are GRF / HDV.

## Sources of truth, in order

1. **VW self-study programme 316** for how the engine works. The PDF is not in the repository; ask the owner for it.
2. **ETKA parts catalogue** for the Golf 2004–2005: https://webautocats.com/etka/volkswagen/golf/420
   Illustration pages are `/420/<number without dash>` and each embeds one exploded PNG. Useful ones:
   `121045` coolant hoses, `129050` air filter, `131080` EGR and vacuum, `145055` turbo, `145085` intercooler,
   `127020` fuel filter, `611070` servo vacuum pipe, `311042`–`311044` gearbox shafts, `141060` clutch, `253065` catalyst.
   The site blocks automated browsers with a firewall check; it works in the owner's own Chrome, and if the
   check appears, ask the owner to open the page themself.
3. **Photographs** of the real engine and engine bay. Study photos of a component before modelling or moving
   it; the owner has repeatedly found layout errors that came from modelling from memory.

Mark anything not confirmed by these as an estimate (`≈`) in the part data, and say so when reporting.
Exploded catalogue drawings show what connects to what, not where a hose runs: routes between end points are modelled.

## Known facts — do not "fix" these

- Bore 81, stroke 95.5, spacing 88, rod 144, firing order 1-3-4-2, toothed belt 141 teeth.
- Gearbox: input 23·13·43·34·40; output 1 pinion 20 with 48/49/42/45; output 2 pinion 25 with 23/35/39; idler 36+14; ring gear 69.
- Turbo: compressor 35/49, turbine 43/36, 11 guide vanes; turbine housing is one casting with the exhaust manifold.
- Hose outside diameters from the catalogue clamp sizes: radiator 40, heater and EGR cooler 27, oil cooler and
  tank return 23, vent and fuel 14, vacuum 8. Coolant, fuel and vacuum hoses use spring band clamps; charge-air
  pipes use plug-in couplings with wire clips; the intake hose uses worm-drive clips.
- Layout from an engine-bay photo: air filter housing front left with the battery behind it; expansion tank
  beside the belt end with the fuel filter in front; intercooler between condenser and radiator.
- Intake manifold slopes about 48° away from the head; EGR valve (vacuum, bare metal with a round capsule)
  and anti-shudder valve (electric throttle body with black motor housing) sit on that sloping axis.
- Heater circuit runs through the EGR cooler; the heater return and the expansion tank join a steel pipe along the front of the block.

## Working practices

- After a change: `npm run check`, then look at it in the browser from the angle of a reference photo.
  For anything that moves or adds parts, also `npm run overlap`.
- The built-in preview pane throttles animation frames: wait several seconds before a screenshot, and the
  loading overlay can linger. `window.__bkd` exposes `state`, `parts`, `select`, `setToggle`, `setSystem`,
  `setRunning`, `goHome`, `camera`, `controls` for driving the page.
- Shell: in this Git Bash, heredocs that contain quotes fail. For multi-edit changes write a small Python
  patch script to a temp file and run it, or use the Edit tool.
- Desktop layout above 760 px must not change when working on the phone layout, and the reverse.
- Report honestly what was verified, what is estimated and what was not done.

## Git and publishing

- Commit or push only when the owner asks. A push to `main` publishes the public page.
- Commits in this repository use the repository owner's GitHub identity (the no-reply address already set in
  the local git config). Do not change it to another identity, and keep personal names, e-mail addresses and
  local paths out of project files and commit messages.
- Do not commit `node_modules`, `dist`, or local Claude settings.
