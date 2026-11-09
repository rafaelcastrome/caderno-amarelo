// Plano A (0 - 10.72 s): o quarto visto da tua cabeça, sentado na cama.
window.CENA_A = (P, L, V, D) => {
  const { F, THREE } = P; const fx = V.fx, K = L.K, sm = L.sm;
  const W0 = [0, 0.18, 0.6];                      // raiz -> mundo
  const w = (x, y, z) => [x + W0[0], y + W0[1], z + W0[2]];
  // ---------- quarto ----------
  const parede = (g, w2, h) => { g.fillStyle = '#f1dfb6'; g.fillRect(0, 0, w2, h); g.fillStyle = 'rgba(214,170,110,0.22)';
    for (let x = 0; x < w2; x += 64) g.fillRect(x, 0, 26, h); };
  const ZP = -2.2;
  P.impresso(2.7, 4.8, parede, fx({ x: -2.05, y: 2.4, z: ZP, prof: 0.06 }));        // parede à esquerda da porta
  P.impresso(3.0, 4.8, parede, fx({ x: 2.2, y: 2.4, z: ZP, prof: 0.06 }));          // à direita
  P.impresso(1.4, 2.2, parede, fx({ x: 0.0, y: 3.7, z: ZP, prof: 0.06 }));          // em cima da porta (vão 1.4 x 2.6)
  P.peca(F.ret(7.6, 0.16, 0.02), fx({ prof: 0.12, cor: 0xfaf3e2, y: 0.08, z: ZP + 0.06 }));   // rodapé
  // batente
  P.peca(F.ret(0.12, 2.66, 0.02), fx({ prof: 0.1, cor: 0xa86f40, x: -0.76, y: 1.33, z: ZP + 0.05 }));
  P.peca(F.ret(0.12, 2.66, 0.02), fx({ prof: 0.1, cor: 0xa86f40, x: 0.76, y: 1.33, z: ZP + 0.05 }));
  P.peca(F.ret(1.64, 0.12, 0.02), fx({ prof: 0.1, cor: 0xa86f40, y: 2.66, z: ZP + 0.05 }));
  // corredor atrás (escuro, com luz da cozinha)
  P.peca(F.ret(4, 3.2, 0.02), fx({ prof: 0.04, cor: 0x7d6a58, y: 1.6, z: -3.4 }));
  P.peca(F.ret(1.1, 2.0, 0.04), fx({ prof: 0.02, cor: 0xf3d58a, x: 1.2, y: 1.0, z: -3.36 }));    // porta da cozinha acesa ao fundo
  P.deitado(F.ret(4, 1.3, 0.02), fx({ cor: 0x9c7a55, z: -2.85 }));
  // folha da porta aberta pra dentro do quarto
  const dob = P.grupo({ x: 0.7, z: ZP + 0.02, ry: -1.25 });
  P.peca(F.ret(1.36, 2.56, 0.03), fx({ pai: dob, prof: 0.07, cor: 0xc58a52, x: 0.68, y: 1.28 }));
  P.peca(F.ret(1.0, 0.9, 0.03), fx({ pai: dob, prof: 0.075, cor: 0xb57a45, x: 0.68, y: 1.85, z: 0.001 }));
  P.peca(F.ret(1.0, 0.9, 0.03), fx({ pai: dob, prof: 0.075, cor: 0xb57a45, x: 0.68, y: 0.75, z: 0.001 }));
  P.peca(F.circulo(0.06), fx({ pai: dob, prof: 0.1, cor: 0xe2be5a, x: 1.2, y: 1.25 }));
  // janela (quadro com céu) e cortinas que balançam
  P.peca(F.ret(1.25, 1.45, 0.03), fx({ prof: 0.08, cor: 0xfaf3e2, x: -1.75, y: 2.45, z: ZP + 0.05 }));
  P.impresso(1.08, 1.28, (g, ww, hh) => { const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#9fd2ef'); gr.addColorStop(1, '#d9f0fb'); g.fillStyle = gr; g.fillRect(0, 0, ww, hh);
    g.fillStyle = '#ffe07a'; g.beginPath(); g.arc(ww * 0.72, hh * 0.25, ww * 0.12, 0, 7); g.fill();
    g.fillStyle = '#93c77f'; g.beginPath(); g.moveTo(0, hh * 0.8); g.quadraticCurveTo(ww * 0.4, hh * 0.62, ww, hh * 0.78); g.lineTo(ww, hh); g.lineTo(0, hh); g.fill();
    g.fillStyle = '#faf3e2'; g.fillRect(ww / 2 - 5, 0, 10, hh); g.fillRect(0, hh / 2 - 5, ww, 10); }, fx({ x: -1.75, y: 2.45, z: ZP + 0.1 }));
  const cort = [-1, 1].map((s) => { const c = P.grupo({ x: -1.75 + s * 0.68, y: 3.25, z: ZP + 0.16 });
    P.peca(F.poligono([[-0.18, 0], [0.18, 0], [0.24 - s * 0.04, -1.7], [-0.24 - s * 0.04, -1.7]]), fx({ pai: c, prof: 0.04, cor: 0xd8604f, y: 0 }));
    P.peca(F.ret(0.5, 0.06, 0.02), fx({ pai: c, prof: 0.05, cor: 0xb84c3e, y: -0.9, z: 0.001 })); return [c, s]; });
  P.peca(F.ret(1.9, 0.06, 0.03), fx({ prof: 0.08, cor: 0x7b4a2b, x: -1.75, y: 3.28, z: ZP + 0.2 }));
  // parede do lado direito (fecha o quarto quando a cabeça vira pra cama)
  P.impresso(7.2, 4.8, parede, fx({ x: 3.5, y: 2.4, z: 1.4, ry: -Math.PI / 2, prof: 0.06 }));
  P.impresso(7.2, 4.8, parede, fx({ x: -3.4, y: 2.4, z: 1.4, ry: Math.PI / 2, prof: 0.06 }));
  // relógio em cima da porta (6:52, ponteiro andando)
  L.relogio({ x: 0, y: 3.35, z: ZP + 0.08, s: 0.3, t: -1, hora: 6, min0: 52, min1: 52.3, D });
  // tapete e cama (tu tá sentado na beira dela)
  P.deitado(F.elipse(1.5, 0.9), fx({ cor: 0x5c8fc9, x: -0.3, z: 0.6 }));
  P.deitado(F.elipse(1.3, 0.75), fx({ cor: 0x8cc3e8, x: -0.3, z: 0.6, y: 0.01, prof: 0.031 }));
  P.caixa(2.6, 0.62, 3.2, fx({ cor: 0x4d7fbf, x: 2.25, y: 0.31, z: 2.9 }));
  P.caixa(2.62, 0.08, 3.22, fx({ cor: 0xf2e4c4, x: 2.25, y: 0.66, z: 2.9 }));
  // celular em cima da cama (vibra quando toca)
  const cel = P.grupo({ x: 1.45, y: 0.72, z: 2.6, rx: -Math.PI / 2, rz: 0.35 });
  P.caixa(0.32, 0.62, 0.04, fx({ pai: cel, cor: 0x26262b }));
  const telaOff = P.peca(F.ret(0.28, 0.56, 0.03), fx({ pai: cel, prof: 0.01, cor: 0x3a3a40, z: 0.022 }));
  const telaOn = P.impresso(0.28, 0.56, (g, ww, hh) => { g.fillStyle = '#2b6ea8'; g.fillRect(0, 0, ww, hh); g.fillStyle = '#f0bf94'; g.beginPath(); g.arc(ww / 2, hh * 0.38, ww * 0.26, 0, 7); g.fill();
    g.fillStyle = '#2b2622'; g.font = `bold ${ww * 0.22}px sans-serif`; g.textAlign = 'center'; g.fillText('EU', ww / 2, hh * 0.42);
    g.fillStyle = '#e04848'; g.beginPath(); g.arc(ww * 0.28, hh * 0.82, ww * 0.1, 0, 7); g.fill(); g.fillStyle = '#3fae5a'; g.beginPath(); g.arc(ww * 0.72, hh * 0.82, ww * 0.1, 0, 7); g.fill(); },
    fx({ pai: cel, z: 0.03 }));
  const ondas = [0, 1].map(() => { const gg = P.grupo({ pai: cel, z: 0.02 }); P.peca(F.anel(0.42, 0.39), fx({ pai: gg, prof: 0.005, cor: 0xffffff })); return gg; });
  const toca = (t) => t >= 7.9 && t < 10.8;
  P.animar((ts, t) => {
    const on = toca(t);
    const vib = on && Math.sin(t * 2 * Math.PI * 1.4) > -0.2 ? Math.sin(t * 2 * Math.PI * 22) * 0.018 : 0;
    cel.position.x = 1.45 + vib; telaOn.visible = on; telaOff.visible = !on;
    ondas.forEach((gg, k) => { const u = ((t * 0.9 + k * 0.5) % 1); gg.scale.setScalar(0.8 + u * 0.9); gg.visible = on && u < 0.95; });
    cort.forEach(([c, s]) => { c.rotation.z = 0.035 * Math.sin(t * 1.2 + s); });
  });
  // ---------- a mãe na porta ----------
  const rig = P.grupo({ x: 0.3, z: -2.42 });
  L.ator({ pai: rig, saia: 0x7d5bb0, roupa: 0x8e6cc4, coque: true, cabelo: 0x4a2f22, nome: 'mae', D: 11, t: -1, sapato: 0x5a3a2a, dir: -1, saiaH: 0.85,
    poses: [[0, 'aponta'], [1.7, 'normal', 0.4], [3.2, 'normal']], mov: [[0, 0], [3.65, 0], [5.6, -2.8, 0, 'lin']] });
  P.animar((ts, t) => { rig.rotation.y = K([[0, 0.32], [3.2, 0.32], [3.6, 0]])(t); });
  // ---------- tuas mãos (presas na câmera) ----------
  const rigCam = V.cabeca([
    [0, w(0.0, 1.5, 2.6), w(-0.15, 1.45, -2.2)], [3.9, w(0.05, 1.5, 2.75), w(-0.1, 1.45, -2.2)],
    [4.6, w(0.1, 1.38, 4.25), w(0.0, 0.9, -1.0)], [7.4, w(0.1, 1.38, 4.25), w(0.0, 0.9, -1.0)],
    [8.0, w(0.15, 1.42, 4.3), w(0.2, 1.2, -1.5)], [9.2, w(0.3, 1.5, 4.0), w(1.4, 0.75, 2.55)],
    [10.4, w(0.55, 1.25, 3.55), w(1.45, 0.72, 2.6)], [10.72, w(0.7, 1.12, 3.3), w(1.45, 0.72, 2.6)]]);
  // tênis nas duas mãos: sobe de baixo, tu olha, gira, desce
  const seg = P.grupo({ pai: rigCam });
  const ten = V.tenis(seg, { s: 0.3, x: 0.0, y: -0.03, z: 0.0 });
  const mE = V.mao(seg, -1, { s: 0.13, x: -0.16, y: -0.06, z: 0.03, rz: -0.35 });
  const mD = V.mao(seg, 1, { s: 0.13, x: 0.16, y: -0.06, z: 0.03, rz: 0.35 });
  mE.dedos.forEach((d) => d.rotation.x = -0.9); mD.dedos.forEach((d) => d.rotation.x = -0.9);
  P.animar((ts, t) => {
    const up = sm((t - 4.4) / 0.6) * (1 - sm((t - 7.1) / 0.6));
    seg.position.set(0, -0.75 + up * 0.62 + 0.012 * Math.sin(t * 2.3), -1.0);
    seg.rotation.z = 0.12 * Math.sin(t * 1.6) * up; seg.rotation.y = 0.25 * Math.sin(t * 1.1) * up;
    seg.visible = up > 0.001;
  });
  // mão direita indo pegar o celular
  const pega = V.mao(rigCam, 1, { s: 0.17 });
  P.animar((ts, t) => {
    const u = sm((t - 9.5) / 1.0);
    pega.g.position.set(0.08, -0.55 + 0.38 * u, -0.75 + 0.05 * u);
    pega.g.rotation.set(-0.5 * u, 0, 0.15);
    pega.dedos.forEach((d, i) => d.rotation.x = -0.15 - 0.4 * sm((t - 10.35) / 0.3));
    pega.g.visible = u > 0.001;
  });
};
