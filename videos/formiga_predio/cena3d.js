// Cenas 3D (three.js) do vídeo da formiga. Roda no Chromium headless via render3d.js.
// Tudo é desenhado em função do tempo t (segundos) e da linha do tempo TL (timeline.json).
/* global THREE, TL */
const W = 1080, H = 1920;
const R = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true, preserveDrawingBuffer: true });
R.setSize(W, H); R.setPixelRatio(1);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
R.autoClear = false;

// ---------- utilidades ----------
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function noise(ctx, w, h, a, seed, n = 9000, size = 2) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const v = r() < 0.5 ? 0 : 255; ctx.fillStyle = `rgba(${v},${v},${v},${a * r()})`; ctx.fillRect(r() * w, r() * h, size * (0.5 + r()), size * (0.5 + r())); }
}
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- céu ----------
const SKY = canvasTex(16, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#5f9fe0'); gr.addColorStop(0.55, '#a9d3f5'); gr.addColorStop(1, '#e8f2f8');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});

// ---------- cidade (escala: metros) ----------
const city = new THREE.Scene();
city.background = SKY; city.fog = new THREE.Fog(0xcfe3f2, 250, 1400);
city.add(new THREE.HemisphereLight(0xdfefff, 0x6b6256, 1.3));
const sun = new THREE.DirectionalLight(0xfff1dc, 2.4); sun.position.set(-300, 500, 250); city.add(sun);

function facadeTex(tint, seed, cols = 4) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = tint; g.fillRect(0, 0, w, h); noise(g, w, h, 0.08, seed, 3000, 3);
    const r = rng(seed + 7);
    const cw = w / cols;
    for (let k = 0; k < cols; k++) {
      const x = k * cw + cw * 0.14, ww = cw * 0.72;
      const gr = g.createLinearGradient(x, 40, x + ww, 210);
      const b = 0.75 + 0.25 * r();
      gr.addColorStop(0, `rgb(${70 * b},${115 * b},${150 * b})`); gr.addColorStop(0.5, `rgb(${150 * b},${195 * b},${222 * b})`); gr.addColorStop(1, `rgb(${60 * b},${95 * b},${125 * b})`);
      g.fillStyle = gr; g.fillRect(x, 46, ww, 168);
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x - 3, 214, ww + 6, 10);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x, 46, ww, 4);
      g.strokeStyle = 'rgba(40,40,40,0.6)'; g.lineWidth = 3; g.strokeRect(x, 46, ww, 168);
    }
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, w, 8);
  });
}
function building(x, z, wx, hy, dz, tint, seed, floors) {
  const tex = facadeTex(tint, seed);
  const f = floors || Math.round(hy / 3);
  const mk = (rep) => { const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, f); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, metalness: 0.15 }); };
  const top = new THREE.MeshStandardMaterial({ color: 0x8d8a85, roughness: 0.9 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(wx, hy, dz), [mk(wx / 7), mk(wx / 7), top, top, mk(dz / 7), mk(dz / 7)]);
  m.position.set(x, hy / 2, z); city.add(m); return m;
}
// prédio principal: 50 andares x 3 m = 150 m, face da frente em x = +15
const MAIN = building(0, 0, 30, 150, 30, '#c9c3b8', 3, 50);
{ // parapeito e caixa d'água no topo
  const pm = new THREE.MeshStandardMaterial({ color: 0x9f9a92, roughness: 0.9 });
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(30.6, 1.1, 30.6), pm); p1.position.set(0, 150.55, 0); city.add(p1);
  const cx = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), pm); cx.position.set(-5, 153, -5); city.add(cx);
}
{ // vizinhança
  const r = rng(42);
  const tints = ['#b9b2a6', '#d8d2c4', '#a8a39b', '#c7b8a2', '#9fa7ad', '#d2c2b0'];
  for (let gx = -6; gx <= 6; gx++) for (let gz = -6; gz <= 6; gz++) {
    if (Math.abs(gx) <= 1 && Math.abs(gz) <= 1) continue;
    const x = gx * 70 + (r() - 0.5) * 10, z = gz * 70 + (r() - 0.5) * 10;
    const hy = 12 + r() * (Math.hypot(gx, gz) < 3 ? 70 : 45);
    building(x, z, 26 + r() * 18, hy, 26 + r() * 18, tints[Math.floor(r() * tints.length)], 100 + gx * 13 + gz, 0);
  }
  // vizinhos do lado
  building(-8, 70, 34, 60, 34, '#cbbfae', 8, 0); building(70, -10, 30, 44, 40, '#aab2b6', 9, 0);
}
{ // chão: asfalto + calçadas
  const asf = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#4b4b4e'; g.fillRect(0, 0, w, h); noise(g, w, h, 0.25, 5, 20000, 2); }, [80, 80]);
  const gm = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ map: asf, roughness: 1 }));
  gm.rotation.x = -Math.PI / 2; city.add(gm);
  const cal = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#b7b2a9'; g.fillRect(0, 0, w, h); noise(g, w, h, 0.15, 6, 6000, 2); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } }, [40, 40]);
  for (let gx = -6; gx <= 6; gx++) for (let gz = -6; gz <= 6; gz++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(56, 0.15, 56), new THREE.MeshStandardMaterial({ map: cal, roughness: 1 }));
    s.position.set(gx * 70, 0.07, gz * 70); city.add(s);
  }
  // arvorezinhas
  const r = rng(77); const tm = new THREE.MeshStandardMaterial({ color: 0x4f8a3c, roughness: 1 });
  for (let i = 0; i < 0; i++) {
    const a = new THREE.Mesh(new THREE.SphereGeometry(2.5 + r() * 1.5, 12, 8), tm);
    const gx = Math.round((r() - 0.5) * 12), gz = Math.round((r() - 0.5) * 12);
    a.position.set(gx * 70 + 31 * (r() < 0.5 ? -1 : 1), 4, gz * 70 + (r() - 0.5) * 50); city.add(a);
  }
}
const cityCam = new THREE.PerspectiveCamera(42, W / H, 0.01, 5000);

// ---------- cena macro (escala: milímetros) ----------
const macro = new THREE.Scene();
macro.add(new THREE.HemisphereLight(0xe8f2ff, 0x5a4a3a, 1.2));
const key = new THREE.DirectionalLight(0xfff0dd, 2.6); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -40; key.shadow.camera.right = 40; key.shadow.camera.top = 40; key.shadow.camera.bottom = -40;
key.shadow.camera.near = 1; key.shadow.camera.far = 300; key.shadow.bias = -0.0008; key.shadow.radius = 4;
macro.add(key); macro.add(key.target);
const rim = new THREE.DirectionalLight(0xbfd8ff, 1.2); rim.position.set(30, 20, -40); macro.add(rim);
const macCam = new THREE.PerspectiveCamera(42, W / H, 0.05, 2000);

// ---------- formiga ----------
const CHIT = new THREE.MeshPhysicalMaterial({ color: 0x62210d, roughness: 0.42, clearcoat: 0.9, clearcoatRoughness: 0.22, sheen: 0.3, sheenColor: 0xff9a60 });
const CHIT2 = new THREE.MeshPhysicalMaterial({ color: 0x3f150a, roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.3 });
const EYE = new THREE.MeshPhysicalMaterial({ color: 0x0a0605, roughness: 0.15, clearcoat: 1 });
const SPH = new THREE.SphereGeometry(1, 48, 32);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 16, 1);
const SPH_S = new THREE.SphereGeometry(1, 16, 12);

const ant = new THREE.Group(); macro.add(ant);
function ell(p, s, mat) { const m = new THREE.Mesh(SPH, mat); m.position.set(...p); m.scale.set(...s); m.castShadow = true; m.receiveShadow = true; ant.add(m); return m; }
function segLocal(a, b, r, mat) { const m = new THREE.Mesh(CYL, mat); setSeg(m, V(...a), V(...b), r); m.castShadow = true; ant.add(m); const j = new THREE.Mesh(SPH_S, mat); j.position.set(...b); j.scale.setScalar(r); ant.add(j); return m; }
function setSeg(m, a, b, r) {
  const d = b.clone().sub(a); const L = d.length();
  m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(r, L, r);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
}
// corpo (x = frente, y = cima, z = lados; origem no chão embaixo do tórax)
const GASTER = ell([-1.6, 1.45, 0], [1.08, 0.8, 0.82], CHIT);
// listrinhas do gáster
for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 8, 48), CHIT2); b.position.set(-1.25 - k * 0.38, 1.45, 0); b.rotation.y = Math.PI / 2; const s = Math.sqrt(1 - Math.pow((-1.25 - k * 0.38 + 1.6) / 1.08, 2)); b.scale.set(0.82 * s, 0.8 * s, 1); ant.add(b); }
ell([-0.55, 1.28, 0], [0.22, 0.3, 0.2], CHIT);
ell([-0.6, 1.62, 0], [0.12, 0.14, 0.12], CHIT);                      // nó do pecíolo
segLocal([-0.3, 1.2, 0], [0.62, 1.45, 0], 0.34, CHIT); ell([0.62, 1.45, 0], [0.4, 0.37, 0.32], CHIT); ell([-0.25, 1.22, 0], [0.38, 0.33, 0.3], CHIT);
const HEAD = ell([1.32, 1.68, 0], [0.56, 0.5, 0.5], CHIT);
for (const s of [-1, 1]) {
  ell([1.48, 1.82, 0.36 * s], [0.15, 0.13, 0.1], EYE);
  segLocal([1.72, 1.42, 0.14 * s], [2.02, 1.27, 0.05 * s], 0.07, CHIT2);
}
const ANT_AN = [];
for (const s of [-1, 1]) {
  const m1 = new THREE.Mesh(CYL, CHIT2), m2 = new THREE.Mesh(CYL, CHIT2), j = new THREE.Mesh(SPH_S, CHIT2), tip = new THREE.Mesh(SPH_S, CHIT2);
  [m1, m2].forEach(m => { m.castShadow = true; ant.add(m); }); ant.add(j); ant.add(tip); ANT_AN.push({ s, m1, m2, j, tip });
}
// pernas (no mundo; calculadas a cada quadro)
const LEGS = [];
const HIPS = [[0.45, 1.1], [0.0, 1.05], [-0.42, 1.08]];             // frente, meio, trás
for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
  const f = new THREE.Mesh(CYL, CHIT2), t = new THREE.Mesh(CYL, CHIT2), k = new THREE.Mesh(SPH_S, CHIT2), p = new THREE.Mesh(SPH_S, CHIT2);
  [f, t, k, p].forEach(m => { m.castShadow = true; macro.add(m); });
  LEGS.push({ i, s, f, t, k, p });
}
const FOOT0 = [[1.75, 1.45], [0.25, 1.75], [-1.7, 1.5]];             // pés em pé (x, |z|)

function antPose(o) {
  // o: {pos:Vector3, rot:Euler, feet: fn(i,s)->{p:Vector3, world:bool}, kneeUp, antW}
  ant.position.copy(o.pos); ant.rotation.copy(o.rot); ant.updateMatrixWorld(true);
  const M = ant.matrixWorld;
  const aw = o.antW || 0;
  for (const a of ANT_AN) {
    const b0 = V(1.48, 2.0, 0.13 * a.s), b1 = V(1.6, 2.72, 0.32 * a.s), b2 = V(2.3, 2.52 + aw * a.s, 0.55 * a.s);
    setSeg(a.m1, b0, b1, 0.05); setSeg(a.m2, b1, b2, 0.038); a.j.position.copy(b1); a.j.scale.setScalar(0.05); a.tip.position.copy(b2); a.tip.scale.setScalar(0.045);
  }
  for (const L of LEGS) {
    const hip = V(HIPS[L.i][0], HIPS[L.i][1], 0.22 * L.s).applyMatrix4(M);
    const fo = o.feet(L.i, L.s);
    const foot = fo.world ? fo.p : fo.p.clone().applyMatrix4(M);
    const out = V(0, 0, L.s).transformDirection(M);
    const up = fo.kneeDir ? fo.kneeDir : V(0, 1, 0);
    const knee = hip.clone().lerp(foot, 0.38).addScaledVector(up, o.kneeUp == null ? 0.75 : o.kneeUp).addScaledVector(out, 0.25);
    setSeg(L.f, hip, knee, 0.095); setSeg(L.t, knee, foot, 0.062);
    L.k.position.copy(knee); L.k.scale.setScalar(0.1); L.p.position.copy(foot); L.p.scale.setScalar(0.055);
  }
}
function walkFeet(phase, world) {      // pés no chão do mundo, girados com o corpo
  return (i, s) => {
    const g = (i + (s > 0 ? 1 : 0)) % 2; const ph = phase * 2 * Math.PI + g * Math.PI;
    const dx = 0.38 * Math.sin(ph), lift = Math.max(0, Math.cos(ph)) * 0.32;
    return { p: V(FOOT0[i][0] + dx, lift, FOOT0[i][1] * s), world: false };
  };
}
function fallFeet(tw) {
  return (i, s) => {
    const sp = [[1.7, 2.0], [0.2, 2.6], [-1.7, 2.2]][i];
    const wig = 0.15 * Math.sin(tw * 9 + i * 2 + s);
    return { p: V(sp[0] + wig, 1.75 + 0.2 * Math.sin(tw * 7 + i + s), sp[1] * s), world: false, kneeDir: V(0, 1, 0) };
  };
}

// ---------- cenários macro ----------
const sets = {};
function grupo(nome) { const g = new THREE.Group(); g.visible = false; macro.add(g); sets[nome] = g; return g; }
function show(nome) { for (const k in sets) sets[k].visible = k === nome; }
const CONC = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#a29d95'; g.fillRect(0, 0, w, h); noise(g, w, h, 0.35, 11, 40000, 2.5); noise(g, w, h, 0.2, 12, 900, 10); }, [3, 3]);
{ // A2: beirada do terraço (parapeito)
  const g = grupo('beirada');
  const tb = CONC.clone(); tb.needsUpdate = true; tb.wrapS = tb.wrapT = THREE.RepeatWrapping; tb.repeat.set(22, 16);
  const m = new THREE.Mesh(new THREE.BoxGeometry(400, 160, 300), new THREE.MeshStandardMaterial({ map: tb, roughness: 0.95 }));
  m.position.set(-200, -80, 0); m.receiveShadow = true; g.add(m);
}
{ // C: calçada
  const g = grupo('calcada');
  const t = CONC.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(900, 900);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; g.add(m);
  // juntas da calçada
  const jm = new THREE.MeshStandardMaterial({ color: 0x5c5853, roughness: 1 });
  for (const x of [-60, 40]) { const j = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 20000), jm); j.position.set(x, 0, 0); g.add(j); }
  // pedrinhas
  const r = rng(3); const pm = new THREE.MeshStandardMaterial({ color: 0x8c867d, roughness: 0.9 });
  for (let i = 0; i < 60; i++) { const p = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15 + r() * 0.35, 0), pm); p.position.set((r() - 0.5) * 50, 0.1, (r() - 0.5) * 40 - 5); p.rotation.set(r() * 3, r() * 3, r() * 3); p.castShadow = true; g.add(p); }
}
// poeira
const DUST = []; { const dm = new THREE.MeshStandardMaterial({ color: 0xb8b0a4, roughness: 1, transparent: true, opacity: 0.8 }); for (let i = 0; i < 26; i++) { const d = new THREE.Mesh(SPH_S, dm.clone()); d.visible = false; macro.add(d); DUST.push(d); } }

// D: quartinho (parede de caderno, almofada, celular)
const PHONE = new THREE.Group();
let SCREEN;
{
  const g = grupo('sala');
  const papel = canvasTex(1024, 1024, (c, w, h) => {
    c.fillStyle = '#fbf5df'; c.fillRect(0, 0, w, h);
    for (let x = 0; x <= w; x += 32) { c.strokeStyle = (x % 128) ? '#cdd6d6' : '#b6c6d2'; c.lineWidth = (x % 128) ? 1.5 : 3; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y <= h; y += 32) { c.strokeStyle = (y % 128) ? '#cdd6d6' : '#b6c6d2'; c.lineWidth = (y % 128) ? 1.5 : 3; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.fillStyle = '#ecaa96'; c.fillRect(150, 0, 5, h);
  }, [2, 1]);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(160, 80), new THREE.MeshStandardMaterial({ map: papel, roughness: 0.95 }));
  wall.position.set(34, 40, 0); wall.rotation.y = -Math.PI / 2; wall.receiveShadow = true; g.add(wall);
  const wall2 = new THREE.Mesh(new THREE.PlaneGeometry(160, 80), wall.material); wall2.position.set(0, 40, -30); wall2.receiveShadow = true; g.add(wall2);
  const madeira = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#b98a58'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) { c.fillStyle = `rgba(90,55,25,${0.15 + 0.1 * Math.sin(y)})`; c.fillRect(0, y, w, 3); }
    const r = rng(9); for (let i = 0; i < 600; i++) { c.strokeStyle = `rgba(110,70,35,${0.15 * r()})`; c.lineWidth = 1 + r() * 2; const y = r() * h; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(w / 3, y + 8 * (r() - 0.5), 2 * w / 3, y - 8 * (r() - 0.5), w, y); c.stroke(); }
  }, [3, 3]);
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ map: madeira, roughness: 0.6 }));
  piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; g.add(piso);
  const tecido = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#f2c21c'; c.fillRect(0, 0, w, h); noise(c, w, h, 0.12, 21, 8000, 2); for (let i = 0; i < w; i += 8) { c.fillStyle = 'rgba(0,0,0,0.04)'; c.fillRect(i, 0, 3, h); } }, [3, 2]);
  const alm = new THREE.Mesh(SPH, new THREE.MeshStandardMaterial({ map: tecido, roughness: 0.9 }));
  alm.scale.set(4.6, 1.15, 3.8); alm.position.set(-5.6, 1.0, 0); alm.castShadow = true; alm.receiveShadow = true; g.add(alm);
  // botão da almofada
  const bt = new THREE.Mesh(SPH_S, new THREE.MeshStandardMaterial({ color: 0xc9980e, roughness: 0.8 })); bt.scale.set(0.5, 0.25, 0.5); bt.position.set(-5.6, 2.12, 0); g.add(bt);
  // celular (tamanho formiga): 4.6 x 8.4 x 0.45
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.45, 8.4, 4.6), new THREE.MeshPhysicalMaterial({ color: 0x1b1c22, roughness: 0.3, metalness: 0.6, clearcoat: 1 }));
  corpo.castShadow = true; PHONE.add(corpo);
  SCREEN = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 7.9), new THREE.MeshBasicMaterial({ color: 0x0c0c10 }));
  SCREEN.position.set(-0.235, 0, 0); SCREEN.rotation.y = -Math.PI / 2; PHONE.add(SCREEN);
  g.add(PHONE);
}

// ---------- linha do tempo ----------
const ev = TL.ev, fase = TL.fase, Dt = TL.D;
function inF(t, k) { return t >= fase[k][0] && t < fase[k][1]; }
let EXTRA = {};

function camLook(cam, pos, target) { cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(target); cam.updateMatrixWorld(true); }
function syncCity(pos) { cityCam.position.copy(pos); cityCam.quaternion.copy(macCam.quaternion); cityCam.fov = macCam.fov; cityCam.updateProjectionMatrix(); cityCam.updateMatrixWorld(true); }
function hideDust() { DUST.forEach(d => d.visible = false); }

function cenaA(t) {
  const a0 = fase.A[0], a1 = fase.A[1], s1 = ev[1][0] - 0.15;
  if (t < s1) {                                   // A1: prédio inteiro, câmera subindo
    const u = (t - a0) / (s1 - a0);
    const ang = lerp(0.95, 0.62, u), rad = lerp(175, 105, ease(u));
    cityCam.position.set(Math.cos(ang) * rad, lerp(4, 70, ease(u)), Math.sin(ang) * rad);
    cityCam.fov = 50; cityCam.updateProjectionMatrix(); cityCam.up.set(0, 1, 0);
    cityCam.lookAt(0, lerp(95, 140, ease(u)), 0); cityCam.updateMatrixWorld(true);
    EXTRA.topo = proj(V(14, 151, 14), cityCam);
    return { cityOnly: true };
  }
  show('beirada'); hideDust();                    // A2: formiga na beirada do terraço
  const walkEnd = a1 - TL.EXTRA0;
  key.position.set(-30, 60, 40); key.target.position.set(0, 0, 0);
  let x, pose;
  if (t < walkEnd) {
    x = lerp(-16, -2.6, (t - s1) / (walkEnd - s1));
    antPose({ pos: V(x, 0, 0), rot: new THREE.Euler(0, 0, 0), feet: walkFeet((t - s1) * 2.2), antW: 0.1 * Math.sin(t * 9) });
  } else {
    const u = (t - walkEnd) / TL.EXTRA0;
    x = -2.6 + u * 3.5;
    const ang = -Math.min(1.6, u * 2.6);
    const dy = -Math.pow(Math.max(0, u - 0.35), 2) * 30;
    antPose({ pos: V(x, dy, 0), rot: new THREE.Euler(0.3 * u, 0, ang), feet: fallFeet(t), kneeUp: 0.5 });
  }
  const cp = V(lerp(-14, -6, ease((t - s1) / (a1 - s1))) + x * 0.35, 6.5, 15);
  camLook(macCam, cp, V(x + 2.5, -1.2, 0));
  macCam.fov = 42; macCam.updateProjectionMatrix();
  syncCity(V(15.2 + (x + 0) * 0.001, 151.2, 0));
  return {};
}

function caidos(t) { const b0 = fase.B[0], b1 = fase.B[1]; return 44 * (t - b0) / (b1 - b0); }

function cenaB(t) {
  show('nada'); hideDust();
  const tw = t - fase.B[0];
  const wob = 0.25 * Math.sin(t * 2.3) + 0.1 * Math.sin(t * 5.1);
  antPose({ pos: V(0, 0, 0), rot: new THREE.Euler(0.15 * Math.sin(t * 1.7), wob, 0.12 * Math.sin(t * 2.9)), feet: fallFeet(t), kneeUp: 0.55, antW: 0.25 * Math.sin(t * 11) });
  // câmera girando devagar em volta da formiga, olhando um pouco pra baixo
  const th = lerp(-0.5, 0.9, tw / (fase.B[1] - fase.B[0])) + 0.08 * Math.sin(t * 0.7);
  const dir = V(Math.sin(th), -0.5, -Math.cos(th)).normalize();
  const dist = 13 + 1.5 * Math.sin(t * 0.5);
  camLook(macCam, V(0.3, 1.5, 0).addScaledVector(dir, -dist), V(0.3, 1.2, 0));
  key.position.set(-30, 60, 40);
  const h = 150 - 3 * caidos(t);
  syncCity(V(15 + 2.2, h, 8 * Math.sin(th) * 0));
  return {};
}

function cenaC(t) {
  show('calcada');
  const c0 = fase.C[0], tImp = c0 + 0.5, s9 = ev[9][0];
  key.position.set(-30, 60, 40);
  let x = 0, camT;
  if (t < tImp) {                                  // chegando no chão
    const u = (t - c0) / 0.5;
    antPose({ pos: V(0, lerp(70, 2.4, u * u), 0), rot: new THREE.Euler(0, 0.3, 0), feet: fallFeet(t), kneeUp: 0.55 });
    hideDust();
  } else if (t < s9 + 0.9) {                       // de costas, perninhas mexendo, depois vira
    let roll = Math.PI;
    if (t >= s9 + 0.4) roll = Math.PI * (1 - ease((t - s9 - 0.4) / 0.5));
    const up = Math.abs(Math.sin(roll));
    const sq = t < tImp + 0.15 ? 1 - 0.12 * Math.sin((t - tImp) / 0.15 * Math.PI) : 1;
    antPose({ pos: V(0, 2.3 * (1 - (roll < Math.PI * 0.5 ? 1 - roll / (Math.PI / 2) : 0)) * (roll > 0.01 ? 1 : 0) + 0.6 * up, 0), rot: new THREE.Euler(roll, 0, 0),
      feet: (i, s) => roll > 1.2 ? { p: V(FOOT0[i][0] * 0.9 + 0.25 * Math.sin(t * 18 + i * 2 + s), 0.2 + 0.35 * Math.sin(t * 14 + i + s), FOOT0[i][1] * s * 0.85), world: false, kneeDir: V(0, 1, 0).applyEuler(new THREE.Euler(roll, 0, 0)) } : walkFeet(0)(i, s),
      kneeUp: 0.6 });
    ant.scale.set(1, sq, 1);
    // poeira
    const ud = (t - tImp) / 0.9;
    DUST.forEach((d, k) => {
      if (ud > 1) { d.visible = false; return; }
      const a = k / DUST.length * Math.PI * 2, r = 1.5 + 5 * Math.sqrt(ud);
      d.visible = true; d.position.set(Math.cos(a) * r, 0.4 + 2.2 * ud * (k % 3) / 2, Math.sin(a) * r * 0.8);
      d.scale.setScalar(0.12 + 0.18 * (1 - ud)); d.material.opacity = 0.9 * (1 - ud * ud);
    });
  } else {                                         // sai andando, e depois "vai direto"
    ant.scale.set(1, 1, 1); hideDust();
    const tw = t - (s9 + 0.9);
    const run = Math.max(0, t - ev[10][0]);
    x = tw * 0.9 + 12 * Math.pow(run, 1.6);
    antPose({ pos: V(x, 0, 0), rot: new THREE.Euler(0, 0, 0), feet: walkFeet(tw * (run > 0 ? 4 : 1.8)), antW: 0.15 * Math.sin(t * 8) });
  }
  if (t < s9 + 0.9) ant.scale.y = ant.scale.y || 1;
  const camX = Math.min(x, 6) * 0.6;
  camLook(macCam, V(camX - 5, 4.2, 14), V(camX + 1.2, 1.4, 0));
  syncCity(V(17 + camX * 0.001, 0.3, 30));
  return {};
}

function cenaD(t) {
  show('sala'); hideDust(); ant.scale.set(1, 1, 1);
  const u = t - fase.D[0];
  key.position.set(-25, 45, 30); key.target.position.set(0, 0, 0);
  const SIT = 48 * Math.PI / 180, YAW = -0.55;
  const cp = V(-6, 12, 31);
  const P0 = V(-4.2, 0, 0);                                    // onde ela senta
  const rotY = (x, z) => V(x * Math.cos(YAW) + z * Math.sin(YAW), 0, -x * Math.sin(YAW) + z * Math.cos(YAW));
  let pos, s = 0;
  if (u < Dt.entra) {
    const w = ease(u / (Dt.entra - 0.1));
    pos = V(lerp(-17, -4.6, w), 0, lerp(9, 4.8, w));
    antPose({ pos, rot: new THREE.Euler(0, 0.3 * (1 - w) + YAW * w, 0), feet: walkFeet(u * 3.5), antW: 0.15 * Math.sin(t * 8) });
  } else {
    const ul = u - Dt.entra;
    s = ease(ul / 0.4);
    const hop = Math.sin(Math.min(1, ul / 0.4) * Math.PI) * 1.2;
    const shake = t > Dt.tap2 + 0.6 ? 0.05 * Math.sin(t * 40) : 0;     // tremendo de rir
    pos = V(lerp(-4.6, P0.x, s), 3.4 * s + hop, lerp(4.8, 0, s));
    antPose({ pos, rot: new THREE.Euler(0, YAW, SIT * s + shake, 'YXZ'), antW: 0.2 * Math.sin(t * 6), kneeUp: 0.7,
      feet: (i, sd) => {
        if (i === 0 && s > 0.6) return { p: V(0.15, -0.9, 2.3 * sd).applyMatrix4(PHONE.matrixWorld), world: true };
        if (i === 0) return walkFeet(0)(i, sd);
        const o = i === 1 ? rotY(1.6, 2.5 * sd) : rotY(-3.2, 2.1 * sd);
        return { p: V(pos.x + o.x, i === 1 ? 0 : 2.15, o.z), world: true };
      } });
  }
  // celular na frente da cabeça, tela virada pra câmera
  ant.updateMatrixWorld(true);
  const head = V(1.32, 1.68, 0).applyMatrix4(ant.matrixWorld);
  const fwd = rotY(1, 0);
  const ph = s > 0 ? head.clone().addScaledVector(fwd, 2.6).add(V(0, -0.1, 1.0)) : V(P0.x + 2.6, 2.95, 0.6);
  PHONE.position.copy(ph); PHONE.scale.setScalar(0.6);
  const dx = cp.x - ph.x, dz = cp.z - ph.z;
  PHONE.rotation.set(0, Math.atan2(dz, -dx) * 0.8 + 0.2 * Math.atan2(-fwd.z, fwd.x), s > 0 ? -0.12 : -1.45, 'YXZ');
  PHONE.updateMatrixWorld(true);
  if (s > 0.6) antPose({ pos: ant.position.clone(), rot: ant.rotation.clone(), antW: 0.2 * Math.sin(t * 6), kneeUp: 0.7,
      feet: (i, sd) => {
        if (i === 0) return { p: V(0.15, -0.9, 2.3 * sd).applyMatrix4(PHONE.matrixWorld), world: true };
        const o = i === 1 ? rotY(1.6, 2.5 * sd) : rotY(-3.2, 2.1 * sd);
        return { p: V(pos.x + o.x, i === 1 ? 0 : 2.15, o.z), world: true };
      } });
  camLook(macCam, cp, V(-3.0, 5.2, 0));
  macCam.fov = 38; macCam.updateProjectionMatrix();
  SCREEN.updateMatrixWorld(true);
  EXTRA.tela = [[-2.1, 3.95], [2.1, 3.95], [2.1, -3.95], [-2.1, -3.95]].map(([a, b]) => proj(V(a, b, 0).applyMatrix4(SCREEN.matrixWorld), macCam));
  EXTRA.telaLigada = s > 0.6;
  EXTRA.cabeca = proj(head, macCam);
  return { macroOnly: true };
}

function proj(v, cam) { const p = v.clone().project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; }

window.render = function (t) {
  EXTRA = {};
  let o;
  if (inF(t, 'A')) o = cenaA(t); else if (inF(t, 'B')) o = cenaB(t); else if (inF(t, 'C')) o = cenaC(t); else o = cenaD(t);
  R.setRenderTarget(null); R.setClearColor(0xfbf5df, 1); R.clear();
  if (!o.macroOnly) R.render(city, cityCam);
  if (!o.cityOnly) {
    R.clearDepth();
    const bg = macro.background; R.render(macro, macCam);
  }
  return EXTRA;
};
