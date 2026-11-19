// "Tu virou PATO": 4 pegadinhas sem resposta; as iniciais das respostas erradas formam P-A-T-O. Narração Gemini Algieba (3.1, take único).
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
  const L8 = [0.0, 1.3, 2.25, 3.05], L9 = [0.15, 0.85, 1.5, 2.3, 3.0];


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

  // ---------------- título + bolinhas ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('RESPONDE EM VOZ ALTA', 540, 190, 104, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('e no final eu te mostro uma coisa', 540, 280, 62, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  const QS = [2, 3, 4, 6], FIMQ = [3, 4, 6, 7];
  const bolas = WB.group();
  QS.forEach((q, i) => {
    const x = 390 + i * 100, y = 390, g = WB.group(bolas);
    const c = WB.mk('circle', { cx: x, cy: y, r: 36, fill: '#fffaf0' }, g);
    WB.showNow([sp(WB.circlePath(x, y, 36), INK.black, 5, g)]);
    WB.showNow(WB.textStrokes(String(i + 1), x, y + 17, 52, INK.black, g, 'middle').strokes);
    WB.effect(t => { const ativo = t >= st(q) && t < st(FIMQ[i]), feito = t >= st(FIMQ[i]);
      c.setAttribute('fill', feito ? '#e5e7eb' : ativo ? '#fde68a' : '#fffaf0');
      const k = ativo ? 1.12 + 0.04 * Math.sin(t * 6) : 1;
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`); });
  });
  WB.effect(t => bolas.setAttribute('opacity', (1 - clamp((t - st(7)) / 0.3)).toFixed(3)));

  // ---------------- 1: gancho ----------------
  rest(0.2, 0.3);
  pop(0.0, st(2) - 0.1, '4 perguntas', 540, 880, 130, INK.black);
  pop(0.0, st(2) - 0.1, 'só vale responder rápido!', 540, 1030, 80, INK.purple);
  { const g = WB.group(); WB.showNow(WB.textStrokes('?', 540, 1330, 260, INK.red, g, 'middle').strokes); pulsa(g, 540, 1240, 0.1, 0.12, 5, 0.3); WB.effect(t => g.setAttribute('opacity', t < st(2) - 0.1 ? 1 : 0)); }
  [2, 3, 5, 6].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.05));
  rest(fim(4) + 0.05, st(5) - 0.05);

  // ---------------- 2: passa o ÚLTIMO ----------------
  const g2 = WB.group(), s2 = st(2);
  W(s2 + 0.02, s2 + 1.3, 'Tu tá numa corrida', 540, 600, 96, INK.black, { parent: g2 });
  W(s2 + 1.3, s2 + 2.5, 'e passa o ÚLTIMO', 540, 705, 100, INK.red, { parent: g2 });
  W(s2 + 2.6, fim(2), 'em que lugar tu fica?', 540, 1150, 84, INK.black, { parent: g2 });
  { const g = WB.group(g2);
    WB.showNow([sp('M 90 1060 L 990 1060', INK.black, 6, g), sp('M 90 900 L 990 900', INK.black, 3, g)]);
    img(window.ICONES.chegada, 930, 960, 120, g);
    const a = WB.group(g); img(window.ICONES.corre, 0, 0, 120, a);
    const b = WB.group(g); img(window.ICONES.corre, 0, 0, 140, b);
    WB.effect(t => { g.setAttribute('opacity', t >= s2 + 0.3 ? 1 : 0);
      a.setAttribute('transform', `translate(${r1(330 + 30 * clamp((t - s2) / 6))} ${r1(985 + 6 * Math.sin(t * 14))}) scale(-1 1)`);
      b.setAttribute('transform', `translate(${r1(650 + 30 * clamp((t - s2) / 6))} ${r1(975 + 6 * Math.sin(t * 15 + 1))}) scale(-1 1)`); });
    pop(s2 + 1.4, 999, 'ÚLTIMO', 330, 905, 52, INK.red, g);
    pop(s2 + 1.6, 999, 'TU', 650, 905, 60, INK.blue, g);
  }
  barra(2, 1220, g2); responde(2, 1350, g2);
  fora(g2, st(3));

  // ---------------- 3: filhos da mãe do Juca ----------------
  const g3 = WB.group(), s3 = st(3);
  W(s3 + 0.02, s3 + 1.6, 'A mãe do JUCA', 540, 600, 104, INK.black, { parent: g3 });
  W(s3 + 1.6, s3 + 2.3, 'tem 4 filhos', 540, 705, 90, INK.black, { parent: g3 });
  { const g = WB.group(g3); img(window.ICONES.mae, 540, 860, 170, g); surge(g, s3 + 0.3, 540, 860); }
  const nomes = [['JANEIRO', 2.9], ['FEVEREIRO', 3.6], ['MARÇO', 4.5]];
  nomes.forEach(([n, d], i) => pop(s3 + d, 999, n, 540, 1030 + i * 95, 76, INK.blue, g3));
  pop(s3 + 4.95, 999, 'e o 4º?', 540, 1320, 90, INK.red, g3);
  barra(3, 1380, g3); responde(3, 1500, g3);
  fora(g3, st(4));

  // ---------------- 4: fala TRÊS 5x / bicicleta ----------------
  const g4 = WB.group(), s4 = st(4);
  W(s4 + 0.05, fim(4) - 0.05, 'Fala TRÊS 5x!', 540, 620, 100, INK.black, { parent: g4 });
  for (let k = 0; k < 5; k++) pop(fim(4) + 0.15 + k * 0.4, st(5) + 0.05, 'TRÊS', 540 + (k % 2 ? 110 : -110), 790 + k * 120, 104, k % 2 ? INK.blue : INK.purple, g4);
  fora(g4, st(5));
  const g5 = WB.group(), s5 = st(5);
  WB.effect(t => g5.setAttribute('opacity', t >= s5 ? 1 - clamp((t - st(6)) / 0.25) : 0));
  W(s5 + 0.02, fim(5), 'Quantas rodas tem', 540, 620, 100, INK.black, { parent: g5 });
  pop(s5 + 0.6, 999, 'uma bicicleta?', 540, 730, 100, INK.black, g5);
  { const g = WB.group(g5); img(window.ICONES.bike, 540, 930, 260, g); surge(g, s5 + 0.3, 540, 930); }
  barra(5, 1110, g5); responde(5, 1240, g5);

  // ---------------- 6: galinha ----------------
  const g6 = WB.group(), s6 = st(6);
  W(s6 + 0.05, s6 + 0.7, 'ÚLTIMA!', 540, 600, 110, INK.red, { parent: g6 });
  W(s6 + 0.7, s6 + 2.0, 'a galinha sai do ninho...', 540, 715, 84, INK.black, { parent: g6 });
  W(s6 + 2.0, fim(6), 'o que ela põe primeiro no chão?', 540, 820, 72, INK.black, { parent: g6 });
  { const g = WB.group(g6); img(window.ICONES.ninho, 540, 1040, 220, g); const ga = WB.group(g); img(window.ICONES.galinha, 540, 960, 170, ga);
    surge(g, s6 + 0.6, 540, 1000);
    WB.effect(t => ga.setAttribute('transform', `translate(0 ${r1(-30 * clamp((t - s6 - 1.0) / 0.8))}) rotate(${r1(4 * Math.sin(t * 5))} 540 1040)`)); }
  barra(6, 1220, g6); responde(6, 1350, g6);
  fora(g6, st(7));

  // ---------------- 7: pega a primeira letra ----------------
  const s7 = st(7), g7 = WB.group();
  W(s7 + 0.3, s7 + 1.4, 'Agora pega a', 540, 620, 100, INK.black, { parent: g7 });
  W(s7 + 1.4, s7 + 2.4, '1ª LETRA', 540, 740, 130, INK.red, { parent: g7 });
  W(s7 + 2.4, fim(7), 'de cada resposta tua', 540, 860, 88, INK.black, { parent: g7 });
  WB.effect(t => g7.setAttribute('opacity', (1 - clamp((t - st(8)) / 0.2)).toFixed(3)));

  // ---------------- 8-9: PENÚLTIMO / ABRIL / TRÊS / OVO -> P A T O ----------------
  const s8 = st(8), s9 = st(9), s10 = st(10), s11 = st(11);
  const RESP = ['PENÚLTIMO', 'ABRIL', 'TRÊS', 'OVO'];
  const lista = WB.group();
  WB.effect(t => lista.setAttribute('opacity', t < s8 ? 0 : 1 - clamp((t - s10) / 0.3)));
  const XL = 290, SZ = 118;
  RESP.forEach((w, i) => {
    const y = 620 + i * 140, a = s8 + L8[i], l = w[0], resto = w.slice(1);
    const wl = WB.measure(l, SZ);
    const g = WB.group(lista);
    pop(a, 999, resto, XL + wl + 4, y, SZ, INK.black, g, 'start');
    // letra inicial: fica na lista até o instante dela na cena 9 e "voa" pra linha do PATO
    const lg = WB.group(); const inner = WB.group(lg);
    WB.showNow(WB.textStrokes(l, 0, 0, SZ, INK.red, inner, 'start').strokes);
    const xa = XL, ya = y, xb = 255 + i * 160, yb = 1270, tv = s9 + L9[i];
    WB.effect(t => {
      const u = ease(clamp((t - tv) / 0.45)), k = 1 + 0.75 * u;
      const x = lerp(xa, xb - 40, u), yy = lerp(ya, yb, u) - 120 * Math.sin(Math.PI * u);
      lg.setAttribute('opacity', t < a ? 0 : (t >= s11 ? 1 - clamp((t - s11) / 0.3) : 1));
      lg.setAttribute('transform', `translate(${r1(x)} ${r1(yy)}) scale(${k.toFixed(3)})`);
    });
    // círculo na inicial quando ela é falada na cena 9
    { const cg = WB.group(lista); WB.showNow([sp(WB.circlePath(XL + wl / 2, y - SZ * 0.33, SZ * 0.55), INK.red, 6, cg)]); WB.effect(t => cg.setAttribute('opacity', t >= tv - 0.1 ? 1 : 0)); }
  });
  { // pato + "TU VIROU PATO!"
    const g = WB.group(); img(window.ICONES.pato, 540, 1620, 220, g);
    const a = s9 + L9[4];
    WB.effect(t => { const u = clamp((t - a) / 0.25), on = t >= a && t < s11;
      const k = 0.6 + 0.4 * ease(u) + (t > a + 0.9 && t < a + 1.5 ? 0.08 * Math.sin((t - a - 0.9) * 30) : 0);
      g.setAttribute('opacity', on ? 1 : (t >= s11 ? 0 : 0));
      g.setAttribute('transform', `translate(540 ${r1(1620 - 14 * Math.abs(Math.sin(t * 4)))}) scale(${k.toFixed(3)}) translate(-540 -1620)`); });
    const tx = WB.group(); pop(a, s11, 'TU VIROU PATO!', 540, 1440, 110, INK.purple, tx);
    pulsa(tx, 540, 1400, a + 0.3, 0.06, 7, 0.8);
  }

  // ---------------- 10: respostas certas ----------------
  const certas = [['ninguém passa o último!', 0.0], ['o 4º filho é o JUCA!', 1.5], ['bicicleta tem 2 rodas!', 2.9], ['a galinha põe o PÉ!', 4.4]];
  const gc = WB.group();
  WB.effect(t => gc.setAttribute('opacity', t < s10 ? 0 : 1 - clamp((t - s11) / 0.3)));
  certas.forEach(([txt, d], i) => {
    const y = 640 + i * 120;
    pop(s10 + d, 999, txt, 210, y, 76, INK.green, gc, 'start');
    { const cg = WB.group(gc); WB.showNow([sp(`M 110 ${y - 30} L 135 ${y - 5} L 180 ${y - 60}`, INK.green, 9, cg)]); WB.effect(t => cg.setAttribute('opacity', t >= s10 + d + 0.15 ? 1 : 0)); }
  });

  // ---------------- 11: CTA ----------------
  const F11 = F(11);
  W(s11 + 0.1, s11 + F11 * 0.35, 'Quantas letras tu acertou?', 540, 640, 88, INK.black);
  { const g = pop(s11 + 0.5, 999, '__ de 4', 540, 840, 170, INK.red); pulsa(g, 540, 780, s11 + 0.7, 0.06, 6, 0.6); }
  W(s11 + F11 * 0.4, s11 + F11 * 0.7, 'manda pro amigo', 540, 1040, 100, INK.purple);
  W(s11 + F11 * 0.7, s11 + F11, 'pra ver se ele vira pato 😂'.replace(' 😂', ''), 540, 1150, 76, INK.blue);
  { const g = WB.group(); img(window.ICONES.pato, 540, 1420, 260, g);
    WB.effect(t => { g.setAttribute('opacity', t >= s11 + 0.3 ? 1 : 0); g.setAttribute('transform', `rotate(${r1(6 * Math.sin(t * 5))} 540 1520)`); }); }
  rest(s11 + F11, S[10].end - 0.1);
  rest(s8 - 0.1, s11 - 0.1);

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
