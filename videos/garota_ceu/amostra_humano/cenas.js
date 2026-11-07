// Amostra: corpo de gente + cenário mais real (3 planos)
const fala = (D, janelas) => { const n = Math.ceil(D * 30) + 2, a = new Array(n).fill(0);
  for (const [t0, t1] of janelas) for (let i = Math.floor(t0 * 30); i < Math.min(n, t1 * 30); i++) { const t = i / 30; a[i] = Math.max(0, 0.55 + 0.45 * Math.sin(t * 23) * Math.sin(t * 7.3 + 1)); }
  return a; };
window.EP = [
  // A cabine: a mãe fala, a Juliane olha pra janela e responde
  (P, L, D) => {
    window.BOCA = { mae: fala(D, [[0.6, 2.6]]), juliane: fala(D, [[3.4, 5.2]]) };
    const jan = L.paredeCabine();
    jan.forEach((j, k) => [0, 1].forEach((i) => { const n = P.peca(P.F.nuvem(0.42, 0.18), { pai: j, prof: 0.01, cor: 0xfbf6ea, y: -0.15 + i * 0.25, ...L.FX }); P.animar((ts, t) => { n.position.x = ((t * 0.35 + i * 0.5 + k * 0.3) % 1.2) - 0.6; }); }));
    L.fileira({ x: 0.2, z: 0.0, D, gente: [Object.assign({}, L.JU, { lugar: 0, poses: [[0, 'sentado'], [2.8, 'sentado+olha_cima', 0.5], [3.3, 'sentado', 0.5]], dirs: [[0, 1], [2.6, -1], [3.3, 1]] }), Object.assign({}, L.MAE, { lugar: 2, dirs: [[0, 1]], poses: [[0, 'sentado']] })] });
    L.chao(0x5a5048, 0.3, 3, 0, 10);
    L.CAM([[0, [1.3, 1.95, 4.7], [0.3, 1.45, 0.25]], [D, [1.2, 1.9, 4.3], [0.3, 1.45, 0.25]]]);
  },
  // B floresta: ela anda machucada na beira do riacho
  (P, L, D) => {
    L.floresta({ semente: 4 });
    L.riacho({ z: 1.9, larg: 1.4, w: 16 });
    P.deitado(P.F.ret(26, 26, 0.02), { prof: 0.005, cor: 0x4a3a28, z: 6.0, ...L.FX });
    L.ator(Object.assign({}, L.JU_ANDA, { folhaPerna: false, x: -1.6, z: 0.9, D, t: -1, mov: [[0, -1.6], [D, 0.9, 0.9, 'lin']] }));
    L.samambaia({ x: 2.2, z: 2.9, s: 1.1, semente: 8 });
    L.folhaGrande({ x: -1.9, y: 1.4, z: 3.2, rz: -0.5, s: 0.9 });
    L.CAM([[0, [-0.6, 1.6, 8.4], [-0.5, 1.25, 0.8]], [D, [0.5, 1.6, 7.8], [0.4, 1.25, 0.8]]]);
  },
  // C plano médio: ela para, olha pra cima e chama a mãe
  (P, L, D) => {
    window.BOCA = { juliane: fala(D, [[1.6, 2.4], [3.2, 4.2]]) };
    L.floresta({ semente: 7 });
    P.deitado(P.F.ret(26, 26, 0.02), { prof: 0.005, cor: 0x4a3a28, z: 6.0, ...L.FX });
    L.ator(Object.assign({}, L.JU_ANDA, { folhaPerna: false, x: 0.0, z: 0.9, D, t: -1, poses: [[0, 'ombro_quebrado'], [1.2, 'ombro_quebrado+olha_cima', 0.6]] }));
    L.folhaGrande({ x: 1.5, y: 1.8, z: 2.2, rz: 2.6, s: 0.8 });
    L.CAM([[0, [0.35, 1.75, 4.6], [0.05, 1.65, 0.9]], [D, [0.3, 1.72, 4.2], [0.05, 1.65, 0.9]]]);
  },
];
