// Episódio 2: Nagasaki.
const MAR = (P, t = 0) => P.deitado(P.F.ret(7.2, 2.2, 0.05), { prof: 0.02, cor: 0x8cc3e8, z: -2.8, t, entra: 'fixo', esboco: false });
window.EP = [
  // 1 recap: trem chegando em Nagasaki
  (P, L, D) => {
    MAR(P); L.navio({ x: -1.4, z: -2.7, s: 0.5, t: 0.2 });
    L.cidade({ z: -1.2, t: 0.2, semente: 12, n: 6 });
    L.trem({ x0: -4.5, x1: -0.3, t0: 0.3, t1: Math.min(D, 4), z: 1.0, t: 0.1, passageiro: true, band: true });
    L.cam(D, { y: 1.1 });
  },
  // 2 chegou enfaixado, mas vivo
  (P, L, D) => {
    L.casa({ x: 0.9, z: -0.8, w: 1.9, h: 1.2, t: 0.1, cor: 0xe2cfa6 });
    L.homem({ x: -0.8, z: 0.7, t: 0.3, band: true });
    L.cam(D, { y: 1.3 });
  },
  // 3 três dias depois, voltou pro trabalho
  (P, L, D) => {
    P.caixa(2.2, 1.8, 1.0, { x: 0.8, y: 0.9, z: -1.2, cor: 0xd9c9a6, t: 0.1 });
    L.guindaste({ x: -1.6, z: -1.6, t: 0.3 });
    const h = L.homem({ x: -1.6, z: 0.8, s: 0.85, t: 0.4, band: true });
    P.animar((ts, t) => { const k = Math.min(1, t / D); h.position.x = -1.6 + 1.9 * k; h.position.y = Math.abs(Math.sin(ts * 7)) * 0.05; });
    L.cam(D, { y: 1.2 });
  },
  // 4 o chefe quis saber de Hiroshima
  (P, L, D) => {
    L.mesa({ x: 0, z: -0.6, t: 0.1 });
    L.homem({ x: -1.5, z: 0.4, t: 0.3, terno: true, s: 0.95 });
    L.homem({ x: 1.5, z: 0.4, t: 0.6, band: true, s: 0.95 });
    L.cam(D, { y: 1.3 });
  },
  // 5 uma bomba só destruiu a cidade
  (P, L, D) => {
    L.mesa({ x: 0, z: -0.6, t: 0, entra: 'fixo' });
    L.homem({ x: -1.5, z: 0.4, t: 0.0, terno: true, s: 0.95 });
    L.homem({ x: 1.4, z: 0.4, t: 0.0, band: true, s: 0.95, bracos: 'abertos' });
    L.balao((c, w, h) => {
      c.fillStyle = '#f6eedb'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) { c.fillStyle = '#6b5a48'; c.fillRect(w * (0.08 + i * 0.15), h * (0.45 + (i % 2) * 0.1), w * 0.1, h * 0.4); }
      c.fillStyle = '#f08a2a'; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(w * (0.05 + i * 0.14), h * 0.5); c.lineTo(w * (0.11 + i * 0.14), h * 0.08); c.lineTo(w * (0.17 + i * 0.14), h * 0.5); c.fill(); }
    }, { x: 0.6, y: 3.6, z: 0, t: 0.6 });
    L.cam(D, { y: 1.8 });
  },
  // 6 o chefe não acreditou: "tá louco"
  (P, L, D) => {
    L.mesa({ x: 0, z: -0.6, t: 0 });
    const c = L.homem({ x: -1.5, z: 0.4, t: 0.0, terno: true, s: 0.95, bracos: 'cima' });
    L.homem({ x: 1.5, z: 0.4, t: 0.0, band: true, s: 0.95 });
    P.animar((ts) => { c.userData.cab.rotation.z = Math.sin(ts * 10) * 0.18; });
    L.txt('?!', { x: -1.5, y: 3.0, z: 0.4, tam: 0.9, t: 0.5, entra: 'pop' });
    L.cam(D, { y: 1.4 });
  },
  // 7 onze da manhã
  (P, L, D) => {
    L.relogio({ y: 1.9, z: -0.2, t: 0.05, s: 1.15, hora: 10, min0: 59.2, min1: 60, D });
    L.cam(D, { y: 1.8 });
  },
  // 8 o mesmo clarão
  (P, L, D) => {
    P.caixa(5.0, 2.6, 0.2, { y: 1.3, z: -0.9, cor: 0xd9c9a6, t: 0, entra: 'fixo', esboco: false });
    P.peca(P.F.ret(2.6, 1.6, 0.05), { prof: 0.05, cor: 0x9ac7e8, y: 1.6, z: -0.75, t: 0, entra: 'fixo', esboco: false });
    L.clarao({ y: 1.6, z: -0.7, t: 0.4, flashDur: 1.2 });
    L.homem({ x: -1.2, z: 0.6, t: 0, s: 0.85, terno: true });
    L.homem({ x: 1.2, z: 0.6, t: 0, s: 0.85, band: true });
    L.cam(D, { y: 1.3 });
  },
  // 9 segunda bomba em Nagasaki
  (P, L, D) => {
    MAR(P);
    L.cidade({ z: -1.0, t: 0, semente: 12, n: 6 });
    L.cogumelo({ x: 0.2, z: -2.4, s: 1.0, t: 0, t0: 0.2, t1: D });
    L.cam(D, { y: 1.6 });
  },
  // 10 a que distância?
  (P, L, D) => {
    L.mapa({ t: 0.1, mar: true, band: true, cx: -0.2, cz: -0.9, tLinha: 1.4 });
    L.txt('?', { x: 0.8, z: 2.4, tam: 1.0, t: 1.8 });
    P.camera([{ t: 0, pos: [0.3, 15, 9.5], alvo: [0.2, 0, 0.5] }, { t: D, pos: [0.2, 13.8, 8.8], alvo: [0.3, 0, 0.6] }]);
  },
  // 11 três quilômetros, de novo
  (P, L, D) => {
    L.mapa({ t: 0, mar: true, band: true, cx: -0.2, cz: -0.9, tLinha: 0.1 });
    L.txt('3 km', { x: 0.6, z: 2.4, tam: 0.8, t: 0.2 });
    P.camera([{ t: 0, pos: [0.2, 13.8, 8.8], alvo: [0.3, 0, 0.6] }, { t: D, pos: [0.6, 9, 6.4], alvo: [1.0, 0, 0.6] }]);
  },
  // 12 será que sobreviveu? parte 3
  (P, L, D) => {
    L.homem({ x: -0.6, z: 0.6, t: 0.1, band: true });
    L.txt('?', { x: 1.1, y: 1.2, z: 0.6, tam: 2.4, t: 0.6, entra: 'pop' });
    L.cam(D, { y: 1.4 });
  },
];
