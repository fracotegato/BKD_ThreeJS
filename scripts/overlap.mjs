// Interference check. For every part, sample points on its surface and count how many lie inside the
// solid of another part (ray parity, confirmed in two directions). Pairs that are meant to touch are
// skipped: parts linked in the data, housings that enclose other parts, and members of the same assembly.
// Usage: node scripts/overlap.mjs [minimum share of points inside, default 0.06]
import * as THREE from 'three';
import { buildEngine } from '../src/engine.js';
import { PARTS } from '../src/parts-data.js';

const MIN = Number(process.argv[2] || 0.06), SAMPLES = 220;
const e = buildEngine();
e.root.updateMatrixWorld(true);
const parts = Object.entries(e.parts).map(([id, g]) => {
  const meshes = [];
  g.traverse((o) => { if (o.isMesh) { o.material.side = THREE.DoubleSide; meshes.push(o); } });
  const box = new THREE.Box3().setFromObject(g);
  // surface sample points: every n-th vertex, in world space
  const pts = [];
  let total = 0;
  for (const m of meshes) total += m.geometry.attributes.position.count;
  const step = Math.max(1, Math.floor(total / SAMPLES));
  let k = 0;
  for (const m of meshes) {
    const p = m.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) if (k++ % step === 0) pts.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld));
  }
  return { id, g, meshes, box, pts, ud: g.userData };
});
const linked = (a, b) => PARTS[a].links.some(([t]) => t === b) || PARTS[b].links.some(([t]) => t === a);
const rc = new THREE.Raycaster();
const dirs = [new THREE.Vector3(1, 0.013, 0.007).normalize(), new THREE.Vector3(-0.011, 1, 0.017).normalize()];
const inside = (pt, B) => dirs.every((d) => { rc.set(pt, d); return rc.intersectObjects(B.meshes, false).length % 2 === 1; });

const out = [];
for (const A of parts) {
  for (const B of parts) {
    if (A === B || !A.box.intersectsBox(B.box)) continue;
    if (B.ud.casing || A.ud.casing || linked(A.id, B.id)) continue;
    if (A.ud.group && A.ud.group === B.ud.group) continue;                 // internals of one assembly are checked by eye in its exploded view
    let n = 0, c = new THREE.Vector3();
    for (const p of A.pts) if (B.box.containsPoint(p) && inside(p, B)) { n++; c.add(p); }
    if (n / A.pts.length >= MIN) out.push({ a: A.id, b: B.id, share: n / A.pts.length, at: c.multiplyScalar(1 / n) });
  }
}
out.sort((x, y) => y.share - x.share);
for (const o of out) console.log(`${(o.share * 100).toFixed(0).padStart(3)}%  ${o.a} inside ${o.b}  near (${o.at.x.toFixed(0)}, ${o.at.y.toFixed(0)}, ${o.at.z.toFixed(0)})`);
console.log(`${out.length} overlapping pairs at or above ${(MIN * 100).toFixed(0)}%`);
