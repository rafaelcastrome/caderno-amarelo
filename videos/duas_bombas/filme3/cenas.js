// Parte 3 como cena de filme (o final). Cada item = uma cena (P, L, D).
const TSU = { nome: 'tsutomu', band: true }, ESP = { nome: 'esposa', roupa: 0x7a8fb0, saia: 0x56688a, coque: true, s: 0.92 };
const VELHO = { nome: 'tsutomu', cabelo: 0xd9d4cb, oculos: true, roupa: 0x6d7f8e, calca: 0x3d3a36 };
const VELHA = { roupa: 0x9a7f9c, saia: 0x6e5a70, coque: true, cabelo: 0xd9d4cb, s: 0.9 };
const CHAO = (P, cor = 0xb7a98f, z = 0.6, w = 1.4) => P.deitado(P.F.ret(7.2, w, 0.02), { prof: 0.01, cor, z, t: 0, entra: 'fixo', esboco: false });
const CAMK = (P, ks) => P.camera(ks.map(([t, pos, alvo]) => ({ t, pos, alvo })));
const MAR = (P, cor = 0x8cc3e8) => { P.deitado(P.F.ret(7.2, 2.2, 0.05), { prof: 0.02, cor, z: -2.8, t: 0, entra: 'fixo', esboco: false }); };
const FX = { t: -1, entra: 'fixo', esboco: false };
// sala: parede de madeira clara, rodapé e chão de tatame
const SALA = (P, cor = 0xd9c6a2) => {
  P.peca(P.F.ret(8, 5.5, 0.04), { prof: 0.03, cor, y: 2.4, z: -1.5, ...FX });
  for (let i = 0; i < 6; i++) P.peca(P.F.ret(0.06, 5.5, 0.01), { prof: 0.02, cor: 0xb39a72, x: -3.0 + i * 1.2, y: 2.4, z: -1.47, ...FX });
  CHAO(P, 0xc9b98a, 0.3, 3.4);
};
// tsuru (garça de origami) voando: mov(t) -> [x, y]
const TSURU = (P, L, o) => {
  const g = P.grupo({ x: o.x, y: o.y, z: o.z ?? -1 }); g.scale.setScalar(o.s ?? 0.5);
  P.peca(P.F.poligono([[-0.6, 0], [0.5, 0.05], [0.75, 0.32], [0.6, 0.06], [0.2, -0.12], [-0.3, -0.1]]), { pai: g, prof: 0.02, cor: o.cor ?? 0xe8452f, ...FX });
  const asa = P.grupo({ pai: g, z: 0.03 });
  P.peca(P.F.poligono([[-0.25, 0], [0.25, 0], [-0.05, 0.75]]), { pai: asa, prof: 0.02, cor: o.cor2 ?? 0xf2a33a, ...FX });
  P.animar((ts, t) => { const [x, y] = o.mov(t); g.position.x = x; g.position.y = y; asa.scale.y = Math.cos(t * 7 + (o.f ?? 0)); });
  return g;
};
// carimbo: anel + texto
const SELO = (P, pai, x, y, txt, t, cor = 0xc8302a, vazio = false) => {
  P.peca(P.F.anel(0.5, 0.42), { pai, prof: 0.02, cor, x, y, z: 0.05, rz: 0.2, t, entra: 'pop', dur: 0.2, esboco: false });
  P.texto(txt, { pai, tam: vazio ? 0.42 : 0.17, prof: 0.02, cor, x, y: y - (vazio ? 0.14 : 0.06), z: 0.06, t: t + 0.1, entra: 'pop', passo: 0.01 });
};
const RUINAS = (P, L, o = {}) => {
  const cid = L.cidade({ z: o.z ?? -1.2, t: -1, semente: o.semente ?? 12, n: 8, cor: 0xbfae94, teto: 0x4a3a30 });
  cid.children.forEach((c, i) => { c.rotation.z = 0.3 + (i % 3) * 0.15; c.position.y = -0.1; });
  return cid;
};
window.EP = [
  // 1 recap: Nagasaki destruída, ele olha o cogumelo... e vira pra ir procurar a família
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0xc9a27a }); MAR(P, 0x9ab4c4);
    L.cogumelo({ x: 1.1, z: -2.7, s: 1.1, t: 0, t0: -2, t1: 0.1 });
    RUINAS(P, L);
    L.fumaca(null, -1.8, 0.6, -0.9); L.fumaca(null, 2.0, 0.6, -0.8);
    CHAO(P, 0x9f9282, 0.6);
    L.ator({ ...TSU, x: -0.3, z: 0.6, D, t: -1, mov: [[0, -0.3], [6.8, -0.3], [D, -3.4, 0.6, 'lin']], dirs: [[0, 1], [6.6, -1]], poses: [[0, 'curvado+olha_cima'], [6.4, 'ferido', 0.5]] });
    L.veu(0x6a3a18, 0.18);
    CAMK(P, [[0, [0.5, 3.2, 13.0], [0.5, 2.6, -1.0]], [6.5, [0.2, 3.0, 11.6], [0.1, 2.2, -0.6]], [D, [-1.2, 3.0, 11.0], [-1.4, 1.8, -0.2]]]);
  },
  // 2 casa destruída: "Cadê vocês?! Respondam!" / "Tsutomu! A gente tá aqui... a gente tá bem!" / "Vocês tão vivos... graças a Deus." + abraço
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0xc9ab86 }); L.ceu({ semente: 41 });
    RUINAS(P, L, { z: -2.2, semente: 17 });
    // restos da casa: paredes tortas e tábuas
    P.peca(P.F.poligono([[-0.9, 0], [0.9, 0], [0.8, 1.1], [-0.2, 1.4], [-0.95, 0.7]]), { prof: 0.08, cor: 0xd8c39a, x: -1.6, y: 0, z: -0.9, ...FX });
    P.peca(P.F.ret(0.4, 0.7, 0.02), { prof: 0.02, cor: 0x3a2a20, x: -1.4, y: 0.35, z: -0.85, ...FX });
    P.peca(P.F.poligono([[0, 0], [1.6, 0], [1.4, 0.5], [0.3, 0.9]]), { prof: 0.08, cor: 0x5a3a2c, x: 1.4, y: 0, z: -1.0, rz: 0.08, ...FX });
    const r = P.fixo(5);
    for (let i = 0; i < 7; i++) P.peca(P.F.ret(0.9 + r() * 0.5, 0.08, 0.01), { prof: 0.06, cor: [0x7b4a2b, 0x5a3a2c, 0x9a948a][i % 3], x: -2.8 + i * 0.9, y: 0.06, z: -0.3 + r() * 0.4, rz: (r() - 0.5) * 0.5, ...FX });
    L.fumaca(null, 1.9, 0.5, -1.0);
    CHAO(P, 0xa99a86, 0.5);
    L.ator({ ...TSU, x: -3.4, z: 0.6, D, t: -1, mov: [[0, -3.4], [2.6, -0.6], [12.2, -0.6], [13.8, 0.42]], dirs: [[0, 1], [4.6, -1], [5.3, 1]],
      poses: [[0, 'ferido'], [0.8, 'abre_bracos', 0.4], [4.3, 'ferido', 0.5], [5.4, 'olha_cima', 0.3], [6.4, 'ferido', 0.5], [11.2, 'mao_cabeca', 0.4], [12.4, 'normal', 0.4], [13.7, 'abraco', 0.5]] });
    L.ator({ ...ESP, bebe: true, x: 3.8, z: 0.45, D, t: -1, dir: -1, mov: [[0, 3.8], [5.0, 3.8], [8.6, 1.1], [13.8, 1.05]], poses: [[0, 'carrega']] });
    CAMK(P, [[0, [0.0, 3.0, 10.8], [0.0, 1.5, 0.2]], [8, [0.3, 3.0, 10.4], [0.3, 1.5, 0.2]], [D, [0.6, 2.6, 8.6], [0.7, 1.4, 0.3]]]);
  },
  // 3 noite: doente na cama, esposa cuidando, vela
  (P, L, D) => {
    SALA(P, 0xc9b08a);
    P.deitado(P.F.ret(2.6, 1.0, 0.04), { prof: 0.08, cor: 0xe8e0cc, x: 0.0, z: 0.45, t: 0, entra: 'fixo', esboco: false }); // futon
    P.peca(P.F.ret(0.5, 0.18, 0.06), { prof: 0.3, cor: 0xf4efe2, x: -1.0, y: 0.15, z: 0.45, ...FX }); // travesseiro
    L.ator({ ...TSU, x: 0.35, z: 0.5, D, t: -1, poses: [[0, 'deitado'], [2.4, 'deitado_mexe', 0.7], [4.2, 'deitado', 0.8], [7.0, 'deitado_mexe', 0.6], [8.4, 'deitado', 0.8]] });
    L.ator({ ...ESP, x: -1.75, z: 0.85, D, t: -1, dir: 1, poses: [[0, 'ajoelhado'], [1.8, 'ajoelhado+apoia', 0.6], [5.0, 'ajoelhado', 0.6], [7.6, 'ajoelhado+apoia', 0.6]] });
    // vela
    P.peca(P.F.ret(0.12, 0.35, 0.02), { prof: 0.12, cor: 0xf4efe2, x: 1.85, y: 0.18, z: 0.7, ...FX });
    const ch = P.peca(P.F.estrela(0.12, 0.06, 6), { prof: 0.02, cor: 0xffc84a, x: 1.85, y: 0.45, z: 0.72, ...FX });
    P.animar((ts, t) => { ch.children[0].scale.set(1 + Math.sin(t * 13) * 0.12, 1 + Math.sin(t * 9 + 1) * 0.2, 1); });
    L.noite(0.42);
    CAMK(P, [[0, [-0.4, 3.4, 10.0], [-0.5, 1.0, 0.3]], [D, [-0.6, 3.0, 8.8], [-0.7, 1.0, 0.4]]]);
  },
  // 4 15 de agosto: família no chão ouvindo o rádio... a guerra acabou
  (P, L, D) => {
    SALA(P);
    const rd = L.radio({ x: 1.6, z: 0.0, t: -1 }); rd.scale.setScalar(0.75);
    const ondas = [0, 1, 2].map((i) => P.peca(P.F.arco(0.25 + i * 0.18, 0.2 + i * 0.18, -0.9, 0.9), { prof: 0.02, cor: 0x5a3a2c, x: 1.0, y: 1.0, z: 0.1, rz: Math.PI, ...FX }));
    P.animar((ts, t) => ondas.forEach((o, i) => { o.visible = ((t * 2 + i * 0.33) % 1) < 0.6; }));
    L.ator({ ...TSU, x: -0.2, z: 0.5, D, t: -1, poses: [[0, 'sentado_chao'], [3.0, 'sentado_chao+mao_cabeca', 0.6]] });
    L.ator({ ...ESP, bebe: true, x: -1.3, z: 0.75, D, t: -1, poses: [[0, 'sentado_chao+carrega']] });
    CAMK(P, [[0, [0.0, 3.0, 10.2], [0.0, 1.2, 0.2]], [D, [-0.1, 2.8, 9.4], [-0.1, 1.2, 0.2]]]);
  },
  // 5 recuperou, voltou pros navios, a família cresceu
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5 }); L.ceu({ semente: 52 }); L.sol({ x: 2.4, y: 3.6, z: -2.8, t: -1 });
    MAR(P); L.ondas(-2.5); L.navio({ x: 0.8, z: -2.6, s: 0.7, t: 0.05 }); L.guindaste({ x: -1.8, z: -1.6, t: 0.1 });
    CHAO(P, 0xb7a98f, 0.6);
    const mv = (x0) => [[0, x0], [D, x0 + 2.8, 0.6, 'lin']];
    L.ator({ nome: 'tsutomu', roupa: 0xe8e2d2, x: -2.2, z: 0.55, D, t: -1, mov: mv(-2.2) });
    L.ator({ ...ESP, x: -3.0, z: 0.75, D, t: -1, mov: mv(-3.0).map(([t, x, z, e]) => [t, x, 0.75, e]) });
    L.ator({ roupa: 0xe8452f, calca: 0x34343e, x: -1.5, z: 0.85, s: 0.58, D, t: -1, mov: mv(-1.5).map(([t, x, z, e]) => [t, x, 0.85, e]) });
    L.ator({ roupa: 0xf2c94c, saia: 0x6a8fb8, coque: true, x: -0.95, z: 0.95, s: 0.5, D, t: -1, mov: mv(-0.95).map(([t, x, z, e]) => [t, x, 0.95, e]) });
    CAMK(P, [[0, [-1.8, 3.2, 10.4], [-1.8, 1.4, 0.2]], [D, [0.6, 3.2, 10.4], [0.6, 1.4, 0.2]]]);
  },
  // 6 no papel: só Nagasaki
  (P, L, D) => {
    P.peca(P.F.ret(8, 6, 0.04), { prof: 0.03, cor: 0x8e5a36, y: 2.0, z: -0.4, ...FX });
    const doc = L.documento({ x: 0, y: 1.9, z: 0.0, t: -1 });
    SELO(P, doc, -0.55, -0.75, 'NAGASAKI', 1.2 * 2);
    SELO(P, doc, 0.6, -0.75, '?', 3.6 * 2, 0x9a948a, true);
    CAMK(P, [[0, [0.0, 2.2, 8.6], [0.0, 1.8, 0.0]], [D, [0.0, 1.7, 7.0], [0.0, 1.5, 0.0]]]);
  },
  // 7 2009: velhinho, o funcionário carimba HIROSHIMA
  (P, L, D) => {
    SALA(P, 0xe2d6bc);
    const m = P.grupo({ x: 0.4, z: -0.3 });
    P.caixa(1.8, 0.1, 0.9, { pai: m, y: 0.85, cor: 0x8e5a36, ...FX });
    [-0.8, 0.8].forEach((x) => P.caixa(0.1, 0.8, 0.8, { pai: m, x, y: 0.4, cor: 0x6a4026, ...FX }));
    const doc = L.documento({ x: 0.15, y: 1.42, z: 0.0, t: -1 }); doc.scale.setScalar(0.3);
    SELO(P, doc, -0.55, -0.75, 'NAGASAKI', -1);
    SELO(P, doc, 0.6, -0.75, 'HIROSHIMA', 6.55 * 2);
    L.ator({ nome: 'func', roupa: 0x4f535e, terno: true, x: 1.3, z: 0.0, D, t: -1, dir: -1, poses: [[0, 'normal'], [5.6, 'bracos_cima', 0.4], [6.4, 'apoia', 0.12], [7.4, 'normal', 0.6]] });
    L.ator({ ...VELHO, x: -3.2, z: 0.6, D, t: -1, mov: [[0, -3.4], [5.0, -0.8]], poses: [[0, 'velho'], [7.4, 'velho+mao_cabeca', 0.7], [9.6, 'velho', 0.7]] });
    L.tremor([[6.5, 0.04, 0.4]]);
    CAMK(P, [[0, [-0.6, 2.8, 10.2], [-0.5, 1.5, 0.0]], [5.6, [0.35, 2.8, 9.8], [0.35, 1.5, 0.0]], [7.2, [0.15, 1.9, 4.6], [0.15, 1.45, 0.0]], [D, [0.15, 1.8, 4.1], [0.15, 1.42, 0.0]]]);
  },
  // 8 o único da história: estrela dourada
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0x2b3550 });
    const e = P.peca(P.F.estrela(1.5, 0.7, 5), { prof: 0.08, cor: 0xf6c33a, y: 2.6, z: -1, t: 0.3, entra: 'pop' });
    const raio = P.peca(P.F.estrela(2.6, 1.6, 16), { prof: 0.02, cor: 0x4a5578, y: 2.6, z: -1.2, t: 0.1, entra: 'pop' });
    P.animar((ts, t) => { raio.rotation.z = t * 0.4; e.rotation.z = Math.sin(t * 2) * 0.06; });
    CHAO(P, 0x3a4058, 0.5);
    L.ator({ ...VELHO, x: -0.2, z: 0.6, D, t: -1, poses: [[0, 'velho+olha_cima']] });
    CAMK(P, [[0, [0.0, 2.6, 9.6], [0.0, 2.0, -0.4]], [D, [0.0, 2.6, 8.8], [0.0, 2.0, -0.4]]]);
  },
  // 9 velhinho conta pros netos: "Eu sobrevivi pra contar... pra que isso nunca mais aconteça."
  (P, L, D) => {
    SALA(P, 0xe2cfa6);
    const jan = P.grupo({ x: 1.2, y: 2.4, z: -1.45 });
    P.peca(P.F.ret(1.6, 1.2, 0.03), { pai: jan, prof: 0.03, cor: 0xf2b27a, ...FX });
    P.peca(P.F.circulo(0.25), { pai: jan, prof: 0.02, cor: 0xf6d24a, y: -0.2, z: 0.02, ...FX });
    [[0, 0, 1.7, 0.08], [0, 0.6, 1.7, 0.08], [0, -0.6, 1.7, 0.08], [-0.8, 0, 0.08, 1.2], [0.8, 0, 0.08, 1.2], [0, 0, 0.06, 1.2]].forEach(([x, y, w, h]) => P.peca(P.F.ret(w, h, 0.01), { pai: jan, prof: 0.05, cor: 0x6a4026, x, y, z: 0.04, ...FX }));
    for (let i = 0; i < 5; i++) TSURU(P, L, { x: -2.2 + i * 0.35, y: 3.0, z: -1.4, s: 0.28, mov: (t) => [-2.0 + i * 0.4, 2.9 - (i % 2) * 0.2 + Math.sin(t * 1.5 + i) * 0.03], f: i, cor: [0xe8452f, 0x6a8fb8, 0xf2c94c, 0x7ab37a, 0xe8452f][i] });
    L.ator({ ...VELHO, x: -0.9, z: 0.5, D, t: -1, poses: [[0, 'velho']] });
    L.ator({ roupa: 0xe8452f, x: 0.55, z: 0.75, s: 0.55, D, t: -1, dir: -1, poses: [[0, 'sentado_chao']] });
    L.ator({ roupa: 0x7ab37a, saia: 0x56688a, coque: true, x: 1.25, z: 0.6, s: 0.5, D, t: -1, dir: -1, poses: [[0, 'sentado_chao']] });
    CAMK(P, [[0, [0.0, 2.6, 9.4], [0.0, 1.5, 0.2]], [D, [-0.2, 2.4, 7.8], [-0.2, 1.6, 0.3]]]);
  },
  // 10 pôr do sol: os dois velhinhos no banco olhando o mar, tsurus passando
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0xf0a86a }); L.sol({ x: 0.8, y: 1.3, z: -3.0, t: -1, cor: 0xf6c33a, cor2: 0xf08a2a });
    MAR(P, 0x6f8fb0); L.ondas(-2.5);
    CHAO(P, 0x8f7a5a, 0.6, 1.8);
    P.caixa(1.8, 0.1, 0.5, { x: -0.2, y: 0.62, z: 0.55, cor: 0x6a4026, ...FX });
    [-0.95, 0.55].forEach((x) => P.caixa(0.1, 0.6, 0.45, { x, y: 0.3, z: 0.55, cor: 0x4a2e1c, ...FX }));
    L.ator({ ...VELHO, x: -0.6, z: 0.5, D, t: -1, poses: [[0, 'sentado+velho'], [6.0, 'sentado+olha_cima', 1.0]] });
    L.ator({ ...VELHA, x: 0.4, z: 0.62, D, t: -1, poses: [[0, 'sentado'], [6.2, 'sentado+olha_cima', 1.0]] });
    for (let i = 0; i < 6; i++) TSURU(P, L, { x: 4, y: 3, z: -1.8, s: 0.35, f: i, cor: [0xe8452f, 0xf6efe0, 0xf2c94c][i % 3], mov: (t) => [4.2 - (t - 2 - i * 0.6) * 0.9, 2.8 + (i % 3) * 0.35 + Math.sin(t * 1.3 + i) * 0.08] });
    L.veu(0x5a2a10, (t) => 0.1 + 0.12 * L.sm(t / D));
    CAMK(P, [[0, [0.6, 2.2, 9.2], [0.0, 1.6, -0.6]], [D, [0.0, 3.6, 11.6], [0.0, 2.2, -1.2]]]);
  },
  // 11 me segue: tsurus subindo, série nova vindo
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0xf6e3b8 });
    for (let i = 0; i < 9; i++) TSURU(P, L, { x: 0, y: 0, z: -1.2 + (i % 3) * 0.4, s: 0.45, f: i, cor: [0xe8452f, 0x6a8fb8, 0xf2c94c][i % 3], mov: (t) => [-2.6 + (i % 5) * 1.3 + Math.sin(t + i) * 0.2, -0.5 + (t + i * 0.7) * 0.8 % 6] });
    L.txt('FIM', { x: 0, y: 1.6, z: 0.4, tam: 0.8, t: 0.8, entra: 'pop' });
    CAMK(P, [[0, [0.0, 2.2, 10.4], [0.0, 2.0, -0.4]], [D, [0.0, 2.2, 9.8], [0.0, 2.0, -0.4]]]);
  },
];
