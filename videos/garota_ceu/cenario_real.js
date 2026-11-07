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
