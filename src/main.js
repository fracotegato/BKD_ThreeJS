import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildEngine, cycleAngle, STROKES } from './engine.js';
import { cloneMat } from './helpers.js';
import { PARTS, SYSTEMS, ENGINE } from './parts-data.js';

const TAU = Math.PI * 2;
const $ = (s, el = document) => el.querySelector(s);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const state = {
  selected: null, hover: null, system: null,
  xray: false, cut: false, covers: true, periph: true, labels: true, dims: false,
  explode: 0, explodeTarget: 0, crank: false, block: false, head: false, injector: false, turbo: false, gearbox: false, clutch: false,
  viewT: { crank: 0, block: 0, head: 0, injector: 0, turbo: 0, gearbox: 0, clutch: 0 },
  isolate: true, spread: 1, running: false, rpm: 30,
  tab: 'overview', partTab: 'overview', query: '',
};
// Phone layout (see style.css, "phone layout"): html.phone is set at 760 px width and below and on short landscape screens.
// Wider windows never get the class and every phone branch below is skipped, so the desktop page is unchanged.
const root = document.documentElement;
const phoneMQ = matchMedia('(max-width: 760px), (max-height: 500px) and (orientation: landscape)');
const landMQ = matchMedia('(max-height: 500px) and (orientation: landscape)');
// sheet: which bottom-navigation sheet is open (parts | apart | view | run), one at a time. free: the canvas area nothing covers.
const ui = { phone: phoneMQ.matches, land: phoneMQ.matches && landMQ.matches, sheet: null, free: null };
// view offset (px) and zoom that keep the model centred and fitted in the free area; eased towards the t* values in the frame loop
const view3 = { x: 0, y: 0, z: 1, tx: 0, ty: 0, tz: 1, snap: true };
root.classList.toggle('phone', ui.phone);
root.classList.toggle('land', ui.land);
if (ui.phone) state.tab = 'parts';
// Assembly exploded views: one at a time. extra = neighbours kept solid, skip = parts left out of the camera framing.
const VIEWS = {
  // lift raises the whole model so that parts dropping out of the bottom stay above the floor
  crank: { extra: ['block'], skip: [], dir: [0.52, 0.16, 0.84], lift: 760, fit: 0.9 },
  block: { extra: [], skip: [], dir: [-0.5, 0.22, 0.84], lift: 440, fit: 0.9 },
  head: { extra: [], skip: [], dir: [-0.46, 0.2, 0.86], lift: 250, fit: 0.95 },
  injector: { extra: [], skip: [], dir: [-0.5, 0.12, 0.86], lift: 160, fit: 0.9 },
  turbo: { extra: ['catalyst'], skip: ['turboOilFeed'], dir: [-0.22, 0.42, -0.88] },
  gearbox: { extra: [], skip: ['shiftCables'], dir: [0.5, 0.36, 0.79], fit: 1.02 },
  clutch: { extra: [], skip: ['clutchPedal', 'clutchMaster', 'fluidReservoir', 'clutchPipe'], dir: [0.46, 0.3, 0.84] },
};
const VIEW_NAMES = { crank: 'Crankcase', block: 'Cylinder block', head: 'Cylinder head', injector: 'Unit injectors', turbo: 'Turbocharger GT1749VA', gearbox: 'Gearbox 02Q', clutch: 'Clutch and clutch control' };
const activeView = () => Object.keys(VIEWS).find((v) => state[v]);
/** A part belongs to a view through its own group, or by moving with it as a unit (userData.also). */
const inView = (g, view) => g.userData.group === view || !!(g.userData.also && g.userData.also[view]);
const viewShift = (g, view) => (g.userData.group === view ? g.userData.sub : g.userData.also[view]);
const viewEase = () => Object.fromEntries(Object.keys(VIEWS).map((v) => [v, ease(state.viewT[v])]));

// ───────────────────────── renderer / scene ─────────────────────────
const canvas = $('#c');
const panel = $('#panel');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture;
scene.environmentIntensity = 0.8;
scene.fog = new THREE.Fog(0x12161b, 3200, 7500);

const camera = new THREE.PerspectiveCamera(34, 1, 20, 14000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 140;
controls.maxDistance = 4200;
controls.maxPolarAngle = Math.PI * 0.94;
controls.zoomToCursor = true;

const key = new THREE.DirectionalLight(0xfff4e6, 2.4);
key.position.set(-650, 1100, 800);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -900, right: 900, top: 900, bottom: -900, near: 100, far: 3200 });
key.shadow.bias = -0.0004;
key.shadow.normalBias = 1.2;
scene.add(key, new THREE.HemisphereLight(0xbfd4ff, 0x1a1c20, 0.5));
const rim = new THREE.DirectionalLight(0x9fc4ff, 0.9);
rim.position.set(700, 500, -900);
scene.add(rim);

// ───────────────────────── engine ─────────────────────────
const engine = buildEngine();
scene.add(engine.root);
const parts = engine.parts;
engine.root.updateMatrixWorld(true);

const cutPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
const cutCache = new Map();
const cutMat = (m, isSolid) => {
  const k = m.uuid + (isSolid ? 's' : 'h');
  if (!cutCache.has(k)) {
    const c = cloneMat(m);
    c.clippingPlanes = [cutPlane];
    c.clipShadows = true;
    c.side = isSolid ? THREE.FrontSide : THREE.DoubleSide;
    cutCache.set(k, c);
  }
  return cutCache.get(k);
};
const capMat = new THREE.MeshBasicMaterial({ color: 0xc8502c, side: THREE.BackSide, clippingPlanes: [cutPlane] });

const pickables = [];
const caps = [];
const homeBox = new THREE.Box3();
for (const [id, g] of Object.entries(parts)) {
  const box = new THREE.Box3().setFromObject(g);
  homeBox.union(box);
  g.userData.size = box.getSize(new THREE.Vector3());
  const anchor = new THREE.Object3D();
  if (g.userData.anchor) anchor.position.fromArray(g.userData.anchor); else box.getCenter(anchor.position);
  g.add(anchor);
  g.userData.anchorObj = anchor;
  g.userData.state = 'normal';
  const meshes = [];
  g.traverse((o) => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) {
    o.userData.partId = id;
    if (g.userData.cut) {
      o.material = cutMat(o.material, !!o.userData.solid);
      if (o.userData.solid) {
        const cap = new THREE.Mesh(o.geometry, capMat);
        cap.userData.isCap = true;
        cap.raycast = () => {};
        cap.visible = false;
        o.add(cap);
        caps.push({ cap, g });
      }
    }
    o.userData.base = o.material;
    pickables.push(o);
  }
}
const homeSize = homeBox.getSize(new THREE.Vector3());
const homeCenter = homeBox.getCenter(new THREE.Vector3());

// floor: shadow catcher + 100 mm grid
const floorY = homeBox.min.y - 10;
const floor = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.ShadowMaterial({ opacity: 0.42 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = floorY;
floor.receiveShadow = true;
scene.add(floor);
const grid = new THREE.GridHelper(4000, 40, 0x55606e, 0x2c333d);
grid.position.y = floorY + 0.5;
grid.material.transparent = true;
grid.material.opacity = 0.55;
scene.add(grid);

// ───────────────────────── material states ─────────────────────────
const variants = new Map();
function variant(base, kind) {
  let v = variants.get(base);
  if (!v) variants.set(base, (v = {}));
  if (!v[kind]) {
    const m = kind === 'ghost' ? base.clone() : cloneMat(base);
    if (kind === 'ghost') {
      m.transparent = true; m.opacity = 0.05; m.depthWrite = false; m.map = null;
      m.roughness = 0.9; m.metalness = 0.1; m.color.lerp(new THREE.Color(0x9db4cc), 0.75);
      m.side = THREE.FrontSide;
    } else if (kind === 'hover') {
      m.emissive = new THREE.Color(0xffffff); m.emissiveIntensity = 0.13;
    }
    v[kind] = m;
  }
  return v[kind];
}

function refresh() {
  const view = activeView();
  const hideRest = state.isolate && (view || state.system);
  for (const [id, g] of Object.entries(parts)) {
    const inV = !!view && inView(g, view);
    // focus = the assembly being taken apart, or the chosen system
    const focus = view ? inV || VIEWS[view].extra.includes(id) : state.system ? PARTS[id].sys === state.system : true;
    g.visible = (((state.covers || !g.userData.cover) && (state.periph || !g.userData.periph)) || inV) && !(hideRest && !focus);
    let st = 'normal';
    if (view) st = focus ? 'normal' : 'ghost';
    else if (state.selected) st = id === state.selected ? 'normal' : 'ghost';
    else if (state.system) st = focus ? 'normal' : 'ghost';
    else if (state.xray && g.userData.casing) st = 'ghost';
    if (st === 'normal' && id === state.hover && id !== state.selected) st = 'hover';
    if (g.userData.state === st) continue;
    g.userData.state = st;
    g.traverse((o) => {
      if (!o.isMesh || o.userData.isCap) return;
      o.material = st === 'normal' ? o.userData.base : variant(o.userData.base, st);
      o.castShadow = st !== 'ghost';
      o.renderOrder = st === 'ghost' ? 2 : 0;
    });
  }
  for (const { cap, g } of caps) cap.visible = state.cut && g.userData.state !== 'ghost';
  renderer.localClippingEnabled = state.cut;
  labelsDirty = true;
  updateContext();
}

// ───────────────────────── camera ─────────────────────────
let fly = null;
const HOME_DIR = new THREE.Vector3(-0.56, 0.5, 0.66).normalize();
/** Height the toolbar block covers at the bottom of the canvas (side-panel layout). */
function bottomHeight() {
  if (ui.phone) return innerHeight - freeArea().b;
  const b = document.getElementById('bottom');
  return b ? Math.min(innerHeight * 0.45, b.getBoundingClientRect().height + 14) : 0;
}
/** Phone layout: the rectangle of the canvas that the top bar, status pill, navigation, open sheet and HUD leave free.
    Uses offset* (layout boxes), so the sheets' slide-in animation does not disturb it. */
function freeArea() {
  const w = innerWidth, h = innerHeight, f = { l: 0, t: 0, r: w, b: h };
  const shown = (el) => !!el && el.offsetHeight > 0;
  const brand = $('#brand'), ctx = $('#context'), nav = $('#mnav'), bot = $('#bottom'), tb = $('#toolbar');
  if (shown(brand)) f.t = brand.offsetTop + brand.offsetHeight;
  if (shown(ctx)) f.t = Math.max(f.t, ctx.offsetTop + ctx.offsetHeight);
  if (ui.land) {                                  // rail on the left, sheets docked on the right
    if (shown(nav)) f.l = nav.offsetWidth;
    if (shown(panel)) f.r = panel.offsetLeft;
    if (shown(tb)) f.r = Math.min(f.r, tb.offsetLeft);
  } else {                                        // navigation at the bottom, sheets above it
    if (shown(nav)) f.b = nav.offsetTop;
    if (shown(panel)) f.b = Math.min(f.b, panel.offsetTop);
  }
  if (shown(bot)) f.b = Math.min(f.b, bot.offsetTop);   // HUD (+ toolbar sheet in portrait)
  if (f.r - f.l < 120) { f.l = 0; f.r = w; }
  if (f.b - f.t < 120) { f.b = Math.max(f.b, Math.min(h, f.t + 120)); f.t = Math.min(f.t, f.b - 120); }
  return f;
}
function applyView() {
  camera.setViewOffset(innerWidth, innerHeight, view3.x, view3.y, innerWidth, innerHeight);
  camera.zoom = view3.z;
  camera.updateProjectionMatrix();
  labelsDirty = true;
}
/** Phone layout: aim the camera at the centre of the free area and scale the picture to it (called whenever a sheet opens or closes). */
function syncFree() {
  if (!ui.phone || !innerWidth || !innerHeight) return;
  const f = (ui.free = freeArea());
  view3.tx = innerWidth / 2 - (f.l + f.r) / 2;
  view3.ty = innerHeight / 2 - (f.t + f.b) / 2;
  // the fit is for the bounding sphere, which no view of the model fills: use a little more of a small screen
  view3.tz = THREE.MathUtils.clamp((Math.min(f.r - f.l, f.b - f.t) * 1.08) / innerHeight, 0.15, 1.08);
  if (view3.snap) {
    view3.snap = false;
    view3.x = view3.tx; view3.y = view3.ty; view3.z = view3.tz;
    applyView();
  }
}
function fitDistance(radius) {
  // fit a sphere into the part of the canvas the info panel leaves free
  if (!innerWidth || !innerHeight) return radius * 3.4;      // page opened in a hidden tab: no layout yet
  // phone: fit to the full canvas height; camera.zoom (syncFree) then scales that down to whatever area is free right now
  if (ui.phone) return radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
  const r = panel.getBoundingClientRect();
  const side = r.height > innerHeight * 0.7;
  const freeW = side ? r.left : innerWidth, freeH = side ? innerHeight - bottomHeight() : r.top;
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const a = Math.min(Math.atan((t * freeH) / innerHeight), Math.atan((t * freeW) / innerHeight));
  return radius / Math.sin(Math.max(a, 0.05));
}
function flyTo(target, pos, ms = 900) {
  fly = { t0: performance.now(), ms, p0: camera.position.clone(), q0: controls.target.clone(), p1: pos.clone(), q1: target.clone() };
}
function goHome(ms = 1000) {
  const box = new THREE.Box3();
  for (const g of Object.values(parts)) if (g.visible) box.expandByObject(g);
  const c = box.getCenter(new THREE.Vector3());
  const r = box.getSize(new THREE.Vector3()).length() * 0.5;
  flyTo(c, c.clone().addScaledVector(HOME_DIR, fitDistance(r) * 0.94), ms);
}
// Assembly exploded view: frame the components where they will be once pulled apart.
function viewGroup(name) {
  const V = VIEWS[name], box = new THREE.Box3(), b = new THREE.Box3(), rest = state.spread - ease(state.viewT[name]);
  for (const g of Object.values(parts)) {
    if (!inView(g, name) || V.skip.includes(g.name)) continue;
    b.setFromObject(g).translate(_v.copy(viewShift(g, name)).multiplyScalar(rest));
    b.translate(_v.set(0, (V.lift || 0) - engine.root.position.y, 0));   // where the model will be once it has been raised
    box.union(b);
  }
  const c = box.getCenter(new THREE.Vector3());
  const r = box.getSize(new THREE.Vector3()).length() * 0.5;
  flyTo(c, c.clone().addScaledVector(new THREE.Vector3(...V.dir).normalize(), fitDistance(r) * (V.fit || 0.8)), 1100);
}
// Centre the camera on whatever is in focus: the chosen system, or the whole (visible) model.
function frameFocus(ms = 900) {
  const box = new THREE.Box3();
  for (const [id, g] of Object.entries(parts)) if (g.visible && (!state.system || PARTS[id].sys === state.system)) box.expandByObject(g);
  if (box.isEmpty()) return;
  const c = box.getCenter(new THREE.Vector3());
  const r = Math.max(120, box.getSize(new THREE.Vector3()).length() * 0.5);
  const dir = camera.position.clone().sub(controls.target).normalize();
  flyTo(c, c.clone().addScaledVector(dir, fitDistance(r) * 0.92), ms);
}
// Status line above the toolbar: what is on screen now, and the way back.
function updateContext() {
  const el = $('#context');
  if (!el) return;
  const view = activeView();
  let what = '', n = 0;
  if (view) { what = `<b>${VIEW_NAMES[view]}</b> taken apart`; n = Object.values(parts).filter((g) => inView(g, view)).length; }
  else if (state.system) { what = `<b>${SYSTEMS[state.system].name}</b>`; n = Object.keys(parts).filter((id) => PARTS[id].sys === state.system).length; }
  else if (state.selected) what = `<b>${PARTS[state.selected].name}</b> selected`;
  if (ui.phone) {
    // compact pill under the top bar; a selected part alone is already named by its sheet, so the pill only covers assemblies and systems
    const name = view ? VIEW_NAMES[view] : state.system ? SYSTEMS[state.system].name : '';
    const sub = view ? `${n} parts · taken apart` : `${n} parts · rest ${state.isolate ? 'hidden' : 'ghosted'}`;
    el.classList.toggle('idle', !name);
    el.innerHTML = name ? `<span class="dot"></span><span class="m-what"><b>${name}</b><small>${sub}</small></span><button class="primary" data-ctx="reset">Show whole engine</button>` : '';
    if (name) root.dataset.ctx = '1'; else delete root.dataset.ctx;
    syncNav();
    syncFree();
    return;
  }
  el.classList.toggle('idle', !what);
  el.innerHTML = what
    ? `<span class="dot"></span><span>${what}${n ? ` · ${n} parts` : ''}${view || state.system ? (state.isolate ? ' · everything else hidden' : ' · everything else ghosted') : ''}</span><button class="primary" data-ctx="reset">Show whole engine</button>`
    : '<span class="dot"></span><span>Whole engine. Click a part, pick a system on the left, or take one assembly apart below.</span>';
}
function showAll() {
  for (const v in VIEWS) if (state[v]) { state[v] = false; $(`[data-tg="${v}"]`, toolbar).classList.remove('on'); }
  state.system = null; state.selected = null; state.explodeTarget = 0;
  syncSlider();
  refresh(); renderSystems(); renderPanel(); updateDimBox();
  goHome(900);
}
function syncSlider() {
  const view = activeView();
  $('#explodeLbl').textContent = view ? 'Spread' : 'Explode all';
  explodeInput.value = Math.round((view ? state.spread : state.explodeTarget) * 100);
}
function focusPart(id) {
  const box = new THREE.Box3().setFromObject(parts[id]);
  const c = box.getCenter(new THREE.Vector3());
  const r = Math.max(60, box.getSize(new THREE.Vector3()).length() * 0.5);
  const dir = camera.position.clone().sub(controls.target).normalize();
  const off = c.clone().sub(homeCenter);
  off.y = 0;
  if (off.length() > 110) {
    dir.multiplyScalar(0.45).add(off.normalize()).add(new THREE.Vector3(0, 0.36, 0)).normalize();
  } else if (dir.y < 0.15) { dir.y = 0.3; dir.normalize(); }
  flyTo(c, c.clone().addScaledVector(dir, Math.max(fitDistance(r) * 1.55, 340)), 950);
}
function orbitBy(angle) {
  const off = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
  flyTo(controls.target, controls.target.clone().add(off), 420);
}
function zoomBy(k) {
  const off = camera.position.clone().sub(controls.target).multiplyScalar(k);
  flyTo(controls.target, controls.target.clone().add(off), 300);
}
controls.addEventListener('start', () => { fly = null; });

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  if (ui.phone) {
    view3.snap = true;      // no easing across a resize / rotation
    syncFree();             // centre and scale the model in the area the bars and sheets leave free
  } else {
    camera.zoom = 1;
    const r = panel.getBoundingClientRect();
    const side = r.height > h * 0.7;
    camera.setViewOffset(w, h, side ? (w - r.left) / 2 : 0, side ? bottomHeight() / 2 : (h - r.top) / 2, w, h);   // centre the model in the area the panel and toolbar leave free
  }
  camera.updateProjectionMatrix();
  labelsDirty = true;
}
// phone: a sheet opening must not resize (and so clear) the canvas, it only moves the free area
new ResizeObserver(() => (ui.phone ? syncFree() : resize())).observe(document.getElementById('bottom'));
// a resize or rotation can cross the phone / desktop boundary before the media-query listeners report it
addEventListener('resize', () => (phoneMQ.matches !== ui.phone || (phoneMQ.matches && landMQ.matches) !== ui.land ? setMode() : resize()));

// ───────────────────────── labels ─────────────────────────
const labelLayer = $('#labels');
let labelsDirty = true;
const labels = [];
for (const [id, info] of Object.entries(PARTS)) {
  if (!parts[id]) continue;
  const el = document.createElement('button');
  el.className = 'lbl';
  el.style.setProperty('--c', SYSTEMS[info.sys].color);
  el.innerHTML = `<i></i><span>${info.short || info.name}${info.code ? `<em>${info.code}</em>` : ''}</span>`;
  el.title = info.name;
  el.addEventListener('click', (e) => { e.stopPropagation(); select(id); });
  labelLayer.appendChild(el);
  labels.push({ id, el, info, shown: false, occ: false, w: 0, x: 0, y: 0, depth: 0, mini: false });
}
const dimLabels = ['x', 'y', 'z'].map(() => {
  const el = document.createElement('div');
  el.className = 'lbl dim';
  el.innerHTML = '<span></span>';
  labelLayer.appendChild(el);
  return el;
});
const dimBox = new THREE.Box3Helper(new THREE.Box3(), 0xffb224);
dimBox.material.transparent = true;
dimBox.material.opacity = 0.75;
dimBox.visible = false;
scene.add(dimBox);

function labelWanted(l) {
  const g = parts[l.id];
  if (!state.labels || !g.visible) return false;
  if (state.cut && g.userData.cut && g.userData.anchorObj.getWorldPosition(_v).z > 1) return false;
  const view = activeView();
  if (view) return inView(g, view);
  if (state.selected) return l.id === state.selected || PARTS[state.selected].links.some(([t]) => t === l.id);
  if (state.system) return l.info.sys === state.system;
  if (l.info.label === 'always') return true;
  return l.info.label === 'inner' && (state.xray || state.cut || state.explode > 0.3);
}

const raycaster = new THREE.Raycaster();
const _v = new THREE.Vector3(), _d = new THREE.Vector3();
function validHit(hit, allowGhost) {
  const g = parts[hit.object.userData.partId];
  if (!g || !g.visible) return false;
  if (state.cut && g.userData.cut && hit.point.z > 0.01) return false;
  if (!allowGhost && g.userData.state === 'ghost') return false;
  return true;
}
let occCursor = 0;
function checkOcclusion(count) {
  for (let n = 0; n < count; n++) {
    const l = labels[occCursor++ % labels.length];
    if (!l.shown) { l.occ = false; continue; }
    parts[l.id].userData.anchorObj.getWorldPosition(_v);
    _d.copy(_v).sub(camera.position);
    const dist = _d.length();
    raycaster.set(camera.position, _d.normalize());
    raycaster.far = dist - 10;
    const hit = raycaster.intersectObjects(pickables, false).find((h) => h.object.userData.partId !== l.id && validHit(h, false));
    l.occ = !!hit;
  }
  raycaster.far = Infinity;
}

function updateLabels() {
  const w = innerWidth, h = innerHeight;
  for (const l of labels) {
    const want = labelWanted(l);
    let vis = false;
    if (want) {
      parts[l.id].userData.anchorObj.getWorldPosition(_v).project(camera);
      vis = _v.z < 1 && Math.abs(_v.x) < 1.05 && Math.abs(_v.y) < 1.05;
      if (vis) {
        l.x = (_v.x * 0.5 + 0.5) * w; l.y = (-_v.y * 0.5 + 0.5) * h; l.depth = _v.z;
        l.el.style.transform = `translate(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px) translateY(-50%)`;
      }
    }
    if (vis !== l.shown) { l.shown = vis; l.el.style.display = vis ? '' : 'none'; }
    if (vis && !l.w) l.w = l.el.lastChild.offsetWidth + 16;
  }
  // declutter: nearer labels keep their text, overlapping ones collapse to a dot
  const placed = [];
  const order = labels.filter((l) => l.shown).sort((a, b) => (b.id === state.selected) - (a.id === state.selected) || a.depth - b.depth);
  // phone: only the nearest few labels keep their text, and only where it fits in the free area; the rest are dots until tapped
  const few = ui.phone && ui.free, lim = few && Math.min(few.r - few.l, few.b - few.t) < 280 ? 3 : 5, hh = ui.phone ? 15 : 12;
  let texts = 0;
  for (const l of order) {
    const occ = l.occ && l.id !== state.selected;
    let r = [l.x - 8, l.y - hh, l.x + l.w, l.y + hh];
    const flip = few && r[2] > few.r - 4 && l.x - l.w > few.l;      // no room on the right: put the text left of its dot
    if (flip) r = [l.x - l.w, l.y - hh, l.x + 8, l.y + hh];
    const clash = placed.some((p) => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1]);
    let mini = !occ && clash && l.id !== state.selected;
    if (few && !occ && !mini && l.id !== state.selected) {
      mini = texts >= lim || r[2] > few.r - 4 || r[0] < few.l || r[1] < few.t + 2 || r[3] > few.b - 2;
    }
    l.mini = mini;
    l.flip = flip;
    if (ui.phone) l.el.classList.toggle('flip', flip && !mini && !occ);
    if (!occ && !mini) { placed.push(r); texts++; }
    l.el.classList.toggle('occ', occ);
    l.el.classList.toggle('mini', mini);
    l.el.classList.toggle('sel', l.id === state.selected);
  }
  // dimensions
  const showDims = state.dims;
  dimBox.visible = showDims;
  if (showDims) {
    const b = dimBox.box;
    const s = b.getSize(_d);
    const pts = [
      [(b.min.x + b.max.x) / 2, b.max.y, b.max.z, s.x],
      [b.min.x, (b.min.y + b.max.y) / 2, b.max.z, s.y],
      [b.min.x, b.max.y, (b.min.z + b.max.z) / 2, s.z],
    ];
    pts.forEach(([x, y, z, len], i) => {
      _v.set(x, y, z).project(camera);
      const el = dimLabels[i];
      el.style.display = _v.z < 1 ? '' : 'none';
      el.style.transform = `translate(${((_v.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-_v.y * 0.5 + 0.5) * h).toFixed(1)}px)`;
      el.firstChild.textContent = `${len.toFixed(0)} mm`;
    });
  } else dimLabels.forEach((el) => { el.style.display = 'none'; });
}
function updateDimBox() {
  if (state.selected) dimBox.box.setFromObject(parts[state.selected]);
  else {
    dimBox.box.makeEmpty();
    for (const g of Object.values(parts)) if (g.visible) dimBox.box.expandByObject(g);
  }
}

// ───────────────────────── picking ─────────────────────────
const ndc = new THREE.Vector2();
function pick(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  raycaster.far = Infinity;
  const hits = raycaster.intersectObjects(pickables, false);
  const solidHit = hits.find((h) => validHit(h, false));
  if (solidHit) return { id: solidHit.object.userData.partId, ghost: false };
  const ghostHit = hits.find((h) => validHit(h, true));
  return ghostHit ? { id: ghostHit.object.userData.partId, ghost: true } : null;
}
const tip = $('#tip');
let down = null, hoverQueued = null;
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, b: e.button }; });
canvas.addEventListener('pointerup', (e) => {
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  const b = down.b;
  down = null;
  if (moved > (e.pointerType === 'touch' ? 9 : 5) || b !== 0) return;
  if (ui.phone && ui.sheet) return setSheet(null);          // a tap on the model closes the open sheet
  const l = ui.phone && labelAt(e.clientX, e.clientY);      // phone: labels do not take pointer events, so resolve taps on them here
  if (l) return select(l.id);
  const p = pick(e);
  if (p) select(p.id);
  else if (state.selected) select(null);
});
canvas.addEventListener('pointercancel', () => { down = null; });
canvas.addEventListener('pointermove', (e) => { if (!down && e.pointerType !== 'touch') hoverQueued = e; });   // no hover (and no tooltip) from a finger
canvas.addEventListener('pointerleave', () => { hoverQueued = null; setHover(null); tip.hidden = true; });
/** Phone: the label under a tap. A text label counts over its whole box, a dot within a finger-sized radius. */
function labelAt(x, y) {
  let best = null, bd = 22;
  for (const l of labels) {
    if (!l.shown || (l.occ && l.id !== state.selected)) continue;
    if (!l.mini && x > l.x - (l.flip ? l.w : 12) && x < l.x + (l.flip ? 12 : l.w) && Math.abs(y - l.y) < 18) return l;
    const d = Math.hypot(x - l.x, y - l.y);
    if (d < bd) { bd = d; best = l; }
  }
  return best;
}
function setHover(id) {
  if (state.hover === id) return;
  state.hover = id;
  refresh();
}
function processHover() {
  if (!hoverQueued) return;
  const e = hoverQueued;
  hoverQueued = null;
  const p = pick(e);
  setHover(p && !p.ghost ? p.id : null);
  canvas.style.cursor = p ? 'pointer' : 'grab';
  if (p) {
    const info = PARTS[p.id];
    tip.innerHTML = `${info.name}${info.code ? `<small>${info.code}</small>` : ''}`;
    tip.hidden = false;
    tip.style.left = `${Math.min(e.clientX + 14, innerWidth - 240)}px`;
    tip.style.top = `${e.clientY + 16}px`;
  } else tip.hidden = true;
}

// ───────────────────────── selection + panel ─────────────────────────
function select(id, { focus = true } = {}) {
  if (ui.phone && id) ui.sheet = null;      // phone: a selected part opens as a small "peek" sheet so the model stays in view
  state.selected = id;
  state.hover = null;
  if (id) state.partTab = 'overview';
  refresh();
  updateDimBox();
  renderPanel();
  if (id && focus) focusPart(id);
}
function setSystem(sys) {
  state.system = state.system === sys ? null : sys;
  state.selected = null;
  if (state.system) state.tab = 'parts';
  for (const v in VIEWS) if (state[v]) { state[v] = false; $(`[data-tg="${v}"]`, toolbar).classList.remove('on'); }
  syncSlider();
  refresh();
  if (state.system) frameFocus(); else goHome(900);
  updateDimBox();
  renderSystems();
  renderPanel();
}

const sysNav = $('#systems');
function renderSystems() {
  sysNav.innerHTML = Object.entries(SYSTEMS).map(([k, s]) => {
    const n = Object.values(PARTS).filter((p) => p.sys === k).length;
    return `<button data-sys="${k}" class="${state.system === k ? 'on' : ''}" style="--c:${s.color}" title="${s.name}" aria-pressed="${state.system === k}"><i></i><span>${s.name}</span><em>${n}</em></button>`;
  }).join('');
  revealSystem();
}
/** Phone: the system chips are one scrolling strip, keep the chosen one in sight. */
function revealSystem() {
  const on = ui.phone && $('.on', sysNav);
  if (on && sysNav.clientWidth) sysNav.scrollLeft = on.offsetLeft - (sysNav.clientWidth - on.offsetWidth) / 2;
}
sysNav.addEventListener('click', (e) => {
  const b = e.target.closest('[data-sys]');
  if (b) setSystem(b.dataset.sys);
});

const mm = (n) => n.toFixed(0);
function partsListHTML() {
  const q = state.query.trim().toLowerCase();
  let html = '';
  for (const [k, s] of Object.entries(SYSTEMS)) {
    if (state.system && state.system !== k) continue;
    const items = Object.entries(PARTS).filter(([, p]) => p.sys === k && (!q || p.name.toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q)));
    if (!items.length) continue;
    html += `<h3 style="--c:${s.color}"><i></i>${s.name}</h3>`;
    html += items.map(([id, p]) => `<button data-part="${id}" style="--c:${s.color}"><i></i>${p.name}${p.code ? `<code>${p.code}</code>` : ''}</button>`).join('');
  }
  return html || '<p>No part matches.</p>';
}
const arrow = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';

// ───────────────────────── phone: navigation + sheets ─────────────────────────
const mnav = $('#mnav');
/** What the info panel is on a phone: '' hidden, 'peek' (name + one line of a selected part) or 'full' (the Parts sheet). */
const panelMode = () => (!ui.phone ? '' : ui.sheet === 'parts' ? 'full' : ui.sheet ? '' : state.selected ? 'peek' : '');
function syncNav() {
  if (!ui.phone) return;
  const dot = { parts: !!state.system, apart: !!activeView() || state.explodeTarget > 0.02, view: false, run: state.running };
  for (const b of mnav.children) {
    const on = b.dataset.nav === ui.sheet;
    b.classList.toggle('on', on);
    b.classList.toggle('dot', dot[b.dataset.nav] && !on);
    b.setAttribute('aria-expanded', on);
  }
}
/** Mirror the layout state on <html> for the stylesheet, then re-aim the camera at what is left of the canvas. */
function applyUI() {
  root.classList.toggle('phone', ui.phone);
  root.classList.toggle('land', ui.land);
  if (!ui.phone) {
    for (const k of ['sheet', 'panel', 'sel', 'ctx', 'kb']) delete root.dataset[k];
    return;
  }
  const mode = panelMode();
  root.dataset.sheet = ui.sheet || '';
  root.dataset.panel = mode;
  if (state.selected) root.dataset.sel = '1'; else delete root.dataset.sel;
  if (mode !== 'full' || state.selected || !document.activeElement?.matches?.('.search')) delete root.dataset.kb;
  const exp = $('.m-exp', panel);
  if (exp) exp.setAttribute('aria-label', mode === 'full' ? 'Collapse details' : 'Show details');
  revealSystem();
  syncNav();
  syncFree();
}
function setSheet(name) {
  ui.sheet = name && ui.sheet !== name ? name : null;
  applyUI();
}
function setMode() {
  ui.phone = phoneMQ.matches;
  ui.land = ui.phone && landMQ.matches;
  if (!ui.phone) ui.sheet = null;
  for (const l of labels) { l.w = 0; l.flip = false; l.el.classList.remove('mini', 'occ', 'flip'); }   // label text size differs, measure again
  applyUI();
  updateContext();
  renderPanel();
  resize();
}
phoneMQ.addEventListener('change', setMode);
landMQ.addEventListener('change', setMode);
mnav.addEventListener('click', (e) => {
  const b = e.target.closest('[data-nav]');
  if (b) setSheet(b.dataset.nav);
});
$('#mhome').addEventListener('click', () => goHome());
const chevron = '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>';
const cross = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';

function renderPanel() {
  const id = state.selected, ph = ui.phone;
  const grab = ph ? '<button class="m-grab" data-m="toggle" aria-label="Expand or collapse this sheet"><i></i></button>' : '';
  if (id) {
    const p = PARTS[id], s = SYSTEMS[p.sys], sz = parts[id].userData.size;
    const tabs = [['overview', 'Overview'], ['specs', 'Specifications'], ['links', `Connections · ${p.links.length}`]];
    let body = '';
    if (state.partTab === 'overview') {
      body = `<p>${p.desc}</p><div class="env">Envelope as modelled <b>${mm(sz.x)} × ${mm(sz.z)} × ${mm(sz.y)} mm</b> (L × W × H)</div>`;
    } else if (state.partTab === 'specs') {
      const rows = [...p.specs, ['Envelope (model)', `${mm(sz.x)} × ${mm(sz.z)} × ${mm(sz.y)} mm`]];
      body = `<table>${rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table>
        <div class="note">“SSP 316” marks figures taken from the Volkswagen self-study programme; “≈” marks estimates used for the model.</div>`;
    } else {
      body = `<div class="links">${p.links.map(([t, rel]) => {
        const tp = PARTS[t];
        return `<button data-part="${t}" style="--c:${SYSTEMS[tp.sys].color}"><i></i><span>${rel}</span><b>${tp.name}</b>${arrow}</button>`;
      }).join('')}</div>`;
    }
    // phone: the same sheet serves as the peek (name + one line, expand / close buttons) and, expanded, as the full details
    const peek = ph ? `<p class="m-line">${p.desc}</p>
        <div class="m-actions"><button class="m-exp" data-m="toggle" aria-label="Show details">${chevron}</button><button data-m="close" aria-label="Close and deselect">${cross}</button></div>` : '';
    panel.innerHTML = `
      <div class="head" style="--c:${s.color}">${grab}
        <button class="back" data-back>‹ All parts</button>
        <div class="kicker"><i></i>${s.name}</div>
        <h1>${p.name}</h1>
        ${p.code ? `<span class="codechip">${p.code}</span>` : ''}${peek}
      </div>
      <div class="tabs">${tabs.map(([k, t]) => `<button data-ptab="${k}" class="${state.partTab === k ? 'on' : ''}">${t}</button>`).join('')}</div>
      <div class="body">${body}</div>`;
    if (ph) applyUI();
    return;
  }
  const tabs = [['overview', 'Overview'], ['data', 'Technical data'], ['parts', `Parts · ${Object.keys(PARTS).length}`]];
  if (ph) tabs.unshift(tabs.pop());       // phone: this is the "Parts" sheet, so the list comes first
  let body = '';
  if (state.tab === 'overview') {
    body = `${ph ? '<div class="kicker"><i></i>Volkswagen self-study programme 316</div><h1 style="margin-bottom:12px">The 2.0 ltr. TDI engine</h1>' : ''}<p>${ENGINE.intro}</p>
      <div class="stats">
        <div class="stat"><b>103<small>kW</small></b><span>at 4000 rpm</span></div>
        <div class="stat"><b>320<small>Nm</small></b><span>1750 – 2500 rpm</span></div>
        <div class="stat"><b>81 × 95.5<small>mm</small></b><span>bore × stroke</span></div>
        <div class="stat"><b>18 : 1</b><span>compression ratio</span></div>
      </div>
      <div class="env">Model envelope <b>${mm(homeSize.x)} × ${mm(homeSize.z)} × ${mm(homeSize.y)} mm</b> (L × W × H)</div>
      <div class="note">${ph ? 'Tap' : 'Click'} any part or label for its function, data and connections. Use <b>X-ray</b>, <b>Cutaway</b> or <b>Explode</b> to reach the parts inside, and <b>Run</b> to watch the four-stroke cycle.</div>
      <div class="hint" style="margin-top:16px">
        <kbd>Drag</kbd><span>orbit</span><kbd>Scroll</kbd><span>zoom</span><kbd>Right-drag</kbd><span>pan</span>
        <kbd>Space</kbd><span>run / stop</span><kbd>X</kbd><span>X-ray</span><kbd>C</kbd><span>cutaway</span>
        <kbd>E</kbd><span>explode</span><kbd>V</kbd><span>covers</span><kbd>P</kbd><span>car parts</span><kbd>1</kbd><span>crankcase</span><kbd>2</kbd><span>block</span><kbd>3</kbd><span>head</span><kbd>4</kbd><span>injector</span><kbd>I</kbd><span>isolate</span><kbd>T</kbd><span>turbo</span><kbd>G</kbd><span>gearbox</span><kbd>K</kbd><span>clutch exploded</span><kbd>Esc</kbd><span>clear selection</span>
      </div>`;
  } else if (state.tab === 'data') {
    body = `<table>${ENGINE.data.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table>
      <div class="note">Technical data from Volkswagen Self-study programme 316 (technical status 08/03).</div>`;
  } else {
    body = `<input class="search" type="search" placeholder="Search parts or codes (e.g. G28)" value="${state.query.replace(/"/g, '&quot;')}" aria-label="Search parts" />
      <div class="plist" id="plist">${partsListHTML()}</div>`;
  }
  const head = ph ? `<div class="head m-home">${grab}</div>` : `<div class="head">
      <div class="kicker"><i></i>Volkswagen self-study programme 316</div>
      <h1>The 2.0 ltr. TDI engine</h1>
    </div>`;
  panel.innerHTML = `
    ${head}
    <div class="tabs">${tabs.map(([k, t]) => `<button data-tab="${k}" class="${state.tab === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="body">${body}</div>`;
  if (ph) applyUI();
}
// phone: swipe the sheet's header up to expand it, down to collapse or dismiss it
let swipe = null, swipedAt = 0, kbTimer = 0;
panel.addEventListener('pointerdown', (e) => {
  swipe = ui.phone && e.target.closest('.head') && !e.target.closest('.m-actions, .back') ? { y: e.clientY } : null;
});
panel.addEventListener('pointercancel', () => { swipe = null; });
panel.addEventListener('pointerup', (e) => {
  if (!swipe) return;
  const dy = e.clientY - swipe.y, mode = panelMode();
  swipe = null;
  if (Math.abs(dy) < 28) return;
  swipedAt = performance.now();
  if (dy < 0) { if (mode === 'peek') setSheet('parts'); }
  else if (mode === 'full') setSheet(null);
  else if (mode === 'peek') select(null);
});
// phone: while the part search has the focus the sheet takes the full height (the on-screen keyboard covers the lower half)
panel.addEventListener('focusin', (e) => {
  if (!ui.phone || ui.land || !e.target.matches('.search')) return;
  clearTimeout(kbTimer);
  root.dataset.kb = '1';
  syncFree();
});
panel.addEventListener('focusout', (e) => {
  if (!e.target.matches('.search')) return;
  clearTimeout(kbTimer);
  kbTimer = setTimeout(() => { delete root.dataset.kb; syncFree(); }, 250);   // after the tap that took the focus has landed
});
if (window.visualViewport) visualViewport.addEventListener('resize', () => {
  if (ui.phone) root.style.setProperty('--kb', `${Math.max(0, Math.round(innerHeight - visualViewport.height))}px`);
});
panel.addEventListener('click', (e) => {
  if (ui.phone) {
    if (performance.now() - swipedAt < 400) return;
    const m = e.target.closest('[data-m]');
    if (m && m.dataset.m === 'close') { ui.sheet = null; return select(null); }
    if (m || (panelMode() === 'peek' && e.target.closest('.head'))) return setSheet('parts');
  }
  const t = e.target.closest('[data-part],[data-tab],[data-ptab],[data-back]');
  if (!t) return;
  if (t.dataset.part) select(t.dataset.part);
  else if (t.dataset.tab) { state.tab = t.dataset.tab; renderPanel(); }
  else if (t.dataset.ptab) { state.partTab = t.dataset.ptab; renderPanel(); }
  else { state.tab = 'parts'; select(null); }
});
panel.addEventListener('input', (e) => {
  if (!e.target.matches('.search')) return;
  state.query = e.target.value;
  $('#plist').innerHTML = partsListHTML();
});

// ───────────────────────── toolbar ─────────────────────────
const toolbar = $('#toolbar');
const explodeInput = $('#explode'), rpmInput = $('#rpm'), rpmVal = $('#rpmVal'), hud = $('#hud');
function setToggle(name, value) {
  state[name] = value ?? !state[name];
  if (name in VIEWS && state[name]) {
    for (const v in VIEWS) if (v !== name && state[v]) { state[v] = false; $(`[data-tg="${v}"]`, toolbar).classList.remove('on'); }
    state.spread = 1; state.system = null; state.selected = null;
    renderSystems(); renderPanel();
  }
  if (name in VIEWS) syncSlider();
  $(`[data-tg="${name}"]`, toolbar).classList.toggle('on', state[name]);
  const sel = state.selected && parts[state.selected].userData;
  if (sel && ((sel.cover && !state.covers) || (sel.periph && !state.periph))) state.selected = null, renderPanel();
  refresh();
  if (name === 'periph') goHome(900);
  if (name === 'isolate' && state.system && !activeView()) frameFocus();
  if (name in VIEWS) {
    if (state[name]) viewGroup(name); else goHome(900);
  }
  updateDimBox();
}
function setRunning(v) {
  state.running = v ?? !state.running;
  $('.run', toolbar).classList.toggle('on', state.running);
  $('.run span', toolbar).textContent = state.running ? 'Stop' : 'Run';
  hud.hidden = !state.running;
  engine.update(theta, state.running);
  if (ui.phone) { syncNav(); syncFree(); }      // the HUD takes room above the navigation
}
toolbar.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b && ui.phone && e.target === toolbar && e.clientY - toolbar.getBoundingClientRect().top < 30) return setSheet(null);   // phone: the sheet's grab handle
  if (!b) return;
  if (b.dataset.tg) return setToggle(b.dataset.tg);
  const a = b.dataset.act;
  if (a === 'left') orbitBy(-Math.PI / 6);
  else if (a === 'right') orbitBy(Math.PI / 6);
  else if (a === 'in') zoomBy(0.78);
  else if (a === 'out') zoomBy(1.28);
  else if (a === 'home') goHome();
  else if (a === 'run') setRunning();
});
explodeInput.addEventListener('input', () => { if (activeView()) state.spread = explodeInput.value / 100; else state.explodeTarget = explodeInput.value / 100; syncNav(); });
$('#context').addEventListener('click', (e) => { if (e.target.closest('[data-ctx="reset"]')) showAll(); });
rpmInput.addEventListener('input', () => { state.rpm = +rpmInput.value; rpmVal.textContent = `${state.rpm} rpm`; });

addEventListener('keydown', (e) => {
  if (e.target.matches?.('input[type="search"]') || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === 'escape') { if (ui.phone && ui.sheet) setSheet(null); else if (state.selected) select(null); else if (activeView()) setToggle(activeView(), false); else if (state.system) setSystem(state.system); }
  else if (k === ' ') { e.preventDefault(); setRunning(); }
  else if (k === 'x') setToggle('xray');
  else if (k === 'c') setToggle('cut');
  else if (k === 'v') setToggle('covers');
  else if (k === 'p') setToggle('periph');
  else if (k === '1') setToggle('crank');
  else if (k === '2') setToggle('block');
  else if (k === '3') setToggle('head');
  else if (k === '4') setToggle('injector');
  else if (k === 'i') setToggle('isolate');
  else if (k === 't') setToggle('turbo');
  else if (k === 'g') setToggle('gearbox');
  else if (k === 'k') setToggle('clutch');
  else if (k === 'l') setToggle('labels');
  else if (k === 'd') setToggle('dims');
  else if (k === 'e') { state.explodeTarget = state.explodeTarget > 0.5 ? 0 : 1; }
  else if (k === 'home') goHome();
});

const hudAngle = $('#hudAngle'), hudCyls = $('#hudCyls');
hudCyls.innerHTML = [1, 2, 3, 4].map((n) => `<div class="cyl">Cyl. ${n}<b></b></div>`).join('');
function updateHud() {
  const deg = (theta / Math.PI) * 180;
  hudAngle.textContent = `${Math.round(deg % 720)}°`;
  [...hudCyls.children].forEach((el, ci) => {
    const s = STROKES[Math.floor(cycleAngle(deg, ci) / 180) % 4];
    if (el.dataset.s !== s) { el.dataset.s = s; el.className = `cyl ${s.toLowerCase()}`; el.lastChild.textContent = s; }
  });
}

// ───────────────────────── loop ─────────────────────────
let theta = 0, last = performance.now(), frameNo = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.running) {
    theta += dt * (state.rpm / 60) * TAU;
    engine.update(theta, true);
    updateHud();
  }
  let viewMoved = false;
  for (const v in VIEWS) {
    const target = state[v] ? state.spread : 0;
    if (Math.abs(state.viewT[v] - target) < 0.0005) continue;
    state.viewT[v] += (target - state.viewT[v]) * Math.min(1, dt * 5);
    if (Math.abs(state.viewT[v] - target) < 0.002) state.viewT[v] = target;
    viewMoved = true;
  }
  if (viewMoved) {
    engine.root.position.y = Object.keys(VIEWS).reduce((y, v) => y + ease(state.viewT[v]) * (VIEWS[v].lift || 0), 0);
    engine.setExplode(ease(state.explode), viewEase());
    updateDimBox();
    labelsDirty = true;
  }
  if (Math.abs(state.explode - state.explodeTarget) > 0.0005) {
    state.explode += (state.explodeTarget - state.explode) * Math.min(1, dt * 9);
    if (Math.abs(state.explode - state.explodeTarget) < 0.002) state.explode = state.explodeTarget;
    engine.setExplode(ease(state.explode), viewEase());
    if (!activeView()) explodeInput.value = Math.round(state.explodeTarget * 100);
    updateDimBox();
  }
  if (fly) {
    const k = Math.min(1, (now - fly.t0) / fly.ms), e = ease(k);
    camera.position.lerpVectors(fly.p0, fly.p1, e);
    controls.target.lerpVectors(fly.q0, fly.q1, e);
    if (k >= 1) fly = null;
  }
  if (ui.phone && (Math.abs(view3.x - view3.tx) > 0.25 || Math.abs(view3.y - view3.ty) > 0.25 || Math.abs(view3.z - view3.tz) > 0.0005)) {
    // a sheet opened or closed: glide the model to the centre of the area that is free now
    const k = Math.min(1, dt * 10);
    view3.x += (view3.tx - view3.x) * k; view3.y += (view3.ty - view3.y) * k; view3.z += (view3.tz - view3.z) * k;
    if (Math.abs(view3.x - view3.tx) < 0.5 && Math.abs(view3.y - view3.ty) < 0.5 && Math.abs(view3.z - view3.tz) < 0.002) { view3.x = view3.tx; view3.y = view3.ty; view3.z = view3.tz; }
    applyView();
  }
  controls.update();
  processHover();
  renderer.render(scene, camera);
  if (frameNo++ % 2 === 0) checkOcclusion(6);
  updateLabels();
}

renderSystems();
renderPanel();
resize();
refresh();
updateDimBox();
{
  const r = homeSize.length() * 0.5;
  controls.target.copy(homeCenter);
  camera.position.copy(homeCenter).addScaledVector(new THREE.Vector3(-0.95, 0.5, 0.25).normalize(), fitDistance(r) * 1.25);
  goHome(1700);
}
requestAnimationFrame((t) => {
  frame(t);
  const loader = $('#loader');
  loader?.classList.add('done');
  setTimeout(() => loader?.remove(), 900);
});

window.__bkd = { state, engine, parts, camera, controls, select, setToggle, setSystem, setRunning, goHome, THREE, ui, setSheet };
