// "Tu vai cair na pegadinha": 5 pegadinhas em voz alta. Narração Gemini Algieba (3.1, take único).
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
  const CERTA = { 4: 1.55, 7: 1.4, 9: 1.25, 11: 1.45, 13: 0.8 };

  // ---------------- título + placar (prontos no quadro 0) ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('RESPONDE EM VOZ ALTA', 540, 190, 104, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('aposto que tu cai em 3!', 540, 280, 70, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  const QS = [[2, 4], [5, 7], [8, 9], [10, 11], [12, 13]]; // [cena inicial, cena da revelação]
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
  [2, 5].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.05));
  [3, 6, 8, 10, 12].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.02));

  // revelação padrão: resposta errada riscada + certa em verde com check
  const revela = (c, errada, certa, yE, yC, g, xE = 540, xC = 540) => {
    const s = st(c), d = CERTA[c];
    pop(s + 0.02, 999, errada, xE, yE, 130, INK.red, g);
    const w = WB.measure(errada, 130);
    D(s + 0.25, s + 0.5, [sp(`M ${r1(xE - w / 2 - 20)} ${yE - 30} L ${r1(xE + w / 2 + 20)} ${yE - 60}`, INK.red, 12, g)]);
    pop(s + d, 999, certa, xC, yC, 170, INK.green, g);
    const wc = WB.measure(certa, 170), cx = xC + wc / 2 + 60;
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

  // ---------------- pegadinha 1: branco / vaca ----------------
  const g1 = WB.group();
  repete(2, 'BRANCO', g1);
  const q1 = WB.group(g1);
  WB.effect(t => q1.setAttribute('opacity', t >= st(3) ? 1 : 0));
  W(st(3) + 0.02, fim(3), 'O que a vaca bebe?', 540, 760, 110, INK.black, { parent: q1 });
  barra(3, 830, q1); responde(3, 1000);
  { // apaga as palavras repetidas quando entra a pergunta
    const rep = Array.from(g1.children).filter(n => n !== q1);
    WB.effect(t => rep.forEach(n => { if (t >= st(3)) n.setAttribute('opacity', 0); }));
  }
  revela(4, 'LEITE?', 'ÁGUA!', 1060, 1330, q1, 540, 480);
  { // copo d'água
    const g = WB.group(q1), x = 880, y = 1180;
    const copo = `M ${x - 70} ${y} L ${x - 52} ${y + 190} L ${x + 52} ${y + 190} L ${x + 70} ${y} Z`;
    const agua = `M ${x - 63} ${y + 50} L ${x - 52} ${y + 190} L ${x + 52} ${y + 190} L ${x + 63} ${y + 50} Z`;
    const a = WB.mk('path', { d: agua, fill: '#93c5fd' }, g); a.setAttribute('opacity', 0);
    const tc = st(4) + CERTA[4];
    D(tc, tc + 0.4, [sp(copo, INK.blue, 7, g), sp(`M ${x - 63} ${y + 50} Q ${x - 30} ${y + 40} ${x} ${y + 50} Q ${x + 30} ${y + 60} ${x + 63} ${y + 50}`, INK.blue, 5, g)]);
    WB.effect(t => a.setAttribute('opacity', clamp((t - tc - 0.3) / 0.3).toFixed(3)));
  }
  fora(g1, st(5));

  // ---------------- pegadinha 2: para / sinal verde ----------------
  const g2 = WB.group();
  repete(5, 'PARA', g2);
  const q2 = WB.group(g2);
  WB.effect(t => q2.setAttribute('opacity', t >= st(6) ? 1 : 0));
  { const rep = Array.from(g2.children).filter(n => n !== q2); WB.effect(t => rep.forEach(n => { if (t >= st(6)) n.setAttribute('opacity', 0); })); }
  W(st(6) + 0.02, st(6) + S[5].fala * 0.5, 'No sinal VERDE', 540, 640, 104, INK.black, { parent: q2 });
  W(st(6) + S[5].fala * 0.5, fim(6), 'tu faz o quê?', 540, 750, 104, INK.black, { parent: q2 });
  { // semáforo deitado
    const g = WB.group(q2), x = 540, y = 900;
    WB.mk('rect', { x: x - 200, y: y - 70, width: 400, height: 140, rx: 40, fill: '#3a3a40' }, g);
    [['#7f1d1d', -125], ['#78350f', 0], ['#22c55e', 125]].forEach(([c, dx], i) => {
      WB.mk('circle', { cx: x + dx, cy: y, r: 46, fill: c }, g);
    });
    const brilho = WB.mk('circle', { cx: x + 125, cy: y, r: 60, fill: '#22c55e', 'fill-opacity': 0.25 }, g);
    WB.showNow([sp(WB.roundRectPath(x - 200, y - 70, 400, 140, 40), INK.black, 6, g)]);
    WB.effect(t => brilho.setAttribute('r', r1(56 + 6 * Math.sin(t * 6))));
  }
  barra(6, 1000, q2); responde(6, 1130);
  revela(7, 'PARA?', 'ANDA!', 1200, 1440, q2);
  fora(g2, st(8));

  // ---------------- pegadinha 3: pai do Pedro ----------------
  const g3 = WB.group(), s8 = st(8);
  W(s8 + 0.05, s8 + 0.9, 'O pai do PEDRO', 540, 620, 100, INK.black, { parent: g3 });
  W(s8 + 0.9, s8 + 1.6, 'tem 5 filhos:', 540, 725, 100, INK.black, { parent: g3 });
  const nomes = [['Lala', 1.75], ['Lele', 2.25], ['Lili', 2.68], ['Lolo', 3.2], ['?', 3.8]];
  const posN = [[290, 880], [540, 880], [790, 880], [415, 1030], [665, 1030]];
  nomes.forEach(([n, d], i) => {
    const [x, y] = posN[i], g = WB.group(g3);
    WB.mk('rect', { x: x - 105, y: y - 62, width: 210, height: 110, rx: 55, fill: i === 4 ? '#fde68a' : '#e0e7ff' }, g);
    WB.showNow([sp(WB.roundRectPath(x - 105, y - 62, 210, 110, 55), i === 4 ? INK.orange : INK.blue, 5, g)]);
    WB.showNow(WB.textStrokes(n, x, y + 22, 72, INK.black, g, 'middle').strokes);
    WB.effect(t => {
      const u = clamp((t - s8 - d) / 0.18);
      g.setAttribute('opacity', t >= s8 + d ? 1 : 0);
      const k = 0.6 + 0.4 * ease(u);
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`);
    });
  });
  barra(8, 1110, g3); responde(8, 1230);
  revela(9, 'LULU?', 'PEDRO!', 1270, 1500, g3);
  fora(g3, st(10));

  // ---------------- pegadinha 4: soma ----------------
  const g4 = WB.group(), s10 = st(10);
  W(s10 + 0.02, s10 + 0.6, 'Soma comigo:', 540, 600, 96, INK.black, { parent: g4 });
  const linhas = [['', '1000', 0.75], ['+', '40', 1.61], ['+', '1000', 2.82], ['+', '30', 3.93], ['+', '1000', 5.26], ['+', '20', 6.46], ['+', '1000', 7.76], ['+', '10', 9.02]];
  const XR = 470, Y1 = 710, LH = 82;
  linhas.forEach(([s, n, d], i) => {
    const y = Y1 + i * LH;
    if (s) pop(s10 + d, 999, s, 170, y, 76, INK.blue, g4);
    pop(s10 + d, 999, n, XR, y, 80, i % 2 ? INK.blue : INK.black, g4, 'end');
  });
  D(fim(10) - 0.05, fim(10) + 0.25, [sp(`M 150 ${Y1 + 8 * LH - 50} L 490 ${Y1 + 8 * LH - 50}`, INK.black, 7, g4)]);
  pop(fim(10) + 0.05, 999, '= ?', 330, Y1 + 8 * LH + 40, 96, INK.red, g4);
  responde(10, 1560);
  revela(11, '5000?', '4100!', 900, 1150, g4, 790, 760);
  fora(g4, st(12));

  // ---------------- pegadinha 5: meses com 28 dias ----------------
  const g5 = WB.group(), s12 = st(12);
  W(s12 + 0.5, s12 + 1.5, 'Quantos meses', 540, 620, 104, INK.black, { parent: g5 });
  W(s12 + 1.5, fim(12), 'têm 28 dias?', 540, 730, 104, INK.black, { parent: g5 });
  { // calendário
    const g = WB.group(g5), x = 540, y = 920;
    WB.mk('rect', { x: x - 130, y: y - 110, width: 260, height: 230, rx: 20, fill: '#fffaf0' }, g);
    WB.mk('rect', { x: x - 130, y: y - 110, width: 260, height: 64, rx: 20, fill: INK.red }, g);
    WB.mk('rect', { x: x - 130, y: y - 70, width: 260, height: 24, fill: INK.red }, g);
    WB.showNow([sp(WB.roundRectPath(x - 130, y - 110, 260, 230, 20), INK.black, 6, g)]);
    WB.showNow(WB.textStrokes('28', x, y + 85, 130, INK.black, g, 'middle').strokes);
    [-70, 70].forEach(dx => WB.showNow([sp(`M ${x + dx} ${y - 135} L ${x + dx} ${y - 90}`, INK.black, 10, g)]));
    WB.effect(t => g.setAttribute('opacity', t >= s12 + 0.3 ? 1 : 0));
  }
  barra(12, 1060, g5); responde(12, 1190);
  revela(13, '1?', 'TODOS!', 1260, 1470, g5, 540, 500);
  W(st(13) + CERTA[13] + 0.4, S[12].end - 0.05, 'todo mês tem dia 28!', 540, 1590, 64, INK.blue, { parent: g5 });
  fora(g5, st(14));

  // ---------------- cena 14: CTA ----------------
  const s14 = st(14), F14 = S[13].fala;
  W(s14 + 0.1, s14 + F14 * 0.45, 'Quantas tu acertou?', 540, 760, 104, INK.black);
  { const g = pop(s14 + 0.5, 999, '__ de 5', 540, 980, 190, INK.red); pulsa(g, 540, 920, s14 + 0.7, 0.06, 6, 0.6); }
  W(s14 + F14 * 0.5, s14 + F14 * 0.95, 'manda pro amigo cair também!', 540, 1200, 76, INK.blue);
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
