window.BOCA = window.BOCA || {};
// Peças reutilizáveis da série "O homem das duas bombas" (papel recortado em código).
// Carregado antes de epN.js. Cada função monta um objeto de papel e devolve o grupo.
window.LIB = (P) => {
  const { F, CORES: C, THREE } = P;
  const PELE = 0xe9b98e, CALCA = 0x3a3a44, CABELO = 0x2a2420, BRANCO = 0xf6f1e4;
  const L = {};
  const RAP = 0.5; // monta o cenário 2x mais rápido
  const acelera = (fn, iO) => (...a) => { const o = Object.assign({}, a[iO] || {}); if (o.t !== undefined) o.t *= RAP; o.dur = o.dur ?? 0.28; a[iO] = o; return fn(...a); };
  P.peca = acelera(P.peca, 1); P.deitado = acelera(P.deitado, 1); P.caixa = acelera(P.caixa, 3);
  const imp0 = P.impresso; P.impresso = acelera(imp0, 3);
  const txt0 = P.texto; P.texto = (str, o = {}) => txt0(str, Object.assign({}, o, { t: (o.t ?? 0) * RAP, passo: (o.passo ?? 0.12) * 0.6, dur: o.dur ?? 0.3 }));
  const ani0 = P.animar; L.vivo = [];

  // câmera padrão: de cima (~35°) com empurrãozinho lento
  L.cam = (D, o = {}) => {
    const ax = o.x ?? 0, ay = o.y ?? 1.1, az = o.z ?? 0.5, d = o.dist ?? 1.12;
    P.camera([{ t: 0, pos: [ax + 0.4, ay + 8.6 * d, az + 11.6 * d], alvo: [ax, ay, az] },
      { t: D, pos: [ax + 0.1, ay + 7.8 * d, az + 10.4 * d], alvo: [ax, ay + 0.05, az] }]);
  };

  // homem de papel. o: x,y,z,pai,t, band (enfaixado), velho, terno, cabeca (cor), s (escala), bracos ('cima'|'abertos')
  L.homem = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai, ry: o.ry || 0 });
    g.scale.setScalar(o.s ?? 1);
    const t = o.t ?? 0.2, roupa = o.terno ? 0x5b5f6a : BRANCO;
    const pernas = [-0.15, 0.15].map((x, i) => {
      const p = P.grupo({ pai: g, x, y: 0.98 });
      P.peca(F.ret(0.24, 0.95, 0.05), { pai: p, prof: 0.07, cor: CALCA, y: -0.48, t: t + i * 0.06 });
      P.peca(F.ret(0.32, 0.12, 0.05), { pai: p, prof: 0.08, cor: 0x221c18, x: 0.04 * (i ? 1 : -1), y: -0.92, z: 0.03, t: t + 0.12 + i * 0.05 });
      return p;
    });
    const corpo = P.grupo({ pai: g }); g.userData.corpo = corpo;
    P.peca(F.ret(0.78, 1.0, 0.14), { pai: corpo, prof: 0.08, cor: roupa, y: 1.42, t: t + 0.25 });
    if (o.terno) P.peca(F.poligono([[-0.12, 0.5], [0.12, 0.5], [0, 0.05]]), { pai: corpo, prof: 0.02, cor: BRANCO, y: 1.42, z: 0.05, t: t + 0.35 });
    const ang = o.bracos === 'cima' ? 2.6 : o.bracos === 'abertos' ? 0.9 : 0.12;
    const bracos = [-1, 1].map((sx, i) => {
      const b = P.grupo({ pai: corpo, x: sx * 0.44, y: 1.86, z: 0.02 }); b.rotation.z = sx * ang;
      P.peca(F.ret(0.2, 0.85, 0.08), { pai: b, prof: 0.07, cor: roupa, y: -0.42, t: t + 0.4 + i * 0.07 });
      P.peca(F.circulo(0.12), { pai: b, prof: 0.06, cor: PELE, y: -0.9, z: 0.01, t: t + 0.5 + i * 0.07 });
      if (o.band && sx < 0) P.peca(F.ret(0.24, 0.3, 0.04), { pai: b, prof: 0.09, cor: BRANCO, y: -0.45, z: 0.02, t: t + 0.9 });
      return b;
    });
    P.peca(F.ret(0.2, 0.18, 0.04), { pai: corpo, prof: 0.06, cor: PELE, y: 1.98, t: t + 0.5 });
    const cab = P.grupo({ pai: corpo, y: 2.28 }); g.userData.cab = cab;
    P.peca(F.circulo(0.34), { pai: cab, prof: 0.08, cor: o.cabeca ?? PELE, t: t + 0.55 });
    P.peca(F.arco(0.36, 0.0, -0.15, Math.PI + 0.15), { pai: cab, prof: 0.1, cor: o.velho ? 0xe8e4dc : CABELO, y: 0.06, z: 0.01, t: t + 0.7 });
    const olhos = [-0.12, 0.12].map((x) => P.peca(F.circulo(0.04), { pai: cab, prof: 0.02, cor: 0x2b2622, x, y: -0.04, z: 0.06, t: t + 0.8, entra: 'pop', esboco: false }));
    P.peca(F.arco(0.1, 0.07, Math.PI * 1.15, Math.PI * 1.85), { pai: cab, prof: 0.02, cor: 0x8a3a30, y: -0.08, z: 0.06, t: t + 0.85, entra: 'pop', esboco: false });
    if (o.velho) [-0.12, 0.12].forEach((x) => P.peca(F.anel(0.1, 0.075), { pai: cab, prof: 0.02, cor: 0x3a3330, x, y: -0.04, z: 0.08, t: t + 0.9, entra: 'pop', esboco: false }));
    if (o.band) {
      P.peca(F.ret(0.74, 0.16, 0.03), { pai: cab, prof: 0.02, cor: BRANCO, y: 0.16, z: 0.08, rz: -0.12, t: t + 1.0 });
      P.peca(F.ret(0.2, 0.22, 0.03), { pai: cab, prof: 0.02, cor: BRANCO, x: 0.2, y: -0.12, z: 0.08, t: t + 1.05 });
    }
    // vida: respira, pisca, balança os braços; anda quando g.userData.anda > 0; gesto = 'acena' | 'aponta' | 'desenha' | 'fala'
    const fase = (o.x || 0) * 3.1 + (o.z || 0);
    g.userData.anda = 0; g.userData.gesto = o.gesto; g.userData.olha = 0;
    P.animar((ts) => {
      const u = g.userData, w = u.anda, q = ts * 9 + fase;
      pernas.forEach((p, i) => { p.rotation.z = w * 0.5 * Math.sin(q + i * Math.PI); });
      corpo.position.y = w * Math.abs(Math.sin(q)) * 0.07 + (1 - w) * Math.sin(ts * 2.2 + fase) * 0.012;
      corpo.rotation.z = w * Math.sin(q) * 0.03;
      bracos.forEach((b, i) => {
        const sx = i ? 1 : -1; let a = sx * ang + w * 0.55 * Math.sin(q + i * Math.PI) + (1 - w) * sx * 0.05 * Math.sin(ts * 1.8 + fase + i);
        if (u.gesto === 'acena' && i === 1) a = 2.5 + 0.35 * Math.sin(ts * 12);
        if (u.gesto === 'aponta' && i === 1) a = 2.75;
        if (u.gesto === 'desenha' && i === 1) a = 0.9 + 0.18 * Math.sin(ts * 14);
        if (u.gesto === 'fala') a = sx * (0.35 + 0.25 * Math.abs(Math.sin(ts * 6 + i)));
        b.rotation.z = a;
      });
      if (!u.travaCab) cab.rotation.z = Math.sin(ts * 1.3 + fase) * 0.06 + w * Math.sin(q) * 0.04;
      cab.rotation.x = -0.5 * u.olha;
      const pisca = ((ts + fase) % 3.1) < 0.1 ? 0.15 : 1; olhos.forEach((e) => e.scale.y = pisca);
    });
    return g;
  };
  // faz o boneco andar de x0 até x1 entre t0 e t1 (pernas se mexem só enquanto anda)
  L.anda = (h, x0, x1, t0, t1, z0, z1) => {
    P.animar((ts, tt) => {
      const k = Math.min(1, Math.max(0, (tt - t0) / (t1 - t0)));
      h.position.x = x0 + (x1 - x0) * k; if (z0 !== undefined) h.position.z = z0 + (z1 - z0) * k;
      h.userData.anda = tt > t0 && tt < t1 ? Math.min(1, (tt - t0) * 4, (t1 - tt) * 4) : 0;
    });
  };

  // céu vivo: nuvens de papel passando e passarinhos
  L.ceu = (o = {}) => {
    const r = P.fixo(o.semente ?? 5);
    for (let i = 0; i < (o.n ?? 3); i++) {
      const n = P.peca(F.nuvem(1.2 + r() * 0.8, 0.5 + r() * 0.2), { prof: 0.05, cor: 0xfbf6ea, x: -2.5 + i * 2.3, y: 2.7 + r() * 0.5, z: -2.1 - r() * 0.5, t: 0.05 + i * 0.1, entra: 'pop' });
      const v = 0.18 + r() * 0.15, x0 = -2.5 + i * 2.3;
      P.animar((ts) => { n.position.x = ((x0 + ts * v + 3.5) % 7) - 3.5; });
    }
    if (o.passaros !== false) for (let i = 0; i < 3; i++) {
      const b = P.grupo({ y: 2.6 + i * 0.25, z: -1.2 });
      const asa1 = P.peca(F.poligono([[0, 0], [-0.22, 0.08], [-0.2, 0.02]]), { pai: b, prof: 0.01, cor: 0x2b2622, t: 0.2, entra: 'fixo', esboco: false });
      const asa2 = P.peca(F.poligono([[0, 0], [0.22, 0.08], [0.2, 0.02]]), { pai: b, prof: 0.01, cor: 0x2b2622, t: 0.2, entra: 'fixo', esboco: false });
      P.animar((ts, tt) => { b.position.x = -3.5 + ((tt * 0.9 + i * 1.3) % 7); b.position.y = 2.6 + i * 0.25 + Math.sin(tt * 3 + i) * 0.08; const f = Math.sin(ts * 16 + i) * 0.5; asa1.rotation.z = f; asa2.rotation.z = -f; });
    }
  };
  // fumaça saindo de uma chaminé (grupo pai + posição)
  L.fumaca = (pai, x, y, z = 0) => {
    const bolas = [0, 1, 2, 3, 4].map((i) => P.peca(F.nuvem(0.42, 0.3), { pai, prof: 0.04, cor: 0xe9e4da, x, y, z, t: 0, entra: 'fixo', esboco: false }));
    P.animar((ts) => bolas.forEach((b, i) => { const k = ((ts * 0.7 + i / 5) % 1); b.position.set(x - k * 0.9, y + k * 1.3, z); b.scale.setScalar(0.4 + k * 1.3); b.visible = k > 0.02; }));
  };
  // ondas do mar (faixas que vão e voltam)
  L.ondas = (z = -2.4) => {
    for (let i = 0; i < 4; i++) { const w = P.deitado(F.ret(1.1, 0.06, 0.03), { prof: 0.01, cor: 0xf4fbff, x: -2.4 + i * 1.5, y: 0.03, z: z + (i % 2) * 0.4, t: 0, entra: 'fixo', esboco: false });
      P.animar((ts) => { w.position.x = -2.4 + i * 1.5 + Math.sin(ts * 1.5 + i) * 0.25; }); }
  };

  // casinha japonesa (caixa + telhado)
  L.casa = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: 0, z: o.z || 0, pai: o.pai }); const s = o.s ?? 1; g.scale.setScalar(s);
    const t = o.t ?? 0, w = o.w ?? 1.2, h = o.h ?? 0.8;
    P.caixa(w, h, 0.7, { pai: g, y: h / 2, cor: o.cor ?? 0xe9dcc0, t });
    P.peca(F.poligono([[-w / 2 - 0.22, 0], [w / 2 + 0.22, 0], [w / 2 - 0.1, 0.42], [-w / 2 + 0.1, 0.42]]), { pai: g, prof: 0.8, cor: o.teto ?? 0x5a3a2c, y: h, t: t + 0.15 });
    P.peca(F.ret(0.3, 0.45, 0.02), { pai: g, prof: 0.02, cor: 0x7b4a2b, y: 0.23, z: 0.36, t: t + 0.3, esboco: false });
    return g;
  };

  // cidade: fileira de casas e prédios lá atrás
  L.cidade = (o = {}) => {
    const g = P.grupo({ z: o.z ?? -1.4, x: o.x || 0, pai: o.pai }); const t = o.t ?? 0; const r = P.fixo(o.semente ?? 3);
    const n = o.n ?? 7;
    for (let i = 0; i < n; i++) {
      const x = -2.2 + i * (4.4 / (n - 1)) + (r() - 0.5) * 0.2;
      if (i % 3 === 1) P.caixa(0.7, 1.2 + r() * 0.6, 0.6, { pai: g, x, y: 0.7, cor: o.cor2 ?? 0xd9c9a6, t: t + i * 0.08, entra: 'levanta' });
      else L.casa({ pai: g, x, z: (r() - 0.5) * 0.4, s: 0.6 + r() * 0.25, t: t + i * 0.08, cor: o.cor, teto: o.teto });
    }
    return g;
  };

  // trem (locomotiva + vagão) andando de x0 até x1 entre t0 e t1
  L.trem = (o = {}) => {
    const g = P.grupo({ x: o.x0 ?? 0, z: o.z ?? 0, pai: o.pai }); const t = o.t ?? 0;
    const verde = o.cor ?? 0x2f6b4f;
    P.caixa(1.9, 0.8, 0.7, { pai: g, x: -0.4, y: 0.62, cor: verde, t });
    P.caixa(0.9, 1.05, 0.7, { pai: g, x: 1.05, y: 0.74, cor: 0x2b2622, t: t + 0.1 });
    P.peca(F.ret(0.22, 0.4, 0.05), { pai: g, prof: 0.1, cor: 0x2b2622, x: 1.3, y: 1.45, t: t + 0.25 });
    L.fumaca(g, 1.3, 1.75, 0);
    const rodas = [];
    [-1.05, -0.55, -0.05, 0.45].forEach((x, i) => P.peca(F.ret(0.32, 0.3, 0.04), { pai: g, prof: 0.02, cor: 0xf6e7a6, x, y: 0.72, z: 0.36, t: t + 0.3 + i * 0.05, esboco: false }));
    [-1.0, -0.2, 0.8, 1.3].forEach((x, i) => rodas.push(P.peca(F.estrela(0.2, 0.16, 8), { pai: g, prof: 0.08, cor: 0x3a3330, x, y: 0.22, z: 0.36, t: t + 0.4 + i * 0.05, entra: 'pop' })));
    P.animar((ts) => { rodas.forEach((r) => r.children[0].rotation.z = -g.position.x * 2.5); g.children.forEach(() => {}); });
    if (o.passageiro) { const h = L.homem({ pai: g, x: -0.55, y: 0.25, z: 0.2, s: 0.32, t: t + 0.5, band: o.band, gesto: o.band ? undefined : 'acena' }); }
    if (o.x1 !== undefined) P.animar((ts, tt) => { const k = Math.min(1, Math.max(0, (tt - o.t0) / (o.t1 - o.t0))); g.position.x = o.x0 + (o.x1 - o.x0) * (k * k * (3 - 2 * k)); });
    // trilho
    P.deitado(F.ret(7, 0.08, 0.01), { prof: 0.01, cor: 0x6b5a48, z: (o.z ?? 0) + 0.12, t: 0, entra: 'fixo', esboco: false });
    P.deitado(F.ret(7, 0.08, 0.01), { prof: 0.01, cor: 0x6b5a48, z: (o.z ?? 0) - 0.12, t: 0, entra: 'fixo', esboco: false });
    return g;
  };

  L.navio = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0, pai: o.pai }); const t = o.t ?? 0; g.scale.setScalar(o.s ?? 1);
    P.animar((ts) => { g.rotation.z = Math.sin(ts * 1.6 + (o.x || 0)) * 0.03; g.position.y = Math.sin(ts * 1.6) * 0.04; });
    P.peca(F.poligono([[-1.5, 0.5], [1.7, 0.5], [1.2, -0.1], [-1.2, -0.1]]), { pai: g, prof: 0.5, cor: o.cor ?? 0x3d4a5c, y: 0.1, t });
    P.peca(F.ret(3.0, 0.1, 0.02), { pai: g, prof: 0.52, cor: C.VERMELHO, y: 0.3, t: t + 0.2 });
    P.caixa(0.9, 0.5, 0.4, { pai: g, x: -0.3, y: 0.85, cor: BRANCO, t: t + 0.3 });
    P.peca(F.ret(0.22, 0.6, 0.04), { pai: g, prof: 0.2, cor: C.VERMELHO2, x: 0.3, y: 1.15, t: t + 0.45 });
    return g;
  };

  L.guindaste = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0, pai: o.pai }); const t = o.t ?? 0;
    P.peca(F.ret(0.14, 2.6, 0.02), { pai: g, prof: 0.14, cor: C.LARANJA, y: 1.3, t });
    P.peca(F.ret(1.8, 0.12, 0.02), { pai: g, prof: 0.12, cor: C.LARANJA, x: 0.7, y: 2.55, t: t + 0.15 });
    const cabo = P.grupo({ pai: g, x: 1.4, y: 2.5 }); P.peca(F.ret(0.03, 0.8, 0.01), { pai: cabo, prof: 0.03, cor: 0x2b2622, y: -0.4, t: t + 0.3, esboco: false });
    P.peca(F.ret(0.3, 0.25, 0.02), { pai: cabo, prof: 0.2, cor: 0x7d9ac4, y: -0.9, t: t + 0.35 });
    P.animar((ts) => { cabo.rotation.z = Math.sin(ts * 1.4) * 0.15; });
    return g;
  };

  // nuvem de cogumelo de papel (cresce de t0 até t1)
  L.cogumelo = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z ?? -1.2, pai: o.pai }); const s = o.s ?? 1; const t = o.t ?? 0;
    const cin = o.cor ?? 0xa9a39a, cin2 = 0xd7d0c4;
    P.peca(F.ret(0.55, 2.0, 0.2), { pai: g, prof: 0.3, cor: cin, y: 1.0, t, entra: 'fixo' });
    P.peca(F.nuvem(2.6, 1.1), { pai: g, prof: 0.35, cor: cin, y: 2.2, t, entra: 'fixo' });
    P.peca(F.nuvem(2.0, 0.8), { pai: g, prof: 0.1, cor: cin2, y: 2.35, z: 0.22, t, entra: 'fixo' });
    P.peca(F.nuvem(1.3, 0.5), { pai: g, prof: 0.1, cor: cin2, y: 0.25, z: 0.22, t, entra: 'fixo' });
    const t0 = o.t0 ?? t, t1 = o.t1 ?? t0 + 2.5;
    P.animar((ts, tt) => { const k = Math.min(1, Math.max(0.001, (tt - t0) / (t1 - t0))); const e = 1 - Math.pow(1 - k, 3); const b = 1 + Math.sin(ts * 3) * 0.025; g.scale.set(s * (0.3 + 0.7 * e) * b, s * e, s); g.rotation.z = Math.sin(ts * 1.1) * 0.02; });
    return g;
  };

  // clarão: estrela de papel enorme + flash branco na tela
  L.clarao = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 2.2, z: o.z ?? -1.6, pai: o.pai }); const t = o.t ?? 0.3;
    P.peca(F.estrela(3.2, 1.3, 14), { pai: g, prof: 0.04, cor: 0xffe27a, t, entra: 'pop', dur: 0.3, esboco: false });
    P.peca(F.estrela(2.2, 1.0, 10), { pai: g, prof: 0.04, cor: 0xfff6d8, z: 0.05, t: t + 0.08, entra: 'pop', dur: 0.3, esboco: false });
    P.peca(F.circulo(0.8), { pai: g, prof: 0.04, cor: 0xffffff, z: 0.1, t: t + 0.12, entra: 'pop', dur: 0.25, esboco: false });
    P.animar((ts) => { g.rotation.z = ts * 0.15; });
    if (o.flash !== false) L.flash(t + 0.05, o.flashDur ?? 1.4);
    return g;
  };
  L.flash = (t0, dur = 1.4, cor = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0, depthTest: false }));
    m.renderOrder = 999; P.fg.add(m);
    P.animar((ts, tt) => {
      const k = tt - t0; m.material.opacity = k < 0 ? 0 : k < 0.12 ? k / 0.12 * 0.95 : Math.max(0, 0.95 * (1 - (k - 0.12) / dur));
      const dir = new THREE.Vector3(); P.cam.getWorldDirection(dir); m.position.copy(P.cam.position).addScaledVector(dir, 1.2); m.quaternion.copy(P.cam.quaternion);
    });
  };
  // escurece a cena (noite/abrigo): véu escuro na frente da câmera
  L.noite = (op = 0.45) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: 0x0d1430, transparent: true, opacity: op, depthTest: false }));
    m.renderOrder = 998; P.fg.add(m);
    P.animar(() => { const dir = new THREE.Vector3(); P.cam.getWorldDirection(dir); m.position.copy(P.cam.position).addScaledVector(dir, 1.25); m.quaternion.copy(P.cam.quaternion); });
  };

  L.aviao = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 3, z: o.z ?? -1.5, pai: o.pai }); const t = o.t ?? 0;
    P.peca(F.poligono([[-0.7, 0], [0.6, 0.05], [0.75, 0.12], [0.6, 0.2], [-0.6, 0.18], [-0.75, 0.42], [-0.85, 0.42], [-0.8, 0.1]]), { pai: g, prof: 0.05, cor: 0xc9ccd2, t });
    P.peca(F.poligono([[-0.1, 0.12], [0.25, 0.12], [-0.3, -0.35], [-0.45, -0.35]]), { pai: g, prof: 0.04, cor: 0xa8adb6, z: 0.04, t: t + 0.1 });
    if (o.x1 !== undefined) P.animar((ts, tt) => { const k = Math.min(1, Math.max(0, (tt - (o.t0 ?? 0)) / ((o.t1 ?? 4) - (o.t0 ?? 0)))); g.position.x = (o.x || 0) + ((o.x1) - (o.x || 0)) * k; });
    return g;
  };

  L.sol = (o = {}) => {
    const g = P.grupo({ x: o.x ?? 1.8, y: o.y ?? 3.2, z: o.z ?? -2, pai: o.pai });
    P.peca(F.estrela(0.75, 0.55, 12), { pai: g, prof: 0.04, cor: o.cor2 ?? 0xf6b13a, t: o.t ?? 0, entra: 'pop' });
    P.peca(F.circulo(0.5), { pai: g, prof: 0.05, cor: o.cor ?? 0xf8d24a, z: 0.04, t: (o.t ?? 0) + 0.1, entra: 'pop' });
    return g;
  };

  // relógio de parede com ponteiros (min anda até minFim)
  L.relogio = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 1.7, z: o.z || 0, pai: o.pai }); const t = o.t ?? 0; g.scale.setScalar(o.s ?? 1);
    P.peca(F.circulo(1.0), { pai: g, prof: 0.12, cor: 0x7b4a2b, t });
    P.peca(F.circulo(0.86), { pai: g, prof: 0.02, cor: BRANCO, z: 0.07, t: t + 0.15 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; P.peca(F.ret(0.05, i % 3 ? 0.08 : 0.16, 0.01), { pai: g, prof: 0.01, cor: 0x2b2622, x: Math.sin(a) * 0.72, y: Math.cos(a) * 0.72, z: 0.09, rz: -a, t: t + 0.25 + i * 0.02, entra: 'pop', esboco: false }); }
    const hp = P.grupo({ pai: g, z: 0.1 }), mp = P.grupo({ pai: g, z: 0.12 });
    P.peca(F.ret(0.08, 0.42, 0.03), { pai: hp, prof: 0.02, cor: 0x2b2622, y: 0.2, t: t + 0.5 });
    P.peca(F.ret(0.06, 0.62, 0.03), { pai: mp, prof: 0.02, cor: C.VERMELHO, y: 0.3, t: t + 0.6 });
    P.rebite({ pai: g, z: 0.14, t: t + 0.7, r: 0.06 });
    const h = o.hora ?? 11, m0 = o.min0 ?? 50, m1 = o.min1 ?? 60, D = o.D ?? 3;
    P.animar((ts, tt) => { const m = m0 + (m1 - m0) * Math.min(1, tt / D); mp.rotation.z = -m / 60 * Math.PI * 2; hp.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; });
    return g;
  };

  // mala e calendário
  L.mala = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0, pai: o.pai }); const t = o.t ?? 0; g.scale.setScalar(o.s ?? 1);
    P.peca(F.ret(1.5, 1.05, 0.14), { pai: g, prof: 0.45, cor: o.cor ?? 0x7b4a2b, y: 0.55, t });
    P.peca(F.ret(1.36, 0.9, 0.1), { pai: g, prof: 0.02, cor: P.costura(0x8e5a36, { w: 256, h: 170, margem: 10 }), y: 0.55, z: 0.24, t: t + 0.2 });
    P.peca(F.arco(0.28, 0.19), { pai: g, prof: 0.1, cor: 0x4a2c1a, y: 1.08, t: t + 0.35 });
    [-0.45, 0.45].forEach((x, i) => P.peca(F.ret(0.12, 1.07, 0.03), { pai: g, prof: 0.47, cor: 0x4a2c1a, x, y: 0.55, t: t + 0.45 + i * 0.08 }));
    return g;
  };
  L.calendario = (o = {}) => P.impresso(1.3, 1.6, (g, w, h) => {
    g.fillStyle = '#f8f3e8'; g.fillRect(0, 0, w, h); g.fillStyle = '#c93a2e'; g.fillRect(0, 0, w, h * 0.22);
    g.fillStyle = '#fff'; g.font = `bold ${h * 0.13}px sans-serif`; g.textAlign = 'center'; g.fillText('AGOSTO 1945', w / 2, h * 0.15);
    g.fillStyle = '#2b2622'; g.font = `${h * 0.07}px sans-serif`;
    for (let i = 0; i < 31; i++) { const c = (i + 3) % 7, r = Math.floor((i + 3) / 7); g.fillText(String(i + 1), w * (0.1 + c * 0.13), h * (0.33 + r * 0.13)); }
    g.strokeStyle = '#c93a2e'; g.lineWidth = w * 0.02; g.beginPath(); g.ellipse(w * (0.1 + 1 * 0.13), h * (0.33 + 1 * 0.13) - h * 0.025, w * 0.07, h * 0.05, 0, 0, 7); g.stroke();
  }, Object.assign({ prof: 0.03 }, o));

  // escritório: mesa com planta de navio
  L.mesa = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0, pai: o.pai }); const t = o.t ?? 0;
    P.caixa(2.4, 0.12, 1.2, { pai: g, y: 0.85, cor: 0x8e5a36, t });
    [-1.05, 1.05].forEach((x, i) => P.caixa(0.12, 0.8, 1.0, { pai: g, x, y: 0.4, cor: 0x6a4026, t: t + 0.1 + i * 0.05 }));
    P.impresso(1.3, 0.85, (c, w, h) => {
      c.fillStyle = '#2f5d9a'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(w * 0.1, h * 0.55); c.lineTo(w * 0.9, h * 0.55); c.lineTo(w * 0.8, h * 0.75); c.lineTo(w * 0.2, h * 0.75); c.closePath(); c.stroke();
      c.strokeRect(w * 0.35, h * 0.3, w * 0.25, h * 0.25); c.beginPath(); c.moveTo(w * 0.7, h * 0.55); c.lineTo(w * 0.7, h * 0.2); c.stroke();
      c.setLineDash([6, 6]); for (let y = 0.1; y < 1; y += 0.15) { c.beginPath(); c.moveTo(0, h * y); c.lineTo(w, h * y); c.globalAlpha = 0.25; c.stroke(); c.globalAlpha = 1; }
    }, { pai: g, rx: -Math.PI / 2 + 0.25, y: 0.95, z: 0.05, t: t + 0.4 });
    return g;
  };

  // mapa visto de cima: cidade, rio, círculo vermelho da bomba, homem na borda, linha pontilhada
  L.mapa = (o = {}) => {
    const t = o.t ?? 0;
    P.impresso(5.2, 6.4, (c, w, h) => {
      c.fillStyle = '#efe3c4'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#7fb3d9'; c.lineWidth = w * 0.04; c.beginPath(); c.moveTo(w * 0.1, 0); c.bezierCurveTo(w * 0.3, h * 0.4, w * 0.15, h * 0.6, w * 0.4, h); c.stroke();
      if (o.mar) { c.fillStyle = '#9cc9e6'; c.fillRect(0, h * 0.82, w, h * 0.18); }
      c.fillStyle = 'rgba(150,130,100,0.35)'; const r = P.fixo(9); for (let i = 0; i < 120; i++) c.fillRect(r() * w, r() * h * 0.8, w * 0.03, h * 0.02);
    }, { rx: -Math.PI / 2, y: 0.02, z: 0.4, prof: 0.02, t, entra: 'desliza' });
    const cx = o.cx ?? -0.4, cz = o.cz ?? -0.6;
    P.deitado(F.anel(1.25, 1.08), { prof: 0.03, cor: C.VERMELHO, x: cx, y: 0.04, z: cz, t: t + 0.6, entra: 'pop' });
    P.deitado(F.circulo(0.18), { prof: 0.03, cor: C.VERMELHO, x: cx, y: 0.04, z: cz, t: t + 0.7, entra: 'pop' });
    // pontilhado até a pessoa (3 km = raio do círculo + um pouco)
    const px = cx + 1.9, pz = cz + 1.35, n = 9;
    for (let i = 1; i <= n; i++) { const k = i / (n + 1); P.deitado(F.circulo(0.06), { prof: 0.02, cor: 0x2b2622, x: cx + (px - cx) * k, y: 0.04, z: cz + (pz - cz) * k, t: (o.tLinha ?? t + 1.2) + i * 0.1, entra: 'pop', esboco: false }); }
    L.homem({ x: px, y: 0.04, z: pz, s: 0.4, t: t + 0.9, band: o.band });
  };

  // texto de papel em pé (atalho)
  L.txt = (s, o = {}) => P.texto(s, Object.assign({ tam: 1.1, prof: 0.1, cor: C.VERMELHO, y: 0.05, z: 1.6, t: 0.4, entra: 'cai' }, o));

  L.abrigo = (o = {}) => {
    const t = o.t ?? 0;
    P.peca(F.arco(2.4, 1.5, 0, Math.PI), { prof: 0.6, cor: 0x5a4636, y: 0, z: -0.3, t });
    P.peca(F.arco(1.5, 0.01, 0, Math.PI), { prof: 0.05, cor: 0x1a1512, y: 0, z: -0.55, t: t + 0.1, esboco: false });
    const fogo = [];
    [[-1.9, 0.3], [2.0, 0.4], [-2.6, 0.2], [2.7, 0.25]].forEach(([x, y], i) => {
      const f = P.peca(F.estrela(0.45, 0.2, 7), { prof: 0.04, cor: i % 2 ? 0xf08a2a : 0xf6c33a, x, y: y + 0.3, z: -1.2, t: t + 0.4 + i * 0.1, entra: 'pop' }); fogo.push(f);
    });
    P.animar((ts) => fogo.forEach((f, i) => { const s = 0.85 + 0.25 * Math.sin(ts * 9 + i * 2); f.children[0].scale.set(s, 0.9 + 0.3 * Math.sin(ts * 7 + i), 1); }));
  };

  L.balao = (desenha, o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 3, z: o.z ?? 0.2 }); const t = o.t ?? 0;
    P.peca(F.nuvem(2.2, 1.3), { pai: g, prof: 0.05, cor: BRANCO, t, entra: 'pop' });
    [[-0.9, -0.9, 0.14], [-1.2, -1.25, 0.09]].forEach(([x, y, r], i) => P.peca(F.circulo(r), { pai: g, prof: 0.04, cor: BRANCO, x, y, t: t + 0.1 + i * 0.08, entra: 'pop' }));
    P.impresso(1.6, 0.8, desenha, { pai: g, y: 0.05, z: 0.05, t: t + 0.3, entra: 'pop', esboco: false });
    return g;
  };

  L.documento = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 1.8, z: o.z || 0.3 }); const t = o.t ?? 0;
    P.impresso(2.4, 3.1, (c, w, h) => {
      c.fillStyle = '#f8f3e8'; c.fillRect(0, 0, w, h); c.fillStyle = '#2b2622';
      c.fillRect(w * 0.1, h * 0.08, w * 0.8, h * 0.035);
      for (let i = 0; i < 9; i++) { c.globalAlpha = 0.5; c.fillRect(w * 0.1, h * (0.42 + i * 0.05), w * (0.5 + (i * 37 % 30) / 100), h * 0.012); }
      c.globalAlpha = 1; c.fillStyle = '#d9c9a6'; c.fillRect(w * 0.1, h * 0.15, w * 0.28, h * 0.22);
      c.fillStyle = '#e9b98e'; c.beginPath(); c.arc(w * 0.24, h * 0.24, w * 0.07, 0, 7); c.fill(); c.fillStyle = '#2a2420'; c.beginPath(); c.arc(w * 0.24, h * 0.22, w * 0.07, Math.PI, 0); c.fill();
    }, { pai: g, prof: 0.02, t, entra: 'cai' });
    const sel = (x, tt) => { P.peca(F.anel(0.32, 0.25), { pai: g, prof: 0.02, cor: C.VERMELHO, x, y: 0.75, z: 0.04, rz: 0.3, t: tt, entra: 'pop', dur: 0.25 }); P.peca(F.estrela(0.18, 0.08, 6), { pai: g, prof: 0.02, cor: C.VERMELHO, x, y: 0.75, z: 0.05, t: tt + 0.05, entra: 'pop', dur: 0.25, esboco: false }); };
    if (o.selos >= 1) sel(0.55, o.tSelo1 ?? t + 0.6);
    if (o.selos >= 2) sel(0.55, o.tSelo2 ?? t + 1.4), g.children.slice(-2).forEach(() => {});
    return g;
  };

  L.radio = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0 }); const t = o.t ?? 0;
    P.caixa(1.6, 1.1, 0.6, { pai: g, y: 0.55, cor: 0x7b4a2b, t });
    P.peca(F.arco(0.8, 0.0, 0, Math.PI), { pai: g, prof: 0.6, cor: 0x7b4a2b, y: 1.1, t: t + 0.1 });
    P.peca(F.ret(0.8, 0.6, 0.1), { pai: g, prof: 0.02, cor: P.costura(0xd8c39a, { w: 128, h: 96, margem: 6, linha: 'rgba(90,60,30,0.6)' }), x: -0.25, y: 0.7, z: 0.31, t: t + 0.2 });
    [0.5, 0.5].forEach((x, i) => P.peca(F.circulo(0.13), { pai: g, prof: 0.05, cor: C.DOURADO, x, y: 0.85 - i * 0.35, z: 0.32, t: t + 0.3 + i * 0.1, entra: 'pop' }));
    return g;
  };

  L.arvore = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0 }); const t = o.t ?? 0; g.scale.setScalar(o.s ?? 1);
    P.peca(F.ret(0.25, 1.2, 0.05), { pai: g, prof: 0.1, cor: 0x6a4026, y: 0.6, t });
    const copa = P.peca(F.nuvem(1.6, 1.3), { pai: g, prof: 0.12, cor: o.cor ?? C.VERDE, y: 1.3, t: t + 0.2 });
    P.animar((ts) => { copa.rotation.z = Math.sin(ts * 1.7 + (o.x || 0)) * 0.05; });
    P.peca(F.nuvem(1.1, 0.8), { pai: g, prof: 0.05, cor: C.VERDE_CLARO, y: 1.45, z: 0.08, t: t + 0.3 });
    return g;
  };

  return L;
};

// "Cena de filme": boneco de perfil com joelho, cotovelo, pé que pisa firme (IK), boca que mexe com a fala,
// poses com transição suave, ser arremessado, deitar e levantar. Mais props do filme (avião, bomba, explosão).
// Carregado depois do lib.js. window.ATOR(P, L) acrescenta L.ator, L.K e os props.
window.ATOR = (P, L) => {
  const { F, THREE } = P;
  const PELE = 0xe9b98e, CALCA = 0x34343e, CABELO = 0x221c18, BRANCO = 0xf6f1e4;
  const sm = (k) => { k = Math.min(1, Math.max(0, k)); return k * k * (3 - 2 * k); };
  // trilha de keyframes: [[t, valor(número ou lista), 'lin'?], ...] com easing suave
  const K = (ks) => (t) => {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1], [t1, v1, e] = ks[i]; let k = (t - t0) / (t1 - t0); k = e === 'lin' ? k : sm(k);
      return Array.isArray(v0) ? v0.map((a, j) => a + (v1[j] - a) * k) : v0 + (v1 - v0) * k;
    }
    return ks[ks.length - 1][1];
  };
  L.K = K; L.sm = sm;
  const escuro = (c, f = 0.8) => new THREE.Color(c).multiplyScalar(f).getHex();

  // poses (ângulos em radianos; ombro/cotovelo positivos = pra frente; cabeça positiva = olha pra cima)
  const POSES = {
    normal: {},
    sentado: { hipY: 0.66, tN: 1.5, kN: -1.45, tF: 1.4, kF: -1.4, pN: 0, pF: 0, lean: 0.1 },
    desenha: { sN: 1.0, eN: 0.95, osc: 1, head: -0.18 },
    levanta_lapis: { sN: 0.7, eN: 1.5, head: 0.15 },
    bracos_cima: { sN: 2.75, eN: 0.35, sF: 2.55, eF: 0.4, head: 0.25 },
    bracos_frente: { sN: 1.55, eN: 0.55, sF: 1.25, eF: 0.7, head: 0.2 }, // caindo: braços pra frente sem cruzar o rosto
    mao_cabeca: { sN: 2.3, eN: 2.25, head: -0.2, lean: 0.06 },
    bolsos: { sN: -0.15, eN: 0.9, sF: -0.1, eF: 0.8, head: -0.35, bolso: 1 },
    aponta: { sN: 1.5, eN: 0.05 },
    aponta_cima: { sN: 2.45, eN: 0.05, head: 0.55, lean: -0.08 },
    olha_cima: { head: 0.55, lean: -0.1, sN: 0.2, eN: 0.3 },
    protege: { sN: 1.9, eN: 2.3, sF: 1.75, eF: 2.2, head: -0.3, lean: 0.2 },
    voando: { sN: 2.9, eN: 0.6, sF: -2.4, eF: 0.8, tN: 0.9, kN: -1.2, tF: -0.5, kF: -0.4, pN: 0, pF: 0, head: -0.4, flail: 1 },
    deitado: { rot: 1.52, ly: -0.98, tN: 0.25, kN: -0.5, tF: 0.05, kF: -0.15, pN: 0, pF: 0, sN: 2.7, eN: 0.5, sF: 3.0, eF: 0.3, head: 0.15, olhosF: 1 },
    deitado_mexe: { rot: 1.45, ly: -0.98, tN: 0.6, kN: -1.0, tF: 0.1, kF: -0.3, pN: 0, pF: 0, sN: 1.8, eN: 1.0, sF: 2.8, eF: 0.4, head: 0.35, lean: 0.15 },
    ajoelhado: { hipY: 0.6, tN: 1.45, kN: -1.5, tF: -0.2, kF: -1.35, pN: 0, pF: 0, lean: 0.42, sN: 0.7, eN: 0.5, sF: 0.2, eF: 0.6, head: -0.1 },
    curvado: { lean: 0.32, sN: 0.45, eN: 0.9, sF: -0.1, eF: 1.2, head: -0.05 },
    sentado_chao: { hipY: 0.24, tN: 1.25, kN: -2.45, tF: 1.15, kF: -2.35, pN: 0.3, pF: 0.3, lean: 0.35, sN: 1.05, eN: 1.55, sF: 0.95, eF: 1.5, head: -0.35 },
    abre_bracos: { sN: 1.35, eN: 0.25, sF: 1.15, eF: 0.35, head: 0.1 },
    mao_orelha: { sN: 2.0, eN: 2.55, head: -0.15, lean: 0.05 },
    apoia: { sN: 1.25, eN: 0.6 },
    ferido: { lean: 0.14, head: -0.12, sF: 0.1, eF: 1.4 },
    carrega: { sN: 0.95, eN: 1.55, sF: 0.85, eF: 1.65, head: -0.12 },
    velho: { lean: 0.15, head: -0.06, sN: 0.25, eN: 0.45, sF: 0.1, eF: 0.4 },
    abraco: { sN: 1.45, eN: 1.1, sF: 1.35, eF: 1.2, head: -0.1, lean: 0.08 },
    testa_chao: { sN: 0.75, eN: 0.25, lean: 0.22, head: -0.25, osc: 1 },
    ombro_quebrado: { sF: 0.15, eF: 1.6, lean: 0.12, head: -0.1 },
    boia: { rot: 1.5, ly: -1.05, tN: 0.1, kN: -0.1, tF: -0.05, kF: -0.1, pN: 0, pF: 0, sN: 2.8, eN: 0.2, sF: 2.9, eF: 0.2, head: 0.2 },
    rema: { hipY: 0.5, tN: 1.45, kN: -1.5, tF: 1.35, kF: -1.45, pN: 0, pF: 0, lean: 0.25, sN: 1.0, eN: 0.6, sF: 0.9, eF: 0.7, osc: 1 },
  };
  const CH = ['lean', 'head', 'sN', 'eN', 'sF', 'eF', 'hipY', 'tN', 'kN', 'tF', 'kF', 'pN', 'pF', 'rot', 'ly', 'osc', 'bolso', 'flail', 'olhosF'];
  const pega = (nome) => (typeof nome === 'string' ? nome.split('+').reduce((a, n) => Object.assign(a, POSES[n]), {}) : nome);

  // o: x, z, s, t (entrada; -1 = já está lá), nome (pra boca), dir (1 olha pra direita, -1 esquerda),
  //    mov [[t, x, z?], ...], dirs [[t, ±1], ...], poses [[t, 'pose', durTransição], ...], voo {t0, t1, dx, h, giro},
  //    roupa, chapeu, mala ([[t, 0|1]] visível na mão), band, D (duração da cena)
  L.ator = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0, pai: o.pai }); const s = o.s ?? 1;
    const t0 = o.t ?? -1, fixo = t0 < 0; const T = (dt) => fixo ? -1 : t0 + dt; // -1: já visível no primeiro quadro
    const op = (dt, extra = {}) => Object.assign({ t: T(dt), entra: fixo ? 'fixo' : (extra.entra || 'pop'), esboco: !fixo }, extra);
    const roupa = o.roupa ?? BRANCO, calca = o.calca ?? CALCA;
    const giro = P.grupo({ pai: g, y: 1.2 }); const base = P.grupo({ pai: giro, y: -1.2 });
    const pelve = P.grupo({ pai: base, y: 1.0 });
    // pernas: coxa -> canela -> pé (grupo por articulação)
    const perna = (lado) => {
      const z = lado ? -0.07 : 0.07, f = lado ? 0.8 : 1;
      const coxa = P.grupo({ pai: pelve, z });
      P.peca(F.ret(0.2, 0.56, 0.06), { pai: coxa, prof: 0.06, cor: escuro(calca, f), y: -0.25, ...op(0.05 + lado * 0.04) });
      const joelho = P.grupo({ pai: coxa, y: -0.5 });
      P.peca(F.ret(0.17, 0.56, 0.06), { pai: joelho, prof: 0.06, cor: escuro(calca, f), y: -0.25, ...op(0.08 + lado * 0.04) });
      const tor = P.grupo({ pai: joelho, y: -0.5 });
      P.peca(F.poligono([[-0.09, 0.04], [0.08, 0.04], [0.26, -0.02], [0.26, -0.08], [-0.1, -0.08]]), { pai: tor, prof: 0.07, cor: escuro(lado && o.descalco ? (o.pele ?? PELE) : (o.sapato ?? 0x231c17), f), ...op(0.1 + lado * 0.04) });
      return { coxa, joelho, tor };
    };
    const pernas = [perna(0), perna(1)];
    if (o.folhaPerna) P.peca(F.elipse(0.13, 0.22), { pai: pernas[0].joelho, prof: 0.02, cor: 0x4c8a4a, y: -0.3, z: 0.105, ...op(0.12) });
    const tronco = P.grupo({ pai: pelve });
    P.peca(F.poligono([[-0.17, -0.05], [0.16, -0.05], [0.2, 0.45], [0.17, 0.82], [0.05, 0.9], [-0.14, 0.9], [-0.21, 0.6]]), { pai: tronco, prof: 0.12, cor: roupa, ...op(0.15) });
    if (o.terno) P.peca(F.poligono([[0.1, 0.88], [0.19, 0.8], [0.14, 0.45]]), { pai: tronco, prof: 0.02, cor: BRANCO, z: 0.065, ...op(0.2) });
    if (!o.saia) P.peca(F.ret(0.38, 0.09, 0.03), { pai: tronco, prof: 0.125, cor: escuro(calca, 0.7), y: 0.0, ...op(0.18) }); // cinto
    if (o.saia) { // quadril + uma aba em cada coxa (acompanha andar e sentar, não atravessa a perna)
      P.peca(F.poligono([[-0.18, 0.06], [0.18, 0.06], [0.17, -0.12], [-0.17, -0.12]]), { pai: pelve, prof: 0.26, cor: o.saia, ...op(0.19) });
      // abas finas, só um pouco mais largas que a coxa (não viram caixa ao andar)
      [0, 1].forEach((l) => P.peca(F.poligono([[-0.15, 0.04], [0.15, 0.04], [0.17, -(o.saiaH ?? 0.58)], [-0.17, -(o.saiaH ?? 0.58)]]),
        { pai: pernas[l].coxa, prof: 0.1, cor: escuro(o.saia, l ? 0.85 : 1), z: l ? -0.012 : 0.012, ...op(0.19) }));
    }
    // braços: ombro -> cotovelo -> mão
    const braco = (lado) => {
      const z = (lado ? -1 : 1) * (o.saia ? 0.16 : 0.09), f = lado ? 0.8 : 1;
      const omb = P.grupo({ pai: tronco, x: 0.0, y: 0.78, z });
      P.peca(F.ret(0.15, 0.46, 0.06), { pai: omb, prof: 0.05, cor: escuro(o.semManga ? (o.pele ?? PELE) : roupa, f), y: -0.2, ...op(0.22 + lado * 0.04) });
      const cot = P.grupo({ pai: omb, y: -0.4 });
      P.peca(F.ret(0.13, 0.42, 0.05), { pai: cot, prof: 0.05, cor: escuro(o.manga === false || o.semManga ? (o.pele ?? PELE) : roupa, f), y: -0.18, ...op(0.25 + lado * 0.04) });
      const mao = P.grupo({ pai: cot, y: -0.4 });
      P.peca(F.circulo(0.075), { pai: mao, prof: 0.05, cor: escuro(PELE, f), ...op(0.28 + lado * 0.04) });
      return { omb, cot, mao };
    };
    const bracos = [braco(0), braco(1)];
    if (o.naMao) o.naMao(bracos[0].mao, op(0.3));
    if (o.band) P.peca(F.ret(0.17, 0.22, 0.03), { pai: bracos[0].omb, prof: 0.06, cor: BRANCO, y: -0.2, z: 0.01, ...op(0.5) });
    // cabeça de perfil (olhando pra +x)
    const pesc = P.grupo({ pai: tronco, x: 0.02, y: 0.86 });
    P.peca(F.ret(0.12, 0.14, 0.03), { pai: pesc, prof: 0.06, cor: PELE, y: 0.05, ...op(0.3) });
    const cab = P.grupo({ pai: pesc, y: 0.1 });
    P.peca(F.circulo(0.27), { pai: cab, prof: 0.08, cor: o.pele ?? PELE, x: 0.03, y: 0.24, ...op(0.32) });
    P.peca(F.poligono([[0.27, 0.3], [0.37, 0.2], [0.27, 0.17]]), { pai: cab, prof: 0.06, cor: o.pele ?? PELE, ...op(0.34) }); // nariz
    P.peca(F.poligono([[0.18, 0.04], [0.26, 0.06], [0.28, 0.12], [0.1, 0.1]]), { pai: cab, prof: 0.07, cor: o.pele ?? PELE, ...op(0.34) }); // queixo
    if (!o.cabeloLongo) P.peca(F.arco(0.29, 0, Math.PI * 0.42, Math.PI * 1.22), { pai: cab, prof: 0.1, cor: o.cabelo ?? CABELO, x: 0.03, y: 0.25, z: 0.005, ...op(0.38) });
    P.peca(F.circulo(0.065), { pai: cab, prof: 0.02, cor: escuro(PELE, 0.92), x: -0.03, y: 0.22, z: 0.06, ...op(0.4, { esboco: false }) }); // orelha
    if (o.coque) P.peca(F.circulo(0.14), { pai: cab, prof: 0.1, cor: o.cabelo ?? CABELO, x: -0.24, y: 0.36, z: 0.004, ...op(0.39) });
    if (o.cabeloLongo) {
      // franja + topo (na frente da cabeça) e a parte que cai até o ombro (atrás da cabeça), contornos suaves
      const topo = new THREE.Shape(); topo.absarc(0.03, 0.25, 0.3, Math.PI * 0.12, Math.PI * 1.1, false);
      topo.quadraticCurveTo(-0.12, 0.22, 0.0, 0.36); topo.quadraticCurveTo(0.12, 0.39, 0.22, 0.34); topo.lineTo(0.3, 0.36);
      P.peca(topo, { pai: cab, prof: 0.1, cor: o.cabelo ?? CABELO, z: 0.006, ...op(0.38) });
      const cai = new THREE.Shape(); cai.moveTo(-0.27, 0.36); cai.quadraticCurveTo(-0.4, 0.1, -0.36, -0.18); cai.quadraticCurveTo(-0.2, -0.22, -0.04, -0.14);
      cai.quadraticCurveTo(-0.02, 0.05, 0.02, 0.2); cai.lineTo(-0.1, 0.36); cai.closePath();
      const cl = P.peca(cai, { pai: cab, prof: 0.06, cor: escuro(o.cabelo ?? CABELO, 0.88), z: -0.045, ...op(0.37) });
      cab.userData.cabelo = cl;
    }
    if (o.oculos) {
      P.peca(F.anel(0.075, 0.055), { pai: cab, prof: 0.02, cor: 0x2b2622, x: 0.17, y: 0.3, z: 0.065, ...op(0.43, { esboco: false }) });
      P.peca(F.ret(0.2, 0.022, 0.01), { pai: cab, prof: 0.02, cor: 0x2b2622, x: 0.0, y: 0.32, z: 0.065, ...op(0.43, { esboco: false }) });
    }
    if (o.bebe) { // bebê enrolado na manta, no colo (use a pose 'carrega')
      const b = P.grupo({ pai: tronco, x: 0.27, y: 0.52, z: 0.14 });
      P.peca(F.circulo(0.17), { pai: b, prof: 0.16, cor: o.bebe === true ? 0xf2e2b8 : o.bebe, x: -0.08, ...op(0.45) });
      P.peca(F.circulo(0.15), { pai: b, prof: 0.16, cor: o.bebe === true ? 0xf2e2b8 : o.bebe, x: 0.08, ...op(0.45) });
      P.peca(F.circulo(0.085), { pai: b, prof: 0.1, cor: PELE, x: 0.17, y: 0.1, z: 0.03, ...op(0.47) });
    }
    const olho = P.peca(F.circulo(0.032), { pai: cab, prof: 0.02, cor: 0x231c17, x: 0.17, y: 0.3, z: 0.05, ...op(0.42, { esboco: false }) });
    const sob = P.peca(F.ret(0.1, 0.025, 0.01), { pai: cab, prof: 0.02, cor: o.cabelo ?? CABELO, x: 0.17, y: 0.38, z: 0.05, ...op(0.42, { esboco: false }) });
    const boca = P.peca(F.elipse ? F.elipse(0.045, 0.03) : F.circulo(0.035), { pai: cab, prof: 0.02, cor: 0x7a2a24, x: 0.22, y: 0.12, z: 0.05, ...op(0.44, { esboco: false }) });
    if (o.chapeu) {
      P.peca(F.ret(0.78, 0.06, 0.03), { pai: cab, prof: 0.1, cor: o.chapeu, x: 0.04, y: 0.44, z: 0.02, rz: -0.06, ...op(0.46) });
      P.peca(F.poligono([[-0.22, 0], [0.26, 0], [0.22, 0.24], [-0.18, 0.26]]), { pai: cab, prof: 0.1, cor: o.chapeu, x: 0.02, y: 0.45, z: 0.01, ...op(0.48) });
      P.peca(F.ret(0.46, 0.05, 0.02), { pai: cab, prof: 0.105, cor: 0x2b2622, x: 0.04, y: 0.5, z: 0.02, ...op(0.5, { esboco: false }) });
    }
    if (o.band) {
      P.peca(F.ret(0.6, 0.12, 0.03), { pai: cab, prof: 0.11, cor: BRANCO, x: 0.02, y: 0.4, z: 0.02, rz: -0.15, ...op(0.55) });
      P.peca(F.ret(0.16, 0.18, 0.03), { pai: cab, prof: 0.02, cor: BRANCO, x: 0.1, y: 0.18, z: 0.06, ...op(0.56) });
    }
    // mala na mão da frente (fica sempre pendurada na vertical)
    let mala = null;
    if (o.mala) {
      mala = P.grupo({ pai: bracos[1].mao, z: 0.05 });
      P.peca(F.ret(0.5, 0.36, 0.04), { pai: mala, prof: 0.16, cor: o.corMala ?? 0x8a5a34, y: -0.24, ...op(0.5) });
      P.peca(F.ret(0.5, 0.05, 0.02), { pai: mala, prof: 0.17, cor: 0x5a3a22, y: -0.18, ...op(0.55, { esboco: false }) });
      P.peca(F.anel(0.07, 0.045), { pai: mala, prof: 0.03, cor: 0x3a2a1a, y: -0.04, ...op(0.55, { esboco: false }) });
    }
    const malaVis = o.mala ? (Array.isArray(o.mala) ? K(o.mala) : () => 1) : () => 0;

    // trilhas
    const D = o.D ?? 30, mov = o.mov ? K(o.mov.map(([t, x, z]) => [t, [x, z ?? (o.z || 0)]])) : () => [o.x || 0, o.z || 0];
    // distância percorrida (pra fase do passo bater com o chão: pé não escorrega)
    const passo = 1 / 120, dist = [0]; let ant = mov(0);
    for (let t = passo; t <= D + 0.5; t += passo) { const p = mov(t); dist.push(dist[dist.length - 1] + Math.hypot(p[0] - ant[0], p[1] - ant[1])); ant = p; }
    const distEm = (t) => dist[Math.min(dist.length - 1, Math.max(0, Math.round(t / passo)))];
    const dirs = o.dirs || [[0, o.dir ?? 1]];
    const dirEm = (t) => { let d = dirs[0][1], tt = -9, dAnt = d; for (const [tk, v] of dirs) if (tk <= t) { dAnt = d; d = v; tt = tk; } const k = sm((t - tt) / 0.22); return dAnt + (d - dAnt) * k; };
    const poses = (o.poses || [[0, 'normal']]).map(([t, n, dur]) => [t, pega(n), dur ?? 0.35]);
    const voo = o.voo;
    const BOCA = (window.BOCA || {})[o.nome] || null;
    const fase0 = (o.x || 0) * 1.7;
    const S = 1.0; // passada (um ciclo = dois passos)

    P.animar((ts, t) => {
      // posição e andar
      const p = mov(t), pa = mov(Math.max(0, t - 0.05)), pb = mov(t + 0.05);
      const v = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) / 0.1, w = sm(v / 0.35);
      const c = distEm(t) / S + 0.15;
      // pose (mistura da anterior com a atual)
      let i = 0; for (let j = 0; j < poses.length; j++) if (poses[j][0] <= t) i = j;
      const [tp, cur, dp] = poses[i], prev = i > 0 ? poses[i - 1][1] : {}; const kp = i > 0 ? sm((t - tp) / dp) : 1;
      // automático (de pé / andando)
      const pes = [0, 1].map((lado) => {
        const u = ((c + lado * 0.5) % 1 + 1) % 1; let fx, fy, rp = 0;
        if (u < 0.6) { fx = 0.3 * S - (u / 0.6) * 0.6 * S; fy = 0; rp = -0.4 * sm((u - 0.42) / 0.18); }
        else { const q = (u - 0.6) / 0.4; fx = -0.3 * S + 0.6 * S * sm(q); fy = 0.1 * Math.sin(Math.PI * q); rp = -0.4 * (1 - sm(q * 3)) + 0.25 * sm((q - 0.7) / 0.3); }
        const st = lado ? [-0.06, 0] : [0.08, 0];
        return [st[0] + (fx - st[0]) * w, fy * w, rp * w];
      });
      const auto = {
        lean: 0.07 * w, head: 0.03 * Math.sin(ts * 1.2 + fase0) - 0.04 * w,
        sN: 0.06 + (-0.38 * Math.cos(2 * Math.PI * c)) * w + 0.03 * Math.sin(ts * 1.7 + fase0), eN: 0.18 + 0.25 * w * (1 - Math.cos(2 * Math.PI * c)) / 2,
        sF: -0.02 + (0.38 * Math.cos(2 * Math.PI * c)) * w, eF: 0.18 + 0.25 * w * (1 + Math.cos(2 * Math.PI * c)) / 2,
        hipY: 1.06 - w * (0.02 - 0.02 * Math.cos(4 * Math.PI * (c - 0.3))) + 0.006 * Math.sin(ts * 2.2 + fase0),
        rot: 0, ly: 0, osc: 0, bolso: 0, flail: 0, olhosF: 0,
      };
      // IK das pernas no modo automático
      const ik = (fx, fy) => { const dx = fx, dy = fy + 0.08 - auto.hipY; let d = Math.min(0.995, Math.hypot(dx, dy)); const b = Math.atan2(dx, -dy), a = Math.acos(d); return [b + a, -2 * a]; };
      const [tN, kN] = ik(pes[0][0], pes[0][1]), [tF, kF] = ik(pes[1][0], pes[1][1]);
      Object.assign(auto, { tN, kN, tF, kF, pN: pes[0][2], pF: pes[1][2] });
      const q = {};
      for (const k of CH) { const a = prev[k] ?? auto[k], b = cur[k] ?? auto[k]; q[k] = a + (b - a) * kp; }
      // fala: boca pela amplitude do áudio + mão gesticulando
      const fr = BOCA ? BOCA[Math.min(BOCA.length - 1, Math.max(0, Math.round(t * 30)))] || 0 : 0;
      boca.children[0].scale.set(1 + fr * 0.2, 0.35 + fr * 1.9, 1);
      if (fr > 0.05 && !cur.sN && o.gesticula !== false) { q.sN += 0.35 * fr + 0.15 * Math.sin(t * 4.2); q.eN += 0.5 * fr; q.head += 0.06 * Math.sin(t * 7) * fr; }
      if (q.osc) { q.eN += 0.22 * q.osc * Math.sin(t * 13); q.sN += 0.08 * q.osc * Math.sin(t * 6.5); }
      if (q.bolso) { q.eN += 0.25 * q.bolso * Math.sin(t * 16); q.eF += 0.25 * q.bolso * Math.sin(t * 16 + 2); }
      if (q.flail) { q.sN += 0.6 * q.flail * Math.sin(t * 17); q.sF += 0.6 * q.flail * Math.sin(t * 15 + 1); q.kN -= 0.4 * q.flail * Math.abs(Math.sin(t * 13)); q.head += 0.3 * q.flail * Math.sin(t * 11); }
      // aplica
      let x = p[0], y = 0, rot = q.rot;
      if (voo && t > voo.t0) { const k = Math.min(1, (t - voo.t0) / (voo.t1 - voo.t0)); const e = 1 - Math.pow(1 - k, 1.6);
        x += voo.dx * e; y += (voo.h ?? 1) * 4 * k * (1 - k); rot += (voo.giro ?? 0) * sm(k); if (k >= 1) { const b = t - voo.t1; y += Math.abs(Math.sin(b * 9)) * 0.12 * Math.exp(-b * 5); } }
      const dir = dirEm(t);
      g.position.set(x, o.y || 0, p[1]); g.scale.set(s * (Math.abs(dir) < 0.05 ? 0.05 * Math.sign(dir || 1) : dir), s, s);
      giro.rotation.z = rot; giro.position.y = 1.2 + q.ly + y;
      pelve.position.y = q.hipY; tronco.rotation.z = -q.lean;
      pernas[0].coxa.rotation.z = q.tN; pernas[0].joelho.rotation.z = q.kN; pernas[0].tor.rotation.z = -(q.tN + q.kN) + q.pN;
      pernas[1].coxa.rotation.z = q.tF; pernas[1].joelho.rotation.z = q.kF; pernas[1].tor.rotation.z = -(q.tF + q.kF) + q.pF;
      bracos[0].omb.rotation.z = q.sN; bracos[0].cot.rotation.z = q.eN; bracos[1].omb.rotation.z = q.sF; bracos[1].cot.rotation.z = q.eF;
      pesc.rotation.z = q.lean * 0.5; cab.rotation.z = q.head;
      if (mala) { mala.rotation.z = -(rot - q.lean + q.sF + q.eF); mala.visible = malaVis(t) > 0.5; }
      const pis = ((t + fase0 * 0.3) % 3.3) < 0.11 || q.olhosF > 0.5; olho.children[0].scale.y = pis ? 0.15 : 1;
      sob.children[0].rotation.z = fr * 0.1; if (o.cabeloLongo) sob.visible = false;
      if (cab.userData.cabelo && o.vento) cab.userData.cabelo.rotation.z = (typeof o.vento === 'function' ? o.vento(t) : o.vento) * (0.35 + 0.2 * Math.sin(t * 23));
    });
    if (o.olhoInchado) { P.peca(F.elipse(0.075, 0.06), { pai: cab, prof: 0.02, cor: 0xc98a78, x: 0.17, y: 0.3, z: 0.062, ...op(0.45, { esboco: false }) });
      P.peca(F.ret(0.1, 0.012, 0.005), { pai: cab, prof: 0.02, cor: 0x3a2a20, x: 0.17, y: 0.29, z: 0.072, ...op(0.45, { esboco: false }) }); }
    if (o.barba) P.peca(F.poligono([[0.02, 0.22], [0.22, 0.18], [0.3, 0.08], [0.24, 0.0], [0.08, 0.0], [-0.02, 0.1]]), { pai: cab, prof: 0.09, cor: o.barba, z: 0.004, ...op(0.45) });
    g.userData.cab = cab; g.userData.mao = bracos[0].mao;
    return g;
  };

  // ------------------------------- props do filme -------------------------------
  // céu de papel atrás de tudo (painel em pé)
  L.fundoCeu = (o = {}) => P.peca(F.ret(o.w ?? 10, o.h ?? 6, 0.04), { prof: 0.03, cor: o.cor ?? 0xbcd9ec, y: o.y ?? 2.6, z: o.z ?? -3.3, t: -1, entra: 'fixo', esboco: false });
  // véu colorido na frente da câmera (tinta da cena: poeira, entardecer)
  L.veu = (cor, opF) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0, depthTest: false }));
    m.renderOrder = 997; P.fg.add(m);
    P.animar((ts, t) => { m.material.opacity = typeof opF === 'function' ? opF(t) : opF; const d = new THREE.Vector3(); P.cam.getWorldDirection(d); m.position.copy(P.cam.position).addScaledVector(d, 1.3); m.quaternion.copy(P.cam.quaternion); });
    return m;
  };
  // B-29 de perfil (bico pra +x), hélices girando; mov(t) -> [x, y]
  L.b29 = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 4, z: o.z ?? -1.5 }); g.scale.setScalar(o.s ?? 0.6); const t = o.t ?? 0;
    const prata = 0xc3c8cf;
    P.peca(F.poligono([[-1.9, 0.02], [1.2, 0.0], [1.55, 0.08], [1.68, 0.2], [1.6, 0.32], [1.25, 0.38], [-1.5, 0.36], [-1.95, 0.9], [-2.2, 0.92], [-2.15, 0.3]]), { pai: g, prof: 0.1, cor: prata, t, entra: 'fixo', esboco: false });
    P.peca(F.poligono([[1.25, 0.37], [1.6, 0.32], [1.66, 0.2], [1.3, 0.22]]), { pai: g, prof: 0.11, cor: 0x6f8fa8, t, entra: 'fixo', esboco: false });
    P.peca(F.poligono([[-0.5, 0.18], [0.5, 0.18], [0.35, 0.1], [-0.6, 0.1]]), { pai: g, prof: 0.12, cor: 0x9aa0a8, z: 0.06, t, entra: 'fixo', esboco: false });
    P.peca(F.poligono([[-2.15, 0.35], [-1.6, 0.35], [-1.7, 0.28], [-2.2, 0.27]]), { pai: g, prof: 0.12, cor: 0x9aa0a8, z: 0.06, t, entra: 'fixo', esboco: false });
    const helices = [];
    [[-0.25, 0.08], [0.25, 0.1]].forEach(([x, z]) => {
      P.peca(F.ret(0.42, 0.12, 0.03), { pai: g, prof: 0.08, cor: 0x8d939b, x: x + 0.1, y: 0.08, z: z + 0.04, t, entra: 'fixo', esboco: false });
      helices.push(P.peca(F.ret(0.04, 0.5, 0.01), { pai: g, prof: 0.01, cor: 0x3a3330, x: x + 0.34, y: 0.08, z: z + 0.08, t, entra: 'fixo', esboco: false }));
    });
    P.animar((ts, tt) => { helices.forEach((h, i) => h.children[0].scale.y = Math.cos(tt * 40 + i)); if (o.mov) { const [x, y] = o.mov(tt); g.position.x = x; g.position.y = y; } g.rotation.z = Math.sin(tt * 0.8) * 0.015; });
    return g;
  };
  // bomba (Little Boy de perfil): solta em tSolta da posição do avião, cai girando pro bico
  L.bomba = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 4, z: o.z ?? -1.4 }); g.scale.setScalar(o.s ?? 0.5);
    const p = P.grupo({ pai: g });
    P.peca(F.poligono([[-0.55, -0.14], [0.35, -0.15], [0.5, -0.09], [0.55, 0], [0.5, 0.09], [0.35, 0.15], [-0.55, 0.14]]), { pai: p, prof: 0.28, cor: 0x4a5a52, t: -1, entra: 'fixo', esboco: false });
    P.peca(F.poligono([[-0.55, -0.2], [-0.85, -0.22], [-0.85, 0.22], [-0.55, 0.2]]), { pai: p, prof: 0.3, cor: 0x3a463f, t: -1, entra: 'fixo', esboco: false });
    P.peca(F.ret(0.06, 0.32, 0.01), { pai: p, prof: 0.29, cor: 0x9a3a2a, x: 0.1, t: -1, entra: 'fixo', esboco: false });
    const traj = o.traj; // (t) -> [x, y, rot, visível]
    P.animar((ts, t) => { const [x, y, r, vis] = traj(t); g.position.x = x; g.position.y = y; p.rotation.z = r; g.visible = vis; });
    return g;
  };
  // poeira/onda de choque varrendo da direita pra esquerda a partir de tChoque
  L.ondaChoque = (o = {}) => {
    const r = P.fixo(o.semente ?? 77), bolas = [];
    for (let i = 0; i < 18; i++) bolas.push([P.peca(F.nuvem(1.0 + r() * 0.8, 0.6 + r() * 0.3), { prof: 0.05, cor: [0xcdb79a, 0xb09a7e, 0xe0d0b4][i % 3], x: 9, y: 0.3 + r() * 1.6, z: -1.6 + (i % 6) * 0.55, t: -1, entra: 'fixo', esboco: false }), r()]);
    const v = o.v ?? 6.5, x0 = o.x0 ?? 4;
    P.animar((ts, t) => bolas.forEach(([b, rr], i) => { const k = t - o.t - rr * 0.25; b.visible = k > 0; b.position.x = x0 - k * v * (0.8 + rr * 0.4); b.scale.setScalar(0.6 + Math.min(1.4, k * 1.2)); b.children[0].rotation.z = k * (1 + rr); }));
  };
  // destroços voando (pedacinhos de papel) a partir de t, na direção dx
  L.destrocos = (o = {}) => {
    const r = P.fixo(o.semente ?? 21), bits = [];
    for (let i = 0; i < (o.n ?? 22); i++) bits.push([P.peca(F.poligono([[0, 0], [0.16 + r() * 0.16, 0.02], [0.06, 0.14 + r() * 0.12]]), { prof: 0.02, cor: [0x9a948a, 0x6b5a48, 0xd9c9a6, 0x5a3a2c][i % 4], x: 0, y: 0, z: 0, t: -1, entra: 'fixo', esboco: false }), r(), r(), r()]);
    P.animar((ts, t) => bits.forEach(([b, a, c, d], i) => { const k = t - o.t - a * 0.3; b.visible = k > 0 && k < 3; if (!b.visible) return;
      b.position.set((o.x ?? 3) - k * (4 + c * 4), (o.y ?? 0.3) + d * 2 + k * (1.5 + a) - 2.2 * k * k, (o.z ?? 0) + (c - 0.5) * 2.4); b.children[0].rotation.set(k * 3 * a, k * 4, k * (6 + i)); }));
  };
  // bola de fogo crescendo + clarão
  L.boladefogo = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 1.0, z: o.z ?? -2.6 });
    const a = P.peca(F.circulo(1.0), { pai: g, prof: 0.05, cor: 0xf08a2a, t: -1, entra: 'fixo', esboco: false });
    const b = P.peca(F.circulo(0.8), { pai: g, prof: 0.05, cor: 0xffc84a, z: 0.06, t: -1, entra: 'fixo', esboco: false });
    const c = P.peca(F.circulo(0.5), { pai: g, prof: 0.05, cor: 0xfff4c8, z: 0.12, t: -1, entra: 'fixo', esboco: false });
    P.animar((ts, t) => { const k = t - o.t; g.visible = k > 0 && k < (o.dur ?? 4); const e = Math.min(1, k / 0.6); const s = (o.s ?? 1.4) * (1 - Math.pow(1 - e, 3));
      a.children[0].scale.setScalar(Math.max(0.01, s * (1 + Math.sin(t * 9) * 0.04))); b.children[0].scale.setScalar(Math.max(0.01, s * (1 - Math.min(0.5, k * 0.15)))); c.children[0].scale.setScalar(Math.max(0.01, s * Math.max(0, 1 - k * 0.4))); g.position.y = (o.y ?? 1.0) + Math.max(0, k - 0.8) * 0.5; });
    return g;
  };
  // tremor de câmera: picos [[t, força, duração]]
  L.tremor = (picos) => { P.camOff = (t) => { let a = 0; for (const [t0, f, d] of picos) if (t > t0 && t < t0 + d) a += f * (1 - (t - t0) / d); return [Math.sin(t * 53) * a, Math.sin(t * 61 + 1) * a * 0.8, 0]; }; };
};

// "Cena de filme": boneco de perfil com joelho, cotovelo, pé que pisa firme (IK), boca que mexe com a fala,
// poses com transição suave, ser arremessado, deitar e levantar. Mais props do filme (avião, bomba, explosão).
// Carregado depois do lib.js. window.ATOR(P, L) acrescenta L.ator, L.K e os props.
window.HUMANO = (P, L) => { // corpo de gente (proporção real); substitui L.ator, mantém as mesmas poses e trilhas
  const { F, THREE } = P;
  const PELE = 0xe9b98e, CALCA = 0x34343e, CABELO = 0x221c18, BRANCO = 0xf6f1e4;
  const sm = (k) => { k = Math.min(1, Math.max(0, k)); return k * k * (3 - 2 * k); };
  // trilha de keyframes: [[t, valor(número ou lista), 'lin'?], ...] com easing suave
  const K = (ks) => (t) => {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1], [t1, v1, e] = ks[i]; let k = (t - t0) / (t1 - t0); k = e === 'lin' ? k : sm(k);
      return Array.isArray(v0) ? v0.map((a, j) => a + (v1[j] - a) * k) : v0 + (v1 - v0) * k;
    }
    return ks[ks.length - 1][1];
  };
  L.K = K; L.sm = sm;
  const escuro = (c, f = 0.8) => new THREE.Color(c).multiplyScalar(f).getHex();

  // poses (ângulos em radianos; ombro/cotovelo positivos = pra frente; cabeça positiva = olha pra cima)
  const POSES = {
    normal: {},
    sentado: { hipY: 0.66, tN: 1.5, kN: -1.45, tF: 1.4, kF: -1.4, pN: 0, pF: 0, lean: 0.1 },
    desenha: { sN: 1.0, eN: 0.95, osc: 1, head: -0.18 },
    levanta_lapis: { sN: 0.7, eN: 1.5, head: 0.15 },
    bracos_cima: { sN: 2.75, eN: 0.35, sF: 2.55, eF: 0.4, head: 0.25 },
    bracos_frente: { sN: 1.55, eN: 0.55, sF: 1.25, eF: 0.7, head: 0.2 }, // caindo: braços pra frente sem cruzar o rosto
    mao_cabeca: { sN: 2.3, eN: 2.25, head: -0.2, lean: 0.06 },
    bolsos: { sN: -0.15, eN: 0.9, sF: -0.1, eF: 0.8, head: -0.35, bolso: 1 },
    aponta: { sN: 1.5, eN: 0.05 },
    aponta_cima: { sN: 2.45, eN: 0.05, head: 0.55, lean: -0.08 },
    olha_cima: { head: 0.55, lean: -0.1, sN: 0.2, eN: 0.3 },
    protege: { sN: 1.9, eN: 2.3, sF: 1.75, eF: 2.2, head: -0.3, lean: 0.2 },
    voando: { sN: 2.9, eN: 0.6, sF: -2.4, eF: 0.8, tN: 0.9, kN: -1.2, tF: -0.5, kF: -0.4, pN: 0, pF: 0, head: -0.4, flail: 1 },
    deitado: { rot: 1.52, ly: -0.98, tN: 0.25, kN: -0.5, tF: 0.05, kF: -0.15, pN: 0, pF: 0, sN: 2.7, eN: 0.5, sF: 3.0, eF: 0.3, head: 0.15, olhosF: 1 },
    deitado_mexe: { rot: 1.45, ly: -0.98, tN: 0.6, kN: -1.0, tF: 0.1, kF: -0.3, pN: 0, pF: 0, sN: 1.8, eN: 1.0, sF: 2.8, eF: 0.4, head: 0.35, lean: 0.15 },
    ajoelhado: { hipY: 0.6, tN: 1.45, kN: -1.5, tF: -0.2, kF: -1.35, pN: 0, pF: 0, lean: 0.42, sN: 0.7, eN: 0.5, sF: 0.2, eF: 0.6, head: -0.1 },
    curvado: { lean: 0.32, sN: 0.45, eN: 0.9, sF: -0.1, eF: 1.2, head: -0.05 },
    sentado_chao: { hipY: 0.24, tN: 1.25, kN: -2.45, tF: 1.15, kF: -2.35, pN: 0.3, pF: 0.3, lean: 0.35, sN: 1.05, eN: 1.55, sF: 0.95, eF: 1.5, head: -0.35 },
    abre_bracos: { sN: 1.35, eN: 0.25, sF: 1.15, eF: 0.35, head: 0.1 },
    mao_orelha: { sN: 2.0, eN: 2.55, head: -0.15, lean: 0.05 },
    apoia: { sN: 1.25, eN: 0.6 },
    ferido: { lean: 0.14, head: -0.12, sF: 0.1, eF: 1.4 },
    carrega: { sN: 0.95, eN: 1.55, sF: 0.85, eF: 1.65, head: -0.12 },
    velho: { lean: 0.15, head: -0.06, sN: 0.25, eN: 0.45, sF: 0.1, eF: 0.4 },
    abraco: { sN: 1.45, eN: 1.1, sF: 1.35, eF: 1.2, head: -0.1, lean: 0.08 },
    testa_chao: { sN: 0.75, eN: 0.25, lean: 0.22, head: -0.25, osc: 1 },
    ombro_quebrado: { sF: 0.15, eF: 1.6, lean: 0.12, head: -0.1 },
    boia: { rot: 1.5, ly: -1.05, tN: 0.1, kN: -0.1, tF: -0.05, kF: -0.1, pN: 0, pF: 0, sN: 2.8, eN: 0.2, sF: 2.9, eF: 0.2, head: 0.2 },
    rema: { hipY: 0.5, tN: 1.45, kN: -1.5, tF: 1.35, kF: -1.45, pN: 0, pF: 0, lean: 0.25, sN: 1.0, eN: 0.6, sF: 0.9, eF: 0.7, osc: 1 },
  };
  const CH = ['lean', 'head', 'sN', 'eN', 'sF', 'eF', 'hipY', 'tN', 'kN', 'tF', 'kF', 'pN', 'pF', 'rot', 'ly', 'osc', 'bolso', 'flail', 'olhosF'];
  const pega = (nome) => (typeof nome === 'string' ? nome.split('+').reduce((a, n) => Object.assign(a, POSES[n]), {}) : nome);

  // o: x, z, s, t (entrada; -1 = já está lá), nome (pra boca), dir (1 olha pra direita, -1 esquerda),
  //    mov [[t, x, z?], ...], dirs [[t, ±1], ...], poses [[t, 'pose', durTransição], ...], voo {t0, t1, dx, h, giro},
  //    roupa, chapeu, mala ([[t, 0|1]] visível na mão), band, D (duração da cena)
  L.ator = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0, pai: o.pai }); const s = o.s ?? 1;
    const t0 = o.t ?? -1, fixo = t0 < 0; const T = (dt) => fixo ? -1 : t0 + dt; // -1: já visível no primeiro quadro
    const op = (dt, extra = {}) => Object.assign({ t: T(dt), entra: fixo ? 'fixo' : (extra.entra || 'pop'), esboco: !fixo }, extra);
    const roupa = o.roupa ?? BRANCO, calca = o.calca ?? CALCA;
    // ===== corpo com proporção de gente (cabeça = 1/7,5 da altura), contornos curvos =====
    const sp = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); s.splineThru(pts.slice(1).concat([pts[0]]).map((p) => new THREE.Vector2(p[0], p[1]))); return s; };
    const pele = o.pele ?? PELE, peleE = escuro(pele, 0.86), fem = !!(o.saia || o.cabeloLongo || o.coque);
    const giro = P.grupo({ pai: g, y: 1.2 }); const base = P.grupo({ pai: giro, y: -1.2 });
    const pelve = P.grupo({ pai: base, y: 1.0 });
    const perna = (lado) => {
      const z = lado ? -0.06 : 0.06, f = lado ? 0.8 : 1;
      const corPerna = o.saia ? pele : calca;
      const coxa = P.grupo({ pai: pelve, z });
      // coxa: larga no quadril, afina no joelho; frente levemente curva
      P.peca(sp([[0.1, 0.03], [0.115, -0.15], [0.085, -0.36], [0.06, -0.5], [-0.055, -0.52], [-0.075, -0.33], [-0.1, -0.12], [-0.095, 0.04]]),
        { pai: coxa, prof: 0.07, cor: escuro(corPerna, f), ...op(0.05 + lado * 0.04) });
      const joelho = P.grupo({ pai: coxa, y: -0.5 });
      // canela: panturrilha atrás, tornozelo fino
      P.peca(sp([[0.06, 0.04], [0.055, -0.15], [0.042, -0.38], [0.032, -0.49], [-0.035, -0.5], [-0.045, -0.36], [-0.085, -0.16], [-0.065, 0.02]]),
        { pai: joelho, prof: 0.06, cor: escuro(o.saia ? pele : calca, f), ...op(0.08 + lado * 0.04) });
      P.peca(F.circulo(0.062), { pai: joelho, prof: 0.062, cor: escuro(o.saia ? pele : calca, f), x: 0.0, y: 0.0, ...op(0.08 + lado * 0.04) });
      const tor = P.grupo({ pai: joelho, y: -0.5 });
      const descalco = o.descalco;
      const pe = descalco
        ? sp([[-0.05, 0.03], [0.04, 0.02], [0.14, -0.03], [0.2, -0.055], [0.19, -0.075], [-0.02, -0.075], [-0.07, -0.06]])
        : sp([[-0.055, 0.035], [0.05, 0.03], [0.15, -0.02], [0.215, -0.045], [0.215, -0.08], [-0.03, -0.082], [-0.075, -0.06]]);
      P.peca(pe, { pai: tor, prof: 0.075, cor: escuro(descalco ? pele : (o.sapato ?? 0x231c17), f), ...op(0.1 + lado * 0.04) });
      if (!descalco && !o.saia) P.peca(F.ret(0.13, 0.05, 0.02), { pai: tor, prof: 0.08, cor: escuro(calca, f * 0.92), x: 0.0, y: 0.04, ...op(0.1) }); // barra da calça
      return { coxa, joelho, tor };
    };
    const pernas = [perna(0), perna(1)];
    if (o.folhaPerna) P.peca(F.elipse(0.07, 0.12), { pai: pernas[0].joelho, prof: 0.02, cor: 0x4c8a4a, y: -0.25, z: 0.045, ...op(0.12) });
    const tronco = P.grupo({ pai: pelve });
    // tronco de perfil (frente = +x): quadril, cintura, peito, ombro arredondado
    const corpo = fem
      ? [[0.12, -0.06], [0.1, 0.12], [0.085, 0.24], [0.13, 0.36], [0.135, 0.43], [0.09, 0.5], [0.06, 0.6], [-0.03, 0.63], [-0.1, 0.58], [-0.12, 0.45], [-0.09, 0.27], [-0.13, 0.08], [-0.13, -0.06]]
      : [[0.12, -0.06], [0.12, 0.12], [0.11, 0.26], [0.13, 0.42], [0.1, 0.53], [0.06, 0.61], [-0.04, 0.64], [-0.12, 0.58], [-0.14, 0.42], [-0.11, 0.22], [-0.12, 0.06], [-0.12, -0.06]];
    P.peca(sp(corpo), { pai: tronco, prof: 0.2, cor: roupa, ...op(0.15) });
    if (o.terno) P.peca(F.poligono([[0.05, 0.6], [0.11, 0.53], [0.08, 0.3]]), { pai: tronco, prof: 0.02, cor: BRANCO, z: 0.105, ...op(0.2) });
    if (o.gola !== false && !o.semManga) P.peca(F.poligono([[0.0, 0.62], [0.07, 0.6], [0.05, 0.52]]), { pai: tronco, prof: 0.02, cor: escuro(roupa, 0.85), z: 0.105, ...op(0.2, { esboco: false }) });
    if (!o.saia) P.peca(sp([[0.125, 0.02], [0.125, -0.04], [-0.125, -0.04], [-0.125, 0.02]]), { pai: tronco, prof: 0.205, cor: escuro(calca, 0.6), ...op(0.18) }); // cinto
    if (o.saia) { // quadril + aba em cada coxa (acompanha andar e sentar)
      P.peca(sp([[0.13, 0.04], [0.135, -0.08], [-0.135, -0.08], [-0.135, 0.04]]), { pai: pelve, prof: 0.2, cor: o.saia, ...op(0.19) });
      const h = (o.saiaH ?? 0.42) * 0.85;
      [0, 1].forEach((l) => P.peca(sp([[0.12, 0.03], [0.135, -h * 0.5], [0.15, -h], [-0.13, -h], [-0.125, -h * 0.5], [-0.12, 0.03]]),
        { pai: pernas[l].coxa, prof: 0.09, cor: escuro(o.saia, l ? 0.85 : 1), z: l ? -0.008 : 0.008, ...op(0.19) }));
    }
    // braços: ombro -> cotovelo -> mão (com polegar)
    const braco = (lado) => {
      const z = (lado ? -1 : 1) * 0.115, f = lado ? 0.8 : 1;
      const omb = P.grupo({ pai: tronco, x: -0.015, y: 0.55, z });
      const manga = o.semManga ? pele : roupa;
      P.peca(sp([[0.055, 0.03], [0.055, -0.12], [0.042, -0.3], [-0.04, -0.31], [-0.05, -0.14], [-0.058, 0.03], [0.0, 0.065]]),
        { pai: omb, prof: 0.06, cor: escuro(manga, f), ...op(0.22 + lado * 0.04) });
      P.peca(F.circulo(0.062), { pai: omb, prof: 0.062, cor: escuro(manga, f), y: -0.01, ...op(0.22 + lado * 0.04) });
      const cot = P.grupo({ pai: omb, y: -0.29 });
      const ante = o.manga === false || o.semManga || o.mangaCurta ? pele : roupa;
      P.peca(sp([[0.043, 0.02], [0.046, -0.1], [0.032, -0.27], [-0.03, -0.27], [-0.04, -0.12], [-0.042, 0.02]]),
        { pai: cot, prof: 0.055, cor: escuro(ante, f), ...op(0.25 + lado * 0.04) });
      P.peca(F.circulo(0.044), { pai: cot, prof: 0.056, cor: escuro(manga, f), ...op(0.25 + lado * 0.04) });
      const mao = P.grupo({ pai: cot, y: -0.27 });
      P.peca(sp([[-0.032, 0.01], [0.03, 0.01], [0.052, -0.04], [0.06, -0.075], [0.04, -0.06], [0.036, -0.12], [0.012, -0.165], [-0.018, -0.15], [-0.036, -0.08]]),
        { pai: mao, prof: 0.045, cor: escuro(pele, f), ...op(0.28 + lado * 0.04) });
      return { omb, cot, mao };
    };
    const bracos = [braco(0), braco(1)];
    if (o.naMao) o.naMao(bracos[0].mao, op(0.3));
    if (o.band) P.peca(F.ret(0.12, 0.16, 0.03), { pai: bracos[0].omb, prof: 0.07, cor: BRANCO, y: -0.15, z: 0.0, ...op(0.5) });
    // pescoço e cabeça de perfil realista (queixo em y 0, topo em y ~0.29)
    const pesc = P.grupo({ pai: tronco, x: 0.0, y: 0.58 });
    P.peca(sp([[0.045, 0.0], [0.04, 0.09], [0.035, 0.14], [-0.05, 0.14], [-0.055, 0.06], [-0.06, 0.0]]), { pai: pesc, prof: 0.09, cor: peleE, ...op(0.3) });
    const cab = P.grupo({ pai: pesc, x: 0.0, y: 0.075 });
    const rosto = fem
      ? [[0.055, 0.0], [0.083, 0.022], [0.088, 0.045], [0.081, 0.056], [0.094, 0.07], [0.092, 0.088], [0.104, 0.096], [0.122, 0.112], [0.104, 0.142], [0.094, 0.165], [0.1, 0.19], [0.096, 0.225], [0.05, 0.278], [-0.04, 0.29], [-0.115, 0.24], [-0.13, 0.16], [-0.105, 0.09], [-0.06, 0.07], [-0.02, 0.03]]
      : [[0.05, 0.0], [0.088, 0.02], [0.094, 0.045], [0.085, 0.057], [0.098, 0.07], [0.096, 0.088], [0.108, 0.096], [0.13, 0.115], [0.108, 0.148], [0.096, 0.168], [0.104, 0.195], [0.098, 0.232], [0.05, 0.285], [-0.04, 0.297], [-0.12, 0.245], [-0.135, 0.16], [-0.11, 0.09], [-0.065, 0.065], [-0.02, 0.025]];
    P.peca(sp(rosto), { pai: cab, prof: 0.13, cor: pele, ...op(0.32) });
    // orelha (C) e bochecha
    P.peca(sp([[-0.018, 0.155], [-0.002, 0.14], [-0.004, 0.112], [-0.018, 0.1], [-0.032, 0.112], [-0.034, 0.145]]), { pai: cab, prof: 0.02, cor: escuro(pele, 0.82), z: 0.072, ...op(0.4, { esboco: false }) });
    // olho amendoado: branco + íris + cílio (o grupo de dentro pisca)
    const olho = P.grupo({ pai: cab, x: 0.078, y: 0.163, z: 0.067 }); const olhoIn = P.grupo({ pai: olho });
    P.peca(sp([[-0.012, 0.0], [0.004, 0.009], [0.017, 0.002], [0.004, -0.007]]), { pai: olhoIn, prof: 0.004, cor: 0xf5efe6, ...op(0.42, { esboco: false }) });
    P.peca(F.circulo(0.0065), { pai: olhoIn, prof: 0.004, cor: o.corOlho ?? 0x3a2a1e, x: 0.007, y: 0.001, z: 0.003, ...op(0.42, { esboco: false }) });
    P.peca(sp([[-0.014, 0.004], [0.004, 0.0125], [0.02, 0.004], [0.004, 0.009]]), { pai: olhoIn, prof: 0.004, cor: 0x231a14, z: 0.005, ...op(0.42, { esboco: false }) });
    const sob = P.grupo({ pai: cab, x: 0.076, y: 0.19, z: 0.068 });
    P.peca(sp([[-0.022, -0.002], [0.0, 0.007], [0.022, 0.002], [0.0, 0.0]]), { pai: sob, prof: 0.004, cor: escuro(o.cabelo ?? CABELO, 0.8), ...op(0.42, { esboco: false }) });
    // lábios + boca que abre com a fala
    P.peca(sp([[0.081, 0.056], [0.094, 0.072], [0.088, 0.083], [0.076, 0.07], [0.078, 0.058]]), { pai: cab, prof: 0.01, cor: fem ? 0xc0645a : 0xb57a68, z: 0.066, ...op(0.44, { esboco: false }) });
    const boca = P.peca(F.elipse(0.01, 0.006), { pai: cab, prof: 0.01, cor: 0x5a1e1a, x: 0.08, y: 0.068, z: 0.068, ...op(0.44, { esboco: false }) });
    // cabelo
    const corCab = o.cabelo ?? CABELO;
    if (o.cabeloLongo) {
      // topo com franja de lado (na frente da cabeça) + cascata até o ombro (atrás)
      P.peca(sp([[0.1, 0.215], [0.085, 0.255], [0.045, 0.29], [-0.04, 0.305], [-0.12, 0.26], [-0.142, 0.17], [-0.12, 0.12], [-0.06, 0.15], [-0.02, 0.2], [0.04, 0.215], [0.075, 0.2]]),
        { pai: cab, prof: 0.145, cor: corCab, z: 0.0, ...op(0.38) });
      const cl = P.peca(sp([[-0.04, 0.29], [-0.13, 0.25], [-0.16, 0.12], [-0.17, -0.05], [-0.15, -0.16], [-0.07, -0.15], [-0.04, -0.06], [-0.03, 0.05], [0.0, 0.14], [0.02, 0.24]]),
        { pai: cab, prof: 0.1, cor: escuro(corCab, 0.85), z: -0.05, ...op(0.37) });
      cab.userData.cabelo = cl;
    } else if (o.coque) {
      P.peca(sp([[0.098, 0.22], [0.06, 0.275], [-0.04, 0.3], [-0.122, 0.25], [-0.137, 0.165], [-0.11, 0.1], [-0.07, 0.12], [-0.04, 0.19], [0.03, 0.22]]), { pai: cab, prof: 0.145, cor: corCab, ...op(0.38) });
      P.peca(F.elipse(0.065, 0.06), { pai: cab, prof: 0.11, cor: escuro(corCab, 0.9), x: -0.14, y: 0.21, z: -0.01, ...op(0.39) });
    } else if (!o.careca) {
      P.peca(sp([[0.1, 0.228], [0.07, 0.28], [-0.03, 0.31], [-0.12, 0.265], [-0.142, 0.175], [-0.12, 0.13], [-0.05, 0.16], [0.0, 0.22], [0.05, 0.235]]), { pai: cab, prof: 0.145, cor: corCab, ...op(0.38) });
      P.peca(sp([[-0.005, 0.2], [0.008, 0.15], [-0.015, 0.14], [-0.03, 0.19]]), { pai: cab, prof: 0.005, cor: corCab, z: 0.074, ...op(0.385) }); // costeleta
    }
    if (o.barba) P.peca(sp([[-0.02, 0.15], [0.0, 0.08], [0.04, 0.05], [0.08, 0.04], [0.095, 0.03], [0.09, 0.0], [0.05, -0.015], [-0.03, 0.02], [-0.06, 0.07], [-0.04, 0.14]]), { pai: cab, prof: 0.14, cor: o.barba, ...op(0.45) });
    if (o.oculos) {
      P.peca(F.anel(0.019, 0.015), { pai: cab, prof: 0.006, cor: 0x2b2622, x: 0.082, y: 0.162, z: 0.075, ...op(0.43, { esboco: false }) });
      P.peca(F.ret(0.1, 0.007, 0.003), { pai: cab, prof: 0.006, cor: 0x2b2622, x: 0.012, y: 0.168, z: 0.075, rz: 0.08, ...op(0.43, { esboco: false }) });
    }
    if (o.olhoInchado) P.peca(F.elipse(0.022, 0.016), { pai: cab, prof: 0.004, cor: 0xb8786a, x: 0.075, y: 0.168, z: 0.066, ...op(0.45, { esboco: false }) });
    if (o.machucado) P.peca(F.ret(0.03, 0.006, 0.003), { pai: cab, prof: 0.004, cor: 0x8a2a22, x: 0.07, y: 0.215, z: 0.07, rz: 0.3, ...op(0.45, { esboco: false }) });
    if (o.bebe) {
      const b = P.grupo({ pai: tronco, x: 0.2, y: 0.38, z: 0.12 });
      P.peca(F.elipse(0.14, 0.09), { pai: b, prof: 0.12, cor: o.bebe === true ? 0xf2e2b8 : o.bebe, ...op(0.45) });
      P.peca(F.circulo(0.05), { pai: b, prof: 0.08, cor: pele, x: 0.12, y: 0.05, z: 0.02, ...op(0.47) });
    }
    if (o.chapeu) {
      P.peca(F.ret(0.34, 0.025, 0.012), { pai: cab, prof: 0.3, cor: o.chapeu, x: -0.01, y: 0.27, rz: -0.05, ...op(0.46) });
      P.peca(sp([[-0.1, 0.27], [0.1, 0.27], [0.085, 0.36], [-0.08, 0.37]]), { pai: cab, prof: 0.2, cor: o.chapeu, ...op(0.48) });
    }
    let mala = null;
    if (o.mala) {
      mala = P.grupo({ pai: bracos[1].mao, z: 0.05 });
      P.peca(F.ret(0.4, 0.28, 0.03), { pai: mala, prof: 0.13, cor: o.corMala ?? 0x8a5a34, y: -0.2, ...op(0.5) });
      P.peca(F.ret(0.4, 0.035, 0.015), { pai: mala, prof: 0.14, cor: 0x5a3a22, y: -0.13, ...op(0.55, { esboco: false }) });
      P.peca(F.anel(0.05, 0.032), { pai: mala, prof: 0.03, cor: 0x3a2a1a, y: -0.04, ...op(0.55, { esboco: false }) });
    }
    const malaVis = o.mala ? (Array.isArray(o.mala) ? K(o.mala) : () => 1) : () => 0;

    // trilhas
    const D = o.D ?? 30, mov = o.mov ? K(o.mov.map(([t, x, z]) => [t, [x, z ?? (o.z || 0)]])) : () => [o.x || 0, o.z || 0];
    // distância percorrida (pra fase do passo bater com o chão: pé não escorrega)
    const passo = 1 / 120, dist = [0]; let ant = mov(0);
    for (let t = passo; t <= D + 0.5; t += passo) { const p = mov(t); dist.push(dist[dist.length - 1] + Math.hypot(p[0] - ant[0], p[1] - ant[1])); ant = p; }
    const distEm = (t) => dist[Math.min(dist.length - 1, Math.max(0, Math.round(t / passo)))];
    const dirs = o.dirs || [[0, o.dir ?? 1]];
    const dirEm = (t) => { let d = dirs[0][1], tt = -9, dAnt = d; for (const [tk, v] of dirs) if (tk <= t) { dAnt = d; d = v; tt = tk; } const k = sm((t - tt) / 0.22); return dAnt + (d - dAnt) * k; };
    const poses = (o.poses || [[0, 'normal']]).map(([t, n, dur]) => [t, pega(n), dur ?? 0.35]);
    const voo = o.voo;
    const BOCA = (window.BOCA || {})[o.nome] || null;
    const fase0 = (o.x || 0) * 1.7;
    const S = 1.0; // passada (um ciclo = dois passos)

    P.animar((ts, t) => {
      // posição e andar
      const p = mov(t), pa = mov(Math.max(0, t - 0.05)), pb = mov(t + 0.05);
      const v = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) / 0.1, w = sm(v / 0.35);
      const c = distEm(t) / S + 0.15;
      // pose (mistura da anterior com a atual)
      let i = 0; for (let j = 0; j < poses.length; j++) if (poses[j][0] <= t) i = j;
      const [tp, cur, dp] = poses[i], prev = i > 0 ? poses[i - 1][1] : {}; const kp = i > 0 ? sm((t - tp) / dp) : 1;
      // automático (de pé / andando)
      const pes = [0, 1].map((lado) => {
        const u = ((c + lado * 0.5) % 1 + 1) % 1; let fx, fy, rp = 0;
        if (u < 0.6) { fx = 0.3 * S - (u / 0.6) * 0.6 * S; fy = 0; rp = -0.4 * sm((u - 0.42) / 0.18); }
        else { const q = (u - 0.6) / 0.4; fx = -0.3 * S + 0.6 * S * sm(q); fy = 0.1 * Math.sin(Math.PI * q); rp = -0.4 * (1 - sm(q * 3)) + 0.25 * sm((q - 0.7) / 0.3); }
        const st = lado ? [-0.06, 0] : [0.08, 0];
        return [st[0] + (fx - st[0]) * w, fy * w, rp * w];
      });
      const auto = {
        lean: 0.07 * w, head: 0.03 * Math.sin(ts * 1.2 + fase0) - 0.04 * w,
        sN: 0.06 + (-0.38 * Math.cos(2 * Math.PI * c)) * w + 0.03 * Math.sin(ts * 1.7 + fase0), eN: 0.18 + 0.25 * w * (1 - Math.cos(2 * Math.PI * c)) / 2,
        sF: -0.02 + (0.38 * Math.cos(2 * Math.PI * c)) * w, eF: 0.18 + 0.25 * w * (1 + Math.cos(2 * Math.PI * c)) / 2,
        hipY: 1.06 - w * (0.02 - 0.02 * Math.cos(4 * Math.PI * (c - 0.3))) + 0.006 * Math.sin(ts * 2.2 + fase0),
        rot: 0, ly: 0, osc: 0, bolso: 0, flail: 0, olhosF: 0,
      };
      // IK das pernas no modo automático
      const ik = (fx, fy) => { const dx = fx, dy = fy + 0.08 - auto.hipY; let d = Math.min(0.995, Math.hypot(dx, dy)); const b = Math.atan2(dx, -dy), a = Math.acos(d); return [b + a, -2 * a]; };
      const [tN, kN] = ik(pes[0][0], pes[0][1]), [tF, kF] = ik(pes[1][0], pes[1][1]);
      Object.assign(auto, { tN, kN, tF, kF, pN: pes[0][2], pF: pes[1][2] });
      const q = {};
      for (const k of CH) { const a = prev[k] ?? auto[k], b = cur[k] ?? auto[k]; q[k] = a + (b - a) * kp; }
      // fala: boca pela amplitude do áudio + mão gesticulando
      const fr = BOCA ? BOCA[Math.min(BOCA.length - 1, Math.max(0, Math.round(t * 30)))] || 0 : 0;
      boca.children[0].scale.set(1 + fr * 0.15, 0.3 + fr * 1.25, 1);
      if (fr > 0.05 && !cur.sN && o.gesticula !== false) { q.sN += 0.35 * fr + 0.15 * Math.sin(t * 4.2); q.eN += 0.5 * fr; q.head += 0.06 * Math.sin(t * 7) * fr; }
      if (q.osc) { q.eN += 0.22 * q.osc * Math.sin(t * 13); q.sN += 0.08 * q.osc * Math.sin(t * 6.5); }
      if (q.bolso) { q.eN += 0.25 * q.bolso * Math.sin(t * 16); q.eF += 0.25 * q.bolso * Math.sin(t * 16 + 2); }
      if (q.flail) { q.sN += 0.6 * q.flail * Math.sin(t * 17); q.sF += 0.6 * q.flail * Math.sin(t * 15 + 1); q.kN -= 0.4 * q.flail * Math.abs(Math.sin(t * 13)); q.head += 0.3 * q.flail * Math.sin(t * 11); }
      // aplica
      let x = p[0], y = 0, rot = q.rot;
      if (voo && t > voo.t0) { const k = Math.min(1, (t - voo.t0) / (voo.t1 - voo.t0)); const e = 1 - Math.pow(1 - k, 1.6);
        x += voo.dx * e; y += (voo.h ?? 1) * 4 * k * (1 - k); rot += (voo.giro ?? 0) * sm(k); if (k >= 1) { const b = t - voo.t1; y += Math.abs(Math.sin(b * 9)) * 0.12 * Math.exp(-b * 5); } }
      const dir = dirEm(t);
      g.position.set(x, o.y || 0, p[1]); g.scale.set(s * (Math.abs(dir) < 0.05 ? 0.05 * Math.sign(dir || 1) : dir), s, s);
      giro.rotation.z = rot; giro.position.y = 1.2 + q.ly + y;
      pelve.position.y = q.hipY; tronco.rotation.z = -q.lean;
      pernas[0].coxa.rotation.z = q.tN; pernas[0].joelho.rotation.z = q.kN; pernas[0].tor.rotation.z = -(q.tN + q.kN) + q.pN;
      pernas[1].coxa.rotation.z = q.tF; pernas[1].joelho.rotation.z = q.kF; pernas[1].tor.rotation.z = -(q.tF + q.kF) + q.pF;
      bracos[0].omb.rotation.z = q.sN; bracos[0].cot.rotation.z = q.eN; bracos[1].omb.rotation.z = q.sF; bracos[1].cot.rotation.z = q.eF;
      pesc.rotation.z = q.lean * 0.5; cab.rotation.z = q.head;
      if (mala) { mala.rotation.z = -(rot - q.lean + q.sF + q.eF); mala.visible = malaVis(t) > 0.5; }
      const pis = ((t + fase0 * 0.3) % 3.3) < 0.11 || q.olhosF > 0.5; olho.children[0].scale.y = pis ? 0.15 : 1;
      sob.children[0].rotation.z = fr * 0.1; 
      if (cab.userData.cabelo && o.vento) cab.userData.cabelo.rotation.z = (typeof o.vento === 'function' ? o.vento(t) : o.vento) * (0.35 + 0.2 * Math.sin(t * 23));
    });
    g.userData.cab = cab; g.userData.mao = bracos[0].mao;
    return g;
  };
};

// Props da série "A garota que caiu do céu" (Juliane Koepcke, 1971). Carregado depois do lib.js e do ator.js.
// window.JULI(P, L) acrescenta: fichas dos personagens, avião LANSA, fileira de poltronas, cabine, nuvens de tempestade,
// raio, floresta (de lado e vista de cima), rio, presente e mapa.
window.JULI = (P, L) => {
  const { F, THREE } = P;
  const FX = { t: -1, entra: 'fixo', esboco: false };
  const LARANJA = 0xc4642a, LARANJA2 = 0x9a4a20;
  // fichas fixas (continuidade): iguais em todos os episódios
  L.JU = { nome: 'juliane', s: 0.94, cabelo: 0x8a6440, cabeloLongo: true, oculos: true, roupa: 0x9cc8e6, saia: 0x9cc8e6, saiaH: 0.42,
    semManga: true, calca: 0xe9b98e, sapato: 0xf4efe6 };
  L.JU_FERIDA = Object.assign({}, L.JU, { oculos: false, roupa: 0x8fa6b4, saia: 0x86a2b0, descalco: true });
  L.MAE = { nome: 'mae', s: 0.95, cabelo: 0x2a211b, coque: true, roupa: 0xeee4cf, saia: 0x3a4050, calca: 0xe9b98e, sapato: 0x3a2a20 };
  L.FX = FX;
  L.PAI = { nome: 'pai', cabelo: 0xb5afa4, barba: 0xa9a399, roupa: 0xb8a57a, calca: 0x6a5a40, sapato: 0x4a3a2a };
  L.JU_ANDA = Object.assign({}, L.JU_FERIDA, { poses: [[0, 'ombro_quebrado']], olhoInchado: true, folhaPerna: true });
  L.sandalia = (pai, o) => P.peca(F.ret(0.24, 0.06, 0.03), Object.assign({ pai, prof: 0.1, cor: 0xf4efe6, x: 0.05, y: -0.04, z: 0.04, rz: -0.3 }, o));
  L.riacho = (o = {}) => { // água marrom deitada + reflexos andando
    const g = P.grupo({ x: o.x || 0, z: o.z || 0 });
    P.deitado(F.ret(o.w ?? 12, o.larg ?? 1.6, 0.05), { pai: g, prof: 0.02, cor: o.cor ?? 0x3f6670, y: 0.02, ...FX });
    const r = P.fixo(o.semente ?? 3), rs = [];
    for (let i = 0; i < 40; i++) rs.push([P.deitado(F.elipse(0.05 + r() * 0.12, 0.012 + r() * 0.02), { pai: g, prof: 0.01, cor: [0x6f9aa0, 0x86aeb2][i % 2], x: -5 + r() * 10, y: 0.04, z: (r() - 0.5) * (o.larg ?? 1.6) * 0.9, ...FX }), r()]);
    P.animar((ts, t) => rs.forEach(([p, k]) => { p.position.x = ((-5 + k * 10 + t * (o.v ?? 0.4)) + 6) % 12 - 6; }));
    return g;
  };
  L.CAM = (ks) => P.camera(ks.map(([t, pos, alvo]) => ({ t, pos, alvo })));
  L.chao = (cor = 0x8f8678, z = 0.6, w = 1.6, x = 0, larg = 9) => P.deitado(F.ret(larg, w, 0.02), { prof: 0.01, cor, x, z, ...FX });

  // ---------- avião: turbo-hélice quadrimotor branco, faixa azul, LANSA, janelas redondas (bico pra +x) ----------
  L.aviaoLansa = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 2.5, z: o.z ?? -1.5, pai: o.pai }); g.scale.setScalar(o.s ?? 1);
    const corpo = P.grupo({ pai: g }), tras = P.grupo({ pai: g }), asa = P.grupo({ pai: g, x: 0.2, y: -0.12, z: 0.12 });
    // fuselagem em duas metades (pra poder se partir)
    P.peca(F.poligono([[-0.2, -0.22], [1.55, -0.22], [1.95, -0.12], [2.1, 0.02], [1.95, 0.16], [1.6, 0.25], [-0.2, 0.26]]), { pai: corpo, prof: 0.16, cor: 0xf4f1ea, ...FX });
    P.peca(F.poligono([[1.6, 0.24], [1.95, 0.15], [2.02, 0.06], [1.72, 0.08]]), { pai: corpo, prof: 0.17, cor: 0x3a4a5c, ...FX }); // cabine
    P.peca(F.ret(1.95, 0.07, 0.01), { pai: corpo, prof: 0.17, cor: 0x2f5d9a, x: 0.8, y: -0.02, ...FX }); // faixa
    P.peca(F.poligono([[-2.0, -0.18], [-0.2, -0.22], [-0.2, 0.26], [-1.7, 0.24], [-2.2, 0.8], [-2.5, 0.82], [-2.35, 0.2], [-2.3, 0.0]]), { pai: tras, prof: 0.16, cor: 0xf4f1ea, ...FX });
    P.peca(F.ret(1.9, 0.07, 0.01), { pai: tras, prof: 0.17, cor: 0x2f5d9a, x: -1.15, y: -0.02, ...FX });
    P.peca(F.poligono([[-2.2, 0.8], [-2.5, 0.82], [-2.36, 0.38], [-2.1, 0.4]]), { pai: tras, prof: 0.17, cor: 0x2f5d9a, ...FX }); // leme azul
    P.peca(F.poligono([[-2.3, 0.1], [-1.9, 0.1], [-2.45, -0.05]]), { pai: tras, prof: 0.18, cor: 0xd9d4ca, z: 0.08, ...FX });
    for (let i = 0; i < 11; i++) P.peca(F.circulo(0.045), { pai: i < 6 ? corpo : tras, prof: 0.17, cor: 0x33475a, x: 1.35 - i * 0.27, y: 0.12, ...FX });
    if (o.letreiro !== false) P.texto('LANSA', { pai: tras, tam: 0.28, prof: 0.02, cor: 0x2f5d9a, x: -1.1, y: -0.17, z: 0.09, ...FX, passo: 0 });
    // asa + 2 motores visíveis com hélice girando
    P.peca(F.poligono([[-0.45, 0.02], [0.55, 0.02], [0.15, -0.12], [-0.7, -0.12]]), { pai: asa, prof: 0.05, cor: 0xd9d4ca, ...FX });
    const helices = [];
    [[0.3, 0.06], [-0.25, 0.12]].forEach(([x, z]) => {
      P.peca(F.ret(0.5, 0.13, 0.05), { pai: asa, prof: 0.1, cor: 0xe6e2da, x, y: 0.0, z, ...FX });
      helices.push(P.peca(F.ret(0.035, 0.55, 0.01), { pai: asa, prof: 0.01, cor: 0x3a3330, x: x + 0.28, y: 0.0, z: z + 0.06, ...FX }));
    });
    P.animar((ts, tt) => { helices.forEach((h, i) => (h.children[0].scale.y = Math.cos(tt * 45 + i))); if (o.mov) { const [x, y, r] = o.mov(tt); g.position.x = x; g.position.y = y; g.rotation.z = r || 0; } });
    g.userData = { corpo, tras, asa };
    return g;
  };

  // ---------- fileira de poltronas de 1971 vista de lado (encosto + assento + braço), 3 lugares em profundidade ----------
  L.poltrona = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai, rz: o.rz || 0 });
    const cor = o.cor ?? LARANJA;
    P.peca(F.ret(0.28, 1.15, 0.1), { pai: g, prof: 0.42, cor, x: -0.3, y: 1.12, rz: 0.1, ...FX }); // encosto
    P.peca(F.ret(0.2, 0.22, 0.06), { pai: g, prof: 0.42, cor: 0xe8e0cc, x: -0.27, y: 1.62, z: 0.005, rz: 0.1, ...FX }); // capinha do encosto
    P.peca(F.ret(0.72, 0.2, 0.08), { pai: g, prof: 0.44, cor, x: 0.0, y: 0.6, ...FX }); // assento
    P.peca(F.ret(0.08, 0.5, 0.02), { pai: g, prof: 0.3, cor: 0x7a7a80, x: -0.05, y: 0.25, ...FX }); // pé
    P.peca(F.ret(0.6, 0.07, 0.03), { pai: g, prof: 0.3, cor: 0x6a6a70, x: 0.0, y: 0.03, ...FX });
    if (o.braco !== false) P.peca(F.ret(0.55, 0.07, 0.03), { pai: g, prof: 0.05, cor: LARANJA2, x: 0.02, y: 0.86, z: -0.24, ...FX }); // braço do lado de trás (o da frente ficaria atravessando quem senta)
    return g;
  };
  // fileira de 3 (grupo); o.ocupada = ator(es) dentro: [{...ficha, lugar: 0..2}]
  L.fileira = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai, rx: o.rx || 0, ry: o.ry || 0, rz: o.rz || 0 });
    const lug = [];
    for (let i = 0; i < 3; i++) lug.push(L.poltrona({ pai: g, z: -0.5 + i * 0.5, cor: i === 0 ? LARANJA : i === 1 ? 0xb85a26 : 0xa85222 }));
    (o.gente || []).forEach((a) => L.ator(Object.assign({ x: 0.12, z: -0.5 + (a.lugar ?? 0) * 0.5 + 0.29, D: o.D ?? 30, t: -1, pai: g, poses: [[0, 'sentado']] }, a)));
    if (o.cinto) P.peca(F.ret(0.36, 0.06, 0.01), { pai: g, prof: 0.02, cor: 0xb8b2a6, x: 0.08, y: 0.78, z: -0.5 + (o.cinto - 1) * 0.5 + 0.42, ...FX });
    return g;
  };

  // ---------- céu de tempestade ----------
  L.nuvemTemp = (o = {}) => P.peca(F.nuvem(o.w ?? 2.4, o.h ?? 1.0), { prof: 0.06, cor: o.cor ?? 0x4a5468, x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai, ...FX });
  L.raio = (o = {}) => { // relâmpago em zigue-zague que pisca nos instantes o.ts
    const r = P.fixo(o.semente ?? 4), pts = [[0, 0]]; let x = 0, y = 0;
    for (let i = 0; i < 6; i++) { x += (r() - 0.5) * 0.7; y -= 0.35 + r() * 0.25; pts.push([x, y]); }
    const esq = pts.map(([a, b], i) => [a - 0.05 + (i % 2) * 0.03, b]), dir = pts.map(([a, b]) => [a + 0.06, b]).reverse();
    const m = P.peca(F.poligono([...esq, ...dir]), { prof: 0.02, cor: 0xfdf8e6, x: o.x || 0, y: o.y ?? 3, z: o.z ?? -2, pai: o.pai, ...FX });
    m.scale.setScalar(o.s ?? 1);
    P.animar((ts, t) => { m.visible = (o.ts || []).some((a) => t > a && t < a + 0.12); });
    return m;
  };

  // ---------- floresta ----------
  const VERDES = [0x1f4a2c, 0x2a5e34, 0x37733f, 0x4c8a4a, 0x67a35a];
  L.arvoreAlta = (o = {}) => { // tronco alto + copa lá em cima + cipó
    const g = P.grupo({ x: o.x || 0, z: o.z || 0 }); const h = o.h ?? 6, r = P.fixo(o.semente ?? Math.round((o.x || 0) * 13 + 50));
    P.peca(F.poligono([[-0.22, 0], [0.22, 0], [0.16, h], [-0.16, h]]), { pai: g, prof: 0.14, cor: o.tronco ?? 0x5a3e2a, ...FX });
    P.peca(F.poligono([[-0.5, 0], [-0.2, 0], [-0.18, 0.8]]), { pai: g, prof: 0.1, cor: 0x4a3222, ...FX }); // sapopema
    P.peca(F.poligono([[0.5, 0], [0.2, 0], [0.18, 0.7]]), { pai: g, prof: 0.1, cor: 0x4a3222, ...FX });
    for (let i = 0; i < 3; i++) P.peca(F.nuvem(2.2 + r(), 1.2), { pai: g, prof: 0.1, cor: VERDES[(i + (o.tom ?? 0)) % 5], x: (r() - 0.5) * 1.2, y: h + i * 0.35, z: 0.03 * i, ...FX });
    if (o.cipo !== false) P.peca(F.ret(0.025, h * 0.8, 0.01), { pai: g, prof: 0.02, cor: 0x3f5a2a, x: 0.45, y: h * 0.55, z: 0.1, rz: 0.04, ...FX });
    return g;
  };
  L.folhaGrande = (o = {}) => { // folha de primeiro plano (bananeira / costela)
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, rz: o.rz || 0 });
    P.peca(F.elipse(0.9 * (o.s ?? 1), 0.32 * (o.s ?? 1)), { pai: g, prof: 0.03, cor: o.cor ?? 0x3f7f45, ...FX });
    P.peca(F.ret(1.7 * (o.s ?? 1), 0.025, 0.01), { pai: g, prof: 0.035, cor: 0x9ccf6e, ...FX });
    P.animar((ts) => { g.rotation.z = (o.rz || 0) + Math.sin(ts * 1.3 + (o.x || 0)) * 0.03; });
    return g;
  };
  // floresta de lado: camadas de árvores (fundo escuro -> frente)
  L.floresta = (o = {}) => {
    P.peca(F.ret(12, 10, 0.02), { prof: 0.03, cor: o.fundo ?? 0x1d3a26, y: 3.5, z: -4.2, ...FX });
    const r = P.fixo(o.semente ?? 9);
    for (let c = 0; c < 3; c++) for (let i = 0; i < 6; i++) L.arvoreAlta({ x: -5 + i * 2 + r() * 0.8, z: -3.6 + c * 1.1, h: 5.5 + r() * 2.5, tom: c, semente: c * 10 + i, cipo: r() > 0.4 });
    L.chao(0x4a3a28, 1.6, 10, 0, 18);
    const rr = P.fixo(31);
    for (let i = 0; i < 26; i++) P.deitado(F.elipse(0.25 + rr() * 0.2, 0.1), { prof: 0.01, cor: [0x7a5a32, 0x5a6a2a, 0x8a6a3a][i % 3], x: -3.5 + rr() * 7, z: -1.5 + rr() * 3, ry: rr() * 3, ...FX });
  };
  // copa vista de cima (cobre a folha toda; câmera olhando pra baixo)
  L.copas = (o = {}) => {
    const r = P.fixo(o.semente ?? 3), n = o.n ?? 140, larg = o.larg ?? 12, prof = o.profund ?? 16;
    P.deitado(F.ret(larg + 2, prof + 2, 0.02), { prof: 0.01, cor: 0x18331f, y: 0.0, ...FX });
    for (let i = 0; i < n; i++) {
      const x = (r() - 0.5) * larg, z = (r() - 0.5) * prof;
      if (o.rio && Math.abs(z - o.rio(x)) < 0.45) continue;
      const g = P.grupo({ x, y: 0.02 + r() * 0.12, z });
      P.deitado(F.nuvem(0.9 + r() * 0.7, 0.8 + r() * 0.5), { pai: g, prof: 0.05, cor: VERDES[Math.floor(r() * 5)], ry: r() * 6, ...FX });
      P.deitado(F.circulo(0.18 + r() * 0.12), { pai: g, prof: 0.03, cor: 0x7fb25e, x: 0.1, y: 0.05, ...FX });
    }
    if (o.rio) { // faixa marrom serpenteando
      const pts = [], n2 = 40; for (let i = 0; i <= n2; i++) { const x = -larg / 2 + (i / n2) * larg; pts.push([x, -(o.rio(x) + 0.32)]); }
      for (let i = n2; i >= 0; i--) { const x = -larg / 2 + (i / n2) * larg; pts.push([x, -(o.rio(x) - 0.32)]); }
      P.deitado(F.poligono(pts), { prof: 0.02, cor: o.corRio ?? 0x4f6f78, y: 0.03, ...FX });
      const rb = []; for (let i = 0; i < 26; i++) rb.push([P.deitado(F.elipse(0.04 + (i % 4) * 0.03, 0.015), { prof: 0.01, cor: 0x7aa4aa, y: 0.05, ...FX }), r()]);
      P.animar((ts, t) => rb.forEach(([p, k]) => { const x = ((k * larg + t * 0.35) % larg) - larg / 2; p.position.x = x; p.position.z = o.rio(x) + (((k * 7.3) % 1) - 0.5) * 0.45; p.rotation.y = -Math.atan(Math.cos(x * 0.55) * 0.77); }));
    }
  };
  L.neblina = (o = {}) => { // nuvens claras passando devagar
    const r = P.fixo(o.semente ?? 6), bits = [];
    for (let i = 0; i < (o.n ?? 7); i++) bits.push([P.deitado(F.nuvem(1.4 + r() * 1.2, 0.6 + r() * 0.5), { prof: 0.02, cor: 0xc4d2c6, x: -5 + r() * 10, y: (o.y ?? 0.6) + r() * 0.3, z: -5 + r() * 10, ...FX }), r()]);
    P.animar((ts, t) => bits.forEach(([b, k]) => { b.position.x = ((-5 + k * 10 + t * (0.15 + k * 0.2)) + 6) % 12 - 6; }));
  };

  // parede da cabine com furo redondo: o céu e as nuvens ficam ATRÁS da parede (nada vaza pra fora da janela)
  L.paredeJanela = (o = {}) => {
    const jx = o.jx ?? 0.55, jy = o.jy ?? 2.15, w = o.w ?? 9, r = o.r ?? 0.38;
    const sh = F.ret(w, 5, 0.04), furo = new THREE.Path(); furo.absarc(jx, jy - 2.0, r, 0, Math.PI * 2, true); sh.holes.push(furo);
    P.peca(sh, { prof: 0.04, cor: o.cor ?? 0xe8e2d4, y: 2.0, z: -1.2, ...FX });
    P.peca(F.anel(r + 0.12, r), { prof: 0.06, cor: 0xcfc8b8, x: jx, y: jy, z: -1.16, ...FX });
    P.peca(F.ret(1.4, 1.4, 0.02), { prof: 0.01, cor: o.ceu ?? 0x8cc3e8, x: jx, y: jy, z: -1.5, ...FX });
    return P.grupo({ x: jx, y: jy, z: -1.42 }); // pai pras nuvens (entre o céu e a parede)
  };

  // ---------- presentes e objetos ----------
  L.presente = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai, rz: o.rz || 0 }); const s = o.s ?? 0.3, cor = o.cor ?? 0x2f7a4a;
    P.caixa(s, s * 0.8, s, { pai: g, cor, ...FX });
    P.caixa(s * 0.16, s * 0.82, s * 1.02, { pai: g, cor: o.fita ?? 0xc93a2e, ...FX });
    P.caixa(s * 1.02, s * 0.82, s * 0.16, { pai: g, cor: o.fita ?? 0xc93a2e, ...FX });
    P.peca(F.estrela(s * 0.3, s * 0.12, 4), { pai: g, prof: 0.03, cor: o.fita ?? 0xc93a2e, y: s * 0.45, ...FX });
    return g;
  };
  L.cartao = (linhas, o = {}) => P.impresso(o.w ?? 3.2, o.h ?? 1.4, (g, w, h) => { // cartão de papel com texto
    g.fillStyle = o.fundo ?? '#fbf6ea'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2b2622'; g.textAlign = 'center'; g.textBaseline = 'middle';
    linhas.forEach(([txt, tam, cor], i) => { g.font = `bold ${tam * h}px Georgia, serif`; g.fillStyle = cor ?? '#2b2622'; g.fillText(txt, w / 2, h * (o.ys ? o.ys[i] : (i + 0.5) / linhas.length)); });
  }, Object.assign({ x: 0, y: 1.6, z: 0.4 }, o));

  // ---------- ep. 4 ----------
  // cabana de palafita aberta na frente; devolve o grupo do assoalho (pai pra quem deita/senta lá dentro, y = 0 no piso)
  L.cabana = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0 }); const hp = o.piso ?? 0.7, w = o.w ?? 3.4;
    [-w / 2 + 0.1, w / 2 - 0.1].forEach((x) => [-0.7, 0.55].forEach((z) => P.caixa(0.1, hp + 2.4, 0.1, { pai: g, x, y: (hp + 2.4) / 2, z, cor: 0x5a4028, ...FX })));
    P.caixa(w, 0.1, 1.5, { pai: g, y: hp - 0.05, z: -0.05, cor: 0x8a6a42, ...FX });
    for (let i = 0; i < 9; i++) P.caixa(0.04, 2.3, 0.02, { pai: g, x: -w / 2 + 0.2 + i * (w - 0.4) / 8, y: hp + 1.15, z: -0.78, cor: 0x7a5a36, ...FX });
    P.peca(F.ret(w, 2.3, 0.02), { pai: g, prof: 0.02, cor: 0x9a7a4c, y: hp + 1.15, z: -0.82, ...FX });
    P.peca(F.poligono([[-w / 2 - 0.4, 0], [w / 2 + 0.4, 0], [w / 2 - 0.2, 0.9], [-w / 2 + 0.2, 0.9]]), { pai: g, prof: 1.8, cor: 0xa88a48, y: hp + 2.3, z: -0.1, ...FX });
    for (let i = 0; i < 14; i++) P.peca(F.ret(0.03, 0.9, 0.01), { pai: g, prof: 0.01, cor: 0x7a6230, x: -w / 2 - 0.2 + i * (w + 0.4) / 13, y: hp + 2.7, z: 0.81, rz: 0.1, ...FX });
    return P.grupo({ pai: g, y: hp, z: 0.0 });
  };
  // canoa de tronco; devolve o grupo (pai pros atores sentados lá dentro)
  L.canoa = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 0.05, z: o.z || 0 }); const w = o.w ?? 4.2;
    P.peca(F.poligono([[-w / 2, 0.35], [w / 2, 0.35], [w / 2 - 0.35, 0], [-w / 2 + 0.45, 0]]), { pai: g, prof: 0.6, cor: 0x6a4a2a, ...FX });
    P.peca(F.ret(w - 0.2, 0.05, 0.01), { pai: g, prof: 0.62, cor: 0x8a6a42, y: 0.33, ...FX });
    P.animar((ts) => { g.position.y = (o.y ?? 0.05) + Math.sin(ts * 2.1) * 0.02; g.rotation.z = Math.sin(ts * 1.3) * 0.015; });
    return g;
  };
  // remo na mão
  L.remo = (pai, op) => { P.peca(F.ret(0.05, 1.3, 0.01), Object.assign({ pai, prof: 0.04, cor: 0x7a5a36, y: -0.35 }, op)); P.peca(F.elipse(0.08, 0.22), Object.assign({ pai, prof: 0.03, cor: 0x7a5a36, y: -0.95 }, op)); };
  // quarto de hospital: parede, janela, cama; devolve o grupo do colchão (y = 0 em cima do colchão)
  L.hospital = (o = {}) => {
    P.peca(F.ret(12, 7, 0.02), { prof: 0.03, cor: 0xcfe0d4, y: 3.0, z: -1.6, ...FX });
    P.peca(F.ret(12, 0.5, 0.02), { prof: 0.04, cor: 0x9fb8a8, y: 0.25, z: -1.55, ...FX });
    P.peca(F.ret(1.4, 1.2, 0.02), { prof: 0.04, cor: 0xbfe0f0, x: 1.4, y: 2.4, z: -1.55, ...FX });
    P.peca(F.ret(0.05, 1.2, 0.01), { prof: 0.05, cor: 0xffffff, x: 1.4, y: 2.4, z: -1.52, ...FX });
    L.chao(0xd8d0c0, 0.5, 6, 0, 14);
    const g = P.grupo({ x: o.x ?? -0.6, z: o.z ?? -0.4 });
    P.caixa(2.3, 0.08, 1.0, { pai: g, y: 0.62, cor: 0xb8bcc0, ...FX });
    [-1.05, 1.05].forEach((x) => P.caixa(0.06, 0.62, 0.06, { pai: g, x, y: 0.31, z: 0.4, cor: 0x9a9ea4, ...FX }));
    P.caixa(0.08, 1.1, 1.0, { pai: g, x: -1.15, y: 0.75, cor: 0xb8bcc0, ...FX });
    P.caixa(2.2, 0.16, 0.95, { pai: g, y: 0.74, cor: 0xf4f4f0, ...FX });
    return P.grupo({ pai: g, y: 0.82 });
  };
  // bonequinho de papel simples (pras 92 pessoas)
  L.pessoinha = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0 });
    P.peca(F.circulo(0.07), { pai: g, prof: 0.02, cor: o.cor ?? 0xd8d0c0, y: 0.3, ...FX });
    P.peca(F.poligono([[-0.09, 0], [0.09, 0], [0.07, 0.22], [-0.07, 0.22]]), { pai: g, prof: 0.02, cor: o.cor ?? 0xd8d0c0, ...FX });
    return g;
  };
};

// Cenário mais real pra série (carregado depois do lib_juli.js): floresta em camadas com folhas de verdade,
// samambaias, cipós curvos, raios de luz; cabine de avião de 1971 com poltronas estofadas e janelas ovais.
window.REAL = (P, L) => {
  const { F, THREE } = P;
  const FX = { t: -1, entra: 'fixo', esboco: false };
  const esc = (c, f) => new THREE.Color(c).multiplyScalar(f).getHex();
  const sp = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); s.splineThru(pts.slice(1).concat([pts[0]]).map((p) => new THREE.Vector2(p[0], p[1]))); return s; };
  L.sp = sp;
  // folha pontuda (forma de lança), com nervura no meio; comp = comprimento, larg = largura
  const folhaForma = (comp, larg) => sp([[0, 0], [comp * 0.25, larg * 0.5], [comp * 0.6, larg * 0.42], [comp, 0], [comp * 0.6, -larg * 0.42], [comp * 0.25, -larg * 0.5]]);
  L.folha = (o = {}) => {
    const g = P.grupo({ pai: o.pai, x: o.x || 0, y: o.y || 0, z: o.z || 0, rz: o.rz || 0 });
    const c = o.comp ?? 0.6, l = o.larg ?? 0.22, cor = o.cor ?? 0x3f7f45;
    P.peca(folhaForma(c, l), { pai: g, prof: 0.012, cor, ...FX });
    P.peca(F.poligono([[0.02, -0.006], [c * 0.95, -0.002], [c * 0.95, 0.002], [0.02, 0.006]]), { pai: g, prof: 0.014, cor: esc(cor, 1.35), z: 0.002, ...FX });
    if (o.veias !== false) for (let i = 1; i < 5; i++) { const x = c * i / 5.5; [1, -1].forEach((s) => P.peca(F.poligono([[x, 0], [x + c * 0.12, s * l * 0.33], [x + c * 0.12 + 0.006, s * l * 0.33], [x + 0.008, 0]]), { pai: g, prof: 0.014, cor: esc(cor, 1.18), z: 0.002, ...FX })); }
    return g;
  };
  // folha grande de primeiro plano balançando (substitui a elipse)
  L.folhaGrande = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, rz: o.rz || 0 }); const s = o.s ?? 1;
    L.folha({ pai: g, comp: 1.8 * s, larg: 0.62 * s, cor: o.cor ?? 0x3f7f45, x: -0.9 * s });
    P.animar((ts) => { g.rotation.z = (o.rz || 0) + Math.sin(ts * 1.3 + (o.x || 0)) * 0.03; });
    return g;
  };
  // samambaia: várias frondes em leque, cada uma com folíolos
  L.samambaia = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0 }); g.scale.setScalar(o.s ?? 1); const r = P.fixo(o.semente ?? 5);
    const cor = o.cor ?? 0x4c8a4a;
    for (let k = 0; k < 7; k++) {
      const a = -1.1 + k * 0.37 + (r() - 0.5) * 0.15, fr = P.grupo({ pai: g, z: (k % 3 - 1) * 0.03, rz: a });
      const len = 0.9 + r() * 0.4, c2 = k % 2 ? cor : esc(cor, 0.82);
      P.peca(F.poligono([[-0.008, 0], [0.008, 0], [0.003, len], [-0.003, len]]), { pai: fr, prof: 0.01, cor: esc(c2, 0.8), ...FX });
      for (let i = 1; i < 12; i++) { const y = len * i / 12, w = 0.2 * Math.sin(Math.PI * (1 - i / 12) * 0.9 + 0.2);
        [1, -1].forEach((s) => P.peca(sp([[0, 0], [s * w * 0.5, 0.025], [s * w, 0.04], [s * w * 0.5, -0.005]]), { pai: fr, prof: 0.008, cor: c2, y, ...FX })); }
      P.animar((ts) => { fr.rotation.z = a + Math.sin(ts * 1.1 + k) * 0.025; });
    }
    return g;
  };
  // cipó curvo pendurado entre dois pontos (catenária de papel)
  L.cipo = (o) => {
    const [x0, y0] = o.a, [x1, y1] = o.b, n = 20, pts = [], back = [], qu = o.queda ?? 0.8, w = o.w ?? 0.02;
    for (let i = 0; i <= n; i++) { const k = i / n, x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k - qu * 4 * k * (1 - k); pts.push([x, y + w]); back.unshift([x, y - w]); }
    P.peca(F.poligono(pts.concat(back)), { prof: 0.015, cor: o.cor ?? 0x4a5a2a, z: o.z ?? 0, ...FX });
  };
  // árvore de tronco afinando com casca, sapopemas curvas e copa de muitas camadas de folhas
  L.arvoreAlta = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0 }); const h = o.h ?? 6, r = P.fixo(o.semente ?? Math.round((o.x || 0) * 13 + 50));
    const tom = o.tom ?? 0, cT = o.tronco ?? [0x5a4030, 0x4a3628, 0x3a2c22][tom % 3], wb = o.larg ?? 0.24;
    P.peca(sp([[-wb, 0], [-wb * 0.8, h * 0.3], [-wb * 0.62, h * 0.7], [-wb * 0.55, h + 0.2], [wb * 0.55, h + 0.2], [wb * 0.6, h * 0.65], [wb * 0.78, h * 0.25], [wb, 0]]), { pai: g, prof: 0.16, cor: cT, ...FX });
    for (let i = 0; i < 5; i++) { const x = (r() - 0.5) * wb * 1.1; P.peca(F.poligono([[x - 0.012, 0.2], [x + 0.012, 0.2], [x * 0.7 + 0.008, h * (0.5 + r() * 0.4)], [x * 0.7 - 0.008, h * (0.5 + r() * 0.4)]]), { pai: g, prof: 0.004, cor: esc(cT, 0.75), z: 0.085, ...FX }); }
    if (o.musgo !== false) P.peca(sp([[-wb * 0.9, 0.1], [-wb * 0.5, 0.9], [-wb * 0.2, 1.4], [-wb * 0.6, 0.4]]), { pai: g, prof: 0.004, cor: 0x5f7a3a, z: 0.086, ...FX });
    [[-1, 0.62], [1, 0.55]].forEach(([s, hh]) => P.peca(sp([[s * wb * 0.6, hh * 1.3], [s * wb * 1.3, 0.35], [s * wb * 2.6, 0.02], [s * wb * 0.5, 0.0]]), { pai: g, prof: 0.1, cor: esc(cT, 0.85), z: 0.02, ...FX }));
    const VER = [0x1c4128, 0x24502e, 0x2f6237, 0x3e7542, 0x52894c];
    for (let i = 0; i < 9; i++) { const ang = r() * Math.PI * 2, rad = 0.5 + r() * 0.8; const x = Math.cos(ang) * rad * 1.3, y = h + 0.3 + Math.sin(ang) * rad * 0.55 + i * 0.05;
      const cor = VER[(i + tom) % 5];
      P.peca(F.nuvem(1.0 + r() * 0.7, 0.55 + r() * 0.3), { pai: g, prof: 0.06, cor, x, y, z: 0.02 * (i % 4), ...FX });
      for (let j = 0; j < 4; j++) L.folha({ pai: g, comp: 0.35, larg: 0.13, cor: esc(cor, 1.15), x: x + (r() - 0.5) * 0.9, y: y - 0.2 - r() * 0.2, z: 0.1, rz: -1.2 - r() * 0.8, veias: false }); }
    if (o.cipo !== false) L.cipo({ a: [(o.x || 0) + 0.35, h * 0.95], b: [(o.x || 0) + 1.3, h * 0.55], queda: 0.6, z: (o.z || 0) + 0.12 });
    return g;
  };
  // raios de luz entrando entre as copas (faixas claras transparentes)
  L.raiosLuz = (o = {}) => {
    const r = P.fixo(o.semente ?? 12);
    for (let i = 0; i < (o.n ?? 4); i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.35 + r() * 0.4, 9), new THREE.MeshBasicMaterial({ color: o.cor ?? 0xfff2c8, transparent: true, opacity: (o.op ?? 0.12) * (0.6 + r() * 0.6), depthWrite: false }));
      m.position.set((o.x ?? 0) - 2.5 + i * 1.6 + r() * 0.5, 3.6, (o.z ?? -1.0) + r() * 1.4); m.rotation.z = 0.32; P.fg.add(m);
    }
  };
  // floresta de lado: fundo com neblina + 3 camadas de árvores + chão com folhas secas + plantas baixas
  L.floresta = (o = {}) => {
    P.peca(F.ret(14, 10, 0.02), { prof: 0.03, cor: o.fundo ?? 0x24402c, y: 3.5, z: -4.6, ...FX });
    const r = P.fixo(o.semente ?? 9);
    for (let i = 0; i < 9; i++) P.peca(sp([[-0.12, 0], [0.12, 0], [0.08, 8], [-0.08, 8]]), { prof: 0.02, cor: 0x3c5a44, x: -6 + i * 1.5 + r(), y: 0, z: -4.4, ...FX }); // troncos sumindo na névoa
    for (let c = 0; c < 3; c++) for (let i = 0; i < 6; i++) L.arvoreAlta({ x: -5 + i * 2 + r() * 0.8, z: -3.6 + c * 1.1, h: 5.5 + r() * 2.5, tom: c, semente: c * 10 + i, cipo: r() > 0.5, larg: 0.18 + c * 0.05 });
    P.peca(F.ret(18, 1.5, 0.02), { prof: 0.02, cor: 0x2a3a2a, y: 0.75, z: -3.95, ...FX }); // esconde o rolo do bloco lá atrás
    L.chao(0x4a3a28, 1.6, 10, 0, 18);
    P.deitado(F.ret(18, 4, 0.02), { prof: 0.01, cor: 0x3e3022, z: -2.6, ...FX });
    const rr = P.fixo(31);
    for (let i = 0; i < 70; i++) P.deitado(folhaForma(0.14 + rr() * 0.1, 0.06), { prof: 0.006, cor: [0x7a5a32, 0x5a4a22, 0x8a6a3a, 0x6a4a2a][i % 4], x: -4 + rr() * 8, y: 0.01 + rr() * 0.01, z: -3.5 + rr() * 4.5, ry: rr() * 6, ...FX });
    for (let i = 0; i < 6; i++) L.samambaia({ x: -4.5 + i * 1.8 + rr() * 0.6, z: -2.9 + rr() * 0.6, s: 0.7 + rr() * 0.4, semente: i, cor: [0x4c8a4a, 0x3a7440][i % 2] });
    if (o.luz !== false) L.raiosLuz({ z: -2.2 });
  };
  // ---------- cabine de avião anos 70 ----------
  L.poltrona = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai, rz: o.rz || 0 });
    const cor = o.cor ?? 0xc4642a, esc2 = esc(cor, 0.78);
    P.peca(sp([[-0.18, 0.62], [-0.08, 0.66], [-0.12, 1.2], [-0.2, 1.72], [-0.3, 1.8], [-0.42, 1.74], [-0.38, 1.2], [-0.33, 0.66]]), { pai: g, prof: 0.42, cor, ...FX }); // encosto estofado
    P.peca(sp([[-0.24, 1.6], [-0.18, 1.72], [-0.3, 1.82], [-0.42, 1.76], [-0.4, 1.6]]), { pai: g, prof: 0.425, cor: 0xece4d0, ...FX }); // capinha
    P.peca(sp([[-0.34, 0.52], [0.36, 0.56], [0.4, 0.64], [0.3, 0.7], [-0.3, 0.68]]), { pai: g, prof: 0.44, cor, ...FX }); // assento
    P.peca(sp([[-0.3, 0.52], [0.34, 0.54], [0.3, 0.46], [-0.28, 0.44]]), { pai: g, prof: 0.4, cor: esc2, ...FX });
    P.peca(F.ret(0.07, 0.46, 0.02), { pai: g, prof: 0.3, cor: 0x7a7a80, x: 0.0, y: 0.22, ...FX });
    P.peca(F.ret(0.6, 0.06, 0.03), { pai: g, prof: 0.3, cor: 0x6a6a70, x: 0.0, y: 0.03, ...FX });
    if (o.braco !== false) P.peca(F.ret(0.5, 0.06, 0.03), { pai: g, prof: 0.05, cor: 0x8a8a90, x: 0.02, y: 0.86, z: -0.24, ...FX });
    return g;
  };
  // parede com janelas ovais (furos de verdade), céu atrás; devolve o grupo pai pras nuvens de cada janela
  L.paredeCabine = (o = {}) => {
    const w = o.w ?? 10, xs = o.xs ?? [-2.6, -0.9, 0.8, 2.5], jy = o.jy ?? 1.85;
    const sh = F.ret(w, 4.6, 0.04);
    xs.forEach((x) => { const f = new THREE.Path(); f.absellipse(x, jy - 2.0, 0.26, 0.36, 0, Math.PI * 2, true); sh.holes.push(f); });
    P.peca(sh, { prof: 0.05, cor: o.cor ?? 0xe8e0cc, y: 2.0, z: -1.2, ...FX });
    xs.forEach((x) => { const a = new THREE.Shape(); a.absellipse(0, 0, 0.36, 0.47, 0, Math.PI * 2, false); const b = new THREE.Path(); b.absellipse(0, 0, 0.26, 0.36, 0, Math.PI * 2, true); a.holes.push(b);
      P.peca(a, { prof: 0.06, cor: 0xcfc6b2, x, y: jy, z: -1.15, ...FX });
      P.peca(F.ret(0.5, 0.07, 0.02), { prof: 0.05, cor: 0xbdb39e, x, y: jy + 0.36, z: -1.12, ...FX }); }); // persiana recolhida
    P.peca(F.ret(w, 0.1, 0.02), { prof: 0.08, cor: 0xb8ae98, y: 1.1, z: -1.14, ...FX }); // friso
    P.peca(F.ret(w, 1.0, 0.04), { prof: 0.06, cor: o.ceu ?? 0x8cc3e8, y: jy, z: -1.6, ...FX });
    const bag = P.grupo({ y: 3.0, z: -0.75 });
    P.peca(sp([[-w / 2, 0.0], [w / 2, 0.0], [w / 2, 0.55], [-w / 2, 0.55]]), { pai: bag, prof: 0.9, cor: 0xded6c2, ...FX }); // bagageiro
    P.peca(F.ret(w, 0.05, 0.02), { pai: bag, prof: 0.92, cor: 0xa89e88, y: 0.02, ...FX });
    for (let i = 0; i < 6; i++) P.peca(F.circulo(0.05), { pai: bag, prof: 0.02, cor: 0xf6eed2, x: -2.5 + i, y: -0.05, z: 0.4, ...FX }); // luzinhas de leitura
    return xs.map((x) => P.grupo({ x, y: jy, z: -1.42 }));
  };
};

// Amostra: corpo de gente + cenário mais real (3 planos)
const fala = (D, janelas) => { const n = Math.ceil(D * 30) + 2, a = new Array(n).fill(0);
  for (const [t0, t1] of janelas) for (let i = Math.floor(t0 * 30); i < Math.min(n, t1 * 30); i++) { const t = i / 30; a[i] = Math.max(0, 0.55 + 0.45 * Math.sin(t * 23) * Math.sin(t * 7.3 + 1)); }
  return a; };
window.EP = [
  // A cabine: a mãe fala, a Juliane olha pra janela e responde
  (P, L, D) => {
    window.BOCA = { mae: fala(D, [[0.6, 2.6]]), juliane: fala(D, [[3.4, 5.2]]) };
    const jan = L.paredeCabine();
    jan.forEach((j, k) => [0, 1].forEach((i) => { const n = P.peca(P.F.nuvem(0.42, 0.18), { pai: j, prof: 0.01, cor: 0xfbf6ea, y: -0.15 + i * 0.25, ...L.FX }); P.animar((ts, t) => { n.position.x = ((t * 0.35 + i * 0.5 + k * 0.3) % 1.2) - 0.6; }); }));
    L.fileira({ x: 0.2, z: 0.0, D, gente: [Object.assign({}, L.JU, { lugar: 0, poses: [[0, 'sentado'], [2.8, 'sentado+olha_cima', 0.5], [3.3, 'sentado', 0.5]], dirs: [[0, 1], [2.6, -1], [3.3, 1]] }), Object.assign({}, L.MAE, { lugar: 2, dirs: [[0, 1]], poses: [[0, 'sentado']] })] });
    L.chao(0x5a5048, 0.3, 3, 0, 10);
    L.CAM([[0, [1.3, 1.95, 4.7], [0.3, 1.45, 0.25]], [D, [1.2, 1.9, 4.3], [0.3, 1.45, 0.25]]]);
  },
  // B floresta: ela anda machucada na beira do riacho
  (P, L, D) => {
    L.floresta({ semente: 4 });
    L.riacho({ z: 1.9, larg: 1.4, w: 16 });
    P.deitado(P.F.ret(26, 26, 0.02), { prof: 0.005, cor: 0x4a3a28, z: 6.0, ...L.FX });
    L.ator(Object.assign({}, L.JU_ANDA, { folhaPerna: false, x: -1.6, z: 0.9, D, t: -1, mov: [[0, -1.6], [D, 0.9, 0.9, 'lin']] }));
    L.samambaia({ x: 2.2, z: 2.9, s: 1.1, semente: 8 });
    L.folhaGrande({ x: -1.9, y: 1.4, z: 3.2, rz: -0.5, s: 0.9 });
    L.CAM([[0, [-0.6, 1.6, 8.4], [-0.5, 1.25, 0.8]], [D, [0.5, 1.6, 7.8], [0.4, 1.25, 0.8]]]);
  },
  // C plano médio: ela para, olha pra cima e chama a mãe
  (P, L, D) => {
    window.BOCA = { juliane: fala(D, [[1.6, 2.4], [3.2, 4.2]]) };
    L.floresta({ semente: 7 });
    P.deitado(P.F.ret(26, 26, 0.02), { prof: 0.005, cor: 0x4a3a28, z: 6.0, ...L.FX });
    L.ator(Object.assign({}, L.JU_ANDA, { folhaPerna: false, x: 0.0, z: 0.9, D, t: -1, poses: [[0, 'ombro_quebrado'], [1.2, 'ombro_quebrado+olha_cima', 0.6]] }));
    L.folhaGrande({ x: 1.5, y: 1.8, z: 2.2, rz: 2.6, s: 0.8 });
    L.CAM([[0, [0.35, 1.75, 4.6], [0.05, 1.65, 0.9]], [D, [0.3, 1.72, 4.2], [0.05, 1.65, 0.9]]]);
  },
];

window.CENA = (P) => { const L = window.LIB(P); window.ATOR(P, L); window.HUMANO(P, L); window.JULI(P, L); window.REAL(P, L); const D = 7.0; window.EP[1](P, L, D); return { dur: D }; };
