// "O número escondido": 3 placas de bolinhas (estilo teste de cores), fala o número em voz alta. Narração Gemini Algieba (3.1, take único).
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
  


  const img = (href, x, y, s, parent) => WB.mk('image', { href, x: x - s / 2, y: y - s / 2, width: s, height: s }, parent);
  const surge = (g, a, cx, cy, b = 999) => WB.effect(t => {
    const u = clamp((t - a) / 0.25), k = t < a ? 0.01 : 0.7 + 0.3 * ease(u) + 0.03 * Math.sin((t - a) * 3);
    g.setAttribute('opacity', t < a ? 0 : 1 - clamp((t - b) / 0.2));
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });
  const fora = (g, a) => WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - a) / 0.25)).toFixed(3)));
  const F = c => S[c - 1].fala;
  const barra = (c, y, g) => {
    const a = fim(c), b = st(c + 1);
    const bg = WB.mk('rect', { x: 240, y, width: 600, height: 26, rx: 13, fill: '#efe7cf' }, g);
    const fg = WB.mk('rect', { x: 240, y, width: 600, height: 26, rx: 13, fill: INK.red }, g);
    WB.effect(t => { const on = t >= st(c) && t < b + 0.1;
      bg.setAttribute('opacity', on ? 1 : 0); fg.setAttribute('opacity', on ? 1 : 0);
      fg.setAttribute('width', r1(600 * (1 - clamp((t - a) / (b - a))))); });
  };
  const responde = (c, y, g) => pop(fim(c) + 0.02, st(c + 1), 'RESPONDE!', 540, y, 90, INK.red, g);






  // ---------------- título ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('QUE NÚMERO TU VÊ?', 540, 190, 104, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('fala em voz alta!', 540, 285, 72, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  const PL = [
    { a: 0.0, b: st(3) + 1.5, rev: st(3), num: '12', tim: 2 },
    { a: st(3) + 1.5, b: st(4) + 1.1, rev: st(4), num: '57', tim: 3 },
    { a: st(4) + 1.2, b: st(5) + 2.6, rev: st(5), num: '8', tim: 4 }];
  PL.forEach((p, i) => {
    const x = 440 + i * 100, y = 385, g = WB.group();
    const ci = WB.mk('circle', { cx: x, cy: y, r: 34, fill: '#fffaf0' }, g);
    WB.showNow([sp(WB.circlePath(x, y, 34), INK.black, 5, g)]);
    WB.showNow(WB.textStrokes(String(i + 1), x, y + 16, 50, INK.black, g, 'middle').strokes);
    WB.effect(t => { const ativo = t >= p.a && t < p.b, feito = t >= p.b; ci.setAttribute('fill', ativo ? '#fde68a' : feito ? '#d9f2df' : '#fffaf0'); });
    const pg = WB.group(); img(window.ICONES['placa' + (i + 1)], 540, 980, 840, pg);
    WB.effect(t => { const u = clamp((t - p.a) / 0.35), v = clamp((t - p.b + 0.3) / 0.3);
      pg.setAttribute('opacity', (t < p.a || t >= p.b ? 0 : u * (1 - v)).toFixed(3));
      const k = 0.92 + 0.08 * ease(u) + 0.01 * Math.sin(t * 2);
      pg.setAttribute('transform', `translate(540 980) scale(${k.toFixed(3)}) translate(-540 -980)`); });
    // cronômetro da resposta
    const c = p.tim, T0 = fim(c) + 0.15, T1 = S[c - 1].end;
    const bg = WB.mk('rect', { x: 240, y: 1500, width: 600, height: 26, rx: 13, fill: '#efe7cf' }, pg);
    const fg = WB.mk('rect', { x: 240, y: 1500, width: 600, height: 26, rx: 13, fill: INK.red }, pg);
    WB.effect(t => { const on = t >= T0 && t < T1; bg.setAttribute('opacity', on ? 1 : 0); fg.setAttribute('opacity', on ? 1 : 0);
      fg.setAttribute('width', r1(600 * (1 - clamp((t - T0) / (T1 - T0))))); });
    // resposta
    const rg = WB.group();
    WB.mk('circle', { cx: 540, cy: 1590, r: 0, fill: 'none' }, rg);
    pop(p.rev + 0.05, p.b, 'era ' + p.num + '!', 540, 1640, 120, INK.green, rg);
  });
  rest(0.2, 0.3);
  for (let c = 1; c <= 5; c++) rest(fim(c) + 0.05, S[c - 1].end - 0.05);

  // ---------------- 5: resultado + 6: CTA ----------------
  const s5 = st(5), s6 = st(6), F6 = F(6);
  { const g = WB.group(); pop(s5 + 1.0, s6, 'viu os 3?', 540, 560, 110, INK.black, g); }
  W(s6 + 0.1, s6 + F6 * 0.3, 'quantos tu acertou?', 540, 640, 96, INK.black);
  { const g = pop(s6 + 0.5, 999, '__ de 3', 540, 840, 170, INK.red); pulsa(g, 540, 780, s6 + 0.7, 0.06, 6, 0.6); }
  W(s6 + F6 * 0.32, s6 + F6 * 0.55, 'manda pro amigo testar!', 540, 1040, 90, INK.purple);
  { const g = WB.group(), x = 540, y = 1230, a = s6 + F6 * 0.58;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0); });
    pop(a + 0.3, 999, 'amanhã tem mais teste!', 540, 1390, 80, INK.red);
    pop(a + 0.5, 999, '(brincadeira, não é exame de vista)', 540, 1500, 46, INK.gray); }
  rest(s6 + F6, S[5].end - 0.1);

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
