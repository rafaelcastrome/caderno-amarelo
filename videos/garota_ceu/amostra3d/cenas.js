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
