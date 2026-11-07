// Motor "3D animado" do Caderno Amarelo (three.js no Chromium headless). Sem papel: materiais lisos, luz suave, sombra macia.
// Cada cena define window.CENA = (P) => { ...; return { dur } }. O render3d.js chama window.render(t) quadro a quadro (30 qps contínuo).
// Unidades: gente de pé tem ~2 de altura (quadril em ~1.06). Chão em y = 0. Personagem olha pra +x.
(() => {
  const W = 720, H = 1280;
  const out = document.getElementById('c'); out.width = W; out.height = H;
  const octx = out.getContext('2d');
  const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  R.setSize(W, H); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  const fixo = (n) => { let s = n * 9301 + 49297; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const cena = new THREE.Scene(); cena.background = new THREE.Color(0x9fb8cc);
  const cam = new THREE.PerspectiveCamera(32, W / H, 0.05, 200);
  const hemi = new THREE.HemisphereLight(0xeaf2ff, 0x6a5a48, 1.1); cena.add(hemi);
  const sol = new THREE.DirectionalLight(0xfff0dc, 2.6); sol.position.set(-4, 9, 6); sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048); sol.shadow.radius = 6; sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.02;
  Object.assign(sol.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 30 }); cena.add(sol); cena.add(sol.target);
  const rebate = new THREE.DirectionalLight(0xffe6cc, 0.6); rebate.position.set(6, 3, 5); cena.add(rebate);
  const raiz = new THREE.Group(); cena.add(raiz);
  const cache = {};
  // material liso: o = {rug, metal, emis, transp, op, lados}
  const mat = (cor, o = {}) => { const k = cor + JSON.stringify(o); if (cache[k]) return cache[k];
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: o.rug ?? 0.8, metalness: o.metal ?? 0, transparent: !!o.transp, opacity: o.op ?? 1, side: o.lados ? THREE.DoubleSide : THREE.FrontSide });
    if (o.emis) { m.emissive = new THREE.Color(o.emis); m.emissiveIntensity = o.emisI ?? 1; }
    return (cache[k] = m); };
  const poe = (obj, o) => { obj.position.set(o.x || 0, o.y || 0, o.z || 0); obj.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    if (o.s !== undefined) Array.isArray(o.s) ? obj.scale.set(...o.s) : obj.scale.setScalar(o.s); (o.pai || raiz).add(obj); return obj; };
  // malha(geometria, cor|material, {x,y,z,rx,ry,rz,s,pai,sombra:false})
  const malha = (geo, cor, o = {}) => { const m = new THREE.Mesh(geo, cor && cor.isMaterial ? cor : mat(cor ?? 0xcccccc, o.m || {}));
    m.castShadow = o.sombra !== false; m.receiveShadow = true; return poe(m, o); };
  const G = {
    esfera: (r, ws = 32, hs = 24) => new THREE.SphereGeometry(r, ws, hs),
    caixa: (w, h, d) => new THREE.BoxGeometry(w, h, d),
    cil: (r0, r1, h, n = 28) => new THREE.CylinderGeometry(r0, r1, h, n),
    // torno: perfil [[raio, y], ...] girado em volta de y
    torno: (pts, n = 32) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y)), n),
    // caixa de cantos arredondados
    caixaR: (w, h, d, r = 0.03, n = 4) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.98, bevelSegments: n, curveSegments: 8 }); g.translate(0, 0, -(d - 2 * r) / 2); return g; },
    forma: (shape, d, bev = 0.01) => { const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 24 }); g.translate(0, 0, -d / 2); return g; },
  };
  let quadrosCam = [{ t: 0, pos: [0, 1.6, 6], alvo: [0, 1.2, 0] }];
  const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k), suave = (k) => k * k * (3 - 2 * k);
  function poeCamera(t) {
    let a = quadrosCam[0], b = a;
    for (const q of quadrosCam) { if (q.t <= t) a = q; if (q.t >= t) { b = q; break; } b = q; }
    const k = b.t > a.t ? suave(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)))) : 0;
    const p = lerp(a.pos, b.pos, k), l = lerp(a.alvo, b.alvo, k);
    const tr = P.tremor ?? 1, tremor = [Math.sin(t * 1.3) * 0.015 * tr, Math.sin(t * 0.9 + 1) * 0.012 * tr, 0];
    cam.position.set(p[0] + tremor[0], p[1] + tremor[1], p[2]); cam.lookAt(l[0], l[1], l[2]);
    if (P.camOff) { const o = P.camOff(t) || [0, 0, 0]; cam.position.x += o[0]; cam.position.y += o[1]; cam.position.z += o[2] || 0; }
    if (P.fov && cam.fov !== P.fov) { cam.fov = P.fov; cam.updateProjectionMatrix(); }
  }
  const graos = [0, 1, 2, 3].map((n) => { const c = document.createElement('canvas'); c.width = W / 2; c.height = H / 2; const g = c.getContext('2d'); const im = g.createImageData(c.width, c.height); const rr = fixo(50 + n);
    for (let i = 0; i < im.data.length; i += 4) { const v = rr() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 9; } g.putImageData(im, 0, 0); return c; });
  const extras = [];
  window.render = function (t) {
    for (const fn of extras) fn(t, t);
    poeCamera(t);
    R.render(cena, cam);
    octx.drawImage(R.domElement, 0, 0);
    const gr = octx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(10,5,0,${P.vinheta ?? 0.32})`); octx.fillStyle = gr; octx.fillRect(0, 0, W, H);
    octx.drawImage(graos[Math.floor(t * 24) % 4], 0, 0, W, H);
  };
  const P = window.P = {
    THREE, cena, cam, raiz, sol, hemi, rebate, R, fixo, mat, malha, G, eventos: [],
    camera(q) { quadrosCam = q; }, animar(fn) { extras.push(fn); },
    grupo(o = {}) { return poe(new THREE.Group(), o); },
    neblina(cor, perto, longe) { cena.fog = new THREE.Fog(cor, perto, longe); },
    fundo(cor) { cena.background = new THREE.Color(cor); },
  };
})();
