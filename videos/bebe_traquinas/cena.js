// "Bebê traquinas" — 23 tomadas no tempo da música (window.DADOS.tl = inícios em s).
window.CENA = (T) => {
  const C = T.cen, P = C.P, K = T.chaves, J = T.janela, V = THREE.Vector3;
  T.fisheye.k.value = 0.07; T.fisheye.vin.value = 0.28; T.cam.fov = 50; T.cam.updateProjectionMatrix();
  const TL = window.DADOS.tl, FIM = window.DADOS.fim;
  const hemi = T.cena.children.find((o) => o.isHemisphereLight);
  const BPM = 123.05, B0 = 0.12; const batida = (t) => { const f = ((t - B0) * BPM / 60) % 1; return Math.exp(-f * 6); };
  // câmera de celular: tremidinha de mão
  const cam = (ox, p, l, u, amp = 1) => {
    const s = 0.012 * amp;
    T.cam.position.set(ox + p[0] + s * Math.sin(u * 3.1) + s * 0.5 * Math.sin(u * 7.3), p[1] + s * Math.sin(u * 2.3 + 1), p[2] + s * 0.6 * Math.cos(u * 2.7));
    T.cam.lookAt(ox + l[0] + s * 0.6 * Math.sin(u * 4.1 + 2), l[1] + s * 0.6 * Math.sin(u * 3.7), l[2]);
  };
  const pisca = (u, s = 0) => { const c = (u + s) % 2.9; return c < 0.13 ? Math.sin(c / 0.13 * Math.PI) : 0; };
  const S = [];
  const tomada = (luz, f) => { const i = S.length; const ox = i * 40; const g = T.grupo(null, ox, 0, 0); g.visible = false; S.push({ g, luz, upd: f(g, ox) }); };
  const LUZ_CASA = { bg: '#efe7dc', hi: 1.45, sol: 1.2 }, LUZ_SOL = { bg: '#9fd6ff', hi: 1.6, sol: 1.6 }, LUZ_NOITE = { bg: '#2c3440', hi: 1.15, sol: 0.9 };
  // paredes e chãos de casa
  const comodo = (g, parede = '#f4efe6', rejunte = '#ddd3c4', piso = '#d9cdb9', pisoLinha = '#bfb29c', o = {}) => {
    const pw = C.parede(8, 3.2, o.lisa ? null : C.tex(C.azulejo(parede, rejunte, 4), 256, [8, 3.2]), g, o.lisa ? parede : '#ffffff'); pw.position.z = o.z || -0.6;
    const ch = C.plano(8, 8, o.madeira ? C.tex(C.tabuas(piso, pisoLinha), 256, [5, 5]) : C.tex(C.azulejo(piso, pisoLinha, 3), 256, [6, 6]), g); ch.position.z = 3;
    if (o.lateral) { const pl = C.parede(8, 3.2, null, g, o.lateral); pl.rotation.y = Math.PI / 2; pl.position.set(-2.2, 1.6, 3); }
    return { pw, ch };
  };
  const cortina = (g, x, z, larg = 1.2, alt = 2.6) => { const c = T.grupo(g, x, 0, z); for (let i = 0; i < 6; i++) { const d = T.cilindro(0.11, 0.11, alt, '#f6f3ee', c); d.position.set((i - 2.5) * larg / 6, alt / 2, Math.sin(i * 2.1) * 0.03); } return c; };
  const bonequinhos = (g, n, area, cores = ['#ffd23a', '#ff6b6b', '#4fb3ff', '#7bd66b', '#c58aff']) => { for (let i = 0; i < n; i++) { const o = i % 3 ? C.rb(0.1, 0.1, 0.1, 0.02, cores[i % 5], g) : T.esfera(0.06, cores[i % 5], g); o.position.set(C.R(area[0], area[1]), 0.05, C.R(area[2], area[3])); o.rotation.y = C.R(0, 3); } };
  const boias = (B) => { for (const L of ['E', 'D']) { const b = T.m(new THREE.TorusGeometry(0.055, 0.03, 12, 24), T.mat('#ff9a3c'), B.br[L].om, { w: 0.003 }); b.rotation.x = Math.PI / 2; b.position.y = -0.07; } };
  const mae = (g, o = {}) => T.pessoa(Object.assign({ pai: g, pele: '#eab894', cabelo: '#2a1a12', roupa: '#e8508a', calca: '#e8508a', coque: false }, o));

  // 0 "Minha meta agora é manter meu" — sobe na pia do banheiro pelo banquinho
  tomada(LUZ_CASA, (g, ox) => {
    comodo(g, '#f4efe6', '#ddd3c4', '#d9cdb9', '#bfb29c', { z: -0.32 });
    const pia = C.pia(g, 1.5); pia.scale.setScalar(0.8);
    const banq = C.rb(0.42, 0.24, 0.32, 0.03, '#ffd23a', g); banq.position.set(0.05, 0.12, 0.4);
    const B = T.bebe({ pai: g, camisa: '#8db4e2', calca: '#5b6f9c' });
    const TOP = 0.68;
    const ks = [
      [0, { y: 0.24, z: 0.4, ry: Math.PI, tr: [0.25, 0, 0], cb: [-0.3, 0, 0], bE: [-2.0, 0.25, 0, -0.6], bD: [-2.0, 0.25, 0, -0.6], pE: [0, 0.06, 0, 0], pD: [0, 0.06, 0, 0] }],
      [0.45, { y: 0.27, z: 0.38, ry: Math.PI, tr: [0.4, 0, 0], cb: [-0.4, 0, 0], bE: [-1.9, 0.25, 0, -0.9], bD: [-1.9, 0.25, 0, -0.9], pE: [-1.9, 0.1, 2.0, 0.3], pD: [0, 0.06, 0, 0] }],
      [0.72, { y: 0.25, z: 0.36, ry: Math.PI, tr: [0.45, 0, 0], cb: [-0.45, 0, 0], bE: [-1.8, 0.25, 0, -1.1], bD: [-1.8, 0.25, 0, -1.1], pE: [-2.0, 0.1, 2.1, 0.3], pD: [0, 0.06, 0, 0.2] }],
      [1.0, { y: 0.52, z: 0.22, ry: Math.PI, tr: [0.55, 0, 0], cb: [-0.6, 0, 0], bE: [-1.3, 0.3, 0, -1.0], bD: [-1.3, 0.3, 0, -1.0], pE: [-0.9, 0.1, 1.9, 0.4], pD: [-0.2, 0.1, 0.5, 0] }],
      [1.3, { y: TOP - 0.078, z: 0.08, ry: Math.PI, tr: [0.25, 0, 0], cb: [-0.2, 0, 0], bE: [-1.0, 0.3, 0, -0.5], bD: [-2.0, 0.2, 0, -0.3], pE: [0, 0.12, 1.57, 0.5], pD: [0, 0.12, 1.57, 0.5] }],
      [1.9, { y: TOP - 0.078, z: 0.08, ry: Math.PI, tr: [0.15, -0.3, 0], cb: [0, -0.9, 0], bE: [-1.0, 0.3, 0, -0.5], bD: [-2.2, 0.2, 0, -0.3], pE: [0, 0.12, 1.57, 0.5], pD: [0, 0.12, 1.57, 0.5] }],
    ];
    return (u, D) => {
      B.pose(C.PK(ks, u)); B.rosto({ ri: J(u, 1.2, 1.6), ab: u > 1.45 ? 0.6 : 0, feliz: J(u, 1.4, 1.7) * 0.4, pi: pisca(u) });
      cam(ox, [1.5, 1.2, 1.65], [0, 0.7, 0.1], u);
    };
  });

  // 1 "filho vivo" — nada na piscina com boia de braço
  tomada(LUZ_SOL, (g, ox) => {
    C.ceu(g); const pis = C.piscina(g, 4, 5); pis.position.z = -1.2;
    C.palmeira(g, 3.2).position.set(-2.6, 0, -4.5); C.palmeira(g, 2.6).position.set(2.8, 0, -4.2);
    const muro = C.rb(9, 1.6, 0.2, 0.02, '#e9c9a3', g); muro.position.set(0, 0.8, -4.2);
    const B = T.bebe({ pai: g, semCamisa: true, short: '#38b56a' }); boias(B);
    const resp = C.respingo(g, 10, '#bfefff', 0.55);
    return (u, D) => {
      const z = T.lerp(-2.0, -0.95, u / D), f = u * 2.4;
      B.pose({ x: 0.05 * Math.sin(f * 3.14), y: -0.03, z, rx: 1.3, cb: [-1.25, 0.15 * Math.sin(f * 3.14), 0], bE: [-2.3 + 0.9 * Math.sin(f * 6.28), 0.45, 0, -0.4], bD: [-2.3 - 0.9 * Math.sin(f * 6.28), 0.45, 0, -0.4], pE: [0.35 * Math.sin(f * 9), 0.15, 0.3, 0.5], pD: [-0.35 * Math.sin(f * 9), 0.15, 0.3, 0.5] });
      B.rosto({ ri: 0.8, ab: 0.4, oy: 0.4, pi: pisca(u, 1) });
      pis.tick(u + 3, [[0, z + 1.2 + 0.25, 0, 0.03], [0.1, z + 1.2 + 0.25, 0.5, 0.03]]);
      resp((u * 2.4) % 1, 0.1, -0.08, z + 0.35);
      cam(ox, [0.25, 0.42, 0.55], [0, -0.05, -1.3], u, 1.4);
    };
  });

  // 2 (vaso) — sentado dentro do vaso, rindo
  tomada(LUZ_CASA, (g, ox) => {
    comodo(g, '#eef2f4', '#d5dde2', '#e3e6ea', '#c9ced6', { z: -0.48 });
    const v = C.vaso(g); v.scale.setScalar(1.4);
    const lixo = T.cilindro(0.12, 0.11, 0.3, '#c9ced6', g); lixo.position.set(-0.55, 0.15, -0.25);
    const B = T.bebe({ pai: g, camisa: '#ffffff', short: '#2f3f6e', estampa: '#e8424f' });
    return (u, D) => {
      const b = batida(u + TL[2]);
      B.pose({ y: 0.25, z: 0.17, tr: [-0.12, 0, 0], cb: [-0.08 + 0.06 * b, 0.25 * Math.sin(u * 3), 0], pE: [-1.45, 0.28, 1.35 + 0.25 * Math.sin(u * 9), 0], pD: [-1.45, 0.28, 1.35 - 0.25 * Math.sin(u * 9), 0],
        bE: [-0.5 - 1.6 * J(u, 0.3, 0.6), 0.5, 0, -0.5], bD: [-0.5 - 1.6 * J(u, 0.3, 0.6), 0.5, 0, -0.5] });
      B.rosto({ ri: 1, ab: 0.9, feliz: 0.6 });
      cam(ox, [0.75, 0.95, 1.45], [0, 0.5, 0.05], u);
    };
  });

  // 3 "Ele não quer escutar nada" — pula na piscina, mãe esperando
  tomada(LUZ_SOL, (g, ox) => {
    C.ceu(g); const pis = C.piscina(g, 4, 3); pis.position.z = -1.5;
    const muro = C.rb(9, 2.0, 0.2, 0.02, '#c9a07a', g); muro.position.set(0, 1.0, 1.6);
    C.palmeira(g, 3.4).position.set(-1.2, 0, 1.3);
    const M = mae(g, { roupa: '#1d1d24', calca: '#1d1d24' }); M.g.position.set(-0.4, -1.12, -1.1); M.g.rotation.y = 0.3;
    const B = T.bebe({ pai: g, semCamisa: true, short: '#38c08a' });
    const resp = C.respingo(g, 26);
    const ks = [
      [0, { z: 0.22, ry: Math.PI, bE: [0.4, 0.2, 0, -0.3], bD: [0.4, 0.2, 0, -0.3] }],
      [0.4, C.mix(P.agachado, { z: 0.22, ry: Math.PI, bE: [0.9, 0.2, 0, -0.2], bD: [0.9, 0.2, 0, -0.2] })],
      [0.6, { z: 0.05, y: 0.25, ry: Math.PI, rx: 0.3, bE: [-2.8, 0.3, 0, -0.1], bD: [-2.8, 0.3, 0, -0.1], pE: [-0.3, 0.1, 0.6, 0], pD: [-0.1, 0.1, 0.9, 0] }],
      [0.85, { z: -0.45, y: -0.25, ry: Math.PI, rx: 0.4, bE: [-2.9, 0.5, 0, -0.1], bD: [-2.9, 0.5, 0, -0.1], pE: [-0.5, 0.1, 0.5, 0], pD: [-0.5, 0.1, 0.5, 0] }],
      [1.05, { z: -0.6, y: -0.62, ry: Math.PI, rx: 0.2, bE: [-2.6, 0.7, 0, -0.3], bD: [-2.6, 0.7, 0, -0.3], pE: [-0.5, 0.1, 0.5, 0], pD: [-0.5, 0.1, 0.5, 0] }],
      [1.46, { z: -0.7, y: -0.58, ry: Math.PI, rx: 0.1, bE: [-2.2, 0.7, 0, -0.3], bD: [-2.2, 0.7, 0, -0.3], pE: [-0.3, 0.1, 0.5, 0], pD: [-0.3, 0.1, 0.5, 0] }],
    ];
    return (u, D) => {
      B.pose(C.PK(ks, u)); B.rosto({ ri: 1, ab: u > 0.45 ? 0.8 : 0.3, feliz: 0.3, pi: pisca(u, 2) });
      M.mao('E', [0.18, 1.33, 0.38 + 0.05 * J(u, 0.6, 1.0)], [0.6, -1, -0.3]); M.mao('D', [-0.2, 1.33, 0.38 + 0.05 * J(u, 0.6, 1.0)], [-0.6, -1, -0.3]);
      M.boca(0.4 + 0.3 * Math.sin(u * 8)); M.piscaAuto(u); M.olhar(0.3, -0.2);
      pis.tick(u + 1, [[-0.0, -0.6 + 1.5, 0.95, 0.06]]);
      resp(u - 0.95, 0, -0.08, -0.65);
      cam(ox, [1.9, 0.95, 0.85], [-0.15, 0.05, -0.55], u);
    };
  });

  // 4 "do que eu digo" — escala a grade na beira do lago
  tomada(LUZ_SOL, (g, ox) => {
    C.ceu(g, -30);
    const lago = C.plano(60, 40, null, g, '#5d9fc4'); lago.position.set(0, -0.35, -20);
    const terra = C.plano(8, 3, null, g, '#7a6a52'); terra.position.set(0, 0, 1.2);
    const pier = T.grupo(g, 2.2, 0, -6); C.rb(1.2, 0.08, 6, 0.02, '#8a6a4a', pier).position.set(0, 0.0, 0);
    const telhado = T.m(new THREE.ConeGeometry(1.1, 0.5, 4), T.mat('#d96a3a'), pier); telhado.position.set(0, 1.9, -2.5); telhado.rotation.y = Math.PI / 4;
    for (const [x, z] of [[-0.5, -2], [0.5, -2], [-0.5, -3], [0.5, -3]]) T.cilindro(0.04, 0.04, 1.7, '#8a6a4a', pier).position.set(x, 0.85, z - 0.0);
    C.grade(g, 4);
    const B = T.bebe({ pai: g, camisa: '#e8424f', regata: true, short: '#5aa06a' });
    const ks = [
      [0, { y: 0.27, z: 0.14, ry: Math.PI, tr: [0.15, 0, 0], bE: [-2.6, 0.35, 0, -0.5], bD: [-2.6, 0.35, 0, -0.5], pE: [-0.5, 0.18, 0.9, 0.3], pD: [-0.3, 0.18, 0.6, 0.3] }],
      [0.5, { y: 0.29, z: 0.14, ry: Math.PI, tr: [0.25, 0, 0], bE: [-2.3, 0.35, 0, -0.9], bD: [-2.3, 0.35, 0, -0.9], pE: [-1.5, 0.2, 1.8, 0.3], pD: [-0.3, 0.18, 0.6, 0.3] }],
      [1.0, { y: 0.52, z: 0.14, ry: Math.PI, tr: [0.15, 0, 0], bE: [-1.6, 0.4, 0, -1.2], bD: [-1.6, 0.4, 0, -1.2], pE: [-0.4, 0.2, 0.7, 0.3], pD: [-0.9, 0.2, 1.4, 0.3] }],
      [1.37, { y: 0.52, z: 0.14, ry: Math.PI, tr: [0.1, -0.3, 0], cb: [0, -0.8, 0], bE: [-1.6, 0.4, 0, -1.2], bD: [-1.6, 0.4, 0, -1.2], pE: [-0.4, 0.2, 0.7, 0.3], pD: [-0.9, 0.2, 1.4, 0.3] }],
    ];
    return (u, D) => { B.pose(C.PK(ks, u)); B.rosto({ ri: 0.8, ab: u > 1.1 ? 0.5 : 0, pi: pisca(u, 0.5) }); cam(ox, [1.0, 1.0, 1.7], [0, 0.6, 0], u); };
  });

  // 5 (chocolate) — cara lambuzada, batendo palma
  tomada(LUZ_CASA, (g, ox) => {
    comodo(g, '#3a3a40', '#2e2e33', '#efe3cf', '#d9c9ae', { z: -0.8, lisa: true });
    const arm = C.rb(1.6, 0.9, 0.6, 0.02, '#f2efe9', g); arm.position.set(-0.2, 0.45, -0.5);
    const B = T.bebe({ pai: g, camisa: '#d8323c', regata: true, short: '#f0f0f0' });
    C.chocolate(B);
    const pote = C.pote(g); pote.position.set(0.42, 0.06, 0.25); pote.rotation.z = 1.57;
    const mancha = T.m(new THREE.CircleGeometry(0.12, 16), T.basico('#4a2412'), g, { sem: true }); mancha.rotation.x = -Math.PI / 2; mancha.position.set(0.3, 0.003, 0.3); mancha.scale.set(1.3, 0.8, 1);
    return (u, D) => {
      const pal = Math.abs(Math.sin(u * 6.5));
      B.pose({ cb: [0.05, 0.15 * Math.sin(u * 2), 0.08 * Math.sin(u * 3)], tr: [0.05, 0, 0], bE: [-1.0, -0.42 + 0.4 * pal, 0, -1.25], bD: [-1.0, -0.42 + 0.4 * pal, 0, -1.25], pE: [0, 0.08, 0, 0], pD: [0, 0.08, 0, 0], y: 0.01 * pal });
      B.maos(0.05);
      B.rosto({ ri: 1, ab: 0.8, feliz: 0.5 + 0.2 * pal, sob: 0.3 });
      cam(ox, [0.1, 0.85, 1.45], [0, 0.6, 0], u);
    };
  });

  // 6 "É o dia inteiro salvando ele do perigo" — mergulha do deck nos braços da mãe
  tomada({ bg: '#f6c48a', hi: 1.55, sol: 1.5 }, (g, ox) => {
    C.ceu(g, -30, '#f6b16e', '#ffe3b8');
    const agua = C.piscina(g, 8, 5, '#3ec0c9'); agua.position.z = -2.5;
    const deck = C.plano(8, 3, C.tex(C.tabuas('#8b5a3a', '#5e3a24'), 256, [4, 2]), g); deck.position.set(0, 0.02, 1.5); deck.rotation.z = 0;
    const borda = C.rb(8, 0.1, 0.2, 0.02, '#6e4429', g); borda.position.set(0, -0.03, 0.05);
    const outra = C.plano(60, 10, null, g, '#6f9a4a'); outra.position.set(0, -0.2, -14);
    const M = mae(g, { roupa: '#7c4fc9', calca: '#7c4fc9' }); M.g.position.set(0.1, -1.18, -0.75);
    const B = T.bebe({ pai: g, semCamisa: true, short: '#1c1c22' });
    const resp = C.respingo(g, 18);
    const ks = [
      [0, C.mix(P.sentado, { y: 0.03, z: 0.2, ry: Math.PI, bE: [-0.9, 0.3, 0, -0.4], bD: [-0.9, 0.3, 0, -0.4], pE: [-1.3, 0.25, 1.3, 0], pD: [-1.3, 0.25, 1.3, 0] })],
      [0.55, C.mix(P.sentado, { y: 0.08, z: 0.15, ry: Math.PI, rx: 0.5, tr: [0.3, 0, 0], bE: [-1.9, 0.3, 0, -0.2], bD: [-1.9, 0.3, 0, -0.2], pE: [-1.3, 0.25, 1.0, 0], pD: [-1.3, 0.25, 1.0, 0] })],
      [0.95, { y: 0.0, z: -0.25, ry: Math.PI, rx: 1.35, cb: [-0.6, 0, 0], bE: [-2.8, 0.25, 0, -0.1], bD: [-2.8, 0.25, 0, -0.1], pE: [0.2, 0.1, 0.4, 0.3], pD: [0.3, 0.1, 0.3, 0.3] }],
      [1.2, { y: -0.12, z: -0.42, ry: Math.PI, rx: 1.4, cb: [-0.9, 0, 0], bE: [-2.6, 0.3, 0, -0.3], bD: [-2.6, 0.3, 0, -0.3], pE: [0.2, 0.15, 0.5, 0.3], pD: [0.3, 0.15, 0.5, 0.3] }],
      [1.73, { y: -0.08, z: -0.45, ry: Math.PI, rx: 1.2, cb: [-1.0, 0, 0], bE: [-2.2, 0.5, 0, -0.5], bD: [-2.2, 0.5, 0, -0.5], pE: [0.3 * Math.sin(1), 0.15, 0.5, 0.3], pD: [0.3, 0.15, 0.5, 0.3] }],
    ];
    return (u, D) => {
      B.pose(C.PK(ks, u)); B.rosto({ ri: 1, ab: 0.7, feliz: 0.3, oy: 0.5 });
      const a = J(u, 0.9, 1.25);
      M.mao('E', [T.lerp(0.2, 0.14, a), T.lerp(1.33, 1.2, a), T.lerp(0.42, 0.42, a)], [0.6, -1, -0.3]); M.mao('D', [T.lerp(-0.2, -0.14, a), T.lerp(1.33, 1.2, a), T.lerp(0.42, 0.42, a)], [-0.6, -1, -0.3]);
      M.boca(0.6); M.piscaAuto(u); M.olhar(0, 0.4);
      agua.tick(u, [[0.1, -0.4 + 2.5, 1.15, 0.05]]); resp(u - 1.15, 0.0, -0.08, -0.45);
      cam(ox, [1.55, 1.0, 1.25], [-0.05, 0.1, -0.3], u);
    };
  });

  // 7 "ele sobe em tudo" — em pé no encosto do sofá
  tomada(LUZ_CASA, (g, ox) => {
    comodo(g, '#c9c2b8', '#c9c2b8', '#a77a52', '#80593a', { z: -0.75, lisa: true, madeira: true });
    const vidro = C.rb(1.4, 2.4, 0.04, 0.01, '#2b3036', g); vidro.position.set(-0.7, 1.3, -0.72);
    cortina(g, 0.65, -0.65, 1.0, 2.6);
    C.sofa(g, 2.2, '#7a4a2e');
    const brinq = C.rb(0.16, 0.08, 0.1, 0.02, '#ffd23a', g); brinq.position.set(0.3, 0.52, 0.2);
    const B = T.bebe({ pai: g, camisa: '#efe9dc', short: '#efe9dc', estampa: '#8a7a5a' });
    return (u, D) => {
      const w = Math.sin(u * 4.2);
      B.pose(C.mix(P.equilibra, { y: 0.93, z: -0.33, rz: 0.08 * w, tr: [0.1, 0, -0.05 * w], cb: [0.1, 0.1 * w, 0.08 * w], bE: [-0.2, 1.3 + 0.25 * w, 0, -0.3], bD: [-0.2, 1.3 - 0.25 * w, 0, -0.3] }));
      B.rosto({ ri: 0.5, sob: -0.2, oy: -0.5, ox: -0.2, pi: pisca(u, 1.2) });
      cam(ox, [0.25, 0.75, 1.9], [0, 0.95, -0.3], u);
    };
  });

  // 8 (sobe estante) — escala a estante como escada
  tomada(LUZ_NOITE, (g, ox) => {
    comodo(g, '#5a5a62', '#5a5a62', '#b8a68a', '#98866a', { z: -0.45, lisa: true });
    const est = C.estante(g, 0.9, 1.8, '#3a3a40'); est.position.z = -0.25;
    const bike = T.m(new THREE.TorusGeometry(0.3, 0.025, 8, 32), T.mat('#202024'), g, { w: 0.003 }); bike.position.set(-1.0, 1.4, -0.4);
    const B = T.bebe({ pai: g, camisa: '#2f6fd0', short: '#ffd23a' });
    const n1 = est.nivel(1) + 0.03, n2 = est.nivel(2) + 0.03;
    const ks = [
      [0, { y: n1, z: -0.02, ry: Math.PI, tr: [0.15, 0, 0], bE: [-2.4, 0.3, 0, -0.9], bD: [-2.4, 0.3, 0, -0.9] }],
      [0.5, { y: n1 + 0.02, z: -0.02, ry: Math.PI, tr: [0.3, 0, 0], bE: [-2.3, 0.3, 0, -1.3], bD: [-2.3, 0.3, 0, -1.3], pE: [-1.6, 0.15, 1.9, 0.3] }],
      [1.1, { y: n2, z: -0.02, ry: Math.PI, tr: [0.15, 0, 0], bE: [-2.5, 0.3, 0, -0.9], bD: [-2.0, 0.3, 0, -1.3], pE: [0, 0.1, 0.1, 0], pD: [-0.3, 0.1, 0.4, 0] }],
      [1.84, { y: n2, z: -0.02, ry: Math.PI, tr: [0.1, 0.3, 0], cb: [0, 0.9, 0], bE: [-2.5, 0.3, 0, -0.9], bD: [-2.0, 0.3, 0, -1.3], pE: [0, 0.1, 0.1, 0], pD: [-0.3, 0.1, 0.4, 0] }],
    ];
    return (u, D) => { B.pose(C.PK(ks, u)); B.rosto({ ri: 0.9, ab: u > 1.3 ? 0.6 : 0, pi: pisca(u) }); cam(ox, [-1.15, 1.15, 1.8], [0, 0.85, -0.1], u); };
  });

  // 9 "vive correndo risco" — mergulho do braço do sofá na caixa de brinquedo
  tomada(LUZ_CASA, (g, ox) => {
    comodo(g, '#f3efe8', '#f3efe8', '#d6c7ae', '#bba98a', { z: -0.7, lisa: true });
    cortina(g, 1.0, -0.6, 1.6, 2.6);
    const sofa = C.sofa(g, 1.6, '#7a4a2e'); sofa.position.x = -0.4;
    const cx = C.caixaBrinq(g); cx.position.set(1.05, 0, 0.1);
    bonequinhos(g, 6, [0.4, 1.8, 0.4, 1.0]);
    const B = T.bebe({ pai: g, camisa: '#3a3a6e', short: '#f5f5f5', estampa: '#ff9fb4' });
    const ks = [
      [0, { x: 0.46, y: 0.63, z: 0, tr: [0.1, 0, 0], ry: 0.4, bE: [-0.6, 0.6, 0, -0.5], bD: [-0.6, 0.6, 0, -0.5] }],
      [0.3, C.mix(P.agachado, { x: 0.46, y: 0.6, z: 0, ry: 0.9, bE: [0.6, 0.3, 0, -0.3], bD: [0.6, 0.3, 0, -0.3] })],
      [0.6, { x: 0.75, y: 0.95, z: 0.05, ry: 1.2, rx: 1.0, cb: [-0.5, 0, 0], bE: [-2.9, 0.3, 0, 0], bD: [-2.9, 0.3, 0, 0], pE: [0.3, 0.1, 0.3, 0], pD: [0.2, 0.1, 0.3, 0] }],
      [0.85, { x: 0.9, y: 0.95, z: 0.1, ry: 1.4, rx: 2.4, cb: [-0.3, 0, 0], bE: [-2.9, 0.3, 0, 0], bD: [-2.9, 0.3, 0, 0], pE: [0.2, 0.15, 0.3, 0], pD: [0.1, 0.15, 0.3, 0] }],
      [1.26, { x: 1.0, y: 0.98, z: 0.1, ry: 1.4, rx: 2.95, cb: [-0.2, 0, 0], bE: [-2.9, 0.3, 0, 0], bD: [-2.9, 0.3, 0, 0], pE: [0.1, 0.25, 0.5, 0.3], pD: [0.1, 0.25, 0.5, 0.3] }],
    ];
    const bolas = cx.children.slice(1);
    return (u, D) => {
      const p = C.PK(ks, u); const k = J(u, 0.95, 1.26); p.pE = p.pE.slice(); p.pD = p.pD.slice(); p.pE[2] += 0.5 * Math.sin(u * 22) * k; p.pD[2] -= 0.5 * Math.sin(u * 22) * k;
      B.pose(p); B.rosto({ ri: 1, ab: 0.8, feliz: 0.2 });
      bolas.forEach((b, i) => { const a = u - 0.85; if (a > 0 && i % 2 === 0) { b.position.y = 0.42 + Math.max(0, (1.6 + i * 0.05) * a - 4.9 * a * a); } });
      cam(ox, [0.85, 0.95, 2.6], [0.72, 0.6, 0], u);
    };
  });

  // 10 (cai do carrinho) — carrinho tomba pra trás, perninha pra cima
  tomada(LUZ_CASA, (g, ox) => {
    comodo(g, '#f2f2f2', '#f2f2f2', '#d8c7a6', '#bba98a', { z: -1.0, lisa: true });
    const car = C.carrinho(g); car.position.set(0, 0, 0);
    bonequinhos(g, 10, [-1.2, 1.2, -0.6, 0.9]);
    const caixa = C.caixaBrinq(g); caixa.position.set(-0.9, 0, -0.6);
    const B = T.bebe({ pai: g, semCamisa: true, short: '#2f6fd0' });
    return (u, D) => {
      const a = J(u, 0.25, 0.65);
      car.rotation.set(0, 0, -1.45 * a); car.position.set(0.25 + 0.55 * a, 0.17 * a, -0.05 * a);
      const p = C.PK([
        [0, C.mix(P.sentado, { x: -0.03, y: 0.24, z: 0, ry: 0, bE: [-1.0, 0.2, 0, -0.6], bD: [-1.0, 0.2, 0, -0.6], pE: [-1.4, 0.3, 1.2, 0], pD: [-1.4, 0.3, 1.2, 0] })],
        [0.3, C.mix(P.sentado, { x: -0.03, y: 0.24, z: 0, rx: -0.4, bE: [-2.0, 0.6, 0, -0.3], bD: [-2.0, 0.6, 0, -0.3], pE: [-1.6, 0.3, 0.9, 0], pD: [-1.6, 0.3, 0.9, 0] })],
        [0.7, { x: -0.03, y: 0.12, z: 0.25, rx: -1.5, cb: [0.5, 0, 0], bE: [-1.2, 1.0, 0, -0.5], bD: [-1.2, 1.0, 0, -0.5], pE: [-1.4, 0.3, 0.4, 0], pD: [-1.6, 0.3, 0.6, 0] }],
        [1.14, { x: -0.03, y: 0.12, z: 0.25, rx: -1.5, cb: [0.6, 0, 0], bE: [-1.3, 1.1, 0, -0.5], bD: [-1.3, 1.1, 0, -0.5], pE: [-1.3, 0.3, 0.6, 0], pD: [-1.5, 0.3, 0.3, 0] }],
      ], u);
      const k = J(u, 0.7, 0.8); p.pE = p.pE.slice(); p.pD = p.pD.slice(); p.pE[2] += 0.4 * Math.sin(u * 16) * k; p.pD[2] += 0.4 * Math.cos(u * 16) * k;
      B.pose(p); B.rosto({ ri: u > 0.7 ? 1 : 0.4, ab: u > 0.35 ? 0.8 : 0, sob: u < 0.7 ? 1 : 0, feliz: u > 0.75 ? 0.5 : 0 });
      cam(ox, [0.95, 0.75, 1.35], [0, 0.25, 0.05], u);
    };
  });

  // 11 "Sobe" — sobe no braço da poltrona do quintal (de noite)
  tomada(LUZ_NOITE, (g, ox) => {
    const grama = C.plano(10, 10, null, g, '#3f7a3a'); grama.position.z = -3;
    const piso = C.plano(10, 3, C.tex(C.azulejo('#b9a98e', '#9c8c72', 3), 256, [6, 2]), g); piso.position.set(0, 0.005, 1.0);
    const muro = C.rb(10, 2.4, 0.2, 0.02, '#4a4e54', g); muro.position.set(0, 1.2, -4);
    C.palmeira(g, 2.8).position.set(-1.0, 0, -2.4);
    const ol = C.poltrona(g, '#5a4636'); ol.position.set(0, 0, 0);
    const bola = T.esfera(0.09, '#3fd36a', g); bola.position.set(-0.5, 0.09, -1.2);
    const lua = T.esfera(0.4, '#fff6d8', g, { sem: true }); lua.material = T.basico('#fff6d8'); lua.position.set(2.5, 4.5, -8);
    const B = T.bebe({ pai: g, camisa: '#25345e', short: '#e0a320', estampa: '#f2a01a' });
    return (u, D) => {
      const p = C.PK([
        [0, { x: 0.05, y: 0.53, z: 0.05, ry: 0.3, bE: [-1.2, 0.8, 0, -0.5], bD: [-0.8, 0.3, 0, -0.5] }],
        [0.35, C.mix(P.agachado, { x: 0.15, y: 0.6, z: 0.05, ry: 0.6, bE: [-1.5, 0.8, 0, -0.6], bD: [-1.5, 0.3, 0, -0.6] })],
        [0.7, { x: 0.36, y: 0.66, z: 0.1, ry: 0.3, bE: [-0.4, 1.2, 0, -0.4], bD: [-0.4, 1.2, 0, -0.4], pE: [0, 0.1, 0, 0], pD: [0, 0.1, 0, 0] }],
        [1.73, { x: 0.36, y: 0.66, z: 0.1, ry: 0.1, bE: [-0.4, 1.4, 0, -0.4], bD: [-0.4, 1.4, 0, -0.4], pE: [0, 0.1, 0, 0], pD: [0, 0.1, 0, 0] }],
      ], u);
      const b = batida(u + TL[11]) * J(u, 0.7, 0.8); p.y += 0.035 * b; p.pE = p.pE.slice(); p.pD = p.pD.slice(); p.pE[2] += 0.3 * b; p.pD[2] += 0.3 * b; p.pE[0] -= 0.15 * b; p.pD[0] -= 0.15 * b;
      B.pose(p); B.rosto({ ri: 1, ab: u > 0.6 ? 0.9 : 0.3, feliz: 0.4 });
      cam(ox, [0.5, 1.0, 2.05], [0.2, 0.85, 0], u);
    };
  });

  // 12 "em tudo" — deitado em cima do freezer de sorvete
  tomada({ bg: '#26282c', hi: 1.4, sol: 1.3 }, (g, ox) => {
    comodo(g, '#26282c', '#26282c', '#3a3a3e', '#2c2c30', { z: -0.5, lisa: true });
    const fz = C.freezer(g);
    const engr = C.rb(0.5, 0.26, 0.36, 0.02, '#2a8a3a', g); engr.position.set(0.55, 0.13, 0.55);
    const placa = T.tela(0.5, 1.0, 256, (c, w, h) => { const cs = ['#ff6b6b', '#ffd23a', '#4fb3ff', '#7bd66b', '#c58aff', '#ff9f43']; c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) for (let k = 0; k < 2; k++) { c.fillStyle = cs[(i + k) % 6]; c.fillRect(20 + k * 115, 20 + i * 82, 100, 70); } }, g);
    placa.position.set(-0.3, 1.75, -0.45);
    const B = T.bebe({ pai: g, camisa: '#2fa85a', calca: '#2fa85a', short: '#2fa85a' });
    return (u, D) => {
      const k = Math.sin(u * 7);
      B.pose(C.mix(P.deitadoBarriga, { y: 0.89 + 0.12, z: -0.42, x: -0.05, cb: [-1.15, 0.15 * Math.sin(u * 2), 0], bE: [-1.7, 0.6, 0, -1.2], bD: [-1.7, 0.6, 0, -1.2], pE: [0.1, 0.15, 0.9 + 0.5 * k, 0.4], pD: [0.1, 0.15, 0.9 - 0.5 * k, 0.4] }));
      B.rosto({ ri: 1, ab: 0.0, feliz: 0.4, oy: 0.3, pi: pisca(u, 0.7) });
      cam(ox, [0.35, 1.4, 1.8], [0, 1.0, 0], u);
    };
  });

  // 13 "corre" — engatinha em cima da mesa de jantar
  tomada(LUZ_CASA, (g, ox) => {
    comodo(g, '#e9e2d6', '#e9e2d6', '#d0c2aa', '#b8a98f', { z: -1.2, lisa: true });
    const balc = C.rb(2.6, 0.95, 0.6, 0.02, '#f6f2ea', g); balc.position.set(0, 0.47, -0.95);
    const me = C.mesa(g, 1.8, 0.95);
    for (const [x, z, r] of [[-0.5, 0.65, Math.PI], [0.4, 0.65, Math.PI], [-0.5, -0.65, 0], [0.4, -0.65, 0]]) { const c = C.cadeira(g); c.position.set(x, 0, z); c.rotation.y = r; }
    const copo = T.cilindro(0.06, 0.05, 0.22, '#f58ab8', g); copo.position.set(0.45, 0.875, 0.05);
    const papel = C.rb(0.2, 0.005, 0.28, 0.002, '#ffffff', g); papel.position.set(0.15, 0.77, -0.25);
    const B = T.bebe({ pai: g, camisa: '#ffffff', short: '#c8323c' });
    return (u, D) => {
      const p = C.cicloEngatinha(u * 1.7); p.x = T.lerp(-0.6, 0.0, u / D); p.y += 0.765; p.ry = Math.PI / 2 - 0.25; p.cb = [-1.0, -0.4, 0];
      B.pose(p); B.rosto({ ri: 1, ab: 0.6, feliz: 0.3, pi: pisca(u) });
      cam(ox, [0.15, 1.45, 2.3], [-0.1, 0.85, 0], u);
    };
  });

  // 14 "Perigo" — sobe a escada encostada no muro
  tomada(LUZ_SOL, (g, ox) => {
    const piso = C.plano(8, 6, null, g, '#9a9488'); piso.position.z = 1;
    const muro = C.parede(8, 3.5, C.tex((c, p) => { c.fillStyle = '#d8d2c6'; c.fillRect(0, 0, p, p); c.strokeStyle = '#bdb6a8'; c.lineWidth = 3; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(0, i * p / 8); c.lineTo(p, i * p / 8); c.stroke(); for (let k = 0; k < 4; k++) { const x = (k + (i % 2) * 0.5) * p / 4; c.beginPath(); c.moveTo(x, i * p / 8); c.lineTo(x, (i + 1) * p / 8); c.stroke(); } } }, 256, [4, 2]), g); muro.position.z = -0.65;
    const es = C.escada(g, 2.4); es.position.set(0, 0, -0.15);
    const varanda = C.rb(3, 0.12, 1, 0.02, '#c4473c', g); varanda.position.set(0, 2.5, -0.4);
    const bike = T.grupo(g, 0.35, 0, 0.35); for (const x of [-0.22, 0.22]) { const r = T.m(new THREE.TorusGeometry(0.15, 0.02, 8, 24), T.mat('#3a3a40'), bike, { w: 0.003 }); r.position.set(x, 0.15, 0); } const qd = C.rb(0.44, 0.03, 0.03, 0.01, '#b98af0', bike); qd.position.y = 0.3; qd.rotation.z = 0.2;
    const B = T.bebe({ pai: g, camisa: '#1f1f26', short: '#f0e6c8' });
    const dg = es.degraus; const ze = (y) => -0.15 - Math.tan(0.18) * y + 0.07;
    return (u, D) => {
      const p = C.PK([
        [0, { y: dg[1][0] + 0.02, z: ze(dg[1][0]), ry: Math.PI, rx: -0.15, tr: [0.25, 0, 0], bE: [-2.3, 0.3, 0, -1.0], bD: [-2.6, 0.3, 0, -0.6] }],
        [0.6, { y: dg[1][0] + 0.03, z: ze(dg[1][0]), ry: Math.PI, rx: -0.15, tr: [0.35, 0, 0], bE: [-2.6, 0.3, 0, -0.6], bD: [-2.3, 0.3, 0, -1.2], pE: [-1.4, 0.12, 1.8, 0.2] }],
        [1.1, { y: dg[2][0] + 0.02, z: ze(dg[2][0]), ry: Math.PI, rx: -0.15, tr: [0.25, 0, 0], bE: [-2.4, 0.3, 0, -1.0], bD: [-2.6, 0.3, 0, -0.6], pD: [-0.5, 0.1, 0.8, 0] }],
        [1.66, { y: dg[2][0] + 0.02, z: ze(dg[2][0]), ry: Math.PI, rx: -0.15, tr: [0.15, -0.4, 0], cb: [0, -0.9, 0], bE: [-2.4, 0.3, 0, -1.0], bD: [-2.6, 0.3, 0, -0.6], pD: [-0.5, 0.1, 0.8, 0] }],
      ], u);
      B.pose(p); B.rosto({ ri: 0.8, ab: u > 1.2 ? 0.5 : 0, pi: pisca(u, 0.3) });
      cam(ox, [1.15, 0.65, 1.25], [0, 1.0, -0.2], u);
    };
  });

  // 15 (corre e cai do degrau) — corre de fralda e senta no chão
  tomada(LUZ_CASA, (g, ox) => {
    const altoTx = C.tex(C.tabuas('#9a5f35', '#6e4123'), 256, [3, 3]);
    const alto = new THREE.Mesh(new THREE.BoxGeometry(6, 0.14, 4), new THREE.MeshToonMaterial({ map: altoTx })); alto.position.set(0, 0.07, -1.6); g.add(alto);
    const quina = T.linha([-3, 0.14, 0.4], [3, 0.14, 0.4], 0.012, g);
    const baixo = C.plano(6, 4, C.tex(C.tabuas('#8a5230', '#5e3a22'), 256, [3, 3]), g); baixo.position.z = 2.4;
    const pw = C.parede(6, 3, null, g, '#f1ece2'); pw.position.z = -3.4;
    const tapete = C.rb(0.9, 0.02, 0.5, 0.01, '#ffffff', g); tapete.position.set(0.3, 0.15, -0.6);
    const mov = C.rb(1.6, 0.8, 0.45, 0.02, '#f7f4ee', g); mov.position.set(-1.2, 0.54, -3.1);
    const B = T.bebe({ pai: g, semCamisa: true, fralda: true });
    return (u, D) => {
      let p;
      if (u < 0.8) { p = C.cicloCorre(u * 2.6, 1); p.z = T.lerp(-1.6, 0.25, u / 0.8); p.y += 0.14; p.ry = -0.2; }
      else p = C.PK([[0.8, C.add(C.cicloCorre(0.8 * 2.6, 1), { z: 0.25, y: 0.14, ry: -0.2 })], [0.98, { z: 0.6, y: 0.05, rx: 0.3, ry: -0.2, bE: [-1.3, 0.8, 0, -0.3], bD: [-1.3, 0.8, 0, -0.3], pE: [-1.0, 0.3, 0.6, 0], pD: [-0.6, 0.3, 0.9, 0] }],
        [1.12, C.mix(P.sentado, { z: 0.72, y: 0.0, ry: -0.2, bE: [-0.4, 0.9, 0, -0.3], bD: [-0.4, 0.9, 0, -0.3] })], [1.27, C.mix(P.sentado, { z: 0.72, y: 0.0, ry: -0.2, bE: [-0.3, 0.5, 0, -0.5], bD: [-0.3, 0.5, 0, -0.5] })]], u);
      B.pose(p); B.rosto(u < 0.85 ? { ri: 0.8, ab: 0.5 } : { ri: 0.2, ab: 0.6, sob: 1, ox: 0, oy: 0.2 });
      cam(ox, [0.25, 0.6, 2.25], [0, 0.35, -0.2], u);
    };
  });

  // 16 "Sobe" — sobe na estante vermelha do quarto de brinquedo
  tomada(LUZ_CASA, (g, ox) => {
    comodo(g, '#cfe3f2', '#cfe3f2', '#c49a6a', '#a07a4e', { z: -0.45, lisa: true });
    const nuvens = T.tela(3, 1.6, 256, (c, w, h) => { c.fillStyle = '#cfe3f2'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; for (const [x, y, r] of [[60, 60, 30], [90, 50, 38], [125, 62, 28], [190, 120, 26], [215, 112, 32]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } }, g); nuvens.position.set(0.6, 1.7, -0.44);
    const est = C.estante(g, 0.55, 1.9, '#8e2b3a'); est.position.set(0, 0, -0.27);
    bonequinhos(g, 9, [-1, 1, -0.1, 1.2], ['#e8424f', '#e8424f', '#ffd23a', '#4fb3ff', '#7bd66b']);
    const B = T.bebe({ pai: g, camisa: '#3e4a5c', short: '#ffffff', calca: '#9fd36a' });
    const n1 = est.nivel(1) + 0.03, n2 = est.nivel(2) + 0.03;
    return (u, D) => {
      const p = C.PK([[0, { y: n1, z: -0.05, ry: Math.PI, tr: [0.2, 0, 0], bE: [-2.6, 0.3, 0, -0.6], bD: [-2.3, 0.3, 0, -1.1], pE: [-1.5, 0.15, 1.8, 0.3] }],
        [0.7, { y: n2, z: -0.05, ry: Math.PI, tr: [0.15, 0, 0], bE: [-2.3, 0.3, 0, -1.1], bD: [-2.6, 0.3, 0, -0.6], pD: [-0.4, 0.1, 0.6, 0] }]], u);
      B.pose(p); B.rosto({});
      cam(ox, [0.85, 1.0, 1.5], [0, 0.95, -0.15], u);
    };
  });

  // 17 "Em tudo" — em pé dentro da pia rosa (visto da porta)
  tomada(LUZ_CASA, (g, ox) => {
    comodo(g, '#f2f4f4', '#d7dcdc', '#f3f3f1', '#d6d8d6', { z: -0.32 });
    const pia = C.pia(g, 1.4); pia.scale.setScalar(0.8); pia.children[0].material = T.mat('#d9a7a4'); pia.children[1].material = T.mat('#f4f4f2');
    const vaso = C.vaso(g); vaso.position.set(0.95, 0, 0.0); vaso.scale.setScalar(0.95);
    for (const x of [-0.75, 0.75]) { const b = C.rb(0.1, 2.4, 0.12, 0.01, '#5e2e22', g); b.position.set(x, 1.2, 2.0); }
    const B = T.bebe({ pai: g, camisa: '#e9f3e6', short: '#2f3f6e' });
    return (u, D) => {
      const w = Math.sin(u * 3.5);
      B.pose({ y: 0.665, z: 0.02, ry: 0.35, tr: [0.05, 0, 0.04 * w], cb: [0.05, 0.2, 0], bE: [-0.6, 0.9, 0, -0.9], bD: [-0.4 - 0.4 * J(u, 0.3, 0.8), 0.7, 0, -0.9], pE: [0, 0.14, 0, 0], pD: [0, 0.14, 0, 0] });
      B.rosto({ ri: 1, ab: 0.0, feliz: 0.3, pi: pisca(u, 0.5) });
      cam(ox, [0.1, 1.15, 2.4], [0.1, 0.8, 0], u, 0.8);
    };
  });

  // 18 "Corre" — engatinha rapidinho fugindo, mãe vindo atrás (só as pernas aparecem)
  tomada(LUZ_SOL, (g, ox) => {
    const piso = C.plano(8, 8, C.tex(C.azulejo('#bdb7ac', '#a9a398', 2), 256, [5, 5]), g);
    const muro = C.parede(8, 2.4, null, g, '#c9a985'); muro.position.z = -2.6;
    const B = T.bebe({ pai: g, camisa: '#6fae6a', short: '#6fae6a' });
    const M = mae(g, { roupa: '#f2f2f2', calca: '#2f4f8a' });
    return (u, D) => {
      const p = C.cicloEngatinha(u * 3.4); p.z = T.lerp(-1.0, -0.3, u / D); p.x = 0.08 * Math.sin(u * 4); p.ry = 0.15 * Math.sin(u * 4); p.cb = [-0.9, 0.2, 0];
      B.pose(p); B.rosto({ ri: 1, ab: 0.85, feliz: 0.5 });
      M.g.position.set(0.25, 0, T.lerp(-2.0, -1.2, u / D)); M.anda(u * 1.8, 0.45); M.mao('E', [0.3, 1.05, 0.35], [0.5, -1, -0.3]); M.mao('D', [-0.3, 1.05, 0.35], [-0.5, -1, -0.3]);
      cam(ox, [0.15, 0.62, 1.5], [0, 0.32, -0.4], u, 1.4);
    };
  });

  // 19 "Perigo" — galo na testa, mão da mãe fazendo carinho, estrelinhas
  tomada(LUZ_CASA, (g, ox) => {
    const tecido = C.plano(4, 4, C.tex((c, p) => { c.fillStyle = '#e6e2dc'; c.fillRect(0, 0, p, p); }, 64), g);
    const trav = C.rb(0.7, 0.08, 0.45, 0.04, '#2f5fd0', g); trav.position.set(0, 0.04, -0.15);
    const B = T.bebe({ pai: g, camisa: '#2f5fd0', short: '#2f5fd0' });
    const galo = C.galo(B); const est = C.estrelas(g);
    const mg = T.grupo(g); const M = T.mao({ pai: mg, pele: '#e8b892', sx: -1, esc: 1.1, unha: '#a07ae8' }); M.pose({ dedos: [[0.2, 0.2, 0.1], [0.25, 0.2, 0.1], [0.25, 0.2, 0.1], [0.3, 0.25, 0.1]], abre: 0.1 });
    const pulso = T.capsula(0.045, 0.7, '#e8b892', mg); pulso.position.y = -0.45;
    return (u, D) => {
      B.pose({ y: 0.12, z: 0.62, rx: -1.57, cb: [0.1, 0.25, 0], bE: [-0.3, 0.5, 0, -1.5], bD: [-0.3, 0.5, 0, -0.5] });
      galo.scale.setScalar(0.6 + 0.5 * J(u, 0, 0.3));
      B.rosto({ ri: 0.0, ab: 0.0, pi: 0.55 + 0.4 * J(u, 0.4, 0.8), bravo: -0.6, sob: -0.3 });
      B.C.updateMatrixWorld(true); const c = new V(0, 0.18, 0.08).applyMatrix4(B.C.matrixWorld).sub(g.position);
      est(u, c.clone().add(new V(0, 0.2, -0.05)));
      mg.position.set(-0.13 + 0.025 * Math.sin(u * 6), 0.33, -0.2 + 0.02 * Math.cos(u * 6)); mg.quaternion.setFromUnitVectors(new V(0, -1, 0), new V(-0.75, 0.45, 0.5).normalize());
      cam(ox, [0.05, 0.85, 0.42], [0, 0.12, -0.14], u, 0.7);
    };
  });

  // 20 "Sobe em tudo" — sobe na cadeira pra pegar o bolo da festa
  tomada({ bg: '#dfe9e2', hi: 1.5, sol: 1.3 }, (g, ox) => {
    comodo(g, '#cfe0d5', '#cfe0d5', '#7fbf6a', '#6aa858', { z: -1.6, lisa: true });
    const me = C.mesa(g, 1.4, 0.8, '#2f6f3a'); me.position.set(0, 0, -0.75);
    const bolo = C.bolo(g); bolo.position.set(0.0, 0.765, -0.75);
    for (let i = 0; i < 7; i++) { const b = T.esfera(0.15, ['#5fbf4a', '#ffd23a', '#2f9a3a'][i % 3], g); b.position.set(-1.2 + (i % 2) * 0.25, 1.2 + i * 0.22, -1.3 + (i % 3) * 0.1); b.scale.y = 1.15; }
    const cad = C.cadeira(g, '#1d1d22', '#1d1d22'); cad.position.set(0.45, 0, -0.1); cad.rotation.y = Math.PI;
    const B = T.bebe({ pai: g, camisa: '#ece4d2', short: '#ece4d2' });
    return (u, D) => {
      const p = C.PK([[0, C.mix(P.agachado, { x: 0.45, y: 0.48, z: -0.08, ry: Math.PI - 0.4, bE: [-1.6, 0.3, 0, -0.5], bD: [-1.6, 0.3, 0, -0.5] })],
        [0.5, { x: 0.45, y: 0.48, z: -0.12, ry: Math.PI - 0.5, tr: [0.3, 0, 0], bE: [-1.8, 0.3, 0, -0.3], bD: [-1.4, 0.3, 0, -0.5] }],
        [0.9, { x: 0.45, y: 0.48, z: -0.12, ry: Math.PI - 0.5, tr: [0.25, -0.4, 0], cb: [0, -0.8, 0], bE: [-1.9, 0.3, 0, -0.2], bD: [-1.4, 0.3, 0, -0.5] }]], u);
      B.pose(p); B.rosto({ ri: 1, ab: u > 0.6 ? 0.5 : 0, feliz: 0.3 });
      bolo.chama.scale.set(1, 1.6 + 0.3 * Math.sin(u * 30), 1);
      cam(ox, [1.6, 1.15, 0.45], [0.25, 0.85, -0.35], u);
    };
  });

  // 21 "Sempre tá" — entrando na piscina de fralda, visto de costas
  tomada(LUZ_SOL, (g, ox) => {
    C.ceu(g); const pis = C.piscina(g, 2.6, 4); pis.position.z = -1.6;
    const grade = C.grade(g, 5, '#2a2a2a'); grade.position.set(0, 0, -4.0);
    C.palmeira(g, 2.6).position.set(1.8, 0, -4.6);
    const deg = C.rb(2.6, 0.05, 0.5, 0.01, '#7fd6ea', g); deg.position.set(0, -0.55, 0.15);
    const B = T.bebe({ pai: g, semCamisa: true, fralda: true });
    return (u, D) => {
      B.pose({ y: -0.55, z: -0.35, ry: Math.PI, tr: [0.2, 0, 0], cb: [-0.1, 0, 0], bE: [-0.9 + 0.5 * Math.sin(u * 10), 0.6, 0, -0.4], bD: [-0.9 - 0.5 * Math.sin(u * 10), 0.6, 0, -0.4] });
      B.rosto({});
      pis.tick(u, [[0.2, -0.45 + 1.6, 0, 0.03], [-0.2, -0.45 + 1.6, 0.3, 0.03]]);
      cam(ox, [0.1, 1.1, 1.05], [0, -0.2, -0.7], u);
    };
  });

  // 22 "em perigo" — escorrega de barriga no pula-pula molhado e sorri pra câmera
  tomada({ bg: '#4da0e0', hi: 1.6, sol: 1.4 }, (g, ox) => {
    const inf = C.inflavel(g);
    const B = T.bebe({ pai: g, semCamisa: true, short: '#1c2430' });
    const gotas = []; for (let i = 0; i < 20; i++) { const m = T.esfera(0.012, '#e6fff0', g, { sem: true }); m.material = T.basico('#eafff2'); m.position.set(C.R(-1, 1), 0.07, C.R(-2, 0.6)); gotas.push(m); }
    return (u, D) => {
      const z = K([[0, -1.5], [1.0, -0.45], [D, -0.35]], u);
      const lev = J(u, 0.9, 1.4);
      B.pose(C.mix(P.deitadoBarriga, { y: 0.11 + 0.03 * lev, z, rx: 1.5 - 0.35 * lev, cb: [-1.2 + 0.25 * lev, 0.1 * Math.sin(u * 2), 0.05 * Math.sin(u * 3)],
        bE: [T.lerp(-2.7, -1.6, lev), 0.5, 0, -0.4], bD: [T.lerp(-2.7, -1.6, lev), 0.5, 0, -0.4], pE: [0.1, 0.18, 0.4 + 0.3 * Math.sin(u * 5) * lev, 0.4], pD: [0.1, 0.18, 0.4 - 0.3 * Math.sin(u * 5) * lev, 0.4] }));
      B.rosto({ ri: 1, ab: lev > 0.5 ? 0.7 : 0.2, feliz: 0.2 + 0.5 * lev, oy: 0.2 });
      cam(ox, [0.15, 0.55, 1.25], [0, 0.25, -0.5], u);
    };
  });

  T.cada((t) => {
    let i = TL.findIndex((c, k) => t < (k + 1 < TL.length ? TL[k + 1] : 1e9)); if (i < 0) i = TL.length - 1; i = Math.min(i, S.length - 1);
    S.forEach((s, k) => { s.g.visible = k === i; });
    const s = S[i], L = s.luz;
    T.cena.background = new THREE.Color(L.bg); hemi.intensity = L.hi; T.sol.intensity = L.sol;
    const t0 = TL[i], D = (i + 1 < TL.length ? TL[i + 1] : FIM) - t0;
    s.upd(t - t0, D);
  });
  return { dur: FIM };
};
