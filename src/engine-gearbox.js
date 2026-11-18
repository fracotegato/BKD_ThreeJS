// 02Q six-speed manual gearbox (codes GRF / GVT / HDV), LuK 240 mm clutch on a dual-mass flywheel,
// and the hydraulic clutch control. Tooth counts, bearing sizes and the order of the parts on each
// shaft are from ETKA (311-042 input shaft, 311-043 output shaft 1st–4th, 311-044 output shaft 5th/6th,
// 311-092 switch unit, 141-060 clutch). Shaft positions, widths and housing shapes are scaled (≈);
// gears are drawn with straight teeth although the real ones are helical.
// x = crankshaft axis (engine flange at x = 212), input shaft on the crank axis.
import * as THREE from 'three';
import { M, mesh, put, cyl, hex, box, sphere, torus, bar, rod, tube, latheX, extrudeX, circ, gearShape, spring } from './helpers.js';

const TAU = Math.PI * 2;
const ring = (n, r, fn, phase = 0) => { for (let k = 0; k < n; k++) { const a = phase + (k * TAU) / n; fn(r * Math.cos(a), r * Math.sin(a), a); } };
const sleeve = (x0, x1, rIn, rOut, mat, seg = 36) => latheX([[x0, rIn], [x0, rOut], [x1, rOut], [x1, rIn], [x0, rIn]], mat, seg);

function gear(n, rp, x0, x1, mat, bore = 0) {
  const m = (2 * rp) / n, s = gearShape(n, rp - 1.2 * m, rp + 0.9 * m);
  if (bore) s.holes.push(circ(0, 0, bore));
  return put(extrudeX(s, x1 - x0, mat, { curve: 6 }), (x0 + x1) / 2, 0, 0);
}
/** Loose gear wheel: running teeth, a friction cone and dog teeth on the side facing its synchroniser. */
function changeGear(n, rp, x0, x1, bore, side) {
  const g = new THREE.Group();
  g.add(gear(n, rp, x0, x1, M.steel, bore));
  const a = side > 0 ? x1 : x0 - 8, b = a + 8;
  g.add(gear(32, 30, side > 0 ? a : b - 3, side > 0 ? a + 3 : b, M.steelDark, bore));
  g.add(latheX(side > 0 ? [[a + 3, bore], [a + 3, 27], [b, 25], [b, bore], [a + 3, bore]] : [[a, bore], [a, 25], [b - 3, 27], [b - 3, bore], [a, bore]], M.steel, 36));
  return g;
}
function ballBearing(x0, x1, ri, ro) {
  const g = new THREE.Group(), t = (ro - ri) * 0.3, rm = (ri + ro) / 2;
  g.add(sleeve(x0, x1, ri, ri + t, M.steel), sleeve(x0, x1, ro - t, ro, M.steel));
  ring(9, rm, (y, z) => g.add(put(sphere((ro - ri) * 0.24, M.steelDark), (x0 + x1) / 2, y, z)));
  g.add(sleeve(x0 + 2, x1 - 2, rm - 1, rm + 1, M.brass, 28));
  return g;
}
function taperBearing(x0, x1, ri, ro, dir = 1) {
  const g = new THREE.Group(), t = (ro - ri) * 0.28, a = dir > 0 ? x0 : x1, b = dir > 0 ? x1 : x0;
  g.add(latheX([[x0, ri], [x0, ri + t + (dir > 0 ? 0 : 4)], [x1, ri + t + (dir > 0 ? 4 : 0)], [x1, ri], [x0, ri]], M.steel, 36));      // cone
  g.add(latheX([[x0, ro - t - (dir > 0 ? 4 : 0)], [x0, ro], [x1, ro], [x1, ro - t - (dir > 0 ? 0 : 4)], [x0, ro - t - (dir > 0 ? 4 : 0)]], M.steelDark, 36));   // cup
  ring(15, (ri + ro) / 2, (y, z) => g.add(put(cyl('x', (ro - ri) * 0.17, Math.abs(b - a) - 4, M.steel, 8), (x0 + x1) / 2, y, z)));
  return g;
}
function needleBearing(x0, x1, ri, ro) {
  const g = new THREE.Group(), rm = (ri + ro) / 2;
  g.add(sleeve(x0, x0 + 2, ri + 0.4, ro - 0.4, M.plasticGrey, 28), sleeve(x1 - 2, x1, ri + 0.4, ro - 0.4, M.plasticGrey, 28));
  ring(20, rm, (y, z) => g.add(put(cyl('x', (ro - ri) / 2 - 0.2, x1 - x0 - 3, M.steel, 6), (x0 + x1) / 2, y, z)));
  return g;
}
const snapRing = (x, r, mat = M.steelDark) => { const c = mesh(new THREE.TorusGeometry(r, 1, 6, 28, TAU * 0.92), mat); c.rotation.y = Math.PI / 2; c.position.x = x; return c; };

export function buildGearbox(A, anim) {
  anim.pieces = anim.pieces || [];
  const spin = (o, ratio) => { anim.spinners.push({ o, ratio }); return o; };
  /** Register a part of `group`; sub = travel in that group's exploded view. */
  const reg = (group, scale) => (id, sub, opts, fn) => {
    const g = A.part(id, opts, fn);
    Object.assign(g.userData, { group, sub: new THREE.Vector3(...sub), subGlobal: scale, periph: opts.periph !== false });
    return g;
  };
  const pieceOf = (group, scale) => (parent, extra, fn) => {
    const p = new THREE.Group();
    fn(p);
    parent.add(p);
    anim.pieces.push({ o: p, home: p.position.clone(), sub: new THREE.Vector3(...extra), group, scale });
    return p;
  };
  const G = reg('gearbox', 1), gp = pieceOf('gearbox', 1);
  const C = reg('clutch', 0.3), cp = pieceOf('clutch', 0.3);
  const GX = [560, 0, 0];                                         // gearbox travel in the engine-wide exploded view
  const ex = (x) => 300 + 1.6 * (x - 350);                        // spread of the shaft components along x when exploded
  /** Shaft row: group on its axis; parts on it are pushed out to `row` and spread along x. */
  const onAxis = (ax, g) => { const t = new THREE.Group(); t.position.set(0, ax.y, ax.z); g.add(t); return t; };
  const top = (ax, x, r) => [x, ax.y + r + 6, ax.z];

  const IN = { y: 0, z: 0, row: [350, 0] };                       // input shaft, on the crank axis
  const O1 = { y: -67.5, z: -39, row: [190, 330] };               // output shaft 1 (1st–4th), 78 mm from the input shaft
  const O2 = { y: 24.8, z: -67.2, row: [500, 0] };                // output shaft 2 (5th, 6th, reverse), ≈ 71.6 mm from the input shaft
  const RV = { y: 60.6, z: -11.7, row: [640, 0] };                // reverse idler spindle
  const DF = { y: -66, z: -165, row: [0, 420] };                  // differential
  const HC = { y: -8, z: -40 };                                   // centre of the gear housing barrel
  const S = (ax, x, dy = 0, dz = 0) => [ex(x), ax.row[0] + dy, ax.row[1] + dz];
  const P = (ax, id, x, r, extra, fn) => G(id, S(ax, x), { explode: GX, anchor: top(ax, x, r), ...extra }, (g) => fn(onAxis(ax, g), g));

  // ═════════════════════════ housings ═════════════════════════
  G('gearbox', [0, 0, 0], { casing: true, explode: GX, anchor: [300, 204, 40] }, (g) => {
    g.add(latheX([[212, 150], [212, 172], [228, 172], [300, 170], [340, 166], [350, 166], [350, 24], [344, 24], [344, 158], [334, 160], [296, 163], [228, 165], [218, 165], [218, 150], [212, 150]], M.aluRough, 64));
    for (let k = 0; k < 10; k++) { const a = (k * TAU) / 10; g.add(put(hex('x', 7, 8, M.steelDark), 229, 176 * Math.cos(a), 176 * Math.sin(a)), put(box(16, 22, 22, M.aluRough, 4), 220, 172 * Math.cos(a), 172 * Math.sin(a))); }
    g.add(put(latheX([[326, 36], [326, 96], [340, 114], [350, 116], [350, 108], [342, 106], [333, 92], [333, 36], [326, 36]], M.aluRough, 48), 0, DF.y, DF.z));   // differential half
    g.add(put(sleeve(300, 328, 30, 40, M.aluRough), 0, DF.y, DF.z));                           // flange shaft seal housing
    g.add(put(box(60, 30, 70, M.aluRough, 8), 300, 150, 114));                                  // starter pocket
  });
  G('gearboxHousing', [330, 0, 0], { casing: true, explode: GX, anchor: [480, 150, 60] }, (g) => {
    g.add(put(latheX([[350, 142], [350, 150], [362, 150], [540, 140], [596, 120], [604, 100], [604, 30], [598, 30], [598, 97], [591, 114], [538, 134], [362, 144], [350, 142]], M.aluRough, 64), 0, HC.y, HC.z));
    g.add(put(latheX([[350, 108], [350, 116], [372, 118], [410, 112], [470, 80], [500, 50], [506, 40], [506, 32], [500, 32], [496, 46], [466, 74], [408, 106], [372, 111], [350, 108]], M.aluRough, 48), 0, DF.y, DF.z));
    for (let k = 0; k < 9; k++) { const a = (k * TAU) / 9 + 0.2; g.add(bar([366, HC.y + 150 * Math.cos(a), HC.z + 150 * Math.sin(a)], [556, HC.y + 139 * Math.cos(a), HC.z + 139 * Math.sin(a)], 8, 12, M.aluRough, 2)); }
    g.add(put(box(120, 20, 110, M.aluRough, 8), 470, 138, -20));                                // seat of the switch unit
    g.add(put(box(90, 40, 70, M.aluRough, 10), 500, 60, 96));                                   // boss for the gearbox mount
    for (const ax of [O1, O2, IN]) g.add(put(sleeve(596, 612, 20, 42, M.aluRough), 0, ax.y, ax.z));   // bearing seats in the end wall
  });
  G('housingBolts', [330, 0, 0], { explode: GX, anchor: [362, HC.y + 164, HC.z] }, (g) => {
    ring(13, 154, (y, z) => gp(g, [70, 0, 0], (p) => p.add(put(hex('x', 6.5, 7, M.steelDark), 364, HC.y + y, HC.z + z), put(cyl('x', 4, 26, M.steelDark, 8), 350, HC.y + y, HC.z + z))), 0.25);
    ring(5, 120, (y, z) => gp(g, [70, 0, 0], (p) => p.add(put(hex('x', 6.5, 7, M.steelDark), 364, DF.y - Math.abs(y) * 0.9, DF.z - Math.abs(z) * 0.5 - 40))), 0.6);
  });
  G('gearboxCover', [470, 0, 0], { casing: true, explode: GX, anchor: [622, 44, 0] }, (g) => {
    g.add(latheX([[612, 0], [612, 50], [616, 50], [626, 40], [628, 0]], M.paintBlack, 40));
    ring(5, 45, (y, z) => gp(g, [40, 0, 0], (p) => p.add(put(hex('x', 4.5, 5, M.steelDark), 620, y, z))), 0.5);
  });
  G('gearboxPlugs', [330, 0, 0], { explode: GX, anchor: [470, -30, 118] }, (g) => {
    gp(g, [0, 0, 60], (p) => p.add(put(hex('z', 12, 10, M.steelDark), 470, -30, 108), put(cyl('z', 9, 14, M.steel, 14), 470, -30, 98)));           // filler / level plug
    gp(g, [0, -70, 0], (p) => p.add(put(hex('y', 12, 10, M.steelDark), 440, -160, -70), put(cyl('y', 9, 14, M.steel, 14), 440, -150, -70), put(cyl('y', 6, 8, M.dark, 12), 440, -140, -70)));   // drain plug with magnet
  });

  // ═════════════════════════ input shaft ═════════════════════════
  P(IN, 'inputShaft', 350, 44, { anchor: [520, 46, 0] }, (t) => {
    const s = spin(new THREE.Group(), 1);
    s.add(gear(23, 11, 252, 300, M.steel));                                                    // 23 splines for the clutch plate (clutch kit listings)
    s.add(put(cyl('x', 9, 14, M.steel, 20), 247, 0, 0));
    s.add(put(cyl('x', 14, 50, M.steel, 28), 325, 0, 0), put(cyl('x', 16, 20, M.steel, 28), 359, 0, 0));   // seal land, roller journal
    s.add(put(cyl('x', 13, 204, M.steel, 28), 470, 0, 0), put(cyl('x', 15, 24, M.steel, 28), 583, 0, 0));
    s.add(gear(23, 25.27, 408, 426, M.steel), gear(13, 16.35, 454, 474, M.steel));              // 2nd, 1st / reverse
    s.add(gear(43, 39.46, 480, 498, M.steel), gear(34, 33.57, 526, 544, M.steel), gear(40, 36.24, 550, 568, M.steel));   // 4th + 6th, 3rd, 5th
    t.add(s);
  });
  G('inputSeal', [120, 350, 0], { explode: GX, anchor: [347, 30, 0] }, (g) => {
    g.add(sleeve(340, 347, 14.2, 24, M.rubber), sleeve(339.4, 340.2, 15, 24, M.steelDark));
  });
  P(IN, 'inputRollerSleeve', 359, 28, {}, (t) => {
    t.add(sleeve(350, 368, 20.6, 21.6, M.steelDark), sleeve(350, 352, 21.6, 27.5, M.steelDark));
    ring(18, 18.4, (y, z) => t.add(put(cyl('x', 2.1, 15, M.steel, 6), 359, y, z)));
  });
  P(IN, 'inputBallBearing', 583, 38, {}, (t) => {
    t.add(ballBearing(572, 594, 15, 36));
    gp(t, [40, 0, 0], (p) => p.add(snapRing(595, 34.7)));                                       // securing ring 69.4 × 2
    gp(t, [70, 0, 0], (p) => p.add(snapRing(596.5, 15.5)));                                     // circlip from the graded set
  });

  // ═════════════════════════ output shaft 1: final drive pinion, 2nd, 1st, 4th, 3rd ═════════════════════════
  P(O1, 'outShaft1', 350, 30, { anchor: [387, O1.y + 36, O1.z] }, (t) => {
    t.add(put(cyl('x', 20, 22, M.steel, 28), 361, 0, 0), gear(20, 28.4, 372, 402, M.steel));
    t.add(put(cyl('x', 21, 146, M.steel, 28), 475, 0, 0), put(cyl('x', 15, 20, M.steel, 28), 557, 0, 0));
    t.add(gear(30, 23, 430, 450, M.steelDark), gear(30, 23, 502, 522, M.steelDark));            // splines for the synchro hubs
  });
  P(O1, 'out1BearingA', 361, 42, {}, (t) => {
    t.add(taperBearing(350, 371, 20, 40, 1));
    gp(t, [-40, 0, 0], (p) => p.add(sleeve(346, 349, 14, 27, M.steelDark)));                    // oil thrower
    gp(t, [-70, 0, 0], (p) => p.add(latheX([[340, 7], [340, 13.5], [344, 13.5], [344, 7], [340, 7]], M.steel, 20)));   // cup washer 14 × 27.15
  });
  P(O1, 'gear2', 417, 55, {}, (t) => t.add(spin(changeGear(48, 52.73, 408, 426, 24, 1), -23 / 48)));
  P(O1, 'gear1', 464, 64, {}, (t) => t.add(spin(changeGear(49, 61.65, 454, 474, 24, -1), -13 / 49)));
  P(O1, 'gear4', 489, 41, {}, (t) => t.add(spin(changeGear(42, 38.54, 480, 498, 24, 1), -43 / 42)));
  P(O1, 'gear3', 535, 47, {}, (t) => t.add(spin(changeGear(45, 44.43, 526, 544, 22, -1), -34 / 45)));
  /** Synchroniser between x0 and x1. cones = how many friction rings each side has (3 = triple cone). */
  const synchro = (t, x0, x1, cones) => {
    const xm = (x0 + x1) / 2;
    gp(t, [0, 0, 0], (p) => p.add(gear(34, 33, x0 + 6, x1 - 6, M.steelDark, 23)));              // hub, splined to the shaft
    gp(t, [0, 120, 0], (p) => p.add(latheX([[x0 + 3, 36.5], [x0 + 3, 43], [xm - 4, 43], [xm - 4, 39.5], [xm + 4, 39.5], [xm + 4, 43], [x1 - 3, 43], [x1 - 3, 36.5], [x0 + 3, 36.5]], M.steel, 48)));   // locking collar with fork groove
    ring(3, 35, (y, z) => gp(t, [0, y * 1.9, z * 1.9], (p) => p.add(put(box(11, 4, 7, M.steel, 1), xm, y, z))), 0.5);   // locking pieces
    for (const s of [-1, 1]) {
      gp(t, [s * 16, 0, 0], (p) => p.add(snapRing(xm + s * 5, 30.5, M.steel)));                // spring
      const n = s < 0 ? cones[0] : cones[1];
      for (let k = 0; k < n; k++) {
        const xa = xm + s * (7 + k * 1.2), r = 34 - k * 3.2;
        gp(t, [s * (30 + k * 13), 0, 0], (p) => p.add(k % 2 ? sleeve(xa - 2, xa + 2, r - 2.4, r, M.steelDark, 36) : gear(34, r + 0.6, xa - 1.6, xa + 1.6, M.brass, r - 2.6)));
      }
    }
    gp(t, [-8, 0, 0], (p) => p.add(snapRing(x0 + 5, 24)));                                      // securing ring of the hub
  };
  P(O1, 'synchro12', 440, 46, {}, (t) => synchro(t, 428, 452, [3, 3]));
  P(O1, 'synchro34', 512, 46, {}, (t) => synchro(t, 500, 524, [1, 3]));
  G('needles1', [0, O1.row[0], O1.row[1]], { explode: GX, anchor: top(O1, 440, 26) }, (g) => {
    const t = onAxis(O1, g);
    for (const [x0, ri, ro] of [[404, 21, 24], [452, 21, 24], [478, 21, 24], [524, 19, 22]]) gp(t, [ex(x0 + 13) - 34, 0, 0], (p) => p.add(needleBearing(x0, x0 + 26.8, ri, ro)));
  });
  G('out1Washers', [0, O1.row[0], O1.row[1]], { explode: GX, anchor: top(O1, 476, 32) }, (g) => {
    const t = onAxis(O1, g);
    gp(t, [ex(476) + 14, 0, 0], (p) => p.add(sleeve(474.5, 477, 22, 31, M.steelDark)));         // thrust washer between 1st and 4th
    gp(t, [ex(476) + 34, 0, 0], (p) => p.add(sleeve(477, 480, 28, 30, M.steel)));               // retaining ring 56 × 60 × 3
    gp(t, [ex(566) + 30, 0, 0], (p) => p.add(snapRing(566.5, 15.6)));                           // circlip from the graded set
    gp(t, [ex(566) + 56, 0, 0], (p) => p.add(sleeve(567.5, 569, 16, 30, M.steel)));             // shim, 0.7–2.4 mm
  });
  P(O1, 'out1BearingB', 556, 33, {}, (t) => t.add(taperBearing(548, 565, 15, 31, -1)));

  // ═════════════════════════ output shaft 2: final drive pinion, reverse, 6th, 5th ═════════════════════════
  P(O2, 'outShaft2', 350, 37, { anchor: [387, O2.y + 42, O2.z] }, (t) => {
    t.add(put(cyl('x', 19, 22, M.steel, 28), 361, 0, 0), gear(25, 35.5, 372, 402, M.steel));
    t.add(put(cyl('x', 20, 170, M.steel, 28), 487, 0, 0), put(cyl('x', 15, 20, M.steel, 28), 581, 0, 0));
    t.add(gear(30, 23, 408, 426, M.steelDark), gear(30, 23, 502, 522, M.steelDark));
  });
  P(O2, 'out2BearingA', 360, 34, {}, (t) => {
    t.add(taperBearing(350, 370, 19, 32.5, 1));
    gp(t, [-40, 0, 0], (p) => p.add(sleeve(347.6, 349.2, 20, 32, M.steel)));                    // adjusting washer
  });
  P(O2, 'synchroR', 417, 46, {}, (t) => synchro(t, 405, 429, [0, 1]));
  P(O2, 'gearR', 440, 44, {}, (t) => t.add(spin(changeGear(23, 41.03, 432, 448, 25.5, -1), (13 / 36) * (14 / 23))));
  P(O2, 'out2Spacer', 464, 24, {}, (t) => {
    t.add(sleeve(450, 476, 20.2, 23.5, M.steel));
    gp(t, [34, 0, 0], (p) => p.add(sleeve(476, 478.5, 18.6, 21.8, M.steelDark)));               // securing ring 37.2 × 43.6 × 2.5
  });
  P(O2, 'gear6', 489, 35, {}, (t) => t.add(spin(changeGear(35, 32.12, 480, 498, 23, 1), -43 / 35)));
  P(O2, 'synchro56', 512, 46, {}, (t) => synchro(t, 500, 524, [1, 1]));
  P(O2, 'gear5', 550, 38, {}, (t) => {
    const g5 = spin(new THREE.Group(), -40 / 39);
    g5.add(gear(39, 35.34, 550, 568, M.steel, 21.5), sleeve(532, 550, 21.5, 26, M.steel));      // long hub over the 46.8 mm needle bearing
    g5.add(gear(32, 30, 529, 532, M.steelDark, 21.5), latheX([[524, 21.5], [524, 25], [529, 27], [529, 21.5], [524, 21.5]], M.steel, 36));
    t.add(g5);
  });
  G('needles2', [0, O2.row[0], O2.row[1]], { explode: GX, anchor: top(O2, 450, 28) }, (g) => {
    const t = onAxis(O2, g);
    for (const [x0, w, ri, ro] of [[430, 18, 21.5, 25.5], [478, 22, 20, 23], [524, 44, 18.5, 21.5]]) gp(t, [ex(x0 + w / 2) - 36, 0, 0], (p) => p.add(needleBearing(x0, x0 + w, ri, ro)));
  });
  P(O2, 'out2BearingB', 580, 33, {}, (t) => {
    t.add(taperBearing(572, 589, 15, 31, -1));
    gp(t, [34, 0, 0], (p) => p.add(snapRing(590.5, 15.6)));
    gp(t, [58, 0, 0], (p) => p.add(sleeve(591.5, 593, 16, 30, M.steel)));                       // shim
  });

  // ═════════════════════════ reverse idler spindle, Z = 36 + 14 ═════════════════════════
  P(RV, 'reverseIdler', 452, 48, {}, (t) => {
    const s = spin(new THREE.Group(), -13 / 36);
    s.add(gear(14, 24.97, 430, 449, M.steel, 9), gear(36, 45.29, 454, 472, M.steel, 9), sleeve(449, 454, 9, 20, M.steel));
    t.add(s);
    gp(t, [-150, 0, 0], (p) => p.add(put(cyl('x', 9, 62, M.steel, 20), 452, 0, 0)));            // spindle
    for (const [x, d] of [[427.5, -60], [474.5, 50]]) gp(t, [d, 0, 0], (p) => p.add(sleeve(x - 1.5, x + 1.5, 12.6, 22, M.steelDark)));   // thrust washers 25.1
    for (const [x, d] of [[438, -100], [464, 100]]) gp(t, [d, 0, 0], (p) => p.add(needleBearing(x - 8, x + 8, 9, 12)));
  });

  // ═════════════════════════ differential ═════════════════════════
  const DX = (x) => 140 + 1.5 * (x - 350);
  const D = (id, x, r, extra, fn) => G(id, [DX(x), DF.row[0], DF.row[1]], { explode: GX, anchor: top(DF, x, r), ...extra }, (g) => fn(onAxis(DF, g), g));
  D('ringGear', 387, 100, {}, (t) => {
    t.add(gear(69, 98, 372, 402, M.steel, 64));
    ring(10, 70, (y, z) => gp(t, [-60, 0, 0], (p) => p.add(put(cyl('x', 5, 36, M.steelDark, 10), 388, y, z), put(cyl('x', 8, 3, M.steelDark, 12), 370.5, y, z))));   // rivets
  });
  D('diffCage', 440, 62, {}, (t) => {
    t.add(latheX([[364, 26], [364, 34], [372, 34], [372, 76], [402, 76], [404, 60], [450, 58], [474, 44], [484, 34], [500, 34], [500, 26], [364, 26]], M.castIronLight, 48));
    for (const s of [-1, 1]) t.add(put(cyl('y', 9, 6, M.dark, 14), 432, s * 57, 0));              // ends of the planet pin
  });
  D('diffGears', 470, 30, {}, (t) => {
    const bevel = (dir) => latheX(dir > 0 ? [[0, 13], [0, 30], [12, 20], [16, 13], [0, 13]] : [[-16, 13], [-12, 20], [0, 30], [0, 13], [-16, 13]], M.steel, 24);
    gp(t, [-40, 0, 0], (p) => p.add(put(bevel(1), 408, 0, 0)));                                  // side gears (splined to the flange shafts)
    gp(t, [40, 0, 0], (p) => p.add(put(bevel(-1), 456, 0, 0)));
    for (const s of [-1, 1]) gp(t, [0, s * 60, 0], (p) => { const b = latheX([[0, 9], [0, 22], [10, 15], [13, 9], [0, 9]], M.steel, 20); b.rotation.z = s * Math.PI / 2; b.position.set(432, s * 38, 0); p.add(b); });   // planet gears
    gp(t, [0, 0, 110], (p) => p.add(put(cyl('y', 8.8, 112, M.steel, 16), 432, 0, 0)));           // planet pin
    for (const [x, d] of [[404, -80], [460, 80]]) gp(t, [d, 0, 0], (p) => p.add(sleeve(x - 1, x + 1, 14, 31, M.brass)));   // thrust washers
  });
  D('diffBearings', 430, 44, {}, (t) => {
    gp(t, [-150, 0, 0], (p) => p.add(taperBearing(346, 364, 26, 42, 1), sleeve(342, 345, 30, 42, M.steel)));   // bearing + shim, clutch housing side
    gp(t, [110, 0, 0], (p) => p.add(taperBearing(484, 500, 26, 40, -1), sleeve(501, 503, 30, 40, M.steel)));
  });
  D('flangeShaftR', 250, 52, { anchor: [200, DF.y + 58, DF.z] }, (t) => {
    t.add(put(cyl('x', 16, 150, M.steel, 20), 335, 0, 0), put(cyl('x', 20, 120, M.steelDark, 20), 240, 0, 0));
    t.add(latheX([[150, 0], [150, 50], [160, 50], [164, 24], [182, 20], [182, 0]], M.steelDark, 36));
    ring(6, 40, (y, z) => t.add(put(cyl('x', 4.6, 12, M.dark, 10), 153, y, z)));
    gp(t, [-70, 0, 0], (p) => p.add(put(box(40, 60, 50, M.aluRough, 6), 232, 30, 0), ballBearing(222, 242, 20, 32)));   // support bearing bracket on the block
  });
  D('flangeShaftL', 525, 52, {}, (t) => {
    t.add(put(cyl('x', 16, 110, M.steel, 20), 470, 0, 0));
    t.add(latheX([[506, 0], [506, 22], [524, 26], [528, 50], [538, 50], [538, 0]], M.steelDark, 36));
    ring(6, 40, (y, z) => t.add(put(cyl('x', 4.6, 12, M.dark, 10), 535, y, z)));
    gp(t, [-50, 0, 0], (p) => p.add(put(spring(11, 2.4, 22, 5, M.steelDark), 0, 0, 0)).children[0].rotateZ(-Math.PI / 2).position.set(440, 0, 0));   // pressure spring
    gp(t, [70, 0, 0], (p) => p.add(put(hex('x', 6, 6, M.steelDark), 541, 0, 0), put(cyl('x', 3.6, 40, M.steelDark, 8), 520, 0, 0)));               // centre bolt
  });
  D('driveSeals', 420, 40, {}, (t) => {
    gp(t, [DX(318) - DX(420) - 40, 0, 0], (p) => p.add(sleeve(314, 322, 20.5, 39, M.rubber)));
    gp(t, [DX(506) - DX(420) + 30, 0, 0], (p) => p.add(sleeve(502, 510, 22.5, 39, M.rubber)));
  });

  // ═════════════════════════ selector mechanism ═════════════════════════
  const SU = { x: 470, z: -20 };                                  // switch unit (shift tower) on top of the gear housing
  G('shiftTower', [330, 150, -330], { explode: GX, anchor: [SU.x, 262, SU.z] }, (g) => {
    g.add(put(cyl('y', 34, 46, M.aluRough, 32), SU.x, 170, SU.z), put(cyl('y', 27, 30, M.aluRough, 28), SU.x, 206, SU.z));
    g.add(put(cyl('y', 9, 190, M.steel, 16), SU.x, 150, SU.z));                                  // selector shaft: turns to pick the gate, slides to engage
    g.add(bar([SU.x, 70, SU.z], [SU.x - 26, 62, SU.z + 8], 12, 10, M.steel, 2));                 // shift finger
    g.add(bar([SU.x, 232, SU.z], [SU.x + 70, 236, SU.z - 30], 16, 6, M.steelDark, 2));           // gear selector lever
    g.add(put(box(44, 34, 40, M.castIron, 6), SU.x + 84, 236, SU.z - 36));                       // its balance weight
    g.add(bar([SU.x - 10, 214, SU.z + 20], [SU.x - 56, 214, SU.z + 60], 12, 6, M.steelDark, 2));  // gate relay lever
    gp(g, [0, 70, 0], (p) => p.add(put(cyl('y', 9, 14, M.plastic, 14), SU.x - 30, 196, SU.z - 28)));              // vent cap
    gp(g, [0, -40, 0], (p) => p.add(put(torus('y', 28.4, 1.4, M.rubber), SU.x, 148, SU.z)));                       // O-ring 56.82 × 2.62
    gp(g, [0, 46, 0], (p) => p.add(put(sleeve(-3, 3, 9.2, 15, M.rubber), 0, 0, 0)).children[0].rotateZ(Math.PI / 2).position.set(SU.x, 224, SU.z));   // shaft oil seal
    ring(3, 40, (x, z) => gp(g, [0, 60, 0], (p) => p.add(put(hex('y', 6.5, 7, M.steelDark), SU.x + x, 197, SU.z + z))), 0.6);   // M8 × 25
  });
  G('shiftDetent', [330, 90, -420], { explode: GX, anchor: [SU.x - 60, 150, SU.z - 60] }, (g) => {
    gp(g, [-40, 0, -30], (p) => p.add(put(hex('z', 15, 10, M.steelDark), SU.x - 40, 130, SU.z - 70)));              // locking screw M27 × 1.5
    gp(g, [0, 0, 0], (p) => p.add(put(cyl('z', 8, 26, M.steel, 14), SU.x - 40, 130, SU.z - 52)));                   // retaining sleeve
    gp(g, [40, 0, 30], (p) => p.add(put(cyl('z', 4.5, 30, M.steel, 12), SU.x - 40, 130, SU.z - 36), put(sphere(4.5, M.steel), SU.x - 40, 130, SU.z - 21)));   // detent pin
  });
  G('shiftForks', [330, -20, -480], { explode: GX, anchor: [470, 120, -60] }, (g) => {
    // [shaft axis, x of the collar, rail position y / z]
    const forks = [[O1, 440, 60, -124, M.aluDark], [O1, 512, 44, -136, M.aluDark], [O2, 512, 108, -100, M.aluDark], [O2, 417, 122, -84, M.aluDark]];
    forks.forEach(([ax, x, ry, rz, mat], i) => gp(g, [(i - 1.5) * 90, i * 60, 0], (p) => {
      const arc = mesh(new THREE.TorusGeometry(41.5, 4, 8, 24, Math.PI * 0.9), mat);
      const a = Math.atan2(ry - ax.y, rz - ax.z);
      arc.rotation.y = Math.PI / 2; arc.rotation.x = -(a - Math.PI * 0.45);
      arc.position.set(x, ax.y, ax.z);
      p.add(arc, bar([x, ax.y + 42 * Math.sin(a), ax.z + 42 * Math.cos(a)], [x, ry, rz], 10, 8, mat, 2));
      p.add(put(cyl('x', 6, 170, M.steel, 12), 470, ry, rz));                                    // shift rail
      p.add(put(box(16, 16, 14, M.steel, 2), SU.x - 22 + i * 4, ry + 4, rz + 12));               // gate slot for the shift finger
    }));
  });
  G('reverseSwitch', [330, 130, -250], { explode: GX, anchor: [540, 168, -70] }, (g) => {
    g.add(put(hex('y', 11, 16, M.brass), 540, 148, -70), put(cyl('y', 9, 22, M.plastic, 14), 540, 166, -70), put(box(13, 11, 17, M.plasticGrey, 2.5), 540, 182, -70));
  });
  G('shiftCables', [200, 260, -160], { explode: GX, anchor: [420, 262, -200] }, (g) => {
    g.add(tube([[SU.x + 84, 246, SU.z - 70], [470, 250, -180], [380, 262, -300], [330, 268, -385]], 5, M.rubber, { radial: 8 }));
    g.add(tube([[SU.x - 56, 222, SU.z + 60], [430, 244, -120], [356, 258, -290], [312, 266, -385]], 5, M.rubber, { radial: 8 }));
    g.add(put(box(90, 8, 30, M.steelDark, 2), 470, 240, -150), put(box(8, 40, 30, M.steelDark, 2), 512, 220, -150));   // cable support bracket
    for (const p of [[SU.x + 84, 250, SU.z - 62], [SU.x - 56, 226, SU.z + 60]]) g.add(put(cyl('y', 7, 10, M.plastic, 12), ...p));   // cable end pieces
  });

  // ═════════════════════════ dual-mass flywheel and clutch ═════════════════════════
  const CL = [200, 0, 0];
  const R = (id, dx, opts, fn) => C(id, [dx, 0, 0], { explode: CL, periph: false, ...opts }, (g) => { const s = spin(new THREE.Group(), 1); g.add(s); fn(s, g); });
  R('flywheel', 0, { anchor: [221, 148, 0] }, (s) => {
    s.add(latheX([[214, 20], [214, 138], [230, 138], [230, 118], [220, 118], [220, 20], [214, 20]], M.steelDark, 72));   // primary mass with spring channel
    s.add(put(extrudeX(gearShape(135, 139.5, 144), 12, M.steel, { curve: 4 }), 221, 0, 0));       // starter ring gear
    ring(60, 132, (y, z) => s.add(put(box(3, 4, 3, M.steel), 229, y, z)));                        // rim markings
  });
  R('flywheelBolts', 50, { anchor: [228, 40, 0] }, (s) => {
    ring(6, 33, (y, z) => s.add(put(hex('x', 7.5, 7, M.steelDark), 224, y, z), put(cyl('x', 5, 22, M.steelDark, 10), 210, y, z)));   // on a 66 mm pitch circle (flywheel listing)
  });
  R('dmfSprings', 110, { anchor: [232, 118, 0] }, (s) => {
    for (const a0 of [0.2, Math.PI + 0.2]) {
      const arc = mesh(new THREE.TorusGeometry(106, 8.5, 10, 40, Math.PI * 0.84), M.steel);
      arc.rotation.y = Math.PI / 2; arc.rotation.x = a0; arc.position.x = 226;
      s.add(arc);
      for (let k = 0; k < 22; k++) { const a = a0 + (k / 21) * Math.PI * 0.84; const c = torus('z', 8.7, 1.1, M.steelDark); c.position.set(226, 106 * Math.sin(a), 106 * Math.cos(a)); c.rotation.x = -a; s.add(c); }   // coils
    }
    const fl = new THREE.Shape();
    fl.absarc(0, 0, 80, 0, TAU, false); fl.holes.push(circ(0, 0, 40));
    s.add(put(extrudeX(fl, 3, M.steelDark, { curve: 36 }), 231, 0, 0));                           // drive flange between the masses
    for (const a of [0.05, Math.PI + 0.05]) s.add(put(box(3, 34, 22, M.steelDark, 2), 231, 96 * Math.cos(a), 96 * Math.sin(a))).children.at(-1).rotation.x = a;   // flange arms
  });
  R('dmfSecondary', 180, { anchor: [250, 130, 0] }, (s) => {
    s.add(latheX([[234, 36], [234, 116], [240, 128], [256, 128], [260, 122], [262, 122], [262, 60], [256, 54], [256, 36], [234, 36]], M.forged, 72));
    s.add(put(latheX([[0, 78], [0, 120]], M.steel, 72), 262.2, 0, 0));                            // friction face
    ring(6, 124, (y, z) => s.add(put(cyl('x', 4, 8, M.dark, 10), 259, y, z)), 0.3);               // threads for the pressure plate bolts
    cp(s, [-40, 0, 0], (p) => p.add(sleeve(236, 254, 30, 36, M.brass)));                          // plain bearing between the two masses
  });
  R('clutchDisc', 260, { anchor: [267, 124, 0] }, (s) => {
    for (const x of [263.2, 268]) s.add(sleeve(x, x + 3.2, 78, 120, M.exhaustDark, 64));          // friction linings
    s.add(sleeve(266.2, 268.2, 40, 119, M.steel, 48));                                           // cushion plate
    ring(16, 100, (y, z) => s.add(put(cyl('x', 2.4, 8.4, M.brass, 8), 267.4, y, z)));             // lining rivets
    s.add(sleeve(258, 282, 0.1, 22, M.steelDark), gear(23, 11.2, 257.8, 282.2, M.dark));          // rigid hub with 23 splines
    s.add(sleeve(264, 271, 22, 42, M.steelDark));
    ring(6, 32, (y, z) => s.add(put(cyl('x', 3, 8, M.steel, 8), 267.5, y, z)));
  });
  R('pressurePlate', 330, { anchor: [279, 126, 0] }, (s) => {
    s.add(latheX([[271.4, 80], [271.4, 122], [282, 122], [286, 112], [286, 96], [290, 92], [290, 86], [282, 80], [271.4, 80]], M.castIronLight, 72));
    ring(3, 124, (y, z, a) => s.add(put(box(8, 10, 18, M.castIronLight, 2), 280, y, z)).children.at(-1).rotation.set(a, 0, 0), 0.5);   // lugs for the drive straps
  });
  R('diaphragmSpring', 400, { anchor: [300, 108, 0] }, (s) => {
    s.add(latheX([[292, 78], [291, 104], [292.4, 104], [293.4, 78], [292, 78]], M.steelDark, 64));
    ring(18, 1, (y, z, a) => {                                                                  // fingers
      const f = bar([293, 78 * Math.cos(a), 78 * Math.sin(a)], [305, 27 * Math.cos(a), 27 * Math.sin(a)], 10, 1.6, M.steelDark);
      f.rotateY(a + Math.PI / 2);
      s.add(f);
    });
  });
  R('clutchCover', 470, { anchor: [300, 134, 0] }, (s) => {
    s.add(latheX([[271.6, 118], [271.6, 131], [275, 131], [275, 126], [300, 122], [306, 112], [306, 72], [303, 72], [303, 110], [298, 118], [274, 122], [271.6, 118]], M.paintBlack, 72));
    ring(9, 96, (y, z) => s.add(put(cyl('x', 3.4, 6, M.steel, 8), 304, y, z)));                   // rivets of the fulcrum rings
    ring(3, 112, (y, z, a) => s.add(put(box(2, 8, 44, M.steel, 1), 288, y, z)).children.at(-1).rotation.x = a, 0.5);   // tangential drive straps
    cp(s, [-30, 0, 0], (p) => p.add(sleeve(294, 298, 100, 110, M.plasticGrey, 48)));              // self-adjusting ring (wear compensation)
  });
  R('clutchBolts', 540, { anchor: [279, 138, 0] }, (s) => {
    ring(6, 124, (y, z) => s.add(put(cyl('x', 5.4, 5, M.steelDark, 12), 278, y, z), put(cyl('x', 3.5, 14, M.steelDark, 8), 270, y, z)), 0.3);   // M7 × 14, 12-point
  });

  // ═════════════════════════ hydraulic clutch control ═════════════════════════
  C('releaseBearing', [610, 0, 0], { explode: CL, anchor: [314, 40, 0] }, (g) => {
    g.add(ballBearing(307, 321, 24, 36), sleeve(305, 307.5, 23, 34, M.steel));                    // thrust face bears on the spring fingers
  });
  C('csc', [690, 0, 0], { explode: CL, anchor: [334, 52, 0] }, (g) => {
    g.add(latheX([[306, 17.4], [306, 19.6], [336, 19.6], [336, 46], [344, 46], [344, 17.4], [306, 17.4]], M.plastic, 40));   // guide tube + base
    g.add(sleeve(326, 344, 31, 36, M.plastic, 40));                                              // outer wall of the annular cylinder
    g.add(put(cyl('y', 6, 24, M.plastic, 12), 338, 44, 10));                                     // pressure connection
    cp(g, [-70, 0, 0], (p) => p.add(sleeve(318, 332, 20, 30.6, M.plasticGrey, 40), sleeve(331, 334, 20, 30.8, M.rubber, 40)));   // annular piston + lip seal
    cp(g, [-140, 0, 0], (p) => { const sp = spring(27, 2.2, 26, 4, M.steel); sp.rotation.z = -Math.PI / 2; sp.position.set(303, 0, 0); p.add(sp); });   // preload spring
    ring(3, 40, (y, z) => cp(g, [-190, 0, 0], (p) => p.add(put(hex('x', 5, 5, M.steelDark), 334, y, z), put(cyl('x', 3.5, 25, M.steelDark, 8), 346, y, z))), 0.5);   // M7 × 25
  });
  C('cscLine', [690, 110, 0], { explode: CL, anchor: [352, 218, 6] }, (g) => {
    g.add(tube([[338, 56, 10], [338, 120, 14], [346, 180, 8], [352, 206, 4]], 4, M.steel, { radial: 8 }));
    g.add(put(box(20, 18, 20, M.plastic, 3), 352, 212, 0));                                      // bleeder block on the gearbox
    cp(g, [0, 50, 0], (p) => p.add(put(hex('y', 4.5, 12, M.steel), 352, 228, 0), put(cyl('y', 5, 6, M.rubber, 10), 352, 237, 0)));   // bleed valve + dust cap
    cp(g, [0, -40, 30], (p) => p.add(put(torus('y', 3.9, 0.9, M.rubber), 338, 56, 10)));         // seal ring 9.25 × 6.07 × 1.78
    cp(g, [30, 0, 0], (p) => p.add(put(box(3, 14, 22, M.steel, 1), 364, 212, 0)));               // retaining clip
  });
  C('clutchPipe', [300, 150, 0], { explode: CL, anchor: [440, 264, -300] }, (g) => {
    g.add(tube([[362, 212, -4], [374, 232, -140], [440, 256, -300], [520, 300, -372], [540, 338, -392]], 3.6, M.steel, { radial: 8, seg: 80 }));
    g.add(put(cyl('z', 12, 34, M.plastic, 16), 404, 244, -220));                                 // pulsation damper
    g.add(tube([[376, 233, -146], [392, 240, -190]], 6, M.hose, { radial: 10 }));                // flexible section taking up engine movement
  });
  C('clutchMaster', [140, 0, -110], { explode: CL, anchor: [540, 364, -430] }, (g) => {
    g.add(put(cyl('z', 15, 86, M.plastic, 20), 540, 338, -436), put(box(46, 46, 6, M.plastic, 3), 540, 338, -396));
    g.add(put(cyl('y', 6, 22, M.plastic, 12), 540, 358, -420));                                  // supply connection
    cp(g, [0, 0, -70], (p) => p.add(put(cyl('z', 4, 70, M.steel, 10), 540, 338, -500), put(cyl('z', 11, 20, M.rubber, 14), 540, 338, -486)));   // push rod + boot
    cp(g, [0, 0, 50], (p) => p.add(put(cyl('z', 12.6, 26, M.alu, 16), 540, 338, -440), put(cyl('z', 13.2, 4, M.rubber, 16), 540, 338, -428)));        // piston
    g.add(put(box(14, 14, 20, M.plasticGrey, 2), 562, 338, -450));                               // clutch position sender G476
  });
  C('fluidReservoir', [140, 110, -60], { explode: CL, anchor: [520, 486, -350] }, (g) => {
    g.add(put(box(96, 60, 70, M.tank, 12), 520, 440, -350), put(cyl('y', 26, 14, M.yellow, 24), 540, 476, -350));
    g.add(tube([[490, 418, -372], [500, 390, -404], [536, 372, -420], [540, 368, -420]], 5.5, M.hose, { radial: 10 }));   // supply hose to the master cylinder
  });
  C('clutchPedal', [140, 0, -260], { explode: CL, anchor: [540, 300, -560] }, (g) => {
    g.add(bar([540, 400, -470], [540, 190, -560], 14, 8, M.paintBlack, 3));                      // pedal arm
    g.add(put(box(56, 8, 70, M.rubber, 3), 540, 184, -566)).children.at(-1).rotation.x = -0.5;   // pad
    g.add(put(cyl('x', 9, 60, M.steel, 14), 540, 400, -470));                                    // pivot
    g.add(put(box(70, 90, 8, M.steelDark, 3), 540, 392, -400), put(box(8, 90, 80, M.steelDark, 3), 572, 392, -436), put(box(8, 90, 80, M.steelDark, 3), 508, 392, -436));   // pedal bracket
    cp(g, [60, 40, 0], (p) => { const sp = spring(8, 1.8, 70, 9, M.steel); sp.position.set(566, 330, -452); sp.rotation.x = -0.9; p.add(sp); });   // over-centre spring
    cp(g, [0, -40, -30], (p) => p.add(put(cyl('x', 3.5, 22, M.steel, 8), 540, 338, -530)));      // push rod pin
  });
}
