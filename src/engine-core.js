// Core engine: block, crank train, cylinder head, valve gear, unit injectors, toothed belt drive.
// Dimensions in mm. Values marked (SSP 316) come from VW self-study programme 316,
// the rest are catalogue data for the EA188 2.0 TDI PD or modelling estimates.
import * as THREE from 'three';
import {
  M, mesh, put, solid, cyl, hex, box, torus, bar, tube, latheX, latheY, extrudeX, extrudeY,
  rrect, circ, poly, gearShape, spring, beltPath, ribbon, beltMaterial,
} from './helpers.js';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

export const E = {
  bore: 81, stroke: 95.5, r: 47.75, rodL: 144, spacing: 88,       // (SSP 316) bore/stroke
  cylX: [-132, -44, 44, 132],                                       // cyl. 1 at the belt end
  throwSign: [1, -1, -1, 1],
  firePhase: [0, 540, 180, 360],                                    // firing order 1-3-4-2
  deckY: 236, headY: 237.5, camY: 380.5, camZ: 80,
  vb: 24, inR: 14.05, exR: 13.0, valveLen: 99.2, valveLift: 9,
  pitch: 9.525, beltTeeth: 141, beltW: 30, beltX: -227, auxX: -261, // (SSP 316) 30 mm belt
  crankT: 26, camT: 52, pumpT: 19,
  compH: 45, injStroke: 7,
  pump: { u: 56, v: 140 },
};
const pr = (teeth) => (teeth * E.pitch) / TAU;

const rectPath = (x0, y0, x1, y1) => {
  const p = new THREE.Path();
  p.moveTo(x0, y0); p.lineTo(x0, y1); p.lineTo(x1, y1); p.lineTo(x1, y0); p.closePath();
  return p;
};

/** Valve positions for one cylinder: pattern rotated 45° to the engine axis (SSP 316). */
export function valveLayout(cx) {
  const b = E.vb;
  return [
    { type: 'in', x: cx - b, z: 0 }, { type: 'in', x: cx, z: b },
    { type: 'ex', x: cx, z: -b }, { type: 'ex', x: cx + b, z: 0 },
  ];
}

function lobeShape(Rb, h, halfRise, halfFall) {
  const s = new THREE.Shape();
  const N = 80;
  for (let k = 0; k < N; k++) {
    const phi = -Math.PI + (k / N) * TAU;
    let lift = 0;
    if (phi >= 0 && phi < halfRise) lift = h * Math.cos((Math.PI / 2) * (phi / halfRise)) ** 2;
    else if (phi < 0 && phi > -halfFall) lift = h * Math.cos((Math.PI / 2) * (phi / halfFall)) ** 2;
    const r = Rb + lift;
    const x = r * Math.sin(phi), y = r * Math.cos(phi);
    if (k) s.lineTo(x, y); else s.moveTo(x, y);
  }
  s.closePath();
  return s;
}

function sprocket(teeth, width, mat, { holes = 0, bore = 0 } = {}) {
  const p = pr(teeth), tip = p - 0.7, root = tip - 3.2;
  const s = gearShape(teeth, root, tip);
  for (let k = 0; k < holes; k++) {
    const a = (k / holes) * TAU;
    s.holes.push(circ(Math.cos(a) * p * 0.58, Math.sin(a) * p * 0.58, p * 0.2));
  }
  if (bore) s.holes.push(circ(0, 0, bore));
  return extrudeX(s, width, mat, { curve: 16 });
}

/** Toothed belt layout seen from the belt end (u = z, v = y). Tensioner position tuned to 141 teeth. */
export function timingLayout() {
  const target = E.beltTeeth * E.pitch;
  const make = (tu) => [
    { id: 'crank', u: 0, v: 0, r: pr(E.crankT), s: 1 },
    { id: 'tensioner', u: tu, v: 170, r: 32, s: -1 },
    { id: 'camEx', u: -E.camZ, v: E.camY, r: pr(E.camT), s: 1 },
    { id: 'camIn', u: E.camZ, v: E.camY, r: pr(E.camT), s: 1 },
    { id: 'idler1', u: 128, v: 250, r: 26, s: -1 },
    { id: 'pump', u: E.pump.u, v: E.pump.v, r: pr(E.pumpT), s: 1 },
    { id: 'idler2', u: 70, v: 60, r: 20, s: -1 },
  ];
  let lo = -122, hi = -60;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (beltPath(make(mid)).length < target) lo = mid; else hi = mid;
  }
  const pulleys = make((lo + hi) / 2);
  const path = beltPath(pulleys, 3);
  return { pulleys, path, target };
}

export function buildCore(A, anim) {
  const HY = E.headY;
  /** Wrap an object as a loose piece that travels `extra` in the exploded view of `group`. */
  const pc = (group, extra, obj) => {
    const p = new THREE.Group();
    p.add(obj);
    anim.pieces.push({ o: p, home: p.position.clone(), sub: new THREE.Vector3(...extra), group, scale: 0 });
    return p;
  };

  // ───────────────────────── Cylinder block ─────────────────────────
  A.part('block', { cut: true, casing: true, anchor: [120, 150, 86] }, (g) => {
    const s = rrect(-200, -84, 200, 84, 14);
    E.cylX.forEach((x) => s.holes.push(circ(x, 0, E.bore / 2)));
    for (const x of [-176, -88, 0, 88, 176]) for (const z of [-56, 56]) s.holes.push(circ(x, z, 5.5));
    E.cylX.forEach((x) => { for (const z of [-67, 67]) for (const dx of [-20, 20]) s.holes.push(circ(x + dx, z, 4)); });
    g.add(solid(put(extrudeY(s, 156, M.castIron, { curve: 40 }), 0, 80, 0)));
    // crankcase side walls
    for (const sg of [-1, 1]) {
      const w = poly([[124, -62], [124, -52], [112, -46], [112, 30], [84, 80], [72, 80], [100, 28], [100, -62]].map(([z, y]) => [sg * z, y]));
      g.add(solid(extrudeX(w, 400, M.castIron)));
    }
    const endShape = () => {
      const e = poly([[-124, -62], [-124, -52], [-112, -46], [-112, 30], [-84, 80], [84, 80], [112, 30], [112, -46], [124, -52], [124, -62]]);
      e.holes.push(circ(0, 0, 40));
      return e;
    };
    g.add(solid(put(extrudeX(endShape(), 12, M.castIron), -194, 0, 0)));
    g.add(solid(put(extrudeX(endShape(), 12, M.castIron), 194, 0, 0)));
    // main bearing webs + caps (5 main bearings)
    const web = new THREE.Shape();
    web.moveTo(-100, 0); web.lineTo(-100, 26); web.lineTo(-81, 62); web.lineTo(81, 62); web.lineTo(100, 26);
    web.lineTo(100, 0); web.lineTo(29, 0); web.absarc(0, 0, 29, 0, Math.PI, false); web.lineTo(-100, 0);
    const cap = new THREE.Shape();
    cap.moveTo(-56, 0); cap.lineTo(-56, -30); cap.lineTo(-40, -44); cap.lineTo(40, -44); cap.lineTo(56, -30);
    cap.lineTo(56, 0); cap.lineTo(29, 0); cap.absarc(0, 0, 29, 0, -Math.PI, true); cap.lineTo(-56, 0);
    for (const x of [-176, -88, 0, 88, 176]) {
      g.add(solid(put(extrudeX(web, 18, M.castIron), x, 0, 0)));
    }
    // front sealing flange (belt end)
    // ribs + core plugs
    for (const z of [-85.5, 85.5]) {
      for (const x of [-88, 0, 88]) g.add(put(box(10, 150, 5, M.castIron, 2), x, 158, z));
      for (const x of [-132, 132]) g.add(put(cyl('z', 15, 4, M.steelDark), x, 170, z));
    }
  });

  // ───────────────────────── Oil sump ─────────────────────────
  // Outside size from parts listings for 038 103 603 AG: 430 × 277 × 120 mm. The 277 mm is across the two
  // lugs that bolt the sump to the gearbox; the body itself follows the 248 mm wide crankcase flange.
  A.part('sump', { cut: true, casing: true, explode: [0, -330, 0], anchor: [60, -128, 116] }, (g) => {
    const B = -180;                                                     // underside; the floor ribs reach 120 mm below the flange face
    const outer = [[-118, -68], [-112, B + 14], [-100, B], [100, B], [112, B + 14], [118, -68]];
    const inner = [[114, -68], [108, B + 16], [98, B + 4], [-98, B + 4], [-108, B + 16], [-114, -68]];
    g.add(solid(put(extrudeX(poly([...outer, ...inner]), 422, M.aluRough), -3, 0, 0)));
    g.add(solid(put(extrudeX(poly(outer), 4, M.aluRough), -216, 0, 0)));
    g.add(solid(put(extrudeX(poly(outer), 4, M.aluRough), 210, 0, 0)));
    const fl = rrect(-218, -124, 212, 124, 10);
    fl.holes.push(rectPath(-208, -110, 202, 110));
    g.add(solid(put(extrudeY(fl, 6, M.aluRough), 0, -68, 0)));
    for (let x = -194; x <= 190; x += 48) for (const z of [-118, 118]) g.add(put(hex('y', 5, 5, M.steelDark), x, -70, z));
    for (let x = -180; x <= 180; x += 40) for (const z of [-116, 116]) g.add(put(box(7, 92, 6, M.aluRough, 2), x, -119, z));
    for (const z of [-60, 0, 60]) g.add(put(box(396, 5, 8, M.aluRough, 2), -3, B - 0.5, z));
    for (const s of [-1, 1]) {                                          // lugs bolted to the clutch housing
      g.add(put(box(16, 46, 15, M.aluRough, 4), 204, -94, s * 131));
      g.add(put(hex('x', 6.5, 6, M.steelDark), 194, -94, s * 131));
    }
    g.add(put(hex('z', 9, 10, M.steel), 150, B + 16, -114));            // drain plug
    g.add(put(cyl('y', 24, 8, M.plastic), 40, B - 2, 0));               // oil level / temperature sender
  });

  // ───────────────────────── Crankshaft ─────────────────────────
  A.part('crankshaft', { explode: [0, -160, 0], anchor: [0, 0, 30] }, (g) => {
    const rot = new THREE.Group();
    g.add(rot);
    anim.spinners.push({ o: rot, ratio: 1 });
    for (const x of [-176, -88, 0, 88, 176]) rot.add(put(cyl('x', 27, 24, M.steel, 40), x, 0, 0));
    const webShape = (Rcw) => {
      const s = new THREE.Shape();
      s.absarc(0, 0, Rcw, 212 * DEG, 328 * DEG, false);
      s.absarc(0, E.r, 31, -30 * DEG, 210 * DEG, false);
      s.closePath();
      return s;
    };
    const big = webShape(66), small = webShape(44);
    E.cylX.forEach((x, i) => {
      const sg = E.throwSign[i];
      rot.add(put(cyl('x', 23.9, 26, M.steel, 40), x, sg * E.r, 0));
      for (const side of [-1, 1]) {
        const cw = (i === 0 && side < 0) || (i === 1 && side > 0) || (i === 2 && side < 0) || (i === 3 && side > 0);
        const w = extrudeX(cw ? big : small, 16, M.forged, { bevel: 1.5 });
        w.position.x = x + side * 22.5;
        if (sg < 0) w.rotation.x = Math.PI;
        rot.add(w);
      }
    });
    rot.add(latheX([[-279, 0], [-279, 15], [-244, 15], [-244, 19], [-200, 19], [-200, 24], [-188, 24], [-188, 0]], M.steel));
    rot.add(latheX([[188, 0], [188, 30], [197, 30], [197, 42.5], [213, 42.5], [213, 0]], M.steel));
  });

  // ───────────────────────── Pistons ─────────────────────────
  A.part('pistons', { explode: [0, 150, 0], anchor: [-132, 215, 20] }, (g) => {
    const C = E.compH;
    E.cylX.forEach((x) => {
      const p = new THREE.Group();
      p.add(latheY([
        [36.5, -26], [40.45, -26], [40.45, 19], [38.6, 19], [38.6, 22.2], [40.4, 22.2], [40.4, 26.5], [38.9, 26.5],
        [38.9, 28.8], [40.4, 28.8], [40.4, 33.2], [38.9, 33.2], [38.9, 36], [40.3, 36], [40.3, C], [25, C],
        [23.2, C - 1.2], [24.6, C - 8], [22, C - 13.5], [16, C - 15.5], [8, C - 12.5], [0, C - 9.5],
      ], M.alu, 56));
      p.add(latheY([[0, C - 19], [26, C - 21], [36.5, C - 27], [36.5, -26]], M.aluDark, 56));
      for (const sx of [-23, 23]) p.add(put(cyl('x', 17, 13, M.aluDark, 24), sx, 0, 0));
      p.position.set(x, 0, 0);
      g.add(p);
      anim.pistons.push(p);
    });
  });

  // ───────────────────────── Connecting rods ─────────────────────────
  A.part('conrods', { explode: [0, 150, 0], anchor: [-44, 120, 20] }, (g) => {
    E.cylX.forEach((x) => {
      const r = new THREE.Group();
      r.add(extrudeX(poly([[-9, -14], [9, -14], [13, -116], [-13, -116]]), 9, M.forged, { bevel: 2 }));
      r.add(cyl('x', 18.5, 22, M.forged, 32));
      // upper half of the big end; cap, shells and bolts are separate parts
      const be = new THREE.Shape();
      be.moveTo(-44, 0); be.lineTo(-44, 13); be.absarc(0, 0, 33, Math.PI - 0.4, 0.4, true); be.lineTo(44, 13); be.lineTo(44, 0);
      be.lineTo(25.5, 0); be.absarc(0, 0, 25.5, 0, Math.PI, false); be.lineTo(-44, 0);
      r.add(put(extrudeX(be, 23.5, M.forged, { bevel: 1 }), 0, -E.rodL, 0));
      r.position.set(x, 0, 0);
      g.add(r);
      anim.rods.push(r);
    });
  });

  // ───────────────────────── Head gasket ─────────────────────────
  A.part('headGasket', { cut: true, explode: [0, 255, 0], anchor: [190, 236.7, 60] }, (g) => {
    const s = rrect(-200, -84, 200, 84, 14);
    E.cylX.forEach((x) => s.holes.push(circ(x, 0, E.bore / 2 + 1)));
    for (const x of [-176, -88, 0, 88, 176]) for (const z of [-56, 56]) s.holes.push(circ(x, z, 6));
    E.cylX.forEach((x) => { for (const z of [-67, 67]) for (const dx of [-20, 20]) s.holes.push(circ(x + dx, z, 4)); });
    g.add(solid(put(extrudeY(s, 1.5, M.gasket, { curve: 40 }), 0, E.deckY, 0)));
  });

  // ───────────────────────── Cylinder head ─────────────────────────
  A.part('head', { cut: true, casing: true, explode: [0, 340, 0], anchor: [150, HY + 40, 118] }, (g) => {
    const s = rrect(-204, -118, 204, 118, 12);
    E.cylX.forEach((x) => {
      s.holes.push(circ(x, 0, 8));
      valveLayout(x).forEach((v) => s.holes.push(circ(v.x, v.z, (v.type === 'in' ? E.inR : E.exR) + 0.4)));
    });
    g.add(solid(put(extrudeY(s, 66, M.alu, { curve: 28 }), 0, HY, 0)));
    const tub = rrect(-204, -118, 204, 118, 12);
    tub.holes.push(rrect(-194, -108, 194, 108, 6));
    g.add(solid(put(extrudeY(tub, 44, M.alu), 0, HY + 66, 0)));
    // port openings: inlet +Z face, exhaust -Z face (cross-flow, SSP 316)
    E.cylX.forEach((x) => {
      for (const dx of [-16, 16]) g.add(put(cyl('z', 12, 2, M.dark, 24), x + dx, HY + 30, 118));
      g.add(put(cyl('z', 16, 2, M.dark, 24), x, HY + 30, -118));
    });
    // lifting eye + end bosses
    g.add(put(box(8, 40, 30, M.steelDark, 2), 208, HY + 92, -80));
  });

  // ───────────────────────── Valves ─────────────────────────
  const valveMeta = [];
  A.part('valves', { explode: [0, 340, 0], anchor: [-132, HY + 70, 30] }, (g) => {
    E.cylX.forEach((cx, ci) => {
      valveLayout(cx).forEach((v) => {
        const R = v.type === 'in' ? E.inR : E.exR;
        const vg = new THREE.Group();
        vg.add(latheY([[0, 0], [R, 0], [R, 1.5], [R - 1.6, 3.2], [6, 9.5], [3, 15], [3, E.valveLen], [0, E.valveLen]],
          v.type === 'in' ? M.steel : M.exValve, 32));
        vg.add(pc('head', [0, 400, 0], put(cyl('y', 11.5, 3, M.steelDark, 24, 9), 0, 93.6, 0)));            // spring retainer
        for (const s of [-1, 1]) {                                                                           // two collets lock the retainer to the stem
          const k = mesh(new THREE.CylinderGeometry(4.3, 5.4, 4.4, 10, 1, false, s > 0 ? 0.15 : Math.PI + 0.15, Math.PI - 0.3), M.steel);
          k.position.y = 94.6;
          vg.add(pc('head', [s * 14, 432, 0], k));
        }
        vg.position.set(v.x, HY + 0.8, v.z);
        g.add(vg);
        const sp = spring(9.5, 2.8, 28, 5.5, M.steelDark);
        sp.position.set(v.x, HY + 66, v.z);
        sp.userData.noMerge = true;
        g.add(pc('head', [0, 350, 0], sp));
        g.add(pc('head', [0, 300, 0], put(cyl('y', 11.5, 1.2, M.steel, 20), v.x, HY + 66, v.z)));   // lower spring seat
        valveMeta.push({ ...v, ci, obj: vg, spring: sp, y0: HY + 0.8 });
      });
    });
  });

  // ───────────────────────── Roller rocker arms + spindles ─────────────────────────
  A.part('rockers', { explode: [0, 395, 0], anchor: [44, HY + 114, 60] }, (g) => {
    for (const side of [-1, 1]) g.add(put(cyl('x', 6, 386, M.steel, 20), 0, HY + 112, side * 102));
    valveMeta.forEach((v) => {
      const side = v.type === 'in' ? 1 : -1;
      const tipZ = v.z - side * 102;
      const r = new THREE.Group();
      r.add(cyl('x', 10, 12, M.forged, 20));
      r.add(bar([0, 0, 0], [0, -4, tipZ], 9, 9, M.forged, 2));
      r.add(put(cyl('x', 9, 8, M.steel, 20), 0, 3.3, -26 * side));
      r.add(put(cyl('y', 5.5, 11, M.steelDark, 16), 0, -7.5, tipZ));
      r.position.set(v.x, HY + 112, side * 102);
      g.add(r);
      anim.valves.push({ ...v, rocker: r, tipZ });
    });
  });

  // ───────────────────────── Injector rockers (driven by the exhaust camshaft) ─────────────────────────
  A.part('injRockers', { explode: [0, 480, 0], anchor: [44, 408, -52] }, (g) => {
    g.add(put(cyl('x', 8, 392, M.steel, 20), 0, 402, -42));
    E.cylX.forEach((cx, ci) => {
      const r = new THREE.Group();
      r.add(cyl('x', 12, 18, M.forged, 24));
      r.add(bar([-10, 3.9, -20.2], [-4, 0, 0], 12, 10, M.forged, 2));
      r.add(bar([-4, 0, 0], [10, -4, 42], 11, 10, M.forged, 2));
      r.add(put(cyl('x', 10, 12, M.steel, 24), -10, 3.9, -20.2));
      r.add(put(cyl('y', 4, 16, M.steelDark, 12), 10, -6.5, 42));
      r.add(put(hex('y', 6, 4, M.steel), 10, 2, 42));
      r.position.set(cx - 10, 402, -42);
      g.add(r);
      anim.injRockers.push({ ci, o: r });
    });
  });

  // ───────────────────────── Bearing frame ─────────────────────────
  A.part('bearingFrame', { cut: true, explode: [0, 440, 0], anchor: [0, HY + 160, 40] }, (g) => {
    const plate = rrect(-106, HY + 110, 106, HY + 172, 8);
    plate.holes.push(circ(E.camZ, E.camY, 14.6), circ(-E.camZ, E.camY, 14.6), circ(-42, 402, 8.2));
    for (const x of [-176, -88, 0, 88, 176]) g.add(solid(put(extrudeX(plate, 18, M.aluRough), x, 0, 0)));
    for (const z of [-104, 104]) g.add(put(box(370, 10, 6, M.aluRough, 2), 0, HY + 116, z));
    // cable channel for unit injectors and glow plugs + central connector (SSP 316)
    g.add(put(box(372, 9, 16, M.plastic, 3), 0, HY + 177, 30));
    g.add(put(box(26, 26, 34, M.plasticGrey, 4), 196, HY + 160, 30));
    for (const x of [-176, -88, 0, 88, 176]) for (const z of [-44, 0, 44]) g.add(put(hex('y', 5, 5, M.steelDark), x, HY + 174, z));
  });

  // ───────────────────────── Camshafts ─────────────────────────
  const valveLobe = lobeShape(19, 5.5, 60 * DEG, 60 * DEG);
  const injLobe = lobeShape(21, 5, 22 * DEG, 85 * DEG);
  const makeCam = (id, side, anchor) => A.part(id, { explode: [0, 440, 0], anchor }, (g) => {
    const rot = new THREE.Group();
    rot.position.set(0, E.camY, side * E.camZ);
    g.add(rot);
    anim.spinners.push({ o: rot, ratio: 0.5 });
    const x0 = -246, x1 = side > 0 ? 206 : 198;
    rot.add(put(cyl('x', 12.5, x1 - x0, M.steelDark, 24), (x0 + x1) / 2, 0, 0));
    for (const x of [-176, -88, 0, 88, 176]) rot.add(put(cyl('x', 14.4, 20, M.steel, 32), x, 0, 0));
    const gammaValve = Math.atan2(-4 * side, -27.7);
    E.cylX.forEach((cx, ci) => {
      const peak = side > 0 ? 465 : 255;
      const beta = gammaValve - ((E.firePhase[ci] + peak) * DEG) / 2;
      const xs = side > 0 ? [cx, cx - E.vb] : [cx, cx + E.vb];
      for (const x of xs) {
        const l = extrudeX(valveLobe, 12, M.steel, { bevel: 0.8 });
        l.position.x = x; l.rotation.x = beta;
        rot.add(l);
      }
      if (side < 0) {
        const l = extrudeX(injLobe, 15, M.steel, { bevel: 0.8 });
        l.position.x = cx - 20;
        l.rotation.x = 35 * DEG - ((E.firePhase[ci] + 20) * DEG) / 2;
        rot.add(l);
      }
    });
    if (side > 0) {
      // quick-start sender wheel for Hall sender G40 (SSP 316)
      const sw = new THREE.Shape();
      sw.absarc(0, 0, 24, 0, TAU, false);
      const seg = [[10, 28], [100, 112], [190, 208], [280, 304], [40, 85]];
      rot.add(put(cyl('x', 24, 5, M.steelDark, 40), -207, 0, 0));
      seg.forEach(([a, b]) => {
        const t = mesh(new THREE.TorusGeometry(27, 3, 6, 12, (b - a) * DEG), M.steel);
        t.geometry.rotateZ(a * DEG); t.geometry.rotateY(Math.PI / 2);
        rot.add(put(t, -207, 0, 0));
      });
    }
  });
  makeCam('camIn', 1, [60, E.camY + 10, E.camZ]);
  makeCam('camEx', -1, [60, E.camY + 10, -E.camZ]);

  // ───────────────────────── Unit injectors ─────────────────────────
  A.part('injectors', { explode: [0, 520, 0], anchor: [-132, HY + 138, 0] }, (g) => {
    E.cylX.forEach((cx, ci) => {
      const u = new THREE.Group();
      u.add(latheY([[4.3, 58], [7.5, 58], [10.5, 60], [10.5, 106], [13, 108], [13, 124], [9, 126], [4.3, 126], [4.3, 58]], M.steelDark, 32));   // pump body with plunger bore
      u.add(put(box(6, 10, 10, M.steelDark, 1), 11, 121, 11));                                       // seat of the solenoid valve
      const sp = spring(10, 2.4, 18, 4, M.steel);
      sp.position.y = 126;
      sp.userData.noMerge = true;
      u.add(sp);
      const capG = put(cyl('y', 11.5, 6, M.steel, 24), 0, 147, 0);
      capG.userData.noMerge = true;
      u.add(capG);
      u.position.set(cx, HY, 0);
      g.add(u);
      anim.injectors.push({ ci, cap: capG, spring: sp });
    });
  });

  // ───────────────────────── Glow plugs ─────────────────────────
  A.part('glowPlugs', { explode: [0, 400, 120], anchor: [-120, HY + 90, 134] }, (g) => {
    const a = 55 * DEG;
    const dir = new THREE.Vector3(0.02, Math.cos(a), Math.sin(a)).normalize();
    E.cylX.forEach((cx) => {
      const p = new THREE.Group();
      p.add(latheY([[0, 0], [2, 0], [2.5, 3], [2.5, 30], [4, 32], [4, 98], [5, 99], [5, 118], [0, 118]], M.steel, 16));
      p.add(put(hex('y', 4.62, 8, M.steel), 0, 122, 0));                 // 8 mm across flats (parts listing)
      p.add(put(cyl('y', 2.2, 14, M.brass, 12), 0, 133, 0));
      p.add(put(cyl('y', 5.5, 16, M.plastic, 16), 0, 143, 0));
      p.add(put(cyl('y', 2.6, 12, M.steel, 12), 0, 7, 0));
      p.position.set(cx + 10, HY + 2, 8);
      p.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      g.add(p);
    });
    // supply rail from glow plug control unit J370
    g.add(tube(E.cylX.map((cx) => [cx + 13, HY + 91, 134]), 2.5, M.plastic, { cap: true }));
  });

  // ───────────────────────── Cylinder head cover ─────────────────────────
  A.part('valveCover', { cut: true, casing: true, cover: true, explode: [0, 640, 0], anchor: [-80, HY + 192, -40] }, (g) => {
    g.add(put(box(414, 76, 242, M.plastic, 14), 0, HY + 148, 0));
    g.add(put(box(270, 12, 150, M.plastic, 6), -30, HY + 188, -12));        // raised centre section
    // oil filler cap
    g.add(put(cyl('y', 39, 6, M.plastic, 36), 78, HY + 189, 34));
    g.add(put(cyl('y', 34, 16, M.plasticGrey, 36), 78, HY + 198, 34));
    g.add(put(box(40, 3, 9, M.yellow, 1), 78, HY + 207, 34));
    // crankcase breather pressure-regulating valve + hose
    g.add(put(cyl('y', 50, 14, M.plastic, 40), 152, HY + 193, -34));
    g.add(put(cyl('y', 30, 6, M.plasticGrey, 32), 152, HY + 203, -34));
    g.add(put(cyl('z', 12, 20, M.plastic, 18), 150, HY + 196, -78));                                  // valve outlet
    // breather hose: from the pressure-regulating valve to the connection on the intake pipe, between
    // the air mass meter and the turbocharger, so the blow-by gases are drawn back into the engine
    g.add(tube([[150, HY + 196, -86], [140, HY + 204, -120], [108, HY + 214, -176], [62, HY + 214, -222], [42, HY + 206, -236], [40, HY + 196, -238]], 11, M.rubber, { cap: false }));
    for (const [x, y, z, ax] of [[150, HY + 196, -92, 'z'], [40, HY + 199, -238, 'y']]) g.add(put(cyl(ax, 12, 10, M.steel, 20), x, y, z));   // spring band clamps
    for (const x of [-190, -64, 64, 190]) for (const z of [-112, 112]) g.add(put(hex('y', 5.5, 5, M.steelDark), x, HY + 187, z));
  });

  // ───────────────────────── Toothed belt drive ─────────────────────────
  const T = timingLayout();
  E.timing = T;
  A.part('timingBelt', { explode: [-170, 0, 0], anchor: [E.beltX - 16, 262, -108] }, (g) => {
    const X = E.beltX, W = E.beltW;
    const mat = beltMaterial(true);
    g.add(ribbon(T.path, { x: X, width: W, outer: 3.2, inner: 1.6, pitch: E.pitch, mat }));
    anim.belts.push({ mat, perRev: E.crankT });
    const by = Object.fromEntries(T.pulleys.map((p) => [p.id, p]));
    // crankshaft sprocket
    const cs = new THREE.Group();
    cs.add(sprocket(E.crankT, W + 2, M.steelDark, { bore: 15 }));
    cs.add(put(cyl('x', pr(E.crankT) + 3, 2, M.steelDark, 40), 16, 0, 0));
    cs.position.set(X, 0, 0);
    g.add(cs);
    anim.spinners.push({ o: cs, ratio: 1 });
    // camshaft sprockets with hubs
    for (const id of ['camEx', 'camIn']) {
      const p = by[id];
      const s = new THREE.Group();
      s.add(sprocket(E.camT, W + 2, M.steelDark, { holes: 5, bore: 16 }));
      s.add(put(cyl('x', 26, 10, M.steel, 32), -12, 0, 0));
      for (let k = 0; k < 3; k++) s.add(put(hex('x', 6, 5, M.steelDark), -19, 17 * Math.cos(k * TAU / 3), 17 * Math.sin(k * TAU / 3)));
      s.add(put(hex('x', 10, 8, M.steelDark), -20, 0, 0));
      s.position.set(X, p.v, p.u);
      g.add(s);
      anim.spinners.push({ o: s, ratio: 0.5 });
    }
    // tensioner + idlers (running on the back of the belt)
    for (const id of ['tensioner', 'idler1', 'idler2']) {
      const p = by[id];
      const rr = p.r - 3.2;
      const s = new THREE.Group();
      s.add(latheX([[-17, rr - 7], [-17, rr], [17, rr], [17, rr - 7]], id === 'tensioner' ? M.steel : M.plasticGrey, 40));
      s.add(cyl('x', rr - 7, 30, M.steelDark, 32));
      s.add(put(hex('x', 8, 8, M.steel), -17, 0, 0));
      s.position.set(X, p.v, p.u);
      g.add(s);
      anim.spinners.push({ o: s, ratio: -pr(E.crankT) / p.r });
      if (id === 'tensioner') {
        g.add(put(box(4, 46, 30, M.steelDark, 2), X + 19, p.v - 14, p.u + 2));  // tensioner carrier
        g.add(put(cyl('y', 9, 54, M.steelDark, 16), X + 4, p.v - 62, p.u + 14)); // hydraulic damper
      }
    }
  });

  // ───────────────────────── Toothed belt guard ─────────────────────────
  A.part('beltGuard', { cut: true, casing: true, cover: true, explode: [-330, 0, 0], anchor: [E.beltX - 26, E.camY + 30, E.camZ] }, (g) => {
    const by = Object.fromEntries(T.pulleys.map((p) => [p.id, p]));
    const hull = beltPath([
      { u: 0, v: 0, r: 56, s: 1 },
      { u: by.tensioner.u - 8, v: by.tensioner.v, r: 52, s: 1 },
      { u: -E.camZ, v: E.camY, r: pr(E.camT) + 16, s: 1 },
      { u: E.camZ, v: E.camY, r: pr(E.camT) + 16, s: 1 },
      { u: by.idler1.u - 10, v: by.idler1.v, r: 48, s: 1 },
      { u: 74, v: 76, r: 44, s: 1 },
    ], 6);
    const s = new THREE.Shape();
    hull.pts.forEach((p, i) => (i ? s.lineTo(p.u, p.v) : s.moveTo(p.u, p.v)));
    s.closePath();
    g.add(put(extrudeX(s, 38, M.plastic, { bevel: 2 }), E.beltX, 0, 0));
    // the two round bulges over the camshaft sprockets
    for (const sg of [-1, 1]) {
      g.add(put(cyl('x', 64, 7, M.plastic, 48, 58), E.beltX - 23, E.camY, sg * E.camZ));
      g.add(put(torus('x', 66, 2.2, M.plastic), E.beltX - 21, E.camY, sg * E.camZ));
    }
    // split line between upper and lower guard
    g.add(put(box(40, 3, 150, M.plasticGrey, 1), E.beltX, 268, 6));
    for (const [u, v] of [[-128, 300], [128, 300], [-92, 180], [112, 190], [0, 262]]) g.add(put(hex('x', 6, 4, M.steelDark), E.beltX - 22, v, u));
  });

  // combustion flashes (not selectable)
  E.cylX.forEach((cx) => {
    const f = new THREE.Mesh(new THREE.SphereGeometry(21, 20, 12),
      new THREE.MeshBasicMaterial({ color: 0xffa23a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    f.scale.y = 0.42;
    f.position.set(cx, E.deckY - 7, 0);
    f.renderOrder = 5;
    f.userData.noPick = true;
    A.root.add(f);
    anim.flashes.push(f);
  });
}
