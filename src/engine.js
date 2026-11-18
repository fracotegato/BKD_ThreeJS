// Assembles the engine and drives its kinematics.
import * as THREE from 'three';
import { Assembly, mergeStatic } from './helpers.js';
import { E, buildCore } from './engine-core.js';
import { buildAncillaries } from './engine-ancillaries.js';
import { buildPeriphery } from './engine-periphery.js';
import { buildGearbox } from './engine-gearbox.js';
import { buildDetail } from './engine-detail.js';

const DEG = Math.PI / 180;
const smooth = (t) => t * t * (3 - 2 * t);
const bump = (a, open, close) => (a > open && a < close ? Math.sin((Math.PI * (a - open)) / (close - open)) ** 2 : 0);

/** Valve lift (0…1) for a cylinder cycle angle a in degrees, 0 = firing TDC, 720° per cycle. */
export function valveLift(type, a) {
  if (type === 'ex') return Math.max(bump(a, 140, 370), bump(a + 720, 140, 370));
  return bump(a, 350, 580);
}
/** Unit injector pump plunger travel (0…1). */
export function plunger(a) {
  const x = a > 360 ? a - 720 : a;
  if (x >= -24 && x <= 20) return smooth((x + 24) / 44);
  if (x > 20 && x <= 190) return Math.cos((Math.PI / 2) * ((x - 20) / 170)) ** 2;
  return 0;
}
export const STROKES = ['Power', 'Exhaust', 'Intake', 'Compression'];
export function cycleAngle(thetaDeg, ci) {
  return (((thetaDeg - E.firePhase[ci]) % 720) + 720) % 720;
}

export function buildEngine() {
  const A = new Assembly();
  const anim = { pieces: [], followers: [], spinners: [], pistons: [], rods: [], valves: [], injRockers: [], injectors: [], belts: [], flashes: [] };
  buildCore(A, anim);
  buildAncillaries(A, anim);
  buildPeriphery(A, anim);
  buildGearbox(A, anim);
  buildDetail(A, anim);
  for (const g of Object.values(A.parts)) mergeStatic(g);

  function update(theta, running = false) {
    const deg = theta / DEG;
    for (const s of anim.spinners) s.o.rotation.x = theta * s.ratio;
    for (let i = 0; i < 4; i++) {
      const a = theta + (E.throwSign[i] < 0 ? Math.PI : 0);
      const sy = E.r * Math.sin(a);
      const y = E.r * Math.cos(a) + Math.sqrt(E.rodL * E.rodL - sy * sy);
      anim.pistons[i].position.y = y;
      anim.rods[i].position.y = y;
      anim.rods[i].rotation.x = -Math.asin(sy / E.rodL);
    }
    for (const f of anim.followers) { f.o.position.y = f.src.position.y; f.o.rotation.x = f.src.rotation.x; }
    for (const v of anim.valves) {
      const lift = valveLift(v.type, cycleAngle(deg, v.ci)) * E.valveLift;
      v.obj.position.y = v.y0 - lift;
      v.spring.scale.y = (28 - lift) / 28;
      v.rocker.rotation.x = lift / v.tipZ;
    }
    for (const r of anim.injRockers) r.o.rotation.x = (plunger(cycleAngle(deg, r.ci)) * E.injStroke) / 42;
    for (const u of anim.injectors) {
      const p = plunger(cycleAngle(deg, u.ci)) * E.injStroke;
      u.cap.position.y = 147 - p;
      u.spring.scale.y = (18 - p) / 18;
    }
    anim.flashes.forEach((f, ci) => {
      const a = cycleAngle(deg, ci);
      const k = running && a < 70 ? Math.sin((Math.PI * a) / 70) : 0;
      f.material.opacity = 0.85 * k;
      f.visible = k > 0.01;
    });
    for (const b of anim.belts) if (b.mat.map) b.mat.map.offset.x = -((theta / (Math.PI * 2)) * b.perRev) % 1;
  }
  update(0);

  /**
   * t = engine-wide exploded view (0…1); views = { turbo, gearbox, clutch } progress of each assembly's own
   * exploded view. An assembly comes apart when either asks for it; subGlobal scales it down in the engine-wide view.
   */
  function setExplode(t, views = {}) {
    const k = (group, scale = 1) => Math.max(t * scale, views[group] || 0);
    for (const g of Object.values(A.parts)) {
      g.position.copy(g.userData.explode).multiplyScalar(t);
      if (g.userData.sub) g.position.addScaledVector(g.userData.sub, k(g.userData.group, g.userData.subGlobal ?? 1));
      if (g.userData.also) for (const v in g.userData.also) g.position.addScaledVector(g.userData.also[v], views[v] || 0);   // moves as a unit in another assembly's view
    }
    for (const p of anim.pieces) p.o.position.copy(p.home).addScaledVector(p.sub, k(p.group || 'turbo', p.scale ?? 1));
  }

  return { root: A.root, parts: A.parts, update, setExplode, E };
}
