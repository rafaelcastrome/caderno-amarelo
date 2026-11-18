// "O envelope": 5 pegadinhas em voz alta; no fim o envelope abre com o que a pessoa falou. Algieba 3.1, take único.
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const D = (t0, t1, st) => { const c = sceneOf(t0); WB.draw(c, fr(c, t0), fr(c, t1), st); };
  const W = (t0, t1, txt, x, y, size, cor, o = {}) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o }); };
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala, F = c => S[c - 1].fala;
  const pop = (a, b, txt, x, y, size, cor, parent, anchor = 'middle') => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, anchor).strokes);
    WB.effect(t => {
      const u = clamp((t - a) / 0.18), k = t < a ? 0 : (u < 1 ? 0.6 + 0.5 * ease(u) : 1 + 0.1 * Math.exp(-(t - a - 0.18) * 10));
      g.setAttribute('opacity', (t < a ? 0 : 1 - clamp((t - b) / 0.2)).toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y - size * 0.35}) scale(${k.toFixed(3)}) translate(${-x} ${-(y - size * 0.35)})`);
    });
    return g;
  };
  const surge = (g, a, b = 999, cx = 540, cy = 900) => WB.effect(t => {
    const u = clamp((t - a) / 0.25), k = t < a ? 0.01 : 0.7 + 0.3 * ease(u);
    g.setAttribute('opacity', (t < a ? 0 : 1 - clamp((t - b) / 0.2)).toFixed(3));
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });
  const fora = (g, a) => WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - a) / 0.25)).toFixed(3)));
  const img = (href, x, y, s, parent) => WB.mk('image', { href, x: x - s / 2, y: y - s / 2, width: s, height: s }, parent);
  const T_ABRE = fim(7) + 0.05;          // instante em que o envelope rasga

  // ---------------- título + bolinhas (prontos no quadro 0) ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('RESPONDE EM VOZ ALTA', 540, 190, 104, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('eu já sei o que tu vai falar', 540, 280, 66, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  const QS = [2, 3, 4, 5, 6];
  QS.forEach((q, i) => {
    const x = 340 + i * 100, y = 390, g = WB.group();
    const c = WB.mk('circle', { cx: x, cy: y, r: 36, fill: '#fffaf0' }, g);
    WB.showNow([sp(WB.circlePath(x, y, 36), INK.black, 5, g)]);
    WB.showNow(WB.textStrokes(String(i + 1), x, y + 17, 52, INK.black, g, 'middle').strokes);
    WB.effect(t => {
      const ativo = t >= st(q) && t < S[q - 1].end, feito = t >= S[q - 1].end;
      c.setAttribute('fill', ativo ? '#fde68a' : feito ? '#e5e7eb' : '#fffaf0');
      const k = ativo ? 1.12 + 0.04 * Math.sin(t * 6) : 1;
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`);
      g.setAttribute('opacity', (1 - clamp((t - st(14)) / 0.3)).toFixed(3));
    });
  });

  // ---------------- o envelope (pronto no quadro 0) ----------------
  // camadas: fundo, aba aberta, papel, frente, aba fechada, lacre
  const ENV = WB.group();
  const X0 = 240, X1 = 840, Y0 = 1420, Y1 = 1700, MX = 540;
  const KR = '#f2d49b', KR2 = '#e3bd78';
  WB.mk('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, fill: KR2 }, ENV);
  const abaAberta = WB.group(ENV);
  WB.mk('path', { d: `M ${X0} ${Y0} L ${MX} ${Y0 - 170} L ${X1} ${Y0} Z`, fill: KR2 }, abaAberta);
  WB.showNow([sp(`M ${X0} ${Y0} L ${MX} ${Y0 - 170} L ${X1} ${Y0}`, INK.black, 6, abaAberta)]);
  // papel que sai de dentro
  const PAP = WB.group(ENV);
  const papel = WB.mk('rect', { x: 270, y: Y0 + 20, width: 540, height: 200, rx: 10, fill: '#fffdf6', stroke: '#1f1f24', 'stroke-width': 5 }, PAP);
  const linhas = [];
  for (let k = 0; k < 5; k++) linhas.push(WB.mk('line', { x1: 0, x2: 0, y1: 0, y2: 0, stroke: '#9cc3e6', 'stroke-width': 3 }, PAP));
  const FRENTE = WB.group(ENV);
  const bolso = `M ${X0} ${Y0 + 10} L ${MX} ${Y0 + 165} L ${X1} ${Y0 + 10} L ${X1} ${Y1} L ${X0} ${Y1} Z`;
  WB.mk('path', { d: bolso, fill: KR }, FRENTE);
  WB.showNow([sp(`M ${X0} ${Y0} L ${X1} ${Y0} L ${X1} ${Y1} L ${X0} ${Y1} Z`, INK.black, 6, FRENTE),
    sp(`M ${X0} ${Y1} L ${MX - 40} ${Y0 + 150} M ${X1} ${Y1} L ${MX + 40} ${Y0 + 150}`, INK.black, 5, FRENTE)]);
  const abaFechada = WB.group(ENV);
  WB.mk('path', { d: `M ${X0} ${Y0} L ${MX} ${Y0 + 165} L ${X1} ${Y0} Z`, fill: '#f6dcab' }, abaFechada);
  WB.showNow([sp(`M ${X0} ${Y0} L ${MX} ${Y0 + 165} L ${X1} ${Y0}`, INK.black, 6, abaFechada)]);
  const lacre = WB.group(ENV);
  WB.mk('circle', { cx: MX, cy: Y0 + 160, r: 44, fill: '#c0262d' }, lacre);
  WB.showNow([sp(WB.circlePath(MX, Y0 + 160, 44), '#7f1d1d', 5, lacre)]);
  WB.showNow(WB.textStrokes('?', MX, Y0 + 182, 64, '#fde68a', lacre, 'middle').strokes);
  // "SECRETO" escrito na frente
  WB.showNow(WB.textStrokes('NÃO ABRA', MX + 170, Y1 - 30, 46, '#7f1d1d', FRENTE, 'middle').strokes);

  // balanço leve sempre; "anotou" no fim de cada pausa de resposta; abre na cena 7
  const ANOTA = QS.map(c => S[c - 1].end - 0.15);
  WB.effect(t => {
    let k = 1, rot = Math.sin(t * 2.2) * 1.2;
    ANOTA.forEach(a => { if (t > a && t < a + 0.6) { const u = (t - a) / 0.6; k += 0.07 * Math.sin(u * Math.PI); rot += 5 * Math.sin(u * Math.PI * 3) * (1 - u); } });
    // saída: depois que o papel sobe, o envelope desce e some
    const sai = ease(clamp((t - (T_ABRE + 1.0)) / 0.5));
    if (t > T_ABRE) rot = 0;
    ENV.setAttribute('opacity', (1 - sai).toFixed(3));
    ENV.setAttribute('transform', `translate(0 ${r1(sai * 300)}) rotate(${r1(rot)} ${MX} ${Y1}) translate(${MX} ${Y1}) scale(${k.toFixed(3)}) translate(${-MX} ${-Y1})`);
    // aba: fechada até rasgar; depois aberta
    const ab = t >= T_ABRE;
    abaFechada.setAttribute('opacity', ab ? 0 : 1); abaAberta.setAttribute('opacity', ab ? 1 : 0);
    lacre.setAttribute('opacity', (1 - clamp((t - T_ABRE) / 0.15)).toFixed(3));
    lacre.setAttribute('transform', `translate(0 ${r1(clamp((t - T_ABRE) / 0.3) * 120)})`);
    [FRENTE, abaAberta].forEach(g => g.setAttribute('opacity', g === abaAberta && !ab ? 0 : (1 - sai).toFixed(3)));
  });
  // papel: sobe de dentro do envelope e depois cresce até ocupar a folha
  const PT = { y0: Y0 + 20, h0: 200 };
  WB.effect(t => {
    const sobe = ease(clamp((t - (T_ABRE + 0.25)) / 0.75)), cresce = ease(clamp((t - (T_ABRE + 1.0)) / 0.55));
    let x = 270, w = 540, y = lerp(PT.y0, 470, sobe), h = lerp(PT.h0, 1000, sobe);
    x = lerp(x, 80, cresce); w = lerp(w, 920, cresce); h = lerp(h, 1180, cresce);
    papel.setAttribute('x', r1(x)); papel.setAttribute('y', r1(y)); papel.setAttribute('width', r1(w)); papel.setAttribute('height', r1(h));
    linhas.forEach((l, k) => { const ly = y + 315 + k * 170; const on = ly < y + h - 40;
      l.setAttribute('x1', r1(x + 30)); l.setAttribute('x2', r1(x + w - 30)); l.setAttribute('y1', r1(ly)); l.setAttribute('y2', r1(ly));
      l.setAttribute('opacity', on ? 0.8 : 0); });
    PAP.setAttribute('opacity', t < T_ABRE ? 0 : (1 - clamp((t - st(14)) / 0.3)).toFixed(3));
  });
  // o papel não pode ficar escondido atrás da frente depois que cresce: move pro overlay de cima
  { const topo = WB.group(); WB.effect(t => { const p = t > T_ABRE + 0.95 ? topo : ENV; if (PAP.parentNode !== p) p.appendChild(PAP); }); }

  // ---------------- cena 1: gancho ----------------
  pop(-1, st(2) - 0.1, 'tudo o que tu vai falar', 540, 760, 80, INK.black);
  pop(-1, st(2) - 0.1, 'tá aqui dentro', 540, 880, 100, INK.purple);
  { const g = WB.group(); WB.showNow([sp('M 540 960 L 540 1230 M 540 1230 L 500 1180 M 540 1230 L 580 1180', INK.purple, 10, g)]);
    WB.effect(t => { g.setAttribute('opacity', t < st(2) - 0.1 ? 1 : 0); g.setAttribute('transform', `translate(0 ${r1(14 * Math.sin(t * 7))})`); }); }
  rest(0.1, 0.3);
  QS.forEach(c => rest(fim(c) + 0.05, S[c - 1].end - 0.05));

  // barra de tempo + RESPONDE!
  const barra = (c, y, g) => {
    const a = fim(c), b = S[c - 1].end;
    const bg = WB.mk('rect', { x: 240, y, width: 600, height: 26, rx: 13, fill: '#efe7cf' }, g);
    const fg = WB.mk('rect', { x: 240, y, width: 600, height: 26, rx: 13, fill: INK.red }, g);
    WB.effect(t => { const on = t >= st(c) && t < b + 0.1;
      bg.setAttribute('opacity', on ? 1 : 0); fg.setAttribute('opacity', on ? 1 : 0);
      fg.setAttribute('width', r1(600 * (1 - clamp((t - a) / (b - a))))); });
    pop(a + 0.02, b, 'RESPONDE!', 540, y + 130, 90, INK.red, g);
  };

  // ---------------- 1: depois de ontem ----------------
  const g1 = WB.group(), s2 = st(2);
  W(s2 + 0.02, s2 + F(2) * 0.4, 'Que dia vem', 540, 620, 104, INK.black, { parent: g1 });
  W(s2 + F(2) * 0.4, fim(2), 'depois de ONTEM?', 540, 730, 104, INK.red, { parent: g1 });
  { const g = WB.group(g1), x = 540, y = 900; // calendário com "?"
    WB.mk('rect', { x: x - 110, y: y - 95, width: 220, height: 200, rx: 18, fill: '#ffffff' }, g);
    WB.mk('path', { d: `M ${x - 110} ${y - 40} L ${x - 110} ${y - 77} Q ${x - 110} ${y - 95} ${x - 92} ${y - 95} L ${x + 92} ${y - 95} Q ${x + 110} ${y - 95} ${x + 110} ${y - 77} L ${x + 110} ${y - 40} Z`, fill: '#ef4444' }, g);
    WB.showNow([sp(`M ${x - 92} ${y - 95} L ${x + 92} ${y - 95} Q ${x + 110} ${y - 95} ${x + 110} ${y - 77} L ${x + 110} ${y + 87} Q ${x + 110} ${y + 105} ${x + 92} ${y + 105} L ${x - 92} ${y + 105} Q ${x - 110} ${y + 105} ${x - 110} ${y + 87} L ${x - 110} ${y - 77} Q ${x - 110} ${y - 95} ${x - 92} ${y - 95} Z`, INK.black, 6, g),
      sp(`M ${x - 55} ${y - 115} L ${x - 55} ${y - 75} M ${x + 55} ${y - 115} L ${x + 55} ${y - 75}`, INK.black, 9, g)]);
    WB.showNow(WB.textStrokes('?', x, y + 80, 140, INK.black, g, 'middle').strokes);
    surge(g, s2 + 0.25, 999, x, y); }
  barra(2, 1060, g1); fora(g1, st(3));

  // ---------------- 2: caixa preta ----------------
  const g2 = WB.group(), s3 = st(3);
  W(s3 + 0.02, s3 + F(3) * 0.4, 'De que cor é a', 540, 620, 100, INK.black, { parent: g2 });
  W(s3 + F(3) * 0.4, fim(3), 'CAIXA PRETA do avião?', 540, 730, 90, INK.red, { parent: g2 });
  { const g = WB.group(g2); img(window.ICONES.aviao, 470, 910, 210, g);
    WB.showNow(WB.textStrokes('?', 640, 960, 150, INK.black, g, 'middle').strokes);
    surge(g, s3 + 0.25, 999, 540, 910);
    const v = WB.group(g2); v.appendChild(g); WB.effect(t => v.setAttribute('transform', `translate(${r1(10 * Math.sin(t * 2))} ${r1(6 * Math.sin(t * 3))})`)); }
  barra(3, 1060, g2); fora(g2, st(4));

  // ---------------- 3: fósforo ----------------
  const g3 = WB.group(), s4 = st(4), f4 = F(4);
  W(s4 + 0.02, s4 + 1.2, 'Quarto ESCURO', 540, 600, 100, INK.black, { parent: g3 });
  W(s4 + 1.2, s4 + 2.0, 'e 1 fósforo só', 540, 705, 90, INK.black, { parent: g3 });
  { // fósforo
    const g = WB.group(g3), x = 830, y = 690;
    WB.mk('rect', { x: -8, y: -70, width: 16, height: 140, rx: 5, fill: '#f5d7a1', stroke: '#1f1f24', 'stroke-width': 4 }, g);
    WB.mk('ellipse', { cx: 0, cy: -78, rx: 15, ry: 20, fill: '#c0262d', stroke: '#1f1f24', 'stroke-width': 4 }, g);
    WB.effect(t => { g.setAttribute('opacity', t > s4 + 1.6 ? 1 : 0); g.setAttribute('transform', `translate(${x} ${y}) rotate(${r1(25 + 6 * Math.sin(t * 3))})`); });
  }
  const chips = [['VELA', 300, 860, s4 + 2.5], ['LAMPIÃO', 690, 860, s4 + 3.3], ['FOGÃO A LENHA', 540, 990, s4 + 4.1]];
  chips.forEach(([txt, x, y, a]) => { const g = WB.group(g3), w = WB.measure(txt, 72) + 60;
    WB.mk('rect', { x: r1(x - w / 2), y: y - 62, width: r1(w), height: 92, rx: 46, fill: '#fef3c7', stroke: '#1f1f24', 'stroke-width': 5 }, g);
    WB.showNow(WB.textStrokes(txt, x, y + 6, 72, INK.black, g, 'middle').strokes); surge(g, a, 999, x, y); });
  { const g = WB.group(g3); img(window.ICONES.vela, 140, 845, 100, g); surge(g, s4 + 2.5, 999, 140, 845); }
  W(s4 + 4.6, fim(4), 'o que tu acende PRIMEIRO?', 540, 1120, 82, INK.red, { parent: g3 });
  barra(4, 1170, g3); fora(g3, st(5));

  // ---------------- 4: urso polar ----------------
  const g4 = WB.group(), s5 = st(5), f5 = F(5);
  W(s5 + 0.02, s5 + f5 * 0.4, 'Debaixo do pelo BRANCO', 540, 600, 88, INK.black, { parent: g4 });
  W(s5 + f5 * 0.45, fim(5), 'qual a cor da PELE?', 540, 1120, 96, INK.red, { parent: g4 });
  { const g = WB.group(g4); img(window.ICONES.urso, 540, 850, 300, g); surge(g, s5 + 0.3, 999, 540, 850); }
  barra(5, 1170, g4); fora(g4, st(6));

  // ---------------- 5: Frankenstein ----------------
  const g5 = WB.group(), s6 = st(6), f6 = F(6);
  W(s6 + 0.02, s6 + 0.9, 'ÚLTIMA!', 540, 600, 110, INK.red, { parent: g5 });
  W(s6 + 0.9, s6 + f6 * 0.6, 'qual o NOME do monstro', 540, 710, 88, INK.black, { parent: g5 });
  W(s6 + f6 * 0.6, fim(6), 'do Frankenstein?', 540, 1180, 92, INK.black, { parent: g5 });
  { // monstro verde: cabeça quadrada, franja, cicatriz, parafusos
    const g = WB.group(g5), x = 540, y = 930;
    WB.mk('rect', { x: x - 45, y: y + 70, width: 90, height: 45, fill: '#6fb257', stroke: '#1f1f24', 'stroke-width': 5 }, g);
    WB.mk('rect', { x: x - 82, y: y + 80, width: 37, height: 18, rx: 4, fill: '#9ca3af', stroke: '#1f1f24', 'stroke-width': 4 }, g);
    WB.mk('rect', { x: x + 45, y: y + 80, width: 37, height: 18, rx: 4, fill: '#9ca3af', stroke: '#1f1f24', 'stroke-width': 4 }, g);
    WB.mk('rect', { x: x - 80, y: y - 100, width: 160, height: 180, rx: 16, fill: '#86c96b', stroke: '#1f1f24', 'stroke-width': 6 }, g);
    WB.mk('path', { d: `M ${x - 84} ${y - 50} L ${x - 84} ${y - 92} Q ${x - 84} ${y - 106} ${x - 70} ${y - 106} L ${x + 70} ${y - 106} Q ${x + 84} ${y - 106} ${x + 84} ${y - 92} L ${x + 84} ${y - 50} L ${x + 60} ${y - 66} L ${x + 36} ${y - 50} L ${x + 12} ${y - 66} L ${x - 12} ${y - 50} L ${x - 36} ${y - 66} L ${x - 60} ${y - 50} Z`, fill: '#1f1f24' }, g);
    WB.mk('path', { d: `M ${x - 58} ${y - 22} L ${x - 14} ${y - 18} M ${x + 14} ${y - 18} L ${x + 58} ${y - 22}`, stroke: '#1f1f24', 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
    [-36, 36].forEach(dx => { WB.mk('ellipse', { cx: x + dx, cy: y + 2, rx: 17, ry: 12, fill: '#ffffff', stroke: '#1f1f24', 'stroke-width': 4 }, g);
      WB.mk('circle', { cx: x + dx, cy: y + 4, r: 6, fill: '#1f1f24' }, g); });
    WB.mk('path', { d: `M ${x - 6} ${y + 14} L ${x - 10} ${y + 34} L ${x + 6} ${y + 34}`, fill: 'none', stroke: '#1f1f24', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    WB.mk('path', { d: `M ${x - 34} ${y + 54} L ${x + 34} ${y + 54} M ${x - 22} ${y + 46} L ${x - 22} ${y + 62} M ${x} ${y + 46} L ${x} ${y + 62} M ${x + 22} ${y + 46} L ${x + 22} ${y + 62}`, stroke: '#1f1f24', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    WB.mk('path', { d: `M ${x + 20} ${y - 46} L ${x + 62} ${y - 38} M ${x + 30} ${y - 54} L ${x + 27} ${y - 36} M ${x + 44} ${y - 51} L ${x + 41} ${y - 33} M ${x + 56} ${y - 48} L ${x + 53} ${y - 30}`, stroke: '#1f1f24', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
    surge(g, s6 + 0.9, 999, x, y);
    const v = WB.group(g5); v.appendChild(g); WB.effect(t => v.setAttribute('transform', `rotate(${r1(3 * Math.sin(t * 2.5))} 540 1045)`));
  }
  barra(6, 1230, g5); fora(g5, st(7));

  // ---------------- cena 7: abrir o envelope ----------------
  const s7 = st(7);
  { const g7 = WB.group(); W(s7 + 0.05, fim(7), 'abrindo o envelope...', 540, 760, 92, INK.purple, { parent: g7 }); fora(g7, T_ABRE + 0.8); }
  rest(fim(7), st(8) + 0.2);

  // ---------------- cena 8: o que tu falou ----------------
  const s8 = st(8);
  const TOP = 470; // topo do papel aberto
  const titulo8 = pop(T_ABRE + 1.5, st(14), 'TU FALOU:', 540, TOP + 120, 100, INK.black);
  const ITENS = [['AMANHÃ', 'HOJE'], ['PRETA', 'LARANJA'], ['A VELA', 'O FÓSFORO'], ['BRANCA', 'PRETA'], ['FRANKENSTEIN', 'NÃO TEM NOME']];
  const QUANDO = [0.0, 1.07, 2.05, 3.05, 4.05];
  const fit = (txt, size, maxW) => Math.min(size, size * maxW / WB.measure(txt, size));
  const LISTA = WB.group();
  ITENS.forEach(([err, cer], i) => {
    const y = TOP + 290 + i * 170, a = s8 + QUANDO[i] + 0.02, c = 9 + i, sc = st(c);
    const se = fit(err, 82, 380), sc2 = fit(cer, 82, 370);
    const ge = pop(a, 999, err, 295, y, se, INK.black, LISTA);
    const w = WB.measure(err, se);
    // risco vermelho + seta + certa em verde
    const gr = WB.group(LISTA);
    WB.showNow([sp(`M ${r1(295 - w / 2 - 14)} ${y - se * 0.28} L ${r1(295 + w / 2 + 14)} ${y - se * 0.4}`, INK.red, 10, gr)]);
    WB.effect(t => { const u = clamp((t - sc) / 0.2); gr.setAttribute('opacity', u > 0 ? 1 : 0);
      gr.setAttribute('transform', `translate(${r1(295 - w / 2 - 14)} 0) scale(${u.toFixed(3)} 1) translate(${-r1(295 - w / 2 - 14)} 0)`); });
    const gs = WB.group(LISTA); WB.showNow([sp(`M 505 ${y - 28} L 565 ${y - 28} M 565 ${y - 28} L 545 ${y - 44} M 565 ${y - 28} L 545 ${y - 12}`, INK.green, 7, gs)]);
    WB.effect(t => gs.setAttribute('opacity', t >= sc + 0.1 ? 1 : 0));
    pop(sc + 0.1, 999, cer, 785, y, sc2, INK.green, LISTA);
  });
  WB.effect(t => LISTA.setAttribute('opacity', (1 - clamp((t - st(14)) / 0.3)).toFixed(3)));
  { // carimbo ACERTEI?
    const g = WB.group(), x = 540, y = TOP + 1100, a = s8 + 4.95;
    const w = WB.measure('ACERTEI?', 96) + 60;
    WB.mk('rect', { x: r1(x - w / 2), y: y - 82, width: r1(w), height: 112, rx: 14, fill: 'none', stroke: INK.red, 'stroke-width': 8 }, g);
    WB.showNow(WB.textStrokes('ACERTEI?', x, y, 96, INK.red, g, 'middle').strokes);
    WB.effect(t => { const u = clamp((t - a) / 0.15), k = t < a ? 2 : lerp(1.8, 1, ease(u));
      g.setAttribute('opacity', (t < a ? 0 : 1 - clamp((t - st(9)) / 0.25)).toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y - 25}) rotate(-6) scale(${k.toFixed(3)}) translate(${-x} ${-(y - 25)})`); });
  }
  // legenda curta de cada certa embaixo do papel
  const NOTA = ['depois de ontem vem HOJE', 'laranja pra achar nos destroços', 'sem acender o fósforo, nada acende', 'a pele é preta, o pelo é transparente', 'Frankenstein é o doutor!'];
  NOTA.forEach((n, i) => { const c = 9 + i; pop(st(c) + 0.3, S[c - 1].end, n, 540, TOP + 1100, fit(n, 62, 840), INK.blue); });
  rest(st(8), st(14) - 0.1);

  // ---------------- cena 14: CTA ----------------
  const s14 = st(14), F14 = F(14);
  W(s14 + 0.1, s14 + F14 * 0.32, 'Quantas o envelope acertou?', 540, 640, 84, INK.black);
  { const g = pop(s14 + 0.5, 999, '__ de 5', 540, 830, 170, INK.red); pulsa(g, 540, 780, s14 + 0.7, 0.06, 6, 0.6); }
  W(s14 + F14 * 0.34, s14 + F14 * 0.66, 'manda pro amigo cair também', 540, 1010, 74, INK.blue);
  W(s14 + F14 * 0.68, s14 + F14 * 0.92, 'AMANHÃ: ENVELOPE NOVO', 540, 1170, 92, INK.purple);
  { const g = WB.group(), x = 540, y = 1340, a = s14 + F14 * 0.9;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0);
      const k = on && t < a + 0.25 ? 0.7 + 1.2 * (t - a) : (done && t < a + 1.2 ? 1.08 : 1);
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`); }); }
  rest(s14 + F14, S[13].end - 0.1);

  // ---------------- marca d'água que passeia ----------------
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 1780], [790, 1780], [540, 1810], [300, 1770]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const n = Math.floor(t / CYC), u = clamp((t - n * CYC - HOLD) / MOVE);
      const a = SPOTS[n % 4], b = SPOTS[(n + 1) % 4], e = ease(u);
      const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4;
      wm.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.sin(t * 1.3) * 1.5)})`);
      wm.setAttribute('opacity', (clamp((t - 0.2) / 0.3) * 0.95).toFixed(3));
    });
  }
};
