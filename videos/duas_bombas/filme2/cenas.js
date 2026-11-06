// Parte 2 como cena de filme (Nagasaki). Cada item = uma cena (P, L, D).
const TSU = { nome: 'tsutomu', band: true }, ESP = { nome: 'esposa', roupa: 0x7a8fb0, saia: 0x56688a, coque: true, s: 0.92 };
const CHE = { nome: 'chefe', roupa: 0x4f535e, terno: true, cabelo: 0x8a8580, s: 1.0 };
const CHAO = (P, cor = 0xb7a98f, z = 0.6, w = 1.4) => P.deitado(P.F.ret(7.2, w, 0.02), { prof: 0.01, cor, z, t: 0, entra: 'fixo', esboco: false });
const CAMK = (P, ks) => P.camera(ks.map(([t, pos, alvo]) => ({ t, pos, alvo })));
const MAR = (P) => { P.deitado(P.F.ret(7.2, 2.2, 0.05), { prof: 0.02, cor: 0x8cc3e8, z: -2.8, t: 0, entra: 'fixo', esboco: false }); };
// escritório: parede, janela grande com a cidade lá fora, mesa
const ESCRITORIO = (P, L, o = {}) => {
  P.peca(P.F.ret(8, 5.5, 0.04), { prof: 0.03, cor: 0xe2d6bc, y: 2.4, z: -1.5, t: -1, entra: 'fixo', esboco: false });
  const jan = P.grupo({ x: 0.2, y: 2.55, z: -1.45 });
  P.peca(P.F.ret(2.6, 1.5, 0.03), { pai: jan, prof: 0.03, cor: 0x9fc9e6, t: -1, entra: 'fixo', esboco: false });
  [[-0.8, 0.95], [0.1, 1.15], [0.85, 0.9]].forEach(([x, h]) => P.peca(P.F.ret(0.55, h * 0.6, 0.02), { pai: jan, prof: 0.02, cor: 0xb8b0a0, x, y: -0.75 + h * 0.3, z: 0.02, t: -1, entra: 'fixo', esboco: false }));
  const vidros = [];
  if (!o.quebrada) {
    [[-0.65, 0], [0.65, 0]].forEach(([x]) => vidros.push(P.peca(P.F.ret(1.22, 1.38, 0.02), { pai: jan, prof: 0.01, cor: 0xd8ecf6, x, z: 0.05, t: -1, entra: 'fixo', esboco: false })));
    vidros.forEach((v) => v.children[0].material && (v.children[0].material[0].transparent = true, v.children[0].material[0].opacity = 0.35));
  }
  [[0, 0, 2.7, 0.08], [0, 0.72, 2.7, 0.08], [0, -0.72, 2.7, 0.08], [-1.32, 0, 0.08, 1.5], [1.32, 0, 0.08, 1.5], [0, 0, 0.07, 1.5]].forEach(([x, y, w, h]) =>
    P.peca(P.F.ret(w, h, 0.01), { pai: jan, prof: 0.06, cor: 0x6a4026, x, y, z: 0.06, rz: o.quebrada && w < 1 ? 0.2 : 0, t: -1, entra: 'fixo', esboco: false }));
  CHAO(P, 0x9a7b56, 0.3, 3.4);
  const m = P.grupo({ x: 0.05, z: -0.45 });
  P.caixa(1.8, 0.1, 0.9, { pai: m, y: 0.85, cor: 0x8e5a36, t: -1, entra: 'fixo', esboco: false });
  [-0.8, 0.8].forEach((x) => P.caixa(0.1, 0.8, 0.8, { pai: m, x, y: 0.4, cor: 0x6a4026, t: -1, entra: 'fixo', esboco: false }));
  P.peca(P.F.ret(0.6, 0.04, 0.01), { pai: m, prof: 0.4, cor: 0xf8f3e8, x: -0.3, y: 0.92, t: -1, entra: 'fixo', esboco: false });
  return { jan, vidros, mesa: m };
};
window.EP = [
  // 1 recap: trem chegando em Nagasaki
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5 }); L.ceu({ semente: 19 }); MAR(P); L.ondas(-2.5);
    L.navio({ x: -1.6, z: -2.7, s: 0.5, t: 0.1 });
    L.cidade({ z: -1.4, t: 0.1, semente: 12, n: 7 });
    const tr = L.trem({ x0: -4.5, x1: -0.2, t0: 0.3, t1: 6.5, z: 0.8, t: 0 });
    P.peca(P.F.ret(0.62, 0.38, 0.02), { pai: tr, prof: 0.03, cor: 0x2f6b4f, x: -0.55, y: 0.41, z: 0.5, t: -1, entra: 'fixo', esboco: false });
    L.ator({ ...TSU, pai: tr, x: -0.55, y: 0.3, z: 0.42, s: 0.28, D, t: -1, poses: [[0, 'sentado+ferido']] });
    CAMK(P, [[0, [0.0, 6.5, 12.5], [0.0, 0.8, -1.0]], [D, [-0.4, 3.0, 9.8], [-0.4, 1.1, 0.2]]]);
  },
  // 2 em casa: "Tsutomu?! Meu Deus... o que aconteceu contigo?" / "Calma... eu tô vivo. Eu voltei pra casa."
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0xc6dcea }); L.ceu({ semente: 23 });
    L.cidade({ z: -2.4, t: -1, semente: 12, n: 7 });
    L.casa({ x: 1.6, z: -0.9, w: 2.2, h: 1.6, t: 0.05, cor: 0xe2cfa6 });
    L.arvore({ x: -2.1, z: -1.1, t: 0.1 });
    CHAO(P, 0xc9b896, 0.5);
    L.ator({ ...TSU, x: -3.2, z: 0.6, D, t: -1, mov: [[0, -3.2], [2.6, -0.75]], poses: [[0, 'ferido'], [2.6, 'normal', 0.5], [13.2, 'abre_bracos', 0.4]] });
    L.ator({ ...ESP, x: 0.9, z: 0.45, D, t: 0.2, dir: -1, mov: [[0, 0.9], [11.8, 0.9], [13.4, 0.1]], poses: [[0, 'normal'], [3.0, 'mao_cabeca', 0.25], [6.0, 'normal', 0.5], [13.1, 'abre_bracos', 0.4]] });
    CAMK(P, [[0, [0.2, 3.0, 10.6], [0.1, 1.5, 0.2]], [3, [0.1, 3.0, 10.2], [0.1, 1.5, 0.2]], [D, [-0.1, 2.7, 9.2], [-0.1, 1.5, 0.3]]]);
  },
  // 3 Três dias depois... todo enfaixado, ele voltou pro trabalho.
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5 }); L.ceu({ semente: 31 });
    MAR(P); L.navio({ x: 1.6, z: -2.6, s: 0.6, t: 0.05 });
    P.caixa(2.4, 2.0, 0.9, { x: 1.3, y: 1.0, z: -1.2, cor: 0xcdb48a, t: 0.05 });
    for (let i = 0; i < 6; i++) P.peca(P.F.ret(0.3, 0.35, 0.02), { prof: 0.02, cor: 0x7d9ac4, x: 0.55 + (i % 3) * 0.75, y: 0.7 + Math.floor(i / 3) * 0.75, z: -0.74, t: 0.2 + i * 0.05, esboco: false });
    P.peca(P.F.ret(2.0, 0.3, 0.02), { prof: 0.04, cor: 0xf2e4c4, x: 1.3, y: 2.25, z: -0.74, t: 0.3 });
    P.texto('MITSUBISHI', { tam: 0.22, prof: 0.03, cor: P.CORES.VERMELHO, x: 1.3, y: 2.17, z: -0.7, t: 0.4, entra: 'pop' });
    L.guindaste({ x: -1.5, z: -1.6, t: 0.1 });
    CHAO(P, 0xa9a196, 0.6);
    L.ator({ ...TSU, x: -2.6, z: 0.6, D, t: -1, mov: [[0, -2.6], [D, 1.6, 0.6, 'lin']], poses: [[0, 'ferido']] });
    CAMK(P, [[0, [-1.8, 3.2, 10.6], [-1.6, 1.6, 0.0]], [D, [1.0, 3.2, 10.6], [1.0, 1.6, 0.0]]]);
  },
  // 4 escritório: "Yamaguchi?! O que aconteceu em Hiroshima?" / "Uma bomba só... destruiu a cidade inteira."
  (P, L, D) => {
    ESCRITORIO(P, L);
    L.ator({ ...CHE, x: 0.95, z: 0.3, D, t: -1, dir: -1, poses: [[0, 'normal']] });
    L.ator({ ...TSU, x: -0.9, z: 0.55, D, t: -1, mov: [[0, -2.6], [1.6, -0.9]], poses: [[0, 'ferido'], [1.6, 'normal', 0.4], [6.2, 'abre_bracos', 0.4], [8.4, 'ferido', 0.5]] });
    CAMK(P, [[0, [0.3, 3.0, 10.6], [0.0, 1.6, 0.0]], [D, [0.0, 2.8, 9.8], [0.0, 1.6, 0.1]]]);
  },
  // 5 o chefe não acredita: "Uma bomba só? Tu é engenheiro, rapaz! Isso é impossível... tu tá louco!"
  (P, L, D) => {
    ESCRITORIO(P, L);
    L.ator({ ...CHE, x: 1.2, z: 0.3, D, t: -1, dir: -1, mov: [[0, 0.95], [2.0, 0.95], [3.0, 0.6]], poses: [[0, 'normal'], [0.6, 'abre_bracos', 0.3], [2.4, 'bracos_cima', 0.3], [4.4, 'aponta', 0.3], [7.4, 'normal', 0.5]] });
    L.ator({ ...TSU, x: -0.9, z: 0.55, D, t: -1, poses: [[0, 'ferido'], [5.2, 'mao_cabeca', 0.4]] });
    CAMK(P, [[0, [1.2, 2.7, 8.6], [0.3, 1.8, 0.2]], [D, [0.9, 2.5, 7.8], [0.3, 1.8, 0.2]]]);
  },
  // 6 Eram onze horas da manhã. (relógio na parede)
  (P, L, D) => {
    P.peca(P.F.ret(8, 5.5, 0.04), { prof: 0.03, cor: 0xe2d6bc, y: 2.4, z: -1.5, t: -1, entra: 'fixo', esboco: false });
    L.relogio({ y: 1.9, z: -0.2, t: 0.05, s: 1.15, hora: 11, min0: 1.2, min1: 2, D });
    CAMK(P, [[0, [0.3, 2.6, 7.8], [0, 1.9, -0.2]], [D, [0.1, 2.3, 6.6], [0, 1.9, -0.2]]]);
  },
  // 7 "Esse clarão... de novo não!" -> clarão na janela, onda de choque, vidro estoura, os dois são jogados
  (P, L, D) => {
    const E = ESCRITORIO(P, L);
    const luz = P.peca(P.F.estrela(1.2, 0.6, 12), { pai: E.jan, prof: 0.01, cor: 0xfff2b0, z: 0.03, t: -1, entra: 'fixo', esboco: false });
    P.animar((ts, t) => { const k = L.sm((t - 0.3) / 3.3); luz.children[0].scale.setScalar(Math.max(0.01, k * (1 + Math.sin(t * 20) * 0.05))); E.vidros.forEach((v) => v.visible = t < 4.4); });
    L.flash(3.7, 1.4, 0xfff4d0);
    L.destrocos({ t: 4.35, x: 1.4, y: 2.0, z: -1.2, n: 30, semente: 44 });
    P.animar((ts, t) => { const k = t > 4.4 ? Math.min(1, (t - 4.4) / 0.3) : 0; E.mesa.rotation.z = 0.25 * k; E.mesa.position.x = 0.05 - 0.4 * k; });
    L.ator({ ...CHE, x: 1.25, z: 0.3, D, t: -1, dir: -1, poses: [[0, 'normal'], [0.6, 'olha_cima', 0.4], [3.7, 'protege', 0.15], [4.4, 'voando', 0.1], [5.2, 'deitado', 0.18]], voo: { t0: 4.4, t1: 5.2, dx: -0.9, h: 0.5, giro: Math.PI * 2 } });
    L.ator({ ...TSU, x: -1.0, z: 0.6, D, t: -1, poses: [[0, 'ferido'], [0.4, 'olha_cima', 0.3], [1.6, 'aponta_cima', 0.3], [3.7, 'protege', 0.15], [4.45, 'voando', 0.1], [5.25, 'deitado', 0.18]], voo: { t0: 4.45, t1: 5.25, dx: -1.0, h: 0.6, giro: Math.PI * 2 } });
    L.veu(0x6a3a18, (t) => 0.3 * L.sm((t - 4.6) / 1.2));
    L.tremor([[3.7, 0.05, 0.8], [4.4, 0.22, 2.2]]);
    CAMK(P, [[0, [0.4, 2.9, 10.2], [0.1, 1.7, 0.0]], [4.4, [0.3, 2.9, 10.0], [0.0, 1.6, 0.0]], [D, [-0.6, 2.6, 9.8], [-0.7, 1.3, 0.2]]]);
  },
  // 8 Uma segunda bomba atômica tinha caído... em Nagasaki.
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0xd8c4a4 }); MAR(P); L.ondas(-2.5);
    L.cidade({ z: -1.2, t: -1, semente: 12, n: 8 });
    L.boladefogo({ x: 0.3, y: 0.9, z: -2.6, t: 0.0, s: 1.3, dur: 9 });
    L.cogumelo({ x: 0.3, z: -2.7, s: 1.1, t: 0, t0: 0.2, t1: D });
    L.veu(0x6a3a18, (t) => 0.22 * L.sm(t / 2));
    L.tremor([[0.2, 0.06, 2.0]]);
    CAMK(P, [[0, [0.0, 2.4, 9.6], [0.0, 1.6, -1.2]], [D, [0.2, 3.4, 11.6], [0.2, 2.2, -1.4]]]);
  },
  // 9 E sabe a que distância ele tava dessa vez? (escritório destruído, ele no chão)
  (P, L, D) => {
    const E = ESCRITORIO(P, L, { quebrada: true });
    { const gq = P.grupo({ pai: E.jan, y: -0.72, z: 0.03 }); L.cogumelo({ pai: gq, x: 0.35, z: 0, s: 0.36, t: 0, t0: -2, t1: 0.1 }); }
    const r = P.fixo(8);
    for (let i = 0; i < 9; i++) P.peca(P.F.poligono([[0, 0], [0.4 + r() * 0.3, 0.04], [0.15, 0.25 + r() * 0.2]]), { prof: 0.04, cor: [0x9a948a, 0xd8ecf6, 0x6b5a48][i % 3], x: -2.4 + i * 0.6, y: 0, z: -0.1 + r() * 0.6, rz: r() - 0.5, t: -1, entra: 'fixo', esboco: false });
    L.fumaca(null, 1.0, 1.6, -1.3);
    L.ator({ ...TSU, x: -0.1, z: 0.6, D, t: -1, poses: [[0, 'deitado'], [2.4, 'deitado_mexe', 0.8]] });
    L.veu(0x6a3a18, 0.3);
    CAMK(P, [[0, [0.3, 2.6, 9.4], [-0.4, 1.0, 0.0]], [D, [0.1, 2.2, 8.4], [-0.4, 0.9, 0.1]]]);
  },
  // 10 Três quilômetros. De novo. (ele levanta e olha o cogumelo pela janela quebrada)
  (P, L, D) => {
    const E = ESCRITORIO(P, L, { quebrada: true });
    { const gq = P.grupo({ pai: E.jan, y: -0.72, z: 0.03 }); L.cogumelo({ pai: gq, x: 0.35, z: 0, s: 0.36, t: 0, t0: -2, t1: 0.1 }); }
    L.ator({ ...TSU, x: -0.1, z: 0.6, D, t: -1, poses: [[0, 'deitado_mexe'], [0.4, 'ajoelhado', 1.0], [2.0, 'curvado', 0.9], [3.2, 'curvado+olha_cima', 0.6]] });
    L.veu(0x6a3a18, 0.26);
    CAMK(P, [[0, [0.5, 2.4, 8.6], [-0.1, 1.3, 0.0]], [D, [0.5, 2.7, 9.8], [0.0, 1.8, -0.4]]]);
  },
  // 11 Será que ele sobreviveu? A parte três já tá no meu perfil... me segue!
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0xc9a27a }); MAR(P);
    L.cogumelo({ x: 0.9, z: -2.7, s: 1.1, t: 0, t0: -2, t1: 0.1 });
    const cid = L.cidade({ z: -1.2, t: -1, semente: 12, n: 8, cor: 0xbfae94, teto: 0x4a3a30 });
    cid.children.forEach((c, i) => { c.rotation.z = 0.3 + (i % 3) * 0.15; c.position.y = -0.1; });
    L.fumaca(null, -1.6, 0.6, -0.9); L.fumaca(null, 1.8, 0.6, -0.8);
    L.txt('?', { x: 0, z: 1.3, tam: 1.6, t: 1.2, entra: 'pop' });
    L.veu(0x6a3a18, 0.2);
    CAMK(P, [[0, [0.0, 4.4, 11.6], [0.2, 1.6, -0.6]], [D, [0.0, 4.0, 10.6], [0.2, 1.5, -0.4]]]);
  },
];
