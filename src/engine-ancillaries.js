// Ancillaries: flywheel, pumps, belt-driven units, intake, exhaust/turbo, EGR, cooling, oil, sensors.
// Positions and shapes follow photographs of a complete BKD engine from an Audi A3 8P / Golf 5
// (front, rear, belt-end and gearbox-end views). Sizes are scaled from those photos, so treat them as ≈.
import * as THREE from 'three';
import { mesh,
  M, put, cyl, hex, box, sphere, torus, bar, rod, tube, latheX, latheY, extrudeX, extrudeZ,
  rrect, circ, poly, gearShape, beltPath, ribbon, beltMaterial,
} from './helpers.js';
import { buildTurbo } from './engine-turbo.js';
import { E } from './engine-core.js';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const pr = (teeth) => (teeth * E.pitch) / TAU;
const ring = (n, r, fn, phase = 0) => { for (let k = 0; k < n; k++) { const a = phase + (k * TAU) / n; fn(r * Math.cos(a), r * Math.sin(a), a); } };
/** Poly-V profile for a latheX pulley: n grooves of the PK section (3.56 mm pitch) starting at x0, rib tips at rTip. */
const vGrooves = (x0, n, rTip, depth = 2.6, pitch = 3.56) => {
  const o = [];
  for (let i = 0; i < n; i++) o.push([x0 + i * pitch, rTip], [x0 + (i + 0.5) * pitch, rTip - depth]);
  o.push([x0 + n * pitch, rTip]);
  return o;
};
const PK6 = -10.68;            // first rib of a 6PK belt (21.36 mm wide) centred on the belt plane

export function buildAncillaries(A, anim) {
  const HY = E.headY;
  const PY = HY + 30;          // port height
  const HW = 118;              // half width of the cylinder head

  // ───────────────────────── Coolant pump (belt driven, SSP 316) ─────────────────────────
  A.part('coolantPump', { explode: [-90, 0, 40], anchor: [E.beltX, E.pump.v, E.pump.u + 30] }, (g) => {
    const { u, v } = E.pump;
    const wheel = new THREE.Group();
    wheel.add(extrudeX(gearShape(E.pumpT, pr(E.pumpT) - 3.9, pr(E.pumpT) - 0.7), 32, M.steelDark, { curve: 12 }));
    wheel.add(put(cyl('x', 9, 44, M.steel, 20), 20, 0, 0));
    const imp = new THREE.Group();
    imp.add(cyl('x', 30, 3, M.plasticGrey, 32));
    ring(7, 17, (y, z, a) => { const b = put(box(12, 4, 24, M.plasticGrey, 1), 7, y, z); b.rotation.x = a + 0.5; imp.add(b); });
    imp.position.x = 40;
    wheel.add(imp);
    wheel.position.set(E.beltX, v, u);
    g.add(wheel);
    anim.spinners.push({ o: wheel, ratio: E.crankT / E.pumpT });
    g.add(put(latheX([[-12, 16], [-12, 40], [-2, 44], [0, 44], [0, 16]], M.alu, 40), -200, v, u));
  });

  // ───────────────────────── Vibration damper / poly-V pulley ─────────────────────────
  // Ø 140–143 mm over the six ribs and 41–42 mm wide in the parts listings for 03G 105 243.
  const CPR = 71;
  A.part('crankPulley', { explode: [-400, 0, 0], anchor: [E.auxX - 16, 34, -52] }, (g) => {
    const p = new THREE.Group();
    p.add(latheX([[-28, 16], [-28, 35], [-25, 38], [-15, 38], [-15, 54], [-13, 56], [-13, CPR - 1], [-12, CPR], ...vGrooves(PK6, 6, CPR), [12, CPR], [13, CPR - 1], [13, 20]], M.steelDark, 64));
    p.add(latheX([[-13.8, 56], [-13.8, 61], [-13, 61], [-13, 56]], M.rubber, 64));                 // rubber track between hub and inertia ring
    p.add(put(cyl('x', 20, 3, M.steel, 32), -29.5, 0, 0));
    p.add(put(hex('x', 11, 6, M.steelDark), -32, 0, 0));
    ring(6, 28, (y, z) => p.add(put(hex('x', 4.5, 5, M.steel), -30, y, z)));
    p.position.set(E.auxX, 0, 0);
    g.add(p);
    anim.spinners.push({ o: p, ratio: 1 });
  });

  // ───────────────────────── Poly-V belt, tensioner and ancillary bracket ─────────────────────────
  // Pulley diameters from parts listings: alternator Ø 56 (freewheel pulley), A/C compressor Ø 110, both 6 ribs.
  // With these and the damper above, the belt path comes to about 1054 mm; the catalogue belt is a 6PK1050.
  const ALT = { u: 250, v: 195, r: 28 }, AC = { u: 213, v: 0, r: 55 }, TEN = { u: 112, v: 174, r: 33 };
  A.part('auxBelt', { explode: [-350, 0, 60], anchor: [E.auxX, 140, 130] }, (g) => {
    const path = beltPath([{ u: 0, v: 0, r: CPR, s: 1 }, { ...TEN, s: -1 }, { ...ALT, s: 1 }, { ...AC, s: 1 }], 4);
    const mat = beltMaterial(false);
    g.add(ribbon(path, { x: E.auxX, width: 21.4, outer: 2.6, inner: 1.4, pitch: 12, mat }));
    anim.belts.push({ mat, perRev: (TAU * CPR) / 12 });
    const t = new THREE.Group();
    t.add(latheX([[-12, 18], [-12, TEN.r - 2.6], [12, TEN.r - 2.6], [12, 18]], M.plasticGrey, 40));
    t.add(cyl('x', 18, 22, M.steelDark, 24));
    t.add(put(hex('x', 8, 6, M.steel), -13, 0, 0));
    t.position.set(E.auxX, TEN.v, TEN.u);
    g.add(t);
    anim.spinners.push({ o: t, ratio: -CPR / TEN.r });
    // tensioner arm + spring housing (the perforated aluminium piece between pulley and alternator)
    const arm = poly([[70, 60], [150, 78], [176, 150], [150, 214], [96, 208], [78, 150]]);
    for (const [z, y, r] of [[112, 174, 14], [128, 104, 16], [150, 176, 9]]) arm.holes.push(circ(z, y, r));
    g.add(put(extrudeX(arm, 12, M.alu, { bevel: 2 }), E.auxX + 22, 0, 0));
    g.add(put(cyl('x', 30, 26, M.alu, 28), E.auxX + 22, 104, 128));
  });

  // ───────────────────────── Alternator ─────────────────────────
  A.part('alternator', { cut: true, explode: [-40, 0, 230], anchor: [-180, ALT.v + 30, ALT.u + 66] }, (g) => {
    const b = new THREE.Group();
    // open-frame housings: copper windings show through the cooling slots between the ribs
    b.add(put(cyl('x', 63, 104, M.copper, 40), -188, 0, 0));
    b.add(put(cyl('x', 64, 26, M.dark, 40), -221, 0, 0));
    b.add(latheX([[-244, 30], [-244, 52], [-240, 62], [-234, 68], [-230, 68]], M.alu, 48));       // drive-end bearing shield
    b.add(latheX([[-206, 70], [-176, 70]], M.steelDark, 48));                                    // stator laminations
    b.add(latheX([[-146, 68], [-140, 66], [-132, 56], [-130, 40]], M.alu, 48));                  // slip-ring end shield
    b.add(put(cyl('x', 50, 18, M.plastic, 32), -121, 0, 0));
    ring(16, 67, (y, z, a) => {                                                                  // ribs between the cooling slots
      for (const [x, len] of [[-219, 28], [-160, 34]]) { const r = put(box(len, 15, 6, M.alu, 2), x, y, z); r.rotation.x = a; b.add(r); }
    });
    ring(8, 44, (y, z, a) => { const r = put(box(5, 26, 9, M.alu, 2), -243, y, z); r.rotation.x = a; b.add(r); });
    ring(4, 76, (y, z, a) => { const e = put(box(22, 24, 18, M.alu, 4), -190, y, z); e.rotation.x = a; b.add(e); }, 0.5);
    b.add(put(cyl('x', 5, 16, M.brass, 12), -108, 24, 16));                                      // B+ terminal
    b.add(put(box(14, 16, 22, M.plasticGrey, 3), -108, -22, -18));
    b.position.set(0, ALT.v, ALT.u);
    g.add(b);
    const p = new THREE.Group();                                                                    // freewheel pulley, Ø 56 × 41 mm, 6 ribs
    p.add(latheX([[-17, 12], [-17, ALT.r - 5], [-12, ALT.r - 5], [-11.5, ALT.r], ...vGrooves(PK6, 6, ALT.r), [11.5, ALT.r], [12, ALT.r - 5], [24, ALT.r - 5], [24, 12]], M.steel, 40));
    p.add(put(cyl('x', 9, 30, M.steelDark, 16), 8, 0, 0));
    p.add(put(cyl('x', 17, 5, M.plastic, 24), -19, 0, 0));                                          // dust cap of the overrunning clutch
    p.position.set(E.auxX, ALT.v, ALT.u);
    g.add(p);
    anim.spinners.push({ o: p, ratio: CPR / ALT.r });
    // cast bracket carrying alternator and A/C compressor on the front of the block
    g.add(put(box(104, 196, 44, M.aluRough, 8), -186, 112, 136));
    for (const y of [40, 110, 180]) g.add(put(box(96, 8, 50, M.aluRough, 2), -186, y, 137));
  });

  // ───────────────────────── A/C compressor ─────────────────────────
  // Variable swash-plate compressor (Sanden PXE16 / Denso 7SEU17C on this platform). Parts listings give a
  // Ø 110 mm six-rib pulley and 216 mm overall length; the body diameter is scaled from photographs (≈).
  A.part('acCompressor', { cut: true, explode: [-40, -60, 230], anchor: [-160, AC.v + 20, AC.u + 56] }, (g) => {
    const b = new THREE.Group();
    b.add(latheX([[-248, 22], [-248, 34], [-240, 36], [-240, 50], [-232, 56], [-118, 56], [-116, 58], [-112, 58], [-110, 56], [-96, 56], [-86, 48], [-84, 0]], M.alu, 48));   // nose, cylinder block, rear head
    for (const x of [-205, -160]) b.add(put(torus('x', 56, 2.4, M.aluDark), x, 0, 0));
    ring(6, 49, (y, z) => b.add(put(hex('x', 4.5, 5, M.steelDark), -84.5, y, z)), 0.3);            // through-bolts of the rear head
    b.add(put(box(56, 20, 56, M.alu, 5), -112, 54, 0));                                          // port block on the rear head
    for (const z of [-14, 16]) b.add(put(cyl('y', 10, 10, M.dark, 20), -112, 61, z));
    b.add(put(cyl('x', 12, 16, M.aluDark, 20), -77, -24, 18), put(box(11, 13, 17, M.plasticGrey, 2.5), -74, -24, 36));   // regulating valve N280 with plug
    ring(3, 62, (y, z, a) => {                                                                   // mounting ears, front and rear
      for (const [x, len] of [[-218, 30], [-104, 34]]) { const e = put(box(len, 16, 22, M.alu, 5), x, y, z); e.rotation.x = a; b.add(e); }
    }, 2.4);
    b.position.set(0, AC.v, AC.u);
    g.add(b);
    const p = new THREE.Group();
    p.add(latheX([[-13, 24], [-13, AC.r - 6], [-12, AC.r], ...vGrooves(PK6, 6, AC.r), [12, AC.r], [13, AC.r - 6], [13, 24]], M.steelDark, 48));
    p.add(put(cyl('x', AC.r - 10, 3, M.steel, 44), -14.5, 0, 0));                                 // driver plate
    ring(3, 30, (y, z, a) => { const s = put(box(1.5, 9, 34, M.steelDark, 0.5), -16.6, y, z); s.rotation.x = a; p.add(s); }, 0.5);   // leaf-spring links
    ring(6, 33, (y, z) => p.add(put(cyl('x', 3, 2.4, M.steel, 10), -17, y, z)));                  // their rivets
    p.add(put(cyl('x', 18, 6, M.steelDark, 28), -18, 0, 0));
    p.add(put(hex('x', 7, 6, M.steel), -23, 0, 0));
    p.position.set(E.auxX, AC.v, AC.u);
    g.add(p);
    anim.spinners.push({ o: p, ratio: CPR / AC.r });
  });

  // ───────────────────────── Vacuum reservoir ─────────────────────────
  A.part('vacReservoir', { cut: true, explode: [-60, 120, 220], anchor: [-192, 372, 262] }, (g) => {
    const s = new THREE.Group();
    s.add(sphere(52, M.plastic, 1, 40, 24));
    s.add(put(torus('y', 52, 2.4, M.plastic), 0, 0, 0));
    s.add(put(cyl('z', 4.5, 22, M.plastic, 12, 3.2), 0, 8, 58));                                  // vacuum connection
    s.add(put(cyl('y', 16, 16, M.plastic, 20), 0, -54, 0));
    s.position.set(-192, 352, 232);
    s.rotation.x = 0.25;
    g.add(s);
    g.add(bar([-192, 300, 222], [-186, 214, 170], 26, 6, M.steelDark, 2));                        // bracket
  });

  // ───────────────────────── Oil filter module with oil cooler ─────────────────────────
  // Upright canister on the front of the block towards the gearbox end; plate cooler underneath.
  const OF = { x: 88, z: 186 };
  A.part('oilFilter', { cut: true, explode: [40, -40, 240], anchor: [OF.x, 206, OF.z] }, (g) => {
    g.add(put(box(84, 96, 46, M.aluRough, 8), OF.x, 98, 134));                                    // mounting flange on the block
    // canister: deep enough for the Ø 71 × 141 mm element (filter maker's catalogue) under the screw cap
    g.add(put(latheY([[40, 14], [44, 22], [44, 140], [46, 146], [46, 150]], M.aluRough, 48), OF.x, 0, OF.z));
    g.add(put(cyl('y', 40, 6, M.aluRough, 40), OF.x, 16, OF.z));
    for (const a of [0.6, 2.2, 3.9, 5.4]) g.add(put(box(12, 118, 12, M.aluRough, 4), OF.x + 46 * Math.cos(a), 85, OF.z + 46 * Math.sin(a)));
    // screw cap with hexagon
    g.add(put(latheY([[47, 150], [47, 166], [40, 174], [0, 174]], M.plastic, 48), OF.x, 0, OF.z));
    ring(18, 47.5, (dx, dz) => g.add(put(box(3.5, 14, 3.5, M.plastic), OF.x + dx, 158, OF.z + dz)));
    g.add(put(hex('y', 18, 9, M.plastic), OF.x, 178, OF.z));
    // stacked-plate oil cooler (oil / coolant)
    g.add(put(box(96, 22, 96, M.aluRough, 5), OF.x, 2, OF.z + 30));
    for (let k = 0; k < 8; k++) g.add(put(box(116, 5.5, 112, M.alu, 2.5), OF.x, -66 + k * 7.6, OF.z + 42));
    g.add(put(box(120, 4, 116, M.aluDark, 2), OF.x, -71, OF.z + 42));
    for (const dz of [14, 44]) {
      g.add(put(cyl('y', 9, 34, M.alu, 16), OF.x + 46, 6, OF.z + 42 + dz));
      g.add(put(torus('y', 9.5, 1.6, M.alu), OF.x + 46, 18, OF.z + 42 + dz));
    }
    g.add(put(hex('x', 8, 14, M.brass), OF.x - 48, 112, OF.z - 6));                                // oil pressure switch F1
    g.add(put(cyl('x', 6, 12, M.plastic, 12), OF.x - 60, 112, OF.z - 6));
  });

  // ───────────────────────── Oil pump (chain driven) ─────────────────────────
  A.part('oilPump', { explode: [-60, -240, 0], anchor: [-150, -90, 34] }, (g) => {
    g.add(put(box(64, 44, 70, M.alu, 6), -160, -92, 0));
    g.add(put(cyl('x', 26, 10, M.aluDark, 28), -190, -92, 0));
    g.add(tube([[-140, -110, 10], [-100, -148, 14], [-40, -160, 10]], 9, M.steelDark));
    g.add(put(cyl('y', 30, 8, M.steelDark, 28), -40, -164, 10));
    g.add(put(cyl('y', 27, 2, M.steel, 28), -40, -169, 10));
    const sp = new THREE.Group();
    sp.add(extrudeX(gearShape(24, 20, 24), 7, M.steelDark, { curve: 8 }));
    sp.position.set(-206, -92, 0);
    g.add(sp);
    anim.spinners.push({ o: sp, ratio: 0.82 });
    const cs = new THREE.Group();
    cs.add(extrudeX(gearShape(20, 17, 20.5), 7, M.steelDark, { curve: 8 }));
    cs.position.set(-206, 0, 0);
    g.add(cs);
    anim.spinners.push({ o: cs, ratio: 1 });
    const path = beltPath([{ u: 0, v: 0, r: 19.5, s: 1 }, { u: 0, v: -92, r: 23, s: 1 }], 8);
    g.add(ribbon(path, { x: -206, width: 8, outer: 2.5, inner: 2.5, pitch: 8, mat: M.steelDark }));
  });

  // ───────────────────────── Sealing flange with sender wheel (SSP 316) ─────────────────────────
  A.part('sealingFlange', { explode: [90, 0, 0], anchor: [206, 66, -40] }, (g) => {
    const s = rrect(-80, -62, 80, 78, 40);
    s.holes.push(circ(0, 0, 45));
    g.add(put(extrudeX(s, 9, M.plastic), 205, 0, 0));
    g.add(put(torus('x', 45, 2.2, M.plasticGrey), 205, 0, 0));                                    // PTFE seal
    ring(8, 70, (y, z) => g.add(put(hex('x', 4.5, 4, M.steelDark), 211, y * 0.94, z)), 0.3);
    const wheel = new THREE.Group();
    wheel.add(latheX([[-2, 52], [-2, 62], [2, 62], [2, 52]], M.steelDark, 60));
    for (let k = 0; k < 60; k++) {
      if (k === 0 || k === 1 || k === 30 || k === 31) continue;                                   // 60-2-2 reference gaps
      const a = (k * TAU) / 60;
      const t = put(box(4.4, 3, 3.2, k % 2 ? M.steel : M.copper), 0, 62 * Math.cos(a), 62 * Math.sin(a));
      t.rotation.x = a;
      wheel.add(t);
    }
    wheel.position.x = 211.5;
    g.add(wheel);
    anim.spinners.push({ o: wheel, ratio: 1 });
  });
  // Engine speed sender G28: on the front side of the flange, just above crank height
  A.part('g28', { cut: true, explode: [90, 30, 90], anchor: [206, 30, 96] }, (g) => {
    const s = new THREE.Group();
    s.add(put(cyl('y', 8, 30, M.plastic, 16), 0, 82, 0));
    s.add(put(box(14, 12, 26, M.plastic, 3), 0, 100, 6));
    s.add(put(box(12, 10, 14, M.plasticGrey, 2), 0, 100, 24));
    s.add(put(hex('x', 5, 4, M.steel), 8, 96, -8));
    s.position.set(206, 0, 0);
    s.rotation.x = 74 * DEG;
    g.add(s);
  });

  // ───────────────────────── Tandem pump (vacuum + fuel, on the inlet camshaft) ─────────────────────────
  A.part('tandemPump', { cut: true, explode: [130, 340, 0], anchor: [262, E.camY + 30, E.camZ + 20] }, (g) => {
    const p = new THREE.Group();
    p.add(put(box(24, 96, 100, M.aluDark, 10), 218, -4, 0));                                      // fuel pump section
    p.add(latheX([[230, 48], [230, 56], [252, 56], [258, 50], [258, 0]], M.alu, 48));             // vacuum pump housing
    ring(6, 49, (y, z) => p.add(put(hex('x', 5, 5, M.steelDark), 260, y, z)), 0.4);
    p.add(put(cyl('x', 20, 4, M.aluDark, 28), 260, 0, 0));
    p.add(put(cyl('y', 7, 26, M.plastic, 14), 244, 64, 0));                                       // vacuum connection (brake servo, vacuum units)
    p.add(put(hex('y', 7, 12, M.brass), 218, -56, 20));                                           // fuel temperature sender G81
    p.position.set(0, E.camY, E.camZ);
    g.add(p);
    // fuel supply and return pipes running along the front edge of the head cover to the belt end
    for (const [dy, dz] of [[0, 0], [9, 5]]) {
      g.add(tube([[218, E.camY + 30, E.camZ + 46], [200, HY + 104 + dy, HW + 16 + dz], [0, HY + 104 + dy, HW + 16 + dz], [-196, HY + 104 + dy, HW + 16 + dz], [-212, HY + 96 + dy, HW + 34 + dz]], 3.6, M.steel, { radial: 8, tension: 0.2 }));
    }
    for (const x of [-120, 0, 120]) g.add(put(box(10, 22, 20, M.plastic, 2), x, HY + 108, HW + 18));
  });

  // ───────────────────────── Coolant outlet flange + G62 ─────────────────────────
  A.part('coolantFlange', { cut: true, explode: [110, 340, 0], anchor: [222, HY + 30, 40] }, (g) => {
    g.add(put(box(26, 44, 96, M.plastic, 6), 217, HY + 28, -30));
    g.add(put(cyl('z', 17, 46, M.plastic, 24), 218, HY + 28, 34));
    g.add(put(torus('z', 17, 2, M.plastic), 218, HY + 28, 54));
    g.add(put(cyl('x', 10, 30, M.plastic, 16), 242, HY + 34, -20));
  });
  A.part('g62', { explode: [110, 400, 0], anchor: [217, HY + 68, -40] }, (g) => {
    g.add(put(hex('y', 9, 8, M.brass), 217, HY + 53, -40));
    g.add(put(box(16, 18, 20, M.green, 3), 217, HY + 66, -40));
  });

  // ───────────────────────── Thermostat housing ─────────────────────────
  A.part('thermostat', { cut: true, explode: [0, -40, 170], anchor: [-30, 120, 150] }, (g) => {
    g.add(put(box(56, 56, 28, M.alu, 8), -30, 120, 98));
    g.add(put(cyl('z', 17, 40, M.alu, 24), -30, 120, 126));
    g.add(put(torus('z', 17, 2.2, M.alu), -30, 120, 142));
    for (const [x, y] of [[-53, 144], [-7, 96]]) g.add(put(hex('z', 5, 5, M.steelDark), x, y, 113));
  });

  // ───────────────────────── Intake manifold ─────────────────────────
  // Sand-cast aluminium "fan". It does not hang straight down: from the port flange it slopes down and away
  // from the head at about 48°, eight runners sweeping to one outlet. The EGR valve and the anti-shudder
  // valve continue along the same sloping axis, so the charge air arrives from below and in front.
  const IN = { x: 10 };
  const MT = 48 * DEG, MP = { y: PY, z: HW + 8 };                 // slope angle and pivot (the port line)
  /** Group in the manifold's sloping frame: local -y runs down the slope, +z points out of its face. */
  const mframe = (g) => { const f = new THREE.Group(); f.position.set(0, MP.y, MP.z); f.rotation.x = -MT; g.add(f); return f; };
  /** Manifold frame → engine coordinates. */
  const mw = (x, y, z) => [x, MP.y + y * Math.cos(MT) + z * Math.sin(MT), MP.z - y * Math.sin(MT) + z * Math.cos(MT)];
  const J = { egr: -116, asv: -164, mouth: -188, off: 20 };       // stations along the slope
  A.part('intakeManifold', { cut: true, explode: [0, 340, 210], anchor: mw(-120, -16, 40) }, (g) => {
    g.add(put(box(388, 46, 8, M.aluRough, 2), 0, PY, HW + 4));                                     // port flange on the head
    g.add(put(box(372, 34, 18, M.aluRough, 6), 0, PY - 2, HW + 15));                               // port block
    E.cylX.forEach((cx) => { for (const dx of [-36, 36]) g.add(put(hex('z', 5, 5, M.steelDark), cx + dx, PY + 16, HW + 9)); });
    const f = mframe(g);
    const fan = poly([[-180, 4], [-172, 14], [176, 14], [184, 4], [184, -22], [176, -30], [92, -36], [IN.x + 42, -80], [IN.x - 42, -80], [-78, -36], [-172, -30], [-180, -22]]);
    f.add(put(extrudeZ(fan, 26, M.aluRough, { bevel: 5 }), 0, 0, 4));
    f.add(put(cyl('x', 17, 344, M.aluRough, 28), 2, -4, 22));                                      // gallery behind the ports
    E.cylX.forEach((cx) => {
      for (const dx of [-16, 16]) {
        const x0 = cx + dx, x1 = IN.x + (cx + dx - IN.x) * 0.2;
        f.add(tube([[x0, -2, 30], [x0 * 0.72 + IN.x * 0.28, -34, 34], [x1, -62, 30]], 12.5, M.aluRough, { cap: true }));
      }
    });
    for (const x of [-150, 0, 150]) f.add(put(cyl('z', 9, 8, M.aluRough, 16), x, 6, 32));          // bosses
    f.add(put(cyl('y', 34, 16, M.aluRough, 36), IN.x, -86, J.off));                                // outlet
    f.add(put(cyl('y', 50, 5, M.aluRough, 3), IN.x, -92, J.off));                                  // three-bolt flange
  });

  // ───────────────────────── EGR valve (vacuum operated, 038 131 501 AN) ─────────────────────────
  // A short aluminium tube that the intake air passes straight through, bolted between the anti-shudder
  // valve and the manifold by a triangular three-bolt flange. The polished vacuum capsule on its side pulls
  // a poppet off its seat on the opposite side, where the exhaust gas arrives from the EGR cooler.
  const EP = mw(IN.x + 56, J.egr, J.off + 2);                    // exhaust gas port, where the EGR pipe ends
  A.part('egrValve', { cut: true, explode: [0, 200, 320], anchor: mw(IN.x - 66, J.egr + 30, J.off + 24) }, (g) => {
    const v = new THREE.Group();
    v.position.set(IN.x, J.egr, J.off);
    mframe(g).add(v);
    v.add(cyl('y', 34, 44, M.alu, 40));                                                             // through-flow body
    for (const dy of [19, -19]) {
      v.add(put(cyl('y', 50, 6, M.alu, 3), 0, dy, 0));                                              // triangular flange
      ring(3, 44, (dx, dz) => v.add(put(cyl('y', 9, 6.4, M.alu, 16), dz, dy, dx)), 0);
    }
    v.add(put(torus('y', 31, 1.6, M.rubber), 0, 22.4, 0));                                          // O-ring 62 × 3 to the manifold
    v.add(latheX([[-76, 0], [-76, 14], [-72, 24], [-64, 27], [-60, 36], [-56, 39.5], [-51, 39.5], [-49, 30], [-43, 15], [-33, 13]], M.stainless, 44));   // vacuum capsule
    v.add(put(torus('x', 39.6, 1.7, M.steel), -53.5, 0, 0));
    v.add(put(cyl('z', 3, 18, M.stainless, 10), -68, 6, 24));                                       // vacuum connection from N18
    v.add(put(cyl('x', 3, 62, M.steel, 10), -4, 0, 0));                                             // valve stem across the bore
    v.add(put(cyl('x', 20, 22, M.alu, 24), 43, 0, 2));                                              // exhaust gas port
    v.add(put(box(6, 30, 56, M.alu, 6), 53, 0, 2));
    for (const dz of [-21, 21]) v.add(put(hex('x', 4.6, 5, M.steelDark), 50, 0, 2 + dz));
    v.add(put(cyl('x', 17, 1.2, M.gasket, 24), 56.4, 0, 2));                                        // seal 32 mm
  });

  // ───────────────────────── Anti-shudder valve V157 (intake manifold flap) ─────────────────────────
  // Electric throttle body bolted under the EGR valve: aluminium ring with a brass flap on a spindle and a
  // black plastic housing for the positioning motor and gears. The charge air hose plugs onto its mouth.
  A.part('intakeFlap', { cut: true, explode: [0, 120, 360], anchor: mw(IN.x + 76, J.asv, J.off + 30) }, (g) => {
    const a = new THREE.Group();
    a.position.set(IN.x, J.asv, J.off);
    a.rotation.x = Math.PI;                                       // its own +y = out of the mouth, down the slope
    mframe(g).add(a);
    a.add(cyl('y', 33, 48, M.aluDark, 40));                                                          // throttle body
    a.add(put(cyl('y', 50, 6, M.aluDark, 3), 0, -21, 0));                                            // flange to the EGR valve
    ring(3, 44, (dx, dz) => a.add(put(cyl('y', 9, 6.4, M.aluDark, 16), dz, -21, dx), put(hex('y', 4.6, 4, M.steelDark), dz, -16, dx)), 0);   // three M6 × 20 bolts
    a.add(put(torus('y', 28.6, 1.3, M.rubber), 0, -24.4, 0));                                        // O-ring 55 × 2.5
    a.add(put(torus('y', 30.4, 2.4, M.aluDark), 0, 20, 0));                                          // bead the hose coupling locks behind
    a.add(put(cyl('y', 28, 1, M.dark, 32), 0, 24.2, 0));                                             // bore
    const flap = put(cyl('y', 26.6, 1.6, M.brass, 32), 0, 22, 0);                                    // flap, shown part open
    flap.rotation.x = 0.55;
    a.add(flap);
    a.add(put(cyl('x', 2.6, 84, M.steel, 10), 4, 8, 0));                                             // spindle
    a.add(put(cyl('x', 12, 10, M.aluDark, 18), -38, 8, 0));                                          // return spring cap
    a.add(put(box(40, 52, 56, M.plastic, 9), 52, 2, 0));                                             // positioning motor housing
    a.add(put(cyl('x', 27, 12, M.plastic, 30), 76, 6, 4));                                           // gear cover
    for (let k = 0; k < 5; k++) { const t = (k * Math.PI * 2) / 5; a.add(put(hex('x', 2.6, 3, M.steelDark), 82, 6 + 22 * Math.cos(t), 4 + 22 * Math.sin(t))); }
    a.add(put(box(20, 18, 28, M.plasticGrey, 3), 56, -30, -20));                                     // five-pin connector
  });

  // ───────────────────────── Charge air hose + G31 / G42 ─────────────────────────
  A.part('chargePipe', { cut: true, explode: [-30, 40, 400], anchor: [-180, 92, 372] }, (g) => {
    // flap unit → rubber hose → rigid plastic pipe → hose → belt-side tank of the charge air cooler (ETKA 145-085)
    g.add(tube([mw(IN.x, J.mouth + 4, J.off), mw(IN.x, J.mouth - 40, J.off), [-16, 100, 332], [-54, 90, 340]], 29, M.hose, { cap: false, radial: 24 }));
    g.add(tube([[-54, 90, 340], [-110, 88, 342], [-170, 88, 356], [-216, 87, 374]], 27, M.plastic, { cap: false, radial: 24 }));
    const mouth = mframe(g);                                                                          // coupling on the anti-shudder valve
    mouth.add(put(cyl('y', 34, 26, M.plastic, 28), IN.x, J.mouth - 12, J.off), put(torus('y', 35.6, 1.4, M.steel), IN.x, J.mouth - 4, J.off));
    g.add(tube([[-216, 87, 372], [-246, 85, 388], [-268, 82, 406], [-272, 80, 426], [-272, 80, 452]], 29, M.hose, { cap: false, radial: 24 }));   // turns in early to pass outside the fan ring
    // plug-in couplings with seal ring and wire retaining clip (ETKA 145-085: seal 57.85 / 58.05 mm, clip SCA52)
    for (const [x, y, z, ry] of [[-58, 90, 340, 1.5], [-212, 87, 372, 1.05], [-272, 80, 462, 0]]) {
      const c = new THREE.Group();
      c.add(cyl('z', 34, 26, M.plastic, 28));
      const clip = mesh(new THREE.TorusGeometry(35.6, 1.4, 6, 28, Math.PI * 1.55), M.steel);
      clip.rotation.z = Math.PI * 0.72;
      c.add(put(clip, 0, 0, 5), put(box(10, 5, 3, M.steel), 0, 37, 5));
      for (const dz of [-22, 22]) c.add(put(mesh(new THREE.CylinderGeometry(30.6, 30.6, 16, 28, 1, true), M.steel), 0, 0, dz)).children.at(-1).rotation.x = Math.PI / 2;   // crimped ferrules
      c.position.set(x, y, z); c.rotation.y = -ry;
      g.add(c);
    }
  });
  A.part('g31', { cut: true, explode: [-30, 40, 450], anchor: [-120, 140, 336] }, (g) => {
    g.add(put(box(22, 18, 26, M.plastic, 3), -120, 121, 344));
    g.add(put(box(14, 14, 18, M.plasticGrey, 2), -120, 135, 348));
    g.add(put(hex('y', 4, 4, M.steel), -108, 128, 336));
  });

  // ───────────────────────── Solenoid valve block (N18, N345, N75) ─────────────────────────
  A.part('valveBlock', { cut: true, explode: [120, 300, 260], anchor: [172, HY + 112, HW + 76] }, (g) => {
    g.add(put(box(70, 62, 8, M.plastic, 3), 172, HY + 93, HW + 52));
    g.add(bar([172, HY + 112, HW + 50], [172, HY + 108, HW + 6], 30, 6, M.plastic, 2));
    [150, 172, 194].forEach((x, i) => {
      g.add(put(cyl('y', 11, 36, M.plastic, 18), x, HY + 86, HW + 68));
      g.add(put(box(14, 12, 14, M.plasticGrey, 2), x, HY + 108, HW + 72));
      g.add(put(cyl('z', 3, 12, M.plasticGrey, 8), x, HY + 74 + i * 3, HW + 82));
    });
  });

  // ───────────────────────── Exhaust manifold ─────────────────────────
  const TY = 195, TZ = -185, TX = -62;      // turbocharger shaft axis and x-offset
  A.part('exhaustManifold', { explode: [0, 340, -200], anchor: [110, PY + 10, -148] }, (g) => {
    g.add(put(box(376, 44, 10, M.exhaust, 3), 0, PY, -(HW + 5)));
    E.cylX.forEach((cx) => {
      const mx = cx * 0.45 + TX * 0.3;
      g.add(tube([[cx, PY, -(HW + 4)], [cx, PY, -(HW + 22)], [mx, PY - 10, -160], [TX + 48, 256, TZ + 6]], 15, M.exhaust, { cap: false }));
      for (const dx of [-24, 24]) g.add(put(hex('z', 5.5, 6, M.exhaustDark), cx + dx, PY + 14, -(HW + 12)));
    });
    g.add(put(sphere(27, M.exhaust, 0.9), TX + 48, 254, TZ + 4));
    g.add(put(cyl('y', 22, 14, M.exhaust, 24), TX + 48, 244, TZ + 2));
    g.add(put(cyl('y', 15, 14, M.exhaust, 20), 86, PY + 16, -146));                               // EGR take-off
    // heat shield over the belt-end runners
    g.add(put(box(150, 4, 52, M.stainless, 2), -118, PY + 26, -150)).children.at(-1).rotation.x = -0.35;
  });

  // ───────────────────────── Turbocharger GT1749VA (see engine-turbo.js) ─────────────────────────
  buildTurbo(A, anim, { TX, TY, TZ, OF });

  // ───────────────────────── Oxidising catalytic converter ─────────────────────────
  const CX = TX + 154;
  A.part('catalyst', { explode: [80, -40, -420], anchor: [CX, 40, TZ - 54] }, (g) => {
    g.add(tube([[TX + 102, TY, TZ], [TX + 128, TY - 2, TZ], [CX - 4, TY - 24, TZ + 3], [CX, TY - 52, TZ + 4]], 30, M.stainless, { cap: false, radial: 24 }));
    g.add(put(cyl('x', 38, 5, M.exhaustDark, 36), TX + 105, TY, TZ));
    g.add(put(latheY([[26, -72], [26, -54], [30, -46], [52, -28], [56, -22], [56, 102], [53, 108], [34, 132], [31, 137], [31, 144]], M.stainless, 48), CX, 0, TZ + 4));   // shell with rolled-in cones
    for (const y of [-16, 0, 86, 98]) g.add(put(torus('y', 56.5, 2, M.stainless), CX, y, TZ + 4));   // stiffening beads at the brick ends
    g.add(put(cyl('y', 38, 5, M.exhaustDark, 36), CX, -72, TZ + 4));
  });

  // ───────────────────────── Switchable EGR cooler ─────────────────────────
  // Mounted high on the rear of the head, level with the head cover; U-flow, both gas pipes at the gearbox-side end.
  const EC = { y: HY + 118, z: -(HW + 36) };
  A.part('egrCooler', { explode: [-20, 380, -200], anchor: [-80, EC.y + 40, EC.z] }, (g) => {
    g.add(put(box(196, 66, 46, M.alu, 12), -78, EC.y, EC.z));
    for (let k = 0; k < 6; k++) for (const dy of [-14, 14]) g.add(put(box(20, 12, 4, M.aluDark, 2), -158 + k * 30, EC.y + dy, EC.z - 22.5));
    g.add(put(cyl('y', 10, 30, M.alu, 16), -60, EC.y + 44, EC.z));                                // coolant connections
    g.add(put(torus('y', 10.5, 1.8, M.alu), -60, EC.y + 56, EC.z));
    g.add(put(cyl('x', 9, 26, M.alu, 16), -186, EC.y - 8, EC.z));
    g.add(put(box(34, 56, 44, M.alu, 6), 30, EC.y, EC.z));                                        // flap housing
    // vacuum unit for the bypass flap (changeover at 50 °C coolant, SSP 316)
    g.add(put(latheX([[-12, 5], [-10, 20], [2, 22], [10, 16], [12, 5]], M.plastic, 24), 22, EC.y - 44, EC.z - 6));
    g.add(rod([32, EC.y - 44, EC.z - 6], [44, EC.y - 20, EC.z - 14], 2, M.steel));
    // feed from the exhaust manifold: flexible bellows pipe
    const feed = [[86, PY + 22, -146], [74, HY + 74, -(HW + 34)], [56, HY + 92, -(HW + 40)], [44, EC.y - 14, EC.z]];
    g.add(tube(feed, 12, M.stainless, { cap: false }));
    for (let k = 0; k < 6; k++) g.add(put(torus('y', 13.5, 1.6, M.stainless), 82 - k * 2.4, PY + 30 + k * 6, -146 - k * 1.6));
  });

  // ───────────────────────── EGR pipe to the intake side ─────────────────────────
  A.part('egrPipe', { explode: [140, 120, 0], anchor: [246, 232, 20] }, (g) => {
    g.add(tube([
      [46, EC.y + 16, EC.z], [110, EC.y + 22, EC.z + 2], [182, EC.y + 6, EC.z + 12], [230, HY + 60, -(HW + 6)],
      [246, HY + 14, -98], [248, 228, -40], [248, 226, 60], [236, 222, 150], [190, 218, 214],
      [124, 210, 232], EP,
    ], 13, M.stainless, { cap: false, seg: 160 }));
    g.add(put(cyl('x', 22, 4, M.stainless, 24), EP[0] + 1, EP[1], EP[2]));
    g.add(put(cyl('x', 20, 4, M.stainless, 24), 48, EC.y + 16, EC.z));
    g.add(put(box(10, 26, 22, M.steelDark, 2), 248, 214, 10));                                    // support bracket
  });

  // ───────────────────────── Oil dipstick ─────────────────────────
  A.part('dipstick', { cut: true, explode: [-20, 80, 190], anchor: [-100, 312, HW + 74] }, (g) => {
    g.add(tube([[-92, -30, 118], [-94, 120, 150], [-98, 240, HW + 64], [-100, 292, HW + 72]], 5, M.steelDark, { radial: 10 }));
    g.add(put(cyl('y', 7, 10, M.orange, 14), -100, 296, HW + 72));
    g.add(put(torus('z', 14, 3.4, M.orange), -100, 315, HW + 72));
  });

  // ───────────────────────── Hall sender G40 (camshaft position) ─────────────────────────
  A.part('g40', { cut: true, explode: [-120, 340, 60], anchor: [-201, HY + 96, E.camZ + 10] }, (g) => {
    g.add(put(box(10, 22, 30, M.plastic, 3), -201, HY + 96, E.camZ));
    g.add(put(box(10, 12, 18, M.plasticGrey, 2), -201, HY + 84, E.camZ + 22));
    g.add(put(hex('x', 4.5, 4, M.steel), -215, HY + 92, E.camZ - 10));
  });
}
