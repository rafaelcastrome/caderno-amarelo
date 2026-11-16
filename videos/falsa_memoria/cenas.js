// "Teste de memória": 12 palavras de sono passam rápido; depois "cama, sono ou carro?". SONO nunca apareceu
// (falsa memória, paradigma DRM). Puxa replay: "volta e confere". Narração Gemini Algieba (3.1, take único).
window.CENAS = function (WB) {
  const { INK, C, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const D = (t0, t1, st) => { const c = sceneOf(t0); WB.draw(c, fr(c, t0), fr(c, t1), st); };
  const W = (t0, t1, txt, x, y, size, cor, o = {}) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o }); };
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const fadeOut = (g, ts, d = 0.25) => WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - ts) / d)).toFixed(3)));
  const st = c => S[c - 1].start;
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });

  // ---------------- título (quadro 0) ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('TESTE DE MEMÓRIA', 540, 320, 112, INK.red, tit, 'middle').strokes);
  pulsa(tit, 540, 290, 0.3, 0.05, 8, 1.4);
  const sub = WB.group();
  WB.showNow(WB.textStrokes('decora as palavras!', 540, 430, 80, INK.blue, sub, 'middle').strokes);
  fadeOut(sub, st(2), 0.25);

  // ---------------- cena 1: as 12 palavras ----------------
  const PAL = ['cama', 'travesseiro', 'cansado', 'sonho', 'cochilo', 'bocejo', 'noite', 'cobertor', 'roncar', 'pijama', 'descanso', 'soneca'];
  const DT = 0.85, T0 = S[0].fala + 0.2, T1 = T0 + PAL.length * DT;
  const card = WB.group();
  WB.mk('rect', { x: 110, y: 640, width: 860, height: 520, rx: 40, fill: '#fffaf0', stroke: INK.black, 'stroke-width': 7 }, card);
  // espiral de caderninho no topo do cartão
  for (let k = 0; k < 9; k++) WB.mk('circle', { cx: 190 + k * 87.5, cy: 640, r: 16, fill: '#fbf5df', stroke: INK.black, 'stroke-width': 5 }, card);
  const q = WB.group(card); WB.showNow(WB.textStrokes('?', 540, 960, 220, INK.gray, q, 'middle').strokes);
  WB.effect(t => q.setAttribute('opacity', t < T0 || t >= T1 ? 1 : 0));
  PAL.forEach((w, k) => {
    const g = WB.group(card), a = T0 + k * DT;
    WB.showNow(WB.textStrokes(w.toUpperCase(), 540, 950, w.length > 9 ? 128 : 150, INK.black, g, 'middle').strokes);
    WB.effect(t => {
      const on = t >= a && t < a + DT - 0.04, u = clamp((t - a) / 0.12);
      g.setAttribute('opacity', on ? 1 : 0);
      g.setAttribute('transform', `translate(540 900) scale(${(0.7 + 0.3 * ease(u)).toFixed(3)}) translate(-540 -900)`);
    });
  });
  // contador e bolinhas de progresso
  const prog = WB.group();
  PAL.forEach((w, k) => {
    const c = WB.mk('circle', { cx: 540 + (k - 5.5) * 56, cy: 1240, r: 16, fill: '#fffaf0', stroke: INK.black, 'stroke-width': 4 }, prog);
    WB.effect(t => c.setAttribute('fill', t >= T0 + k * DT ? INK.red : '#fffaf0'));
  });
  const cardIn = WB.effect(t => {
    const u = 1;
    card.setAttribute('opacity', (u * (1 - clamp((t - st(2)) / 0.3))).toFixed(3));
    prog.setAttribute('opacity', (u * (1 - clamp((t - st(2)) / 0.3))).toFixed(3));
  });
  rest(0.3, st(2) - 0.05);

  // ---------------- cena 2: cama, sono ou carro? ----------------
  const s2 = st(2), F2 = S[1].fala;
  const perg = WB.group();
  W(s2 + 0.2, s2 + 2.9, 'quais tavam na lista?', 540, 470, 84, INK.blue, { parent: perg });
  const OPC = [['CAMA', 760, 3.2], ['SONO', 1010, 4.3], ['CARRO', 1260, 5.25]];
  const caixa = {};
  OPC.forEach(([txt, y, dt]) => {
    const g = WB.group(); caixa[txt] = g;
    WB.mk('rect', { x: 250, y: y - 95, width: 580, height: 170, rx: 30, fill: '#fffaf0', stroke: INK.black, 'stroke-width': 7 }, g);
    WB.showNow(WB.textStrokes(txt, 540, y + 40, 124, INK.black, g, 'middle').strokes);
    const a = s2 + Math.min(dt, F2 - 0.3);
    WB.effect(t => {
      const u = clamp((t - a) / 0.18);
      g.setAttribute('opacity', u.toFixed(3));
      g.setAttribute('transform', `translate(540 ${y}) scale(${(0.6 + 0.4 * ease(u)).toFixed(3)}) translate(-540 ${-y})`);
    });
  });
  // relógio de pensar (3 tiques)
  const rel = WB.group();
  const arco = WB.mk('path', { d: '', fill: 'none', stroke: INK.red, 'stroke-width': 12, 'stroke-linecap': 'round' }, rel);
  WB.mk('circle', { cx: 540, cy: 1520, r: 70, fill: 'none', stroke: INK.gray, 'stroke-width': 5 }, rel);
  const num = [3, 2, 1].map((n, k) => { const g = WB.group(rel); WB.showNow(WB.textStrokes(String(n), 540, 1556, 100, INK.red, g, 'middle').strokes); return g; });
  const R0 = s2 + F2 + 0.25;
  WB.effect(t => {
    const on = t >= R0 - 0.1 && t < st(3);
    rel.setAttribute('opacity', on ? 1 : 0);
    const u = clamp((t - R0) / 1.8), a = -Math.PI / 2 + u * 2 * Math.PI * 0.999;
    const x = 540 + 70 * Math.cos(a), y = 1520 + 70 * Math.sin(a);
    arco.setAttribute('d', u > 0 ? `M 540 1450 A 70 70 0 ${u > 0.5 ? 1 : 0} 1 ${r1(x)} ${r1(y)}` : '');
    num.forEach((g, k) => g.setAttribute('opacity', t >= R0 + 0.6 * k && t < R0 + 0.6 * (k + 1) ? 1 : 0));
  });
  rest(s2 + 3.0, st(3) - 0.05);

  // ---------------- cena 3: cama sim, carro não, e sono...? ----------------
  const s3 = st(3);
  D(s3 + 0.05, s3 + 0.45, [C.check(900, 760, 60, '#15803d')]);
  D(s3 + 1.55, s3 + 1.95, [C.xMark(900, 1260, 50, INK.red)]);
  { // SONO treme/pulsa com "?"
    const g = caixa.SONO;
    const qq = WB.group(); WB.showNow(WB.textStrokes('?', 905, 1050, 130, INK.purple, qq, 'middle').strokes);
    WB.effect(t => qq.setAttribute('opacity', t >= s3 + 2.6 && t < st(4) ? (0.6 + 0.4 * Math.sin((t - s3) * 9)).toFixed(3) : 0));
  }
  const viu = WB.group(); W(s3 + 3.6, s3 + 4.8, 'tu viu, né?', 540, 1560, 92, INK.purple, { parent: viu });
  fadeOut(viu, st(4), 0.15);
  rest(s3 + 4.85, st(4) - 0.05);

  // ---------------- cena 4: SONO NUNCA APARECEU ----------------
  const s4 = st(4);
  const risco = WB.mk('path', { d: 'M 270 1010 L 810 1010', stroke: INK.red, 'stroke-width': 14, 'stroke-linecap': 'round', fill: 'none', opacity: 0 }, WB.overlay);
  WB.effect(t => { const u = clamp((t - s4) / 0.2); risco.setAttribute('opacity', u > 0 ? 1 : 0); risco.setAttribute('d', `M 270 1010 L ${r1(270 + 540 * u)} 1010`); });
  const nunca = WB.group(WB.overlay);
  WB.mk('rect', { x: -270, y: -62, width: 540, height: 100, rx: 12, fill: '#fffaf0', 'fill-opacity': 0.94, stroke: INK.red, 'stroke-width': 9 }, nunca);
  WB.showNow(WB.textStrokes('NUNCA APARECEU!', 0, 16, 74, INK.red, nunca, 'middle').strokes);
  WB.effect(t => {
    const u = clamp((t - s4 - 0.1) / 0.18), sh = t > s4 + 0.28 ? 1 + 0.08 * Math.sin((t - s4) * 16) * Math.exp(-(t - s4 - 0.28) * 4) : 1;
    nunca.setAttribute('opacity', u > 0 ? 1 : 0);
    nunca.setAttribute('transform', `translate(560 1118) rotate(-4) scale(${((1.8 - 0.8 * ease(u)) * sh).toFixed(3)})`);
  });

  // ---------------- cena 5: teu cérebro inventou ----------------
  const s5 = st(5), F5 = S[4].fala;
  const c5 = WB.group();
  W(s5 + 0.1, s5 + 1.9, 'teu cérebro inventou!', 540, 1500, 88, INK.black, { parent: c5 });
  W(s5 + 2.6, s5 + 3.9, '= falsa memória', 540, 1610, 88, INK.blue, { parent: c5 });
  fadeOut(c5, st(6), 0.2);
  rest(s5 + 4.0, st(6) - 0.05);

  // ---------------- cena 6: volta e confere ----------------
  const s6 = st(6), F6 = S[5].fala;
  const fim = WB.group();
  // seta circular de "voltar"
  D(s6 + 0.15, s6 + 0.8, [sp(WB.arcPath(200, 1520, 62, 62, -2.6, 2.2), INK.red, 9, fim), sp(WB.arrowHead(200 + 62 * Math.cos(-2.6), 1520 + 62 * Math.sin(-2.6), -2.6 - Math.PI / 2, 22), INK.red, 9, fim)]);
  W(s6 + 0.85, s6 + 1.9, 'volta e confere!', 600, 1545, 92, INK.red, { parent: fim });
  W(s6 + 2.0, s6 + F6 + 0.4, 'comenta: CAÍ ou NÃO CAÍ', 540, 1650, 74, INK.blue, { parent: fim });
  rest(s6 + F6 + 0.45, S[5].end - 0.1);

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
    const SPOTS = [[290, 1775], [790, 1775], [540, 1792], [300, 1768]];
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
