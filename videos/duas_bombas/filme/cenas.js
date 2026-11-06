// Parte 1 como cena de filme. Cada item = uma cena (P, L, D).
const TSU = { nome: 'tsutomu' }, AKI = { nome: 'akira', roupa: 0x5b5f6a, terno: true, chapeu: 0x4a4038, s: 0.97 };
const CHAO = (P, cor = 0xb7a98f, z = 0.6, w = 1.4) => P.deitado(P.F.ret(7.2, w, 0.02), { prof: 0.01, cor, z, t: 0, entra: 'fixo', esboco: false });
const CAMK = (P, ks) => P.camera(ks.map(([t, pos, alvo]) => ({ t, pos, alvo })));
window.EP = [
  // 1 Agosto de 1945. Japão... em plena guerra. (cidade amanhecendo, câmera desce)
  (P, L, D) => {
    L.fundoCeu({ cor: 0xf2d6ae, h: 9, y: 3.5 });
    const sol = L.sol({ x: -1.6, y: 1.6, z: -3.1, t: 0.1, cor: 0xf8c24a, cor2: 0xf09a3a });
    P.animar((ts, t) => { sol.position.y = 1.6 + t * 0.12; });
    L.ceu({ semente: 4 });
    L.cidade({ z: -2.2, t: 0.1, semente: 31, n: 9, cor: 0xe4d2b0 });
    // prédio da cúpula
    const cu = P.grupo({ x: 0.7, z: -1.3 });
    P.caixa(1.3, 1.0, 0.7, { pai: cu, y: 0.5, cor: 0xd8c39c, t: 0.4 });
    P.caixa(0.5, 0.45, 0.5, { pai: cu, y: 1.22, cor: 0xcdb48a, t: 0.6 });
    P.peca(P.F.arco(0.3, 0, 0, Math.PI), { pai: cu, prof: 0.4, cor: 0x6f8f7a, y: 1.44, t: 0.75 });
    L.cidade({ z: -0.5, t: 0.3, semente: 8, n: 5 });
    P.deitado(P.F.ret(7.2, 0.9, 0.02), { prof: 0.01, cor: 0x7fb4d8, z: 0.7, t: 0.2 });
    L.ondas(0.7);
    CAMK(P, [[0, [0.2, 7.5, 12.5], [0, 1.6, -1.0]], [D, [0.4, 2.4, 8.6], [0.3, 1.5, -1.0]]]);
  },
  // 2 Esse é o Tsutomu Yamaguchi. Desenhava navios... em Hiroshima a trabalho
  (P, L, D) => {
    P.peca(P.F.ret(8, 5.5, 0.04), { prof: 0.03, cor: 0xe9dcc0, y: 2.4, z: -1.4, t: 0, entra: 'fixo', esboco: false });
    P.peca(P.F.ret(1.5, 1.1, 0.04), { prof: 0.04, cor: 0x6a4026, x: -0.6, y: 2.7, z: -1.37, t: 0.05 });
    P.peca(P.F.ret(1.36, 0.96, 0.04), { prof: 0.04, cor: 0xa8d0ea, x: -0.6, y: 2.7, z: -1.34, t: 0.08 });
    const nv = P.peca(P.F.nuvem(0.6, 0.3), { prof: 0.02, cor: 0xfbf6ea, x: -0.8, y: 2.75, z: -1.3, t: 0.1, entra: 'pop' });
    P.animar((ts, t) => { nv.position.x = -0.95 + t * 0.06; });
    [0, 1].forEach((i) => P.peca(P.F.ret(i ? 0.05 : 1.36, i ? 0.96 : 0.05, 0.02), { prof: 0.05, cor: 0x6a4026, x: -0.6, y: 2.7, z: -1.3, t: 0.1, esboco: false }));
    CHAO(P, 0xa98a62, 0.3, 3.4);
    // prancheta de frente pra câmera, com o navio sendo desenhado
    const pr = P.grupo({ x: 0.95, y: 0, z: 0.1 });
    [-0.55, 0.55].forEach((x) => P.peca(P.F.ret(0.08, 1.4, 0.03), { pai: pr, prof: 0.06, cor: 0x6a4026, x, y: 0.7, t: 0.1 }));
    const tab = P.grupo({ pai: pr, y: 1.75, rx: -0.15 });
    P.peca(P.F.ret(1.6, 1.15, 0.04), { pai: tab, prof: 0.06, cor: 0x8e5a36, t: 0.15 });
    P.peca(P.F.ret(1.42, 0.98, 0.02), { pai: tab, prof: 0.02, cor: 0xf8f3e8, z: 0.045, t: 0.2 });
    const linhas = [[[-0.5, -0.12], [0.55, -0.12]], [[-0.5, -0.12], [-0.38, -0.3]], [[0.55, -0.12], [0.42, -0.3]], [[-0.38, -0.3], [0.42, -0.3]],
      [[-0.2, -0.12], [-0.2, 0.08]], [[-0.2, 0.08], [0.15, 0.08]], [[0.15, 0.08], [0.15, -0.12]], [[0.3, -0.12], [0.3, 0.28]], [[-0.62, -0.38], [0.66, -0.38]]];
    linhas.forEach(([[x1, y1], [x2, y2]], i) => { const L2 = Math.hypot(x2 - x1, y2 - y1);
      P.peca(P.F.ret(L2, 0.018, 0.005), { pai: tab, prof: 0.005, cor: 0x3a4a6a, x: (x1 + x2) / 2, y: (y1 + y2) / 2, z: 0.06, rz: Math.atan2(y2 - y1, x2 - x1), t: 1.6 + i * 0.9, entra: 'pop', esboco: false }); });
    P.caixa(0.55, 0.62, 0.45, { x: -0.55, y: 0.31, z: 0.35, cor: 0x7b4a2b, t: 0.1 });
    L.ator({ ...TSU, x: -0.45, z: 0.4, D, t: 0.3, poses: [[0, 'sentado+desenha'], [6.4, 'sentado+levanta_lapis', 0.5], [8.2, 'sentado+desenha', 0.5]] });
    CAMK(P, [[0, [0.6, 3.0, 9.4], [0.2, 1.7, 0.1]], [D, [0.4, 2.7, 8.0], [0.25, 1.7, 0.1]]]);
  },
  // 3 Akira chama: "Bora, que o trem não espera!" / Tsutomu: "Três meses longe de casa... hoje eu finalmente volto!"
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5 }); L.ceu({ semente: 9 });
    L.cidade({ z: -2.4, t: 0, semente: 5, n: 6 });
    L.casa({ x: -1.7, z: -0.7, w: 2.0, h: 1.5, t: 0.05, cor: 0xe2cfa6 });
    L.arvore({ x: 2.1, z: -1.0, t: 0.1 });
    CHAO(P, 0xc9b896, 0.5);
    L.ator({ ...TSU, x: -0.75, z: 0.55, D, t: 0.15, mala: true, poses: [[0, 'normal'], [7.1, 'bracos_cima', 0.3], [8.6, 'normal', 0.5]] });
    L.ator({ ...AKI, x: 3.6, z: 0.35, D, t: -1, mala: true, dir: -1, mov: [[0, 3.4], [2.6, 0.75]] });
    CAMK(P, [[0, [0.8, 3.2, 10.2], [0.5, 1.5, 0.2]], [3, [0.1, 3.0, 9.6], [0.0, 1.5, 0.2]], [D, [-0.1, 2.8, 8.8], [-0.05, 1.5, 0.3]]]);
  },
  // 4 "Ih... esqueci meu carimbo lá no estaleiro!" / "Vai lá buscar. A gente te espera na estação!"
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5 }); L.ceu({ semente: 12 });
    L.cidade({ z: -2.2, t: 0, semente: 14, n: 7 });
    CHAO(P, 0xc9b896, 0.5);
    L.ator({ ...TSU, x: -2.6, z: 0.65, D, t: -1, mala: true, mov: [[0, -2.4], [1.0, -0.85], [7.3, -0.85], [9.0, -3.6]], dirs: [[0, 1], [7.1, -1]],
      poses: [[0, 'normal'], [1.0, 'bolsos', 0.25], [2.5, 'mao_cabeca', 0.3], [4.3, 'normal', 0.4]] });
    L.ator({ ...AKI, x: -1.8, z: 0.25, D, t: -1, mala: true, mov: [[0, -1.6], [2.2, 0.75], [7.8, 0.75], [9.0, 2.4]], dirs: [[0, 1], [2.5, -1], [7.7, 1]],
      poses: [[0, 'normal'], [5.2, 'aponta', 0.3], [6.6, 'normal', 0.4]] });
    CAMK(P, [[0, [-1.0, 3.0, 9.8], [-0.9, 1.5, 0.3]], [2.5, [-0.1, 3.0, 9.8], [-0.05, 1.5, 0.3]], [7, [0.0, 2.9, 9.4], [0.0, 1.5, 0.3]], [D, [-0.6, 2.9, 9.6], [-0.6, 1.5, 0.3]]]);
  },
  // 5 Ele voltou sozinho pro estaleiro. Eram oito e quinze da manhã. (câmera acompanha ele andando)
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5 }); L.ceu({ semente: 3 });
    P.deitado(P.F.ret(7.2, 1.3, 0.02), { prof: 0.01, cor: 0x7fb4d8, z: -2.5, t: 0, entra: 'fixo', esboco: false });
    L.navio({ x: 1.2, z: -2.3, s: 0.8, t: 0.05 });
    L.guindaste({ x: -1.0, z: -1.5, t: 0.1 }); L.guindaste({ x: 2.6, z: -1.3, t: 0.2 });
    P.caixa(1.6, 1.2, 0.8, { x: -2.6, y: 0.6, z: -1.2, cor: 0xb9a27c, t: 0.15 });
    CHAO(P, 0xa9a196, 0.6);
    L.ator({ ...TSU, x: -2.7, z: 0.6, D, t: -1, mov: [[0, -2.7], [D, 2.1, 0.6, 'lin']] });
    CAMK(P, [[0, [-2.0, 3.2, 10.6], [-1.8, 1.6, 0.0]], [D, [1.5, 3.2, 10.6], [1.4, 1.6, 0.0]]]);
  },
  // 6 barulho de avião: para, olha pra cima. "Que avião é esse lá em cima?"
  (P, L, D) => {
    L.fundoCeu({ h: 11, y: 4.5 }); L.ceu({ semente: 21, passaros: false });
    L.guindaste({ x: 1.6, z: -1.5, t: -1, entra: 'fixo' });
    CHAO(P, 0xa9a196, 0.6);
    L.ator({ ...TSU, x: -1.4, z: 0.6, D, t: -1, mov: [[0, -1.4], [1.1, -0.4]], poses: [[0, 'normal'], [1.3, 'olha_cima', 0.4], [2.9, 'aponta_cima', 0.3], [5.0, 'olha_cima', 0.5]] });
    L.b29({ s: 0.32, z: -2.6, mov: (t) => [-2.4 + t * 0.9, 4.7] });
    CAMK(P, [[0, [-1.0, 1.6, 9.4], [-0.5, 2.1, 0.0]], [2.0, [-0.9, 1.3, 9.0], [-0.2, 2.6, -0.6]], [D, [-0.7, 1.1, 8.6], [0.2, 3.3, -1.2]]]);
  },
  // 7 o avião solta a bomba, ela cai (câmera desce junto)
  (P, L, D) => {
    L.fundoCeu({ h: 12, y: 4.5, z: -3.6 }); L.ceu({ semente: 22, passaros: false });
    L.cidade({ z: -1.5, t: -1, semente: 31, n: 9, cor: 0xe4d2b0 });
    const px = (t) => -1.9 + t * 1.1, T0 = 0.8;
    L.b29({ s: 0.55, z: -2.0, mov: (t) => [px(t), 4.5] });
    L.bomba({ z: -2.05, s: 0.42, traj: (t) => { const k = t - T0; if (k < 0) return [0, 0, 0, false];
      return [px(T0) + 0.1 + 0.95 * k - 0.1 * k * k, 4.42 - 0.27 * k * k, -Math.min(1.5, k * 0.75) + Math.sin(k * 8) * 0.06 * Math.exp(-k * 0.6), true]; } });
    CAMK(P, [[0, [0.0, 3.2, 8.4], [0.0, 4.2, -2.0]], [1.2, [0.2, 3.3, 8.4], [0.4, 4.0, -2.0]], [D, [0.6, 2.0, 8.8], [1.4, 1.5, -2.0]]]);
  },
  // 8 clarão, bola de fogo, onda de choque: ele é arremessado
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5 }); L.ceu({ semente: 22, passaros: false });
    const cid = L.cidade({ z: -1.9, t: -1, semente: 31, n: 9, cor: 0xe4d2b0 });
    L.boladefogo({ x: 1.4, y: 0.9, z: -2.9, t: 0.6, s: 1.5, dur: 9 });
    L.cogumelo({ x: 1.4, z: -3.0, s: 0.95, t: 0, t0: 2.4, t1: 6.5 });
    P.animar((ts, t) => cid.children.forEach((c) => { const hx = 1.6 + (4 - (c.position.x + 0)) / 6.5; const k = L.sm((t - hx) / 0.35); c.rotation.z = 0.55 * k; c.position.y = -0.1 * k; }));
    CHAO(P, 0xa9a196, 0.6);
    L.flash(0.6, 1.3, 0xfff4d0);
    L.ondaChoque({ t: 1.6, x0: 4.2, v: 6.5 });
    L.destrocos({ t: 2.05, x: 2.4, y: 0.3, z: 0.4, n: 26 });
    L.ator({ ...TSU, x: 0.9, z: 0.7, D, t: -1, poses: [[0, 'olha_cima'], [0.7, 'protege', 0.15], [2.25, 'voando', 0.12], [3.15, 'deitado', 0.18]],
      voo: { t0: 2.25, t1: 3.15, dx: -0.9, h: 1.1, giro: Math.PI * 2 } });
    L.veu(0x6a3a18, (t) => 0.28 * L.sm((t - 2.4) / 1.2));
    L.tremor([[0.6, 0.05, 1.0], [2.2, 0.22, 1.8]]);
    CAMK(P, [[0, [0.9, 2.8, 9.6], [0.8, 1.7, -0.4]], [2.2, [0.8, 2.8, 9.6], [0.7, 1.6, -0.2]], [3.6, [-0.3, 2.6, 9.6], [-0.4, 1.3, 0.2]], [D, [-0.4, 2.5, 9.2], [-0.5, 1.3, 0.2]]]);
  },
  // 9 caído no chão. "Ele tava a três quilômetros da bomba."
  (P, L, D) => {
    L.fundoCeu({ cor: 0xc9a27a, h: 9, y: 3.5 });
    L.cogumelo({ x: 1.0, z: -2.8, s: 1.15, t: 0, t0: -2, t1: 0.1 });
    const r = P.fixo(5);
    for (let i = 0; i < 9; i++) P.peca(P.F.poligono([[0, 0], [0.5 + r() * 0.4, 0.05], [0.2, 0.3 + r() * 0.2]]), { prof: 0.05, cor: [0x6b5a48, 0x9a948a, 0x5a3a2c][i % 3], x: -2.4 + i * 0.6, y: 0.0, z: -0.6 + r() * 0.5, rz: r() - 0.5, t: 0, entra: 'fixo', esboco: false });
    [[-1.8, -0.9], [1.9, -0.6]].forEach(([x, z]) => { const f = P.peca(P.F.estrela(0.3, 0.14, 7), { prof: 0.03, cor: 0xf08a2a, x, y: 0.3, z, t: 0, entra: 'fixo', esboco: false }); P.animar((ts, t) => f.children[0].scale.set(1, 0.85 + Math.sin(t * 13 + x) * 0.2, 1)); L.fumaca(null, x, 0.5, z); });
    CHAO(P, 0x8f8676, 0.6);
    L.ator({ ...TSU, x: 0.9, z: 0.7, D, t: -1, poses: [[0, 'deitado'], [4.0, 'deitado_mexe', 0.8]] });
    L.veu(0x6a3a18, 0.26);
    CAMK(P, [[0, [0.4, 2.6, 9.8], [0.0, 1.3, -0.2]], [D, [0.2, 2.2, 8.6], [-0.1, 1.1, 0.0]]]);
  },
  // 10 ele se levanta. "E mesmo assim... tava vivo."
  (P, L, D) => {
    L.fundoCeu({ cor: 0xc9a27a, h: 9, y: 3.5 });
    L.cogumelo({ x: 1.0, z: -2.8, s: 1.15, t: 0, t0: -2, t1: 0.1 });
    L.fumaca(null, -1.9, 0.4, -0.9); L.fumaca(null, 2.0, 0.4, -0.5);
    CHAO(P, 0x8f8676, 0.6);
    L.ator({ ...TSU, x: 0.6, z: 0.7, D, t: -1, poses: [[0, 'deitado_mexe'], [0.6, 'ajoelhado', 1.2], [2.6, 'curvado', 1.0], [4.0, 'curvado+olha_cima', 0.8]] });
    L.veu(0x6a3a18, 0.24);
    CAMK(P, [[0, [0.3, 2.3, 8.8], [0.1, 1.1, 0.0]], [D, [0.6, 2.6, 9.8], [0.5, 1.6, -0.2]]]);
  },
  // 11 A cidade virou fogo. Ele passou a noite num abrigo... no escuro.
  (P, L, D) => {
    L.fundoCeu({ cor: 0x3a1c14, h: 9, y: 3.5 });
    const r = P.fixo(41);
    for (let i = 0; i < 7; i++) { const x = -2.4 + i * 0.8; P.caixa(0.6, 0.5 + r() * 0.7, 0.4, { x, y: 0.4, z: -2.4, cor: 0x2a1a14, t: -1, entra: 'fixo', esboco: false });
      const f = P.peca(P.F.estrela(0.35 + r() * 0.2, 0.15, 7), { prof: 0.03, cor: [0xf08a2a, 0xe8562a][i % 2], x, y: 1.0 + r() * 0.4, z: -2.2, t: 0, entra: 'fixo', esboco: false });
      P.animar((ts, t) => f.children[0].scale.set(1, 0.8 + Math.sin(t * (9 + i) + i) * 0.25, 1)); }
    // boca do abrigo (arco de terra) e chão de terra
    P.peca(P.F.arco(4.2, 1.9, 0, Math.PI), { prof: 0.4, cor: 0x4a3426, y: 0, z: -0.9, t: -1, entra: 'fixo', esboco: false });
    CHAO(P, 0x4f3a2a, 0.3, 3.0);
    L.ator({ ...TSU, x: 0.0, z: 0.6, D, t: -1, poses: [[0, 'sentado_chao']] });
    L.ator({ nome: 'x1', roupa: 0x6b5a48, x: -1.75, z: 0.0, s: 0.85, D, t: -1, poses: [[0, 'sentado_chao']] });
    L.ator({ nome: 'x2', roupa: 0x7a6a5a, cabelo: 0x3a3330, x: 1.75, z: 0.1, s: 0.9, dir: -1, D, t: -1, poses: [[0, 'sentado_chao']] });
    L.veu(0x0d1430, 0.42);
    CAMK(P, [[0, [0.3, 3.4, 13.0], [0, 1.6, -0.6]], [D, [0.1, 3.0, 11.6], [0.0, 1.4, -0.4]]]);
  },
  // 12 de manhã, nas ruínas: "Yamaguchi! Você tá vivo!" / "Tô... mas eu quase não tô escutando nada."
  (P, L, D) => {
    L.fundoCeu({ cor: 0xb9a48c, h: 9, y: 3.5 });
    const cid = L.cidade({ z: -2.0, t: -1, semente: 31, n: 9, cor: 0xbfae94, teto: 0x4a3a30 });
    cid.children.forEach((c, i) => { c.rotation.z = 0.35 + (i % 3) * 0.15; c.position.y = -0.12; });
    L.fumaca(null, -1.8, 0.6, -1.6); L.fumaca(null, 1.6, 0.6, -1.8);
    const r = P.fixo(9);
    for (let i = 0; i < 7; i++) P.peca(P.F.poligono([[0, 0], [0.5 + r() * 0.4, 0.05], [0.2, 0.3 + r() * 0.2]]), { prof: 0.05, cor: [0x6b5a48, 0x9a948a, 0x5a3a2c][i % 3], x: -2.6 + i * 0.85, y: 0.0, z: -0.5 + r() * 0.4, rz: r() - 0.5, t: -1, entra: 'fixo', esboco: false });
    CHAO(P, 0x8f8676, 0.6);
    P.caixa(0.7, 0.62, 0.5, { x: -0.65, y: 0.31, z: 0.45, cor: 0x7a6a5a, t: -1, entra: 'fixo', esboco: false });
    L.ator({ ...TSU, band: true, x: -0.55, z: 0.6, D, t: -1, poses: [[0, 'sentado+ferido'], [1.0, 'sentado', 0.4], [4.6, 'sentado+mao_orelha', 0.4], [7.6, 'sentado', 0.5]] });
    L.ator({ ...AKI, x: 3.4, z: 0.4, D, t: -1, dir: -1, mov: [[0, 3.4], [2.4, 0.95]], poses: [[0, 'normal'], [0.8, 'abre_bracos', 0.3], [3.2, 'normal', 0.4]] });
    L.veu(0x6a3a18, 0.14);
    CAMK(P, [[0, [0.7, 2.9, 9.8], [0.5, 1.4, 0.2]], [D, [0.25, 2.6, 9.0], [0.2, 1.4, 0.3]]]);
  },
  // 13 "Vem comigo. Vamo pra estação... a gente vai pra casa." / "Pra casa..." (saem andando)
  (P, L, D) => {
    L.fundoCeu({ cor: 0xb9a48c, h: 9, y: 3.5 });
    const cid = L.cidade({ z: -2.0, t: -1, semente: 14, n: 9, cor: 0xbfae94, teto: 0x4a3a30 });
    cid.children.forEach((c, i) => { c.rotation.z = 0.3 + (i % 3) * 0.15; c.position.y = -0.12; });
    L.fumaca(null, 0.6, 0.6, -1.8);
    CHAO(P, 0x8f8676, 0.6);
    L.ator({ ...TSU, band: true, x: -1.2, z: 0.65, D, t: -1, mov: [[0, -1.0], [2.0, -1.0], [D, 0.6]], poses: [[0, 'ferido']] });
    L.ator({ ...AKI, x: -0.3, z: 0.3, D, t: -1, dir: -1, mov: [[0, 0.2], [2.6, 0.2], [D, 2.4]], dirs: [[0, -1], [2.4, 1]], poses: [[0, 'normal'], [1.2, 'apoia', 0.3], [2.4, 'normal', 0.3]] });
    L.veu(0x6a3a18, 0.12);
    CAMK(P, [[0, [-0.4, 2.9, 9.8], [-0.4, 1.4, 0.3]], [D, [0.9, 2.8, 9.8], [0.9, 1.4, 0.3]]]);
  },
  // 14 Pegaram o trem. Foram horas de viagem... ferido, mas indo pra casa.
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0xf0c890 }); L.sol({ x: 1.8, y: 2.0, z: -3.1, t: 0.1, cor: 0xf6a04a, cor2: 0xe8813a });
    L.ceu({ semente: 17 });
    [[-2, -1.8, 0x7fb069], [0.4, -2.1, 0x9ccf6e], [2.4, -1.7, 0x6aa05a]].forEach(([x, z, c], i) => P.peca(P.F.nuvem(2.6, 1.2), { prof: 0.2, cor: c, x, z, y: 0, t: 0.1 + i * 0.1 }));
    const tr = L.trem({ x0: -4.5, x1: 4.6, t0: 0.2, t1: D + 1.2, z: 0.6, t: 0 });
    P.peca(P.F.ret(0.62, 0.38, 0.02), { pai: tr, prof: 0.03, cor: 0x2f6b4f, x: -0.55, y: 0.41, z: 0.5, t: -1, entra: 'fixo', esboco: false }); L.ator({ ...TSU, band: true, pai: tr, x: -0.55, y: 0.3, z: 0.42, s: 0.28, D, t: -1, poses: [[0, 'sentado+ferido']] });
    CAMK(P, [[0, [-1.2, 3.2, 10.6], [-1.0, 1.2, 0.0]], [D, [1.2, 3.2, 10.4], [1.0, 1.2, 0.0]]]);
  },
  // 15 Ele achava que o pior já tinha passado... Só que a cidade dele se chamava...
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5 }); L.ceu({ semente: 19 });
    P.deitado(P.F.ret(7.2, 2.2, 0.05), { prof: 0.02, cor: 0x8cc3e8, z: -2.8, t: 0, entra: 'fixo', esboco: false });
    L.ondas(-2.5);
    L.navio({ x: -1.6, z: -2.7, s: 0.5, t: 0.1 });
    L.cidade({ z: -1.4, t: 0.2, semente: 12, n: 7 });
    const tr = L.trem({ x0: -4.5, x1: -0.2, t0: 0.3, t1: Math.min(D - 1, 5.5), z: 0.8, t: 0 });
    P.peca(P.F.ret(0.62, 0.38, 0.02), { pai: tr, prof: 0.03, cor: 0x2f6b4f, x: -0.55, y: 0.41, z: 0.5, t: -1, entra: 'fixo', esboco: false }); L.ator({ ...TSU, band: true, pai: tr, x: -0.55, y: 0.3, z: 0.42, s: 0.28, D, t: -1, poses: [[0, 'sentado+ferido'], [5.6, 'sentado+olha_cima', 0.5]] });
    CAMK(P, [[0, [0.0, 7.5, 12.5], [0.0, 0.6, -1.2]], [D, [-0.4, 3.0, 9.6], [-0.4, 1.1, 0.2]]]);
  },
  // 16 NAGASAKI. A parte dois já tá no meu perfil... me segue pra não perder! (a sombra do avião passa)
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5 }); L.ceu({ semente: 19, passaros: false });
    P.deitado(P.F.ret(7.2, 2.2, 0.05), { prof: 0.02, cor: 0x8cc3e8, z: -2.8, t: 0, entra: 'fixo', esboco: false });
    L.ondas(-2.5);
    L.cidade({ z: -1.8, t: -1, semente: 12, n: 7 });
    L.txt('NAGASAKI', { x: 0, z: 1.2, tam: 0.72, t: 0.1, passo: 0.06, cor: P.CORES.VERMELHO });
    L.b29({ s: 0.32, z: -2.6, mov: (t) => [-3.4 + Math.max(0, t - 1.5) * 1.4, 2.5] });
    CAMK(P, [[0, [0.3, 6.6, 12.8], [0.0, 1.0, -0.2]], [D, [0.1, 6.0, 12.0], [0.0, 1.1, -0.2]]]);
  },
];

