// Ep. 1 · A queda. Uma função por cena (P, L, D). Fichas e props em ../lib_juli.js.
window.EP = [
  // 1 GANCHO: vista de cima, ela cai de costas presa na fileira, nuvens passando pra cima
  (P, L, D) => {
    P.deitado(P.F.ret(16, 18, 0.02), { prof: 0.01, cor: 0x2c3a56, ...L.FX });
    const r = P.fixo(11), nuv = [];
    for (let i = 0; i < 16; i++) nuv.push([L.nuvemTemp({ w: 2 + r() * 2.2, h: 1 + r(), cor: [0x55617a, 0x6d7891, 0x8790a6, 0x434e66][i % 4], x: (r() - 0.5) * 7, z: (r() - 0.5) * 9 }), r()]);
    nuv.forEach(([n, k]) => { n.rotation.x = -Math.PI / 2; });
    P.animar((ts, t) => nuv.forEach(([n, k], i) => { n.position.y = ((k * 9 + t * (2.2 + k)) % 9); n.position.x = (k - 0.5) * 7 + Math.sin(i) * 0.4; }));
    const gira = P.grupo({ y: 9.6 });
    const f = L.fileira({ pai: gira, rx: -Math.PI / 2, x: -0.1, z: -0.2, D, gente: [Object.assign({}, L.JU, { lugar: 0, vento: 1, poses: [[0, 'sentado+bracos_cima']] })], cinto: 1 });
    f.position.set(0.2, 0, 0.9);
    P.animar((ts, t) => { gira.rotation.y = t * 0.35; gira.position.y = 9.6 + Math.sin(t * 3) * 0.05; });
    L.CAM([[0, [0.0, 18.6, 0.4], [0, 0, 0]], [D, [0.0, 17.2, 0.35], [0, 0, 0]]]);
    L.tremor([[0, 0.05, D]]);
  },
  // 2 corte seco: ela sorrindo com o presente, luz dourada
  (P, L, D) => {
    L.fundoCeu({ h: 9, y: 3.5, cor: 0xf0c98a });
    const r = P.fixo(2); for (let i = 0; i < 9; i++) P.peca(P.F.circulo(0.18 + r() * 0.25), { prof: 0.02, cor: [0xfbe3a8, 0xf6d48a, 0xfff1cc][i % 3], x: -2.5 + r() * 5, y: 1.8 + r() * 3, z: -2.8, ...L.FX });
    L.ator(Object.assign({}, L.JU, { x: -0.25, z: 0.5, D, t: -1, poses: [[0, 'carrega']] }));
    L.presente({ x: 0.08, y: 1.45, z: 0.72, s: 0.34 });
    L.chao(0xb79a6a, 0.4, 2);
    L.CAM([[0, [0.7, 2.0, 7.2], [0.0, 1.7, 0.4]], [D, [0.6, 2.0, 6.3], [0.0, 1.75, 0.4]]]);
  },
  // 3 aeroporto de Lima: avião LANSA, escada, as duas andando pela pista
  (P, L, D) => {
    L.fundoCeu({ h: 11, y: 4.5, cor: 0xe8cfa2 }); L.ceu({ semente: 7, passaros: false });
    for (let i = 0; i < 4; i++) P.peca(P.F.poligono([[-1.6, 0], [1.6, 0], [0.2, 1.0 + (i % 2) * 0.4]]), { prof: 0.04, cor: 0xb8a58a, x: -4 + i * 2.6, y: 0, z: -3.0, ...L.FX });
    L.chao(0x8a8580, -0.6, 4.4, 0, 14); L.chao(0xe8e0cc, 0.1, 0.06, 0, 14);
    L.aviaoLansa({ x: 0.9, y: 1.2, z: -2.2, s: 1.1 });
    const esc = P.grupo({ x: 1.9, z: -0.95 });
    for (let i = 0; i < 6; i++) P.peca(P.F.ret(0.5, 0.06, 0.01), { pai: esc, prof: 0.4, cor: 0xd9d4ca, x: -0.1 - i * 0.14, y: 0.95 - i * 0.16, ...L.FX });
    P.peca(P.F.poligono([[0.1, 1.0], [0.15, 1.0], [-0.9, 0.0], [-0.95, 0.0]]), { pai: esc, prof: 0.42, cor: 0x9a948a, ...L.FX });
    L.ator(Object.assign({}, L.MAE, { x: -3.3, z: 0.25, D, t: -1, mala: true, corMala: 0x6a4a34, mov: [[0, -3.3], [D, 0.3, 0.25, 'lin']] }));
    const ju = L.ator(Object.assign({}, L.JU, { x: -2.6, z: 0.65, D, t: -1, poses: [[0, 'carrega']], mov: [[0, -2.6], [D, 1.0, 0.65, 'lin']] }));
    L.presente({ pai: ju, x: 0.32, y: 1.4, z: 0.2, s: 0.3, cor: 0xc93a2e, fita: 0xf2c230 });
    L.CAM([[0, [0.4, 6.0, 12.5], [0.6, 3.6, -1.0]], [2.2, [-1.0, 2.6, 9.6], [-1.0, 1.6, -0.2]], [D, [0.5, 2.7, 10.8], [0.4, 1.7, -0.6]]]);
  },
  // 4 mapa do Peru: Lima -> Andes -> floresta, avião de papel na linha, foto do pai (sépia)
  (P, L, D) => {
    const W = 5.6, H = 7.2;
    P.impresso(W, H, (g, w, h) => {
      g.fillStyle = '#9cc9e6'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#efe3c4'; g.beginPath(); g.moveTo(w * 0.42, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(w * 0.62, h); g.bezierCurveTo(w * 0.5, h * 0.75, w * 0.3, h * 0.55, w * 0.18, h * 0.38); g.bezierCurveTo(w * 0.1, h * 0.25, w * 0.3, h * 0.1, w * 0.42, 0); g.fill();
      g.fillStyle = '#7fb069'; g.beginPath(); g.moveTo(w * 0.62, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(w * 0.85, h); g.bezierCurveTo(w * 0.7, h * 0.7, w * 0.6, h * 0.45, w * 0.55, h * 0.3); g.fill();
      g.fillStyle = '#a07a52'; for (let i = 0; i < 9; i++) { const x = w * (0.33 + i * 0.033), y = h * (0.15 + i * 0.075); g.beginPath(); g.moveTo(x - w * 0.05, y + h * 0.03); g.lineTo(x, y - h * 0.03); g.lineTo(x + w * 0.05, y + h * 0.03); g.fill(); }
      g.strokeStyle = '#5c8fb8'; g.lineWidth = w * 0.012; g.beginPath(); g.moveTo(w * 0.7, h * 0.3); g.bezierCurveTo(w * 0.78, h * 0.42, w * 0.7, h * 0.55, w * 0.82, h * 0.7); g.stroke();
      g.fillStyle = '#2b2622'; g.font = `bold ${h * 0.04}px Georgia`; g.fillText('PERU', w * 0.28, h * 0.12);
      g.font = `bold ${h * 0.03}px Georgia`; g.fillText('Lima', w * 0.17, h * 0.6); g.fillText('Amazônia', w * 0.64, h * 0.2);
      g.beginPath(); g.arc(w * 0.3, h * 0.58, w * 0.018, 0, 7); g.fill();
      g.setLineDash([w * 0.025, w * 0.02]); g.lineWidth = w * 0.01; g.strokeStyle = '#c93a2e'; g.beginPath(); g.moveTo(w * 0.3, h * 0.58); g.bezierCurveTo(w * 0.45, h * 0.48, w * 0.6, h * 0.5, w * 0.76, h * 0.44); g.stroke();
    }, { rx: -Math.PI / 2, y: 0.02, z: 0.2, prof: 0.02, ...L.FX });
    // casinha + foto do pai
    const cx = -(-W / 2 + W * 0.76) * -1, cz = -H / 2 + H * 0.44 + 0.2;
    const casa = P.grupo({ x: cx, z: cz });
    P.peca(P.F.ret(0.5, 0.32, 0.02), { pai: casa, prof: 0.3, cor: 0x8a5a34, y: 0.16, ...L.FX });
    P.peca(P.F.poligono([[-0.34, 0.3], [0.34, 0.3], [0, 0.56]]), { pai: casa, prof: 0.34, cor: 0xc9a25a, ...L.FX });
    P.impresso(1.0, 1.2, (g, w, h) => {
      g.fillStyle = '#e9dcc0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c9b48e'; g.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.7);
      g.fillStyle = '#6e5a42'; g.fillRect(w * 0.28, h * 0.5, w * 0.44, h * 0.28); // camisa
      g.fillStyle = '#d9c0a0'; g.beginPath(); g.arc(w * 0.5, h * 0.36, w * 0.15, 0, 7); g.fill();
      g.fillStyle = '#8a8478'; g.beginPath(); g.arc(w * 0.5, h * 0.29, w * 0.15, Math.PI, 0); g.fill(); // cabelo grisalho
      g.fillStyle = '#8a8478'; g.beginPath(); g.arc(w * 0.5, h * 0.43, w * 0.1, 0, Math.PI); g.fill(); // barba
      g.fillStyle = '#d9c0a0'; g.fillRect(w * 0.7, h * 0.3, w * 0.07, h * 0.22); // mão acenando
      g.fillStyle = '#4a3a2a'; g.font = `bold ${h * 0.1}px Georgia`; g.textAlign = 'center'; g.fillText('papai', w * 0.5, h * 0.9);
    }, { x: cx - 0.5, y: 0.75, z: cz + 1.3, rz: -0.12, ry: 0.15, t: 1.2, entra: 'pop' });
    // avião de papel andando na linha tracejada
    const av = P.grupo({ y: 0.25 });
    P.peca(P.F.poligono([[-0.25, -0.12], [0.3, 0], [-0.25, 0.12], [-0.12, 0]]), { pai: av, prof: 0.02, cor: 0xf8f3e8, rx: -Math.PI / 2, ...L.FX });
    const bz = (k) => { const p0 = [0.3, 0.58], p1 = [0.45, 0.48], p2 = [0.6, 0.5], p3 = [0.76, 0.44], u = 1 - k; const f = (a) => u * u * u * p0[a] + 3 * u * u * k * p1[a] + 3 * u * k * k * p2[a] + k * k * k * p3[a]; return [-W / 2 + W * f(0), -H / 2 + H * f(1) + 0.2]; };
    P.animar((ts, t) => { const k = Math.min(1, Math.max(0, (t - 0.5) / (D - 1.6))); const [x, z] = bz(k), [x2, z2] = bz(Math.min(1, k + 0.02)); av.position.x = x; av.position.z = z; av.rotation.y = -Math.atan2(z2 - z, x2 - x); });
    L.CAM([[0, [0.0, 12.8, 4.2], [0.0, 0, 0.1]], [D, [0.3, 10.8, 3.4], [0.3, 0, 0.0]]]);
  },
  // 5 cabine: as duas sentadas, janela redonda com nuvens passando
  (P, L, D) => {
    const jan = L.paredeJanela();
    P.peca(P.F.ret(9, 0.5, 0.04), { prof: 0.5, cor: 0xd6cfbf, y: 3.6, z: -0.9, ...L.FX }); // bagageiro
    const nuv = [0, 1, 2].map((i) => P.peca(P.F.nuvem(0.5, 0.22), { pai: jan, prof: 0.01, cor: 0xfbf6ea, x: 0, y: -0.2 + i * 0.2, ...L.FX }));
    P.animar((ts, t) => nuv.forEach((n, i) => { n.position.x = ((t * 0.5 + i * 0.4) % 1.6) - 0.8; }));
    L.fileira({ x: 0.2, z: 0.0, D, gente: [Object.assign({}, L.JU, { lugar: 0, poses: [[0, 'sentado'], [1.0, 'sentado+olha_cima', 0.6]], dirs: [[0, 1], [0.8, -1]] }), Object.assign({}, L.MAE, { lugar: 2, poses: [[0, 'sentado+carrega']] })] });
    L.chao(0x5a5048, 0.3, 3, 0, 10);
    L.CAM([[0, [1.6, 4.5, 5.8], [0.2, 1.6, -0.2]], [D, [1.4, 4.2, 5.2], [0.2, 1.65, -0.2]]]);
  },
  // 6 a janela escurece: nuvens pretas, chuva no vidro, ela fica séria
  (P, L, D) => {
    const jan = L.paredeJanela({ w: 6 });
    const esc = [0, 1, 2, 3].map((i) => P.peca(P.F.nuvem(0.9, 0.5), { pai: jan, prof: 0.01, cor: [0x3a4458, 0x2c3446, 0x4a5468, 0x232a38][i], x: 1.2, y: -0.3 + i * 0.22, z: 0.01 + i * 0.005, ...L.FX }));
    P.animar((ts, t) => esc.forEach((n, i) => { n.position.x = 1.2 - Math.min(1, Math.max(0, (t - 0.6 - i * 0.35) / 1.4)) * 1.3; }));
    const gotas = []; const r = P.fixo(8);
    for (let i = 0; i < 10; i++) gotas.push([P.peca(P.F.ret(0.012, 0.12, 0.005), { pai: jan, prof: 0.005, cor: 0xdfe8f0, x: (r() - 0.5) * 0.4, y: 0.3, z: 0.24, rz: 0.4, ...L.FX }), r()]);
    P.animar((ts, t) => gotas.forEach(([g, k]) => { const u = (t * 0.9 + k) % 1; g.visible = t > 2.2; g.position.y = 0.3 - u * 0.6; g.position.x = (k - 0.5) * 0.4 + u * 0.1; }));
    L.fileira({ x: 0.2, z: 0.0, D, gente: [Object.assign({}, L.JU, { lugar: 0, dirs: [[0, -1]], poses: [[0, 'sentado+olha_cima'], [2.6, 'sentado', 0.8]] })] });
    L.veu(0x1a2a50, (t) => Math.min(0.35, Math.max(0, (t - 0.8) / 3) * 0.35));
    L.CAM([[0, [0.75, 2.3, 3.4], [0.35, 2.05, -0.4]], [D, [0.7, 2.25, 2.9], [0.35, 2.05, -0.4]]]);
  },
  // 7 corredor: turbulência, malas e presentes caindo dos bagageiros
  (P, L, D) => {
    P.peca(P.F.ret(6, 5, 0.04), { prof: 0.04, cor: 0x5a5a62, y: 2.0, z: -6, ...L.FX });
    L.chao(0x6a5a50, -2.5, 9, 0, 1.2);
    for (let k = 0; k < 6; k++) for (const lado of [-1, 1]) {
      const z = -5 + k * 1.1, x = lado * 1.15;
      P.peca(P.F.ret(1.3, 1.25, 0.12), { prof: 0.25, cor: k % 2 ? 0xc4642a : 0xb85a26, x, y: 0.75, z, ...L.FX });
      P.peca(P.F.ret(0.5, 0.25, 0.06), { prof: 0.26, cor: 0xe8e0cc, x: x - lado * 0.3, y: 1.25, z: z + 0.005, ...L.FX });
      if ((k + (lado > 0)) % 2 === 0) { const cab = P.peca(P.F.circulo(0.2), { prof: 0.1, cor: [0x2a211b, 0x8a6440, 0x4a3a2a][k % 3], x: x + lado * 0.2, y: 1.45, z: z - 0.15, ...L.FX }); P.animar((ts, t) => { cab.position.y = 1.45 + Math.sin(t * 9 + k) * 0.06; }); }
    }
    for (const lado of [-1, 1]) P.caixa(1.2, 0.35, 8, { cor: 0xd6cfbf, x: lado * 1.5, y: 2.6, z: -2.0, ...L.FX });
    const r = P.fixo(17), voa = [];
    for (let i = 0; i < 9; i++) {
      const g = i % 3 === 0 ? P.grupo({}) : null;
      const obj = i % 3 === 0 ? (P.caixa(0.6, 0.4, 0.25, { pai: g, cor: [0x6a4a34, 0x2f5d9a, 0x8a3a2a][i % 3], ...L.FX }), g) : L.presente({ s: 0.28, cor: [0x2f7a4a, 0xc93a2e, 0x7d5bb0][i % 3], fita: 0xf2c230 });
      voa.push([obj, r(), r(), r(), i]);
    }
    P.animar((ts, t) => voa.forEach(([o, a, b, c, i]) => { const k = ((t - 0.3 - i * 0.37) % 1.3 + 1.3) % 1.3; o.visible = t > 0.3 + i * 0.37;
      const lado = i % 2 ? 1 : -1; o.position.set(lado * (1.3 - k * (0.4 + a * 0.5)), 2.3 + k * 0.6 - 1.6 * k * k, -3.2 + i * 0.25 + k * (1.2 + b)); o.rotation.set(k * 4 * a, k * 3, k * 5 * c); }));
    L.tremor([[0.2, 0.18, 1.6], [1.9, 0.25, 1.5], [3.4, 0.2, 2.2]]);
    L.veu(0x1a2440, 0.22);
    L.CAM([[0, [0.0, 1.9, 4.2], [0.0, 1.5, -3.0]], [D, [0.0, 1.85, 3.6], [0.0, 1.5, -3.0]]]);
  },
  // 8 de fora: o avião pequeno no meio de nuvens enormes, relâmpagos
  (P, L, D) => {
    L.fundoCeu({ h: 12, w: 14, y: 4.0, cor: 0x1f2840 }); P.deitado(P.F.ret(16, 12, 0.02), { prof: 0.01, cor: 0x1f2840, y: 0.01, ...L.FX });
    const r = P.fixo(23);
    for (let i = 0; i < 12; i++) L.nuvemTemp({ w: 3 + r() * 3, h: 1.6 + r() * 1.5, cor: [0x2c3446, 0x3a4458, 0x4a5468][i % 3], x: -4 + r() * 8, y: 0.5 + r() * 6, z: -3 + (i % 4) * 0.5 });
    L.raio({ x: -1.8, y: 6.2, z: -2.4, s: 1.6, ts: [0.5, 1.7, 2.9], semente: 3 }); L.raio({ x: 2.0, y: 5.6, z: -2.6, s: 1.3, ts: [1.1, 2.3, 3.4], semente: 9 });
    L.flash(0.5, 0.25, 0xdfe8ff); L.flash(1.7, 0.25, 0xdfe8ff); L.flash(2.9, 0.3, 0xdfe8ff);
    L.aviaoLansa({ z: -0.8, s: 0.42, letreiro: false, mov: (t) => [-3.2 + t * 1.5, 3.4 + Math.sin(t * 5) * 0.06, Math.sin(t * 4) * 0.05] });
    for (let i = 0; i < 5; i++) L.nuvemTemp({ w: 3.5, h: 1.6, cor: 0x232a38, x: -4 + i * 2, y: 0.4, z: 0.8 });
    L.CAM([[0, [0.0, 3.6, 11.5], [0.0, 3.4, 0.0]], [D, [0.3, 3.5, 10.6], [0.3, 3.4, 0.0]]]);
  },
  // 9 close das duas, a mãe calma olhando pra frente; tudo fica quieto (cartão entra na montagem)
  (P, L, D) => {
    P.peca(P.F.ret(6, 5, 0.04), { prof: 0.04, cor: 0x8a8a90, y: 2.0, z: -1.2, ...L.FX });
    L.fileira({ x: 0.2, z: 0.0, D, gente: [Object.assign({}, L.JU, { lugar: 0, dirs: [[0, 1]], poses: [[0, 'sentado'], [1.2, 'sentado+olha_cima', 1.4]] }), Object.assign({}, L.MAE, { lugar: 2, poses: [[0, 'sentado']] })] });
    L.veu(0x101a38, 0.42);
    L.CAM([[0, [1.2, 3.9, 4.2], [0.3, 1.85, -0.2]], [D, [1.1, 3.7, 3.7], [0.3, 1.85, -0.2]]]);
  },
  // 10 olhando a asa pela janela: clarão enorme em cima do motor
  (P, L, D) => {
    L.fundoCeu({ h: 10, y: 3.0, cor: 0x1c2438 }); P.deitado(P.F.ret(16, 12, 0.02), { prof: 0.01, cor: 0x1c2438, y: 0.01, ...L.FX });
    const r = P.fixo(5); for (let i = 0; i < 6; i++) L.nuvemTemp({ w: 3, h: 1.4, cor: [0x2c3446, 0x3a4458][i % 2], x: -3 + r() * 6, y: 1 + r() * 4, z: -2.6 });
    const asa = P.grupo({ x: 0.0, y: 2.0, z: -1.0 });
    P.peca(P.F.poligono([[-3.5, 0.15], [2.6, 0.05], [2.8, -0.05], [-3.5, -0.25]]), { pai: asa, prof: 0.08, cor: 0xb8b4ac, ...L.FX });
    P.peca(P.F.ret(1.2, 0.36, 0.15), { pai: asa, prof: 0.3, cor: 0xd9d4ca, x: 0.2, y: 0.05, z: 0.1, ...L.FX });
    const he = P.peca(P.F.ret(0.06, 1.3, 0.02), { pai: asa, prof: 0.02, cor: 0x3a3330, x: 0.85, y: 0.05, z: 0.3, ...L.FX });
    P.animar((ts, t) => { he.children[0].scale.y = Math.cos(t * 45); asa.position.y = 2.0 + Math.sin(t * 6) * 0.05; });
    L.raio({ x: 0.4, y: 4.6, z: -0.9, s: 1.3, ts: [2.25, 2.45], semente: 12 });
    L.flash(2.25, 0.7, 0xffffff);
    // moldura da janela em primeiro plano
    P.peca(P.F.anel(2.5, 2.05), { prof: 0.08, cor: 0xcfc8b8, x: 0, y: 2.3, z: 2.0, ...L.FX });
    L.CAM([[0, [0.0, 2.3, 7.2], [0.1, 2.1, -1.0]], [D, [0.0, 2.3, 6.6], [0.2, 2.1, -1.0]]]);
  },
  // 11 o avião se parte no ar: asa solta, fuselagem abre, destroços e poltronas voando
  (P, L, D) => {
    L.fundoCeu({ h: 16, w: 16, y: 3.0, cor: 0x1f2840 }); P.deitado(P.F.ret(16, 12, 0.02), { prof: 0.01, cor: 0x1f2840, y: 0.01, ...L.FX });
    const r = P.fixo(29); for (let i = 0; i < 8; i++) L.nuvemTemp({ w: 3 + r() * 2, h: 1.5, cor: [0x2c3446, 0x3a4458][i % 2], x: -4 + r() * 8, y: 0.8 + r() * 5.5, z: -2.6 });
    const av = L.aviaoLansa({ x: -0.6, y: 3.4, z: -0.6, s: 0.8 });
    const { corpo, tras, asa } = av.userData; const T = 0.55;
    P.animar((ts, t) => { const k = Math.max(0, t - T);
      corpo.position.set(k * 0.6, -k * 0.35 - k * k * 0.2, 0); corpo.rotation.z = -k * 0.6;
      tras.position.set(-k * 0.6, -k * 0.15 - k * k * 0.25, 0); tras.rotation.z = k * 0.8;
      asa.position.set(0.2 + k * 0.4, -0.12 + k * 1.2 - k * k * 0.6, 0.12 + k); asa.rotation.z = k * 2.2; });
    for (let i = 0; i < 3; i++) { const p = L.poltrona({ x: -0.6, y: 3.4, z: -0.4 }); p.scale.setScalar(0.35); P.animar((ts, t) => { const k = Math.max(0, t - T - 0.1 - i * 0.12); p.visible = k > 0; p.position.set(-0.6 + (i - 1) * k * 1.2, 3.4 - k * 0.8 - k * k * 0.35, -0.4 + k * 0.6); p.rotation.z = k * (2 + i); }); }
    L.destrocos({ t: T, x: -0.4, y: 3.4, z: -0.6, n: 30 });
    L.raio({ x: 0.2, y: 6.4, z: -1.0, s: 1.3, ts: [0.35, 0.5], semente: 21 }); L.flash(0.35, 0.5, 0xffffff);
    L.tremor([[T, 0.35, 1.8]]);
    L.CAM([[0, [0.0, 3.4, 7.0], [-0.3, 3.3, -0.6]], [D, [0.0, 3.3, 9.0], [0.0, 2.9, -0.6]]]);
  },
  // 12 sozinha no céu, presa na fileira; o avião em pedaços some lá em cima; nuvens subindo (ela caindo)
  (P, L, D) => {
    L.fundoCeu({ h: 16, w: 16, y: 2.6, cor: 0x34405c }); P.deitado(P.F.ret(16, 12, 0.02), { prof: 0.01, cor: 0x34405c, y: 0.01, ...L.FX });
    const r = P.fixo(41), nuv = [];
    for (let i = 0; i < 12; i++) nuv.push([L.nuvemTemp({ w: 2 + r() * 2.5, h: 0.9 + r(), cor: [0x55617a, 0x6d7891, 0x434e66][i % 3], x: -4 + r() * 8, z: -2.4 + (i % 3) * 0.8 }), r()]);
    P.animar((ts, t) => nuv.forEach(([n, k]) => { n.position.y = -1 + ((k * 10 + t * (2.6 + k)) % 10); }));
    const pedacos = []; for (let i = 0; i < 7; i++) pedacos.push(P.peca(P.F.poligono([[0, 0], [0.4 + r() * 0.4, 0.05], [0.2, 0.3]]), { prof: 0.03, cor: [0xf4f1ea, 0xd9d4ca, 0x2f5d9a][i % 3], x: -1.5 + r() * 3, y: 6.5, z: -1.6, ...L.FX }));
    P.animar((ts, t) => pedacos.forEach((p, i) => { p.position.y = 5.6 + t * (0.5 + i * 0.08); p.rotation.z = t * (1 + i * 0.3); p.visible = t < D - 1; }));
    const gira = P.grupo({ x: 0.0, y: 1.6, z: 0.6 });
    L.fileira({ pai: gira, x: -0.2, y: -0.6, D, gente: [Object.assign({}, L.JU, { lugar: 0, vento: 1, poses: [[0, 'sentado+bracos_cima']] })], cinto: 1 });
    P.animar((ts, t) => { gira.rotation.z = Math.sin(t * 0.9) * 0.35; gira.position.y = 1.6 + Math.sin(t * 2.2) * 0.08; });
    L.CAM([[0, [0.4, 2.2, 7.6], [0.0, 2.0, 0.0]], [D, [0.2, 2.4, 8.6], [0.0, 2.2, 0.0]]]);
    L.tremor([[0, 0.05, D]]);
  },
  // 13 vista de cima: a fileira gira como semente; a floresta e o rio vêm chegando; tudo apaga
  (P, L, D) => {
    L.copas({ semente: 5, n: 170, rio: (x) => Math.sin(x * 0.5) * 1.6 + 1.2 });
    const gira = P.grupo({ y: 2.0 });
    L.fileira({ pai: gira, rx: -Math.PI / 2, x: 0.0, z: -0.2, D, gente: [Object.assign({}, L.JU, { lugar: 0, vento: 1, poses: [[0, 'sentado+bracos_cima']] })], cinto: 1 }).position.set(-0.2, 0, 0.9);
    P.animar((ts, t) => { gira.rotation.y = t * 1.6; });
    L.CAM([[0, [0.0, 18.0, 0.3], [0, 0, 0]], [D, [0.0, 4.4, 0.1], [0, 0, 0]]]);
    L.veu(0x000000, (t) => Math.min(1, Math.max(0, (t - (D - 0.7)) / 0.5)));
  },
  // 14 preto (etiqueta "25 de dezembro" na montagem)
  (P, L, D) => {
    L.fundoCeu({ cor: 0x000000 }); L.veu(0x000000, 1);
    L.CAM([[0, [0, 2, 8], [0, 2, 0]]]);
  },
  // 15 close extremo: o olho abre (sem óculos, barro, corte na testa, folhas refletidas)
  (P, L, D) => {
    const g = P.grupo({ y: 2.0, z: 0.0 });
    P.peca(P.F.ret(6, 4, 0.5), { pai: g, prof: 0.05, cor: 0xe2ad84, ...L.FX }); // pele
    P.peca(P.F.elipse(1.25, 0.62), { pai: g, prof: 0.06, cor: 0xf4efe6, y: -0.1, z: 0.01, ...L.FX });
    const iris = P.grupo({ pai: g, y: -0.1, z: 0.05 });
    P.peca(P.F.circulo(0.5), { pai: iris, prof: 0.02, cor: 0x7a5a3a, ...L.FX });
    P.peca(P.F.circulo(0.22), { pai: iris, prof: 0.02, cor: 0x1a1612, z: 0.01, ...L.FX });
    P.peca(P.F.elipse(0.14, 0.05), { pai: iris, prof: 0.01, cor: 0x9ccf6e, x: -0.2, y: 0.22, z: 0.02, rz: 0.5, ...L.FX });
    P.peca(P.F.circulo(0.07), { pai: iris, prof: 0.01, cor: 0xffffff, x: 0.16, y: 0.16, z: 0.02, ...L.FX });
    const palp = P.peca(P.F.ret(2.8, 1.6, 0.4), { pai: g, prof: 0.05, cor: 0xd99e76, y: 0.6, z: 0.09, ...L.FX }); // pálpebra (sobe)
    const cilio = P.peca(P.F.ret(2.4, 0.06, 0.02), { pai: g, prof: 0.02, cor: 0x3a2a1a, y: -0.2, z: 0.12, ...L.FX });
    P.peca(P.F.ret(2.6, 0.2, 0.1), { pai: g, prof: 0.04, cor: 0x6a4a2a, y: 1.15, z: 0.1, rz: -0.05, ...L.FX }); // sobrancelha
    P.peca(P.F.ret(0.5, 0.06, 0.02), { pai: g, prof: 0.02, cor: 0xa0302a, x: 1.6, y: 1.6, z: 0.1, rz: 0.4, ...L.FX }); // corte
    const r = P.fixo(13); for (let i = 0; i < 14; i++) { const mx = -2.6 + r() * 5.2, my = -1.8 + r() * 3.6; if (Math.abs(my + 0.1) < 0.8 && Math.abs(mx) < 1.4) continue; P.peca(P.F.elipse(0.1 + r() * 0.15, 0.06 + r() * 0.08), { pai: g, prof: 0.01, cor: [0x7a5a3a, 0x8a6a42][i % 2], x: mx, y: my, z: 0.11, ...L.FX }); }
    const ab = (t) => { if (t < 0.9) return 0; if (t < 1.5) return 0.55 * L.sm((t - 0.9) / 0.6); if (t < 1.75) return 0.55 - 0.5 * L.sm((t - 1.5) / 0.25); if (t < 2.0) return 0.05 + 0.95 * L.sm((t - 1.75) / 0.25); return 1; };
    P.animar((ts, t) => { const k = ab(t); palp.position.y = 0.08 + k * 1.25; cilio.position.y = palp.position.y - 0.8; iris.position.x = Math.sin(t * 0.7) * 0.08; });
    L.veu(0x1f3a26, (t) => 0.55 - Math.min(0.45, t * 0.2));
    L.CAM([[0, [0.0, 2.0, 5.2], [0.0, 1.95, 0.0]], [D, [0.0, 2.0, 4.4], [0.0, 1.95, 0.0]]]);
  },
  // 16 puxa pra trás: ela sentada no chão ao lado da fileira tombada, duas poltronas vazias; grua sobe e ela vira um pontinho
  (P, L, D) => {
    L.floresta({ semente: 4 });
    const f = L.fileira({ x: 1.1, y: 0.25, z: 0.0, rz: 1.25, ry: 0.3, D });
    L.ator(Object.assign({}, L.JU_FERIDA, { x: -1.3, z: 0.75, D, t: -1, dir: 1, poses: [[0, 'sentado_chao'], [2.0, 'sentado_chao+olha_cima', 0.8], [4.2, 'sentado_chao', 0.8]] }));
    L.folhaGrande({ x: -2.2, y: 0.9, z: 2.2, rz: 0.5, s: 1.3 }); L.folhaGrande({ x: 2.4, y: 1.3, z: 2.0, rz: 2.6, s: 1.1, cor: 0x2f6a3a });
    for (let i = 0; i < 5; i++) P.peca(P.F.ret(0.02, 5, 0.01), { prof: 0.02, cor: 0x3f5a2a, x: -2.8 + i * 1.4, y: 4.5, z: -0.5 + (i % 2) * 0.6, ...L.FX });
    L.veu(0x0e2a14, 0.18);
    L.CAM([[0, [-0.9, 1.6, 6.8], [-0.4, 1.0, 0.4]], [1.4, [-0.6, 1.8, 7.6], [-0.2, 1.0, 0.4]], [D, [0.0, 11.5, 15.0], [0.0, 0.6, 0.2]]]);
  },
  // 17 a floresta vista de cima, neblina (cartão PARTE 2 e Seguir na montagem)
  (P, L, D) => {
    L.copas({ semente: 8, n: 170, rio: (x) => Math.sin(x * 0.4 + 1) * 1.8 });
    L.neblina({ n: 4, y: 0.5 });
    L.veu(0xc8d8e0, 0.12);
    L.CAM([[0, [0.0, 12.5, 2.6], [0, 0, -0.2]], [D, [0.0, 11.8, 2.3], [0, 0, -0.2]]]);
  },
];
