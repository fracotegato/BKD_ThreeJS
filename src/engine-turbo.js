// Garrett GT1749VA variable-nozzle turbocharger of the BKD, broken down into its components.
// On this engine the turbine housing is cast in one piece with the exhaust manifold
// (ETKA 145-055: "exhaust manifold with turbocharger" 03G 253 010 J / 03G 253 014 H).
// Wheel sizes follow rebuild-part listings for Garrett 724930 (compressor ≈ 35 / 49 mm,
// turbine ≈ 43 / 36 mm); the nozzle ring carries 11 vanes. Everything else is scaled (≈).
// Local frame of every component: origin on the shaft axis, x along the shaft,
// compressor towards -x (belt end), turbine towards +x (gearbox end).
import * as THREE from 'three';
import { M, mesh, put, cyl, hex, box, sphere, torus, bar, rod, tube, latheX, latheY, extrudeX, circ } from './helpers.js';

const TAU = Math.PI * 2;
const ring = (n, r, fn, phase = 0) => { for (let k = 0; k < n; k++) { const a = phase + (k * TAU) / n; fn(r * Math.cos(a), r * Math.sin(a), a); } };
/** Solid ring of revolution about x: [x0, x1] long, radii rIn…rOut. */
const sleeve = (x0, x1, rIn, rOut, mat, seg = 40) => latheX([[x0, rIn], [x0, rOut], [x1, rOut], [x1, rIn], [x0, rIn]], mat, seg);
/**
 * Curved wheel blade as a thin solid. stations = [[xHub, rHub, xTip, rTip, wrap], …] from leading to
 * trailing edge; wrap is the angle (rad) the blade has turned about the shaft at that station.
 */
function bladeGeo(stations, thick) {
  const n = stations.length, rows = 4, pos = [], idx = [];
  for (const side of [1, -1]) {
    for (const [xh, rh, xt, rt, wrap] of stations) {
      for (let j = 0; j < rows; j++) {
        const f = j / (rows - 1), x = xh + (xt - xh) * f, r = rh + (rt - rh) * f;
        const a = wrap + (side * thick * (1 - 0.45 * f)) / (2 * r);       // blade thins towards the tip
        pos.push(x, r * Math.cos(a), r * Math.sin(a));
      }
    }
  }
  const at = (side, i, j) => side * n * rows + i * rows + j;
  const quad = (a, b, c, d) => idx.push(a, b, c, a, c, d);
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < rows - 1; j++) {
      quad(at(0, i, j), at(0, i + 1, j), at(0, i + 1, j + 1), at(0, i, j + 1));
      quad(at(1, i, j), at(1, i, j + 1), at(1, i + 1, j + 1), at(1, i + 1, j));
    }
    quad(at(0, i, rows - 1), at(0, i + 1, rows - 1), at(1, i + 1, rows - 1), at(1, i, rows - 1));   // tip edge
  }
  for (const i of [0, n - 1]) for (let j = 0; j < rows - 1; j++) {                                   // leading / trailing edge
    if (i) quad(at(0, i, j), at(1, i, j), at(1, i, j + 1), at(0, i, j + 1));
    else quad(at(0, i, j), at(0, i, j + 1), at(1, i, j + 1), at(1, i, j));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  const flat = g.toNonIndexed();
  flat.computeVertexNormals();
  flat.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(flat.attributes.position.count * 2), 2));   // lets mergeStatic join blades and hub
  return flat;
}
/** n copies of a blade round the shaft. */
function blades(parent, n, stations, thick, mat, phase = 0) {
  const geo = bladeGeo(stations, thick);
  for (let k = 0; k < n; k++) {
    const b = mesh(geo, mat);
    b.rotation.x = phase + (k * TAU) / n;
    parent.add(b);
  }
}

export function buildTurbo(A, anim, { TX, TY, TZ, OF }) {
  const GLOBAL = [-20, 60, -340];                 // how the assembled turbo moves with the rest of the engine
  anim.pieces = anim.pieces || [];
  /** Register a turbo component. sub = its travel in the exploded view (mostly along the shaft). */
  const T = (id, sub, opts, fn) => {
    const g = A.part(id, { explode: GLOBAL, ...opts }, (grp) => {
      const t = new THREE.Group();
      t.position.set(TX, TY, TZ);
      grp.add(t);
      fn(t, grp);
    });
    g.userData.group = 'turbo';
    g.userData.sub = new THREE.Vector3(...sub);
    return g;
  };
  /** A loose piece inside a component that travels a further `extra` when exploded (screws, rings, clamp plates). */
  const piece = (parent, extra, fn) => {
    const p = new THREE.Group();
    fn(p);
    parent.add(p);
    anim.pieces.push({ o: p, home: p.position.clone(), sub: new THREE.Vector3(...extra) });
    return p;
  };
  const top = (x, r) => [TX + x, TY + r + 6, TZ];

  // ═════════════════════════ hot side ═════════════════════════
  // Turbine housing: one casting with the exhaust manifold; stays where it is.
  T('turbineHousing', [0, 0, 0], { explode: [0, 340, -200], anchor: [TX + 60, TY + 52, TZ - 34] }, (t, g) => {
    t.add(latheX([
      [26, 52], [30, 56], [40, 56], [58, 50], [68, 38], [94, 34], [95, 40], [101, 40], [102, 37],
      [102, 30], [74, 29.5], [66, 19.5], [48.5, 22.5], [48.5, 46], [34, 46], [26, 46], [26, 52],
    ], M.exhaust, 56));
    t.add(put(torus('x', 40, 19, M.exhaust), 44, 0, 0));                                   // volute scroll
    t.add(put(cyl('y', 22, 34, M.exhaust, 28), 46, 42, 4));                                // gas entry from the manifold collector
    t.add(put(box(30, 14, 26, M.exhaust, 5), 46, 30, -30));                                // tongue
    t.add(put(box(20, 12, 18, M.exhaust, 3), 70, -44, 14));                                // boss for the support
    // support to the cylinder block (ETKA item 22, 038 145 535 K) with its M8 bolt
    g.add(bar([TX + 70, TY - 50, TZ + 16], [TX + 74, TY - 118, -92], 22, 5, M.steelDark, 2));
    g.add(put(hex('z', 6.5, 6, M.steelDark), TX + 74, TY - 112, -98));
    g.add(put(hex('y', 6.5, 6, M.steelDark), TX + 70, TY - 54, TZ + 16));
  });
  // Clamp plates + bolts holding the turbine housing to the bearing housing
  T('turbineClamps', [-14, 0, 0], { anchor: top(20, 58) }, (t) => {
    for (const a of [0.5, 2.1, 3.7, 5.3]) {
      const c = Math.cos(a), s = Math.sin(a);
      piece(t, [0, 34 * c, 34 * s], (p) => {
        const pl = put(box(6, 14, 12, M.exhaustDark, 2), 23, 50 * c, 50 * s); pl.rotation.x = a; p.add(pl);
      });
      piece(t, [-26, 34 * c, 34 * s], (p) => p.add(put(hex('x', 4.5, 6, M.steelDark), 18, 50 * c, 50 * s), put(cyl('x', 2.6, 14, M.steelDark, 10), 26, 50 * c, 50 * s)));
    }
  });
  // V-band clamp and seal ring to the catalytic converter pipe
  T('catClamp', [118, 0, 0], { explode: [60, -10, -400], anchor: [TX + 104, TY + 52, TZ] }, (t) => {
    t.add(latheX([[98, 40], [98, 44.5], [100, 46], [106, 46], [108, 44.5], [108, 40], [106, 42], [100, 42], [98, 40]], M.stainless, 48));
    t.add(put(box(12, 10, 16, M.stainless, 2), 103, 49, 0));                                // trunnion
    t.add(put(cyl('z', 3, 40, M.steel, 12), 103, 51, 6));                                   // T-bolt
    piece(t, [0, 0, 26], (p) => p.add(put(hex('z', 5.5, 7, M.steelDark), 103, 51, 24)));    // nut
  });
  T('catSeal', [62, 0, 0], { explode: [60, -10, -400], anchor: top(103, 38) }, (t) => {
    t.add(sleeve(102.2, 103.8, 30, 36.5, M.copper, 44));
  });

  // ═════════════════════════ variable nozzle ═════════════════════════
  const NV = 11, RP = 31;                          // vane count, pitch radius of the vane pivots
  T('vntVanes', [-36, 0, 0], { anchor: top(44, 40) }, (t) => {
    ring(NV, RP, (y, z, a) => {
      const piv = new THREE.Group();
      piv.position.set(0, y, z);
      piv.rotation.x = a + 1.02;                                                            // vane angle, about half open
      piv.add(put(box(7, 2.4, 15, M.steelDark, 1), 44, 0, 1.5));                            // vane (7 mm tall)
      piv.add(put(cyl('x', 1.9, 14, M.steel, 10), 41, 0, 0));                               // pivot pin through the ring
      piv.add(put(box(2.4, 4.4, 10, M.steel, 1), 35.4, 0, -3.4));                           // vane arm on the back
      piv.add(put(cyl('x', 2.3, 2.6, M.steel, 10), 35.4, 0, -7.8));                         // arm tip, sits in a slot of the unison ring
      t.add(piv);
    });
  });
  T('nozzleRing', [-84, 0, 0], { anchor: top(39, 46) }, (t) => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 45.5, 0, TAU, false);
    s.holes.push(circ(0, 0, 23.5));
    ring(NV, RP, (y, z) => s.holes.push(circ(z, y, 2.1)));                                  // pivot bores
    t.add(put(extrudeX(s, 3, M.stainless, { curve: 40 }), 39, 0, 0));
    ring(3, 41, (y, z) => piece(t, [16, 0, 0], (p) => p.add(put(cyl('x', 2.8, 11, M.steel, 12), 44, y, z))), 0.3);        // spacer pins
    ring(3, 41, (y, z) => piece(t, [-14, 0, 0], (p) => p.add(put(cyl('x', 3.6, 3, M.steelDark, 14), 35.5, y, z))), 1.35);  // guide rollers
  });
  T('vntUnison', [-128, 0, 0], { anchor: top(34, 46) }, (t) => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 44, 0, TAU, false);
    s.holes.push(circ(0, 0, 33.5));
    ring(NV, 38.8, (y, z) => s.holes.push(circ(z, y, 2.6)), 0.2);                           // one slot per vane arm
    t.add(put(extrudeX(s, 2.4, M.steel, { curve: 40 }), 33.2, 0, 0));
    t.add(put(box(2.4, 12, 9, M.steel, 1), 33.2, -45, -14));                                // lug driven by the crank
    t.add(put(cyl('x', 2.6, 6, M.steelDark, 10), 31, -47, -14));
  });
  T('turboHeatShield', [-156, 0, 0], { anchor: top(35, 30) }, (t) => {
    t.add(latheX([[33, 7.4], [33, 16], [35.5, 24], [36.5, 31], [37.4, 31], [36.6, 23.5], [34.2, 15.5], [34.2, 7.4], [33, 7.4]], M.stainless, 44));
  });

  // ═════════════════════════ rotating assembly and core ═════════════════════════
  T('pistonRingT', [-186, 0, 0], { anchor: top(33, 8) }, (t) => {
    t.add(put(torus('x', 6.9, 1, M.steelDark), 33, 0, 0));
  });
  T('turbineWheel', [-208, 0, 0], { anchor: top(52, 22) }, (t) => {
    const w = new THREE.Group();
    w.add(latheX([[38, 0], [38, 21.5], [40.2, 21.5], [42.5, 13], [49, 9], [57, 7], [65, 5.8], [70, 3], [70, 0]], M.exhaustDark, 40));
    // 9 blades: radial at the Ø 43 inlet, curving into the Ø 36 outlet
    blades(w, 9, [[40.2, 21.5, 47.5, 21.5, 0], [42.5, 12.6, 51, 20.6, -0.04], [49, 8.6, 57, 19, -0.24], [57, 6.6, 62, 18.2, -0.58], [65, 5.4, 66.5, 18, -0.98]], 1.9, M.exhaustDark);
    w.add(put(hex('x', 4, 4, M.exhaustDark), 70, 0, 0));
    // shaft, friction-welded to the wheel
    w.add(put(cyl('x', 6.6, 3.2, M.steel, 24), 36.4, 0, 0));                                // seal boss with the ring groove
    w.add(put(cyl('x', 5.6, 1.8, M.steelDark, 24), 33.9, 0, 0));
    w.add(put(cyl('x', 6.6, 3, M.steel, 24), 31.5, 0, 0));
    w.add(put(cyl('x', 4, 80, M.steel, 20), -10, 0, 0));                                    // journal section Ø 8
    w.add(put(cyl('x', 3, 8, M.steel, 16), -54, 0, 0));
    w.add(put(cyl('x', 2.5, 40, M.steelDark, 14), -78, 0, 0));                              // threaded stem
    t.add(w);
    anim.spinners.push({ o: w, ratio: 9 });
  });
  // Journal bearings: one each side of the bearing housing, each between two retaining rings
  const bush = (t, x) => {
    t.add(sleeve(x - 4.5, x + 4.5, 4.06, 6.15, M.brass, 28));
    ring(4, 6.2, (y, z) => t.add(put(sphere(1.1, M.dark), x, y, z)));                       // oil holes
  };
  T('journalBearingT', [-342, 0, 0], { anchor: top(14, 9) }, (t) => bush(t, 14));
  T('journalBearingC', [-420, 0, 0], { anchor: top(-30, 9) }, (t) => bush(t, -30));
  T('bearingCirclips', [0, 0, 0], { anchor: top(-5, 9) }, (t) => {
    for (const [x, dx] of [[19.6, -333], [8.4, -350], [-24.4, -415], [-35.6, -432]]) {
      piece(t, [dx, 0, 0], (p) => {
        const c = mesh(new THREE.TorusGeometry(6.2, 0.75, 8, 28, TAU * 0.9), M.steelDark);
        c.rotation.y = Math.PI / 2; c.position.x = x;
        p.add(c);
      });
    }
  });
  T('turbo', [-384, 0, 0], { anchor: [TX - 8, TY + 50, TZ] }, (t) => {
    t.add(latheX([
      [-48, 40], [-42, 40], [-40, 27], [-12, 24], [8, 26], [20, 30], [22, 45], [32, 45], [32, 30], [33, 9],
      [28, 6.25], [-44, 6.25], [-44, 18.5], [-48, 18.5], [-48, 40],
    ], M.castIronLight, 56));
    t.add(put(cyl('y', 10, 16, M.castIronLight, 20), -8, 30, 0));                           // oil inlet boss
    t.add(put(cyl('y', 4.4, 1.2, M.dark, 14), -8, 38.4, 0));
    t.add(put(box(34, 8, 26, M.castIronLight, 3), -8, -29, 0));                             // oil drain flange
    t.add(put(box(16, 1.2, 12, M.dark), -8, -33.4, 0));
    for (const dx of [-13, 13]) t.add(put(cyl('y', 2.6, 1.6, M.dark, 10), -8 + dx, -33.2, 0));
    t.add(put(box(20, 12, 1.5, M.alu), -14, 4, 25.5));                                      // type plate
    t.add(put(cyl('x', 7, 14, M.castIronLight, 16), 25, -34, -38));                         // bush for the vane crank
  });
  // Thrust bearing: horseshoe plate that slides into the groove of the thrust collar
  T('thrustBearing', [-444, 0, 0], { anchor: top(-46, 20) }, (t) => {
    const d = Math.asin(6.9 / 18), s = new THREE.Shape();
    s.absarc(0, 0, 18, -Math.PI / 2 + d, (3 * Math.PI) / 2 - d, false);
    s.lineTo(-6.9, 0);
    s.absarc(0, 0, 6.9, Math.PI, 0, true);
    s.lineTo(6.9, -18 * Math.cos(d));
    t.add(put(extrudeX(s, 3.2, M.brass, { curve: 32 }), -46.4, 0, 0));
    for (const a of [0.5, 1.57, 2.64, -0.2, 3.34]) for (const x of [-44.7, -48.1]) { const p = put(box(0.6, 6.5, 3.4, M.dark), x, 12.5 * Math.sin(a), 12.5 * Math.cos(a)); p.rotation.x = -a; t.add(p); }   // oil wedge pads
    t.add(put(cyl('y', 1.4, 5, M.dark, 8), -46.4, 16, 0));                                  // oil feed drilling
    for (const z of [-15, 15]) piece(t, [-12, 0, 0], (p) => p.add(put(cyl('x', 1.6, 6, M.steel, 8), -46.4, 6, z)));   // anti-rotation pins
  });
  T('thrustCollar', [-470, 0, 0], { anchor: top(-50, 12) }, (t) => {
    t.add(latheX([[-57, 2.6], [-57, 6.4], [-55, 6.4], [-55, 5.6], [-53, 5.6], [-53, 6.4], [-49.6, 6.4], [-49.6, 10.5], [-48.2, 10.5], [-48.2, 6.4], [-44.6, 6.4], [-44.6, 10.5], [-43.4, 10.5], [-43.4, 2.6], [-57, 2.6]], M.steel, 32));
  });
  T('pistonRingC', [-494, 0, 0], { anchor: top(-54, 8) }, (t) => {
    t.add(put(torus('x', 6.7, 0.9, M.steelDark), -54, 0, 0));
  });
  T('oilDeflector', [-512, 0, 0], { anchor: top(-50, 19) }, (t) => {
    t.add(latheX([[-50.6, 9], [-50.6, 17], [-49.2, 18.6], [-48.8, 18.6], [-49.9, 17], [-49.9, 9], [-50.6, 9]], M.steelDark, 28));
  });

  // ═════════════════════════ cold side ═════════════════════════
  T('sealPlate', [-536, 0, 0], { anchor: top(-53, 54) }, (t) => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 54, 0, TAU, false);
    s.holes.push(circ(0, 0, 7));
    ring(4, 33, (y, z) => s.holes.push(circ(z, y, 2.4)), 0.4);                              // screw holes
    t.add(put(extrudeX(s, 4.5, M.alu, { curve: 44 }), -54.25, 0, 0));
    t.add(latheX([[-58, 7.2], [-58, 26], [-56.5, 30], [-56.5, 7.2], [-58, 7.2]], M.alu, 40));           // raised centre
    t.add(latheX([[-52, 19.5], [-52, 41], [-48.5, 41], [-48.5, 38], [-51, 38], [-51, 19.5], [-52, 19.5]], M.alu, 44));   // register into the bearing housing
  });
  T('sealPlateScrews', [-566, 0, 0], { anchor: top(-58, 36) }, (t) => {
    ring(4, 33, (y, z) => t.add(put(hex('x', 3.2, 2.4, M.steelDark), -57.8, y, z), put(cyl('x', 1.8, 10, M.steelDark, 8), -52, y, z)), 0.4);
  });
  T('housingOring', [-594, 0, 0], { anchor: top(-52, 49) }, (t) => {
    t.add(put(torus('x', 48.5, 1.7, M.rubber), -52, 0, 0));
  });
  T('compressorWheel', [-610, 0, 0], { anchor: top(-74, 26) }, (t) => {
    const w = new THREE.Group();
    w.add(latheX([[-91, 2.6], [-91, 4.6], [-89, 5.2], [-82, 6.6], [-74, 9.3], [-67, 14], [-62.5, 20], [-61.2, 24.5], [-59, 24.5], [-59, 2.6], [-91, 2.6]], M.alu, 44));
    // 6 full blades from the Ø 35 inducer to the Ø 49 rim, swept back at the exit, and 6 shorter splitter blades
    const full = [[-89, 4.9, -90, 17.5, 0.98], [-82, 6.3, -84, 17.5, 0.56], [-74, 9, -76.5, 18.3, 0.26], [-67, 13.6, -69.5, 20.6, 0.08], [-62.5, 19.6, -65.5, 23.4, -0.03], [-61.2, 24.5, -64.8, 24.5, -0.1]];
    blades(w, 6, full, 1.5, M.alu);
    blades(w, 6, full.slice(2), 1.5, M.alu, TAU / 12);
    t.add(w);
    anim.spinners.push({ o: w, ratio: 9 });
  });
  T('shaftNut', [-646, 0, 0], { anchor: top(-93, 6) }, (t) => {
    const w = new THREE.Group();
    w.add(put(hex('x', 4.4, 4.6, M.steelDark), -93.4, 0, 0));
    w.add(put(cyl('x', 4.9, 1.2, M.steelDark, 16), -91.6, 0, 0));
    t.add(w);
    anim.spinners.push({ o: w, ratio: 9 });
  });
  T('compressorClamps', [-640, 0, 0], { anchor: top(-54, 70) }, (t) => {
    ring(5, 60, (y, z, a) => {
      const c = Math.cos(a), s = Math.sin(a);
      piece(t, [0, 30 * c, 30 * s], (p) => { const pl = put(box(5, 12, 14, M.steelDark, 2), -54, y, z); pl.rotation.x = a; p.add(pl); });
      piece(t, [26, 30 * c, 30 * s], (p) => p.add(put(hex('x', 4, 5, M.steelDark), -50, y, z), put(cyl('x', 2.4, 12, M.steelDark, 8), -58, y, z)));
    }, 0.9);
  });
  T('compressorHousing', [-706, 0, 0], { anchor: [TX - 78, TY + 66, TZ] }, (t) => {
    t.add(latheX([
      [-112, 23], [-112, 27.5], [-108, 29.5], [-98, 29.5], [-92, 40], [-84, 58], [-60, 60], [-56, 60], [-56, 55],
      [-60, 55], [-62, 26.5], [-66, 22], [-76, 18.8], [-90, 18], [-104, 19], [-112, 23],
    ], M.alu, 56));
    t.add(put(torus('x', 45, 17, M.alu), -76, 0, 0));                                       // volute
    // outlet: leaves the volute tangentially, turns down and back to the pressure hose
    t.add(tube([[-74, -14, -48], [-66, -38, -76], [-42, -67, -99]], 22, M.alu, { cap: false }));
    const lip = torus('y', 23, 3, M.alu);
    lip.position.set(-42, -67, -99); lip.rotation.set(-0.6, 0, -0.5);
    t.add(lip);
    t.add(put(box(18, 6, 14, M.alu, 2), -78, -52, 30));                                     // lug for the actuator bracket
    piece(t, [14, -22, -22], (p) => {                                                       // seal ring of the plug-in hose coupling
      const o = torus('y', 22.6, 1.7, M.rubber);
      o.position.set(-48, -60, -93); o.rotation.set(-0.6, 0, -0.5);
      p.add(o);
    });
  });

  // ═════════════════════════ vane control ═════════════════════════
  T('vntActuator', [-70, -150, -90], { anchor: [TX - 20, TY - 110, TZ - 48] }, (t) => {
    const can = latheY([[5, -20], [24, -18], [28, -6], [28, 2], [24, 4], [22, 14], [8, 17], [5, 17]], M.stainless, 32);
    can.position.set(-20, -84, -34); can.rotation.z = 0.5;
    t.add(can);
    const seam = torus('y', 28.5, 1.8, M.steelDark);
    seam.position.set(-19, -86, -34); seam.rotation.z = 0.5;
    t.add(seam);
    t.add(put(cyl('y', 3, 14, M.plastic, 10), -30, -62, -34));                              // vacuum connection from N75
    t.add(bar([-20, -74, -30], [-70, -52, 22], 24, 4, M.steelDark, 2));                     // bracket to the compressor housing
    piece(t, [-10, 26, 14], (p) => p.add(put(hex('y', 4, 4, M.steelDark), -74, -48, 28)));  // bracket bolt
  });
  T('vntRod', [-20, -118, -96], { anchor: [TX + 6, TY - 50, TZ - 44] }, (t) => {
    t.add(rod([-12, -72, -34], [22, -40, -44], 2.4, M.steel));
    t.add(put(hex('x', 3.4, 5, M.steelDark), -4, -64, -36.5));                              // adjusting nut
    t.add(put(sphere(3.4, M.steelDark), 22, -40, -44));                                     // rod eye
  });
  T('vntCrank', [16, -86, -92], { anchor: [TX + 30, TY - 26, TZ - 40] }, (t) => {
    t.add(bar([22, -40, -44], [25, -34, -38], 6, 4, M.steelDark, 1));                       // outer lever
    t.add(put(cyl('x', 3.2, 22, M.steel, 12), 27, -34, -38));                               // shaft through the housing
    t.add(bar([32, -34, -38], [32, -45, -14], 5, 3, M.steel, 1));                           // inner arm to the unison ring
    t.add(put(cyl('x', 2.2, 6, M.steel, 10), 32, -47, -14));
    piece(t, [18, 14, -14], (p) => p.add(put(hex('x', 3, 5, M.steelDark), 34, -30, -30), put(cyl('x', 1.6, 12, M.steelDark, 8), 28, -30, -30)));   // minimum-flow stop screw
  });

  // ═════════════════════════ oil lines ═════════════════════════
  // feed: steel pipe from the oil filter module round the gearbox end (ETKA item 9, 038 145 771 AG)
  T('turboOilFeed', [0, 110, -70], { anchor: [TX + 60, 244, TZ + 40] }, (t, g) => {
    g.add(tube([[OF.x + 30, 120, 150], [190, 196, 140], [236, 204, 70], [236, 204, -70], [198, 216, -128], [60, 236, -150], [TX + 20, 244, TZ + 16], [TX - 8, TY + 46, TZ]], 3.4, M.steel, { radial: 8, seg: 140 }));
    piece(t, [0, -36, 0], (p) => p.add(put(hex('y', 7, 9, M.steelDark), -8, 43, 0), put(cyl('y', 4.2, 8, M.steelDark, 12), -8, 36, 0)));   // threaded union M10×1 / M14×1.5
    for (const p of [[236, 204, 0], [140, 226, -140]]) g.add(put(box(12, 10, 10, M.steelDark, 2), ...p));   // pipe clips
    g.add(put(hex('z', 6, 8, M.steelDark), OF.x + 30, 120, 148));
  });
  // return: flanged pipe down into the block (ETKA item 5C, 038 145 736 C)
  T('turboOilReturn', [0, -90, -150], { anchor: [TX - 6, 100, -170] }, (t, g) => {
    t.add(put(box(34, 3, 26, M.steelDark, 2), -8, -35.5, 0));                               // flange
    piece(t, [0, 34, 0], (p) => p.add(put(box(30, 1, 22, M.gasket), -8, -33.6, 0)));        // seal 028 145 757
    for (const dx of [-13, 13]) piece(t, [0, -26, 0], (p) => p.add(put(hex('y', 3.6, 4, M.steelDark), -8 + dx, -38.5, 0), put(cyl('y', 1.8, 12, M.steelDark, 8), -8 + dx, -32, 0)));
    g.add(tube([[TX - 8, TY - 37, TZ], [TX - 7, 112, -166], [TX - 4, 62, -130], [TX - 4, 42, -112]], 7, M.steelDark, { radial: 12 }));
    for (let k = 0; k < 5; k++) g.add(put(torus('y', 7.8, 1.2, M.steelDark), TX - 6.5, 118 - k * 5, -168 + k * 3.4));   // bellows
    piece(g, [0, 0, -34], (p) => p.add(put(hex('z', 10, 10, M.brass), TX - 4, 40, -106)));  // threaded union 12 / M18×1.5 in the block
  });
}
