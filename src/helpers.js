// Geometry + material helpers. All dimensions are millimetres (1 unit = 1 mm).
// Axes: X = crankshaft axis (cyl. 1 / toothed belt at -X, flywheel at +X),
//       Y = up, Z = across the engine (+Z intake side, -Z exhaust side).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;
const std = (name, color, roughness, metalness, extra = {}) => {
  const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  m.name = name;
  return m;
};

export const M = {
  castIron: std('castIron', 0x26282c, 0.62, 0.4),
  castIronLight: std('castIronLight', 0x5c6066, 0.72, 0.6),
  alu: std('alu', 0xc3c6ca, 0.5, 0.85),
  aluDark: std('aluDark', 0x93989e, 0.58, 0.8),
  aluRough: std('aluRough', 0xa9adb2, 0.72, 0.7),
  steel: std('steel', 0xd9dce0, 0.22, 1.0),
  steelDark: std('steelDark', 0x777c84, 0.4, 0.95),
  forged: std('forged', 0x9ca1a8, 0.48, 0.9),
  exValve: std('exValve', 0xa39684, 0.4, 0.9),
  plastic: std('plastic', 0x24262b, 0.56, 0.05),
  plasticGrey: std('plasticGrey', 0x474c54, 0.66, 0.05),
  rubber: std('rubber', 0x0d0d0f, 0.93, 0.0),
  exhaust: std('exhaust', 0x74523f, 0.92, 0.4),
  exhaustDark: std('exhaustDark', 0x5a4438, 0.9, 0.45),
  stainless: std('stainless', 0xb9b4a8, 0.36, 0.95),
  brass: std('brass', 0xc79c4c, 0.34, 1.0),
  copper: std('copper', 0xc27a4e, 0.4, 1.0),
  paintBlack: std('paintBlack', 0x1f2125, 0.42, 0.55),
  gasket: std('gasket', 0x8a9199, 0.42, 0.9),
  orange: std('orange', 0xff7a1a, 0.5, 0.0),
  yellow: std('yellow', 0xf2c230, 0.5, 0.0),
  green: std('green', 0x2f9e62, 0.55, 0.0),
  blue: std('blue', 0x2c6fd6, 0.55, 0.0),
  dark: std('dark', 0x050506, 1.0, 0.0),
  hose: std('hose', 0x141416, 0.86, 0.0),
  loom: std('loom', 0x1b1b1e, 0.74, 0.0),
  braid: std('braid', 0xa9a49b, 0.46, 0.9),
  tank: std('tank', 0xe4dfc9, 0.42, 0.0),
  red: std('red', 0xb0221d, 0.5, 0.0),
  lead: std('lead', 0x8d9096, 0.55, 0.8),
};

// ───────────────────────── surface detail ─────────────────────────
// Photo-scanned PBR maps (ambientCG, CC0) sampled tri-planar in object space, so the
// procedural geometry needs no UVs. d = { set, scale (mm per repeat), n (normal strength),
// r (share of scanned roughness), tint (albedo mottling), color (share of scanned colour) }.
const texCache = {};
// Site root as served: "/" on the dev server, the repository sub-path on GitHub Pages (undefined under plain Node).
const BASE = (import.meta.env && import.meta.env.BASE_URL) || "/";
function tex(name, srgb = false) {
  if (!texCache[name]) {
    const t = new THREE.TextureLoader().load(`${BASE}textures/${name}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    texCache[name] = t;
  }
  return texCache[name];
}
const TRI_PARS = `
uniform sampler2D triNormal;
uniform sampler2D triRough;
uniform vec4 triP;
uniform float triTint;
#ifdef TRI_COLOR
uniform sampler2D triColor;
#endif
uniform mat3 normalMatrix;
varying vec3 vTriPos;
varying vec3 vTriNrm;
`;
const TRI_MAP = `
vec3 triN0 = normalize(vTriNrm);
vec3 triB = pow(abs(triN0), vec3(4.0));
triB /= (triB.x + triB.y + triB.z);
vec3 triQ = vTriPos * triP.x;
float triR = dot(vec3(texture2D(triRough, triQ.zy).g, texture2D(triRough, triQ.xz).g, texture2D(triRough, triQ.xy).g), triB);
diffuseColor.rgb *= mix(1.0, 0.3 + 0.85 * triR, triTint);
#ifdef TRI_COLOR
vec3 triC = texture2D(triColor, triQ.zy).rgb * triB.x + texture2D(triColor, triQ.xz).rgb * triB.y + texture2D(triColor, triQ.xy).rgb * triB.z;
diffuseColor.rgb = mix(diffuseColor.rgb, triC, triP.w);
#endif
`;
const TRI_NORMAL = `
{
  vec3 tx = texture2D(triNormal, triQ.zy).xyz * 2.0 - 1.0;
  vec3 ty = texture2D(triNormal, triQ.xz).xyz * 2.0 - 1.0;
  vec3 tz = texture2D(triNormal, triQ.xy).xyz * 2.0 - 1.0;
  vec3 triN = normalize(triN0 + triP.y * (vec3(0.0, tx.y, tx.x) * triB.x + vec3(ty.x, 0.0, ty.y) * triB.y + vec3(tz.x, tz.y, 0.0) * triB.z));
  normal = normalize(normalMatrix * triN);
  #ifdef DOUBLE_SIDED
  normal *= faceDirection;
  #endif
}
`;
export function applyDetail(m, d) {
  if (typeof document === 'undefined' || !d) return m;
  m.userData.detail = d;
  const uniforms = {
    triNormal: { value: tex(`${d.set}_NormalGL`) },
    triRough: { value: tex(`${d.set}_Roughness`) },
    triP: { value: new THREE.Vector4(1 / d.scale, d.n ?? 0.5, d.r ?? 0.3, d.color ?? 0) },
    triTint: { value: d.tint ?? 0 },
  };
  if (d.color) uniforms.triColor = { value: tex(`${d.set}_Color`, true) };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTriPos;\nvarying vec3 vTriNrm;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTriPos = position;\nvTriNrm = normal;');
    sh.fragmentShader = (d.color ? '#define TRI_COLOR\n' : '') + sh.fragmentShader
      .replace('#include <common>', '#include <common>' + TRI_PARS)
      .replace('#include <map_fragment>', '#include <map_fragment>' + TRI_MAP)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = clamp(mix(roughnessFactor, triR, triP.z), 0.05, 1.0);')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>' + TRI_NORMAL);
  };
  m.customProgramCacheKey = () => (d.color ? 'tri-c' : 'tri');
  return m;
}
/** Clone a material and keep its surface detail (Material.clone drops onBeforeCompile). */
export function cloneMat(m) {
  const c = m.clone();
  if (m.userData.detail) applyDetail(c, m.userData.detail);
  return c;
}
const cast = (n, r, tint, scale = 80) => ({ set: 'Metal016', scale, n, r, tint });
const machined = (n = 0.25, r = 0.35) => ({ set: 'Metal009', scale: 55, n, r, tint: 0.15 });
const moulded = (n = 0.5) => ({ set: 'Plastic012A', scale: 38, n, r: 0.4, tint: 0.2 });
const DETAIL = {
  castIron: cast(0.9, 0.3, 0.4, 90), castIronLight: cast(0.9, 0.35, 0.4, 70),
  alu: cast(0.45, 0.3, 0.3), aluDark: cast(0.6, 0.35, 0.35), aluRough: cast(1.0, 0.45, 0.45),
  paintBlack: cast(0.3, 0.2, 0.2, 60),
  steel: machined(0.2, 0.3), steelDark: machined(0.3, 0.4), forged: machined(0.35, 0.4), exValve: machined(),
  gasket: machined(), stainless: machined(0.3, 0.4), brass: machined(0.2, 0.3), copper: machined(0.2, 0.3), lead: machined(0.3, 0.3),
  plastic: moulded(0.55), plasticGrey: moulded(0.5), orange: moulded(0.35), yellow: moulded(0.35), green: moulded(0.35), blue: moulded(0.35),
  tank: moulded(0.3), red: moulded(0.3),
  rubber: { set: 'Rubber004', scale: 44, n: 0.8, r: 0.5, tint: 0.3 },
  hose: { set: 'Fabric031', scale: 24, n: 0.55, r: 0.35, tint: 0.25 },
  loom: { set: 'Fabric031', scale: 13, n: 1.0, r: 0.4, tint: 0.3 },
  braid: { set: 'Fabric031', scale: 16, n: 1.3, r: 0.3, tint: 0.5 },
  exhaust: { set: 'Rust007', scale: 120, n: 1.0, r: 0.7, tint: 0, color: 0.62 },
  exhaustDark: { set: 'Metal063', scale: 120, n: 0.8, r: 0.6, tint: 0, color: 0.5 },
};
for (const [k, d] of Object.entries(DETAIL)) applyDetail(M[k], d);

/** Cooler matrix: flat tubes with fins between them, as colour + bump map on a box (uv 0…1 per face). */
export function coreMaterial(name, color, w, h, metal = 0.75) {
  const m = std(name, color, 0.55, metal);
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const x = c.getContext('2d');
    x.fillStyle = '#5c5c5c'; x.fillRect(0, 0, 32, 32);
    x.fillStyle = '#262626'; for (let i = 0; i < 32; i += 4) x.fillRect(i, 0, 1, 32);
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, 32, 9);
    x.fillStyle = '#b9b9b9'; x.fillRect(0, 8, 32, 1); x.fillRect(0, 0, 32, 1);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(Math.round(w / 14), Math.round(h / 10));
    t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace;
    m.map = t; m.bumpMap = t; m.bumpScale = 2.5;
  }
  return m;
}

export function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
export function put(o, x = 0, y = 0, z = 0) { o.position.set(x, y, z); return o; }
/** Mark a closed mesh as a solid body: gets a painted cap when the cutaway is on. */
export function solid(o) { o.traverse((c) => { if (c.isMesh) c.userData.solid = true; }); return o; }

/** Cylinder along axis 'x' | 'y' | 'z', centred. r = radius at the -axis end, r2 at the +axis end. */
export function cyl(axis, r, len, mat, seg = 32, r2 = r) {
  const g = new THREE.CylinderGeometry(r2, r, len, seg);
  if (axis === 'x') g.rotateZ(-Math.PI / 2);
  else if (axis === 'z') g.rotateX(Math.PI / 2);
  return mesh(g, mat);
}
export function hex(axis, r, len, mat) { return cyl(axis, r, len, mat, 6); }
export function box(sx, sy, sz, mat, r = 0) {
  const g = r > 0 ? new RoundedBoxGeometry(sx, sy, sz, 3, Math.min(r, sx / 2, sy / 2, sz / 2)) : new THREE.BoxGeometry(sx, sy, sz);
  return mesh(g, mat);
}
export function sphere(r, mat, sy = 1, ws = 24, hs = 16) {
  const m = mesh(new THREE.SphereGeometry(r, ws, hs), mat);
  m.scale.y = sy;
  return m;
}
export function torus(axis, R, r, mat, arc = TAU, seg = 44) {
  const g = new THREE.TorusGeometry(R, r, 14, seg, arc);
  if (axis === 'x') g.rotateY(Math.PI / 2);
  else if (axis === 'y') g.rotateX(Math.PI / 2);
  return mesh(g, mat);
}

/** Box stretched between two points (w across X-ish, h thick). */
export function bar(p1, p2, w, h, mat, r = 0) {
  const a = new THREE.Vector3(...p1), b = new THREE.Vector3(...p2);
  const d = b.clone().sub(a);
  const len = d.length();
  const m = box(w, len, h, mat, r);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
/** Thin round rod between two points. */
export function rod(p1, p2, r, mat, seg = 12) {
  const a = new THREE.Vector3(...p1), b = new THREE.Vector3(...p2);
  const d = b.clone().sub(a);
  const m = mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}

/** Smooth pipe through points. Returns a Group (tube + rounded ends). */
export function tube(pts, r, mat, { seg, radial = 16, cap = true, tension = 0.5 } = {}) {
  const v = pts.map((p) => new THREE.Vector3(...p));
  const curve = new THREE.CatmullRomCurve3(v, false, 'catmullrom', tension);
  const g = new THREE.Group();
  g.add(mesh(new THREE.TubeGeometry(curve, seg ?? Math.max(20, pts.length * 12), r, radial, false), mat));
  if (cap) {
    for (const p of [v[0], v[v.length - 1]]) {
      const s = mesh(new THREE.SphereGeometry(r, radial, 10), mat);
      s.position.copy(p);
      g.add(s);
    }
  }
  return g;
}

/** Surface of revolution about X. profile = [[x, radius], ...] with x ascending along the outside. */
export function latheX(profile, mat, seg = 48) {
  const pts = profile.map(([x, r]) => new THREE.Vector2(Math.max(r, 0.001), x));
  const g = new THREE.LatheGeometry(pts, seg);
  g.rotateZ(-Math.PI / 2);
  return mesh(g, mat);
}
/** Surface of revolution about Y. profile = [[radius, y], ...] with y ascending along the outside. */
export function latheY(profile, mat, seg = 48) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.001), y));
  return mesh(new THREE.LatheGeometry(pts, seg), mat);
}

function extrudeGeo(shape, depth, { bevel = 0, curve = 24 } = {}) {
  return new THREE.ExtrudeGeometry(shape, {
    depth, curveSegments: curve, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2,
  });
}
/** Extrude a (z, y) cross-section along X; result is centred on x = 0. */
export function extrudeX(shape, depth, mat, opts) {
  const g = extrudeGeo(shape, depth, opts);
  g.rotateY(-Math.PI / 2);
  g.translate(depth / 2, 0, 0);
  return mesh(g, mat);
}
/** Extrude an (x, y) front-view shape along +Z; back face at z = 0. */
export function extrudeZ(shape, depth, mat, opts) {
  return mesh(extrudeGeo(shape, depth, opts), mat);
}
/** Extrude an (x, z) plan shape upward along Y; base at y = 0. */
export function extrudeY(shape, depth, mat, opts) {
  const g = extrudeGeo(shape, depth, opts);
  g.rotateX(Math.PI / 2);
  g.translate(0, depth, 0);
  return mesh(g, mat);
}

export function rrect(x0, y0, x1, y1, r) {
  const s = new THREE.Shape();
  s.moveTo(x0 + r, y0);
  s.lineTo(x1 - r, y0); s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x1, y1 - r); s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  s.lineTo(x0 + r, y1); s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + r); s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}
export function circ(cx, cy, r) {
  const p = new THREE.Path();
  p.absarc(cx, cy, r, 0, TAU, true);
  return p;
}
export function poly(points) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}
/** Toothed wheel outline: n teeth between root and tip radius. */
export function gearShape(n, rRoot, rTip) {
  const s = new THREE.Shape();
  const step = TAU / n;
  const prof = [[rRoot, 0], [rRoot, 0.2], [rTip, 0.32], [rTip, 0.68], [rRoot, 0.8]];
  let first = true;
  for (let i = 0; i < n; i++) {
    for (const [r, f] of prof) {
      const t = (i + f) * step;
      const x = r * Math.cos(t), y = r * Math.sin(t);
      if (first) { s.moveTo(x, y); first = false; } else s.lineTo(x, y);
    }
  }
  s.closePath();
  return s;
}

/** Helical compression spring standing on y = 0, natural length len. */
export function spring(r, wire, len, turns, mat) {
  class Helix extends THREE.Curve {
    getPoint(t, target = new THREE.Vector3()) {
      const a = t * turns * TAU;
      return target.set(r * Math.cos(a), t * len, r * Math.sin(a));
    }
  }
  return mesh(new THREE.TubeGeometry(new Helix(), Math.round(turns * 16), wire / 2, 6, false), mat);
}

/**
 * Belt / chain running clockwise (seen from the -X end, u = z to the right, v = y up) round pulleys.
 * pulleys: [{u, v, r, s}] in travel order; s = +1 pulley inside the loop, -1 back-side idler.
 */
export function beltPath(pulleys, stepDeg = 4) {
  const n = pulleys.length;
  const tang = [];
  for (let i = 0; i < n; i++) {
    const A = pulleys[i], B = pulleys[(i + 1) % n];
    const Du = B.u - A.u, Dv = B.v - A.v, L = Math.hypot(Du, Dv);
    const a = Du / L, b = Dv / L;
    const c = (A.s * A.r - B.s * B.r) / L;
    const s = Math.sqrt(Math.max(0, 1 - c * c));
    const nu = c * a - s * b, nv = c * b + s * a;
    tang.push({
      out: { u: A.u + A.s * A.r * nu, v: A.v + A.s * A.r * nv },
      inn: { u: B.u + B.s * B.r * nu, v: B.v + B.s * B.r * nv },
    });
  }
  const pts = [];
  for (let i = 0; i < n; i++) {
    const P = pulleys[i];
    const tin = tang[(i - 1 + n) % n].inn, tout = tang[i].out;
    const a0 = Math.atan2(tin.v - P.v, tin.u - P.u), a1 = Math.atan2(tout.v - P.v, tout.u - P.u);
    let d = P.s > 0 ? -((((a0 - a1) % TAU) + TAU) % TAU) : (((a1 - a0) % TAU) + TAU) % TAU;
    if (Math.abs(d) > 5.6) d = 0;
    const steps = Math.max(1, Math.ceil(Math.abs(d) / (stepDeg * Math.PI / 180)));
    for (let k = 0; k <= steps; k++) {
      const a = a0 + (d * k) / steps;
      pts.push({ u: P.u + P.r * Math.cos(a), v: P.v + P.r * Math.sin(a) });
    }
    P.wrap = Math.abs(d);
  }
  let length = 0;
  for (let i = 0; i < pts.length; i++) {
    const q = pts[(i + 1) % pts.length];
    length += Math.hypot(q.u - pts[i].u, q.v - pts[i].v);
  }
  return { pts, length };
}

/** Flat belt body following a beltPath. x = centre plane, texture u counts pitches. */
export function ribbon(path, { x, width, outer, inner, pitch, mat }) {
  const P = path.pts, n = P.length;
  const pos = [], nor = [], uv = [], idx = [];
  let cum = 0;
  const ring = [];
  for (let i = 0; i <= n; i++) {
    const p = P[i % n], prev = P[(i - 1 + n) % n], next = P[(i + 1) % n];
    if (i > 0) cum += Math.hypot(p.u - P[i - 1].u, p.v - P[i - 1].v);
    let tu = next.u - prev.u, tv = next.v - prev.v;
    const tl = Math.hypot(tu, tv) || 1; tu /= tl; tv /= tl;
    ring.push({ p, nu: -tv, nv: tu, s: cum / pitch });
  }
  const xa = x - width / 2, xb = x + width / 2;
  // faces: [offset A, offset B, xA, xB, normal kind, v]
  const push = (px, off, r, nx, ny, nz, u, v) => {
    pos.push(px, r.p.v + r.nv * off, r.p.u + r.nu * off); nor.push(nx, ny, nz); uv.push(u, v);
  };
  for (let i = 0; i <= n; i++) {
    const r = ring[i];
    push(xa, outer, r, 0, r.nv, r.nu, r.s, 0.75); push(xb, outer, r, 0, r.nv, r.nu, r.s, 0.75); // outer
    push(xa, -inner, r, 0, -r.nv, -r.nu, r.s, 0.25); push(xb, -inner, r, 0, -r.nv, -r.nu, r.s, 0.25); // inner (teeth)
    push(xa, outer, r, -1, 0, 0, r.s, 0.75); push(xa, -inner, r, -1, 0, 0, r.s, 0.75); // side a
    push(xb, outer, r, 1, 0, 0, r.s, 0.75); push(xb, -inner, r, 1, 0, 0, r.s, 0.75); // side b
  }
  for (let i = 0; i < n; i++) {
    const a = i * 8, b = (i + 1) * 8;
    for (const k of [0, 2, 4, 6]) idx.push(a + k, a + k + 1, b + k, a + k + 1, b + k + 1, b + k);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return mesh(g, mat);
}

/** Rubber belt material; the lower half of the texture carries the tooth pattern. */
export function beltMaterial(teeth = true) {
  const m = new THREE.MeshStandardMaterial({ color: 0x1a1a1d, roughness: 0.88, metalness: 0, side: THREE.DoubleSide });
  m.name = 'belt';
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 32, 32);
    if (teeth) { ctx.fillStyle = '#6a6a6a'; ctx.fillRect(0, 16, 15, 16); }
    else { ctx.fillStyle = '#9a9a9a'; for (let i = 0; i < 4; i++) ctx.fillRect(0, i * 8 + 5, 32, 2); }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    m.map = t;
  }
  return m;
}

/** Merge sibling meshes that share a material (keeps animated groups intact, cuts draw calls). */
export function mergeStatic(node) {
  for (const c of [...node.children]) if (!c.isMesh) mergeStatic(c);
  const buckets = new Map();
  for (const c of node.children) {
    if (!c.isMesh || c.children.length || c.userData.noMerge || c.userData.noPick) continue;
    const k = c.material.uuid + (c.userData.solid ? 's' : '');
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(c);
  }
  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    const geos = list.map((m) => {
      m.updateMatrix();
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.applyMatrix4(m.matrix);
      for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
      return g;
    });
    const merged = mergeGeometries(geos, false);
    if (!merged) continue;
    const m = mesh(merged, list[0].material);
    if (list[0].userData.solid) m.userData.solid = true;
    for (const x of list) { node.remove(x); x.geometry.dispose(); }
    node.add(m);
  }
}

/** Registry of named, selectable parts. */
export class Assembly {
  constructor() {
    this.root = new THREE.Group();
    this.parts = {};
  }
  part(id, opts, fn) {
    const g = new THREE.Group();
    g.name = id;
    g.userData = {
      partId: id,
      explode: new THREE.Vector3(...(opts.explode || [0, 0, 0])),
      cut: !!opts.cut, casing: !!opts.casing, cover: !!opts.cover, anchor: opts.anchor || null,
    };
    fn(g);
    this.root.add(g);
    this.parts[id] = g;
    return g;
  }
}
