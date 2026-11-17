// "Fala a cor da letra": Stroop em 3 fases cada vez mais rápidas em voz alta. Narração Gemini Algieba (3.1, take único).
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

  const C = { verm: INK.red, azul: INK.blue, verde: INK.green, roxo: INK.purple, lar: INK.orange, preto: INK.black };
  const FASES = [
    { c: 2, d: 1.3, w: [['CÉU', 'verm'], ['BANANA', 'verde'], ['GRAMA', 'roxo'], ['FOGO', 'azul'], ['MAR', 'lar'], ['TOMATE', 'preto']] },
    { c: 3, d: 1.0, w: [['AZUL', 'verm'], ['VERDE', 'roxo'], ['VERMELHO', 'azul'], ['ROXO', 'verde'], ['PRETO', 'lar'], ['LARANJA', 'preto']] },
    { c: 4, d: 0.75, w: [['ROXO', 'lar'], ['AZUL', 'verm'], ['VERDE', 'verde'], ['PRETO', 'azul'], ['VERMELHO', 'roxo'], ['LARANJA', 'verde'], ['AZUL', 'preto'], ['ROXO', 'roxo']] },
  ];
  const t0f = f => fim(f.c) + 0.2, t1f = f => t0f(f) + f.w.length * f.d;

  // ---------------- título + fases (prontos no quadro 0) ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('FALA A COR DA LETRA', 540, 190, 100, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('não a palavra!', 540, 280, 72, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  FASES.forEach((f, i) => {
    const x = 340 + i * 200, y = 390, g = WB.group();
    const r = WB.mk('rect', { x: x - 85, y: y - 38, width: 170, height: 70, rx: 35, fill: '#fffaf0' }, g);
    WB.showNow([sp(WB.roundRectPath(x - 85, y - 38, 170, 70, 35), INK.black, 5, g)]);
    WB.showNow(WB.textStrokes('fase ' + (i + 1), x, y + 14, 48, INK.black, g, 'middle').strokes);
    WB.effect(t => {
      const ativo = t >= st(f.c) && t < t1f(f) + 0.3, feito = t >= t1f(f);
      r.setAttribute('fill', ativo && !feito ? '#fde68a' : feito ? '#d9f2df' : '#fffaf0');
      const k = ativo && !feito ? 1.1 + 0.04 * Math.sin(t * 6) : 1;
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`);
    });
  });

  // ---------------- cena 1: exemplo ----------------
  rest(0.2, 0.3);
  pop(0.3, st(2) - 0.1, 'BANANA', 540, 860, 200, INK.blue);
  pop(1.6, st(2) - 0.1, 'fala: AZUL', 540, 1060, 96, INK.black);
  const nao = pop(2.7, st(2) - 0.1, 'não: banana', 540, 1190, 76, INK.gray);
  D(3.0, 3.3, [sp('M 360 1165 L 720 1150', INK.red, 9, nao)]);

  // ---------------- fases ----------------
  FASES.forEach((f, i) => {
    const g = WB.group(), c = f.c;
    pop(st(c) + 0.02, t0f(f) - 0.05, 'FASE ' + (i + 1), 540, 880, 190, INK.black, g);
    if (i) pop(st(c) + 0.3, t0f(f) - 0.05, i === 1 ? 'mais rápido!' : 'a mais difícil!', 540, 1060, 90, INK.red, g);
    rest(st(c) + 0.1, t1f(f) + 0.3);
    f.w.forEach(([txt, cor], k) => {
      const a = t0f(f) + k * f.d, b = a + f.d - 0.06;
      pop(a, b, txt, 540, 980, txt.length > 6 ? 180 : 210, C[cor], g);
    });
    // bolinhas de progresso
    const n = f.w.length, gap = 70, x0 = 540 - (n - 1) * gap / 2;
    for (let k = 0; k < n; k++) {
      const x = x0 + k * gap, dot = WB.mk('circle', { cx: x, cy: 1230, r: 18, fill: '#efe7cf', stroke: INK.black, 'stroke-width': 3 }, g);
      WB.effect(t => { const on = t >= t0f(f) - 0.05 && t < t1f(f) + 0.35;
        dot.setAttribute('opacity', on ? 1 : 0); dot.setAttribute('fill', t >= t0f(f) + k * f.d ? INK.orange : '#efe7cf'); });
    }
    pop(t1f(f) + 0.02, t1f(f) + 0.45, 'PASSOU!', 540, 980, 170, INK.green, g);
  });

  // ---------------- cena 5: CTA ----------------
  const s5 = st(5), F5 = S[4].fala;
  W(s5 + 0.1, s5 + F5 * 0.4, 'Até que fase tu chegou?', 540, 760, 96, INK.black);
  { const g = pop(s5 + 0.5, 999, 'FASE __', 540, 990, 190, INK.red); pulsa(g, 540, 930, s5 + 0.7, 0.06, 6, 0.6); }
  W(s5 + F5 * 0.5, s5 + F5 * 0.95, 'manda pro amigo tentar!', 540, 1200, 80, INK.blue);
  rest(s5 + F5, S[4].end - 0.1);

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
