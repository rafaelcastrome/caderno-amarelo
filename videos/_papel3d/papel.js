// Motor "papel recortado em código" do Caderno Amarelo (three.js, roda no Chromium headless).
// Cada cena é um arquivo que define window.CENA = (P) => { ...monta as peças...; return { dur } }.
// O render.js carrega three.min.js, este arquivo e a cena, e chama window.render(t) quadro a quadro.
// Unidades: o bloco amarelo tem 7.2 x 9.8 e a folha fica em y = 0.18. O objeto principal fica perto de (0, 0, 0.6).
(() => {
  const W = 720, H = 1280;
  const out = document.getElementById('c'); out.width = W; out.height = H;
  const octx = out.getContext('2d');
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  R.setSize(W, H); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
  const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tctx = tmp.getContext('2d');

  // ---------- sorteio com semente (sempre igual entre renders) ----------
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const fixo = (n) => { let s = n * 9301 + 49297; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

  // ---------- texturas ----------
  function canvasTex(w, h, draw, cor = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); if (cor) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  const r0 = fixo(3);
  const fibra = canvasTex(512, 512, (g, w, h) => {
    const im = g.createImageData(w, h);
    for (let i = 0; i < im.data.length; i += 4) { const v = 222 + r0() * 33; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
    for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(255,255,255,${0.15 + r0() * 0.2})`; g.lineWidth = 1; g.beginPath(); const x = r0() * w, y = r0() * h, a = r0() * 6.28; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); g.stroke(); }
  }, false);
  fibra.wrapS = fibra.wrapT = THREE.RepeatWrapping; fibra.repeat.set(2.2, 2.2);

  const cache = {};
  const papel = (cor) => cache['p' + cor] || (cache['p' + cor] = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.96, metalness: 0, map: fibra, bumpMap: fibra, bumpScale: 0.9 }));
  // borda do corte: o miolo do papel é mais claro que a face
  const borda = (cor) => cache['b' + cor] || (cache['b' + cor] = new THREE.MeshStandardMaterial({ color: new THREE.Color(cor).lerp(new THREE.Color(0xfff8ec), 0.35), roughness: 1, map: fibra }));

  const lateralGrossa = (cor) => cache['g' + cor] || (cache['g' + cor] = new THREE.MeshStandardMaterial({ color: new THREE.Color(cor).multiplyScalar(0.88), roughness: 0.96, map: fibra, bumpMap: fibra, bumpScale: 0.9 }));
  // papel com costura tracejada perto da borda (tiras de couro, bolsos, bandeiras)
  function costura(cor, o = {}) {
    const k = 'c' + cor + JSON.stringify(o); if (cache[k]) return cache[k];
    const w = o.w ?? 128, h = o.h ?? 512, m = o.margem ?? 12;
    const tex = canvasTex(w, h, (g) => {
      g.fillStyle = '#' + new THREE.Color(cor).getHexString(); g.fillRect(0, 0, w, h);
      g.strokeStyle = o.linha ?? 'rgba(255,240,215,0.75)'; g.lineWidth = o.grossura ?? 4; g.setLineDash([12, 9]);
      g.strokeRect(m, m, w - 2 * m, h - 2 * m);
    });
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, bumpMap: fibra, bumpScale: 0.8 }); mat.userData.cor = cor;
    return (cache[k] = mat);
  }

  // ---------- formas (THREE.Shape) ----------
  const F = {
    ret(w, h, r = 0) {
      r = Math.min(r, w / 2, h / 2); const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
    },
    circulo(r) { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; },
    elipse(rx, ry) { const s = new THREE.Shape(); s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false); return s; },
    anel(r1, r2) { const s = F.circulo(r1); const b = new THREE.Path(); b.absarc(0, 0, r2, 0, Math.PI * 2, true); s.holes.push(b); return s; },
    arco(r1, r2, a0 = 0, a1 = Math.PI) { const s = new THREE.Shape(); s.absarc(0, 0, r1, a0, a1, false); s.absarc(0, 0, r2, a1, a0, true); s.closePath(); return s; },
    poligono(pts) { const s = new THREE.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return s; },
    estrela(r1, r2, n = 5) { const p = []; for (let i = 0; i < n * 2; i++) { const a = Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; p.push([Math.cos(a) * r, Math.sin(a) * r]); } return F.poligono(p); },
    nuvem(w, h) { const s = new THREE.Shape(); const n = 5; s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2);
      for (let i = 0; i <= n; i++) { const a = i / n; const x = w / 2 - a * w, r = h * (0.32 + 0.22 * Math.sin(a * Math.PI)); s.absarc(x, -h / 2 + r * 0.9, r, -Math.PI / 2 * (i ? 0 : 1), Math.PI, false); }
      s.closePath(); return s; },
    coracao(t) { const s = new THREE.Shape(); s.moveTo(0, -t); s.bezierCurveTo(-t * 1.4, -t * 0.2, -t * 0.9, t * 1.1, 0, t * 0.45); s.bezierCurveTo(t * 0.9, t * 1.1, t * 1.4, -t * 0.2, 0, -t); return s; },
  };

  // ---------- cena ----------
  const bg = new THREE.Scene(); bg.background = new THREE.Color(0xcfb68c);
  const fg = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);

  // fundo: mesa + pilhas de cadernos amarelos (vai desfocado)
  bg.add(new THREE.HemisphereLight(0xfff3dd, 0x8a6a40, 1.5));
  const dl = new THREE.DirectionalLight(0xfff0d8, 1.7); dl.position.set(-4, 8, 5); bg.add(dl);
  const mesa = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.85 }));
  mesa.rotation.x = -Math.PI / 2; mesa.position.y = -0.02; bg.add(mesa);
  const r1 = fixo(11);
  function caderno(x, y, z, ry) {
    const g = new THREE.Group();
    const capa = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 4.2), new THREE.MeshStandardMaterial({ color: 0xe8b62a, roughness: 0.7 }));
    const folhas = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.25, 4.1), new THREE.MeshStandardMaterial({ color: 0xf6eed6, roughness: 0.9 }));
    folhas.position.y = -0.18; g.add(capa, folhas); g.position.set(x, y, z); g.rotation.y = ry; return g;
  }
  for (const [x, z, n, ry] of [[-4.2, -7, 4, 0.2], [0.8, -9.5, 5, -0.15], [4.6, -7.5, 3, 0.35], [-6.5, -2.5, 2, -0.4], [7, -3.5, 3, 0.1]])
    for (let k = 0; k < n; k++) bg.add(caderno(x + (r1() - 0.5) * 0.4, 0.2 + k * 0.42, z + (r1() - 0.5) * 0.4, ry + (r1() - 0.5) * 0.15));

  // frente: luz quente de estúdio com sombra macia
  fg.add(new THREE.HemisphereLight(0xfff6e6, 0x9c8050, 1.0));
  const sol = new THREE.DirectionalLight(0xfff1dc, 2.9); sol.position.set(-3.5, 7.5, 4.5); sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048); sol.shadow.radius = 8; sol.shadow.bias = -0.0005; sol.shadow.normalBias = 0.01;
  Object.assign(sol.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 22 }); fg.add(sol);
  const rebate = new THREE.DirectionalLight(0xffe2c0, 0.45); rebate.position.set(5, 2, 6); fg.add(rebate);

  // bloco amarelo pautado (linhas azuis, margem vermelha) + folha de cima enrolada lá atrás
  const r2 = fixo(5);
  const folhaTex = canvasTex(1024, 1400, (g, w, h) => {
    g.fillStyle = '#f4dd88'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 12000; i++) { g.fillStyle = `rgba(120,100,40,${r2() * 0.045})`; g.fillRect(r2() * w, r2() * h, 2, 2); }
    g.strokeStyle = 'rgba(105,150,195,0.55)'; g.lineWidth = 2.2; for (let y = 150; y < h; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = 'rgba(205,85,85,0.75)'; g.lineWidth = 3; for (const x of [118, 126]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  });
  const lado = papel(0xeccf72);
  const bloco = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.18, 9.8), [lado, lado, new THREE.MeshStandardMaterial({ map: folhaTex, roughness: 0.95 }), lado, lado, lado]);
  bloco.position.set(0, 0.09, 0.6); bloco.receiveShadow = true; fg.add(bloco);
  const rolo = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 7.2, 40, 1, true, 0, Math.PI * 1.5),
    new THREE.MeshStandardMaterial({ color: 0xf6e7a6, roughness: 0.95, side: THREE.DoubleSide }));
  rolo.rotation.z = Math.PI / 2; rolo.position.set(0, 0.52, -4.1); rolo.castShadow = true; fg.add(rolo);

  // ---------- peças ----------
  const raiz = new THREE.Group(); raiz.position.set(0, 0.18, 0.6); fg.add(raiz);
  const pecas = [];   // tudo que entra animado
  const eventos = []; // instantes em que uma peça assenta (pro som de papel)

  function malha(shape, prof, cor, corBorda) {
    const g = new THREE.ExtrudeGeometry(shape, { depth: prof, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 28 });
    g.translate(0, 0, -prof / 2);
    // UV da face pela caixa da forma (pra imagens impressas)
    g.computeBoundingBox(); const bb = g.boundingBox, uv = g.attributes.uv, pos = g.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
    const face = cor.isMaterial ? cor : papel(cor);
    // papel fino: borda clarinha do corte. peça grossa (caixa de papelão): lateral quase da mesma cor
    const base = face.userData.cor ?? (face.map && face.map !== fibra ? 0xf2e4c4 : face.color.getHex());
    const lateral = corBorda !== undefined ? borda(corBorda) : prof > 0.15 ? lateralGrossa(base) : borda(base);
    const m = new THREE.Mesh(g, [face, lateral]);
    m.castShadow = m.receiveShadow = true; return m;
  }

  // registra um objeto pra entrar animado. o = {t, entra, dur, x,y,z, rx,ry,rz, pai, esboco}
  function registra(obj, o) {
    obj.position.set(o.x || 0, o.y || 0, o.z || 0); obj.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    obj.userData = { alvoP: obj.position.clone(), alvoR: obj.rotation.clone(), t: o.t ?? 0, entra: o.entra || 'cai', dur: o.dur || 0.45, esboco: o.esboco !== false, lado: Math.sign((o.x || 0) + 0.001) };
    (o.pai || raiz).add(obj); pecas.push(obj); eventos.push(+(obj.userData.t + obj.userData.dur).toFixed(3));
    return obj;
  }

  // peça em pé (de frente pra câmera): forma extrudada com espessura de papelão
  function peca(shape, o = {}) { const m = malha(shape, o.prof ?? 0.06, o.cor ?? 0xc4372c, o.corBorda); m.userData.shape = shape; const g = new THREE.Group(); g.add(m); return registra(g, o); }
  // recorte deitado na folha (tapete, rua, sombra de papel)
  function deitado(shape, o = {}) { const m = malha(shape, o.prof ?? 0.03, o.cor ?? 0x6aa0d8, o.corBorda); m.rotation.x = -Math.PI / 2; m.position.y = (o.prof ?? 0.03) / 2; const g = new THREE.Group(); g.add(m); return registra(g, Object.assign({ entra: 'desliza' }, o)); }
  // papel impresso: desenho em canvas 2D colado numa forma (etiqueta, foto, bandeira)
  function impresso(w, h, desenha, o = {}) {
    const tex = canvasTex(Math.round(256 * w / Math.max(w, h)) * 2, Math.round(256 * h / Math.max(w, h)) * 2, desenha);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, bumpMap: fibra, bumpScale: 0.5 });
    return peca(o.forma || F.ret(w, h, o.raio ?? 0.05), Object.assign({ prof: 0.02, cor: mat, corBorda: 0xf6efe0 }, o));
  }
  // caixa de papel dobrado (corpo de mala, prédio, presente): 6 faces, cantos retos
  function caixa(w, h, d, o = {}) {
    const face = o.mat || papel(o.cor ?? 0xc4372c);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), face); m.castShadow = m.receiveShadow = true;
    const g = new THREE.Group(); g.add(m); g.userData.caixa = [w, h, d]; return registra(g, o);
  }
  function rebite(o = {}) { return peca(F.circulo(o.r ?? 0.05), Object.assign({ prof: 0.03, cor: 0xd8b56a, dur: 0.3 }, o)); }

  // contornos -> formas com furos. Fontes manuscritas têm contornos sobrepostos, então o furo é decidido pelo sentido do contorno
  function formasDoGlifo(sp) {
    const cs = sp.subPaths.map((p) => { const pts = p.getPoints(); return { p, pts, a: THREE.ShapeUtils.area(pts) }; }).filter((c) => Math.abs(c.a) > 1e-6);
    if (!cs.length) return [];
    const sinal = Math.sign(cs.reduce((m, c) => (Math.abs(c.a) > Math.abs(m.a) ? c : m)).a);
    const dentro = (pt, pts) => { let d = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) d = !d; } return d; };
    const fora = cs.filter((c) => Math.sign(c.a) === sinal).map((c) => ({ c, s: new THREE.Shape(c.pts) }));
    for (const h of cs.filter((c) => Math.sign(c.a) !== sinal)) { const dono = fora.find((f) => dentro(h.pts[0], f.c.pts)); if (dono) dono.s.holes.push(new THREE.Path(h.pts)); }
    return fora.map((f) => f.s);
  }

  // letras e números de papel (fonte Caveat Bold, contornos vindos do render.js)
  function texto(str, o = {}) {
    const tam = o.tam ?? 1, gl = window.GLIFOS || {}; const grupo = new THREE.Group();
    let x = 0; const letras = [];
    for (const ch of str) {
      const gd = gl[ch]; if (!gd) { x += 0.3 * tam; continue; }
      const sp = new THREE.ShapePath();
      for (const c of gd.cmds) {
        const p = (a, b) => [a * tam, b * tam];
        if (c.type === 'M') sp.moveTo(...p(c.x, c.y)); else if (c.type === 'L') sp.lineTo(...p(c.x, c.y));
        else if (c.type === 'Q') sp.quadraticCurveTo(...p(c.x1, c.y1), ...p(c.x, c.y));
        else if (c.type === 'C') sp.bezierCurveTo(...p(c.x1, c.y1), ...p(c.x2, c.y2), ...p(c.x, c.y));
      }
      const shapes = formasDoGlifo(sp);
      if (shapes.length) letras.push({ shapes, x, w: gd.adv * tam });
      x += gd.adv * tam;
    }
    let minX = Infinity, maxX = -Infinity;
    for (const l of letras) for (const sh of l.shapes) for (const pt of sh.getPoints()) { minX = Math.min(minX, pt.x + l.x); maxX = Math.max(maxX, pt.x + l.x); }
    const total = maxX + minX; const passo = o.passo ?? 0.12;
    letras.forEach((l, i) => {
      const g = new THREE.Group();
      l.shapes.forEach((s, n) => { const m = malha(s, o.prof ?? 0.12, o.cor ?? 0xe8452f, o.corBorda); m.position.z = n * 0.002; m.userData.shape = s; g.add(m); });
      registra(g, Object.assign({}, o, { x: (o.x || 0) - total / 2 + l.x, y: o.y || 0, t: (o.t ?? 0) + i * passo, pai: o.pai }));
    });
    return grupo;
  }

  // ---------- câmera ----------
  let quadrosCam = [{ t: 0, pos: [0.3, 9.4, 12.0], alvo: [0, 0.8, 0.6] }];
  const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  const suave = (k) => k * k * (3 - 2 * k);
  function poeCamera(t) {
    let a = quadrosCam[0], b = a;
    for (const q of quadrosCam) { if (q.t <= t) a = q; if (q.t >= t) { b = q; break; } b = q; }
    const k = b.t > a.t ? suave(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)))) : 0;
    const p = lerp(a.pos, b.pos, k), l = lerp(a.alvo, b.alvo, k);
    const tremor = [Math.sin(t * 1.3) * 0.03, Math.sin(t * 0.9 + 1) * 0.025, 0]; // câmera na mão, bem leve
    cam.position.set(p[0] + tremor[0], p[1] + tremor[1], p[2]); cam.lookAt(l[0], l[1], l[2]);
    const P_ = window.P; if (P_ && P_.camOff) { const o = P_.camOff(t) || [0, 0, 0]; cam.position.x += o[0]; cam.position.y += o[1]; cam.position.z += o[2] || 0; }
    if (P_ && P_.fov && cam.fov !== P_.fov) { cam.fov = P_.fov; cam.updateProjectionMatrix(); }
  }

  // ---------- esboço a lápis (o contorno aparece antes do papel chegar) ----------
  function contornos(obj) {
    const lista = [];
    obj.traverse((m) => {
      if (m.isMesh && m.userData.shape) {
        const pts = m.userData.shape.getPoints(10); const prof = m.geometry.parameters.options.depth;
        lista.push({ m, pts: pts.map((p) => new THREE.Vector3(p.x, p.y, prof / 2 + 0.01)) });
      } else if (m.isMesh && m.parent && m.parent.userData.caixa) {
        const [w, h, d] = m.parent.userData.caixa;
        lista.push({ m, pts: [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2]].map(([x, y]) => new THREE.Vector3(x, y, d / 2)) });
        lista.push({ m, pts: [[-w / 2, h / 2, d / 2], [-w / 2, h / 2, -d / 2], [w / 2, h / 2, -d / 2], [w / 2, h / 2, d / 2]].map(([x, y, z]) => new THREE.Vector3(x, y, z)) });
      }
    });
    return lista;
  }
  function desenhaEsboco(ctx, obj, opac, n) {
    if (opac <= 0.01) return;
    const rr = fixo(n + 1);
    ctx.save(); ctx.strokeStyle = `rgba(60,58,55,${0.8 * opac})`; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const { m, pts } of contornos(obj)) {
      m.updateWorldMatrix(true, false);
      const sc = pts.map((p) => { const v = p.clone().applyMatrix4(m.matrixWorld).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; });
      for (let k = 0; k < 2; k++) {
        ctx.lineWidth = 1.6 + rr() * 1.2; ctx.beginPath();
        sc.forEach(([x, y], i) => { const jx = x + (rr() - 0.5) * 3.5, jy = y + (rr() - 0.5) * 3.5; i ? ctx.lineTo(jx, jy) : ctx.moveTo(jx, jy); });
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---------- grão de filme ----------
  const graos = [0, 1, 2, 3].map((n) => { const c = document.createElement('canvas'); c.width = W / 2; c.height = H / 2; const g = c.getContext('2d'); const im = g.createImageData(c.width, c.height); const rr = fixo(50 + n);
    for (let i = 0; i < im.data.length; i += 4) { const v = rr() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 14; } g.putImageData(im, 0, 0); return c; });

  // ---------- animação ----------
  const volta = (x) => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const QPS = 12; // stop-motion: as peças andam em 12 quadros por segundo, a câmera é contínua
  const extras = []; // funções (t) => {} que a cena registra pra mexer em coisas (girar, balançar)

  window.render = function (t) {
    const ts = Math.floor(t * QPS) / QPS; seed = 1000 + Math.floor(t * QPS);
    const esbocos = [];
    for (const o of pecas) {
      const u = o.userData, k = (ts - u.t) / u.dur, a = u.alvoP, r = u.alvoR;
      if (u.esboco && k > -0.9 && k < 0.6) esbocos.push([o, k < 0 ? Math.min(1, (k + 0.9) / 0.3) : 1 - k / 0.6]);
      o.visible = k > 0; if (!o.visible) continue;
      const e = k >= 1 ? 1 : volta(Math.max(0, k)), f = 1 - e;
      if (u.entra === 'cai') { o.position.set(a.x, a.y + f * 1.6, a.z + f * 0.8); o.rotation.set(r.x + f * 0.6, r.y, r.z + f * 0.35 * u.lado); o.scale.setScalar(1); }
      else if (u.entra === 'pop') { const s = Math.max(0.001, e); o.position.copy(a); o.rotation.set(r.x, r.y + f * 0.8, r.z); o.scale.setScalar(s); }
      else if (u.entra === 'levanta') { o.position.copy(a); o.rotation.set(r.x - f * Math.PI / 2, r.y, r.z); o.scale.setScalar(1); } // dobra de deitado pra em pé
      else if (u.entra === 'desliza') { o.position.set(a.x - f * 2.5 * u.lado, a.y, a.z + f * 0.5); o.rotation.set(r.x, r.y + f * 0.4, r.z); o.scale.setScalar(1); }
      else { o.position.copy(a); o.rotation.copy(r); o.scale.setScalar(1); }
      if (k >= 1) { o.position.x += (rnd() - 0.5) * 0.005; o.position.y += (rnd() - 0.5) * 0.005; } // tremidinha de stop-motion
    }
    for (const fn of extras) fn(ts, t);
    poeCamera(t);
    // 1) fundo desfocado
    R.setClearColor(0x000000, 1); R.render(bg, cam);
    octx.filter = 'blur(8px)'; octx.drawImage(R.domElement, -12, -12, W + 24, H + 24); octx.filter = 'none';
    // 2) frente: versão desfocada em cima (longe) e nítida embaixo (perto) = profundidade de campo
    R.setClearColor(0x000000, 0); R.render(fg, cam);
    octx.filter = 'blur(3.5px)'; octx.drawImage(R.domElement, 0, 0); octx.filter = 'none';
    tctx.clearRect(0, 0, W, H); tctx.globalCompositeOperation = 'source-over'; tctx.drawImage(R.domElement, 0, 0);
    tctx.globalCompositeOperation = 'destination-in';
    const gm = tctx.createLinearGradient(0, H * (P.foco[0]), 0, H * (P.foco[1])); gm.addColorStop(0, 'rgba(0,0,0,0)'); gm.addColorStop(1, 'rgba(0,0,0,1)');
    tctx.fillStyle = gm; tctx.fillRect(0, 0, W, H); tctx.globalCompositeOperation = 'source-over';
    octx.drawImage(tmp, 0, 0);
    // 3) lápis
    esbocos.forEach(([o, op], i) => desenhaEsboco(octx, o, op, i + pecas.indexOf(o)));
    // 4) cor quente, vinheta e grão
    octx.fillStyle = 'rgba(255,190,110,0.05)'; octx.fillRect(0, 0, W, H);
    const gr = octx.createRadialGradient(W / 2, H * 0.55, H * 0.25, W / 2, H * 0.55, H * 0.78);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(40,20,0,0.38)'); octx.fillStyle = gr; octx.fillRect(0, 0, W, H);
    octx.drawImage(graos[Math.floor(t * QPS) % 4], 0, 0, W, H);
  };

  // ---------- API pra cena ----------
  const P = window.P = {
    THREE, F, raiz, fg, cam, rnd, fixo, papel, costura, peca, deitado, impresso, caixa, rebite, texto, canvasTex,
    foco: [0.18, 0.36], // faixa da tela (0 = topo) onde o desfoque da frente vira nítido
    camera(q) { quadrosCam = q; },
    animar(fn) { extras.push(fn); },
    grupo(o = {}) { const g = new THREE.Group(); g.position.set(o.x || 0, o.y || 0, o.z || 0); g.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0); (o.pai || raiz).add(g); return g; },
    eventos,
    CORES: { VERMELHO: 0xc93a2e, VERMELHO2: 0x9f2b22, MARROM: 0x7b4a2b, CREME: 0xf2e4c4, AMARELO: 0xf2c230, AZUL: 0x3f7fc4, AZUL_CLARO: 0x8cc3e8, VERDE: 0x4c9a5a, VERDE_CLARO: 0x9ccf6e, LARANJA: 0xe8813a, ROSA: 0xf09aae, BRANCO: 0xf8f3e8, PRETO: 0x2b2622, CINZA: 0x9a948a, DOURADO: 0xd8b56a, ROXO: 0x7d5bb0 },
  };
})();
