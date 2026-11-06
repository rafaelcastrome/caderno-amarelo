// Episódio 3: depois das bombas.
const MAR = (P, t = 0) => P.deitado(P.F.ret(7.2, 2.2, 0.05), { prof: 0.02, cor: 0x8cc3e8, z: -2.8, t, entra: 'fixo', esboco: false });
window.EP = [
  // 1 parte 3: 3 km da segunda bomba
  (P, L, D) => {
    L.mapa({ t: 0.05, mar: true, band: true, cx: -0.2, cz: -0.9, tLinha: 0.6 });
    L.txt('3 km', { x: 0.6, z: 2.4, tam: 0.8, t: 1.0 });
    P.camera([{ t: 0, pos: [0.3, 15, 9.5], alvo: [0.2, 0, 0.5] }, { t: D, pos: [0.2, 13.8, 8.8], alvo: [0.3, 0, 0.6] }]);
  },
  // 2 o escritório tremeu, sobreviveu de novo
  (P, L, D) => {
    const m = L.mesa({ x: 0, z: -0.4, t: 0.05 });
    const h = L.homem({ x: 0, z: 0.9, t: 0.2, band: true, s: 0.85 });
    const r = P.fixo(33); const fol = [];
    for (let i = 0; i < 8; i++) fol.push(P.peca(P.F.ret(0.4, 0.5, 0.02), { prof: 0.01, cor: 0xf8f3e8, x: -2 + r() * 4, y: 2.5 + r() * 1.2, z: r() - 0.5, rz: r(), t: 0.5, entra: 'fixo', esboco: false }));
    P.animar((ts, t) => {
      const tre = t < 2 ? Math.sin(t * 60) * 0.04 * (2 - t) : 0; m.position.x = tre; h.position.x = -tre;
      fol.forEach((f, i) => { const k = Math.max(0, t - 0.5); f.children[0].position.y = -Math.min(k * (0.8 + i * 0.1), 2.3); f.children[0].rotation.z = Math.sin(k * 3 + i) * 0.6; });
    });
    L.cam(D, { y: 1.3 });
  },
  // 3 muito doente, mas resistiu
  (P, L, D) => {
    L.noite(0.35);
    P.caixa(2.6, 0.35, 1.2, { y: 0.3, z: 0.1, cor: 0x8e5a36, t: 0.05 });
    P.caixa(2.0, 0.12, 1.15, { x: 0.25, y: 0.53, z: 0.1, cor: 0x7d9ac4, t: 0.3 });
    const cab = P.peca(P.F.circulo(0.3), { prof: 0.06, cor: 0xe9b98e, x: -0.9, y: 0.82, z: 0.1, t: 0.5 });
    P.peca(P.F.ret(0.6, 0.14, 0.03), { prof: 0.02, cor: 0xf6f1e4, x: -0.9, y: 0.95, z: 0.15, t: 0.7 });
    const vela = P.peca(P.F.estrela(0.18, 0.08, 6), { prof: 0.02, cor: 0xf6b13a, x: 1.8, y: 1.0, z: 0.4, t: 0.8, entra: 'pop' });
    P.peca(P.F.ret(0.14, 0.5, 0.03), { prof: 0.1, cor: 0xf6f1e4, x: 1.8, y: 0.6, z: 0.4, t: 0.7 });
    P.animar((ts) => { vela.children[0].scale.set(1, 0.85 + Math.sin(ts * 11) * 0.2, 1); });
    L.cam(D, { y: 0.8 });
  },
  // 4 a guerra acabou (rádio + gente ouvindo)
  (P, L, D) => {
    L.radio({ x: 0, z: -0.4, t: 0.05 });
    [[-1.8, 0.6, false], [1.8, 0.6, true], [-0.9, 1.4, true], [0.9, 1.4, false]].forEach(([x, z, terno], i) => L.homem({ x, z, s: 0.6, terno, t: 0.4 + i * 0.15 }));
    L.cam(D, { y: 1.0 });
  },
  // 5 voltou a trabalhar, teve família
  (P, L, D) => {
    L.sol({ x: -1.7, y: 3.4, t: 0.05 });
    L.navio({ x: 0.9, z: -1.2, s: 0.7, t: 0.1 });
    L.homem({ x: -1.0, z: 0.6, t: 0.3, s: 0.9 });
    L.homem({ x: -0.15, z: 0.75, t: 0.6, s: 0.72, cabeca: 0xefc39a });
    L.homem({ x: 0.55, z: 0.95, t: 0.9, s: 0.45 });
    L.cam(D, { y: 1.3 });
  },
  // 6 no papel, só sobrevivente de Nagasaki (1 carimbo)
  (P, L, D) => {
    L.documento({ y: 1.8, z: 0.2, t: 0.05, selos: 1, tSelo1: 0.8 });
    L.cam(D, { y: 1.8 });
  },
  // 7 2009: reconhecido nas duas
  (P, L, D) => {
    const d = L.documento({ y: 1.8, z: 0.2, t: 0, selos: 1, tSelo1: 0 });
    P.peca(P.F.anel(0.32, 0.25), { pai: d, prof: 0.02, cor: P.CORES.AZUL, x: -0.45, y: 0.75, z: 0.04, rz: -0.3, t: Math.min(D * 0.55, 3.5), entra: 'pop', dur: 0.25 });
    P.peca(P.F.estrela(0.18, 0.08, 6), { pai: d, prof: 0.02, cor: P.CORES.AZUL, x: -0.45, y: 0.75, z: 0.05, t: Math.min(D * 0.55, 3.5) + 0.05, entra: 'pop', dur: 0.25, esboco: false });
    L.txt('2009', { x: 0, z: 1.9, tam: 0.9, t: 0.6 });
    L.cam(D, { y: 1.6 });
  },
  // 8 o único
  (P, L, D) => {
    L.homem({ x: 0, z: 0.4, t: 0.05, velho: true });
    P.deitado(P.F.circulo(1.0), { prof: 0.01, cor: 0xfff2c0, z: 0.4, t: 0.2, entra: 'pop', esboco: false });
    P.peca(P.F.estrela(0.5, 0.22, 5), { prof: 0.05, cor: P.CORES.DOURADO, x: 0, y: 3.4, z: 0.4, t: 0.6, entra: 'pop' });
    L.cam(D, { y: 1.6 });
  },
  // 9 morreu com 93 anos
  (P, L, D) => {
    L.sol({ x: 1.6, y: 2.4, z: -2.2, t: 0.05, cor: 0xf6a04a, cor2: 0xe8813a });
    L.arvore({ x: -1.5, z: -0.9, t: 0.1 });
    L.homem({ x: 0.3, z: 0.6, t: 0.3, velho: true });
    L.txt('93', { x: 1.5, z: 1.7, tam: 1.0, t: 1.2 });
    L.cam(D, { y: 1.3 });
  },
  // 10 duas bombas e viveu até os 93 (final)
  (P, L, D) => {
    MAR(P);
    L.cidade({ z: -1.4, t: 0, semente: 12, n: 6 });
    L.sol({ x: 1.5, y: 2.2, z: -2.6, t: 0.05, cor: 0xf6a04a, cor2: 0xe8813a });
    const c1 = L.cogumelo({ x: -1.6, z: -2.7, s: 0.55, t: 0, t0: -1, t1: 0 }), c2 = L.cogumelo({ x: 0.2, z: -2.9, s: 0.55, t: 0, t0: -1, t1: 0 });
    P.animar((ts, t) => { const k = Math.max(0, 1 - t / (D * 0.6)); [c1, c2].forEach((c) => { c.visible = k > 0.02; c.scale.multiplyScalar(Math.max(0.02, k)); }); });
    L.homem({ x: 0, z: 1.0, t: 0.3, velho: true, s: 0.9 });
    L.cam(D, { y: 1.3 });
  },
];
