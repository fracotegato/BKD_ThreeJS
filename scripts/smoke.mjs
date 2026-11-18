// Node smoke test: builds the engine without a browser and prints the envelope of every part.
import * as THREE from 'three';
import { buildEngine } from '../src/engine.js';
import { PARTS } from '../src/parts-data.js';

const eng = buildEngine();
eng.root.updateMatrixWorld(true);
const f = (n) => n.toFixed(0).padStart(5);
let meshes = 0, tris = 0;
for (const [id, g] of Object.entries(eng.parts)) {
  const b = new THREE.Box3().setFromObject(g);
  g.traverse((o) => { if (o.isMesh) { meshes++; tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; } });
  let bad = false;
  g.traverse((o) => { if (o.isMesh) { const p = o.geometry.attributes.position.array; for (let i = 0; i < p.length; i++) if (!Number.isFinite(p[i])) bad = true; } });
  console.log(id.padEnd(16), 'x', f(b.min.x), f(b.max.x), ' y', f(b.min.y), f(b.max.y), ' z', f(b.min.z), f(b.max.z), bad ? '  <-- NaN' : '', PARTS[id] ? '' : '  <-- no data');
}
for (const id of Object.keys(PARTS)) if (!eng.parts[id]) console.log('data without geometry:', id);
const all = new THREE.Box3().setFromObject(eng.root);
console.log('TOTAL', all.min.toArray().map(f).join(' '), '|', all.max.toArray().map(f).join(' '), '| size', all.getSize(new THREE.Vector3()).toArray().map(f).join(' '));
console.log('meshes', meshes, 'triangles', Math.round(tris));
const T = eng.E.timing;
console.log('belt length', T.path.length.toFixed(2), 'target', T.target.toFixed(2), 'tensioner u', T.pulleys[1].u.toFixed(1));
for (const p of T.pulleys) console.log('  ', p.id.padEnd(10), 'wrap', (p.wrap * 180 / Math.PI).toFixed(0) + '°');
for (const t of [0, 1, 2, 3, 5, 7, 9, 11]) eng.update(t);
console.log('kinematics ok');
