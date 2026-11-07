// Ep. 2 · Sozinha na floresta. Uma função por cena (P, L, D).
const CORTE = (ks) => ks.flatMap(([t, pos, alvo], i) => (i ? [[t - 0.001, ks[i - 1][1], ks[i - 1][2]], [t, pos, alvo]] : [[t, pos, alvo]]));
window.EP = [
  // 1 recap: de cima da floresta a câmera desce até ela, sentada ao lado da fileira tombada
  (P, L, D) => {
    L.floresta({ semente: 4 });
    L.chao(0x4a3a28, 4.0, 10, 0, 14);
    L.fileira({ x: 1.4, y: 0.25, z: -0.9, rz: 1.25, ry: 0.3, D });
    L.ator(Object.assign({}, L.JU_FERIDA, { x: -1.6, z: 0.9, D, t: -1, olhoInchado: true, poses: [[0, 'sentado_chao']] }));
    L.veu(0x0e2a14, 0.16);
    L.CAM([[0, [-0.4, 6.5, 10.0], [-0.4, 0.6, 0.2]], [3.6, [-0.9, 2.0, 7.4], [-0.6, 1.0, 0.4]], [D, [-1.0, 1.7, 6.6], [-0.8, 1.0, 0.4]]]);
  },
  // 2 dia de Natal: tenta levantar e cai de volta
  (P, L, D) => {
    L.floresta({ semente: 6 });
    L.ator(Object.assign({}, L.JU_FERIDA, { x: -0.2, z: 0.7, D, t: -1, olhoInchado: true,
      poses: [[0, 'sentado_chao'], [0.8, 'ajoelhado', 0.7], [1.9, 'curvado', 0.8], [3.0, 'ajoelhado', 0.35], [3.6, 'sentado_chao', 0.6]] }));
    L.tremor([[3.05, 0.06, 0.4]]);
    L.veu(0x0e2a14, 0.14);
    L.CAM([[0, [0.6, 1.7, 6.4], [0.0, 1.1, 0.5]], [D, [0.5, 1.7, 5.8], [0.0, 1.1, 0.5]]]);
  },
  // 3 três cortes: ombro (braço junto do corpo), perna com folha, rosto com o olho inchado
  (P, L, D) => {
    L.floresta({ semente: 7 });
    L.ator(Object.assign({}, L.JU_ANDA, { x: 0.0, z: 0.7, D, t: -1 }));
    L.CAM([[0, [0.7, 1.4, 8.0], [0.0, 1.1, 0.7]], [D, [0.5, 1.7, 5.6], [0.05, 1.45, 0.7]]]);
    L.veu(0x0e2a14, 0.12);
  },
  // 4 sem óculos: tudo embaçado... depois o rosto dela apertando os olhos
  (P, L, D) => {
    L.floresta({ semente: 8 });
    L.ator(Object.assign({}, L.JU_ANDA, { x: 2.6, z: 0.9, D, t: -1, dir: -1, poses: [[0, 'ombro_quebrado'], [2.2, 'ombro_quebrado+olha_cima', 0.5], [3.4, 'ombro_quebrado', 0.5]] }));
    L.CAM(CORTE([[0, [-1.2, 1.6, 4.0], [-1.0, 1.8, -3.0]], [2.0, [2.0, 1.6, 6.8], [2.6, 1.35, 0.9]], [D, [2.05, 1.65, 6.2], [2.6, 1.4, 0.9]]]));
    L.veu(0x0e2a14, 0.12);
  },
  // 5 os pés: um com sandália, o outro descalço
  (P, L, D) => {
    L.floresta({ semente: 9 });
    L.ator(Object.assign({}, L.JU_ANDA, { x: -0.6, z: 0.7, D, t: -1, mov: [[0, -0.6], [D, 0.3, 0.7, 'lin']] }));
    L.CAM([[0, [-0.3, 0.6, 4.6], [-0.4, 0.5, 0.7]], [D, [0.2, 0.6, 4.6], [0.1, 0.5, 0.7]]]);
    L.veu(0x0e2a14, 0.12);
  },
  // 6 procura a mãe em volta das cadeiras
  (P, L, D) => {
    L.floresta({ semente: 4 });
    L.fileira({ x: 0.6, y: 0.25, z: -1.5, rz: 1.25, ry: 0.3, D });
    L.ator(Object.assign({}, L.JU_ANDA, { x: -2.2, z: 0.9, D, t: -1, mov: [[0, -2.2], [1.8, -0.4], [2.6, -0.4], [D, 1.9, 0.6]],
      dirs: [[0, 1], [2.0, -1], [2.7, 1]], poses: [[0, 'ombro_quebrado'], [1.9, 'curvado', 0.4], [2.6, 'ombro_quebrado', 0.4]] }));
    L.veu(0x0e2a14, 0.16);
    L.CAM([[0, [-1.4, 2.2, 7.8], [-1.2, 1.1, 0.0]], [D, [1.2, 2.2, 7.4], [1.0, 1.1, 0.0]]]);
  },
  // 7 primeiro o céu pela fresta da copa (avião passando), depois corte pra ela apontando; ninguém vê
  (P, L, D) => {
    L.fundoCeu({ h: 8, w: 16, y: 10.0, z: -3.6, cor: 0xa8cde0 });
    P.peca(P.F.ret(16, 7.4, 0.02), { prof: 0.03, cor: 0x1d3a26, y: 2.6, z: -3.7, ...L.FX });
    for (let i = 0; i < 6; i++) L.arvoreAlta({ x: -4 + i * 1.6, z: -2.4 + (i % 2) * 1.2, h: 6 + (i % 3), tom: i % 3, semente: 40 + i });
    const r = P.fixo(19); for (let i = 0; i < 34; i++) P.peca(P.F.nuvem(2.4, 1.5), { prof: 0.08, cor: [0x1f4a2c, 0x2a5e34, 0x37733f][i % 3], x: -5 + (i / 34) * 10 + r() * 0.4, y: 6.6 + r() * 1.6, z: -2.4 + r() * 1.6, ...L.FX });
    L.aviao({ x: -4.5, y: 9.4, z: -3.3, x1: 4.5, t0: 0.2, t1: 3.6, t: -1 }).scale.setScalar(1.4);
    L.chao(0x4a3a28, 3.0, 14, 0, 20);
    L.ator(Object.assign({}, L.JU_ANDA, { x: -0.6, z: 0.8, D, t: -1, poses: [[0, 'ombro_quebrado+aponta_cima'], [3.0, 'ombro_quebrado+olha_cima', 0.3], [3.6, 'ombro_quebrado+aponta_cima', 0.3], [6.2, 'ombro_quebrado+olha_cima', 0.5]] }));
    L.CAM(CORTE([[0, [0.0, 5.2, 17.0], [0.0, 5.2, 0.0]], [3.6, [0.0, 1.7, 5.8], [-0.6, 1.8, 0.8]], [D, [-0.1, 1.6, 5.2], [-0.6, 1.9, 0.8]]]));
  },
  // 8 lembrança (sépia): a estação Panguana, ela de óculos anotando, o pai e a mãe
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0xcbb48a });
    for (let i = 0; i < 5; i++) L.arvoreAlta({ x: -4 + i * 2, z: -2.8, h: 5 + (i % 2), tom: 2, semente: 60 + i, tronco: 0x6a5238 });
    const casa = P.grupo({ x: 1.6, z: -1.4 });
    P.caixa(2.0, 1.3, 1.0, { pai: casa, y: 0.85, cor: 0x9a7a52, ...L.FX });
    P.peca(P.F.poligono([[-1.3, 0], [1.3, 0], [0, 0.8]]), { pai: casa, prof: 1.2, cor: 0x7a6440, y: 1.5, ...L.FX });
    [-0.6, 0, 0.6].forEach((x) => P.caixa(0.08, 0.3, 0.08, { pai: casa, x, y: 0.1, z: 0.4, cor: 0x5a4430, ...L.FX }));
    L.chao(0xa8926a, 0.5, 3, 0, 12);
    P.caixa(1.0, 0.08, 0.6, { x: -0.5, y: 0.7, z: 0.4, cor: 0x8a6a44, ...L.FX }); P.caixa(0.08, 0.66, 0.5, { x: -0.5, y: 0.33, z: 0.4, cor: 0x6a5034, ...L.FX });
    L.ator(Object.assign({}, L.JU, { x: -1.15, z: 0.75, D, t: -1, poses: [[0, 'sentado+desenha']] }));
    P.caixa(0.08, 0.6, 0.5, { x: -1.3, y: 0.3, z: 0.75, cor: 0x6a5034, ...L.FX }); P.caixa(0.5, 0.06, 0.5, { x: -1.2, y: 0.62, z: 0.75, cor: 0x6a5034, ...L.FX });
    L.ator(Object.assign({}, L.PAI, { x: 0.35, z: 0.55, D, t: -1, dir: -1, poses: [[0, 'normal'], [2.0, 'aponta', 0.5], [4.0, 'normal', 0.6]] }));
    L.ator(Object.assign({}, L.MAE, { x: 1.2, z: 0.3, D, t: -1, dir: -1 }));
    L.veu(0x7a5a2a, 0.3);
    L.CAM([[0, [0.1, 2.3, 10.4], [0.1, 1.3, 0.3]], [D, [0.0, 2.2, 9.4], [0.0, 1.3, 0.3]]]);
  },
  // 9 o pai risca na terra: risquinho -> riacho -> rio -> casinha (sépia, de cima)
  (P, L, D) => {
    const M = P.grupo({ z: 2.5 });
    P.deitado(P.F.ret(16, 18, 0.02), { pai: M, prof: 0.01, cor: 0xa8926a, ...L.FX }); P.deitado(P.F.ret(30, 30, 0.02), { prof: 0.01, cor: 0xa8926a, y: -0.02, ...L.FX });
    const r = P.fixo(5); for (let i = 0; i < 30; i++) P.deitado(P.F.circulo(0.04 + r() * 0.05), { pai: M, prof: 0.01, cor: 0x8a7450, x: -3 + r() * 6, z: -4 + r() * 8, ...L.FX });
    const linha = (pts, w, t, cor = 0x5a4430) => pts.slice(1).forEach((p, i) => { const a = pts[i], dx = p[0] - a[0], dz = p[1] - a[1];
      P.deitado(P.F.ret(Math.hypot(dx, dz) + w, w, w / 2), { pai: M, prof: 0.02, cor, x: (a[0] + p[0]) / 2, z: (a[1] + p[1]) / 2, ry: -Math.atan2(dz, dx), t: t + i * 0.25, entra: 'pop', dur: 0.3 }); });
    linha([[-1.2, -3.0], [-1.0, -2.2], [-1.3, -1.6]], 0.05, 0.6);
    linha([[-1.3, -1.6], [-0.8, -0.8], [-1.0, 0.0]], 0.12, 2.0);
    linha([[-1.0, 0.0], [-0.2, 0.9], [0.0, 2.0], [0.6, 2.8]], 0.3, 4.0, 0x6a8aa0);
    const casa = P.grupo({ pai: M, x: 1.3, y: 0.02, z: 2.9 });
    P.caixa(0.5, 0.3, 0.4, { pai: casa, y: 0.15, cor: 0x9a7a52, t: 6.6, entra: 'pop' });
    P.peca(P.F.poligono([[-0.35, 0], [0.35, 0], [0, 0.3]]), { pai: casa, prof: 0.45, cor: 0x7a6440, y: 0.3, t: 6.8, entra: 'pop' });
    const vara = P.peca(P.F.ret(1.6, 0.06, 0.02), { pai: M, prof: 0.06, cor: 0x5a3e2a, y: 0.5, rz: 0.5, ...L.FX });
    const trilha = [[-1.2, -3.0], [-1.3, -1.6], [-1.0, 0.0], [0.0, 2.0], [1.3, 2.9]];
    P.animar((ts, t) => { const k = Math.min(trilha.length - 1.001, Math.max(0, (t - 0.4) / 1.6)); const i = Math.floor(k), f = k - i; const a = trilha[i], b = trilha[i + 1];
      vara.position.x = a[0] + (b[0] - a[0]) * f + 0.6; vara.position.z = a[1] + (b[1] - a[1]) * f; });
    L.veu(0x7a5a2a, 0.22);
    P.foco = [0, 0.01];
    L.CAM([[0, [0.0, 17.0, 3.7], [0.0, 0, 2.5]], [D, [0.0, 15.8, 3.6], [0.0, 0, 2.5]]]);
  },
  // 10 perto dos destroços: um saquinho de doces nas folhas
  (P, L, D) => {
    L.floresta({ semente: 11 });
    const saco = P.impresso(0.24, 0.3, (g, w, h) => { g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, h); const c = ['#c93a2e', '#f2c230', '#3f7fc4', '#4c9a5a', '#e8813a'];
      for (let i = 0; i < 9; i++) { g.fillStyle = c[i % 5]; g.beginPath(); g.arc(w * (0.25 + (i % 3) * 0.25), h * (0.35 + Math.floor(i / 3) * 0.2), w * 0.09, 0, 7); g.fill(); } g.fillStyle = '#b8a67e'; g.fillRect(0, 0, w, h * 0.12); }, { x: 0.55, y: 0.15, z: 0.85, rz: 0.3, ...L.FX });
    P.animar((ts, t) => { const k = L.sm((t - 2.4) / 0.6); saco.position.set(0.55 - k * 0.15, 0.15 + k * 0.75, 0.85 + k * 0.08); saco.rotation.z = 0.3 * (1 - k); });
    L.ator(Object.assign({}, L.JU_ANDA, { x: -0.3, z: 0.75, D, t: -1, poses: [[0, 'ombro_quebrado'], [1.0, 'ajoelhado+aponta', 0.8], [2.4, 'ajoelhado+carrega', 0.6]] }));
    L.veu(0x0e2a14, 0.12);
    L.CAM([[0, [0.6, 1.5, 6.8], [0.1, 0.9, 0.7]], [D, [0.5, 1.5, 6.0], [0.1, 0.9, 0.7]]]);
  },
  // 11 ela para e escuta: barulho de água
  (P, L, D) => {
    L.floresta({ semente: 12 });
    L.ator(Object.assign({}, L.JU_ANDA, { x: 0.0, z: 0.7, D, t: -1, dirs: [[0, 1], [1.2, -1]], poses: [[0, 'ombro_quebrado'], [1.3, 'ombro_quebrado+olha_cima', 0.4]] }));
    L.veu(0x0e2a14, 0.12);
    L.CAM([[0, [0.5, 1.75, 5.6], [0.0, 1.5, 0.7]], [D, [0.45, 1.8, 5.0], [0.0, 1.55, 0.7]]]);
  },
  // 12 anda testando o chão com a sandália na mão
  (P, L, D) => {
    L.floresta({ semente: 13 });
    L.ator(Object.assign({}, L.JU_ANDA, { x: -2.0, z: 0.8, D, t: -1, mov: [[0, -2.0], [D, 1.0, 0.8, 'lin']], poses: [[0, 'ombro_quebrado+testa_chao']], descalco: true,
      naMao: (m, op) => L.sandalia(m, op) }));
    L.CAM([[0, [-1.6, 1.6, 7.2], [-1.4, 1.1, 0.6]], [D, [0.8, 1.6, 7.2], [0.7, 1.1, 0.6]]]);
    L.veu(0x0e2a14, 0.14);
  },
  // 13 o riacho atravessa a cena; ela chega e põe o pé na água
  (P, L, D) => {
    L.floresta({ semente: 14 });
    const rio = L.riacho({ x: 0.9, z: 0, larg: 2.0, w: 12 }); rio.rotation.y = Math.PI / 2;
    L.ator(Object.assign({}, L.JU_ANDA, { x: -2.0, z: 0.9, D, t: -1, mov: [[0, -2.0], [D - 0.2, 0.15, 0.9, 'lin']], descalco: true, naMao: (m, op) => L.sandalia(m, op) }));
    L.CAM([[0, [-0.9, 1.3, 7.4], [-0.6, 0.85, 0.7]], [D, [-0.3, 1.2, 6.6], [0.0, 0.8, 0.7]]]);
    L.veu(0x0e2a14, 0.12);
  },
  // 14 de cima: o riacho serpenteando na floresta imensa, ela pequenininha dentro
  (P, L, D) => {
    const rio = (x) => Math.sin(x * 0.55) * 1.4 + 0.2;
    L.copas({ semente: 21, n: 170, rio });
    const g = P.grupo({ x: -0.6, y: 0.06, z: rio(-0.6) });
    P.deitado(P.F.circulo(0.07), { pai: g, prof: 0.02, cor: 0x8a6440, x: 0.0, z: -0.09, ...L.FX });
    P.deitado(P.F.poligono([[-0.06, 0], [0.06, 0], [0.08, 0.18], [-0.08, 0.18]]), { pai: g, prof: 0.02, cor: 0x8fa6b4, ...L.FX });
    P.animar((ts, t) => { g.position.x = -0.6 + t * 0.06; g.position.z = rio(g.position.x); });
    L.neblina({ n: 2, y: 0.5 });
    P.foco = [0, 0.01];
    L.CAM([[0, [-0.6, 4.5, 1.6], [-0.6, 0, 0.6]], [D, [0.0, 11.0, 1.4], [0, 0, 0]]]);
  },
];
