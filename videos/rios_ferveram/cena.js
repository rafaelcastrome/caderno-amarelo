// "O dia em que os rios ferveram" — 12 tomadas, uma por fala (tempos em window.DADOS.tl).
window.CENA = (T) => {
  T.fisheye.k.value = 0.06; T.fisheye.vin.value = 0.3; T.cam.fov = 48; T.cam.updateProjectionMatrix();
  const TL = window.DADOS.tl, FIM = TL[TL.length - 1].ini + TL[TL.length - 1].dur + 2.8;
  const hemi = T.cena.children.find((o) => o.isHemisphereLight);
  const V = THREE.Vector3, K = T.chaves, J = T.janela;
  let semente = 7; const rnd = () => { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; };
  const R = (a, b) => a + (b - a) * rnd();
  T.cena.fog = new THREE.Fog('#f2b4ac', 14, 40);

  // ---------- peças do mundo ----------
  const terreno = (g, cor = '#eea39b', tam = 60) => {
    const geo = new THREE.PlaneGeometry(tam, tam, 90, 90); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.12 * Math.sin(x * 0.9) * Math.cos(y * 0.7) + 0.08 * Math.sin(x * 2.1 + y * 1.3)); }
    geo.computeVertexNormals(); const m = T.m(geo, cor, g, { sem: true }); m.rotation.x = -Math.PI / 2; m.position.y = -0.08; return m;
  };
  const morro = (g, x, z, h, cor = '#e8928c') => { const m = T.esfera(h * 0.75, cor, g, { w: 0.006 }); m.scale.set(1.3, 0.55, 0.8); m.position.set(x, -h * 0.1, z); return m; };
  const texRio = (cor1, cor2) => {
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const c = cv.getContext('2d');
    c.fillStyle = cor1; c.fillRect(0, 0, 64, 256); c.fillStyle = cor2;
    for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse(R(8, 56), R(0, 256), R(2, 5), R(6, 16), 0, 0, 7); c.fill(); }
    const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.colorSpace = THREE.SRGBColorSpace; return tx;
  };
  // rio: faixa ao longo de uma curva; devolve {tex, curva}
  const rio = (g, pts, larg = 1.6, cor1 = '#c3202c', cor2 = '#e2454d') => {
    const curva = new THREE.CatmullRomCurve3(pts.map((p) => new V(p[0], 0.14, p[1])));
    const N = 80, pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, P = curva.getPoint(u), Tg = curva.getTangent(u); const n = new V(-Tg.z, 0, Tg.x).normalize().multiplyScalar(larg / 2);
      pos.push(P.x + n.x, 0.15, P.z + n.z, P.x - n.x, 0.15, P.z - n.z); uv.push(0, u * 12, 1, u * 12);
      if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const tex = texRio(cor1, cor2); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); g.add(m);
    // margens escuras
    [1, -1].forEach((k) => { const bp = []; for (let i = 0; i <= N; i++) { const u = i / N, P = curva.getPoint(u), Tg = curva.getTangent(u); const n = new V(-Tg.z, 0, Tg.x).normalize().multiplyScalar(k * larg / 2); bp.push(new V(P.x + n.x, 0.17, P.z + n.z)); }
      const tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bp), 80, 0.06, 6), T.mat('#a3313a')); g.add(tb); });
    return { tex, curva, m };
  };
  const CORES_CASA = ['#ffd36e', '#9fe0c9', '#b8a4f0', '#ffa98a', '#a9d6ff', '#f7b0d8'];
  const casa = (g, x, z, s = 1, cor) => {
    const h = T.grupo(g, x, 0, z); cor = cor || CORES_CASA[Math.floor(rnd() * CORES_CASA.length)];
    const d = T.m(new THREE.SphereGeometry(0.6 * s, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), cor, h); d.scale.set(1, 1.15, 1);
    const porta = T.m(new THREE.CircleGeometry(0.17 * s, 20, 0, Math.PI), T.basico('#5a2a3a'), h, { sem: true }); porta.position.set(0, 0.0, 0.6 * s + 0.005);
    [-1, 1].forEach((k) => { const j = T.m(new THREE.CircleGeometry(0.075 * s, 16), T.basico('#fff3b0'), h, { sem: true }); j.position.set(k * 0.3 * s, 0.38 * s, 0.5 * s); j.lookAt(h.position.clone().add(new V(k * 0.9, 0.9, 3))); });
    const ch = T.cilindro(0.07 * s, 0.07 * s, 0.3 * s, '#8c5a6a', h, { w: 0.004 }); ch.position.set(0.25 * s, 0.68 * s, -0.1 * s);
    h.ud = { porta }; return h;
  };
  const cidade = (g, n = 12, area = [-6, 6, -7, -1]) => { const cs = []; for (let i = 0; i < n; i++) cs.push(casa(g, R(area[0], area[1]), R(area[2], area[3]), R(0.8, 1.4))); return cs; };
  const CORES_BAC = ['#7cc96a', '#b98ae0', '#ffb04f', '#5fc7d9', '#f27fa8', '#e8d55a'];
  const bac = (g, x, z, o = {}) => { const b = POV.bacteria(g, o.cor || CORES_BAC[Math.floor(rnd() * CORES_BAC.length)], o); b.position.set(x, 0, z); return b; };
  // bolhas fervendo num rio
  const bolhas = (g, curva, n, larg, cor = '#e2454d') => {
    const bs = []; for (let i = 0; i < n; i++) { const u = rnd(); const P = curva.getPoint(u); const b = T.esfera(0.12, cor, g, { w: 0.004 }); b.position.set(P.x + R(-larg / 2.6, larg / 2.6), 0, P.z + R(-0.3, 0.3)); b.ud = { f: rnd(), v: R(0.8, 1.6) }; bs.push(b); }
    return (t, forca = 1) => bs.forEach((b) => { const f = (t * b.ud.v + b.ud.f) % 1; const e = forca * (f < 0.85 ? f / 0.85 : 0) * (0.6 + b.ud.v * 0.3); b.scale.setScalar(Math.max(0.001, e)); b.position.y = 0.14 + e * 0.08; });
  };
  const vaporMat = new THREE.MeshToonMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 });
  const vapor = (g, curva, n, larg) => {
    const vs = []; for (let i = 0; i < n; i++) { const P = curva.getPoint(rnd()); const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), vaporMat.clone()); m.ud = { x: P.x + R(-larg / 3, larg / 3), z: P.z, f: rnd(), v: R(0.25, 0.45) }; g.add(m); vs.push(m); }
    return (t, forca = 1) => vs.forEach((m) => { const f = (t * m.ud.v + m.ud.f) % 1; m.position.set(m.ud.x + Math.sin(f * 4 + m.ud.f * 9) * 0.3, f * 3.2, m.ud.z); m.scale.setScalar(0.5 + f * 1.6); m.material.opacity = forca * 0.55 * Math.sin(f * Math.PI); });
  };
  const estrelas = (g, n = 300, raio = 30, cor = '#fff6d8') => {
    const pos = []; for (let i = 0; i < n; i++) { const a = rnd() * 6.283, e = R(0.15, 1.3); pos.push(Math.cos(a) * raio * Math.cos(e), 3 + Math.sin(e) * raio, Math.sin(a) * raio * Math.cos(e) - 10); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: cor, size: 0.18, transparent: true, opacity: 0.9, fog: false })); g.add(p); return p;
  };
  // raio em zigue-zague entre dois pontos (caixinhas finas amarelas)
  const raio = (g, A, B, n = 7) => {
    const grp = T.grupo(g); const pts = [A.clone()]; const d = B.clone().sub(A);
    for (let i = 1; i < n; i++) pts.push(A.clone().add(d.clone().multiplyScalar(i / n)).add(new V(R(-0.25, 0.25), R(-0.25, 0.25), R(-0.1, 0.1))));
    pts.push(B.clone());
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], L = a.distanceTo(b); const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, L), T.basico('#fff27a')); m.position.copy(a).add(b).multiplyScalar(0.5); m.lookAt(b); grp.add(m);
      const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, L), T.basico('#ffd23a', { transparent: true, opacity: 0.45 })); m2.position.copy(m.position); m2.quaternion.copy(m.quaternion); grp.add(m2); }
    return grp;
  };
  const brilhinhos = (g, n, area, cor = '255,235,150', esc = 0.35) => { const ss = []; for (let i = 0; i < n; i++) { const s = POV.brilho(g, cor, esc); s.ud = { x: R(area[0], area[1]), z: R(area[2], area[3]), f: rnd(), v: R(0.35, 0.6) }; ss.push(s); } return ss; };

  // ---------- tomadas ----------
  const S = [];
  const tomada = (luz, f) => { const i = S.length; const g = T.grupo(null, i * 80, 0, 0); g.visible = false; S.push({ g, luz, upd: f(g, i * 80) }); };
  const cam = (ox, pos, alvo) => { T.cam.position.set(pos[0] + ox, pos[1], pos[2]); T.cam.lookAt(alvo[0] + ox, alvo[1], alvo[2]); };
  const treme = (a) => { T.cam.position.x += Math.sin(T._t * 61) * a; T.cam.position.y += Math.cos(T._t * 47) * a; };

  // 1 GANCHO: rios fervendo, bactérias correndo, vírus no céu
  tomada({ bg: '#e57a62', fog: '#e57a62', hemi: '#ffd2b0', sol: '#ffb070', hi: 1.5 }, (g, ox) => {
    terreno(g, '#e6907f'); [[-7, -12, 5], [-3, -14, 6.5], [3, -13, 5.5], [8, -11, 4.5]].forEach(([x, z, h]) => morro(g, x, z, h, '#d9796c'));
    const r = rio(g, [[-12, -2], [-4, -1.2], [2, -1.8], [12, -0.8]], 2.4, '#b4141f', '#ff5a3c');
    const ferve = bolhas(g, r.curva, 70, 2.4, '#ff6a4a'); const vap = vapor(g, r.curva, 26, 2.4);
    const casas = [casa(g, -4, -5, 1.2), casa(g, 1.5, -5.5, 1.0), casa(g, 4.5, -4.6, 1.3), casa(g, -1.5, -6.5, 0.9)];
    const corredores = []; for (let i = 0; i < 7; i++) { const b = bac(g, 0, 0, { medo: true, s: R(0.8, 1.1) }); b.ud2 = { z: R(0.8, 3.2), x0: R(-4.5, -2.2) - i * 0.5, v: R(0.7, 1.1), f: rnd() }; b.rotation.y = Math.PI / 2 - 0.45; corredores.push(b); }
    const vs = []; for (let i = 0; i < 5; i++) { const v = POV.virus(g, { s: R(0.7, 1.1) }); v.ud2 = { x: R(-2.5, 2.5), y0: R(6, 8.5), z: R(-6, -3), v: R(0.35, 0.6), f: rnd() * 2 }; const br = POV.brilho(v, '140,255,90', 2.2); vs.push(v); }
    return (u, D) => {
      r.tex.offset.y = -u * 0.8; ferve(u, 1.3); vap(u, 1);
      corredores.forEach((b) => { b.position.set(b.ud2.x0 + u * b.ud2.v, 0, b.ud2.z); b.userData.anda(u * 2.6 + b.ud2.f, 1.3); });
      vs.forEach((v) => { v.position.set(v.ud2.x, v.ud2.y0 - (u + v.ud2.f) * v.ud2.v, v.ud2.z); v.rotation.y = u * 0.8; });
      casas.forEach((c, i) => { c.rotation.z = Math.sin(u * 30 + i) * 0.01; });
      cam(ox, K([[0, [0, 2.6, 10]], [D, [0.3, 2.2, 8.2]]], u), [0, 1.6, -1]); treme(0.02);
    };
  });

  // 2 a cidade das bactérias; comida cai do céu
  tomada({ bg: '#f6c3ba', fog: '#f6c3ba', hemi: '#ffffff', sol: '#ffffff', hi: 1.55 }, (g, ox) => {
    terreno(g); [[-8, -14, 6], [-2, -16, 7], [5, -15, 6], [10, -13, 5]].forEach(([x, z, h]) => morro(g, x, z, h));
    cidade(g, 14, [-7, 7, -9, -2.5]);
    const r = rio(g, [[-12, 3.5], [-3, 3.1], [4, 3.6], [12, 3.0]], 1.2);
    const moradores = []; for (let i = 0; i < 12; i++) { const b = bac(g, R(-5, 5), R(-2, 1.8), { s: R(0.8, 1.1) }); b.ud2 = { x0: b.position.x, dir: rnd() < 0.5 ? 1 : -1, v: R(0.3, 0.6), f: rnd() }; b.rotation.y = b.ud2.dir * Math.PI / 2 * 0.8; moradores.push(b); }
    const CORES_C = ['#ffd84a', '#ff8a3d', '#7ed957', '#ff6fa1', '#8ec5ff'];
    const comida = []; for (let i = 0; i < 26; i++) { const c = rnd() < 0.5 ? T.esfera(0.12, CORES_C[i % 5], g, { w: 0.004 }) : T.caixa(0.18, 0.18, 0.18, CORES_C[i % 5], g, { w: 0.004 }); c.ud = { x: R(-5, 5), z: R(-2, 1.5), t0: R(0, 10), v: R(2, 3) }; comida.push(c); }
    const carregadores = moradores.slice(0, 5).map((b) => { const s = POV.brilho(b.ud.corpo, '255,230,120', 0.6); s.position.set(0, 0.38, 0); const o = T.esfera(0.08, '#fff2a0', b.ud.corpo, { w: 0.003 }); o.position.set(0, 0.36, 0); return [s, o]; });
    return (u, D) => {
      r.tex.offset.y = -u * 0.3;
      moradores.forEach((b, i) => { b.position.x = b.ud2.x0 + b.ud2.dir * u * b.ud2.v; b.userData.anda(u * 1.2 + b.ud2.f, 0.8); });
      carregadores.forEach(([s, o], i) => { const p = 0.5 + 0.5 * Math.sin(u * 4 + i); s.scale.setScalar(0.5 + p * 0.3); });
      comida.forEach((c) => { const k = u - c.ud.t0; const y = k < 0 ? 30 : Math.max(0.12, 9 - k * c.ud.v * k * 0.6); c.position.set(c.ud.x, y, c.ud.z); c.rotation.set(u * 2, u * 3, 0); c.visible = k > 0 && k < 6; });
      cam(ox, K([[0, [-3.5, 2.8, 7.5]], [D, [3.2, 2.4, 6.6]]], u), [K([[0, -2.5], [D, 2.5]], u), 0.6, -1.5]);
    };
  });

  // 3 o coração bate no céu
  tomada({ bg: '#f3b8b0', fog: '#f3b8b0', hemi: '#ffffff', sol: '#ffe0d0', hi: 1.5, fn: 30, ff: 90 }, (g, ox) => {
    terreno(g); cidade(g, 16, [-8, 8, -8, 2]);
    const c = POV.coracao(g, 2.4); c.position.set(0, 10.5, -16);
    const aneis = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 64), T.basico('#fff0e0', { transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.15, -6); g.add(m); return m; });
    const bs = []; for (let i = 0; i < 6; i++) { const b = bac(g, R(-2.5, 2.5), R(0.5, 3), {}); b.rotation.y = R(-0.4, 0.4); bs.push(b); }
    return (u, D) => {
      const per = 1.15; const p = c.userData.bate(u, per);
      hemi.intensity = 1.35 + p * 0.45;
      aneis.forEach((a, i) => { const f = ((u - i * per) % (per * 3)) / (per * 3); const k = u - i * per; if (k < 0) { a.material.opacity = 0; return; } a.scale.setScalar(1 + f * 14); a.material.opacity = 0.7 * (1 - f); });
      bs.forEach((b) => { b.ud.olh.userData.olhar(0, 1); b.ud.corpo.rotation.x = -0.25; b.userData.pula(p * 0.25); });
      cam(ox, K([[0, [0, 1.6, 7]], [D, [0, 1.2, 6.2]]], u), [0, K([[0, 1.2], [2.6, 7], [D, 7.6]], u), K([[0, -2], [2.6, -14], [D, -15]], u)]);
    };
  });

  // 4 glóbulos vermelhos navegando com ar
  tomada({ bg: '#f5c0b6', fog: '#f5c0b6', hemi: '#ffffff', sol: '#ffffff', hi: 1.55 }, (g, ox) => {
    terreno(g); cidade(g, 8, [-6, 10, -8, -3.5]);
    const r = rio(g, [[-14, 0], [-4, 0.2], [4, -0.2], [14, 0.1]], 3.0);
    const destino = casa(g, 4.6, -2.4, 1.3, '#9fe0c9');
    const doca = T.caixa(1.2, 0.08, 0.7, '#b9805a', g, { w: 0.004 }); doca.position.set(4.6, 0.08, -1.3);
    const hs = []; for (let i = 0; i < 6; i++) { const h = POV.hemacia(g, { s: 1.05 }); h.ud2 = { x0: -7 - i * 1.9, z: (i % 2 ? 0.55 : -0.45), f: rnd() * 6 }; hs.push(h); }
    const lider = hs[0];
    return (u, D) => {
      r.tex.offset.y = -u * 0.9;
      hs.forEach((h, i) => { let x = h.ud2.x0 + u * 1.6; if (i === 0) x = Math.min(x, 4.6); h.position.set(x, 0.3 + Math.sin(u * 2 + h.ud2.f) * 0.04, h.ud2.z); h.rotation.y = Math.sin(u * 1.3 + h.ud2.f) * 0.15; h.rotation.z = Math.sin(u * 1.7 + h.ud2.f) * 0.05; });
      // a bolha do líder voa pra janela da casa
      const k = J(u, D * 0.62, D * 0.85); const B = lider.ud.bolha;
      if (B) { B.position.set(K([[0, 0], [1, (4.6 - lider.position.x) * 0 + 0.0]], k), 0.24 * 1.05 + Math.sin(k * Math.PI) * 1.2 + k * 0.3, -0.02 - k * 2.3); B.scale.setScalar(1 - k * 0.7); B.visible = k < 0.99; }
      cam(ox, K([[0, [-6.5, 2.2, 5.2]], [D * 0.6, [1.5, 2.0, 4.6]], [D, [3.6, 2.4, 4.4]]], u), [K([[0, -5.5], [D * 0.6, 2.2], [D, 4.4]], u), 0.6, -0.6]);
    };
  });

  // 5 glóbulos brancos patrulham e pegam um estranho
  tomada({ bg: '#f2bdb4', fog: '#f2bdb4', hemi: '#ffffff', sol: '#fff4e6', hi: 1.55 }, (g, ox) => {
    terreno(g, '#e99c94'); [[-6, -10, 5], [2, -12, 6], [8, -10, 5]].forEach(([x, z, h]) => morro(g, x, z, h));
    // muralha de pedrinhas da fronteira
    for (let i = 0; i < 26; i++) { const p = T.esfera(R(0.35, 0.55), i % 2 ? '#d98a84' : '#cf7f79', g); p.position.set(-9 + i * 0.72, 0.25, -1.6 + R(-0.15, 0.15)); p.scale.y = R(0.8, 1.2); }
    const pedra = T.esfera(0.5, '#c97670', g); pedra.position.set(1.5, 0.25, -0.1); pedra.scale.set(1.2, 0.9, 1);
    const est = T.grupo(g, 1.9, 0, 0.9); const eb = T.esfera(0.28, '#8f9aa0', est); eb.position.y = 0.3; eb.scale.set(1.1, 0.9, 1);
    const eo = T.esfera(0.09, '#ffffff', eb, { w: 0.003 }); eo.position.set(0.0, 0.05, 0.25); const ep = T.esfera(0.045, '#15151c', eo, { sem: true }); ep.position.z = 0.06;
    const ls = []; for (let i = 0; i < 4; i++) { const l = POV.leucocito(g, { s: 0.95 }); l.rotation.y = Math.PI / 2 - 0.35; ls.push(l); }
    return (u, D) => {
      const pega = J(u, D * 0.6, D * 0.74);
      ls.forEach((l, i) => { const x = -2.6 - i * 1.0 + Math.min(u, D * 0.6) * 0.75; l.position.set(x, 0, 0.6 + (i % 2) * 0.15); l.userData.anda(Math.min(u, D * 0.6) * 1.6, u < D * 0.6 ? 1 : 0); });
      const L0 = ls[0]; const x0 = L0.position.x;
      // o estranho espia e o primeiro pula em cima
      est.position.y = K([[0, -0.6], [D * 0.35, -0.6], [D * 0.45, 0.2]], u); est.position.x = 2.0 + Math.sin(u * 3) * 0.05;
      if (pega > 0) { L0.position.set(T.lerp(x0, 1.95, pega), Math.sin(pega * Math.PI) * 1.0, T.lerp(0.6, 1.0, pega)); L0.rotation.y = T.lerp(Math.PI / 2 - 0.35, 0.4, pega); }
      const some = J(u, D * 0.74, D * 0.86); est.scale.setScalar(Math.max(0.001, 1 - some)); L0.ud.corpo.scale.set(1 + some * 0.25 * (1 - J(u, D * 0.9, D)), 1 - some * 0.1, 1 + some * 0.25 * (1 - J(u, D * 0.9, D)));
      cam(ox, K([[0, [-1.6, 1.9, 7.6]], [D * 0.55, [-0.4, 1.8, 7.2]], [D, [1.0, 1.6, 6.2]]], u), [K([[0, -1.8], [D * 0.55, -0.2], [D, 1.4]], u), 0.7, 0]);
    };
  });

  // 6 plaquetas constroem a casa e fecham o chão rachado
  tomada({ bg: '#f6c6bb', fog: '#f6c6bb', hemi: '#ffffff', sol: '#ffffff', hi: 1.55 }, (g, ox) => {
    terreno(g); cidade(g, 7, [-7, 7, -10, -5]);
    // parede de tijolos que vai subindo
    const tij = []; for (let lin = 0; lin < 6; lin++) for (let c = 0; c < 6; c++) { const t = T.caixa(0.38, 0.17, 0.2, lin % 2 ? '#c8553d' : '#d5654a', g, { w: 0.004 }); t.ud = { x: -1.5 + c * 0.4 + (lin % 2) * 0.2, y: 0.09 + lin * 0.18, k: lin * 6 + c }; tij.push(t); }
    // rachadura no chão
    const sh = new THREE.Shape(); const zz = [[-1.6, 0], [-1.1, 0.12], [-0.6, -0.08], [-0.1, 0.14], [0.4, -0.06], [0.9, 0.12], [1.5, 0]];
    sh.moveTo(...zz[0]); zz.forEach((p) => sh.lineTo(p[0], p[1] + 0.12)); for (let i = zz.length - 1; i >= 0; i--) sh.lineTo(zz[i][0], zz[i][1] - 0.12);
    const rach = new THREE.Mesh(new THREE.ShapeGeometry(sh), T.basico('#5c1620')); rach.rotation.x = -Math.PI / 2; rach.position.set(1.6, 0.06, 1.4); g.add(rach);
    const ps = []; for (let i = 0; i < 5; i++) { const p = POV.plaqueta(g, { s: 1.1 }); ps.push(p); }
    return (u, D) => {
      const n = Math.floor(J(u, 0, D * 0.62) * 36);
      tij.forEach((t) => { const k = t.ud.k; const a = k < n ? 1 : (k === n ? (J(u, 0, D * 0.62) * 36) % 1 : 0); t.visible = a > 0; t.position.set(t.ud.x, t.ud.y + (1 - a) * 0.8, 0); });
      // 3 plaquetas no muro, 2 na rachadura
      [[-2.1, 0.5], [1.0, 0.55], [-0.4, 0.75]].forEach(([x, z], i) => { const p = ps[i]; p.position.set(x + Math.sin(u * 2 + i) * 0.15, 0, z); p.rotation.y = Math.sin(u + i) * 0.4; p.ud.corpo.position.y = 0.26 * 1.1 + Math.abs(Math.sin(u * 5 + i)) * 0.08; p.ud.tijolo.visible = Math.sin(u * 2.5 + i * 2) > -0.2; });
      const fecha = J(u, D * 0.5, D * 0.95); rach.scale.set(1, 1 - fecha, 1);
      [[0.9, 2.2], [2.4, 2.2]].forEach(([x, z], i) => { const p = ps[3 + i]; p.position.set(x, 0, z); p.rotation.y = (i ? -0.5 : 0.5); p.ud.tijolo.visible = fecha < 0.6; p.ud.corpo.rotation.x = -0.25 + Math.sin(u * 8 + i) * 0.1 * (fecha < 1 ? 1 : 0); });
      cam(ox, K([[0, [-1.2, 2.2, 6.4]], [D * 0.55, [-0.4, 2.0, 5.6]], [D, [1.5, 2.8, 5.2]]], u), [K([[0, -0.5], [D * 0.55, 0], [D, 1.4]], u), K([[0, 0.7], [D, 0.5]], u), K([[0, 0], [D, 1.0]], u)]);
    };
  });

  // 7 neurônios no ponto mais alto, conversando por raios
  tomada({ bg: '#6c4a8e', fog: '#6c4a8e', hemi: '#e6d6ff', sol: '#ffe9ff', hi: 1.45, fn: 30, ff: 80 }, (g, ox) => {
    terreno(g, '#c9839a');
    const torre = T.cilindro(1.6, 3.6, 9, '#d8a0c8', g, { w: 0.006 }); torre.position.set(0, 4.5, -4);
    const topo = T.cilindro(2.6, 1.8, 0.6, '#c58bb6', g, { w: 0.006 }); topo.position.set(0, 9.2, -4);
    estrelas(g, 260);
    const ns = [[-1.3, 10.4, -3.6], [1.3, 10.6, -3.8], [0, 11.6, -4.6]].map((p, i) => { const n = POV.neuronio(g, { s: 0.75 }); n.position.set(...p); n.rotation.y = [0.35, -0.35, 0][i]; return n; });
    const raios = []; for (let r = 0; r < 4; r++) [[0, 1], [1, 2], [2, 0]].forEach(([a, b]) => { const rr = raio(g, new V(...ns[a].position.toArray()), new V(...ns[b].position.toArray())); rr.ud = { r, a, b }; raios.push(rr); });
    return (u, D) => {
      const fase = Math.floor(u * 5);
      raios.forEach((rr, i) => { const par = (fase + rr.ud.a) % 3 === 0; rr.visible = par && rr.ud.r === fase % 4 && u > 1.2; });
      ns.forEach((n, i) => { n.position.y += Math.sin(u * 2 + i) * 0.002; n.rotation.z = Math.sin(u * 1.5 + i) * 0.1; });
      cam(ox, K([[0, [0, 2.0, 13]], [D * 0.55, [0, 8.5, 7.5]], [D, [0.3, 10.8, 3.2]]], u), [0, K([[0, 5.5], [D * 0.55, 10], [D, 10.8]], u), -4]);
    };
  });

  // 8 chegam os vírus, invadem uma casa e enchem de cópias
  tomada({ bg: '#a8b38a', fog: '#a8b38a', hemi: '#e8ffd8', sol: '#d8ffb0', hi: 1.35 }, (g, ox) => {
    terreno(g, '#d99a8e'); cidade(g, 10, [-8, 8, -11, -5]);
    const alvo = casa(g, 0, -1.6, 1.6, '#ffd36e');
    const vizinhos = [casa(g, -3.2, -2.6, 1.1), casa(g, 3.4, -2.8, 1.2)];
    const queda = []; for (let i = 0; i < 6; i++) { const v = POV.virus(g, { s: 0.8 }); v.ud2 = { x: [0, -5, 5, -2.5, 3, -7][i], z: [-0.4, -6, -7, -9, -5, -8][i], t0: [0.4, 0.0, 0.8, 1.4, 1.9, 2.3][i] }; POV.brilho(v, '140,255,90', 1.8); queda.push(v); }
    const copias = []; for (let i = 0; i < 9; i++) { const v = POV.virus(g, { s: 0.55 }); const a = (i / 9) * Math.PI - Math.PI; v.ud2 = { dx: Math.cos(a) * R(1.4, 2.4), dz: R(0.3, 1.6), dy: R(0.3, 1.6), t0: 0 }; copias.push(v); }
    return (u, D) => {
      queda.forEach((v, i) => { const k = u - v.ud2.t0; const y = Math.max(0.4, 9 - k * 4.5); v.visible = k > 0; v.position.set(v.ud2.x + (9 - y) * 0.15, y, v.ud2.z); v.rotation.y = u * 2;
        if (i === 0) { const entra = J(u, 3.2, 4.2); v.position.z = T.lerp(-0.4, -1.0, entra) + 0.6; v.position.x = 0; v.scale.setScalar(Math.max(0.001, 0.8 * (1 - entra))); } });
      const sai = u - 5.0; alvo.scale.set(1 + Math.max(0, Math.sin(u * 14)) * 0.04 * (u > 4.2 ? 1 : 0), 1 + Math.max(0, Math.sin(u * 14 + 1)) * 0.05 * (u > 4.2 ? 1 : 0), 1);
      copias.forEach((v, i) => { const k = T.clamp((sai - i * 0.18) / 0.6); v.visible = k > 0; v.scale.setScalar(Math.max(0.001, k)); v.position.set(v.ud2.dx * k, 0.6 + v.ud2.dy * k + Math.sin(u * 3 + i) * 0.05, -1.0 + v.ud2.dz * k); v.rotation.y = Math.sin(u + i) * 0.5; });
      cam(ox, K([[0, [0, 3.6, 9.5]], [D * 0.45, [0, 2.2, 6.8]], [D, [0, 1.8, 5.6]]], u), [0, K([[0, 3.5], [D * 0.45, 1.0], [D, 1.0]], u), -1.2]);
    };
  });

  // 9 a guerra: glóbulos brancos lutam contra os vírus (socos, engolidas, vírus voando), mais vírus caindo, rio fervendo
  tomada({ bg: '#d9503e', fog: '#d9503e', hemi: '#ffc2a0', sol: '#ffe2d0', hi: 1.45 }, (g, ox) => {
    terreno(g, '#df7f6c'); [[-7, -12, 5], [0, -14, 6], [7, -12, 5]].forEach(([x, z, h]) => morro(g, x, z, h, '#cf6a5c'));
    const r = rio(g, [[-12, -3.2], [0, -2.9], [12, -3.3]], 1.8, '#a8101a', '#ff6a3c'); const ferve = bolhas(g, r.curva, 50, 1.8, '#ff7050'); const vap = vapor(g, r.curva, 22, 1.8);
    // estrela de impacto (POW)
    const cvs = document.createElement('canvas'); cvs.width = cvs.height = 256; const cs = cvs.getContext('2d');
    cs.beginPath(); for (let i = 0; i < 20; i++) { const a = i / 20 * 6.283, rr = i % 2 ? 60 : 122; cs.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } cs.closePath();
    cs.fillStyle = '#ffe14a'; cs.fill(); cs.lineWidth = 10; cs.strokeStyle = '#d6302a'; cs.stroke();
    cs.fillStyle = '#d6302a'; cs.font = 'bold 64px sans-serif'; cs.textAlign = 'center'; cs.fillText('POW', 128, 150);
    const texPow = new THREE.CanvasTexture(cvs);
    const pow = () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texPow, transparent: true, depthWrite: false, depthTest: false })); s.renderOrder = 10; g.add(s); return s; };
    // 6 duelos: leucócito x vírus. tipo 0 = soco (vírus voa girando), 1 = engole
    const P = [];
    for (let k = 0; k < 6; k++) {
      const z = [0.9, -0.4, 1.4, 0.2, -0.9, 0.5][k], xv = [-0.5, 0.9, 1.2, -1.0, 0.3, 0.6][k];
      const l = POV.leucocito(g, { s: 0.9 }); const v = POV.virus(g, { s: 0.55 });
      P.push({ l, v, z, xv, tk: 1.8 + k * 0.85, tipo: k % 3 === 1 ? 1 : 0, x0: -3.2 - (k % 3) * 0.7, pw: pow(), ang: R(-0.3, 0.3) });
    }
    // reforços de vírus caindo do céu e pairando ao fundo
    const extras = []; for (let i = 0; i < 9; i++) { const v = POV.virus(g, { s: 0.5 }); v.ud2 = { x: R(-1.5, 2.8), z: R(-1.8, -0.6), y: R(0.7, 2.4), t0: R(0.5, 7), f: rnd() * 6 }; POV.brilho(v, '140,255,90', 0.7); extras.push(v); }
    return (u, D) => {
      r.tex.offset.y = -u * 1.2; const quente = J(u, D * 0.3, D * 0.75); ferve(u, 0.5 + quente); vap(u, 0.4 + quente * 0.6);
      let choque = 0;
      P.forEach((p) => {
        const { l, v, z, xv, tk } = p, xm = xv - 0.72, d = u - tk;
        // aproximação
        const a = J(u, 0, tk - 0.25); const xl = T.lerp(p.x0, xm, a);
        l.position.set(xl, 0, z); l.rotation.y = Math.PI / 2 - 0.85; l.userData.anda(u * 2.2, a < 1 ? 1.2 : 0.2);
        const [b0, b1] = l.ud.bracos; b0.rotation.x = 0; b1.rotation.x = 0; l.ud.corpo.rotation.z = 0; l.ud.corpo.scale.set(1, 1, 1);
        // vírus parado pairando, dá um bote antes do golpe
        let vx = xv, vy = 0.55 + Math.sin(u * 3 + tk) * 0.08, vz = z - 0.05, vs = 1; v.rotation.set(0, -0.9 + Math.sin(u * 2 + tk) * 0.3, 0);
        vx -= J(u, tk - 0.45, tk - 0.15) * 0.25 * (1 - J(u, tk - 0.15, tk));
        if (p.tipo === 0) {
          // soco: braço da frente vai pra frente, corpo inclina; vírus sai voando girando
          const s = Math.max(0, Math.sin(T.clamp((d + 0.2) / 0.5) * Math.PI)); b1.rotation.x = -1.5 * s; b0.rotation.x = 0.4 * s; l.ud.corpo.rotation.z = -0.25 * s;
          if (d > 0) { const f = Math.min(d, 1.4); vx += f * 3.2; vy += Math.sin(Math.min(f / 1.4, 1) * Math.PI) * 1.4 + f * 0.3; vz -= f * 1.2; v.rotation.z = -d * 12; vs = 1 - J(u, tk + 1.0, tk + 1.4); }
        } else {
          // engole: pula em cima, vírus encolhe dentro dele
          const pj = J(u, tk - 0.2, tk + 0.15); l.position.set(T.lerp(xl, xv - 0.05, pj), Math.sin(pj * Math.PI) * 0.7, T.lerp(z, z + 0.05, pj));
          const sm = J(u, tk + 0.1, tk + 0.6); vs = 1 - sm; vx = xv; vy = 0.5;
          const sq = sm * (1 - J(u, tk + 0.8, tk + 1.3)); l.ud.corpo.scale.set(1 + sq * 0.3, 1 - sq * 0.12, 1 + sq * 0.3); b0.rotation.x = b1.rotation.x = -1.2 * Math.sin(pj * Math.PI);
        }
        v.position.set(vx, vy, vz); v.scale.setScalar(Math.max(0.001, vs)); v.visible = vs > 0.01;
        // POW no impacto
        const pw = J(u, tk - 0.03, tk + 0.08) * (1 - J(u, tk + 0.45, tk + 0.7)); p.pw.visible = pw > 0.01;
        p.pw.position.set(xv - 0.3, 0.9, z + 0.35); p.pw.scale.setScalar(1.25 * pw); p.pw.material.rotation = p.ang;
        if (d > -0.03 && d < 0.25) choque = Math.max(choque, 1 - d / 0.25);
      });
      extras.forEach((v, i) => { const k = u - v.ud2.t0; v.visible = k > 0; const y = Math.max(v.ud2.y, 8 - k * 6); v.position.set(v.ud2.x + Math.sin(u * 2 + v.ud2.f) * 0.2, y + Math.sin(u * 3 + v.ud2.f) * 0.1, v.ud2.z); v.rotation.y = -0.6 + Math.sin(u + i) * 0.4; });
      hemi.color.set(quente > 0.5 ? '#ffb090' : '#ffc2a0'); T.cena.background.lerpColors(new THREE.Color('#d9503e'), new THREE.Color('#b02a22'), quente); T.cena.fog.color.copy(T.cena.background);
      cam(ox, K([[0, [0.0, 1.4, 7.8]], [D, [0.15, 1.25, 6.9]]], u), [0.15, 0.85, 0.2]); treme(0.012 + quente * 0.025 + choque * 0.07); hemi.color.set('#ffe4d6');
    };
  });

  // 10 a chuva brilhante e os vírus somem
  tomada({ bg: '#e9a49a', fog: '#e9a49a', hemi: '#fff4e8', sol: '#fff2d0', hi: 1.5 }, (g, ox) => {
    terreno(g, '#e8988e'); cidade(g, 10, [-8, 8, -10, -4]);
    const vs = []; for (let i = 0; i < 9; i++) { const v = POV.virus(g, { s: 0.65 }); v.position.set(R(-3.2, 3.2), R(0.6, 2.6), R(-2.5, 0.8)); v.ud2 = { t: 1.4 + i * 0.42, f: rnd() * 5 }; vs.push(v); }
    const chuva = brilhinhos(g, 60, [-6, 6, -6, 3]);
    const bs = []; for (let i = 0; i < 5; i++) { const b = bac(g, -2.4 + i * 1.2, 2.2, {}); bs.push(b); }
    const fumacas = vs.map(() => { const m = T.esfera(0.4, '#ffffff', g, { sem: true }); m.material = vaporMat.clone(); m.visible = false; return m; });
    return (u, D) => {
      chuva.forEach((s) => { const f = (u * s.ud.v + s.ud.f) % 1; s.position.set(s.ud.x, 8 - f * 8.5, s.ud.z); s.material.opacity = J(u, 0, 0.8) * (0.4 + 0.6 * Math.abs(Math.sin(u * 9 + s.ud.f * 20))); });
      vs.forEach((v, i) => { const k = J(u, v.ud2.t, v.ud2.t + 0.45); v.scale.setScalar(Math.max(0.001, 0.65 * (1 - k) / 0.65)); v.rotation.y = u * 2 + k * 8; v.position.y += Math.sin(u * 3 + v.ud2.f) * 0.003;
        const f = fumacas[i]; f.visible = k > 0.3 && k < 1 || (u > v.ud2.t + 0.45 && u < v.ud2.t + 0.9); f.position.copy(v.position); const e = J(u, v.ud2.t + 0.2, v.ud2.t + 0.9); f.scale.setScalar(0.4 + e * 1.4); f.material.opacity = 0.7 * (1 - e); });
      const fim = J(u, D * 0.75, D); bs.forEach((b, i) => { b.ud.olh.userData.olhar(0, 0.8); b.userData.pula(fim * Math.abs(Math.sin(u * 7 + i))); });
      const c = new THREE.Color('#e9a49a').lerp(new THREE.Color('#f6c3ba'), J(u, 0, D)); T.cena.background.copy(c); T.cena.fog.color.copy(c);
      cam(ox, K([[0, [0, 1.6, 6.4]], [D, [0, 1.9, 7.4]]], u), [0, K([[0, 2.2], [D, 1.4]], u), -1]);
    };
  });

  // 11 os mais velhos contam a lenda, olhando pro céu à noite
  tomada({ bg: '#3b2f5c', fog: '#3b2f5c', hemi: '#c8c0ff', sol: '#e0d8ff', hi: 1.25 }, (g, ox) => {
    terreno(g, '#a86c84'); cidade(g, 10, [-9, 9, -12, -5]);
    const morrinho = T.esfera(2.2, '#b27890', g, { w: 0.006 }); morrinho.position.set(0, -1.6, 0); morrinho.scale.set(1.6, 1, 1.4);
    const est = estrelas(g, 420, 26);
    const velho = bac(g, -0.2, 0.2, { velho: true, cor: '#a58ad0', s: 1.25 }); velho.position.y = 0.55;
    const filhos = [[-1.4, 0.7, '#7cc96a'], [0.9, 0.9, '#ffb04f'], [1.6, 0.2, '#5fc7d9']].map(([x, z, c]) => { const b = bac(g, x, z, { cor: c, s: 0.7 }); b.position.y = 0.45; return b; });
    return (u, D) => {
      est.material.opacity = 0.6 + 0.4 * Math.sin(u * 3);
      [velho, ...filhos].forEach((b, i) => { b.ud.olh.userData.olhar(0, 1); b.ud.corpo.rotation.x = -0.35; b.rotation.y = Math.PI + Math.sin(u * 0.8 + i) * 0.1; });
      velho.ud.corpo.position.y = 0.22 * 1.25 + Math.sin(u * 2.4) * 0.015;
      cam(ox, K([[0, [0, 1.2, -3.2]], [D, [0, 1.0, -3.8]]], u), [0, K([[0, 1.0], [D, 3.4]], u), 3]);
    };
  });

  // 12 virada: o mundo é uma célula; as células viram galáxia; a galáxia é uma célula dentro de algo maior
  tomada({ bg: '#140f24', fog: '#140f24', hemi: '#ffffff', sol: '#ffffff', hi: 1.5, fn: 1000, ff: 3000, cf: 1500 }, (g, ox) => {
    // o mundo visto de fora: bolinha rosa com rios, dentro de uma membrana
    const cvm = document.createElement('canvas'); cvm.width = 512; cvm.height = 256; const cm = cvm.getContext('2d');
    cm.fillStyle = '#eea39b'; cm.fillRect(0, 0, 512, 256); cm.strokeStyle = '#c3202c'; cm.lineWidth = 7;
    for (let i = 0; i < 7; i++) { cm.beginPath(); let x = R(0, 512), y = R(0, 256); cm.moveTo(x, y); for (let k = 0; k < 8; k++) { x += R(-60, 60); y += R(-40, 40); cm.lineTo(x, y); } cm.stroke(); }
    for (let i = 0; i < 80; i++) { cm.fillStyle = CORES_CASA[i % 6]; cm.beginPath(); cm.arc(R(0, 512), R(0, 256), R(2, 5), 0, 7); cm.fill(); }
    const txm = new THREE.CanvasTexture(cvm); txm.colorSpace = THREE.SRGBColorSpace;
    const mundo = T.m(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshToonMaterial({ map: txm }), g, { w: 0.004 });
    const membrana = new THREE.Mesh(new THREE.SphereGeometry(1.45, 48, 32), new THREE.MeshToonMaterial({ color: '#ff9fb4', transparent: true, opacity: 0.32, depthWrite: false })); g.add(membrana); T.contorno(membrana, 0.004);
    // outras células em volta
    const celulas = []; for (let i = 0; i < 40; i++) { const c = T.grupo(g); const r = R(0.9, 1.6); const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshToonMaterial({ color: ['#ff9fb4', '#ffb89f', '#f7a6d6'][i % 3], transparent: true, opacity: 0.55, depthWrite: false })); c.add(m); T.contorno(m, 0.004);
      const n = T.esfera(r * 0.35, '#c24a7a', c, { w: 0.003 }); n.position.set(R(-0.2, 0.2) * r, R(-0.2, 0.2) * r, 0);
      const a = rnd() * 6.283, d = R(3.2, 11), e = R(-0.8, 0.8); c.position.set(Math.cos(a) * d, Math.sin(e) * d * 0.7, Math.sin(a) * d * 0.6 - 2); celulas.push(c); }
    // pontos: células distantes que viram galáxia
    const N = 2600, A = new Float32Array(N * 3), B = new Float32Array(N * 3), cor = new Float32Array(N * 3), pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      A[i * 3] = R(-60, 60); A[i * 3 + 1] = R(-90, 90); A[i * 3 + 2] = R(-40, -5);
      const braco = i % 3, rr = Math.pow(rnd(), 0.6) * 40, th = rr * 0.16 + braco * 2.094 + R(-0.35, 0.35);
      B[i * 3] = Math.cos(th) * rr; B[i * 3 + 1] = Math.sin(th) * rr * 0.85; B[i * 3 + 2] = -30 + R(-1.5, 1.5);
      const c = new THREE.Color().setHSL(rr < 8 ? 0.12 : R(0.55, 0.9), 0.8, rr < 8 ? 0.85 : 0.72); cor[i * 3] = c.r; cor[i * 3 + 1] = c.g; cor[i * 3 + 2] = c.b;
    }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(cor, 3));
    const cvp = document.createElement('canvas'); cvp.width = cvp.height = 64; const cp = cvp.getContext('2d'); const gp = cp.createRadialGradient(32, 32, 1, 32, 32, 32); gp.addColorStop(0, 'rgba(255,255,255,1)'); gp.addColorStop(0.4, 'rgba(255,255,255,0.6)'); gp.addColorStop(1, 'rgba(255,255,255,0)'); cp.fillStyle = gp; cp.fillRect(0, 0, 64, 64);
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 1.2, map: new THREE.CanvasTexture(cvp), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); g.add(pts);
    // a galáxia dentro de uma célula gigante, com vizinhas
    const gigante = T.grupo(g, 0, 0, -30);
    const memG = new THREE.Mesh(new THREE.SphereGeometry(52, 48, 32), new THREE.MeshToonMaterial({ color: '#ff9fb4', transparent: true, opacity: 0, depthWrite: false })); gigante.add(memG);
    const vizG = []; for (let i = 0; i < 10; i++) { const r = R(40, 60); const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), new THREE.MeshToonMaterial({ color: ['#ff9fb4', '#ffb89f', '#f7a6d6'][i % 3], transparent: true, opacity: 0, depthWrite: false })); const a = i / 10 * 6.283; m.position.set(Math.cos(a) * 115, Math.sin(a) * 140, R(-30, -10)); const n = T.esfera(r * 0.3, '#c24a7a', m, { sem: true }); n.material = new THREE.MeshToonMaterial({ color: '#c24a7a', transparent: true, opacity: 0 }); gigante.add(m); vizG.push(m); }
    return (u, D) => {
      const a = J(u, 0, 2.2), mor = J(u, 2.4, 5.0), sai = J(u, 5.0, D);
      mundo.rotation.y = u * 0.3; membrana.material.opacity = 0.32;
      const fadeNear = 1 - J(u, 2.6, 3.8); [mundo, membrana, ...celulas].forEach((o) => { o.visible = fadeNear > 0.02; });
      membrana.material.opacity = 0.32 * fadeNear; celulas.forEach((c) => { c.children[0].material.opacity = 0.55 * fadeNear; c.rotation.y = u * 0.2; });
      for (let i = 0; i < N * 3; i++) pos[i] = T.lerp(A[i], B[i], mor);
      pg.attributes.position.needsUpdate = true; pts.rotation.z = mor * 0.6 + u * 0.03; pts.material.opacity = J(u, 1.5, 3.0); pts.material.size = T.lerp(1.6, 0.9, mor);
      memG.material.opacity = 0.3 * sai; vizG.forEach((m) => { m.material.opacity = 0.5 * sai; m.children[0].material.opacity = 0.8 * sai; });
      const z = K([[0, 2.6], [2.2, 9], [5.0, 40], [D, 230]], u);
      T.cam.position.set(ox, 0, z); T.cam.lookAt(ox, 0, -30); pts.material.size = Math.max(T.lerp(1.6, 0.9, mor), (z + 30) * 0.012);
    };
  });

  T.cada((t) => {
    T._t = t;
    let i = TL.findIndex((c, k) => t < (k + 1 < TL.length ? TL[k + 1].ini : 1e9)); if (i < 0) i = TL.length - 1;
    S.forEach((s, k) => { s.g.visible = k === i; });
    const s = S[i], L = s.luz;
    T.cena.background = new THREE.Color(L.bg); T.cena.fog.color.set(L.fog); T.cena.fog.near = L.fn || 14; T.cena.fog.far = L.ff || 40; const cf = L.cf || 80; if (T.cam.far !== cf) { T.cam.far = cf; T.cam.updateProjectionMatrix(); } hemi.color.set(L.hemi); hemi.intensity = L.hi; T.sol.color.set(L.sol);
    const t0 = TL[i].ini, D = (i + 1 < TL.length ? TL[i + 1].ini : FIM) - t0;
    s.upd(t - t0, D);
  });
  return { dur: FIM };
};
