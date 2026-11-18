// Everything that plugs into the engine in a Golf V engine bay: charge air cooler and pipes, air filter,
// radiator pack, coolant hoses, fuel filter, vacuum lines, wiring loom, battery, starter and gearbox.
// Layout follows the ETKA illustrations for the Golf 2004–2005 with engine BKD (145-085 charge air cooler,
// 121-045 coolant cooling system, 129-050 air filter) and engine-bay photographs. Hose runs are simplified.
// Axes as in helpers.js; the front of the car is +Z, the gearbox (car's left side) is +X.
import * as THREE from 'three';
import { E } from './engine-core.js';
import { M, mesh, put, cyl, hex, box, sphere, torus, bar, rod, tube, latheX, latheY, extrudeZ, rrect, circ, coreMaterial } from './helpers.js';

const TAU = Math.PI * 2;
const Z = new THREE.Vector3(0, 0, 1);
const sleeve = (x0, x1, rIn, rOut, mat, seg = 32) => latheX([[x0, rIn], [x0, rOut], [x1, rOut], [x1, rIn], [x0, rIn]], mat, seg);

/**
 * Spring band clamp (the VW coolant / fuel / vacuum hose clamp): a flat spring-steel band with two
 * ears that are squeezed together to open it. r = hose outside radius, w = band width.
 * Placed `inset` mm from point a, facing b.
 */
function clamp(g, a, b, r, inset = 12, mat = M.steel, w = r > 6 ? 12 : 6) {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  const c = new THREE.Group();
  const band = mesh(new THREE.CylinderGeometry(r + 0.9, r + 0.9, w, 28, 1, true), mat);
  band.material = mat;
  c.add(band);
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.BoxGeometry(Math.max(2.2, r * 0.22), w * 0.8, Math.max(3, r * 0.3)), mat);
    ear.position.set(s * Math.max(1.6, r * 0.16), 0, r + 0.9 + Math.max(1.5, r * 0.15));
    ear.rotation.y = s * 0.35;
    c.add(ear);
  }
  c.position.set(a[0], a[1], a[2]).addScaledVector(d, inset);
  c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  g.add(c);
}
/** Worm-drive hose clip (intake hose): thin band with a screw housing. */
function screwClamp(g, a, b, r, inset = 8) {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  const c = new THREE.Group();
  c.add(mesh(new THREE.CylinderGeometry(r + 0.8, r + 0.8, 9, 32, 1, true), M.steel));
  const housing = mesh(new THREE.BoxGeometry(14, 9, 8), M.steel);
  housing.position.set(0, 0, r + 4);
  const screw = mesh(new THREE.CylinderGeometry(3.4, 3.4, 8, 6), M.steelDark);
  screw.rotation.z = Math.PI / 2; screw.position.set(11, 0, r + 4);
  c.add(housing, screw);
  c.position.set(a[0], a[1], a[2]).addScaledVector(d, inset);
  c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  g.add(c);
}
/**
 * Charge-air plug-in coupling at point a, facing b: moulded collar with its seal ring inside, held on the
 * mating stub by a U-shaped wire retaining clip; the rubber hose is crimped into the collar with a steel ferrule.
 */
function plugCoupling(g, a, b, r) {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  const c = new THREE.Group();
  const collar = mesh(new THREE.CylinderGeometry(r + 5, r + 4, 26, 28), M.plastic);
  collar.position.y = 13;
  const ferrule = mesh(new THREE.CylinderGeometry(r + 1.6, r + 1.6, 16, 28, 1, true), M.steel);
  ferrule.position.y = 36;
  const clip = mesh(new THREE.TorusGeometry(r + 6.2, 1.4, 6, 28, Math.PI * 1.55), M.steel);
  clip.rotation.x = Math.PI / 2; clip.rotation.z = -Math.PI * 0.275; clip.position.y = 9;
  const tab = mesh(new THREE.BoxGeometry(10, 3, 5), M.steel);
  tab.position.set(0, 9, -(r + 8));
  c.add(collar, ferrule, clip, tab);
  c.position.set(a[0], a[1], a[2]);
  c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  g.add(c);
}
/** Hose through points with a clamp at each end. */
function hose(g, pts, r, mat = M.hose, clamps = true) {
  g.add(tube(pts, r, mat, { cap: false, radial: r > 12 ? 18 : 10 }));
  if (clamps) { clamp(g, pts[0], pts[1], r); clamp(g, pts.at(-1), pts.at(-2), r); }
}
/** Thin line (cable, vacuum pipe) with rounded ends. */
const line = (g, pts, r, mat) => g.add(tube(pts, r, mat, { radial: 8, tension: 0.4 }));
/** Electrical plug at the end of a harness branch. */
const plug = (g, p, mat = M.plasticGrey) => g.add(put(box(13, 11, 17, mat, 2.5), p[0], p[1], p[2]));

export function buildPeriphery(A) {
  const HY = E.headY, HW = 118;
  const P = (id, opts, fn) => { const g = A.part(id, opts, fn); g.userData.periph = true; return g; };

  const RX = 120;                                             // car centre line; the engine sits towards the belt side
  const IC = { w: 615, h: 405, t: 32, z: 512, y: 84 };        // charge air cooler core
  const RAD = { w: 650, h: 450, t: 34, z: 472, y: 95 };       // radiator core
  const CO = { w: 590, h: 380, t: 16, z: 540, y: 96 };        // A/C condenser core
  const TOP = HY + 28;                                        // coolant flange outlet height

  // ───────────────────────── Charge air cooler (intercooler) ─────────────────────────
  P('intercooler', { cut: true, casing: true, explode: [0, 0, 620], anchor: [RX + 150, IC.y + 150, IC.z + 18] }, (g) => {
    g.add(put(box(IC.w, IC.h, IC.t, coreMaterial('icCore', 0xb4b9bf, IC.w, IC.h), 0), RX, IC.y, IC.z));
    // plastic end tanks; belt side takes the outlet half-way up, gearbox side the inlet at the bottom
    g.add(put(box(66, IC.h + 14, 44, M.plastic, 12), RX - IC.w / 2 - 32, IC.y, IC.z - 2));
    g.add(put(box(62, IC.h + 14, 44, M.plastic, 12), RX + IC.w / 2 + 30, IC.y, IC.z - 2));
    for (let k = 0; k < 6; k++) for (const s of [-1, 1]) g.add(put(box(4, 12, 46, M.plastic, 1), RX + s * (IC.w / 2 + 10 + (k % 3) * 18), IC.y - 150 + k * 60, IC.z - 2));
    g.add(put(cyl('z', 30, 34, M.plastic, 28), -268, 80, IC.z - 26));                         // outlet to the intake manifold
    g.add(put(torus('z', 30, 3, M.plastic), -268, 80, IC.z - 42));
    g.add(put(cyl('x', 30, 30, M.plastic, 28), RX + IC.w / 2 + 66, -85, IC.z - 2));           // inlet from the turbocharger
    g.add(put(torus('x', 30, 3, M.plastic), RX + IC.w / 2 + 80, -85, IC.z - 2));
    for (const s of [-1, 1]) g.add(put(box(IC.w + 96, 8, 26, M.rubber, 3), RX, IC.y + s * (IC.h / 2 + 8), IC.z));   // sealing strips
  });

  // ───────────────────────── Pressure pipe: turbocharger → charge air cooler ─────────────────────────
  P('boostPipe', { cut: true, explode: [260, -60, -200], anchor: [520, 262, 40] }, (g) => {
    const a = [[-104, 128, -284], [-84, 110, -296], [-30, 104, -300], [40, 104, -299]];
    const b = [[40, 104, -299], [150, 106, -298], [330, 135, -292], [450, 205, -240], [505, 250, -120], [530, 255, 150], [552, 240, 330], [560, 170, 440], [562, 60, 470]];
    const c = [[562, 60, 470], [560, -30, 490], [540, -80, 505], [RX + IC.w / 2 + 80, -85, IC.z - 2]];
    g.add(tube(a, 28, M.hose, { cap: false, radial: 18 }), tube(b, 26, M.plastic, { cap: false, seg: 160, radial: 18 }), tube(c, 28, M.hose, { cap: false, radial: 18 }));
    plugCoupling(g, a[0], a[1], 28); plugCoupling(g, a.at(-1), a.at(-2), 28);                 // turbocharger, pipe
    plugCoupling(g, c[0], c[1], 28); plugCoupling(g, c.at(-1), c.at(-2), 28);                 // pipe, charge air cooler
    // pulsation damper on the rising section
    g.add(put(sphere(36, M.plastic, 0.8), 596, 150, 444));
    g.add(put(cyl('x', 13, 22, M.plastic, 16), 578, 150, 444));
    for (const p of [[505, 250, -120], [556, 205, 395]]) g.add(put(box(34, 8, 22, M.steelDark, 2), p[0], p[1] + 30, p[2]));   // brackets
  });

  // ───────────────────────── Air filter housing ─────────────────────────
  // Front left of the engine bay (seen from the front: right-hand front), ahead of the battery.
  const AB = { x: 415, y: 370, z: 165, sx: 260, sy: 140, sz: 180 };
  const MAFX = 300;                                              // axis of the air mass meter and the hose behind it
  P('airbox', { casing: true, explode: [380, 220, 200], anchor: [AB.x + 40, AB.y + 78, AB.z + 40] }, (g) => {
    g.add(put(box(AB.sx, 80, AB.sz, M.plastic, 16), AB.x, AB.y - 30, AB.z));                  // lower half
    g.add(put(box(AB.sx + 6, 56, AB.sz + 6, M.plastic, 18), AB.x, AB.y + 42, AB.z));          // lid
    g.add(put(box(AB.sx + 12, 8, AB.sz + 12, M.plasticGrey, 3), AB.x, AB.y + 12, AB.z));      // joint
    for (let k = 0; k < 7; k++) g.add(put(box(12, 5, AB.sz - 50, M.plastic, 2), AB.x - 30 + k * 26, AB.y + 71, AB.z));   // lid ribs
    g.add(put(box(54, 3, 54, M.plasticGrey, 3), AB.x - 96, AB.y + 71, AB.z - 30));            // moulded panel on the lid
    for (const [dx, dz] of [[-116, -78], [116, -78], [-116, 78], [116, 78], [0, 82]]) g.add(put(hex('y', 5, 6, M.steelDark), AB.x + dx, AB.y + 71, AB.z + dz));   // lid screws
    g.add(put(box(84, 84, 30, M.plastic, 10), MAFX, 385, AB.z - AB.sz / 2 - 6));              // outlet neck towards the air mass meter
    // intake duct: wide flat duct from the lock carrier into the front of the housing
    g.add(put(box(230, 46, 62, M.plastic, 12), 262, 372, 306));
    g.add(put(box(210, 30, 4, M.dark), 262, 374, 338));
    g.add(tube([[300, 368, 290], [316, 360, 270], [330, 352, 252]], 30, M.plastic, { cap: false, radial: 18 }));
    for (const [x, z] of [[AB.x - 100, AB.z - 96], [AB.x + 100, AB.z - 96]]) g.add(put(cyl('y', 9, 20, M.rubber, 14), x, AB.y - 78, z));   // rubber mounts
  });

  // ───────────────────────── Air mass meter G70 ─────────────────────────
  P('maf', { explode: [220, 300, 0], anchor: [MAFX, 446, 30] }, (g) => {
    g.add(put(cyl('z', 37, 70, M.plastic, 32), MAFX, 385, 30));
    for (const z of [-3, 63]) g.add(put(torus('z', 37.5, 2.6, M.plastic), MAFX, 385, z));
    g.add(put(box(34, 16, 44, M.plastic, 3), MAFX, 423, 30));
    plug(g, [MAFX, 435, 16]);
    for (const [dx, dy] of [[-30, -30], [30, 30]]) g.add(put(hex('z', 4, 5, M.steelDark), MAFX + dx, 385 + dy, 66));   // two screws to the housing
  });

  // ───────────────────────── Intake pipe: air mass meter → compressor ─────────────────────────
  P('intakePipe', { explode: [0, 320, -260], anchor: [-60, 420, -240] }, (g) => {
    const prof = [];
    for (let i = 0; i <= 18; i++) prof.push([i * 5, i % 2 ? 40 : 35.5]);
    const corr = latheX([[-6, 38], ...prof, [96, 38]], M.rubber, 32);                          // corrugated bellows, runs back along the engine
    corr.rotation.y = Math.PI / 2; corr.position.set(MAFX, 385, -4);
    g.add(corr);
    screwClamp(g, [MAFX, 385, 0], [MAFX, 385, -40], 39);
    screwClamp(g, [MAFX, 386, -98], [MAFX, 385, -40], 39);
    const p = [[MAFX, 386, -96], [292, 390, -150], [250, 396, -200], [170, 398, -224], [60, 392, -236], [-80, 385, -240], [-180, 360, -240], [-232, 300, -228], [-240, 235, -200], [-215, 198, -186], [-176, 195, -185]];
    g.add(tube(p, 32, M.plastic, { cap: false, seg: 160, radial: 20 }));
    screwClamp(g, p.at(-1), p.at(-2), 32, 6);
    g.add(put(sleeve(-9, 9, 30, 36, M.rubber), 0, 0, 0)).children.at(-1).position.set(-186, 195.5, -185);   // connecting piece with O-ring at the compressor
    g.add(put(cyl('y', 9, 26, M.plastic, 14), 40, 426, -238), put(torus('y', 9.6, 1.4, M.plastic), 40, 437, -238));   // crankcase breather connection
    for (const x of [-40, 110]) g.add(put(box(26, 6, 30, M.plastic, 2), x, 386 + (110 - x) * 0.03, -208));   // retaining lugs
  });

  // ───────────────────────── Radiator ─────────────────────────
  P('radiator', { cut: true, casing: true, explode: [0, 0, 520], anchor: [RX - 200, RAD.y + 190, RAD.z - 16] }, (g) => {
    g.add(put(box(RAD.w, RAD.h, RAD.t, coreMaterial('radCore', 0x7d838a, RAD.w, RAD.h, 0.6), 0), RX, RAD.y, RAD.z));
    for (const s of [-1, 1]) {
      g.add(put(box(30, RAD.h + 16, 46, M.plastic, 10), RX + s * (RAD.w / 2 + 14), RAD.y, RAD.z));
      for (const y of [RAD.y + RAD.h / 2 + 14, RAD.y - RAD.h / 2 - 14]) g.add(put(cyl('y', 9, 16, M.rubber, 14), RX + s * (RAD.w / 2 - 40), y, RAD.z));   // mounts
    }
    const tx = RX + RAD.w / 2 + 14;
    for (const y of [285, -95]) {                                                            // both hose stubs on the gearbox-side tank
      g.add(put(cyl('z', 17, 34, M.plastic, 22), tx, y, RAD.z - 38));
      g.add(put(torus('z', 17.5, 2.2, M.plastic), tx, y, RAD.z - 52));
    }
    g.add(put(cyl('z', 5, 16, M.plastic, 10), RX - RAD.w / 2 - 14, 300, RAD.z - 28));         // vent to the expansion tank
  });

  // ───────────────────────── Radiator fans V7 / V35 with shroud ─────────────────────────
  P('fans', { cut: true, casing: true, explode: [0, 0, 380], anchor: [RX + 125, 95, 404] }, (g) => {
    const fans = [{ x: RX + 132, r: 176 }, { x: RX - 178, r: 142 }];
    const s = rrect(RX - 322, RAD.y - 222, RX + 322, RAD.y + 222, 18);
    fans.forEach((f) => s.holes.push(circ(f.x, 95, f.r + 4)));
    g.add(put(extrudeZ(s, 5, M.plastic), 0, 0, 447));
    fans.forEach((f, i) => {
      for (const z of [446, 420]) g.add(put(torus('z', f.r + 6, 4, M.plastic), f.x, 95, z));
      const n = i ? 7 : 9;
      const rot = new THREE.Group();
      rot.add(cyl('z', 44, 30, M.plastic, 28));
      for (let k = 0; k < n; k++) {
        const arm = new THREE.Group();
        const bl = box(f.r - 48, 46, 2.5, M.plastic, 1);
        bl.position.x = 44 + (f.r - 48) / 2; bl.rotation.x = 0.55;
        arm.add(bl); arm.rotation.z = (k * TAU) / n;
        rot.add(arm);
      }
      rot.add(put(torus('z', f.r - 2, 2.5, M.plastic), 0, 0, 0));
      rot.position.set(f.x, 95, 432);
      g.add(rot);
      g.add(put(cyl('z', 38, 40, M.steelDark, 24), f.x, 95, 404));                            // motor
      for (let k = 0; k < 3; k++) {
        const a = 0.5 + (k * TAU) / 3;
        g.add(bar([f.x + 36 * Math.cos(a), 95 + 36 * Math.sin(a), 408], [f.x + (f.r + 6) * Math.cos(a), 95 + (f.r + 6) * Math.sin(a), 422], 12, 5, M.plastic, 2));
      }
    });
    g.add(put(box(70, 34, 20, M.plastic, 4), RX - 20, RAD.y + 190, 436));                     // fan control unit J293
    plug(g, [RX - 20, RAD.y + 190, 422]);
  });

  // ───────────────────────── A/C condenser with refrigerant lines ─────────────────────────
  P('condenser', { cut: true, casing: true, explode: [0, 0, 720], anchor: [RX - 150, CO.y - 120, CO.z + 12] }, (g) => {
    g.add(put(box(CO.w, CO.h, CO.t, coreMaterial('coCore', 0xc2c6ca, CO.w, CO.h), 0), RX, CO.y, CO.z));
    for (const s of [-1, 1]) g.add(put(box(16, CO.h + 6, 22, M.alu, 4), RX + s * (CO.w / 2 + 8), CO.y, CO.z));
    g.add(put(cyl('y', 17, CO.h - 40, M.alu, 20), RX - CO.w / 2 - 34, CO.y, CO.z + 4));       // receiver / dryer
    // high-pressure line from the compressor, and the suction line back from the bulkhead
    line(g, [[-140, 54, 250], [-200, 20, 330], [-276, -30, 430], [-286, -52, 520], [-262, -60, 560], [RX - CO.w / 2 - 8, -62, CO.z + 8]], 7, M.alu);
    line(g, [[-118, 56, 236], [-200, 96, 286], [-296, 150, 240], [-312, 232, 100], [-330, 256, -150], [-322, 300, -385]], 9, M.alu);
    g.add(put(hex('y', 9, 10, M.blue), -322, 296, -330));                                     // service port cap
  });

  // ───────────────────────── Coolant circuit, connected as in ETKA 121-045 ─────────────────────────
  //   radiator circuit : flange on the head → upper hose → radiator → lower hose → thermostat housing
  //   heater circuit   : flange → hose 44 → EGR cooler → hose 45 → heat exchanger → hose 42 → coolant pipe 10 → pump
  //   oil cooler       : hose 16 from the block, hose 15 back into coolant pipe 10
  //   expansion tank   : hose 50 into coolant pipe 10; vent pipe 38 with hoses 24 / 25 / 48 / 49 into the top of the tank
  // Hose sizes follow the spring band clamps listed: Ø 40 (radiator), Ø 27 and Ø 23 (heater, tank), Ø 14 (vent).
  const radX = RX + RAD.w / 2 + 14;
  const EC = { y: HY + 118, z: -(HW + 36) };                    // EGR cooler, as placed in engine-ancillaries.js
  /** Quick-release coupling at point a, facing b: plastic sleeve with its wire retaining spring. */
  const coupling = (g, a, b, r) => {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
    const s = mesh(new THREE.CylinderGeometry(r + 4.5, r + 4.5, 22, 24), M.plastic);
    s.position.set(a[0], a[1], a[2]).addScaledVector(d, 11);
    s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    const w = mesh(new THREE.TorusGeometry(r + 5.6, 1.2, 6, 24, Math.PI * 1.5), M.steel);
    w.position.set(a[0], a[1], a[2]).addScaledVector(d, 6);
    w.quaternion.setFromUnitVectors(Z, d);
    g.add(s, w);
  };
  /** Hose with a quick-release coupling at the listed ends and a spring band clamp behind each. */
  const coupled = (g, pts, r, ends = [0, 1]) => {
    g.add(tube(pts, r, M.hose, { cap: false, radial: 18 }));
    if (ends.includes(0)) { coupling(g, pts[0], pts[1], r); clamp(g, pts[0], pts[1], r, 28); } else clamp(g, pts[0], pts[1], r);
    if (ends.includes(1)) { coupling(g, pts.at(-1), pts.at(-2), r); clamp(g, pts.at(-1), pts.at(-2), r, 28); } else clamp(g, pts.at(-1), pts.at(-2), r);
  };
  P('hoseTop', { cut: true, explode: [140, 200, 240], anchor: [345, 312, 270] }, (g) => {
    coupled(g, [[218, TOP, 57], [224, TOP + 3, 96], [262, 280, 170], [345, 292, 270], [430, 292, 368], [radX, 285, RAD.z - 52]], 20);
    g.add(put(box(10, 26, 24, M.steelDark, 2), 300, 268, 214));                                   // hose bracket
  });
  P('hoseBottom', { cut: true, explode: [120, -200, 240], anchor: [170, -18, 304] }, (g) => {
    coupled(g, [[radX, -95, RAD.z - 52], [448, -92, 372], [330, -70, 318], [170, -40, 300], [40, -25, 292], [-28, 30, 246], [-38, 92, 190], [-30, 120, 147]], 20);
    g.add(put(cyl('y', 9, 26, M.plastic, 14), 444, -70, 368));                                    // radiator outlet coolant temperature sender G83
    plug(g, [444, -52, 368], M.green);
    g.add(put(torus('z', 16.6, 2, M.rubber), -30, 120, 146));                                     // O-ring 32 × 4 in the coupling
  });
  P('coolantPipes', { cut: true, explode: [0, -120, 160], anchor: [100, 74, 108] }, (g) => {
    // item 10: steel pipe along the front of the block, plugged into the pump inlet at the belt end, rising at the gearbox end
    g.add(tube([[-150, 62, 98], [-100, 62, 98], [60, 60, 98], [176, 62, 98], [204, 100, 97], [212, 150, 96]], 10, M.steelDark, { cap: true, tension: 0.15, seg: 90 }));
    g.add(tube([[-100, 62, 98], [-106, 82, 93], [-112, 100, 87]], 9, M.steelDark, { cap: true }));  // branch into the block
    const o = torus('y', 9.6, 2.4, M.rubber);                                                      // seal ring 20.5 × 5.5
    o.position.set(-110, 95, 89); o.rotation.x = 0.3;
    g.add(o);
    g.add(put(box(20, 24, 6, M.steelDark, 2), 10, 74, 91), put(hex('z', 5, 5, M.steelDark), 10, 80, 95));      // lug, bolt M7 × 12
    g.add(put(cyl('z', 4, 20, M.steel, 8), 140, 78, 94), put(hex('z', 6.5, 6, M.steelDark), 140, 78, 100), put(box(18, 22, 5, M.steelDark, 2), 140, 72, 92));   // double stud M10 × 20 / M8 × 12
    for (const [x, y] of [[60, 60], [-150, 62]]) g.add(put(torus(x > 0 ? 'z' : 'x', 10.6, 1.6, M.steelDark), x, y, x > 0 ? 110 : 98));
    g.add(put(cyl('z', 9, 18, M.steelDark, 16), 60, 60, 106), put(cyl('z', 9, 16, M.castIron, 16), 150, 40, 90));  // stubs: pipe branch, cylinder block
    hose(g, [[46, 6, 190], [40, 30, 152], [60, 58, 116]], 11.5);                                      // item 15: oil cooler → coolant pipe
    hose(g, [[130, 6, 190], [152, 20, 150], [150, 40, 99]], 11.5);                                    // item 16: oil cooler → cylinder block
    hose(g, [[230, HY + 52, -50], [210, 340, -85], [130, 410, -135], [-20, 428, -152], [-60, EC.y + 60, EC.z]], 13.5);   // item 44: flange → EGR cooler
  });
  P('heaterHoses', { explode: [200, 160, -260], anchor: [268, 300, -250] }, (g) => {
    // item 45: EGR cooler → heat exchanger (feed), over the intake pipe to the bulkhead
    g.add(put(cyl('y', 10, 26, M.alu, 16), -140, EC.y + 44, EC.z), put(torus('y', 10.6, 1.8, M.alu), -140, EC.y + 55, EC.z));
    coupled(g, [[-140, EC.y + 58, EC.z], [-120, 446, -200], [-40, 452, -262], [120, 430, -300], [250, 332, -352], [290, 300, -385]], 13.5, [1]);
    // item 42: heat exchanger → coolant pipe (return), down round the gearbox end
    coupled(g, [[250, 300, -385], [268, 296, -250], [280, 270, -120], [280, 222, -20], [268, 180, 50], [236, 153, 88], [214, 150, 96]], 13.5, [0]);
    for (const x of [250, 290]) g.add(put(cyl('z', 12, 10, M.alu, 16), x, 300, -390));              // heat exchanger pipes at the bulkhead
    g.add(put(box(10, 30, 26, M.steelDark, 2), 286, 246, -70));                                    // hose bracket
  });
  P('ventLines', { explode: [0, 260, -120], anchor: [-40, 446, -130] }, (g) => {
    const m = M.hose;
    g.add(tube([[-240, 432, -138], [-100, 436, -130], [130, 424, -118], [206, 356, -80]], 4, M.steelDark, { radial: 8, tension: 0.3, seg: 60 }));   // item 38: vent pipe behind the head cover
    for (const x of [-170, 0, 110]) g.add(put(box(8, 12, 12, M.steelDark, 2), x, 430, -124));       // brackets 7.2 × 6.5 with M6 × 15
    for (const dz of [0, 15]) line(g, [[206, 356, -80 + dz], [220, 320, -62 + dz], [228, HY + 60, -52 + dz]], 7, m);   // item 48: twin hose from the flange
    line(g, [[-240, 432, -138], [-272, 434, -134], [-300, 432, -128]], 7, m);                      // item 25
    line(g, [[RX - RAD.w / 2 - 14, 300, RAD.z - 36], [-262, 330, 380], [-300, 362, 200], [-330, 404, 0], [-312, 440, 40], [-300, 432, -128]], 7, m);   // item 24: radiator vent
    g.add(put(cyl('x', 5, 26, M.plastic, 10), -300, 432, -128), put(cyl('z', 5, 18, M.plastic, 10), -300, 432, -120));   // item 26: distributor 8 × 8 × 8
    line(g, [[-311, 432, -128], [-322, 446, -90], [-330, 444, -52]], 7, m);                        // item 49: to the tank
    for (const p of [[-262, 330, 380], [-330, 404, 0], [214, 336, -70], [-240, 432, -138], [-289, 432, -128], [-311, 432, -128]]) clamp(g, p, [p[0] + 1, p[1], p[2]], 7, 0);   // spring band clamps 14 × 12
  });
  P('expansionTank', { explode: [-300, 200, -160], anchor: [-385, 478, -160] }, (g) => {
    const c = [-372, 395, -30];
    g.add(put(sphere(86, M.tank, 0.86), ...c));
    g.add(put(torus('y', 86, 3.5, M.tank), ...c));
    g.add(put(cyl('y', 30, 18, M.tank, 28), c[0], c[1] + 72, c[2]));
    g.add(put(cyl('y', 34, 22, M.blue, 28), c[0], c[1] + 88, c[2]));                               // pressure cap
    for (let k = 0; k < 12; k++) { const a = (k * TAU) / 12; g.add(put(box(5, 22, 5, M.blue, 1), c[0] + 35 * Math.cos(a), c[1] + 88, c[2] + 35 * Math.sin(a))); }
    g.add(put(cyl('y', 12, 16, M.tank, 16), c[0], c[1] - 78, c[2]));
    g.add(put(cyl('z', 5, 16, M.tank, 10), c[0] + 42, c[1] + 49, c[2] - 30));                      // vent connection
    plug(g, [c[0] + 20, c[1] - 80, c[2] + 22]);                                                    // coolant shortage indicator sender G32
    g.add(put(box(40, 60, 10, M.plastic, 3), c[0] - 70, c[1] - 30, c[2] - 60));                    // body bracket
    // item 50: expansion tank → coolant pipe. Down the belt end, under the vibration damper, up behind the A/C compressor.
    hose(g, [[c[0], c[1] - 84, c[2]], [-372, 230, -40], [-348, 60, -30], [-300, -90, 0], [-250, -118, 60], [-210, -80, 134], [-170, 10, 132], [-154, 52, 116], [-150, 62, 108]], 11.5);
    g.add(put(box(12, 30, 26, M.plastic, 3), -350, 110, -34));                                     // item 51: hose bracket
  });

  // ───────────────────────── Fuel filter with lines ─────────────────────────
  P('fuelFilter', { explode: [-300, 100, 120], anchor: [-385, 392, 60] }, (g) => {
    const c = [-372, 300, 128];
    g.add(put(latheY([[30, -72], [44, -62], [44, 62], [47, 64], [47, 70], [0, 70]], M.alu, 36), ...c));
    g.add(put(cyl('y', 46, 14, M.plastic, 36), c[0], c[1] + 77, c[2]));
    for (let k = 0; k < 5; k++) { const a = 0.3 + (k * TAU) / 5; g.add(put(hex('y', 4, 4, M.steel), c[0] + 38 * Math.cos(a), c[1] + 85, c[2] + 38 * Math.sin(a))); }
    g.add(put(box(34, 20, 26, M.plastic, 4), c[0], c[1] + 92, c[2]));                         // preheating valve
    g.add(put(hex('y', 7, 8, M.brass), c[0], c[1] - 76, c[2]));                               // water drain screw
    g.add(put(box(12, 110, 70, M.steelDark, 3), c[0] - 50, c[1], c[2]));                      // retainer (ETKA 127-020, item 5)
    g.add(bar([c[0] - 50, c[1] - 52, c[2]], [c[0] + 46, c[1] - 80, c[2] - 6], 30, 4, M.steelDark, 2));
    g.add(put(box(60, 44, 70, M.aluRough, 8), c[0] + 72, c[1] - 98, c[2] - 10));               // engine mount bracket the retainer is bolted to
    g.add(put(hex('y', 5, 5, M.steelDark), c[0] + 50, c[1] - 74, c[2] - 6));                   // bolt M6 × 10 with nut
    for (const [dx, dz] of [[12, 8], [12, -8], [-14, -8], [-14, 8]]) {                          // four line connections on the flange lid, spring band clamps 14 × 12
      g.add(put(cyl('y', 4.6, 14, M.plastic, 10), c[0] + dx, c[1] + 96, c[2] + dz));
      clamp(g, [c[0] + dx, c[1] + 100, c[2] + dz], [c[0] + dx, c[1] + 110, c[2] + dz], 7, 0);
    }
    g.add(put(torus('y', 45, 1.6, M.rubber), c[0], c[1] + 70, c[2]));                          // lid seal
    // to the tandem pump (supply + return) and back to the tank
    line(g, [[-212, HY + 96, HW + 34], [-262, 352, 150], [-330, 400, 112], [c[0] + 12, c[1] + 100, c[2] + 8]], 7, M.hose);
    line(g, [[-212, HY + 105, HW + 39], [-258, 366, 160], [-325, 414, 104], [c[0] + 12, c[1] + 100, c[2] - 8]], 7, M.hose);
    line(g, [[c[0] - 14, c[1] + 100, c[2] - 8], [-440, 372, 110], [-470, 250, 0], [-424, 180, -300], [-412, 170, -385]], 7, M.hose);
    line(g, [[c[0] - 14, c[1] + 100, c[2] + 8], [-452, 378, 120], [-484, 250, 8], [-438, 172, -300], [-426, 160, -385]], 7, M.hose);
  });

  // ───────────────────────── Vacuum lines (ETKA 131-080 and 611-070) ─────────────────────────
  // pump → brake servo pipe with non-return valve; a branch with its own non-return valve supplies the
  // solenoid valve unit, which stores vacuum in the reservoir, vents to the air filter housing and sends
  // one controlled line each to the EGR valve, the EGR cooler flap and the turbocharger actuator.
  P('vacuumLines', { cut: true, explode: [0, 420, 60], anchor: [20, 336, 178] }, (g) => {
    const r = 4, m = M.plasticGrey;
    const vl = (pts) => {                                             // hose with a spring band clamp 8 × 6 at each end
      line(g, pts, r, m);
      clamp(g, pts[0], pts[1], r, 5); clamp(g, pts.at(-1), pts.at(-2), r, 5);
    };
    line(g, [[244, E.camY + 76, E.camZ], [264, 460, 40], [285, 462, 0], [306, 458, -100], [310, 448, -300], [310, 438, -385]], 5.5, M.plastic);   // vacuum pipe to the brake servo
    g.add(put(cyl('z', 9, 12, M.plastic, 12), 310, 438, -386));
    g.add(put(cyl('z', 10, 24, M.tank, 16), 300, 459, -60), put(cyl('z', 12, 4, M.plastic, 16), 300, 459, -60));   // non-return valve in the servo pipe
    for (const z of [-140, -260]) g.add(put(box(12, 10, 12, M.plastic, 2), 308, 446 + (z + 260) * 0.05, z));       // pipe clips
    g.add(put(sphere(6.5, M.plastic), 264, 460, 40));                                                               // T-piece
    vl([[264, 458, 40], [248, 440, 120], [208, 374, 182], [176, 353, 192]]);                                        // supply to the valve unit
    g.add(put(cyl('y', 7, 18, M.tank, 14), 232, 414, 148), put(cyl('y', 8.5, 3, M.plastic, 14), 232, 414, 148));    // non-return valve (131-080, item 16)
    g.add(put(box(66, 9, 9, M.plasticGrey, 2), 172, 352, 194));                                                     // hose connector strip on the valve unit (item 27)
    vl([[172, 350, 196], [120, 331, 178], [-100, 331, 178], [-168, 345, 212], [-176, 352, 222]]);                   // to the vacuum reservoir
    vl([[194, 350, 194], [236, 330, 122], [252, 318, 0], [250, 316, -100], [200, 312, -190], [60, 305, -238], [-30, 280, -252], [-62, 200, -256], [-84, 150, -240], [-92, 136, -222]]);   // N75 → turbocharger actuator
    vl([[150, 348, 194], [90, 290, 206], [-30, 232, 198], [-56, 206, 188], [-58, HY - 40, 180]]);                    // N18 → EGR valve
    vl([[166, 346, 198], [230, 336, 126], [246, 331, 0], [243, 335, -95], [170, 330, -165], [60, 318, -170], [30, 312, -162]]);   // N345 → EGR cooler flap
    vl([[200, 346, 198], [240, 336, 186], [272, 326, 150], [296, 322, 112]]);                       // vent hose to the air filter housing
  });

  // ───────────────────────── Engine wiring loom ─────────────────────────
  P('loom', { cut: true, explode: [60, 460, 120], anchor: [-40, 380, 156] }, (g) => {
    const trunk = [[286, 322, -385], [282, 320, -280], [276, 318, -150], [274, 318, -40], [272, 328, 60], [264, 356, 136], [225, 370, 160], [190, 367, 154], [0, 366, 152], [-190, 366, 152], [-214, 352, 138]];
    g.add(tube(trunk, 10, M.loom, { cap: true, seg: 200, radial: 12, tension: 0.3 }));
    g.add(put(box(40, 30, 14, M.plastic, 4), 286, 322, -390));                                // bulkhead grommet towards engine control unit J623
    for (const x of [140, 20, -100]) g.add(put(box(14, 26, 14, M.plastic, 3), x, 356, 150));  // clips on the intake manifold
    const br = (pts) => { line(g, pts, 3.4, M.loom); plug(g, pts.at(-1)); };
    br([[274, 318, -40], [250, 372, -22], [216, 398, 14], [200, HY + 160, 26]]);              // unit injectors + glow plugs (central connector)
    br([[274, 318, -44], [254, 322, -46], [230, HY + 74, -42]]);                              // G62
    br([[190, 367, 154], [178, 360, 170], [172, HY + 106, 178]]);                             // N18 / N345 / N75
    line(g, [[140, 366, 152], [146, 342, 142], [145, HY + 91, 134]], 3.4, M.loom);            // glow plug rail
    br([[60, 366, 152], [64, 330, 186], [72, 250, 204], [70, 172, 196]]);                     // V157
    br([[-60, 366, 152], [-70, 320, 190], [-100, 220, 262], [-120, 150, 334]]);               // G31 / G42
    br([[-110, 366, 152], [-112, 320, 192], [-112, 262, 238]]);                               // alternator DF / L
    br([[-214, 352, 138], [-214, 345, 110], [-212, HY + 104, E.camZ + 8]]);                   // G40
    br([[264, 356, 136], [240, 300, 128], [228, 200, 118], [214, 80, 108], [208, 46, 100]]);  // G28
    br([[228, 200, 118], [290, 186, 142], [326, 176, 158]]);                                  // starter terminal 50
    br([[273, 322, 20], [258, 380, 8], [272, 432, 12], [296, 438, 16]]);                      // G70
  });

  // ───────────────────────── Battery ─────────────────────────
  const BT = { x: 436, y: 398, z: -116, sx: 175, sy: 190, sz: 242 };
  P('battery', { casing: true, explode: [420, 200, 120], anchor: [BT.x, BT.y + 108, BT.z] }, (g) => {
    g.add(put(box(BT.sx, BT.sy, BT.sz, M.plastic, 8), BT.x, BT.y, BT.z));
    g.add(put(box(BT.sx + 2, 16, BT.sz + 2, M.plasticGrey, 5), BT.x, BT.y + BT.sy / 2 - 12, BT.z));
    g.add(put(box(70, 2, 120, M.tank, 1), BT.x, BT.y + BT.sy / 2, BT.z + 20));                 // label
    g.add(put(box(BT.sx + 8, BT.sy - 30, BT.sz + 8, M.loom, 6), BT.x, BT.y - 22, BT.z));       // insulating fabric jacket
    for (const [dx, mat] of [[-50, M.red], [50, M.plasticGrey]]) {
      g.add(put(cyl('y', 9, 16, M.lead, 16), BT.x + dx, BT.y + BT.sy / 2 + 6, BT.z + 96));
      g.add(put(box(28, 12, 22, mat, 3), BT.x + dx, BT.y + BT.sy / 2 + 12, BT.z + 96));
    }
    g.add(put(box(BT.sx + 30, 10, BT.sz + 30, M.plastic, 4), BT.x, BT.y - BT.sy / 2 - 5, BT.z));   // tray
    g.add(put(box(BT.sx + 34, 60, 6, M.plastic, 2), BT.x, BT.y - BT.sy / 2 + 26, BT.z + BT.sz / 2 + 14));
    for (const dx of [-100, 100]) g.add(put(cyl('y', 10, 76, M.steelDark, 12), BT.x + dx, 258, BT.z - 60));   // tray supports on the body
  });

  // ───────────────────────── Starter ─────────────────────────
  const ST = { y: 112, z: 114 };
  P('starter', { cut: true, explode: [240, 60, 200], anchor: [370, ST.y + 84, ST.z + 24] }, (g) => {
    g.add(put(cyl('x', 31, 44, M.alu, 28), 284, ST.y, ST.z));                                  // drive end housing
    g.add(put(box(12, 96, 60, M.alu, 6), 300, ST.y + 14, ST.z + 6));                           // flange
    g.add(put(cyl('x', 38, 120, M.paintBlack, 32), 366, ST.y, ST.z));                          // motor
    g.add(put(cyl('x', 34, 12, M.steelDark, 28), 432, ST.y, ST.z));
    g.add(put(cyl('x', 24, 86, M.paintBlack, 24), 352, ST.y + 56, ST.z + 22));                 // solenoid switch
    g.add(put(cyl('x', 20, 10, M.plastic, 20), 400, ST.y + 56, ST.z + 22));
    g.add(put(hex('x', 6, 14, M.copper), 410, ST.y + 62, ST.z + 30));                          // terminal 30
    g.add(put(hex('x', 4, 10, M.brass), 408, ST.y + 46, ST.z + 14));                           // terminal 50
    const pin = put(cyl('x', 16, 20, M.steel, 12), 252, ST.y, ST.z);                           // pinion
    g.add(pin);
    for (const z of [-22, 34]) g.add(put(hex('x', 7, 8, M.steelDark), 308, ST.y + 52 * (z < 0 ? 1 : -0.6), ST.z + z));
  });

  // ───────────────────────── Battery cables and earth strap ─────────────────────────
  P('powerCables', { cut: true, explode: [200, 260, 200], anchor: [390, 330, 196] }, (g) => {
    const plus = [BT.x - 50, BT.y + BT.sy / 2 + 14, BT.z + 96];
    const minus = [BT.x + 50, BT.y + BT.sy / 2 + 14, BT.z + 96];
    line(g, [plus, [384, 506, 20], [376, 470, 44], [372, 330, 52], [380, 250, 90], [404, 192, 140], [412, 174, 144]], 6.5, M.red);   // battery + → starter
    line(g, [[412, 176, 146], [330, 150, 220], [150, 166, 264], [20, 172, 270], [-80, 200, 272], [-112, 216, 262]], 5, M.red);         // starter → alternator B+
    g.add(put(hex('x', 6, 8, M.copper), -110, 216, 262));
    line(g, [minus, [500, 506, 20], [520, 470, 44], [540, 330, 50], [552, 220, 54], [524, 128, 60]], 6.5, M.rubber);                // battery − → gearbox
    g.add(put(box(26, 4, 16, M.copper, 1), 520, 124, 56));
    g.add(put(hex('y', 6, 6, M.steel), 520, 128, 56));
  });

  // ───────────────────────── Front exhaust pipe with flexible joint ─────────────────────────
  const CX = -62 + 154, TZ = -185;
  P('frontPipe', { explode: [80, -200, -420], anchor: [100, -150, -380] }, (g) => {
    g.add(tube([[CX, -74, TZ + 4], [CX, -112, TZ - 4], [96, -150, -232], [100, -165, -300]], 27, M.stainless, { cap: false }));
    g.add(put(cyl('y', 40, 6, M.exhaustDark, 28), CX, -80, TZ + 4));
    const flex = cyl('z', 35, 120, M.braid, 28);
    g.add(put(flex, 100, -165, -360));
    for (const z of [-298, -422]) g.add(put(cyl('z', 37, 12, M.stainless, 28), 100, -165, z));
    g.add(put(cyl('z', 27, 110, M.stainless, 24), 100, -165, -482));
    g.add(put(torus('z', 28, 3, M.exhaustDark), 100, -165, -536));
  });
}
