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
