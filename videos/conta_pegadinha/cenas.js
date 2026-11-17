// "Tu erra a conta de cabeça": 5 pegadinhas de conta em voz alta. Narração Gemini Algieba (3.1, take único).
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
  const CERTA = { 3: 1.19, 5: 1.95, 7: 1.98, 9: 1.55, 11: 1.84 };

  // ---------------- título + placar (prontos no quadro 0) ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('RESPONDE EM VOZ ALTA', 540, 190, 104, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('conta de cabeça: tu erra 3!', 540, 280, 70, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  const QS = [[2, 3], [4, 5], [6, 7], [8, 9], [10, 11]]; // [cena inicial, cena da revelação]
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
  pop(0.0, st(2) - 0.1, 'sem calculadora!', 540, 900, 90, INK.purple);
  pop(0.0, st(2) - 0.1, '5 contas', 540, 1060, 130, INK.black);
  [2, 4, 6, 8, 10].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.02));

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


  const F = c => S[c - 1].fala;


  const sub = (c, txt, y, g) => W(st(c) + CERTA[c] + 0.35, S[c - 1].end - 0.05, txt, 540, y, 62, INK.blue, { parent: g });
  const L = (c, a, b, txt, y, cor = INK.black, size = 92, g) => W(st(c) + a, Math.min(st(c) + b, fim(c)), txt, 540, y, size, cor, { parent: g });
  const Y = { bar: 1060, resp: 1190, e: 1300, c: 1520, sub: 1640 };

  // ---------------- 1: 30 ÷ meio + 10 ----------------
  const g1 = WB.group();
  L(2, 0.15, 1.5, '30 ÷ meio', 640, INK.black, 150, g1);
  L(2, 1.5, 2.1, '+ 10', 800, INK.black, 150, g1);
  L(2, 2.2, 2.8, 'quanto dá?', 930, INK.red, 92, g1);
  barra(2, Y.bar, g1); responde(2, Y.resp);
  revela(3, '25?', '70!', Y.e, Y.c, g1);
  sub(3, 'dividir por meio é dobrar: 60 + 10', Y.sub, g1);
  fora(g1, st(4));

  // ---------------- 2: tijolo ----------------
  const g2 = WB.group();
  L(4, 0.1, 1.4, 'Um tijolo pesa 1 kg', 600, INK.black, 96, g2);
  L(4, 1.4, 2.5, '+ MEIO tijolo', 705, INK.red, 96, g2);
  L(4, 2.8, 3.85, 'quanto pesa o tijolo?', 810, INK.black, 88, g2);
  { const g = WB.group(g2), x = 540, y = 930;
    const f = `M ${x - 150} ${y - 25} L ${x + 110} ${y - 25} L ${x + 150} ${y - 55} L ${x - 110} ${y - 55} Z`;
    WB.mk('rect', { x: x - 150, y: y - 25, width: 260, height: 80, fill: '#e07a4f' }, g);
    WB.mk('path', { d: f, fill: '#f0a07a' }, g);
    WB.mk('path', { d: `M ${x + 110} ${y - 25} L ${x + 150} ${y - 55} L ${x + 150} ${y + 25} L ${x + 110} ${y + 55} Z`, fill: '#b85a35' }, g);
    WB.showNow([sp(`M ${x - 150} ${y - 25} L ${x + 110} ${y - 25} L ${x + 110} ${y + 55} L ${x - 150} ${y + 55} Z`, INK.black, 5, g), sp(f, INK.black, 5, g), sp(`M ${x + 150} ${y - 55} L ${x + 150} ${y + 25} L ${x + 110} ${y + 55}`, INK.black, 5, g)]);
    WB.effect(t => g.setAttribute('opacity', t >= st(4) + 0.3 ? 1 : 0)); }
  barra(4, Y.bar, g2); responde(4, Y.resp);
  revela(5, '1,5 kg?', '2 kg!', Y.e, Y.c, g2);
  sub(5, 'meio tijolo = 1 kg, então o inteiro = 2 kg', Y.sub, g2);
  fora(g2, st(6));

  // ---------------- 3: taco e bola ----------------
  const g3 = WB.group();
  L(6, 0.1, 2.0, 'taco + bola = R$ 1,10', 600, INK.black, 92, g3);
  L(6, 2.5, 4.7, 'o taco custa R$ 1 a MAIS', 705, INK.blue, 84, g3);
  L(6, 4.9, 5.75, 'quanto custa a bola?', 810, INK.red, 88, g3);
  { const g = WB.group(g3), x = 540, y = 940;
    const taco = `M ${x - 230} ${y + 40} L ${x + 40} ${y - 40} Q ${x + 70} ${y - 50} ${x + 75} ${y - 30} Q ${x + 70} ${y - 10} ${x + 40} ${y - 5} L ${x - 225} ${y + 55} Z`;
    WB.mk('path', { d: taco, fill: '#d6a46b' }, g);
    WB.mk('circle', { cx: x + 170, cy: y + 10, r: 45, fill: '#ffffff' }, g);
    WB.showNow([sp(taco, INK.black, 5, g), sp(WB.circlePath(x + 170, y + 10, 45), INK.black, 5, g),
      sp(`M ${x + 140} ${y - 20} Q ${x + 160} ${y + 10} ${x + 140} ${y + 40} M ${x + 200} ${y - 20} Q ${x + 180} ${y + 10} ${x + 200} ${y + 40}`, INK.red, 4, g)]);
    WB.effect(t => g.setAttribute('opacity', t >= st(6) + 0.3 ? 1 : 0)); }
  barra(6, Y.bar, g3); responde(6, Y.resp);
  revela(7, '0,10?', '0,05!', Y.e, Y.c, g3);
  sub(7, 'bola 0,05 + taco 1,05 = 1,10', Y.sub, g3);
  fora(g3, st(8));

  // ---------------- 4: máquinas ----------------
  const g4 = WB.group();
  L(8, 0.2, 1.4, '5 máquinas', 600, INK.black, 96, g4);
  L(8, 1.4, 3.1, '5 peças em 5 min', 705, INK.black, 96, g4);
  L(8, 3.2, 4.4, '100 máquinas', 840, INK.blue, 96, g4);
  L(8, 4.4, 5.8, '100 peças em...?', 945, INK.red, 96, g4);
  barra(8, Y.bar, g4); responde(8, Y.resp);
  revela(9, '100 min?', '5 min!', Y.e, Y.c, g4);
  sub(9, 'cada máquina faz 1 peça em 5 min', Y.sub, g4);
  fora(g4, st(10));

  // ---------------- 5: planta no lago ----------------
  const g5 = WB.group();
  L(10, 0.8, 3.5, 'a planta DOBRA todo dia', 600, INK.black, 88, g5);
  L(10, 4.0, 6.0, 'dia 48: lago inteiro', 705, INK.green, 92, g5);
  L(10, 6.4, 7.8, 'metade do lago: dia...?', 810, INK.red, 88, g5);
  { const g = WB.group(g5), x = 540, y = 950;
    WB.mk('ellipse', { cx: x, cy: y, rx: 260, ry: 80, fill: '#bfdbfe' }, g);
    const pl = WB.mk('ellipse', { cx: x - 200, cy: y, rx: 40, ry: 30, fill: '#4ade80' }, g);
    WB.mk('ellipse', { cx: x, cy: y, rx: 260, ry: 80, fill: 'none', stroke: INK.blue, 'stroke-width': 6 }, g);
    WB.effect(t => { g.setAttribute('opacity', t >= st(10) + 0.6 ? 1 : 0);
      const u = clamp((t - st(10) - 0.8) / 5.2), w = 40 + 220 * u * u;
      pl.setAttribute('rx', r1(w)); pl.setAttribute('cx', r1(x - 260 + w)); pl.setAttribute('ry', r1(30 + 50 * u)); }); }
  barra(10, Y.bar, g5); responde(10, Y.resp);
  revela(11, '24?', '47!', Y.e, Y.c, g5);
  sub(11, 'no dia 48 ela dobra e cobre tudo', Y.sub, g5);
  fora(g5, st(12));

  // ---------------- CTA ----------------
  const s12 = st(12), F12 = S[11].fala;
  W(s12 + 0.1, s12 + F12 * 0.45, 'Quantas tu acertou?', 540, 760, 104, INK.black);
  { const g = pop(s12 + 0.5, 999, '__ de 5', 540, 980, 190, INK.red); pulsa(g, 540, 920, s12 + 0.7, 0.06, 6, 0.6); }
  W(s12 + F12 * 0.5, s12 + F12 * 0.95, 'manda pro amigo bom de conta!', 540, 1200, 76, INK.blue);
  rest(s12 + F12, S[11].end - 0.1);

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
