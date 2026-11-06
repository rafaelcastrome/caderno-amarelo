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
    if (o.braco !== false) P.peca(F.ret(0.55, 0.07, 0.03), { pai: g, prof: 0.05, cor: LARANJA2, x: 0.02, y: 0.86, z: 0.24, ...FX });
    return g;
  };
  // fileira de 3 (grupo); o.ocupada = ator(es) dentro: [{...ficha, lugar: 0..2}]
  L.fileira = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai, rx: o.rx || 0, ry: o.ry || 0, rz: o.rz || 0 });
    const lug = [];
    for (let i = 0; i < 3; i++) lug.push(L.poltrona({ pai: g, z: -0.5 + i * 0.5, cor: i === 0 ? LARANJA : i === 1 ? 0xb85a26 : 0xa85222 }));
    (o.gente || []).forEach((a) => L.ator(Object.assign({ x: 0.12, z: -0.5 + (a.lugar ?? 0) * 0.5 + 0.02, D: o.D ?? 30, t: -1, pai: g, poses: [[0, 'sentado']] }, a)));
    if (o.cinto) P.peca(F.ret(0.36, 0.06, 0.01), { pai: g, prof: 0.02, cor: 0xb8b2a6, x: 0.08, y: 0.78, z: -0.5 + (o.cinto - 1) * 0.5 + 0.26, ...FX });
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
    L.chao(0x4a3a28, -0.4, 6, 0, 12);
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
      P.deitado(F.poligono(pts), { prof: 0.02, cor: 0x8a6a42, y: 0.03, ...FX });
    }
  };
  L.neblina = (o = {}) => { // nuvens claras passando devagar
    const r = P.fixo(o.semente ?? 6), bits = [];
    for (let i = 0; i < (o.n ?? 7); i++) bits.push([P.deitado(F.nuvem(1.4 + r() * 1.2, 0.6 + r() * 0.5), { prof: 0.02, cor: 0xc4d2c6, x: -5 + r() * 10, y: (o.y ?? 0.6) + r() * 0.3, z: -5 + r() * 10, ...FX }), r()]);
    P.animar((ts, t) => bits.forEach(([b, k]) => { b.position.x = ((-5 + k * 10 + t * (0.15 + k * 0.2)) + 6) % 12 - 6; }));
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
};
