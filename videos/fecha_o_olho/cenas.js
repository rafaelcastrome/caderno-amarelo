// "Fecha o olho e abre aos 10 segundos" (desafio de tempo, caRdeno Amarelo, 18/11/2026, thread 99).
// Cronômetro gigante corre 20 s em silêncio depois do "Fecha!"; quem abre o olho vê o próprio tempo e comenta.
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala, en = c => S[c - 1].end;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const W = (t0, t1, txt, x, y, size, cor, o = {}) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o }); };
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const pop = (a, b, txt, x, y, size, cor, parent, anchor = 'middle') => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, anchor).strokes);
    WB.effect(t => {
      const u = clamp((t - a) / 0.18), k = t < a ? 0 : (u < 1 ? 0.6 + 0.5 * ease(u) : 1 + 0.1 * Math.exp(-(t - a - 0.18) * 10));
      g.setAttribute('opacity', (t < a ? 0 : 1 - clamp((t - b) / 0.2)).toFixed(3));
      g.setAttribute('transform', `translate(${x} ${y - size * 0.35}) scale(${k.toFixed(3)}) translate(${-x} ${-(y - size * 0.35)})`);
    });
    return g;
  };
  const T0 = fim(2), T1 = st(3);          // cronômetro corre de T0 até T1 (20 s)
  const tempo = t => clamp(t - T0, 0, T1 - T0);

  // ---------- cabeçalho pronto no quadro 0 ----------
  const head = WB.group(WB.overlay);
  WB.showNow(WB.textStrokes('FECHA O OLHO', 540, 170, 124, INK.red, head, 'middle').strokes);
  WB.showNow(WB.textStrokes('e abre quando der 10 segundos', 540, 262, 62, INK.blue, head, 'middle').strokes);
  WB.effect(t => { const k = 1 + 0.035 * Math.sin(t * 5) * Math.exp(-t * 0.3);
    head.setAttribute('transform', `translate(540 150) scale(${k.toFixed(3)}) translate(-540 -150)`);
    head.setAttribute('opacity', (1 - clamp((t - st(5) - 0.1) / 0.3)).toFixed(3)); });

  // ---------- cronômetro ----------
  const cx = 540, cy = 840, R = 280, cron = WB.group();
  WB.mk('circle', { cx, cy, r: R, fill: '#fffaf0' }, cron);
  WB.mk('rect', { x: cx - 45, y: cy - R - 70, width: 90, height: 55, rx: 12, fill: '#fbbf24' }, cron);
  WB.showNow([sp(WB.circlePath(cx, cy, R), INK.black, 10, cron), sp(`M ${cx - 45} ${cy - R - 15} L ${cx - 45} ${cy - R - 70} L ${cx + 45} ${cy - R - 70} L ${cx + 45} ${cy - R - 15}`, INK.black, 7, cron),
    sp(`M ${cx + R * 0.72} ${cy - R * 0.72} l 40 -40`, INK.black, 10, cron)]);
  for (let k = 0; k < 60; k++) { const a = k / 60 * 2 * Math.PI, r0 = k % 5 ? R - 22 : R - 40;
    WB.mk('line', { x1: r1(cx + Math.sin(a) * r0), y1: r1(cy - Math.cos(a) * r0), x2: r1(cx + Math.sin(a) * (R - 10)), y2: r1(cy - Math.cos(a) * (R - 10)), stroke: k % 5 ? '#9ca3af' : INK.black, 'stroke-width': k % 5 ? 3 : 6, 'stroke-linecap': 'round' }, cron); }
  // ponteiro: 1 volta a cada 10 s
  const pont = WB.mk('line', { x1: cx, y1: cy + 30, x2: cx, y2: cy - R + 50, stroke: INK.red, 'stroke-width': 7, 'stroke-linecap': 'round' }, cron);
  WB.mk('circle', { cx, cy, r: 14, fill: INK.red }, cron);
  // dígitos SS,cc (glifos prontos, troca opacidade)
  const POS = [cx - 140, cx - 62, cx + 62, cx + 140], DY = cy + 140, SZ = 130;
  WB.showNow(WB.textStrokes(',', cx, DY, SZ, INK.black, cron, 'middle').strokes);
  const sets = POS.map(x => Array.from({ length: 10 }, (_, d) => { const g = WB.group(cron); WB.showNow(WB.textStrokes(String(d), x, DY, SZ, INK.black, g, 'middle').strokes); return g; }));
  WB.mk('rect', { x: cx - 195, y: DY - 120, width: 390, height: 150, rx: 24, fill: 'none', stroke: '#1f1f24', 'stroke-opacity': 0.25, 'stroke-width': 4 }, cron);
  WB.effect(t => {
    const v = tempo(t), cs = Math.min(1999, Math.floor(v * 100));
    const dig = [Math.floor(cs / 1000), Math.floor(cs / 100) % 10, Math.floor(cs / 10) % 10, cs % 10];
    sets.forEach((s, i) => s.forEach((g, d) => g.setAttribute('opacity', d === dig[i] ? 1 : 0)));
    const ang = v / 10 * 360;
    pont.setAttribute('transform', `rotate(${r1(ang)} ${cx} ${cy})`);
    const k = t > T1 && t < T1 + 0.4 ? 1 + 0.06 * Math.sin((t - T1) * 25) : 1;
    cron.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
    cron.setAttribute('opacity', (1 - clamp((t - st(5) - 0.1) / 0.3)).toFixed(3));
  });

  // ---------- contagem 3, 2, 1, FECHA! ----------
  const s2 = st(2);
  [[0.0, '3'], [1.25, '2'], [2.94, '1']].forEach(([d, n], i, arr) => pop(s2 + d, s2 + (arr[i + 1] ? arr[i + 1][0] : 4.25) - 0.05, n, 540, 1400, 200, INK.purple));
  pop(s2 + 4.28, T0 + 1.6, 'FECHA!', 540, 1400, 170, INK.red);
  // olhinho fechado durante a corrida
  { const g = WB.group(), x = 540, y = 1330;
    WB.showNow([sp(`M ${x - 110} ${y} Q ${x} ${y + 70} ${x + 110} ${y}`, INK.black, 9, g),
      sp(`M ${x - 70} ${y + 30} l -18 32 M ${x} ${y + 36} l 0 36 M ${x + 70} ${y + 30} l 18 32`, INK.black, 7, g)]);
    WB.showNow(WB.textStrokes('z z z', x + 210, y - 40, 56, INK.gray, g, 'middle').strokes);
    WB.effect(t => g.setAttribute('opacity', t > T0 + 1.6 && t < T1 ? (0.85 + 0.15 * Math.sin(t * 3)).toFixed(3) : 0)); }
  rest(st(1) + 0.2, en(1)); rest(s2, T1);

  // ---------- resultado ----------
  const s3 = st(3);
  pop(s3, st(5), 'QUANTO DEU?', 540, 1330, 120, INK.red);
  pop(s3 + 1.0, st(5), 'pausa e olha!', 540, 1440, 70, INK.blue);
  const s4 = st(4);
  const tab = WB.group(); WB.effect(t => tab.setAttribute('opacity', (1 - clamp((t - st(5)) / 0.25)).toFixed(3)));
  W(s4 + 0.05, s4 + 1.3, '10,00 = GÊNIO', 540, 1560, 84, INK.green, { parent: tab });
  W(s4 + 2.1, s4 + 3.6, 'mais de 13 = dormiu', 540, 1670, 76, INK.purple, { parent: tab });
  rest(s3 + 0.1, s4);

  // ---------- CTA ----------
  const s5 = st(5), F5 = S[4].fala;
  W(s5 + 0.1, s5 + 1.2, 'comenta teu tempo', 540, 420, 100, INK.black);
  W(s5 + 1.3, s5 + 2.8, 'quem chega mais perto?', 540, 560, 80, INK.blue);
  W(s5 + 3.0, s5 + 4.3, 'AMANHÃ: 30 segundos', 540, 760, 100, INK.purple);
  { const g = WB.group(), x = 540, y = 960, a = s5 + 4.4;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0);
      const k = on && t < a + 0.25 ? 0.7 + 1.2 * (t - a) : (done && t < a + 1.2 ? 1.08 : 1);
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`); }); }
  rest(s5 + F5, en(5) - 0.1);

  // ---------- @ que passeia ----------
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ2 = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ2 + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ2 / 2 - 10, width: r1(total + 44), height: SZ2 + 20, rx: (SZ2 + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ2 / 2, SZ2, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ2 + 12, SZ2 * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 1790], [790, 1790], [540, 1805], [300, 1780]];
    const HOLD = 4.2, MOVE = 0.8, CYC = HOLD + MOVE;
    WB.effect(t => {
      const n = Math.floor(t / CYC), u = clamp((t - n * CYC - HOLD) / MOVE);
      const a = SPOTS[n % 4], b = SPOTS[(n + 1) % 4], e = ease(u);
      wm.setAttribute('transform', `translate(${r1(lerp(a[0], b[0], e))} ${r1(lerp(a[1], b[1], e) + Math.sin(t * 1.7) * 4)})`);
      wm.setAttribute('opacity', (clamp((t - 0.2) / 0.3) * 0.95).toFixed(3));
    });
  }
};
