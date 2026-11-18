// Small parts of the engine itself and the three engine exploded views:
//   crank – crankcase: crankshaft, main bearing shells, thrust washers, caps, bolts, sealing flanges, oil pump, sump
//   block – cylinder block: pistons, rings, pins, circlips, connecting rods, big-end shells, caps, bolts, oil jets
//   head  – cylinder head: valves with springs, retainers and collets, seals, guides, seats, camshafts, bearing
//           shells, bearing frame, injectors with their O-rings, head bolts, cover and gasket
// Sizes of these small parts are scaled to the modelled engine (≈); counts follow the engine layout.
import * as THREE from 'three';
import { E, valveLayout } from './engine-core.js';
import { M, mesh, put, solid, cyl, hex, box, sphere, torus, tube, latheX, extrudeX, extrudeY, rrect, circ, spring } from './helpers.js';

const TAU = Math.PI * 2;
const MAINS = [-176, -88, 0, 88, 176];
/** Half of a ring of revolution about x (bearing shell, half washer). upper = the half above the axis. */
function halfRing(x0, x1, rIn, rOut, mat, upper) {
  const pts = [[x0, rIn], [x0, rOut], [x1, rOut], [x1, rIn], [x0, rIn]].map(([x, r]) => new THREE.Vector2(r, x));
  const g = new THREE.LatheGeometry(pts, 20, upper ? Math.PI : 0, Math.PI);
  g.rotateZ(-Math.PI / 2);
  return mesh(g, mat);
}
const splitRing = (r, t, mat, axis = 'y') => {
  const m = mesh(new THREE.TorusGeometry(r, t, 8, 40, TAU * 0.985), mat);
  if (axis === 'y') m.rotation.x = Math.PI / 2; else m.rotation.y = Math.PI / 2;
  return m;
};

export function buildDetail(A, anim) {
  const HY = E.headY;
  anim.followers = anim.followers || [];
  const tag = (id, group, sub) => { const g = A.parts[id]; if (g) Object.assign(g.userData, { group, sub: new THREE.Vector3(...sub), subGlobal: 0 }); };
  const N = (group) => (id, sub, opts, fn) => { const g = A.part(id, opts, fn); Object.assign(g.userData, { group, sub: new THREE.Vector3(...sub), subGlobal: 0 }); return g; };
  const pieceOf = (group) => (parent, extra, ...objs) => {
    const p = new THREE.Group();
    p.add(...objs);
    parent.add(p);
    anim.pieces.push({ o: p, home: p.position.clone(), sub: new THREE.Vector3(...extra), group, scale: 0 });
    return p;
  };
  /** One group per cylinder that copies the motion of a piston or connecting rod. */
  const follow = (g, list, fn) => list.forEach((src, i) => {
    const f = new THREE.Group();
    f.position.copy(src.position);
    g.add(f);
    anim.followers.push({ o: f, src });
    fn(f, i);
  });

  // ═════════════════════════ crankcase ═════════════════════════
  const K = N('crank'), kp = pieceOf('crank');
  tag('crankshaft', 'crank', [0, -170, 0]);
  tag('oilPump', 'crank', [0, -610, 0]);
  tag('sump', 'crank', [0, -740, 0]);
  tag('sealingFlange', 'crank', [150, 0, 0]);
  K('mainBearings', [0, 0, 0], { cut: true, explode: [0, -80, 0], anchor: [0, 34, 20] }, (g) => {
    for (const x of MAINS) {
      const up = halfRing(x - 10, x + 10, 27.1, 29, M.gasket, true);
      kp(g, [0, -78, 0], up, put(cyl('y', 2.4, 1.2, M.dark, 10), x, 28.6, 0), put(box(4, 1, 30, M.dark), x, 27.4, 0));   // grooved shell with oil hole, in the block
      kp(g, [0, -310, 0], halfRing(x - 10, x + 10, 27.1, 29, M.gasket, false));                                            // plain shell, in the cap
    }
  });
  K('thrustWashers', [0, 0, 0], { cut: true, explode: [0, -80, 0], anchor: [14, 40, 20] }, (g) => {
    for (const s of [-1, 1]) {
      kp(g, [s * 30, -124, 0], halfRing(s * 10.2, s * 12.6, 29.6, 37, M.brass, true));
      kp(g, [s * 30, -310, 0], halfRing(s * 10.2, s * 12.6, 29.6, 37, M.brass, false));
    }
  });
  K('mainCaps', [0, -390, 0], { cut: true, explode: [0, -230, 0], anchor: [0, -46, 30] }, (g) => {
    const cap = new THREE.Shape();
    cap.moveTo(-56, 0); cap.lineTo(-56, -30); cap.lineTo(-40, -44); cap.lineTo(40, -44); cap.lineTo(56, -30);
    cap.lineTo(56, 0); cap.lineTo(29, 0); cap.absarc(0, 0, 29, 0, -Math.PI, true); cap.lineTo(-56, 0);
    MAINS.forEach((x, i) => {
      g.add(solid(put(extrudeX(cap, 20, M.castIronLight), x, 0, 0)));
      for (let k = 0; k <= i; k++) g.add(put(box(2, 1, 5, M.dark), x - 4 + k * 2.4, -44.4, 0));          // cast-in position marks 1…5
    });
  });
  K('mainCapBolts', [0, -520, 0], { cut: true, explode: [0, -300, 0], anchor: [0, -56, 48] }, (g) => {
    for (const x of MAINS) for (const z of [-44, 44]) g.add(put(hex('y', 7.5, 8, M.steelDark), x, -48, z), put(cyl('y', 9.5, 2, M.steelDark, 16), x, -44.6, z), put(cyl('y', 5, 76, M.steelDark, 10), x, -6, z));
  });
  K('frontFlange', [-130, 0, 0], { cut: true, explode: [-120, 0, 0], anchor: [-214, 56, 40] }, (g) => {
    const fc = rrect(-78, -62, 78, 52, 22);
    fc.holes.push(circ(0, 0, 21));
    g.add(put(extrudeX(fc, 12, M.alu), -206, 0, 0));
    kp(g, [-60, 0, 0], latheX([[-216, 19], [-216, 25], [-208, 25], [-208, 19], [-216, 19]], M.rubber, 32));   // crankshaft oil seal
    for (const [z, y] of [[-66, -50], [66, -50], [-66, 40], [66, 40], [0, -56], [0, 46]]) kp(g, [-100, 0, 0], put(hex('x', 4.5, 5, M.steelDark), -214, y, z), put(cyl('x', 3, 20, M.steelDark, 8), -204, y, z));
  });

  // ═════════════════════════ cylinder block ═════════════════════════
  const B = N('block'), bp = pieceOf('block');
  tag('block', 'block', [0, 0, 0]);
  tag('headGasket', 'block', [0, 90, 0]);
  tag('pistons', 'block', [0, 300, 0]);
  tag('conrods', 'block', [0, -300, 0]);
  B('pistonRings', [0, 300, 0], { explode: [0, 150, 0], anchor: [-132, 236, 44] }, (g) => follow(g, anim.pistons, (f) => {
    bp(f, [0, 150, 0], put(splitRing(39.7, 1.15, M.steel), 0, 34.6, 0));                                   // 1st: keystone compression ring
    bp(f, [0, 110, 0], put(splitRing(39.7, 1.05, M.steelDark), 0, 27.6, 0));                               // 2nd: taper-face compression ring
    bp(f, [0, 70, 0], put(splitRing(39.7, 1.25, M.steel), 0, 20.6, 0), put(splitRing(38.2, 0.7, M.steelDark), 0, 20.6, 0));   // oil scraper ring + expander spring
  }));
  B('pistonPins', [0, 300, 0], { explode: [0, 150, 0], anchor: [-132, 200, 40] }, (g) => follow(g, anim.pistons, (f) => {
    bp(f, [0, 0, 150], latheX([[-33, 7.5], [-33, 13], [33, 13], [33, 7.5], [-33, 7.5]], M.steel, 28));       // hollow, fully floating pin
    for (const s of [-1, 1]) bp(f, [0, 0, 200 + (s > 0 ? 26 : 0)], put(splitRing(12.4, 0.9, M.steelDark, 'x'), s * 33.6, 0, 0));   // circlips
  }));
  B('rodBearings', [0, -300, 0], { explode: [0, 150, 0], anchor: [-44, 40, 40] }, (g) => follow(g, anim.rods, (f) => {
    bp(f, [0, -52, 0], put(halfRing(-10, 10, 24, 25.5, M.gasket, true), 0, -E.rodL, 0));                    // upper shell (in the rod, takes the firing load)
    bp(f, [0, -92, 0], put(halfRing(-10, 10, 24, 25.5, M.gasket, false), 0, -E.rodL, 0));                   // lower shell (in the cap)
    bp(f, [0, 0, 90], latheX([[-11, 13.05], [-11, 15], [11, 15], [11, 13.05], [-11, 13.05]], M.brass, 28));   // small-end bush
  }));
  B('rodCaps', [0, -440, 0], { explode: [0, 100, 0], anchor: [-44, -30, 44] }, (g) => follow(g, anim.rods, (f) => {
    const s = new THREE.Shape();
    s.moveTo(44, 0); s.lineTo(44, -13); s.absarc(0, 0, 33, -0.4, -Math.PI + 0.4, true); s.lineTo(-44, -13); s.lineTo(-44, 0);
    s.lineTo(-25.5, 0); s.absarc(0, 0, 25.5, Math.PI, TAU, false); s.lineTo(44, 0);
    f.add(put(extrudeX(s, 23.5, M.forged, { bevel: 1 }), 0, -E.rodL, 0));
  }));
  B('rodBolts', [0, -520, 0], { explode: [0, 60, 0], anchor: [-44, -44, 52] }, (g) => follow(g, anim.rods, (f) => {
    for (const z of [-37, 37]) f.add(put(hex('y', 5.5, 6, M.steelDark), 0, -E.rodL - 17, z), put(cyl('y', 4, 44, M.steelDark, 10), 0, -E.rodL + 6, z));
  }));
  B('oilJets', [0, -150, 130], { cut: true, explode: [0, -60, 60], anchor: [-110, 70, 70] }, (g) => {
    E.cylX.forEach((cx) => {
      g.add(put(box(16, 8, 14, M.steelDark, 2), cx + 22, 66, 64));
      g.add(tube([[cx + 22, 68, 62], [cx + 20, 78, 52], [cx + 12, 88, 40]], 2.2, M.steel, { radial: 8 }));
      g.add(put(hex('y', 4.5, 6, M.steelDark), cx + 22, 60, 64));
    });
  });
  B('blockDowels', [0, 60, 0], { explode: [0, 300, 0], anchor: [-176, 246, 60] }, (g) => {
    for (const [x, z] of [[-176, 56], [176, -56]]) g.add(put(latheX([[-7, 5.6], [-7, 7.2], [7, 7.2], [7, 5.6], [-7, 5.6]], M.steel, 20), 0, 0, 0)).children.at(-1).rotateZ(Math.PI / 2).position.set(x, E.deckY, z);
  });

  // ═════════════════════════ cylinder head ═════════════════════════
  const H = N('head'), hp = pieceOf('head');
  tag('head', 'head', [0, 0, 0]);
  tag('valves', 'head', [0, -240, 0]);
  tag('rockers', 'head', [0, 260, 0]);
  tag('camIn', 'head', [0, 400, 30]);
  tag('camEx', 'head', [0, 400, -30]);
  tag('bearingFrame', 'head', [0, 540, 0]);
  tag('injRockers', 'head', [0, 640, 0]);
  tag('glowPlugs', 'head', [0, 130, 190]);
  tag('valveCover', 'head', [0, 1080, 0]);
  const vs = E.cylX.flatMap((cx) => valveLayout(cx));
  H('valveSeats', [0, -45, 0], { explode: [0, 300, 0], anchor: [-132, HY - 2, 40] }, (g) => {
    for (const v of vs) { const R = v.type === 'in' ? E.inR : E.exR; g.add(put(latheX([[0, R - 1.6], [0, R + 2.2], [6, R + 2.2], [6, R - 3.4], [0, R - 1.6]], v.type === 'in' ? M.steelDark : M.exValve, 28), 0, 0, 0)).children.at(-1).rotateZ(Math.PI / 2).position.set(v.x, HY + 0.6, v.z); }
  });
  H('valveGuides', [0, -110, 0], { explode: [0, 300, 0], anchor: [-132, HY + 44, 40] }, (g) => {
    for (const v of vs) g.add(put(latheX([[0, 3.05], [0, 5.6], [42, 5.6], [44, 4.6], [44, 3.05], [0, 3.05]], M.brass, 16), 0, 0, 0)).children.at(-1).rotateZ(Math.PI / 2).position.set(v.x, HY + 20, v.z);
  });
  H('valveSeals', [0, 70, 0], { explode: [0, 345, 0], anchor: [-132, HY + 72, 40] }, (g) => {
    for (const v of vs) g.add(put(cyl('y', 5.8, 7, M.rubber, 14, 4.4), v.x, HY + 67.5, v.z), put(torus('y', 5.4, 0.6, M.steel), v.x, HY + 66, v.z));
  });
  H('camBearings', [0, 0, 0], { explode: [0, 440, 0], anchor: [0, E.camY + 20, E.camZ] }, (g) => {
    for (const x of MAINS) for (const s of [-1, 1]) {
      hp(g, [0, 330, s * 30], put(halfRing(-9, 9, 14.45, 15.7, M.gasket, false), x, E.camY, s * E.camZ));   // lower shell, in the head
      hp(g, [0, 462, s * 30], put(halfRing(-9, 9, 14.45, 15.7, M.gasket, true), x, E.camY, s * E.camZ));    // upper shell, in the bearing frame
    }
  });
  H('camSeals', [-70, 400, 0], { explode: [-60, 440, 0], anchor: [-216, E.camY + 26, E.camZ] }, (g) => {
    for (const s of [-1, 1]) {
      hp(g, [0, 0, s * 30], put(latheX([[-4, 12.6], [-4, 23], [4, 23], [4, 12.6], [-4, 12.6]], M.rubber, 28), -214, E.camY, s * E.camZ));   // belt-end oil seals
    }
    hp(g, [330, 0, -30], put(cyl('x', 23, 6, M.rubber, 28), 201, E.camY, -E.camZ));                         // sealing cap, gearbox end of the exhaust camshaft
  });
  H('headBolts', [0, 900, 0], { explode: [0, 620, 0], anchor: [0, HY + 84, 62] }, (g) => {
    for (const x of MAINS) for (const z of [-56, 56]) {
      g.add(put(cyl('y', 5.6, 168, M.steelDark, 12), x, HY - 10, z), put(cyl('y', 9, 10, M.steelDark, 12), x, HY + 79, z), put(cyl('y', 11, 2, M.steel, 16), x, HY + 73, z));
      g.add(put(cyl('y', 4, 1, M.dark, 8), x, HY + 84.2, z));                                               // internal thread for the bearing frame bolt
    }
  });
  H('coverGasket', [0, 1040, 0], { explode: [0, 600, 0], anchor: [150, HY + 114, 116] }, (g) => {
    const s = rrect(-205, -119, 205, 119, 12);
    s.holes.push(rrect(-197, -111, 197, 111, 8));
    g.add(put(extrudeY(s, 3, M.rubber), 0, HY + 110, 0));
  });

  // ═════════════════════════ unit injectors ═════════════════════════
  // One instance of every component per cylinder. In the head view the whole unit lifts out together
  // (also.head); in the injector view it comes apart along its own axis.
  const LIFT = { head: new THREE.Vector3(0, 800, 0) };
  const jp = pieceOf('injector');
  const J = (id, sub, opts, fn) => {
    const g = A.part(id, opts, (grp) => E.cylX.forEach((cx, ci) => { const u = new THREE.Group(); u.position.set(cx, HY, 0); grp.add(u); fn(u, ci); }));
    Object.assign(g.userData, { group: 'injector', sub: new THREE.Vector3(...sub), subGlobal: 0, also: LIFT });
    return g;
  };
  const ly = (pts, mat, seg = 24) => mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.001), y)), seg), mat);
  tag('injectors', 'injector', [0, 0, 0]);
  A.parts.injectors.userData.also = LIFT;
  const OUT = (s) => [0.707 * s, 0, 0.707 * s];                  // towards the solenoid valve (it sits at 45° to the engine axis)
  J('injPlunger', [0, 0, 0], { explode: [0, 520, 0], anchor: [-132, HY + 156, 0] }, (u, ci) => {
    const e = anim.injectors[ci];
    e.cap.add(put(cyl('y', 4.1, 50, M.steel, 16), 0, -28, 0), put(sphere(4.6, M.steel), 0, 4, 0));   // pump piston under the ball pin
    jp(u, [0, 190, 0], e.cap);                                                                      // ball pin + pump piston (moved by the rocker)
    jp(u, [0, 120, 0], e.spring);                                                                   // piston spring
    jp(u, [0, 86, 0], put(cyl('y', 11, 1.6, M.steelDark, 20), 0, 126.8, 0));                         // spring seat
  });
  J('injSolenoid', [0, 0, 0], { explode: [0, 520, 0], anchor: [-110, HY + 140, 24] }, (u) => {
    const sol = new THREE.Group();
    sol.position.set(13, 121, 15); sol.rotation.y = -Math.PI / 4;
    u.add(sol);
    const along = (d, ...objs) => jp(sol, [d, 0, 0], ...objs);                                      // pieces travel along the valve axis
    along(46, put(cyl('x', 1.5, 22, M.steel, 10), -9, 0, 0), put(cyl('x', 2.6, 3, M.steel, 10), 1, 0, 0));   // valve needle, seats in the body
    along(72, put(cyl('x', 3.2, 5, M.steelDark, 10), 2, 0, 0));                                     // needle spring seat
    along(96, box(15, 24, 24, M.steel, 3), put(cyl('x', 6, 15.4, M.copper, 16), 0, 0, 0));          // magnet coil in its housing
    along(96, put(box(13, 10, 12, M.plasticGrey, 2), 0, 15, 4));                                    // 2-pin connector
    along(124, put(cyl('x', 9.5, 2, M.steelDark, 20), 9, 0, 0));                                    // armature plate
    along(150, put(hex('x', 10, 7, M.steelDark), 13, 0, 0));                                        // cap nut
  });
  J('injClamp', [0, 0, 0], { explode: [0, 520, 0], anchor: [-146, HY + 118, -14] }, (u) => {
    const fl = new THREE.Group();
    fl.position.set(0, 109, 0); fl.rotation.y = Math.PI / 4;
    u.add(fl);
    jp(fl, [0, 40, -70], box(40, 5, 12, M.steelDark, 2));                                           // clamping piece
    for (const x of [-15, 15]) jp(fl, [0, 100, -70], put(hex('y', 4.5, 5, M.steel), x, 4, 0), put(cyl('y', 3, 30, M.steel, 8), x, -12, 0));   // two securing bolts
  });
  J('injSeals', [0, 0, 0], { explode: [0, 520, 0], anchor: [-144, HY + 84, -10] }, (u) => {
    for (const y of [100, 84, 64]) jp(u, OUT(-90), put(torus('y', 10.9, 1.3, M.rubber), 0, y, 0));   // O-rings between the fuel galleries
    jp(u, [0, -300, 0], put(torus('y', 7.2, 0.7, M.steel), 0, 13, 0));                               // retaining ring
    jp(u, [0, -330, 0], put(cyl('y', 7.6, 1.6, M.copper, 16), 0, 10, 0));                            // heat shield seal
  });
  J('injNozzleSpring', [0, 0, 0], { explode: [0, 520, 0], anchor: [-132, HY + 44, 12] }, (u) => {
    jp(u, [0, -24, 0], put(cyl('y', 3.9, 8, M.steel, 14), 0, 53, 0));                                // retraction piston (sets the pilot injection)
    const sp = spring(2.7, 1, 16, 6, M.steelDark);
    sp.position.y = 33;
    jp(u, [0, -62, 0], sp);                                                                          // nozzle spring
    jp(u, [0, -84, 0], put(cyl('y', 3.6, 2, M.steel, 14), 0, 32, 0));                                // spring seat on the needle
  });
  J('injSpacer', [0, -108, 0], { explode: [0, 520, 0], anchor: [-124, HY + 30, 8] }, (u) => {
    u.add(put(cyl('y', 5.2, 3, M.steel, 20), 0, 29.5, 0));
    for (const x of [-3.4, 3.4]) u.add(put(cyl('y', 0.8, 5, M.steelDark, 6), x, 29.5, 0));           // locating pins
  });
  J('injNozzle', [0, -190, 0], { explode: [0, 520, 0], anchor: [-124, HY + 12, 8] }, (u) => {
    u.add(ly([[1, -2.5], [1.8, -2.5], [3.5, 0.5], [3.5, 11], [5.2, 13], [5.2, 28], [1.7, 28], [1.7, 1], [1, -2.5]], M.steel));   // nozzle with needle bore
    for (let k = 0; k < 6; k++) { const a = (k * TAU) / 6; u.add(put(sphere(0.5, M.dark), 1.9 * Math.cos(a), -1.6, 1.9 * Math.sin(a))); }   // six spray holes
    jp(u, [0, 72, 0], ly([[0, -1], [0.7, -1], [1.6, 2.5], [1.6, 24], [2.5, 26], [2.5, 34], [0, 34]], M.steelDark, 14));         // nozzle needle
  });
  J('injNozzleNut', [0, -262, 0], { explode: [0, 520, 0], anchor: [-122, HY + 40, 10] }, (u) => {
    u.add(ly([[3.7, 9.5], [7.5, 11], [7.5, 44], [8.8, 46], [8.8, 57.5], [5.4, 57.5], [5.4, 13], [3.7, 11.5], [3.7, 9.5]], M.steelDark, 28));
    const hx = mesh(new THREE.CylinderGeometry(9.8, 9.8, 9, 6, 1, true), M.steelDark);
    hx.position.y = 51;
    u.add(hx);
  });

  // ═════════════════════════ clips and clamps on the pipe runs ═════════════════════════
  const clip = (id, pts, w = 14) => { const g = A.parts[id]; if (g) for (const p of pts) g.add(put(box(w, 9, 10, M.plastic, 2), ...p)); };
  const band = (id, pts, r, axis) => { const g = A.parts[id]; if (g) for (const p of pts) g.add(put(torus(axis, r + 1.3, 2.2, M.steel), ...p)); };
  clip('vacuumLines', [[60, 331, 178], [-40, 331, 178], [248, 318, -40], [306, 458, -180], [120, 308, -212], [236, 333, 60]]);   // plastic pipe clips
  clip('loom', [[260, 374, 100], [80, 366, 152], [-150, 366, 152]], 16);
  clip('fuelFilter', [[-300, 384, 128], [-430, 310, -60]], 16);
  band('intakePipe', [[-176, 195, -185]], 32, 'x');
}
