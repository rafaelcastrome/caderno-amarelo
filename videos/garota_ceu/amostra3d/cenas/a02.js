window.BOCA = {};
// "Cena de filme": boneco de perfil com joelho, cotovelo, pé que pisa firme (IK), boca que mexe com a fala,
// poses com transição suave, ser arremessado, deitar e levantar. Mais props do filme (avião, bomba, explosão).
// Carregado depois do lib.js. window.ATOR(P, L) acrescenta L.ator, L.K e os props.
window.GENTE = (P, L) => { // gente 3D animada (sem papel); mesmas poses/trilhas do ator de papel // corpo de gente (proporção real); substitui L.ator, mantém as mesmas poses e trilhas
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
  const esc3 = (c, f) => new THREE.Color(c).multiplyScalar(f).getHex();
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
    // ===== gente 3D: peças lisas por osso (sem pele deformável), juntas escondidas por esferas =====
    const { G, malha, mat } = P;
    const pele = o.pele ?? PELE, corCab = o.cabelo ?? CABELO, fem = !!(o.saia || o.cabeloLongo || o.coque);
    const mPele = mat(pele, { rug: 0.55 }), mRoupa = mat(roupa, { rug: 0.85 }), mCalca = mat(calca, { rug: 0.85 }), mCab = mat(corCab, { rug: 0.45 });
    const mSapato = mat(o.sapato ?? 0x231c17, { rug: 0.5 });
    const giro = P.grupo({ pai: g, y: 1.2 }); const base = P.grupo({ pai: giro, y: -1.2 });
    const pelve = P.grupo({ pai: base, y: 1.0 });
    // membro de torno: perfil [[raio, y]] de cima (y=0) pra baixo (y negativo); achatado na frente/trás por fx
    const membro = (pai, perfil, m, fx = 0.9) => malha(G.torno(perfil.map(([r, y]) => [r, y]).reverse(), 24), m, { pai, s: [fx, 1, 1] });
    const perna = (lado) => {
      const z = lado ? -0.085 : 0.085;
      const mp = o.saia || o.pernaPele ? mPele : mCalca;
      const coxa = P.grupo({ pai: pelve, z });
      membro(coxa, [[0.0, 0.06], [0.085, 0.03], [0.098, -0.06], [0.09, -0.25], [0.066, -0.44], [0.062, -0.5], [0.0, -0.54]], mp);
      const joelho = P.grupo({ pai: coxa, y: -0.5 });
      malha(G.esfera(0.058), mp, { pai: joelho });
      membro(joelho, [[0.0, 0.05], [0.061, 0.02], [0.07, -0.12], [0.062, -0.25], [0.04, -0.42], [0.034, -0.5], [0.0, -0.52]], mp);
      const tor = P.grupo({ pai: joelho, y: -0.5 });
      malha(G.esfera(0.036), mp, { pai: tor });
      if (o.descalco) malha(G.esfera(0.06), mPele, { pai: tor, x: 0.06, y: -0.045, s: [1.75, 0.6, 0.72] });
      else {
        malha(G.esfera(0.064), mSapato, { pai: tor, x: 0.065, y: -0.045, s: [1.85, 0.62, 0.78] });
      }
      if (!o.saia && !o.pernaPele) malha(G.cil(0.05, 0.058, 0.08), mCalca, { pai: tor, y: 0.03 }); // barra da calça
      return { coxa, joelho, tor };
    };
    const pernas = [perna(0), perna(1)];
    const tronco = P.grupo({ pai: pelve });
    // tronco de torno achatado (fundo x, largura z)
    const perfilT = fem
      ? [[0.0, -0.1], [0.12, -0.08], [0.17, 0.0], [0.165, 0.1], [0.13, 0.24], [0.155, 0.36], [0.172, 0.46], [0.185, 0.54], [0.12, 0.6], [0.05, 0.63], [0.0, 0.64]]
      : [[0.0, -0.1], [0.12, -0.08], [0.165, 0.0], [0.16, 0.12], [0.155, 0.26], [0.18, 0.4], [0.2, 0.52], [0.13, 0.6], [0.05, 0.64], [0.0, 0.65]];
    malha(G.torno(perfilT, 36), mRoupa, { pai: tronco, s: [0.62, 1, 1] });
    if (o.terno) malha(G.caixaR(0.02, 0.3, 0.08, 0.008), mat(BRANCO), { pai: tronco, x: 0.1, y: 0.42 });
    if (!o.saia) malha(G.cil(0.168, 0.168, 0.05, 36), mat(esc3(calca, 0.55), { rug: 0.5 }), { pai: tronco, s: [0.64, 1, 1], y: 0.0 }); // cinto
    let saiaG = null;
    if (o.saia) { // saia evasê num grupo que inclina com a média das coxas (anda reta, senta e vira colo)
      const mSaia = mat(o.saia, { rug: 0.85, lados: true }), h = (o.saiaH ?? 0.42) * 1.0;
      saiaG = P.grupo({ pai: pelve, y: 0.0 });
      malha(G.torno([[0.0, 0.1], [0.15, 0.09], [0.175, 0.02], [0.21, -h * 0.5], [0.27, -h], [0.262, -h - 0.012]].reverse(), 40), mSaia, { pai: saiaG, s: [0.95, 1, 1] });
    }
    // braços
    const braco = (lado) => {
      const z = (lado ? -1 : 1) * (fem ? 0.152 : 0.168);
      const omb = P.grupo({ pai: tronco, x: -0.01, y: 0.53, z });
      const mManga = o.semManga ? mPele : mRoupa;
      malha(G.esfera(0.054), mManga, { pai: omb });
      membro(omb, [[0.0, 0.02], [0.056, 0.0], [0.052, -0.12], [0.044, -0.28], [0.0, -0.31]], mManga, 1);
      const cot = P.grupo({ pai: omb, y: -0.29 });
      const mAnte = o.manga === false || o.semManga || o.mangaCurta ? mPele : mRoupa;
      malha(G.esfera(0.043), mAnte, { pai: cot });
      membro(cot, [[0.0, 0.02], [0.044, 0.0], [0.046, -0.08], [0.033, -0.25], [0.0, -0.27]], mAnte, 1);
      const mao = P.grupo({ pai: cot, y: -0.27 });
      malha(G.esfera(0.04), mPele, { pai: mao, y: -0.07, x: 0.002, s: [0.55, 1.75, 1.0] }); // mão
      malha(G.esfera(0.015), mPele, { pai: mao, y: -0.05, x: 0.022, z: lado ? -0.018 : 0.018, s: [1, 2.0, 1], rz: 0.45 }); // polegar
      return { omb, cot, mao };
    };
    const bracos = [braco(0), braco(1)];
    if (o.naMao) o.naMao(bracos[0].mao, {});
    // pescoço e cabeça (queixo em y ~0.02, topo em y ~0.3)
    const pesc = P.grupo({ pai: tronco, x: 0.0, y: 0.58 });
    malha(G.cil(0.048, 0.054, 0.14), mPele, { pai: pesc, y: 0.05 });
    const cab = P.grupo({ pai: pesc, x: 0.0, y: 0.065 });
    // cabeça esculpida: uma esfera deformada (queixo, maxilar, nariz, órbitas, lábios) -> malha lisa única
    const HC = 0.162, HD = 0.104, HW = 0.086, HH = 0.132; // centro y, meia profundidade, meia largura, meia altura
    const ex = (v) => Math.exp(-v);
    const forma = (nx, ny, nz, inf = 0) => {
      const fr = Math.max(0, nx), lo = Math.max(0, -ny);
      let z = nz * HW * (1 - 0.2 * Math.pow(lo, 1.6)) * (1 - 0.06 * fr * lo) * (1 + 0.05 * Math.max(0, ny));
      let x = nx * HD * (nx > 0 ? 0.93 : 1);
      if (nx < 0 && ny < -0.1) x *= 1 - 0.3 * lo; // nuca
      let y = ny * HH * (ny < 0 ? 0.86 : 1.02) - 0.008 * lo * fr;
      x += 0.012 * Math.pow(lo, 2) * Math.pow(fr, 2); // queixo pra frente
      if (!inf) {
        x += 0.026 * ex(Math.pow((ny + 0.06) / 0.15, 2) + Math.pow(nz / 0.1, 2)) * Math.pow(fr, 6); // nariz
        x += 0.008 * ex(Math.pow((ny + 0.16) / 0.06, 2) + Math.pow(nz / 0.13, 2)) * Math.pow(fr, 6); // ponta
        for (const s of [1, -1]) x -= 0.011 * ex(Math.pow((ny - 0.12) / 0.1, 2) + Math.pow((nz - s * 0.4) / 0.15, 2)) * fr * fr; // órbitas
        x += 0.006 * ex(Math.pow((ny - 0.26) / 0.07, 2) + Math.pow((Math.abs(nz) - 0.35) / 0.25, 2)) * fr * fr; // sobrancelha
        x += 0.006 * ex(Math.pow((ny + 0.4) / 0.06, 2) + Math.pow(nz / 0.22, 2)) * Math.pow(fr, 4); // lábios
        z += Math.sign(nz) * 0.005 * ex(Math.pow((ny + 0.02) / 0.15, 2) + Math.pow((Math.abs(nz) - 0.62) / 0.15, 2)); // maçãs
      }
      return [x, y + HC, z];
    };
    const esculpe = (geo, inf, cresce = 0) => { const p = geo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const [x, y, z] = forma(-v.x === 0 ? 0 : v.x, v.y, v.z, inf);
        p.setXYZ(i, x * (1 + cresce) - 0.004 * cresce, (y - HC) * (1 + cresce) + HC, z * (1 + cresce)); }
      geo.computeVertexNormals(); return geo; };
    malha(esculpe(new THREE.SphereGeometry(1, 72, 54), 0), mPele, { pai: cab });
    const naCara = (ny, nz, dentro = 0) => { const nx = Math.sqrt(Math.max(0, 1 - ny * ny - nz * nz)); const [x, y, z] = forma(nx, ny, nz); return [x - dentro, y, z]; };
    [1, -1].forEach((l) => { const [x, y, z] = naCara(0.05, l * 0.99 * 0.98); malha(G.esfera(0.024), mat(esc3(pele, 0.94), { rug: 0.6 }), { pai: cab, x: x - 0.012, y: y + 0.005, z: z * 0.97, s: [0.7, 1.3, 0.42] }); }); // orelhas
    // olhos nas órbitas: o grupo de dentro pisca (escala y)
    const [eX, eY] = naCara(0.12, 0.4);
    const olho = P.grupo({ pai: cab, y: eY }); const olhoIn = P.grupo({ pai: olho });
    const mBranco = mat(0xf6f2ea, { rug: 0.3 }), mIris = mat(o.corOlho ?? 0x5a3a22, { rug: 0.25 }), mPupila = mat(0x0c0806, { rug: 0.2 });
    [1, -1].forEach((l) => {
      const [x, , z] = naCara(0.12, l * 0.4);
      const e = P.grupo({ pai: olhoIn, x: x - 0.015, z });
      malha(G.esfera(0.021), mBranco, { pai: e });
      malha(G.esfera(0.0108), mIris, { pai: e, x: 0.0172, s: [0.42, 1, 1] });
      malha(G.esfera(0.0055), mPupila, { pai: e, x: 0.0198, s: [0.35, 1, 1] });
      malha(G.esfera(0.0022), mat(0xffffff, { emis: 0xffffff, emisI: 0.8 }), { pai: e, x: 0.0212, y: 0.004, z: 0.003, sombra: false });
      malha(new THREE.SphereGeometry(0.0222, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.36), mPele, { pai: e, rz: 0.55 }); // pálpebra
    });
    const sob = P.grupo({ pai: cab, y: eY + 0.032 }); const sobIn = P.grupo({ pai: sob });
    [1, -1].forEach((l) => { const [x, , z] = naCara(0.26, l * 0.4); malha(G.caixaR(0.005, 0.0045, 0.036, 0.002), mat(esc3(corCab, 0.85), { rug: 0.7 }), { pai: sobIn, x: x - 0.002, z, ry: l * -0.35, rx: l * 0.12 }); });
    // boca: lábios + abertura escura que cresce com a fala
    const [bX, bY] = naCara(-0.4, 0);
    malha(G.esfera(0.02), mat(fem ? 0xc0645c : 0xa8746a, { rug: 0.4 }), { pai: cab, x: bX - 0.008, y: bY, s: [0.45, 0.42, 1.05] });
    const boca = P.grupo({ pai: cab, x: bX - 0.004, y: bY - 0.001 });
    malha(G.esfera(0.015), mat(0x3a1210, { rug: 0.6 }), { pai: boca, s: [0.4, 0.5, 1.0], sombra: false });
    // cabelo: casca da própria cabeça, cortada na linha do cabelo
    // leva pro contorno da linha do cabelo os pontos da frente que ficam abaixo dela (borda lisa, sem degrau)
    const linhaNa = (v, linha) => { const l = linha(v.x, v.z); if (v.y >= l) return;
      const az = Math.atan2(v.z, v.x); let ny = l; for (let k = 0; k < 3; k++) { const r = Math.sqrt(1 - ny * ny); ny = Math.max(v.y, linha(r * Math.cos(az), r * Math.sin(az))); }
      const r = Math.sqrt(1 - ny * ny); v.set(r * Math.cos(az), ny, r * Math.sin(az)); };
    const casca = (linha, cresce, corte) => { const geo = new THREE.SphereGeometry(1, 120, 90), p = geo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); if (linha) linhaNa(v, linha); const [x, y, z] = forma(v.x, v.y, v.z, 1);
        p.setXYZ(i, x * (1 + cresce) - 0.004 * cresce, (y - HC) * (1 + cresce) + HC, z * (1 + cresce)); }
      if (corte) { const idx = geo.index.array, ok = []; const keep = (i) => corte(p.getX(i) / HD, (p.getY(i) - HC) / HH, p.getZ(i) / HW);
        for (let i = 0; i < idx.length; i += 3) if (keep(idx[i]) && keep(idx[i + 1]) && keep(idx[i + 2])) ok.push(idx[i], idx[i + 1], idx[i + 2]); geo.setIndex(ok); }
      geo.computeVertexNormals(); return geo; };
    const linhaCurta = (x, z) => (x > 0 ? 0.14 + 0.34 * x - 0.1 * Math.abs(z) : 0.14 + 0.75 * x);
    if (o.cabeloLongo) {
      // casca que cai até o ombro: atrás e dos lados os pontos de baixo descem e abrem um pouco
      const geo = new THREE.SphereGeometry(1, 120, 90), p = geo.attributes.position, v = new THREE.Vector3(), dirs = [];
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); linhaNa(v, (x, z) => 0.1 + 0.34 * x - 0.08 * Math.abs(z) - 3.2 * Math.max(0, 0.25 - x)); dirs.push([v.x, v.y, v.z]);
        let [x, y, z] = forma(v.x, v.y, v.z, 1); x = x * 1.09 - 0.008; y = (y - HC) * 1.08 + HC + 0.004; z *= 1.13;
        if (v.y < 0.2 && v.x < 0.55) { const k = (0.2 - v.y) / 1.2, fx = Math.min(1, (0.55 - v.x) / 0.5); y -= 0.27 * k * fx; z *= 1 + 0.25 * k * fx; x -= 0.03 * k * fx; }
        p.setXYZ(i, x, y, z); }
      geo.computeVertexNormals();
      const cl = P.grupo({ pai: cab });
      malha(geo, mat(corCab, { rug: 0.45, lados: true }), { pai: cl });
      cab.userData.cabelo = null;
    } else if (o.coque) {
      malha(casca((x, z) => (x > 0 ? 0.14 + 0.32 * x - 0.08 * Math.abs(z) : 0.14 + 0.55 * x), 0.06), mCab, { pai: cab });
      malha(G.esfera(0.055), mCab, { pai: cab, x: -0.125, y: 0.24 });
    } else if (!o.careca) {
      malha(casca(linhaCurta, 0.05), mCab, { pai: cab });
    }
    if (o.barba) malha(casca(null, 0.04, (x, y, z) => y < 0.05 - 0.0 * x && x > -0.25 && !(x > 0.6 && y > -0.55 && Math.abs(z) < 0.3 && y < -0.25)), mat(o.barba, { rug: 0.75 }), { pai: cab });
    if (o.oculos) {
      const mA = mat(0x2a2420, { rug: 0.3 });
      [1, -1].forEach((l) => malha(new THREE.TorusGeometry(0.023, 0.0028, 8, 28), mA, { pai: cab, x: 0.108, y: 0.16, z: l * 0.042, ry: Math.PI / 2 }));
      malha(G.cil(0.002, 0.002, 0.03, 6), mA, { pai: cab, x: 0.11, y: 0.165, rx: Math.PI / 2 });
      [1, -1].forEach((l) => malha(G.cil(0.002, 0.002, 0.12, 6), mA, { pai: cab, x: 0.05, y: 0.165, z: l * 0.066, rz: Math.PI / 2 }));
    }
    if (o.olhoInchado) { const [x, y, z] = naCara(0.07, 0.42); malha(G.esfera(0.014), mat(0xb87a6e, { rug: 0.6 }), { pai: cab, x: x - 0.006, y: y - 0.004, z, s: [0.5, 0.45, 1.3] }); }
    if (o.machucado) malha(G.caixaR(0.005, 0.006, 0.03, 0.002), mat(0x8a2a22), { pai: cab, x: 0.112, y: 0.22, z: 0.02, rx: 0.4 });
    if (o.chapeu) { malha(G.cil(0.2, 0.2, 0.012, 36), mat(o.chapeu), { pai: cab, x: -0.01, y: 0.27 }); malha(G.cil(0.11, 0.125, 0.11, 36), mat(o.chapeu), { pai: cab, x: -0.01, y: 0.33 }); }
    if (o.bebe) { const b = P.grupo({ pai: tronco, x: 0.18, y: 0.36 }); malha(G.esfera(0.1), mat(o.bebe === true ? 0xf2e2b8 : o.bebe), { pai: b, s: [1.4, 0.9, 1] }); malha(G.esfera(0.05), mPele, { pai: b, x: 0.12, y: 0.05 }); }
    let mala = null;
    if (o.mala) {
      mala = P.grupo({ pai: bracos[1].mao, y: -0.08 });
      malha(G.caixaR(0.42, 0.3, 0.14, 0.03), mat(o.corMala ?? 0x8a5a34, { rug: 0.6 }), { pai: mala, y: -0.2 });
      malha(G.caixaR(0.08, 0.03, 0.03, 0.01), mat(0x3a2a1a), { pai: mala, y: -0.03 });
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
      boca.children[0].scale.set(0.4, 0.25 + fr * 1.1, 1.0 + fr * 0.1);
      if (fr > 0.05 && !cur.sN && o.gesticula !== false) { q.sN += 0.35 * fr + 0.15 * Math.sin(t * 4.2); q.eN += 0.5 * fr; q.head += 0.06 * Math.sin(t * 7) * fr; }
      if (q.osc) { q.eN += 0.22 * q.osc * Math.sin(t * 13); q.sN += 0.08 * q.osc * Math.sin(t * 6.5); }
      if (q.bolso) { q.eN += 0.25 * q.bolso * Math.sin(t * 16); q.eF += 0.25 * q.bolso * Math.sin(t * 16 + 2); }
      if (q.flail) { q.sN += 0.6 * q.flail * Math.sin(t * 17); q.sF += 0.6 * q.flail * Math.sin(t * 15 + 1); q.kN -= 0.4 * q.flail * Math.abs(Math.sin(t * 13)); q.head += 0.3 * q.flail * Math.sin(t * 11); }
      // aplica
      let x = p[0], y = 0, rot = q.rot;
      if (voo && t > voo.t0) { const k = Math.min(1, (t - voo.t0) / (voo.t1 - voo.t0)); const e = 1 - Math.pow(1 - k, 1.6);
        x += voo.dx * e; y += (voo.h ?? 1) * 4 * k * (1 - k); rot += (voo.giro ?? 0) * sm(k); if (k >= 1) { const b = t - voo.t1; y += Math.abs(Math.sin(b * 9)) * 0.12 * Math.exp(-b * 5); } }
      const dir = dirEm(t);
      g.position.set(x, o.y || 0, p[1]); g.scale.setScalar(s); g.rotation.y = (1 - dir) / 2 * Math.PI + (o.vira ?? 0);
      giro.rotation.z = rot; giro.position.y = 1.2 + q.ly + y;
      pelve.position.y = q.hipY; tronco.rotation.z = -q.lean;
      pernas[0].coxa.rotation.z = q.tN; pernas[0].joelho.rotation.z = q.kN; pernas[0].tor.rotation.z = -(q.tN + q.kN) + q.pN;
      if (saiaG) { saiaG.rotation.z = (q.tN + q.tF) / 2; saiaG.scale.y = 1 - 0.25 * Math.min(1, Math.abs(q.tN + q.tF) / 3); }
      pernas[1].coxa.rotation.z = q.tF; pernas[1].joelho.rotation.z = q.kF; pernas[1].tor.rotation.z = -(q.tF + q.kF) + q.pF;
      bracos[0].omb.rotation.z = q.sN; bracos[0].cot.rotation.z = q.eN; bracos[1].omb.rotation.z = q.sF; bracos[1].cot.rotation.z = q.eF;
      pesc.rotation.z = q.lean * 0.5; cab.rotation.z = q.head;
      if (mala) { mala.rotation.z = -(rot - q.lean + q.sF + q.eF); mala.visible = malaVis(t) > 0.5; }
      const pis = ((t + fase0 * 0.3) % 3.3) < 0.11 || q.olhosF > 0.5; olho.children[0].scale.y = pis ? 0.12 : 1;
      sob.children[0].position.y = fr * 0.004; 
      if (cab.userData.cabelo && o.vento) cab.userData.cabelo.rotation.z = (typeof o.vento === 'function' ? o.vento(t) : o.vento) * (0.35 + 0.2 * Math.sin(t * 23));
    });
    g.userData.cab = cab; g.userData.mao = bracos[0].mao;
    return g;
  };
};

// Cenários 3D (sem papel) pra minissérie: cabine de avião anos 70 e floresta amazônica. window.CEN3D(P, L).
window.CEN3D = (P, L) => {
  const { THREE, G, malha, mat } = P;
  const esc = (c, f) => new THREE.Color(c).multiplyScalar(f).getHex();
  L.CAM = (ks) => P.camera(ks.map(([t, pos, alvo]) => ({ t, pos, alvo })));
  L.CORTE = (ks) => ks.flatMap(([t, pos, alvo], i) => (i ? [[t - 0.001, ks[i - 1][1], ks[i - 1][2]], [t, pos, alvo]] : [[t, pos, alvo]]));
  // ------------------------- cabine -------------------------
  L.poltrona = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai });
    const cor = o.cor ?? 0xc4642a, m = mat(cor, { rug: 0.9 }), mE = mat(esc(cor, 0.8), { rug: 0.9 });
    malha(G.caixaR(0.5, 0.13, 0.44, 0.05), m, { pai: g, x: 0.02, y: 0.55 }); // assento
    malha(G.caixaR(0.14, 1.0, 0.44, 0.06), m, { pai: g, x: -0.26, y: 1.06, rz: -0.1 }); // encosto
    malha(G.caixaR(0.15, 0.2, 0.38, 0.05), mat(0xece4d2, { rug: 0.85 }), { pai: g, x: -0.31, y: 1.44, rz: -0.1 }); // capinha
    malha(G.caixaR(0.5, 0.06, 0.4, 0.02), mE, { pai: g, x: 0.0, y: 0.47 });
    malha(G.cil(0.03, 0.03, 0.45, 12), mat(0x8a8a90, { rug: 0.35, metal: 0.6 }), { pai: g, x: 0.0, y: 0.23 });
    malha(G.caixaR(0.55, 0.04, 0.3, 0.015), mat(0x7a7a80, { rug: 0.4, metal: 0.5 }), { pai: g, y: 0.02 });
    if (o.braco) malha(G.caixaR(0.42, 0.05, 0.06, 0.02), mat(0x8a8a90, { rug: 0.4, metal: 0.4 }), { pai: g, x: 0.0, y: 0.78, z: -0.25 });
    return g;
  };
  // fileira de 3; gente: [{...ficha, lugar}]
  L.fileira = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai, rx: o.rx || 0, ry: o.ry || 0, rz: o.rz || 0 });
    for (let i = 0; i < 3; i++) L.poltrona({ pai: g, z: -0.5 + i * 0.52, cor: [0xc4642a, 0xb85a26, 0xa85222][i] });
    (o.gente || []).forEach((a) => L.ator(Object.assign({ x: 0.08, z: -0.5 + (a.lugar ?? 0) * 0.52, D: o.D ?? 30, pai: g, poses: [[0, 'sentado']] }, a)));
    if (o.cinto) malha(G.caixaR(0.3, 0.05, 0.02, 0.008), mat(0xb8b2a6), { pai: g, x: 0.12, y: 0.75, z: -0.5 + (o.cinto - 1) * 0.52 + 0.17 });
    return g;
  };
  // parede da janela (atrás, em z = zP), janelas ovais furadas; devolve grupos atrás de cada janela pra pôr nuvens
  L.cabine = (o = {}) => {
    const zP = o.z ?? -1.0, xs = o.xs ?? [-3.0, -1.6, -0.2, 1.2, 2.6], jy = o.jy ?? 1.62, w = o.w ?? 12;
    const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, 2.9); sh.lineTo(-w / 2, 2.9); sh.closePath();
    xs.forEach((x) => { const f = new THREE.Path(); f.absellipse(x, jy, 0.22, 0.3, 0, Math.PI * 2, true); sh.holes.push(f); });
    malha(G.forma(sh, 0.08, 0.01), mat(o.corParede ?? 0xe6dfcf, { rug: 0.75 }), { pai: o.pai, z: zP });
    xs.forEach((x) => { const a = new THREE.Shape(); a.absellipse(0, 0, 0.31, 0.4, 0, Math.PI * 2, false); const b = new THREE.Path(); b.absellipse(0, 0, 0.22, 0.3, 0, Math.PI * 2, true); a.holes.push(b);
      malha(G.forma(a, 0.05, 0.02), mat(0xd2c9b6, { rug: 0.5 }), { pai: o.pai, x, y: jy, z: zP + 0.06 });
      malha(G.caixaR(0.44, 0.06, 0.04, 0.015), mat(0xbcb29c, { rug: 0.6 }), { pai: o.pai, x, y: jy + 0.33, z: zP + 0.08 }); });
    malha(G.caixaR(w, 0.06, 0.05, 0.02), mat(0xb4a990, { rug: 0.6 }), { pai: o.pai, y: 1.02, z: zP + 0.07 }); // friso
    malha(G.caixa(w, 0.08, 4.0), mat(0x5a5048, { rug: 0.95 }), { pai: o.pai, y: -0.04, z: zP + 2.0 }); // carpete
    malha(G.caixaR(w, 0.5, 0.8, 0.08), mat(0xded6c2, { rug: 0.6 }), { pai: o.pai, y: 2.55, z: zP + 0.42 }); // bagageiro
    malha(G.caixa(w, 0.04, 0.82), mat(0xa89e88, { rug: 0.6 }), { pai: o.pai, y: 2.29, z: zP + 0.43 });
    for (let i = 0; i < 8; i++) malha(G.cil(0.035, 0.035, 0.02, 16), mat(0xfff4d8, { emis: 0xfff0c8, emisI: 0.5 }), { pai: o.pai, x: -3.5 + i, y: 2.27, z: zP + 0.75, sombra: false });
    malha(G.caixa(w, 0.05, 3.0), mat(0xece6d8, { rug: 0.8 }), { pai: o.pai, y: 3.0, z: zP + 1.4 }); // teto
    // céu atrás das janelas
    const ceu = P.grupo({ pai: o.pai, z: zP - 0.6 });
    malha(G.caixa(w + 4, 4, 0.05), mat(o.ceu ?? 0x8fc0e4, { rug: 1, emis: o.ceu ?? 0x8fc0e4, emisI: 0.55 }), { pai: ceu, y: jy, z: -0.2, sombra: false });
    return xs.map((x) => P.grupo({ pai: ceu, x, y: jy }));
  };
  L.nuvem = (pai, o = {}) => { const g = P.grupo({ pai, x: o.x || 0, y: o.y || 0, z: o.z || 0 }); const r = P.fixo(o.semente ?? 3), m = mat(o.cor ?? 0xffffff, { rug: 1, emis: o.cor ?? 0xffffff, emisI: o.brilho ?? 0.35 });
    for (let i = 0; i < 6; i++) malha(G.esfera(0.12 + r() * 0.1, 16, 12), m, { pai: g, x: (i - 2.5) * 0.12, y: r() * 0.06, z: r() * 0.05, sombra: false }); g.scale.setScalar(o.s ?? 1); return g; };
  // ------------------------- floresta -------------------------
  const VERDES = [0x1e4a2a, 0x275a32, 0x2f6a3a, 0x3d7a44, 0x4f8c4c];
  const folhaGeo = (() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(0.12, 0.2, 0, 0.55); s.quadraticCurveTo(-0.12, 0.2, 0, 0); const g = new THREE.ShapeGeometry(s, 8);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, -0.25 * Math.pow(p.getY(i), 2)); g.computeVertexNormals(); return g; })();
  // nuvem de folhas instanciadas em volta de um ponto (copa, arbusto)
  L.folhagem = (o) => {
    const n = o.n ?? 120, r = P.fixo(o.semente ?? 1), cores = o.cores ?? VERDES;
    const im = new THREE.InstancedMesh(folhaGeo, new THREE.MeshStandardMaterial({ roughness: 0.75, side: THREE.DoubleSide }), n);
    const d = new THREE.Object3D(), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, b = Math.acos(2 * r() - 1), rr = Math.cbrt(r());
      d.position.set(Math.sin(b) * Math.cos(a) * o.rx * rr, Math.cos(b) * o.ry * rr, Math.sin(b) * Math.sin(a) * o.rz * rr);
      d.rotation.set(r() * 6.3, r() * 6.3, r() * 6.3); d.scale.setScalar((o.s ?? 1) * (0.7 + r() * 0.6)); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
      im.setColorAt(i, c.setHex(cores[Math.floor(r() * cores.length)]).multiplyScalar(0.85 + r() * 0.3));
    }
    im.castShadow = o.sombra !== false; im.receiveShadow = true; im.position.set(o.x || 0, o.y || 0, o.z || 0); (o.pai || P.raiz).add(im); return im;
  };
  L.arvore = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0 }); const h = o.h ?? 6, r = P.fixo(o.semente ?? Math.round((o.x || 0) * 13 + 50)), wb = o.larg ?? 0.22;
    const cT = o.tronco ?? [0x5e4634, 0x4e3a2c, 0x6a5440][(o.semente ?? 0) % 3];
    malha(G.torno([[wb * 1.25, 0], [wb, 0.5], [wb * 0.75, h * 0.5], [wb * 0.55, h], [0.0, h + 0.05]], 18), mat(cT, { rug: 0.95 }), { pai: g });
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + r() * 0.6; // sapopemas
      const sp = new THREE.Shape(); sp.moveTo(0, 0); sp.lineTo(wb * 3.2, 0); sp.quadraticCurveTo(wb * 1.2, 0.25, 0, 1.0 + r() * 0.5); sp.closePath();
      malha(G.forma(sp, 0.05, 0.015), mat(esc(cT, 0.9), { rug: 0.95 }), { pai: g, ry: a }); }
    for (let k = 0; k < 4; k++) L.folhagem({ pai: g, x: (r() - 0.5) * 1.6, y: h + r() * 0.8, z: (r() - 0.5) * 1.6, rx: 1.2 + r() * 0.6, ry: 0.5, rz: 1.2 + r() * 0.6, n: 70, s: 0.9, semente: (o.semente ?? 0) * 7 + k });
    if (o.cipo !== false) L.cipo({ a: [(o.x || 0) + 0.2, h * 0.95, (o.z || 0)], b: [(o.x || 0) + 1.4, h * 0.75, (o.z || 0) + 0.3], queda: 0.5 });
    return g;
  };
  L.cipo = (o) => { const [x0, y0, z0] = o.a, [x1, y1, z1] = o.b, pts = [];
    for (let i = 0; i <= 24; i++) { const k = i / 24; pts.push(new THREE.Vector3(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k - (o.queda ?? 0.8) * 4 * k * (1 - k), z0 + (z1 - z0) * k)); }
    malha(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, o.r ?? 0.018, 6), mat(o.cor ?? 0x4a5a2a, { rug: 0.9 }), {}); };
  // samambaia: frondes arqueadas com folíolos instanciados
  L.samambaia = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, s: o.s ?? 1 }); const r = P.fixo(o.semente ?? 5);
    const fol = new THREE.InstancedMesh(folhaGeo, new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide }), 9 * 22 * 2);
    const d = new THREE.Object3D(), c = new THREE.Color(); let n = 0;
    for (let k = 0; k < 9; k++) { const az = k / 9 * Math.PI * 2 + r() * 0.3, len = 0.8 + r() * 0.4;
      for (let i = 1; i <= 22; i++) { const u = i / 22, el = 1.2 - u * 1.9, rr = len * u; const px = Math.cos(az) * rr * 0.9, py = Math.sin(1.2) * rr * 0.9 * (1 - u) + 0.05 + 0.5 * u * (1 - u), pz = Math.sin(az) * rr * 0.9;
        for (const s of [1, -1]) { d.position.set(px, py, pz); d.rotation.set(0, -az + s * Math.PI / 2, el * 0.3); d.rotateX(s * 1.2); d.scale.setScalar(0.35 * Math.sin(Math.PI * (0.15 + 0.85 * (1 - u)))); d.updateMatrix(); fol.setMatrixAt(n, d.matrix);
          fol.setColorAt(n++, c.setHex(o.cor ?? 0x4c8a4a).multiplyScalar(0.8 + r() * 0.35)); } } }
    fol.castShadow = true; fol.receiveShadow = true; g.add(fol); return g;
  };
  L.folhaGrande = (o = {}) => { const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, rz: o.rz || 0, ry: o.ry || 0, s: o.s ?? 1 });
    malha(folhaGeo, mat(o.cor ?? 0x3f7f45, { rug: 0.7, lados: true }), { pai: g, s: [5.5, 4.0, 3] }); P.animar((t) => { g.rotation.z = (o.rz || 0) + Math.sin(t * 1.3 + (o.x || 0)) * 0.04; }); return g; };
  L.chao = (o = {}) => { const geo = new THREE.PlaneGeometry(o.w ?? 40, o.d ?? 40, 80, 80); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, r = P.fixo(o.semente ?? 2);
    const cores = [], c = new THREE.Color(); for (let i = 0; i < p.count; i++) { p.setY(i, Math.sin(p.getX(i) * 0.7) * Math.cos(p.getZ(i) * 0.6) * 0.04); c.setHex(o.cor ?? 0x4a3a28).multiplyScalar(0.8 + r() * 0.35); cores.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); m.receiveShadow = true; m.position.set(o.x || 0, o.y || 0, o.z || 0); P.raiz.add(m);
    // folhas secas
    const n = o.folhas ?? 400, im = new THREE.InstancedMesh(folhaGeo, new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide }), n), d = new THREE.Object3D();
    for (let i = 0; i < n; i++) { d.position.set((r() - 0.5) * (o.wf ?? 14), 0.05, (r() - 0.5) * (o.df ?? 10) + (o.zf ?? 0)); d.rotation.set(-Math.PI / 2 + (r() - 0.5) * 0.4, 0, r() * 6.3); d.scale.setScalar(0.35 + r() * 0.3); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
      im.setColorAt(i, c.setHex([0x7a5a32, 0x6a4a28, 0x8a6a3a, 0x5a5a2a][i % 4]).multiplyScalar(0.8 + r() * 0.4)); }
    im.receiveShadow = true; P.raiz.add(im); return m; };
  L.riacho = (o = {}) => { const g = P.grupo({ x: o.x || 0, z: o.z || 0 });
    malha(G.caixa(o.w ?? 30, 0.02, o.larg ?? 1.6), mat(o.cor ?? 0x4a6a6c, { rug: 0.12, metal: 0.25 }), { pai: g, y: 0.03 });
    const r = P.fixo(o.semente ?? 3), rs = [];
    for (let i = 0; i < 14; i++) rs.push([malha(new THREE.RingGeometry(0.04, 0.048, 24), mat(0x9ab8b8, { rug: 0.3, lados: true }), { pai: g, x: -6 + r() * 12, y: 0.045, z: (r() - 0.5) * (o.larg ?? 1.6) * 0.85, rx: -Math.PI / 2, sombra: false }), r()]);
    P.animar((t) => rs.forEach(([m, k]) => { const u = (t * 0.6 + k) % 1; m.scale.setScalar(0.5 + u * 1.6); m.material.opacity = 0.6 * (1 - u); m.position.x = ((-6 + k * 12 + t * (o.v ?? 0.3)) + 7) % 14 - 7; }));
    rs.forEach(([m]) => { m.material = m.material.clone(); m.material.transparent = true; });
    return g; };
  L.raiosLuz = (o = {}) => { const r = P.fixo(o.semente ?? 12);
    for (let i = 0; i < (o.n ?? 4); i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5 + r() * 0.5, 12), new THREE.MeshBasicMaterial({ color: o.cor ?? 0xfff2c8, transparent: true, opacity: (o.op ?? 0.08) * (0.6 + r() * 0.6), depthWrite: false, side: THREE.DoubleSide }));
      m.position.set((o.x ?? 0) - 3 + i * 1.8 + r() * 0.6, 4.5, (o.z ?? -1.5) + r() * 2); m.rotation.z = 0.35; P.raiz.add(m); } };
  L.floresta = (o = {}) => {
    P.fundo(o.ceu ?? 0x6f8f78); P.neblina(o.ceu ?? 0x6f8f78, o.perto ?? 6, o.longe ?? 22);
    P.hemi.color.setHex(0xd8ecd0); P.hemi.groundColor.setHex(0x3a3020); P.hemi.intensity = 0.9; P.sol.intensity = o.sol ?? 2.0; P.sol.color.setHex(0xfff0d0);
    L.chao({ cor: 0x4a3a28, zf: -1 });
    const r = P.fixo(o.semente ?? 9);
    for (let c = 0; c < 4; c++) for (let i = 0; i < 7; i++) L.arvore({ x: -7 + i * 2.2 + r() * 1.0, z: -2.5 - c * 1.8 - r() * 0.6, h: 5.5 + r() * 2.5, semente: c * 10 + i, cipo: c >= 2 && r() > 0.4, larg: 0.16 + r() * 0.1 });
    for (let i = 0; i < 7; i++) L.samambaia({ x: -5 + i * 1.7 + r() * 0.6, z: -1.6 - r() * 0.8, s: 0.8 + r() * 0.5, semente: i, cor: [0x4c8a4a, 0x3a7440][i % 2] });
    for (let i = 0; i < 6; i++) L.folhagem({ x: -6 + i * 2.4 + r(), y: 0.5, z: -2.2 - r(), rx: 0.8, ry: 0.5, rz: 0.6, n: 90, s: 0.8, semente: 100 + i });
    if (o.luz !== false) L.raiosLuz({ z: -2.0 });
  };
};

// Fichas fixas dos personagens (continuidade entre episódios), versão 3D.
window.FICHAS = (P, L) => {
  L.JU = { nome: 'juliane', s: 0.94, cabelo: 0x8a6440, cabeloLongo: true, oculos: true, roupa: 0x9cc8e6, saia: 0x9cc8e6, saiaH: 0.4, semManga: true, sapato: 0xf4efe6, corOlho: 0x4a6a8a };
  L.JU_FERIDA = Object.assign({}, L.JU, { oculos: false, roupa: 0x8fa6b4, saia: 0x86a2b0, descalco: true, machucado: true });
  L.JU_ANDA = Object.assign({}, L.JU_FERIDA, { poses: [[0, 'ombro_quebrado']], olhoInchado: true });
  L.MAE = { nome: 'mae', s: 0.95, cabelo: 0x2a211b, coque: true, roupa: 0xeee4cf, saia: 0x3a4050, sapato: 0x3a2a20 };
  L.PAI = { nome: 'pai', cabelo: 0xb5afa4, barba: 0xa9a399, roupa: 0xb8a57a, calca: 0x6a5a40, sapato: 0x4a3a2a, corOlho: 0x4a6a8a };
};

// Amostra 3D: cabine (mãe fala, Juliane responde), floresta (ela anda), plano médio (ela chama a mãe)
const fala = (D, janelas) => { const n = Math.ceil(D * 30) + 2, a = new Array(n).fill(0);
  for (const [t0, t1] of janelas) for (let i = Math.floor(t0 * 30); i < Math.min(n, t1 * 30); i++) { const t = i / 30; a[i] = Math.max(0, 0.55 + 0.45 * Math.sin(t * 23) * Math.sin(t * 7.3 + 1)); }
  return a; };
window.EP = [
  (P, L, D) => {
    window.BOCA = { mae: fala(D, [[0.6, 2.6]]), juliane: fala(D, [[3.4, 5.2]]) };
    P.fundo(0x2a2622);
    const jan = L.cabine({ z: -0.95 });
    jan.forEach((j, k) => [0, 1].forEach((i) => { const n = L.nuvem(j, { y: -0.12 + i * 0.22, z: -0.05, s: 0.7, semente: k * 2 + i }); P.animar((t) => { n.position.x = ((t * 0.3 + i * 0.5 + k * 0.3) % 1.4) - 0.7; }); }));
    L.fileira({ x: 0.0, z: 0.0, D, gente: [Object.assign({}, L.JU, { lugar: 0, poses: [[0, 'sentado'], [2.8, 'sentado+olha_cima', 0.5], [3.3, 'sentado', 0.5]], dirs: [[0, 1]], vira: 0 }), Object.assign({}, L.MAE, { lugar: 1, poses: [[0, 'sentado']] })] });
    L.fileira({ x: -1.0, z: 0.0, D });
    P.sol.position.set(3, 6, 4); P.sol.intensity = 1.6; P.hemi.intensity = 1.0;
    L.CAM([[0, [1.7, 1.75, 2.4], [0.1, 1.45, -0.2]], [D, [1.6, 1.72, 2.2], [0.1, 1.45, -0.2]]]);
  },
  (P, L, D) => {
    L.floresta({ semente: 4 });
    L.riacho({ z: 1.4, larg: 1.3 });
    L.ator(Object.assign({}, L.JU_ANDA, { x: -1.4, z: 0.4, D, mov: [[0, -1.4], [D, 1.0, 0.4, 'lin']] }));
    L.samambaia({ x: 2.0, z: 2.6, s: 1.0, semente: 8 });
    L.folhaGrande({ x: -1.6, y: 0.2, z: 2.8, rz: 0.5, s: 1.0 });
    L.CAM([[0, [-0.4, 1.5, 6.6], [-0.4, 1.1, 0.4]], [D, [0.6, 1.5, 6.2], [0.5, 1.1, 0.4]]]);
  },
  (P, L, D) => {
    window.BOCA = { juliane: fala(D, [[1.6, 2.4], [3.2, 4.2]]) };
    L.floresta({ semente: 7 });
    L.ator(Object.assign({}, L.JU_ANDA, { x: 0.0, z: 0.4, D, dir: 1, poses: [[0, 'ombro_quebrado'], [1.2, { head: 0.28, lean: -0.04, sF: 0.15, eF: 1.6 }, 0.6]] }));
    L.CAM([[0, [1.6, 1.75, 1.9], [0.1, 1.7, 0.35]], [D, [1.5, 1.73, 1.75], [0.1, 1.7, 0.35]]]);
  },
];


window.CENA = (P) => { const L = {}; window.GENTE(P, L); window.CEN3D(P, L); window.FICHAS(P, L); const D = 7.0; window.EP[1](P, L, D); return { dur: D }; };
