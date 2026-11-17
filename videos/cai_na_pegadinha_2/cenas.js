// "Tu vai cair na pegadinha 2": 5 pegadinhas novas em voz alta. Narração Gemini Algieba (3.1, take único).
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
  const janela = (g, a, b, d = 0.2) => WB.effect(t => g.setAttribute('opacity', (clamp((t - a) / d) * (1 - clamp((t - b) / d))).toFixed(3)));
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala;
  const pop = (a, b, txt, x, y, size, cor, parent, anchor = 'middle') => { // texto que aparece pronto, com "pulo"
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, anchor).strokes);
    WB.effect(t => {
      const u = clamp((t - a) / 0.18), k = t < a ? 0 : (u < 1 ? 0.6 + 0.5 * ease(u) : 1 + 0.1 * Math.exp(-(t - a - 0.18) * 10));
      const op = t < a ? 0 : 1 - clamp((t - b) / 0.2);
      g.setAttribute('opacity', op.toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y - size * 0.35}) scale(${k.toFixed(3)}) translate(${-x} ${-(y - size * 0.35)})`);
    });
    return g;
  };
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });
  // instante da resposta certa em cada revelação (igual ao audio.py)
  const CERTA = { 4: 1.6, 6: 1.58, 8: 1.14, 10: 1.45, 12: 1.14 };

  // ---------------- título + placar (prontos no quadro 0) ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('RESPONDE EM VOZ ALTA', 540, 190, 104, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('aposto que tu cai em 3!', 540, 280, 70, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  const QS = [[2, 4], [5, 6], [7, 8], [9, 10], [11, 12]]; // [cena inicial, cena da revelação]
  const bolas = QS.map((q, i) => {
    const x = 340 + i * 100, y = 390, g = WB.group();
    const c = WB.mk('circle', { cx: x, cy: y, r: 36, fill: '#fffaf0' }, g);
    WB.showNow([sp(WB.circlePath(x, y, 36), INK.black, 5, g)]);
    WB.showNow(WB.textStrokes(String(i + 1), x, y + 17, 52, INK.black, g, 'middle').strokes);
    WB.effect(t => {
      const ativo = t >= st(q[0]) && t < (QS[i + 1] ? st(QS[i + 1][0]) : 999);
      const feito = t >= st(q[1]) + CERTA[q[1]];
      c.setAttribute('fill', feito && !ativo ? '#d9f2df' : ativo ? '#fde68a' : '#fffaf0');
      const k = ativo ? 1.12 + 0.04 * Math.sin(t * 6) : 1;
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`);
    });
    return g;
  });
  const fora = (g, a, b) => WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - a) / 0.25)).toFixed(3)));

  // ---------------- cena 1: gancho ----------------
  rest(0.2, 0.3);
  pop(0.0, st(2) - 0.1, 'só vale responder rápido!', 540, 900, 84, INK.purple);
  pop(0.0, st(2) - 0.1, '5 perguntas', 540, 1060, 120, INK.black);
  [2].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.05));
  [3, 5, 7, 9, 11].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.02));

  // revelação padrão: resposta errada riscada + certa em verde com check
  const revela = (c, errada, certa, yE, yC, g, xE = 540, xC = 540, sz = 170) => {
    const s = st(c), d = CERTA[c];
    pop(s + 0.02, 999, errada, xE, yE, 130, INK.red, g);
    const w = WB.measure(errada, 130);
    D(s + 0.25, s + 0.5, [sp(`M ${r1(xE - w / 2 - 20)} ${yE - 30} L ${r1(xE + w / 2 + 20)} ${yE - 60}`, INK.red, 12, g)]);
    pop(s + d, 999, certa, xC, yC, sz, INK.green, g);
    const wc = WB.measure(certa, sz), cx = xC + wc / 2 + 60;
    D(s + d + 0.05, s + d + 0.35, [sp(`M ${r1(cx - 30)} ${yC - 60} L ${r1(cx)} ${yC - 25} L ${r1(cx + 55)} ${yC - 110}`, INK.green, 12, g)]);
  };
  // palavra repetida 5x na pausa
  const repete = (c, palavra, g) => {
    W(st(c) + 0.1, fim(c) - 0.05, 'Fala ' + palavra + ' 5x!', 540, 620, 96, INK.black, { parent: g });
    for (let k = 0; k < 5; k++) {
      const t0 = fim(c) + 0.15 + k * 0.4;
      pop(t0, st(c + 1) + 0.05, palavra, 540 + (k % 2 ? 110 : -110), 790 + k * 120, 104, k % 2 ? INK.blue : INK.purple, g);
    }
  };
  // barra de tempo da resposta
  const barra = (c, y, g) => {
    const a = fim(c), b = st(c + 1);
    const bg = WB.mk('rect', { x: 240, y, width: 600, height: 26, rx: 13, fill: '#efe7cf' }, g);
    const fg = WB.mk('rect', { x: 240, y, width: 600, height: 26, rx: 13, fill: INK.red }, g);
    WB.effect(t => {
      const on = t >= st(c) && t < b + 0.1;
      bg.setAttribute('opacity', on ? 1 : 0); fg.setAttribute('opacity', on ? 1 : 0);
      fg.setAttribute('width', r1(600 * (1 - clamp((t - a) / (b - a)))));
    });
  };
  const responde = (c, y) => pop(fim(c) + 0.02, st(c + 1), 'RESPONDE!', 540, y, 90, INK.red);


  const sub = (c, txt, y, g) => W(st(c) + CERTA[c] + 0.35, S[c - 1].end - 0.05, txt, 540, y, 66, INK.blue, { parent: g });
  const F = c => S[c - 1].fala;

  // ---------------- pegadinha 1: gema / clara ----------------
  const g1 = WB.group();
  repete(2, 'GEMA', g1);
  const q1 = WB.group(g1);
  WB.effect(t => q1.setAttribute('opacity', t >= st(3) ? 1 : 0));
  { const rep = Array.from(g1.children).filter(n => n !== q1); WB.effect(t => rep.forEach(n => { if (t >= st(3)) n.setAttribute('opacity', 0); })); }
  W(st(3) + 0.02, st(3) + F(3) * 0.45, 'Qual é a parte', 540, 620, 104, INK.black, { parent: q1 });
  W(st(3) + F(3) * 0.45, fim(3), 'BRANCA do ovo?', 540, 730, 104, INK.black, { parent: q1 });
  { // ovo frito
    const g = WB.group(q1), x = 540, y = 900;
    const clara = `M ${x - 170} ${y} C ${x - 190} ${y - 90} ${x - 60} ${y - 120} ${x + 10} ${y - 95} C ${x + 90} ${y - 130} ${x + 200} ${y - 70} ${x + 175} ${y + 5} C ${x + 200} ${y + 80} ${x + 80} ${y + 110} ${x - 10} ${y + 90} C ${x - 100} ${y + 115} ${x - 200} ${y + 75} ${x - 170} ${y} Z`;
    WB.mk('path', { d: clara, fill: '#ffffff' }, g);
    WB.mk('circle', { cx: x + 10, cy: y, r: 52, fill: '#fbbf24' }, g);
    WB.showNow([sp(clara, INK.black, 6, g), sp(WB.circlePath(x + 10, y, 52), INK.orange, 6, g)]);
    WB.effect(t => g.setAttribute('opacity', t >= st(3) + 0.2 ? 1 : 0));
  }
  barra(3, 1010, q1); responde(3, 1140);
  revela(4, 'GEMA?', 'CLARA!', 1230, 1460, q1);
  sub(4, 'a gema é a parte amarela!', 1580, q1);
  fora(g1, st(5));

  // ---------------- pegadinha 2: corrida ----------------
  const g2 = WB.group(), s5 = st(5);
  W(s5 + 0.02, s5 + 1.2, 'Tu tá numa CORRIDA', 540, 600, 100, INK.black, { parent: g2 });
  W(s5 + 1.2, s5 + 2.5, 'e passa o 2º colocado', 540, 705, 92, INK.black, { parent: g2 });
  W(s5 + 2.6, fim(5), 'em que lugar tu fica?', 540, 810, 92, INK.red, { parent: g2 });
  { // pista com corredores: o TU passa o 2º
    const g = WB.group(g2), y = 960;
    WB.showNow([sp('M 120 1030 L 960 1030', INK.black, 6, g), sp('M 870 900 L 870 1030', INK.red, 6, g)]);
    WB.mk('rect', { x: 872, y: 900, width: 60, height: 40, fill: '#fee2e2' }, g);
    const bola = (txt, cor, fill) => { const b = WB.group(g); WB.mk('circle', { cx: 0, cy: 0, r: 52, fill }, b);
      WB.showNow([sp(WB.circlePath(0, 0, 52), cor, 6, b)]); WB.showNow(WB.textStrokes(txt, 0, 20, txt.length > 2 ? 46 : 58, INK.black, b, 'middle').strokes); return b; };
    const b1 = bola('1º', INK.black, '#fffaf0'), b2 = bola('2º', INK.black, '#fffaf0'), tu = bola('TU', INK.blue, '#bfdbfe');
    const a = s5 + 1.3, b = s5 + 2.5;
    WB.effect(t => {
      const u = ease(clamp((t - a) / (b - a)));
      b1.setAttribute('transform', `translate(${r1(720 + 10 * Math.sin(t * 9))} ${y})`);
      b2.setAttribute('transform', `translate(${r1(520 + 10 * Math.sin(t * 9 + 1))} ${y})`);
      tu.setAttribute('transform', `translate(${r1(lerp(300, 620, u) + 8 * Math.sin(t * 9 + 2))} ${r1(y - 25 * Math.sin(Math.PI * u))})`);
      g.setAttribute('opacity', t >= s5 + 0.2 ? 1 : 0);
    });
  }
  barra(5, 1110, g2); responde(5, 1240);
  revela(6, '1º?', '2º!', 1330, 1540, g2);
  sub(6, 'tu só tomou o lugar dele!', 1660, g2);
  fora(g2, st(7));

  // ---------------- pegadinha 3: galo ----------------
  const g3 = WB.group(), s7 = st(7);
  W(s7 + 0.02, s7 + 1.1, 'Um GALO bota um ovo', 540, 600, 96, INK.black, { parent: g3 });
  W(s7 + 1.1, s7 + 2.3, 'em cima do telhado', 540, 705, 96, INK.black, { parent: g3 });
  W(s7 + 2.35, fim(7), 'pra que lado ele cai?', 540, 810, 92, INK.red, { parent: g3 });
  { // telhado com ovo no topo e setas
    const g = WB.group(g3), x = 540, y = 1060;
    const tel = `M ${x - 230} ${y} L ${x} ${y - 150} L ${x + 230} ${y} Z`;
    WB.mk('path', { d: tel, fill: '#fecaca' }, g);
    WB.mk('rect', { x: x - 190, y, width: 380, height: 40, fill: '#fde68a' }, g);
    const ovo = WB.mk('ellipse', { cx: x, cy: y - 182, rx: 24, ry: 32, fill: '#fffaf0' }, g);
    WB.showNow([sp(tel, INK.red, 6, g), sp(`M ${x - 190} ${y} L ${x - 190} ${y + 40} L ${x + 190} ${y + 40} L ${x + 190} ${y}`, INK.black, 5, g)]);
    WB.mk('ellipse', { cx: x, cy: y - 182, rx: 24, ry: 32, fill: 'none', stroke: INK.black, 'stroke-width': 5 }, g);
    const seta = (dx) => sp(`M ${x + dx * 70} ${y - 200} Q ${x + dx * 160} ${y - 230} ${x + dx * 200} ${y - 150} M ${x + dx * 200} ${y - 150} L ${x + dx * 205} ${y - 190} M ${x + dx * 200} ${y - 150} L ${x + dx * 165} ${y - 165}`, INK.blue, 6, g);
    D(s7 + 2.4, s7 + 3.2, [seta(-1), seta(1)]);
    WB.effect(t => g.setAttribute('opacity', t >= s7 + 0.9 ? 1 : 0));
  }
  barra(7, 1150, g3); responde(7, 1270);
  revela(8, 'DIREITA?', 'NENHUM!', 1360, 1570, g3, 540, 500, 160);
  sub(8, 'galo não bota ovo!', 1690, g3);
  fora(g3, st(9));

  // ---------------- pegadinha 4: Moisés ----------------
  const g4 = WB.group(), s9 = st(9);
  W(s9 + 0.02, s9 + F(9) * 0.5, 'Quantos bichos de cada', 540, 610, 92, INK.black, { parent: g4 });
  W(s9 + F(9) * 0.5, fim(9), 'MOISÉS levou na arca?', 540, 715, 92, INK.black, { parent: g4 });
  { // arca
    const g = WB.group(g4), x = 540, y = 960;
    const casco = `M ${x - 250} ${y - 20} L ${x + 250} ${y - 20} L ${x + 190} ${y + 80} L ${x - 190} ${y + 80} Z`;
    const casa = `M ${x - 120} ${y - 20} L ${x - 120} ${y - 110} L ${x + 120} ${y - 110} L ${x + 120} ${y - 20}`;
    const tet = `M ${x - 150} ${y - 110} L ${x} ${y - 180} L ${x + 150} ${y - 110} Z`;
    WB.mk('path', { d: casco, fill: '#d6a46b' }, g); WB.mk('rect', { x: x - 120, y: y - 110, width: 240, height: 90, fill: '#f3d9a8' }, g);
    WB.mk('path', { d: tet, fill: '#b45309' }, g);
    WB.showNow([sp(casco, INK.black, 6, g), sp(casa, INK.black, 5, g), sp(tet, INK.black, 5, g),
      sp(`M ${x - 300} ${y + 95} Q ${x - 230} ${y + 70} ${x - 160} ${y + 95} T ${x - 20} ${y + 95} T ${x + 120} ${y + 95} T ${x + 260} ${y + 95}`, INK.blue, 6, g)]);
    [[-60, 'oo'], [60, 'oo']].forEach(([dx]) => { WB.mk('circle', { cx: x + dx, cy: y - 65, r: 20, fill: '#fffaf0' }, g); WB.showNow([sp(WB.circlePath(x + dx, y - 65, 20), INK.black, 4, g)]); });
    WB.effect(t => { g.setAttribute('opacity', t >= s9 + 0.2 ? 1 : 0); g.setAttribute('transform', `translate(0 ${r1(6 * Math.sin(t * 2.5))}) rotate(${r1(1.5 * Math.sin(t * 2))} ${x} ${y})`); });
  }
  barra(9, 1110, g4); responde(9, 1240);
  revela(10, 'DOIS?', 'NOÉ!', 1330, 1540, g4);
  sub(10, 'quem fez a arca foi Noé!', 1660, g4);
  fora(g4, st(11));

  // ---------------- pegadinha 5: avião na fronteira ----------------
  const g5 = WB.group(), s11 = st(11);
  W(s11 + 0.1, s11 + 2.1, 'Um avião cai na fronteira', 540, 600, 88, INK.black, { parent: g5 });
  W(s11 + 3.4, fim(11), 'onde enterram os sobreviventes?', 540, 1080, 74, INK.red, { parent: g5 });
  { // fronteira Brasil | Argentina com avião
    const g = WB.group(g5), y = 830;
    WB.mk('rect', { x: 130, y: y - 130, width: 405, height: 230, rx: 20, fill: '#dcfce7' }, g);
    WB.mk('rect', { x: 545, y: y - 130, width: 405, height: 230, rx: 20, fill: '#dbeafe' }, g);
    WB.showNow([sp('M 540 690 L 540 950', INK.black, 6, g)]);
    WB.showNow(WB.textStrokes('BRASIL', 335, y + 70, 64, INK.green, g, 'middle').strokes);
    WB.showNow(WB.textStrokes('ARGENTINA', 745, y + 70, 64, INK.blue, g, 'middle').strokes);
    const av = WB.group(g);
    const corpo = 'M -70 0 L 60 0 Q 85 0 85 10 Q 85 20 60 20 L -70 20 Z', asa = 'M -10 10 L -40 -35 L -15 -35 L 25 10 Z', cauda = 'M -70 0 L -85 -30 L -60 -30 L -45 0 Z';
    [corpo, asa, cauda].forEach(d => WB.mk('path', { d, fill: '#ffffff' }, av));
    WB.showNow([sp(corpo, INK.black, 5, av), sp(asa, INK.black, 5, av), sp(cauda, INK.black, 5, av)]);
    const a = s11 + 0.9, b = s11 + 2.1;
    WB.effect(t => {
      const u = clamp((t - a) / (b - a));
      av.setAttribute('transform', `translate(${r1(lerp(180, 540, u))} ${r1(lerp(y - 110, y - 20, u * u))}) rotate(${r1(25 * u)})`);
      g.setAttribute('opacity', t >= s11 + 0.8 ? 1 : 0);
    });
  }
  barra(11, 1130, g5); responde(11, 1260);
  revela(12, 'BRASIL?', 'NÃO ENTERRA!', 1350, 1560, g5, 540, 480, 130);
  sub(12, 'sobrevivente tá vivo!', 1680, g5);
  fora(g5, st(13));

  // ---------------- cena 13: CTA ----------------
  const s13 = st(13), F13 = S[12].fala;
  W(s13 + 0.1, s13 + F13 * 0.45, 'Quantas tu acertou?', 540, 760, 104, INK.black);
  { const g = pop(s13 + 0.5, 999, '__ de 5', 540, 980, 190, INK.red); pulsa(g, 540, 920, s13 + 0.7, 0.06, 6, 0.6); }
  W(s13 + F13 * 0.5, s13 + F13 * 0.95, 'manda pro amigo cair também!', 540, 1200, 76, INK.blue);
  rest(s13 + F13, S[12].end - 0.1);

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
