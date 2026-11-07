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
