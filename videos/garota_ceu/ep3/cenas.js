// Ep. 3 · Seguindo a água. Uma função por cena (P, L, D). Nenhum corpo aparece (só as poltronas).
const CORTE = (ks) => ks.flatMap(([t, pos, alvo], i) => (i ? [[t - 0.001, ks[i - 1][1], ks[i - 1][2]], [t, pos, alvo]] : [[t, pos, alvo]]));
window.EP = [];
(() => {
  const DEITA = { rot: 1.52, ly: -0.98, tN: 0.08, kN: -0.15, tF: 0.02, kF: -0.08, pN: 0, pF: 0, sN: 0.0, eN: 0.1, sF: 0.0, eF: 0.1, head: 0.1, olhosF: 1 };
  const chaoGrande = (P, L, cor = 0x4a3a28) => P.deitado(P.F.ret(26, 26, 0.02), { prof: 0.005, cor, z: 6.0, ...L.FX });
  // água vista de lado: faixa em pé na frente que esconde os pés de quem está dentro
  const aguaFrente = (P, L, z, h = 0.3, cor = 0x3f6670) => {
    P.peca(P.F.ret(30, h, 0.01), { prof: 0.02, cor, y: h / 2, z, ...L.FX });
    const r = P.fixo(17), bs = [];
    for (let i = 0; i < 18; i++) bs.push([P.peca(P.F.elipse(0.08 + r() * 0.1, 0.012), { prof: 0.01, cor: 0x86aeb2, x: -6 + r() * 12, y: h * (0.3 + r() * 0.6), z: z + 0.015, ...L.FX }), r()]);
    P.animar((ts, t) => bs.forEach(([b, k]) => { b.position.x = ((-6 + k * 12 + t * 0.5) + 7) % 14 - 7; }));
  };
  const chuva = (P, L, t0 = 0, cor = 0xb8c8d0) => {
    const r = P.fixo(23), gs = [];
    for (let i = 0; i < 70; i++) gs.push([P.peca(P.F.ret(0.012, 0.35, 0.005), { prof: 0.005, cor, x: -4 + r() * 8, y: 4, z: -1.5 + r() * 4, rz: 0.12, ...L.FX }), r()]);
    P.animar((ts, t) => gs.forEach(([g, k]) => { g.visible = t > t0; g.position.y = 5 - ((t * 7 + k * 5) % 5.5); }));
  };
  const moscas = (P, L, alvo) => { // pontinhos pretos voando em volta de um ponto
    const ms = [0, 1, 2, 3, 4].map(() => P.peca(P.F.circulo(0.025), { prof: 0.02, cor: 0x141414, ...L.FX }));
    P.animar((ts, t) => ms.forEach((m, i) => { const a = t * (3 + i * 0.7) + i * 1.3; m.position.set(alvo[0] + Math.cos(a) * (0.25 + i * 0.05), alvo[1] + Math.sin(a * 1.3) * 0.18, alvo[2] + 0.3 + Math.sin(a) * 0.1); }));
  };
  const urubu = (P, L, o) => { // urubu-rei de papel: corpo preto, peito e asa claros, cabeça colorida
    const g = P.grupo({ x: o.x, y: o.y, z: o.z }); g.scale.setScalar(o.s ?? 1);
    P.peca(P.F.elipse(0.34, 0.2), { pai: g, prof: 0.06, cor: 0xe8e2d4, ...L.FX });
    const asa = P.grupo({ pai: g, y: 0.05, z: 0.05 });
    P.peca(P.F.poligono([[-0.1, 0], [0.2, 0.02], [-0.55, 0.4], [-0.75, 0.3]]), { pai: asa, prof: 0.03, cor: 0x1c1a18, ...L.FX });
    P.peca(P.F.circulo(0.09), { pai: g, prof: 0.07, cor: 0xe08a3a, x: 0.34, y: 0.12, ...L.FX });
    P.peca(P.F.poligono([[0.42, 0.12], [0.52, 0.08], [0.42, 0.06]]), { pai: g, prof: 0.07, cor: 0xd8c24a, ...L.FX });
    P.peca(P.F.ret(0.24, 0.1, 0.02), { pai: g, prof: 0.065, cor: 0x1c1a18, x: -0.4, y: -0.02, ...L.FX });
    return { g, asa };
  };
  const lata = (P, pai, o = {}) => { // lata de combustível
    const g = P.grupo({ pai, x: o.x || 0, y: o.y || 0, z: o.z || 0 });
    P.caixa(0.32, 0.42, 0.18, { pai: g, y: 0.21, cor: 0xb8342a, t: -1, entra: 'fixo', esboco: false });
    P.caixa(0.06, 0.12, 0.06, { pai: g, x: 0.1, y: 0.47, cor: 0xd8c24a, t: -1, entra: 'fixo', esboco: false });
    return g;
  };
  const cachorro = (P, L, o) => {
    const g = P.grupo({ x: o.x, z: o.z });
    P.peca(P.F.elipse(0.36, 0.17), { pai: g, prof: 0.12, cor: 0x9a7a52, y: 0.45, ...L.FX });
    [-0.22, 0.22].forEach((x) => P.peca(P.F.ret(0.07, 0.36, 0.02), { pai: g, prof: 0.1, cor: 0x7a5a3a, x, y: 0.2, ...L.FX }));
    P.peca(P.F.circulo(0.15), { pai: g, prof: 0.12, cor: 0x9a7a52, x: 0.4, y: 0.62, ...L.FX });
    P.peca(P.F.elipse(0.06, 0.11), { pai: g, prof: 0.13, cor: 0x5a3e2a, x: 0.36, y: 0.66, ...L.FX });
    P.peca(P.F.circulo(0.025), { pai: g, prof: 0.13, cor: 0x141414, x: 0.47, y: 0.66, ...L.FX });
    P.peca(P.F.ret(0.24, 0.04, 0.02), { pai: g, prof: 0.06, cor: 0x7a5a3a, x: -0.45, y: 0.55, rz: 0.6, ...L.FX });
    return g;
  };
  window.EP = [
    // 1 ela andando na beira do riacho; vira o saquinho e não cai nada
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 21 });
      L.riacho({ z: 1.9, larg: 1.4, w: 16 });
      L.ator(Object.assign({}, L.JU_ANDA, { x: -1.6, z: 0.8, D, t: -1, mov: [[0, -1.6], [3.4, 0.2, 0.8, 'lin']], poses: [[0, 'ombro_quebrado'], [3.6, 'ombro_quebrado+aponta', 0.4], [5.4, 'ombro_quebrado', 0.5]],
        naMao: (m, op) => P.peca(P.F.ret(0.16, 0.2, 0.02), Object.assign({ pai: m, prof: 0.02, cor: 0xefe6d2, x: 0.08, y: -0.1 }, op)) }));
      L.veu(0x0e2a14, 0.12);
      L.CAM([[0, [-1.0, 1.7, 8.6], [-0.8, 1.2, 0.8]], [D, [0.2, 1.7, 7.6], [0.2, 1.3, 0.8]]]);
    },
    // 2 o toró da tarde... e de noite ela encolhida, tremendo
    (P, L, D) => {
      const a = D * 0.45;
      chaoGrande(P, L); L.floresta({ semente: 22 });
      chuva(P, L);
      L.ator(Object.assign({}, L.JU_ANDA, { x: 0.0, z: 0.8, D, t: -1, poses: [[0, 'ombro_quebrado+olha_cima'], [a, 'sentado_chao', 0.01]] }));
      L.tremor([[a + 0.2, 0.025, D - a - 0.3]]);
      L.veu(0x10203a, (t) => (t < a ? 0.25 : 0.5));
      L.CAM(CORTE([[0, [0.5, 1.8, 7.6], [0.0, 1.4, 0.8]], [a, [0.4, 1.3, 6.4], [0.0, 0.8, 0.8]], [D, [0.35, 1.3, 5.8], [0.0, 0.8, 0.8]]]));
    },
    // 3 andando dentro d'água, arrastando o pé (a água esconde os pés)
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 23 });
      L.riacho({ z: 1.0, larg: 2.4, w: 16 });
      L.ator(Object.assign({}, L.JU_ANDA, { x: -1.2, z: 1.0, D, t: -1, mov: [[0, -1.2], [D, 0.6, 1.0, 'lin']], poses: [[0, 'ombro_quebrado+testa_chao']] }));
      aguaFrente(P, L, 1.5, 0.32);
      L.veu(0x0e2a14, 0.1);
      L.CAM([[0, [-0.6, 1.2, 7.0], [-0.4, 1.0, 1.0]], [D, [0.4, 1.2, 6.6], [0.4, 1.0, 1.0]]]);
    },
    // 4 urubus-reis pousando atrás das folhas... corte: ela para e olha
    (P, L, D) => {
      const a = 3.6;
      chaoGrande(P, L); L.floresta({ semente: 24 });
      const us = [[-0.8, 0], [0.4, 0.6], [1.3, 1.1]].map(([x, d]) => [urubu(P, L, { x, y: 4, z: -0.6, s: 1.1 }), d]);
      P.animar((ts, t) => us.forEach(([u, d]) => { const k = L.sm((t - 0.2 - d) / 1.6); u.g.position.y = 4.0 - k * 3.2; u.asa.rotation.z = (1 - k) * Math.sin(t * 9) * 0.5 - k * 0.2; }));
      for (let i = 0; i < 4; i++) L.folhaGrande({ x: -1.6 + i * 1.1, y: 0.5, z: 0.4, rz: 0.4 - i * 0.3, s: 1.2, cor: [0x2f6a3a, 0x3f7f45, 0x2a5e34][i % 3] });
      L.ator(Object.assign({}, L.JU_ANDA, { x: -3.0, z: 1.1, D, t: -1, poses: [[0, 'ombro_quebrado'], [a + 0.6, 'ombro_quebrado+aponta', 0.5]] }));
      L.veu(0x0e2a14, 0.1);
      L.CAM(CORTE([[0, [0.2, 1.8, 8.0], [0.2, 1.6, -0.6]], [a, [-2.4, 1.7, 7.4], [-1.8, 1.4, 0.4]], [D, [-2.3, 1.7, 7.0], [-1.7, 1.4, 0.4]]]));
    },
    // 5 a fileira de poltronas no meio das folhas (sem mostrar ninguém); ela olha de longe
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 25, fundo: 0x182e20 });
      L.fileira({ x: 0.8, y: 0.25, z: -0.6, rz: 0.05, ry: 0.5, D });
      for (let i = 0; i < 5; i++) L.folhaGrande({ x: -0.2 + i * 0.6, y: 0.45 + (i % 2) * 0.2, z: 0.3, rz: 0.2 - i * 0.25, s: 1.3, cor: [0x2f6a3a, 0x3f7f45, 0x2a5e34][i % 3] });
      L.ator(Object.assign({}, L.JU_ANDA, { x: -2.0, z: 1.1, D, t: -1, poses: [[0, 'ombro_quebrado'], [2.0, 'ombro_quebrado+curvado', 0.8]] }));
      L.veu(0x0e1a20, 0.22);
      L.CAM([[0, [-0.4, 1.9, 9.6], [-0.4, 1.2, 0.2]], [D, [-0.6, 1.8, 8.6], [-0.6, 1.2, 0.2]]]);
    },
    // 6 o rosto dela olhando pra baixo... corte: lembrança da mãe (sépia)
    (P, L, D) => {
      const a = D * 0.62;
      chaoGrande(P, L); L.floresta({ semente: 26, fundo: 0x182e20 });
      L.ator(Object.assign({}, L.JU_ANDA, { x: 0.0, z: 1.0, D, t: -1, poses: [[0, 'ombro_quebrado+curvado']] }));
      L.veu(0x0e1a20, 0.22);
      const lemb = P.grupo({ x: 40 });
      P.peca(P.F.ret(12, 10, 0.02), { pai: lemb, prof: 0.03, cor: 0xcbb48a, y: 3.0, z: -1.6, ...L.FX });
      P.deitado(P.F.ret(12, 8, 0.02), { pai: lemb, prof: 0.01, cor: 0xa8926a, z: 1.5, ...L.FX });
      L.ator(Object.assign({}, L.MAE, { pai: lemb, x: 0, z: 0.6, D, t: -1, dir: -1, poses: [[0, 'carrega']] }));
      L.CAM(CORTE([[0, [0.5, 1.8, 6.0], [0.0, 1.5, 1.0]], [a, [40.3, 1.7, 6.4], [40.0, 1.4, 0.6]], [D, [40.25, 1.7, 5.8], [40.0, 1.45, 0.6]]]));
      P.animar((ts, t) => { P.foco = t < a ? [0.18, 0.36] : [0, 0.01]; });
    },
    // 7 ela vira e segue andando pela margem
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 27 });
      L.riacho({ z: 1.9, larg: 1.4, w: 16 });
      L.ator(Object.assign({}, L.JU_ANDA, { x: -0.6, z: 0.8, D, t: -1, mov: [[0, -0.6], [0.6, -0.6], [D, 1.2, 0.8, 'lin']] }));
      L.veu(0x0e2a14, 0.14);
      L.CAM([[0, [-0.2, 1.8, 8.4], [0.0, 1.3, 0.8]], [D, [0.4, 1.8, 8.4], [0.6, 1.3, 0.8]]]);
    },
    // 8 moscas em volta do ombro machucado (a ferida não aparece)
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 28 });
      L.ator(Object.assign({}, L.JU_ANDA, { x: 0.0, z: 0.9, D, t: -1, poses: [[0, 'ombro_quebrado'], [2.0, 'ombro_quebrado+curvado', 0.6]] }));
      moscas(P, L, [0.0, 1.95, 0.9]);
      L.veu(0x0e2a14, 0.12);
      L.CAM([[0, [0.6, 1.8, 6.6], [0.0, 1.6, 0.9]], [D, [0.5, 1.85, 5.6], [0.0, 1.7, 0.9]]]);
    },
    // 9 o rio largo: ela boiando, levada pela correnteza
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 29, fundo: 0x24462c });
      L.riacho({ z: 0.6, larg: 4.4, w: 30, v: 0.8 });
      L.ator(Object.assign({}, L.JU_FERIDA, { x: -1.4, z: 0.9, D, t: -1, olhoInchado: true, mov: [[0, -1.4], [D, 0.8, 0.9, 'lin']], poses: [[0, 'boia']] }));
      aguaFrente(P, L, 1.25, 0.16, 0x3f6670);
      L.veu(0x0e2a14, 0.08);
      L.CAM([[0, [-0.8, 1.6, 7.8], [-0.6, 0.6, 0.8]], [D, [0.4, 1.6, 7.4], [0.4, 0.6, 0.8]]]);
    },
    // 10 um barco amarrado na margem
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 30, fundo: 0x24462c });
      L.riacho({ z: 1.4, larg: 3.0, w: 30, v: 0.8 });
      L.canoa({ x: 0.9, z: 0.5, w: 3.0 });
      P.caixa(0.08, 0.7, 0.08, { x: 2.7, y: 0.35, z: 0.2, cor: 0x5a4028, ...L.FX });
      P.peca(P.F.ret(0.4, 0.02, 0.01), { prof: 0.02, x: 2.5, y: 0.45, z: 0.3, rz: -0.2, cor: 0xb8a070, ...L.FX });
      L.ator(Object.assign({}, L.JU_FERIDA, { x: -2.4, z: 1.6, D, t: -1, olhoInchado: true, mov: [[0, -2.4], [D, -1.0, 1.6, 'lin']], poses: [[0, 'boia']] }));
      aguaFrente(P, L, 1.95, 0.16);
      L.veu(0x0e2a14, 0.08);
      L.CAM([[0, [-0.4, 1.8, 9.2], [-0.2, 0.8, 0.8]], [D, [0.0, 1.8, 8.6], [0.2, 0.8, 0.8]]]);
    },
    // 11 a trilha subindo até a cabana vazia
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 31 });
      L.cabana({ x: 1.4, z: -0.4 });
      for (let i = 0; i < 6; i++) P.deitado(P.F.elipse(0.32, 0.12), { prof: 0.01, cor: 0x8a6a42, x: -2.0 + i * 0.55, z: 1.4 - i * 0.2, ...L.FX });
      L.ator(Object.assign({}, L.JU_ANDA, { x: -2.2, z: 1.3, D, t: -1, mov: [[0, -2.2], [D, -0.6, 1.0, 'lin']] }));
      L.veu(0x0e2a14, 0.1);
      L.CAM([[0, [-0.4, 2.2, 10.4], [-0.2, 1.5, 0.2]], [D, [-0.2, 2.1, 9.6], [0.0, 1.5, 0.2]]]);
    },
    // 12 dentro da cabana: a lata de combustível... corte: lembrança do pai tratando um cachorro (sépia)
    (P, L, D) => {
      const a = D * 0.5;
      chaoGrande(P, L); L.floresta({ semente: 32 });
      const piso = L.cabana({ x: 0, z: -0.2 });
      lata(P, piso, { x: 0.9, z: 0.2 });
      L.ator(Object.assign({}, L.JU_ANDA, { pai: piso, x: -0.3, z: 0.3, D, t: -1, poses: [[0, 'ajoelhado']] }));
      const lemb = P.grupo({ x: 40 });
      P.peca(P.F.ret(12, 10, 0.02), { pai: lemb, prof: 0.03, cor: 0xcbb48a, y: 3.0, z: -1.6, ...L.FX });
      P.deitado(P.F.ret(12, 8, 0.02), { pai: lemb, prof: 0.01, cor: 0xa8926a, z: 1.5, ...L.FX });
      L.ator(Object.assign({}, L.PAI, { pai: lemb, x: -0.5, z: 0.6, D, t: -1, poses: [[0, 'ajoelhado']] }));
      cachorro(P, L, { x: 40.5, z: 0.3 });
      L.CAM(CORTE([[0, [0.3, 1.9, 7.4], [0.2, 1.2, 0.0]], [a, [40.0, 1.5, 6.4], [40.0, 0.9, 0.5]], [D, [40.0, 1.5, 5.8], [40.0, 0.9, 0.5]]]));
      P.animar((ts, t) => { P.foco = t < a ? [0.18, 0.36] : [0, 0.01]; });
      L.veu(0x2a2010, (t) => (t < a ? 0.18 : 0.25));
    },
    // 13 ela derrama o combustível no braço (só a lata inclinando e gotas)
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 32 });
      const piso = L.cabana({ x: 0, z: -0.2 });
      const lt = lata(P, piso, { x: 0.35, y: 0.75, z: 0.45 });
      P.animar((ts, t) => { lt.rotation.z = 1.1 * L.sm((t - 0.6) / 0.6); });
      const gs = []; for (let i = 0; i < 6; i++) gs.push(P.peca(P.F.circulo(0.025), { pai: piso, prof: 0.02, cor: 0xd8c24a, x: 0.15, z: 0.5, ...L.FX }));
      P.animar((ts, t) => gs.forEach((g, i) => { const u = (t * 1.6 + i / 6) % 1; g.visible = t > 1.2; g.position.y = 0.95 - u * 0.4; }));
      L.ator(Object.assign({}, L.JU_ANDA, { pai: piso, x: -0.2, z: 0.3, D, t: -1, poses: [[0, 'ajoelhado+carrega']] }));
      L.veu(0x2a2010, 0.16);
      L.CAM([[0, [0.4, 1.9, 6.4], [0.0, 1.4, 0.0]], [D, [0.35, 1.9, 5.8], [0.0, 1.45, 0.0]]]);
    },
    // 14 ela olha o barco... e vira as costas
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 30, fundo: 0x24462c });
      L.riacho({ z: 1.9, larg: 2.4, w: 30, v: 0.8 });
      L.canoa({ x: 1.4, z: 1.6, w: 3.0 });
      L.ator(Object.assign({}, L.JU_ANDA, { x: -0.6, z: 0.5, D, t: -1, dirs: [[0, 1], [2.4, -1]], mov: [[0, -0.6], [2.6, -0.6], [D, -1.8, 0.5, 'lin']] }));
      L.veu(0x0e2a14, 0.12);
      L.CAM([[0, [0.0, 1.9, 8.8], [0.2, 1.1, 0.6]], [D, [-0.4, 1.9, 8.4], [-0.3, 1.1, 0.6]]]);
    },
    // 15 noite: ela deita no chão da cabana; a câmera se afasta até a cabana pequena no escuro
    (P, L, D) => {
      chaoGrande(P, L); L.floresta({ semente: 33 });
      const piso = L.cabana({ x: 0, z: -0.2 });
      L.ator(Object.assign({}, L.JU_FERIDA, { pai: piso, x: 0.3, z: 0.1, D, t: -1, olhoInchado: true, poses: [[0, 'ajoelhado'], [1.2, DEITA, 1.0]] }));
      L.riacho({ z: 2.4, larg: 2.0, w: 16 });
      L.veu(0x0a1430, (t) => 0.3 + 0.25 * L.sm(t / D));
      L.CAM([[0, [0.2, 1.6, 6.4], [-0.1, 1.1, 0.0]], [D, [0.2, 3.2, 14.0], [0.0, 1.6, 0.0]]]);
    },
  ];
})();
