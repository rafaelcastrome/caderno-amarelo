// Plano B (10.72 - 21 s, tempo local 0 - 10.28): o celular nas tuas mãos.
window.CENA_B = (P, L, V, D) => {
  const { F, THREE } = P; const fx = V.fx, K = L.K, sm = L.sm;
  const W0 = [0, 0.18, 0.6]; const w = (x, y, z) => [x + W0[0], y + W0[1], z + W0[2]];
  // fundo: chão, tapete, cama e parede (fora de foco pela distância)
  const parede = (g, w2, h) => { g.fillStyle = '#f1dfb6'; g.fillRect(0, 0, w2, h); g.fillStyle = 'rgba(214,170,110,0.22)'; for (let x = 0; x < w2; x += 64) g.fillRect(x, 0, 26, h); };
  P.impresso(7.6, 4.8, parede, fx({ y: 2.4, z: -2.2, prof: 0.06 }));
  P.deitado(F.elipse(1.5, 0.9), fx({ cor: 0x5c8fc9, x: -0.3, z: 0.6 }));
  P.deitado(F.elipse(1.3, 0.75), fx({ cor: 0x8cc3e8, x: -0.3, z: 0.6, y: 0.01, prof: 0.031 }));
  P.caixa(2.6, 0.62, 3.2, fx({ cor: 0x4d7fbf, x: 2.25, y: 0.31, z: 2.9 }));
  P.caixa(2.62, 0.08, 3.22, fx({ cor: 0xf2e4c4, x: 2.25, y: 0.66, z: 2.9 }));
  const rig = V.cabeca([[0, w(0.6, 1.55, 3.9), w(-0.2, 0.6, 0.2)], [D, w(0.6, 1.5, 3.8), w(-0.2, 0.6, 0.2)]], { resp: 0.6 });
  // ---------- celular (espaço da câmera) ----------
  const hold = P.grupo({ pai: rig, z: -0.62, y: -0.02 });
  const cel = P.grupo({ pai: hold });
  const CW = 0.27, CH = 0.54;
  P.peca(F.ret(CW, CH, 0.035), fx({ pai: cel, prof: 0.022, cor: 0x232328 }));
  const tela = (desenha) => P.impresso(CW - 0.02, CH - 0.03, desenha, fx({ pai: cel, z: 0.013, raio: 0.022 }));
  const txt = (g, s, x, y, px, cor) => { g.fillStyle = cor; g.font = `bold ${px}px sans-serif`; g.textAlign = 'center'; g.fillText(s, x, y); };
  const base = (g, ww, hh, fundo) => { g.fillStyle = fundo; g.fillRect(0, 0, ww, hh); g.fillStyle = '#f0bf94'; g.beginPath(); g.arc(ww / 2, hh * 0.33, ww * 0.2, 0, 7); g.fill(); txt(g, 'EU', ww / 2, hh * 0.355, ww * 0.15, '#2b2622'); txt(g, '(51) 9 9634-2817', ww / 2, hh * 0.52, ww * 0.075, '#ffffff'); };
  const t1 = tela((g, ww, hh) => { base(g, ww, hh, '#245e94'); txt(g, 'chamada recebida', ww / 2, hh * 0.12, ww * 0.075, '#cfe6ff');
    g.fillStyle = '#e04848'; g.beginPath(); g.arc(ww * 0.28, hh * 0.84, ww * 0.1, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = ww * 0.02; g.beginPath(); g.moveTo(ww * 0.23, hh * 0.84); g.lineTo(ww * 0.33, hh * 0.84); g.stroke(); });
  const t2 = tela((g, ww, hh) => { base(g, ww, hh, '#163650'); txt(g, 'em ligação', ww / 2, hh * 0.12, ww * 0.075, '#7ee08f');
    g.fillStyle = '#e04848'; g.beginPath(); g.arc(ww / 2, hh * 0.88, ww * 0.1, 0, 7); g.fill(); });
  // botão verde pulsando (peça separada) e ondas de chamada
  const verde = P.grupo({ pai: cel, x: CW * 0.22, y: -CH * 0.34, z: 0.026 });
  P.peca(F.circulo(0.026), fx({ pai: verde, prof: 0.004, cor: 0x3fae5a }));
  const ondas = [0, 1].map(() => { const gg = P.grupo({ pai: cel, y: CH * 0.17, z: 0.025 }); P.peca(F.anel(0.06, 0.0575), fx({ pai: gg, prof: 0.001, cor: 0xbfe0ff })); return gg; });
  const real = P.grupo({ pai: cel, y: CH * 0.01, z: 0.026 });
  P.peca(F.ret(0.17, 0.008, 0.004), fx({ pai: real, prof: 0.002, cor: 0xff5a5a, y: -0.022 }));

  // ondas da voz do telefone (barras)
  const barras = []; const BOCA = (window.BOCA || {}).tel || [];
  for (let i = 0; i < 11; i++) { const gg = P.grupo({ pai: cel, x: -0.1 + i * 0.02, y: -CH * 0.2, z: 0.026 }); P.peca(F.ret(0.011, 0.08, 0.0055), fx({ pai: gg, prof: 0.002, cor: 0xff6b6b })); barras.push(gg); }
  // ---------- mãos segurando ----------
  const PELE = 0xe9b98e, MANGA = 0x3f6fb5;
  // esquerda: palma atrás do celular, 4 dedos dobrados por cima da borda esquerda, manga saindo por baixo
  const mE = P.grupo({ pai: hold, x: -CW / 2, y: -0.15 });
  P.peca(F.ret(0.13, 0.15, 0.05), fx({ pai: mE, prof: 0.03, cor: PELE, x: 0.0, y: -0.06, z: -0.03, rz: 0.15 }));
  P.peca(F.ret(0.16, 0.5, 0.06), fx({ pai: mE, prof: 0.03, cor: MANGA, x: -0.07, y: -0.36, z: -0.035, rz: 0.35 }));
  [0.075, 0.035, -0.005, -0.045].forEach((y, i) => P.peca(F.ret(0.05 - i * 0.003, 0.03, 0.015), fx({ pai: mE, prof: 0.02, cor: PELE, x: -0.008, y: y + 0.02, z: 0.02 })));
  P.peca(F.ret(0.04, 0.11, 0.02), fx({ pai: mE, prof: 0.02, cor: PELE, x: -0.022, y: -0.1, z: -0.01, rz: -0.25 }));   // base do polegar na lateral
  // direita: palma atrás, 3 dedos na borda direita, polegar na frente da tela (atende)
  const mD = P.grupo({ pai: hold, x: CW / 2, y: -0.15 });
  P.peca(F.ret(0.13, 0.15, 0.05), fx({ pai: mD, prof: 0.03, cor: PELE, y: -0.05, z: -0.03, rz: -0.15 }));
  P.peca(F.ret(0.16, 0.5, 0.06), fx({ pai: mD, prof: 0.03, cor: MANGA, x: 0.07, y: -0.35, z: -0.035, rz: -0.35 }));
  [0.11, 0.07, 0.03].forEach((y, i) => P.peca(F.ret(0.048 - i * 0.003, 0.03, 0.015), fx({ pai: mD, prof: 0.02, cor: PELE, x: 0.008, y, z: 0.02 })));
  const pol = P.grupo({ pai: mD, x: -0.02, y: -0.09, z: 0.03 });
  P.peca(F.ret(0.036, 0.115, 0.018), fx({ pai: pol, prof: 0.012, cor: PELE, y: 0.05 }));
  P.peca(F.ret(0.022, 0.026, 0.009), fx({ pai: pol, prof: 0.013, cor: 0xf6d6bc, y: 0.09, z: 0.0005 }));   // unha
  const TA = 14.5 - 10.72;  // atende
  P.animar((ts, t) => {
    const atendeu = t >= TA + 0.3;
    t1.visible = !atendeu; t2.visible = atendeu; verde.visible = !atendeu;
    verde.scale.setScalar(1 + 0.12 * Math.sin(t * 9));
    ondas.forEach((gg, k) => { const u = (t * 0.8 + k * 0.5) % 1; gg.scale.setScalar(1 + u * 0.9); gg.visible = false; });
    real.visible = t > 1.4 && t < TA; real.scale.setScalar(1 + 0.04 * Math.sin(t * 8));
    const fr = (i) => BOCA[Math.min(BOCA.length - 1, Math.max(0, Math.round(t * 30)))] || 0;
    barras.forEach((gg, i) => { gg.visible = atendeu; gg.scale.y = 0.15 + fr() * (0.6 + 0.4 * Math.sin(i * 1.7 + t * 17)); });
    // polegar: descansa na lateral, vai até o verde, arrasta pra cima e volta
    const p = K([[0, [0.012, -0.01, 0.12]], [TA - 0.3, [0.012, -0.01, 0.12]], [TA, [-0.06, 0.07, 0.75]], [TA + 0.3, [-0.06, 0.11, 0.75]], [TA + 0.8, [0.012, -0.01, 0.12]]])(t);
    pol.position.set(-0.02 + p[0], -0.09 + p[1], 0.03); pol.rotation.z = p[2];
    // celular: vibra enquanto toca, aproxima devagar quando a voz fala, mão treme
    const vib = !atendeu && Math.sin(t * 2 * Math.PI * 1.4) > -0.2 ? Math.sin(t * 2 * Math.PI * 22) * 0.0035 : 0;
    const tr = t > 16.44 - 10.72 ? Math.sin(t * 37) * 0.0018 : 0;
    hold.position.set(vib + tr, -0.02 + 0.006 * Math.sin(t * 1.4), K([[0, -0.9], [0.6, -0.84], [5.7, -0.84], [9.2, -0.74]])(t));
    hold.rotation.z = 0.02 * Math.sin(t * 0.8); hold.rotation.x = -0.08;
  });
};
