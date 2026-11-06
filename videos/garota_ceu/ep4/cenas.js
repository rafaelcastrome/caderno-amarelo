// Ep. 4 · Voz de gente. Uma função por cena (P, L, D).
const CORTE = (ks) => ks.flatMap(([t, pos, alvo], i) => (i ? [[t - 0.001, ks[i - 1][1], ks[i - 1][2]], [t, pos, alvo]] : [[t, pos, alvo]]));
window.EP = [];
(() => {
  const HOMEM = (k) => ({ nome: 'homem' + k, cabelo: [0x1e1814, 0x2a2018, 0x161210][k], roupa: [0xd8c8a0, 0xb8c4b0, 0xc9a882][k], calca: [0x4a4a3a, 0x3a4048, 0x55483a][k],
    sapato: 0x3a2a20, s: [1.0, 0.97, 1.02][k], chapeu: k === 1 ? 0xb89a5a : null });
  const DEITA = { rot: 1.52, ly: -0.98, tN: 0.08, kN: -0.15, tF: 0.02, kF: -0.08, pN: 0, pF: 0, sN: 0.0, eN: 0.1, sF: 0.0, eF: 0.1, head: 0.1, olhosF: 1 };
  const DEITA_OLHA = Object.assign({}, DEITA, { head: 0.45, lean: 0.1 });
  const ADULTA = (L) => Object.assign({}, L.JU, { roupa: 0x7f8a5a, saia: false, calca: 0x5a5040, sapato: 0x4a3a2a, semManga: false, s: 1.0 });
  const rioFundo = (P, L, cor = 0x1d3a26) => { // margem de floresta atrás do rio
    P.deitado(P.F.ret(26, 26, 0.02), { prof: 0.005, cor: 0x4a3a28, z: 6.0, ...L.FX });
    P.peca(P.F.ret(16, 9, 0.02), { prof: 0.03, cor, y: 3.5, z: -4.2, ...L.FX });
    for (let i = 0; i < 9; i++) L.arvoreAlta({ x: -7 + i * 1.8, z: -3.4 + (i % 2) * 0.6, h: 5 + (i % 3), tom: i % 3, semente: 70 + i });
  };
  window.EP = [
    // 1 a cabana à beira do rio, e a câmera entra até ela deitada no assoalho
    (P, L, D) => {
      rioFundo(P, L);
      L.riacho({ z: 2.3, larg: 2.0, w: 16 });
      L.chao(0x4a3a28, 0.4, 3.6, 0, 16);
      const piso = L.cabana({ x: 0, z: 0 });
      L.ator(Object.assign({}, L.JU_FERIDA, { pai: piso, x: 0.3, z: 0.0, D, t: -1, olhoInchado: true, poses: [[0, DEITA]] }));
      L.veu(0x0e2a14, 0.18);
      L.CAM([[0, [0.4, 2.6, 13.0], [0.0, 1.6, 0.0]], [D, [0.0, 1.5, 7.0], [-0.2, 1.1, 0.0]]]);
    },
    // 2 ela ouve: levanta um pouco a cabeça
    (P, L, D) => {
      rioFundo(P, L); L.chao(0x4a3a28, 0.4, 3.6, 0, 16);
      const piso = L.cabana({ x: 0, z: 0 });
      L.ator(Object.assign({}, L.JU_FERIDA, { pai: piso, x: 0.3, z: 0.0, D, t: -1, olhoInchado: true, poses: [[0, DEITA], [1.4, DEITA_OLHA, 0.8]] }));
      L.veu(0x0e2a14, 0.16);
      L.CAM([[0, [-0.2, 1.4, 6.4], [-0.3, 1.0, 0.0]], [D, [-0.3, 1.4, 5.8], [-0.4, 1.0, 0.0]]]);
    },
    // 3 voz de gente: três homens chegando pela margem
    (P, L, D) => {
      rioFundo(P, L); L.riacho({ z: 2.6, larg: 2.0, w: 16 }); L.chao(0x4a3a28, 0.4, 4.2, 0, 16);
      [0, 1, 2].forEach((k) => L.ator(Object.assign({}, HOMEM(k), { x: -4.6 - k * 0.9, z: 0.9 + k * 0.15, D, t: -1, mov: [[0, -4.6 - k * 0.9], [D, -1.4 - k * 0.9, 0.9 + k * 0.15, 'lin']] })));
      L.veu(0x0e2a14, 0.14);
      L.CAM([[0, [-3.0, 2.0, 11.5], [-3.0, 1.4, 0.8]], [D, [-2.6, 2.0, 11.0], [-2.6, 1.4, 0.8]]]);
    },
    // 4 eles veem a garota na cabana e levam um susto (dão um passo pra trás)
    (P, L, D) => {
      rioFundo(P, L); L.chao(0x4a3a28, 0.4, 4.2, 0, 16);
      const piso = L.cabana({ x: 1.6, z: -0.2 });
      L.ator(Object.assign({}, L.JU_FERIDA, { pai: piso, x: -0.2, z: 0.0, D, t: -1, olhoInchado: true, poses: [[0, DEITA_OLHA]] }));
      [0, 1, 2].forEach((k) => L.ator(Object.assign({}, HOMEM(k), { x: -1.4 - k * 0.75, z: 1.0 + k * 0.12, D, t: -1,
        mov: [[0, -1.4 - k * 0.75], [1.2, -1.4 - k * 0.75], [1.7, -1.75 - k * 0.75, 1.0 + k * 0.12]], poses: [[0, 'normal'], [1.2, 'protege', 0.3], [2.6, 'normal', 0.6]] })));
      L.veu(0x0e2a14, 0.14);
      L.CAM([[0, [-0.6, 2.2, 13.0], [-0.6, 1.4, 0.4]], [D, [-0.6, 2.2, 12.2], [-0.6, 1.4, 0.4]]]);
    },
    // 5 ela fala com eles (sentada na beira do assoalho); eles escutam
    (P, L, D) => {
      rioFundo(P, L); L.chao(0x4a3a28, 0.4, 4.2, 0, 16);
      const piso = L.cabana({ x: 1.6, z: -0.2 });
      L.ator(Object.assign({}, L.JU_FERIDA, { pai: piso, x: -0.9, z: 0.3, D, t: -1, dir: -1, olhoInchado: true, poses: [[0, 'sentado']] }));
      [0, 1].forEach((k) => L.ator(Object.assign({}, HOMEM(k), { x: -1.7 - k * 0.8, z: 1.0 + k * 0.12, D, t: -1, poses: [[0, 'normal']] })));
      L.veu(0x0e2a14, 0.12);
      L.CAM([[0, [-0.5, 1.9, 11.0], [-0.5, 1.4, 0.4]], [D, [-0.5, 1.9, 10.2], [-0.5, 1.4, 0.4]]]);
    },
    // 6 a canoa descendo o rio: dois remando, ela sentada no meio
    (P, L, D) => {
      rioFundo(P, L); P.animar((ts, t) => { });
      L.riacho({ z: 0.6, larg: 3.4, w: 30, v: -1.2 });
      const c = L.canoa({ x: 0, z: 0.6, w: 4.0 });
      L.ator(Object.assign({}, HOMEM(0), { pai: c, x: 1.15, z: 0, D, t: -1, poses: [[0, 'rema']], naMao: (m, op) => L.remo(m, op) }));
      L.ator(Object.assign({}, L.JU_FERIDA, { pai: c, x: -0.15, z: 0, D, t: -1, olhoInchado: true, poses: [[0, 'sentado']] }));
      L.ator(Object.assign({}, HOMEM(2), { pai: c, x: -1.35, z: 0, D, t: -1, poses: [[0, 'sentado']] }));
      L.veu(0x0e2a14, 0.1);
      L.CAM([[0, [0.3, 2.1, 13.4], [0.0, 1.1, 0.6]], [D, [-0.2, 2.1, 12.6], [0.0, 1.1, 0.6]]]);
    },
    // 7 o aviãozinho sobre a floresta... corte: hospital, o pai entra e abraça a filha
    (P, L, D) => {
      const a = 2.6;
      const ceu = P.grupo({ x: 30 });
      P.peca(P.F.ret(12, 10, 0.02), { pai: ceu, prof: 0.03, cor: 0xa8cde0, y: 3.5, z: -4.2, ...L.FX });
      for (let i = 0; i < 16; i++) P.peca(P.F.nuvem(1.6, 1.0), { pai: ceu, prof: 0.08, cor: [0x1f4a2c, 0x2a5e34, 0x37733f][i % 3], x: -6 + i * 0.8, y: 0.4 + (i % 3) * 0.25, z: -1.5 + (i % 2) * 0.6, ...L.FX });
      const av = L.aviao({ pai: ceu, x: -2.6, y: 3.0, z: -0.4, x1: 2.6, t0: 0, t1: a, t: -1 });
      const cama = L.hospital({ x: -0.6, z: -0.4 });
      L.ator(Object.assign({}, L.JU_FERIDA, { pai: cama, x: -0.3, z: 0.0, D, t: -1, dir: -1, olhoInchado: true, poses: [[0, DEITA], [a + 1.0, DEITA_OLHA, 0.6]] }));
      L.ator(Object.assign({}, L.PAI, { x: 3.0, z: 0.9, D, t: -1, dir: -1, mov: [[0, 3.2], [a + 0.3, 3.2], [a + 1.6, 1.25, 0.9]], poses: [[0, 'normal'], [a + 1.6, 'abraco+curvado', 0.5]] }));
      L.CAM(CORTE([[0, [30.0, 3.0, 11.0], [30.0, 2.4, 0.0]], [a, [0.2, 1.9, 9.6], [0.1, 1.3, 0.0]], [D, [0.2, 1.8, 8.8], [0.2, 1.3, 0.0]]]));
    },
    // 8 o pai fica quieto do lado da cama, cabeça baixa
    (P, L, D) => {
      const cama = L.hospital({ x: -0.6, z: -0.4 });
      L.ator(Object.assign({}, L.JU_FERIDA, { pai: cama, x: -0.3, z: 0.0, D, t: -1, dir: -1, olhoInchado: true, poses: [[0, DEITA_OLHA]] }));
      L.ator(Object.assign({}, L.PAI, { x: 1.4, z: 0.9, D, t: -1, dir: -1, poses: [[0, 'normal'], [0.8, 'bolsos', 0.8]] }));
      L.veu(0x1a2430, 0.12);
      L.CAM([[0, [0.4, 1.8, 8.4], [0.4, 1.3, 0.2]], [D, [0.5, 1.8, 7.6], [0.5, 1.35, 0.2]]]);
    },
    // 9 noventa e duas pessoinhas de papel; uma a uma elas somem e só fica uma (amarela)
    (P, L, D) => {
      P.peca(P.F.ret(12, 12, 0.02), { prof: 0.02, cor: 0x2a2622, y: 2.5, z: -1.0, ...L.FX });
      const gs = []; let k = 0;
      for (let r = 0; r < 12; r++) for (let c = 0; c < 8; c++) { if (k >= 92) break;
        const eu = r === 6 && c === 3; gs.push([L.pessoinha({ x: -1.4 + c * 0.4, y: 4.6 - r * 0.42, z: -0.9, cor: eu ? 0xf2c230 : 0xd8d0c0 }), eu]); k++; }
      const ordem = gs.map((g, i) => [g, (i * 37) % 92]);
      P.animar((ts, t) => ordem.forEach(([[g, eu], j]) => { if (eu) return; const t0 = 2.2 + (j / 92) * (D - 4.2); g.scale.setScalar(Math.max(0.001, 1 - L.sm((t - t0) / 0.3))); }));
      L.CAM([[0, [0.0, 2.3, 7.4], [0.0, 2.3, -0.9]], [D, [0.0, 2.3, 6.6], [0.0, 2.3, -0.9]]]);
    },
    // 10 ela, pequena, sai da floresta pra luz
    (P, L, D) => {
      L.floresta({ semente: 16 });
      L.ator(Object.assign({}, L.JU_ANDA, { x: -2.4, z: 0.9, D, t: -1, mov: [[0, -2.4], [D, 0.6, 0.9, 'lin']] }));
      const luz = new P.THREE.Mesh(new P.THREE.PlaneGeometry(8, 12), new P.THREE.MeshBasicMaterial({ color: 0xfff2c8, transparent: true, opacity: 0.0, depthTest: false }));
      luz.renderOrder = 997; P.fg.add(luz);
      P.animar((ts, t) => { const dir = new P.THREE.Vector3(); P.cam.getWorldDirection(dir); luz.position.copy(P.cam.position).addScaledVector(dir, 1.3); luz.quaternion.copy(P.cam.quaternion); luz.material.opacity = 0.35 * L.sm((t - D * 0.4) / (D * 0.6)); });
      L.CAM([[0, [-1.4, 1.8, 8.8], [-1.0, 1.3, 0.6]], [D, [0.2, 1.8, 8.4], [0.4, 1.3, 0.6]]]);
    },
    // 11 adulta: diploma na mão, depois de volta à Panguana
    (P, L, D) => {
      const a = D * 0.45;
      const sala = P.grupo({ x: 30 });
      P.peca(P.F.ret(10, 8, 0.02), { pai: sala, prof: 0.03, cor: 0xe8dcc4, y: 3.0, z: -1.6, ...L.FX });
      P.deitado(P.F.ret(10, 6, 0.02), { pai: sala, prof: 0.01, cor: 0xb89a6a, z: 1.0, ...L.FX });
      L.ator(Object.assign({}, ADULTA(L), { pai: sala, x: 0, z: 0.6, D, t: -1, poses: [[0, { sN: 0.5, eN: 1.25, sF: 0.45, eF: 1.25, head: -0.1 }]], naMao: (m, op) => P.peca(P.F.ret(0.34, 0.24, 0.02), Object.assign({ pai: m, prof: 0.02, cor: 0xfbf6ea, x: 0.12, y: -0.08 }, op)) }));
      L.fundoCeu({ h: 9, y: 3.5, cor: 0xa8cde0 });
      for (let i = 0; i < 5; i++) L.arvoreAlta({ x: -4 + i * 2, z: -2.8, h: 5 + (i % 2), tom: i % 3, semente: 60 + i });
      const casa = P.grupo({ x: 1.6, z: -1.4 });
      P.caixa(2.0, 1.3, 1.0, { pai: casa, y: 0.85, cor: 0x9a7a52, ...L.FX });
      P.peca(P.F.poligono([[-1.3, 0], [1.3, 0], [0, 0.8]]), { pai: casa, prof: 1.2, cor: 0x7a6440, y: 1.5, ...L.FX });
      [-0.6, 0, 0.6].forEach((x) => P.caixa(0.08, 0.3, 0.08, { pai: casa, x, y: 0.1, z: 0.4, cor: 0x5a4430, ...L.FX }));
      L.chao(0x4a3a28, 3.0, 12, 0, 20);
      L.ator(Object.assign({}, ADULTA(L), { x: -0.9, z: 0.7, D, t: -1, mov: [[0, -0.9], [a, -0.9], [D, 0.6, 0.7, 'lin']] }));
      L.CAM(CORTE([[0, [30.0, 1.7, 7.4], [30.0, 1.4, 0.6]], [a, [0.3, 2.2, 10.4], [0.3, 1.5, 0.0]], [D, [0.4, 2.2, 9.6], [0.4, 1.5, 0.0]]]));
    },
    // 12 ela adulta entre as árvores, anotando numa prancheta
    (P, L, D) => {
      L.floresta({ semente: 18, fundo: 0x24462c });
      L.ator(Object.assign({}, ADULTA(L), { x: -0.2, z: 0.8, D, t: -1, poses: [[0, 'desenha'], [D * 0.55, 'olha_cima', 0.6]],
        naMao: (m, op) => P.peca(P.F.ret(0.3, 0.4, 0.02), Object.assign({ pai: m, prof: 0.03, cor: 0x8a6a42, x: 0.1, y: 0.05 }, op)) }));
      L.veu(0x0e2a14, 0.06);
      L.CAM([[0, [0.6, 1.8, 7.0], [0.0, 1.4, 0.8]], [D, [0.4, 1.8, 6.2], [0.0, 1.45, 0.8]]]);
    },
    // 13 de cima: a floresta inteira, o rio e a estação pequenininha
    (P, L, D) => {
      const rio = (x) => Math.sin(x * 0.5) * 1.2 + 0.4;
      L.copas({ semente: 33, n: 170, rio });
      const casa = P.grupo({ x: 0.8, y: 0.05, z: rio(0.8) - 0.75 });
      P.caixa(0.36, 0.12, 0.26, { pai: casa, y: 0.06, cor: 0x9a7a52, ...L.FX });
      P.caixa(0.42, 0.06, 0.32, { pai: casa, y: 0.15, cor: 0x7a6440, ...L.FX });
      L.neblina({ n: 2, y: 0.5 });
      P.foco = [0, 0.01];
      L.CAM([[0, [0.8, 6.0, rio(0.8) + 0.6], [0.8, 0, rio(0.8) - 0.75]], [D, [0.2, 11.0, 1.4], [0.2, 0, 0.0]]]);
    },
    // 14 pergunta final: ela de 17 anos andando no rio, de costas pra câmera que sobe
    (P, L, D) => {
      L.floresta({ semente: 19 });
      L.riacho({ z: 1.0, larg: 2.2, w: 16 });
      L.ator(Object.assign({}, L.JU_ANDA, { x: -1.0, z: 1.0, D, t: -1, descalco: true, mov: [[0, -1.0], [D, 1.6, 1.0, 'lin']] }));
      L.veu(0x0e2a14, 0.14);
      L.CAM([[0, [-0.6, 1.7, 9.0], [-0.4, 1.3, 0.8]], [D, [0.8, 3.0, 10.4], [1.0, 1.6, 0.8]]]);
    },
  ];
})();
