// Episódio 1: Hiroshima. Cada item = uma cena (P, L, D = duração da fala+pausa).
window.EP = [
  // 1 gancho: o homem e duas nuvens atrás
  (P, L, D) => {
    L.cogumelo({ x: -1.3, z: -1.8, s: 0.65, t: 0, t0: 0, t1: 2.2 });
    L.cogumelo({ x: 1.35, z: -2.0, s: 0.65, t: 0, t0: 0.6, t1: 2.8 });
    L.homem({ x: 0, z: 0.6, t: 0.1 });
    L.cam(D, { y: 1.5, dist: 1.05 });
  },
  // 2 Japão 1945, desenhava navios
  (P, L, D) => {
    L.mesa({ x: 0.7, z: -0.2, t: 0.1 });
    L.homem({ x: -1.4, z: 0.2, t: 0.5 });
    L.txt('1945', { x: 0, z: 1.9, tam: 1.0, t: 1.4, cor: P.CORES.VERMELHO });
    L.cam(D, { y: 1.2 });
  },
  // 3 viagem de trem pra Hiroshima
  (P, L, D) => {
    L.cidade({ z: -1.8, t: 0.1, semente: 4 });
    L.trem({ x0: -4.5, x1: 0.3, t0: 0.3, t1: Math.min(D - 0.5, 3.2), z: 0.6, t: 0, passageiro: true });
    L.cam(D, { y: 1.1 });
  },
  // 4 seis de agosto, malas prontas
  (P, L, D) => {
    L.calendario({ x: 0.8, y: 1.6, z: -0.6, t: 0.1 });
    L.mala({ x: -0.9, z: 0.5, t: 0.6 });
    L.mala({ x: -0.6, z: 1.2, s: 0.7, t: 1.0, cor: 0x5a6a7a });
    L.cam(D, { y: 1.2 });
  },
  // 5 andando até o estaleiro
  (P, L, D) => {
    L.cidade({ z: -2.0, t: 0.1, semente: 8, n: 5 });
    L.guindaste({ x: 1.4, z: -0.9, t: 0.5 });
    L.navio({ x: 1.6, z: -0.3, s: 0.55, t: 0.7 });
    const h = L.homem({ x: -1.8, z: 0.9, s: 0.8, t: 0.2 });
    P.animar((ts, t) => { const k = Math.min(1, t / D); h.position.x = -1.8 + 1.6 * k; h.position.y = Math.abs(Math.sin(ts * 9)) * 0.06; });
    L.cam(D, { y: 1.2 });
  },
  // 6 oito e quinze: avião lá em cima
  (P, L, D) => {
    const h = L.homem({ x: -0.9, z: 0.8, t: 0.1 });
    P.animar((ts, t) => { const k = Math.min(1, Math.max(0, (t - 1.2) / 0.6)); h.userData.cab.rotation.x = -0.45 * k; });
    L.aviao({ x: -2.6, x1: 2.8, t0: 0.4, t1: D, y: 3.4, z: -1.0, t: 0.3 });
    L.txt('8h15', { x: 0.7, z: 1.8, tam: 0.8, t: 0.6, cor: P.CORES.PRETO });
    L.cam(D, { y: 1.7 });
  },
  // 7 o clarão
  (P, L, D) => {
    L.cidade({ z: -1.2, t: 0, semente: 2, cor: 0xf0e2c0 });
    L.clarao({ y: 2.6, z: -2.4, t: 0.35 });
    L.cam(D, { y: 1.5 });
  },
  // 8 jogado longe, queimado
  (P, L, D) => {
    const h = L.homem({ x: 0.2, z: 0.5, t: 0.1 });
    P.animar((ts, t) => { const k = Math.min(1, Math.max(0, (t - 0.9) / 0.35)); h.rotation.z = 1.45 * k; h.position.y = 0.25 * k; h.position.x = 0.2 + 1.0 * k; });
    const r = P.fixo(21); const bits = [];
    for (let i = 0; i < 14; i++) bits.push(P.peca(P.F.poligono([[0, 0], [0.18 + r() * 0.15, 0.02], [0.08, 0.16 + r() * 0.1]]), { prof: 0.02, cor: [0x9a948a, 0x6b5a48, 0xd9c9a6][i % 3], x: -2 + r() * 1.5, y: 0.5 + r() * 2, z: r() - 0.5, t: 0.9, entra: 'fixo', esboco: false }));
    P.animar((ts, t) => bits.forEach((b, i) => { const k = Math.max(0, t - 0.9); b.position.x += 0; b.children[0].position.set(k * (2.5 + (i % 4)), -Math.min(k * k * 1.2, 0.4 + i * 0.1), 0); b.children[0].rotation.z = k * (3 + i); }));
    L.flash(0.85, 0.5, 0xffe9b0);
    L.cam(D, { y: 1.2 });
  },
  // 9 três quilômetros, e vivo
  (P, L, D) => {
    L.mapa({ t: 0.1, cx: -0.2, cz: -0.9 });
    L.txt('3 km', { x: 0.6, z: 2.4, tam: 0.8, t: 1.6 });
    P.camera([{ t: 0, pos: [0.3, 15, 9.5], alvo: [0.2, 0, 0.5] }, { t: D, pos: [0.2, 13.8, 8.8], alvo: [0.3, 0, 0.6] }]);
  },
  // 10 a cidade virou fogo, abrigo no escuro
  (P, L, D) => {
    L.noite(0.42);
    L.abrigo({ t: 0.1 });
    L.homem({ x: 0, z: -0.2, s: 0.55, t: 0.8, band: true });
    L.cam(D, { y: 1.1 });
  },
  // 11 no outro dia, enfaixado, voltar pra casa
  (P, L, D) => {
    L.sol({ x: -1.8, y: 3.3, t: 0.1 });
    L.casa({ x: 1.4, z: -0.8, w: 1.8, h: 1.1, t: 0.3 });
    const h = L.homem({ x: -1.4, z: 0.7, t: 0.4, band: true });
    P.animar((ts, t) => { const k = Math.min(1, t / D); h.position.x = -1.4 + 1.6 * k; h.position.y = Math.abs(Math.sin(ts * 7)) * 0.05; });
    L.cam(D, { y: 1.3 });
  },
  // 12 pegou o trem, horas de viagem
  (P, L, D) => {
    [[-2, -1.8, 0x7fb069], [0.4, -2.1, 0x9ccf6e], [2.4, -1.7, 0x6aa05a]].forEach(([x, z, c], i) => P.peca(P.F.nuvem(2.6, 1.2), { prof: 0.2, cor: c, x, z, y: 0, t: 0.1 + i * 0.1 }));
    L.trem({ x0: -4.5, x1: 4.5, t0: 0.2, t1: D + 1.5, z: 0.6, t: 0, passageiro: true, band: true });
    L.cam(D, { y: 1.1 });
  },
  // 13 achava que o pior tinha passado... a cidade dele se chamava
  (P, L, D) => {
    P.deitado(P.F.ret(7.2, 2.2, 0.05), { prof: 0.02, cor: 0x8cc3e8, z: -2.8, t: 0.1, entra: 'fixo' });
    L.navio({ x: -1.6, z: -2.7, s: 0.5, t: 0.3 });
    L.cidade({ z: -1.2, t: 0.4, semente: 12, n: 6 });
    L.trem({ x0: -4.5, x1: -0.3, t0: 0.3, t1: Math.min(D, 3.5), z: 1.0, t: 0.2 });
    L.cam(D, { y: 1.1 });
  },
  // 14 NAGASAKI
  (P, L, D) => {
    P.deitado(P.F.ret(7.2, 2.2, 0.05), { prof: 0.02, cor: 0x8cc3e8, z: -2.8, t: 0, entra: 'fixo', esboco: false });
    L.cidade({ z: -1.8, t: 0, semente: 12, n: 6 });
    L.txt('NAGASAKI', { x: 0, z: 1.3, tam: 0.72, t: 0.05, passo: 0.06, cor: P.CORES.VERMELHO });
    L.cam(D, { y: 1.1 });
  },
  // 15 parte 2 + me segue (a sombra passa por cima da cidade)
  (P, L, D) => {
    P.deitado(P.F.ret(7.2, 2.2, 0.05), { prof: 0.02, cor: 0x8cc3e8, z: -2.8, t: 0, entra: 'fixo', esboco: false });
    L.cidade({ z: -1.8, t: 0, semente: 12, n: 6 });
    L.homem({ x: 0, z: 0.9, s: 0.85, t: 0.1, band: true });
    L.aviao({ x: -3, x1: 3, t0: 0.5, t1: D, y: 3.6, z: -1.8, t: 0.3 });
    L.cam(D, { y: 1.4 });
  },
];
