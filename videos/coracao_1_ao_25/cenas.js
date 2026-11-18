// "Desenho escondido no 1 ao 25": grade 7x7 (1 a 49), acha do 1 ao 25 em 30 s; as casas do 1 ao 25 formam
// dois corações (um dentro do outro). Narração Gemini Algieba (3.1, take único). Grade em grade.js.
window.CENAS = function (WB) {
  const { INK, clamp, lerp, ease } = WB;
  const S = WB.scenes;
  const sceneOf = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].start) i++; return i + 1; };
  const fr = (c, t) => (t - S[c - 1].start) / (S[c - 1].end - S[c - 1].start);
  const W = (t0, t1, txt, x, y, size, cor, o = {}) => { const c = sceneOf(t0); return WB.write(c, fr(c, t0), fr(c, t1), txt, x, y, size, cor, { anchor: 'middle', ...o }); };
  const rest = (t0, t1) => { const c = sceneOf(t0); WB.restHand(c, fr(c, t0), fr(c, t1)); };
  const r1 = n => Math.round(n * 10) / 10;
  const sp = (d, cor = INK.black, w = 6, parent) => WB.strokePath(d, cor, w, parent);
  const janela = (g, a, b, d = 0.2) => WB.effect(t => g.setAttribute('opacity', (clamp((t - a) / d) * (1 - clamp((t - b) / d))).toFixed(3)));
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala, F = c => S[c - 1].fala;
  const flash = (a, b, txt, x, y, size, cor, parent) => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, 'middle').strokes); janela(g, a, b, 0.12); return g;
  };
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });

  const DUR = 30;
  const T = st(2) + F(2) + 0.05, T_END = T + DUR;
  const R0 = st(12) + 0.9;                      // casas acendendo (igual ao audio.py)

  // ===================== GRADE 7x7 =====================
  const N = 7, CS = 128, GAP = 10, X0 = 62, Y0 = 430;
  const GX = X0 + (N * CS + (N - 1) * GAP) / 2, GY = Y0 + (N * CS + (N - 1) * GAP) / 2;
  const COR = ['#d62828', '#1d4ed8', '#15803d', '#ea580c', '#7c3aed', '#0e7490', '#be185d', '#a16207'];
  const grade = WB.group(), inner = WB.group(grade);
  const casas = {};
  window.GRADE.grade.forEach((linha, r) => linha.forEach((n, c) => {
    const x = X0 + c * (CS + GAP) + CS / 2, y = Y0 + r * (CS + GAP) + CS / 2, cor = COR[(n * 5 + r) % COR.length];
    const g = WB.group(inner, `translate(${x} ${y})`), h = CS / 2 - 3;
    const bg = WB.mk('rect', { x: -h, y: -h, width: 2 * h, height: 2 * h, rx: 18, fill: cor, 'fill-opacity': 0.18 }, g);
    const contorno = WB.group(g); WB.showNow([sp(WB.roundRectPath(-h, -h, 2 * h, 2 * h, 18), cor, 5, contorno)]);
    const tx = WB.group(g); WB.showNow(WB.textStrokes(String(n), 0, 27, 80, INK.black, tx, 'middle').strokes);
    casas[n] = { g, bg, contorno, tx, x, y, cor };
  }));
  // visibilidade da grade: some no "Preparado?", volta no "Valendo!", apaga no TEMPO, volta na revelação
  const prep = st(2) + 2.6;
  WB.effect(t => {
    let o = 1;
    if (t > prep && t < T) o = 1 - 0.92 * clamp((t - prep) / 0.25);
    if (t >= T) o = 0.08 + 0.92 * clamp((t - T) / 0.12);
    if (t >= T_END) o = 1 - 0.85 * clamp((t - T_END) / 0.2);
    if (t >= st(12)) o = 0.15 + 0.85 * clamp((t - st(12)) / 0.3);
    grade.setAttribute('opacity', o.toFixed(3));
  });
  // revelação: os números de fora apagam e as casas 1..25 acendem em ordem
  const ANEL = window.GRADE.anel;
  WB.effect(t => {
    const apaga = clamp((t - st(12) - 0.2) / 0.5), some = clamp((t - st(13)) / 0.4);
    for (let n = 1; n <= 49; n++) {
      const k = casas[n];
      if (n > 25) { k.g.setAttribute('opacity', (1 - 0.82 * apaga - 0.13 * some).toFixed(3)); continue; }
      const a = R0 + (n - 1) * 0.09, on = t >= a, u = clamp((t - a) / 0.15);
      const cheio = ANEL[n] === 0 ? '#e11d48' : '#fb7185';
      k.bg.setAttribute('fill', on ? cheio : k.cor);
      k.bg.setAttribute('fill-opacity', on ? (0.25 + 0.7 * u).toFixed(3) : 0.18);
      k.contorno.setAttribute('opacity', on ? (1 - u).toFixed(3) : 1);
      k.tx.setAttribute('opacity', on ? (1 - 0.6 * u).toFixed(3) : 1);
      const s = on ? 1 + 0.25 * Math.exp(-(t - a) * 10) : 1;
      k.g.setAttribute('transform', `translate(${k.x} ${k.y}) scale(${s.toFixed(3)})`);
    }
    // coração batendo depois de completo
    const b0 = st(13);
    const bat = t > b0 ? 1 + 0.045 * Math.max(0, Math.sin((t - b0) * Math.PI * 2.2)) ** 6 : 1;
    inner.setAttribute('transform', `translate(${GX} ${GY}) scale(${bat.toFixed(3)}) translate(${-GX} ${-GY})`);
  });

  // ===================== TOPO: título (até T) e cronômetro =====================
  const tit = WB.group();
  WB.showNow(WB.textStrokes('ACHA DO 1 AO 25', 540, 200, 120, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('teu olho vai desenhar uma coisa', 540, 310, 66, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 190, 0.3, 0.04, 8, 1.5);
  WB.effect(t => tit.setAttribute('opacity', (1 - clamp((t - T + 0.3) / 0.3)).toFixed(3)));

  const crono = WB.group();
  const RX = 250, RY = 250, RR = 62;
  WB.showNow([sp(WB.circlePath(RX, RY, RR), INK.black, 8, crono),
    sp(`M ${RX - 16} ${RY - RR - 22} L ${RX + 16} ${RY - RR - 22} M ${RX} ${RY - RR - 22} L ${RX} ${RY - RR}`, INK.black, 8, crono)]);
  const ponteiro = WB.mk('path', { d: `M ${RX} ${RY} L ${RX} ${RY - RR + 14}`, stroke: INK.red, 'stroke-width': 8, 'stroke-linecap': 'round', fill: 'none' }, crono);
  const digs = [];
  for (let s = DUR; s >= 0; s--) {
    const g = WB.group(crono);
    WB.showNow(WB.textStrokes('00:' + String(s).padStart(2, '0'), 580, 292, 150, s <= 10 ? INK.red : INK.black, g, 'middle').strokes);
    g.setAttribute('opacity', 0); digs[s] = g;
  }
  const BX0 = 150, BX1 = 930, BY = 345;
  WB.showNow([sp(WB.roundRectPath(BX0, BY, BX1 - BX0, 26, 13), INK.black, 4, crono)]);
  const barra = WB.mk('rect', { x: BX0 + 4, y: BY + 4, width: BX1 - BX0 - 8, height: 18, rx: 9, fill: INK.green }, crono);
  WB.effect(t => {
    crono.setAttribute('opacity', (clamp((t - T + 0.3) / 0.3) * (1 - clamp((t - st(12)) / 0.3))).toFixed(3));
    const el = clamp(t - T, 0, DUR), rst = DUR - el;
    const s = t < T ? DUR : Math.max(0, Math.ceil(DUR - (t - T) - 1e-6));
    digs.forEach((g, i) => g.setAttribute('opacity', i === s ? 1 : 0));
    ponteiro.setAttribute('transform', `rotate(${r1(el / DUR * 360)} ${RX} ${RY})`);
    barra.setAttribute('width', r1(Math.max(0, (BX1 - BX0 - 8) * rst / DUR)));
    barra.setAttribute('fill', rst > 10 ? INK.green : rst > 5 ? INK.orange : INK.red);
    const k = rst <= 10 && t < T_END ? 1 + 0.05 * Math.max(0, Math.cos((t - T) * Math.PI * 2)) ** 8 : 1;
    digs[s].setAttribute('transform', `translate(580 240) scale(${k.toFixed(3)}) translate(-580 -240)`);
  });
  const lembrete = WB.group();
  WB.showNow(WB.textStrokes('do 1 ao 25, na ordem', 540, 1470, 62, INK.gray, lembrete, 'middle').strokes);
  janela(lembrete, T - 0.1, T_END, 0.2);

  // ===================== CENA 1: gancho =====================
  rest(0.1, 0.3);
  { const g = WB.group(); W(0.3, F(1) * 0.5, 'na ORDEM!', 540, 1540, 110, INK.red, { parent: g });
    W(F(1) * 0.5, F(1) - 0.1, 'e no final... surpresa', 540, 1660, 80, INK.purple, { parent: g });
    WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - st(2)) / 0.25)).toFixed(3))); }
  rest(fim(1), st(2) + 0.1);

  // ===================== CENA 2: até 49, 3-2-1, valendo =====================
  const s2 = st(2);
  flash(s2 + 0.05, prep - 0.05, 'tem número até 49!', 540, 1540, 90, INK.purple);
  flash(prep, T, 'Preparado?', 540, 640, 130, INK.black);
  const nums = [['3', s2 + 3.85], ['2', s2 + 4.8], ['1', s2 + 5.78]];
  nums.forEach(([n, a], i) => {
    const b = i < 2 ? nums[i + 1][1] - 0.05 : s2 + 6.6;
    const g = flash(a, b, n, 540, 1150, 420, INK.red); pulsa(g, 540, 1000, a, 0.12, 10, 3);
  });
  const val = flash(s2 + 6.6, T - 0.02, 'VALENDO!', 540, 1060, 190, INK.green); pulsa(val, 540, 1000, s2 + 6.6, 0.1, 10, 3);

  // ===================== torcida =====================
  flash(st(3), st(3) + 2.2, 'VAI! VAI! VAI!', 540, 1590, 110, INK.blue);
  flash(st(4), st(4) + 2.3, 'METADE DO TEMPO!', 540, 1590, 100, INK.orange);
  flash(st(5), st(6) - 0.1, '10 SEGUNDOS!', 540, 1590, 110, INK.red);
  for (let c = 6; c <= 10; c++) { const g = flash(st(c), st(c) + 0.9, String(11 - c), 540, 1640, 170, INK.red); pulsa(g, 540, 1580, st(c), 0.15, 10, 3); }

  // ===================== CENA 11: TEMPO! =====================
  const s11 = st(11);
  const tp = WB.group();
  WB.mk('rect', { x: 120, y: 700, width: 840, height: 330, rx: 40, fill: '#fffaf0', stroke: INK.red, 'stroke-width': 10 }, tp);
  WB.showNow(WB.textStrokes('TEMPO!', 540, 930, 230, INK.red, tp, 'middle').strokes);
  janela(tp, s11, S[10].end, 0.08);
  WB.effect(t => { const k = t > s11 ? 1 + 0.25 * Math.exp(-(t - s11) * 9) : 1; tp.setAttribute('transform', `translate(540 865) scale(${k.toFixed(3)}) rotate(${(-4 * (t > s11)).toFixed(1)}) translate(-540 -865)`); });

  // ===================== CENA 12: as casas que tu achou =====================
  const s12 = st(12);
  { const g = WB.group(); W(s12 + 0.05, s12 + 0.85, 'olha as casas', 540, 200, 100, INK.black, { parent: g });
    W(s12 + 0.85, fim(12), 'do 1 ao 25...', 540, 320, 100, INK.red, { parent: g });
    WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - st(14)) / 0.25)).toFixed(3))); }
  rest(fim(12), st(13) + 0.1);

  // ===================== CENA 13: um coração! =====================
  const s13 = st(13);
  const cor13 = WB.group();
  { const g = WB.group(cor13); WB.showNow(WB.textStrokes('UM CORAÇÃO!', 540, 1560, 130, '#e11d48', g, 'middle').strokes);
    janela(g, s13, 999, 0.1); pulsa(g, 540, 1510, s13, 0.12, 10, 2.5); }
  flash(s13 + 1.4, 999, 'e outro dentro dele!', 540, 1680, 80, INK.purple, cor13);
  WB.effect(t => cor13.setAttribute('opacity', (1 - clamp((t - st(14)) / 0.25)).toFixed(3)));

  // ===================== CENA 14: comenta + manda =====================
  const s14 = st(14), F14 = F(14);
  const g14 = WB.group();
  W(s14 + 0.05, s14 + F14 * 0.25, 'Até qual número', 540, 200, 100, INK.black, { parent: g14 });
  W(s14 + F14 * 0.25, s14 + F14 * 0.4, 'tu chegou?', 540, 320, 100, INK.black, { parent: g14 });
  W(s14 + F14 * 0.42, s14 + F14 * 0.62, 'comenta teu número', 540, 1540, 84, INK.blue, { parent: g14 });
  W(s14 + F14 * 0.64, s14 + F14 * 0.98, 'manda pra quem tu pensou', 540, 1660, 84, '#e11d48', { parent: g14 });
  WB.effect(t => g14.setAttribute('opacity', (1 - clamp((t - st(15)) / 0.25)).toFixed(3)));

  // ===================== CENA 15: amanhã outro desenho + seguir =====================
  const s15 = st(15), F15 = F(15);
  W(s15 + 0.05, s15 + F15 * 0.55, 'AMANHÃ: OUTRO DESENHO', 540, 250, 96, INK.purple);
  { const g = WB.group(), x = 540, y = 1600, a = s15 + F15 * 0.6;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0);
      const k = on && t < a + 0.25 ? 0.7 + 1.2 * (t - a) : (done && t < a + 1.2 ? 1.08 : 1);
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`); }); }
  rest(s15 + F15 * 0.56, S[14].end - 0.1);

  // ===================== marca d'água que passeia =====================
  {
    const wm = WB.mk('g', { opacity: 0 }, WB.overlay);
    const SZ = 40, fs = 36, handle = '@' + WB.projeto.marca.handle;
    const tw = WB.measure(handle, fs), total = SZ + 12 + tw;
    WB.mk('rect', { x: r1(-total / 2 - 22), y: -SZ / 2 - 10, width: r1(total + 44), height: SZ + 20, rx: (SZ + 20) / 2,
      fill: '#fffaf0', 'fill-opacity': 0.92, stroke: '#1f1f24', 'stroke-opacity': 0.3, 'stroke-width': 2 }, wm);
    const ic = WB.notebookIcon(-total / 2, -SZ / 2, SZ, wm, 4);
    ic.bg.setAttribute('fill-opacity', 1); WB.showNow([ic.outline, ic.rest]);
    WB.showNow(WB.textStrokes(handle, -total / 2 + SZ + 12, SZ * 0.28, fs, INK.black, wm).strokes);
    const SPOTS = [[290, 1780], [790, 1780], [540, 1800], [300, 1770]];
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
