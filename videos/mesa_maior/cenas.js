// "Qual mesa é maior?": ilusão das mesas de Shepard. Os dois tampos são o MESMO paralelogramo, girado 57°.
// O tampo da mesa A é recortado, voa, gira e encaixa certinho na mesa B. Narração Gemini Algieba (3.1, take único).
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
  const fadeIn = (g, ts, d = 0.25) => WB.effect(t => g.setAttribute('opacity', clamp((t - ts) / d).toFixed(3)));
  const st = c => S[c - 1].start;
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });

  // ---------------- geometria ----------------
  const L = [140, -378], SH = [151, 41], TH = 60;          // lado comprido, lado curto, giro (graus)
  const rot = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const cantos = (cx, cy, l, s) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [cx + a * l[0] / 2 + b * s[0] / 2, cy + a * l[1] / 2 + b * s[1] / 2]);
  const poly = P => 'M ' + P.map(p => `${r1(p[0])} ${r1(p[1])}`).join(' L ') + ' Z';
  const A = { cx: 285, cy: 900, l: L, s: SH };
  const B = { cx: 768, cy: 1000, l: rot(L, TH * Math.PI / 180), s: rot(SH, TH * Math.PI / 180) };
  const MAD = '#f3d29a', SAIA = '#c98f52', PERNA = '#9b6a3a', TRACO = '#2a2118';
  function mesa(M, parent) {
    const g = WB.group(parent), P = cantos(M.cx, M.cy, M.l, M.s);
    // arestas da frente (normal pra baixo) ganham a "saia" e as pernas
    const frente = [];
    for (let i = 0; i < 4; i++) {
      const a = P[i], b = P[(i + 1) % 4], mx = (a[0] + b[0]) / 2 - M.cx, my = (a[1] + b[1]) / 2 - M.cy;
      if (my > 0) frente.push([a, b]);
    }
    const H = 26, LEG = 175, LW = 22;
    const vs = []; frente.forEach(([a, b]) => { [a, b].forEach(v => { if (!vs.some(u => u[0] === v[0] && u[1] === v[1])) vs.push(v); }); });
    const legs = WB.group(g);
    vs.forEach(v => {
      const x = v[0] + (v[0] < M.cx ? 4 : v[0] > M.cx + 5 ? -LW - 4 : -LW / 2), y = v[1] + H - 4;
      WB.mk('rect', { x: r1(x), y: r1(y), width: LW, height: LEG, rx: 4, fill: PERNA, stroke: TRACO, 'stroke-width': 5 }, legs);
    });
    frente.forEach(([a, b]) => {
      WB.mk('path', { d: poly([a, b, [b[0], b[1] + H], [a[0], a[1] + H]]), fill: SAIA, stroke: TRACO, 'stroke-width': 5, 'stroke-linejoin': 'round' }, g);
    });
    WB.mk('path', { d: poly(P), fill: MAD, stroke: TRACO, 'stroke-width': 6, 'stroke-linejoin': 'round' }, g);
    // veios da madeira (paralelos ao lado comprido)
    for (const k of [-0.25, 0.08, 0.32]) {
      const a = [M.cx + k * M.s[0] - 0.36 * M.l[0], M.cy + k * M.s[1] - 0.36 * M.l[1]];
      const b = [M.cx + k * M.s[0] + 0.30 * M.l[0], M.cy + k * M.s[1] + 0.30 * M.l[1]];
      WB.mk('path', { d: `M ${r1(a[0])} ${r1(a[1])} L ${r1(b[0])} ${r1(b[1])}`, stroke: '#d8ac6a', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, g);
    }
    return { g, P };
  }

  // ---------------- quadro 0: título + mesas + letras ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('QUAL MESA É', 540, 275, 104, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('MAIS COMPRIDA?', 540, 390, 104, INK.red, tit, 'middle').strokes);
  pulsa(tit, 540, 330, 0.3, 0.05, 8, 1.4);
  const mA = mesa(A), mB = mesa(B);
  const letra = (txt, x, y) => { const g = WB.group(); WB.mk('circle', { cx: x, cy: y - 30, r: 52, fill: '#fffaf0', stroke: INK.blue, 'stroke-width': 6 }, g); WB.showNow(WB.textStrokes(txt, x, y, 84, INK.blue, g, 'middle').strokes); return g; };
  letra('A', 285, 1425); letra('B', 768, 1425);

  // ---------------- cena 1: pergunta ----------------
  const c1 = WB.group(); W(0.5, 1.9, 'fala rápido!', 540, 490, 76, INK.blue, { parent: c1 });
  rest(2.0, st(2) - 0.05);

  // ---------------- cena 2: "a da esquerda, né?" ----------------
  const s2 = st(2);
  D(s2 + 0.15, s2 + 0.6, [sp(WB.loopEllipse(285, 1395, 78, 78), INK.red, 8)]);
  const c2 = WB.group(); W(s2 + 0.9, s2 + 1.7, 'tá na cara!', 540, 1580, 92, INK.black, { parent: c2 });
  fadeOut(c2, st(3) + 0.05, 0.2);

  // ---------------- cena 3: recorta o tampo de A (tracejado vermelho) ----------------
  const s3 = st(3);
  const corte = WB.group();
  const PA = mA.P;
  const tr = []; for (let i = 0; i < 4; i++) { const a = PA[i], b = PA[(i + 1) % 4]; tr.push(sp(`M ${r1(a[0])} ${r1(a[1])} L ${r1(b[0])} ${r1(b[1])}`, INK.red, 9, corte)); }
  D(s3 + 0.7, s3 + 2.3, [tr[3], tr[0], tr[1], tr[2]]);
  const c3 = WB.group(); W(s3 + 0.1, s3 + 0.65, 'recortando...', 540, 1580, 80, INK.red, { parent: c3 });
  fadeOut(c3, st(4) + 0.1, 0.2);
  WB.effect(t => corte.setAttribute('opacity', t < st(4) + 0.1 ? 1 : 0));

  // ---------------- cena 4: o tampo voa, gira e encaixa em B ----------------
  const s4 = st(4), VOO0 = s4 + 0.1, VOO1 = s4 + 1.75;
  const copia = WB.mk('g', { opacity: 0 }, WB.overlay);
  const P0 = cantos(0, 0, L, SH);
  WB.mk('path', { d: poly(P0), fill: '#ef4444', 'fill-opacity': 0.42, stroke: INK.red, 'stroke-width': 9, 'stroke-linejoin': 'round' }, copia);
  WB.effect(t => {
    const u = ease(clamp((t - VOO0) / (VOO1 - VOO0)));
    const lift = Math.sin(Math.PI * u) * 230;
    const x = lerp(A.cx, B.cx, u), y = lerp(A.cy, B.cy, u) - lift, a = TH * ease(clamp((t - VOO0 - 0.15) / (VOO1 - VOO0 - 0.3)));
    const k = 1 + 0.05 * Math.sin(Math.PI * u);
    const sh = t > VOO1 ? 1 + 0.05 * Math.sin((t - VOO1) * 14) * Math.exp(-(t - VOO1) * 4) : 1;
    copia.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${a.toFixed(2)}) scale(${(k * sh).toFixed(3)})`);
    copia.setAttribute('opacity', t >= s4 + 0.08 && t < st(6) + 0.3 ? 1 - clamp((t - st(6)) / 0.3) : 0);
  });
  WB.handFollow(VOO0, VOO1 - 0.05, t => {
    const u = ease(clamp((t - VOO0) / (VOO1 - VOO0)));
    return { x: lerp(A.cx, B.cx, u) + 40, y: lerp(A.cy, B.cy, u) - Math.sin(Math.PI * u) * 230 + 10 };
  }, INK.red);
  rest(VOO1 + 0.05, st(5) - 0.05);

  // ---------------- cena 5: IGUALZINHA! ----------------
  const s5 = st(5);
  const igual = WB.group();
  WB.showNow(WB.textStrokes('IGUALZINHA!', 540, 560, 120, INK.red, igual, 'middle').strokes);
  WB.effect(t => {
    const u = clamp((t - s5) / 0.25), w = t > s5 ? 1 + 0.12 * Math.sin((t - s5) * 12) * Math.exp(-(t - s5) * 3) : 0;
    igual.setAttribute('opacity', (u * (1 - clamp((t - st(6)) / 0.2))).toFixed(3));
    igual.setAttribute('transform', `translate(540 520) scale(${(Math.max(0.01, u) * (w || 1)).toFixed(3)}) translate(-540 -520)`);
  });
  const c5 = WB.group(); W(s5 + 1.3, s5 + 2.9, 'mesmo tamanho!', 540, 1580, 98, INK.black, { parent: c5 });
  fadeOut(c5, st(6) + 0.05, 0.2); fadeOut(c1, s5, 0.2);
  rest(s5 + 2.95, st(6) - 0.05);

  // ---------------- cena 6: o cérebro estica a mesa A ----------------
  const s6 = st(6);
  // régua: mesma medida nas duas (lado comprido)
  const regua = (M, cor, parent) => {
    const P = cantos(M.cx, M.cy, M.l, M.s), a = P[3], b = P[2];
    const n = [-(b[1] - a[1]), b[0] - a[0]], ln = Math.hypot(n[0], n[1]), o = 34 * (n[0] < 0 ? -1 : 1);
    const ox = n[0] / ln * o, oy = n[1] / ln * o;
    const x1 = a[0] + ox, y1 = a[1] + oy, x2 = b[0] + ox, y2 = b[1] + oy, ang = Math.atan2(y2 - y1, x2 - x1);
    return [sp(`M ${r1(x1)} ${r1(y1)} L ${r1(x2)} ${r1(y2)}`, cor, 8, parent), sp(WB.arrowHead(x2, y2, ang, 22), cor, 8, parent), sp(WB.arrowHead(x1, y1, ang + Math.PI, 22), cor, 8, parent)];
  };
  const reg = WB.group();
  D(s6 + 0.2, s6 + 0.9, regua(A, INK.purple, reg));
  D(s6 + 1.0, s6 + 1.7, regua(B, INK.purple, reg));
  const c6 = WB.group();
  W(s6 + 1.8, s6 + 2.9, 'o cérebro estica', 540, 1550, 84, INK.black, { parent: c6 });
  W(s6 + 2.95, s6 + 3.8, 'a mesa A sozinho', 540, 1655, 84, INK.purple, { parent: c6 });
  fadeOut(c6, st(7) + 0.05, 0.2);

  // ---------------- cena 7: mede com o dedo ----------------
  const s7 = st(7), F7 = S[6].fala;
  W(s7 + 0.5, s7 + 1.8, 'mede com o dedo!', 540, 1555, 92, INK.red);
  W(s7 + 2.0, s7 + F7, 'acreditou? comenta!', 540, 1665, 80, INK.blue);
  rest(s7 + F7 + 0.05, S[6].end - 0.1);

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
