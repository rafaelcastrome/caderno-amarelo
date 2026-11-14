// "Teu nome te leva" (contagem de Kruskal), narração Gemini Algieba (3.1, take único).
// Grade 6x7 com números (passos) e 5 desenhos; qualquer nome de 2 a 12 letras termina no COCÔ (casa 34).
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
  const fadeOut = (g, ts, d = 0.25) => WB.effect(t => g.setAttribute('opacity', (1 - clamp((t - ts) / d)).toFixed(3)));
  const janela = (g, a, b, d = 0.2) => WB.effect(t => g.setAttribute('opacity', (clamp((t - a) / d) * (1 - clamp((t - b) / d))).toFixed(3)));
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala;
  const flash = (a, b, txt, x, y, size, cor, parent) => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, 'middle').strokes); janela(g, a, b, 0.12); return g;
  };
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });

  // ---------------- desenhos (centrados em 0,0, raio ~r) ----------------
  const ICON = {
    CORACAO: (g, r) => {
      const d = `M 0 ${r * 0.85} C ${-r * 1.4} ${-r * 0.05} ${-r * 0.6} ${-r * 1.1} 0 ${-r * 0.35} C ${r * 0.6} ${-r * 1.1} ${r * 1.4} ${-r * 0.05} 0 ${r * 0.85} Z`;
      WB.mk('path', { d, fill: '#f6b3b3' }, g); return [sp(d, INK.red, 6, g)];
    },
    ESTRELA: (g, r) => {
      let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? ' L' : 'M'} ${r1(rr * Math.cos(a))} ${r1(rr * Math.sin(a))}`; }
      d += ' Z'; WB.mk('path', { d, fill: '#fde68a' }, g); return [sp(d, INK.orange, 6, g)];
    },
    SOL: (g, r) => {
      const c = WB.circlePath(0, 0, r * 0.5); WB.mk('path', { d: c, fill: '#fde68a' }, g);
      let raios = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; raios += ` M ${r1(Math.cos(a) * r * 0.68)} ${r1(Math.sin(a) * r * 0.68)} L ${r1(Math.cos(a) * r * 0.98)} ${r1(Math.sin(a) * r * 0.98)}`; }
      return [sp(c, INK.orange, 6, g), sp(raios.trim(), INK.orange, 6, g)];
    },
    PIZZA: (g, r) => {
      const d = `M ${-r * 0.8} ${-r * 0.55} Q 0 ${-r * 0.95} ${r * 0.8} ${-r * 0.55} L 0 ${r * 0.9} Z`;
      WB.mk('path', { d, fill: '#fcd9a0' }, g);
      const borda = `M ${-r * 0.8} ${-r * 0.55} Q 0 ${-r * 0.95} ${r * 0.8} ${-r * 0.55}`;
      const pep = [[-0.25, -0.3], [0.25, -0.32], [0, 0.15]].map(([x, y]) => { const c = WB.circlePath(x * r, y * r, r * 0.13); WB.mk('path', { d: c, fill: '#e05a4a' }, g); return sp(c, INK.red, 4, g); });
      return [sp(d, INK.orange, 6, g), sp(borda, '#a16207', 9, g), ...pep];
    },
    COCO: (g, r) => {
      // três camadas arredondadas + pontinha, marrom
      const d = `M ${-r * 0.95} ${r * 0.75} Q ${-r * 1.05} ${r * 0.3} ${-r * 0.6} ${r * 0.22} Q ${-r * 0.8} ${-r * 0.2} ${-r * 0.35} ${-r * 0.3}`
        + ` Q ${-r * 0.45} ${-r * 0.7} 0 ${-r * 0.75} Q ${r * 0.1} ${-r * 1.0} ${-r * 0.05} ${-r * 1.05} Q ${r * 0.45} ${-r * 0.95} ${r * 0.35} ${-r * 0.3}`
        + ` Q ${r * 0.8} ${-r * 0.2} ${r * 0.6} ${r * 0.22} Q ${r * 1.05} ${r * 0.3} ${r * 0.95} ${r * 0.75} Z`;
      WB.mk('path', { d, fill: '#a0703f' }, g);
      const linhas = `M ${-r * 0.55} ${r * 0.24} Q 0 ${r * 0.38} ${r * 0.55} ${r * 0.24} M ${-r * 0.32} ${-r * 0.28} Q 0 ${-r * 0.16} ${r * 0.32} ${-r * 0.28}`;
      return [sp(d, '#5b3a1a', 6, g), sp(linhas, '#5b3a1a', 5, g)];
    },
  };
  const olhos = (g, r) => { // olhinhos fofos no cocô grande
    const s = [];
    [-0.28, 0.28].forEach(x => { const c = WB.circlePath(x * r, r * 0.02, r * 0.14); WB.mk('path', { d: c, fill: '#fff' }, g); s.push(sp(c, '#1f1f24', 5, g)); const p = WB.circlePath(x * r + r * 0.03, r * 0.04, r * 0.06); WB.mk('path', { d: p, fill: '#1f1f24' }, g); });
    s.push(sp(`M ${-r * 0.2} ${r * 0.45} Q 0 ${r * 0.62} ${r * 0.2} ${r * 0.45}`, '#1f1f24', 6, g));
    return s;
  };

  // ---------------- grade ----------------
  const G = [1, 3, 4, 2, 4, 3, 3, 1, 4, 2, 4, 2, 1, 3, 2, 4, 4, 'CORACAO', 1, 4, 2, 3, 1, 1, 2, 'ESTRELA', 2, 3, 4, 'PIZZA', 2, 3, 1, 'COCO', 3, 3, 4, 1, 'SOL', 1, 4, 3];
  const NC = 6, CS = 145, GAP = 8, X0 = 85, Y0 = 340;
  const pos = k => ({ x: X0 + (k % NC) * (CS + GAP) + CS / 2, y: Y0 + Math.floor(k / NC) * (CS + GAP) + CS / 2 });
  const COR = ['#1d4ed8', '#15803d', '#7c3aed', '#0e7490', '#be185d', '#ea580c'];
  const grade = WB.group();
  const cel = [];
  G.forEach((v, k) => {
    const p = pos(k), g = WB.group(grade, `translate(${p.x} ${p.y})`), h = CS / 2 - 3;
    const isIcon = typeof v === 'string';
    const cor = isIcon ? '#8a8a8a' : COR[k % COR.length];
    WB.mk('rect', { x: -h, y: -h, width: 2 * h, height: 2 * h, rx: 18, fill: isIcon ? '#fffdf5' : cor, 'fill-opacity': isIcon ? 1 : 0.14 }, g);
    WB.showNow([sp(WB.roundRectPath(-h, -h, 2 * h, 2 * h, 18), cor, 5, g)]);
    if (isIcon) WB.showNow(ICON[v](g, 46));
    else WB.showNow(WB.textStrokes(String(v), 0, 34, 100, INK.black, g, 'middle').strokes);
    cel.push(g);
  });
  // seta de "começa aqui" na primeira casa
  const comeca = WB.group();
  WB.showNow(WB.textStrokes('começa', 52, 318, 44, INK.red, comeca, 'start').strokes);
  WB.showNow([sp(`M 190 304 Q 215 300 222 330`, INK.red, 5, comeca), sp(WB.arrowHead(222, 334, Math.PI / 2 + 0.2, 16), INK.red, 5, comeca)]);

  // título (pronto no quadro 0)
  const tit = WB.group();
  WB.showNow(WB.textStrokes('TEU NOME TE LEVA', 540, 175, 112, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('até um desenho... e eu sei qual!', 540, 262, 66, INK.blue, tit, 'middle').strokes);

  // ---------------- cena 1: gancho ----------------
  rest(0.2, 0.3);
  flash(0.3, st(2), 'pensa no teu nome...', 540, 1530, 96, INK.purple);
  pulsa(tit, 540, 175, 0.4, 0.05, 8, 1.5);

  // ---------------- cena 2: regra ----------------
  const s2 = st(2), F2 = S[1].fala;
  const r2 = WB.group();
  W(s2 + 0.15, s2 + F2 * 0.4, 'conta as letras do teu nome', 540, 1500, 78, INK.black, { parent: r2 });
  W(s2 + F2 * 0.5, s2 + F2 * 0.95, 'e anda esse tanto de casas', 540, 1610, 78, INK.blue, { parent: r2 });
  fadeOut(r2, st(3) + 0.05, 0.2);

  // ---------------- cena 3: exemplo Ana ----------------
  const s3 = st(3);
  const demo = WB.group();
  W(s3 + 0.5, s3 + 1.4, 'ANA = 3 letras', 540, 1540, 92, INK.purple, { parent: demo });
  const marca = (k, n, t0) => {
    const p = pos(k);
    const g = WB.group(demo);
    WB.mk('circle', { cx: p.x + 48, cy: p.y - 48, r: 24, fill: INK.red }, g);
    WB.showNow(WB.textStrokes(String(n), p.x + 48, p.y - 36, 34, INK.white, g, 'middle').strokes);
    g.setAttribute('opacity', 0); WB.effect(t => g.setAttribute('opacity', t >= t0 ? 1 : 0));
  };
  marca(0, 1, s3 + 2.0); marca(1, 2, s3 + 2.6); marca(2, 3, s3 + 3.2);
  { const p = pos(2); D(s3 + 3.6, s3 + 4.2, [sp(WB.loopEllipse(p.x, p.y, 82, 82), INK.red, 8, demo)]); }
  // pulo de 4 casas: 1..4 em azul nas casas seguintes (a contagem segue na linha de baixo)
  const marcaAz = (k, n, t0) => {
    const p = pos(k), g = WB.group(demo);
    WB.mk('circle', { cx: p.x + 48, cy: p.y - 48, r: 24, fill: INK.blue }, g);
    WB.showNow(WB.textStrokes(String(n), p.x + 48, p.y - 36, 34, INK.white, g, 'middle').strokes);
    g.setAttribute('opacity', 0); WB.effect(t => g.setAttribute('opacity', t >= t0 ? 1 : 0));
  };
  [3, 4, 5, 6].forEach((k, i) => marcaAz(k, i + 1, s3 + 5.0 + i * 0.3));
  { const b = pos(6); D(s3 + 6.2, s3 + 6.65, [sp(WB.loopEllipse(b.x, b.y, 82, 82), INK.blue, 8, demo)]); }
  W(s3 + 6.7, s3 + 7.4, 'e assim vai...', 540, 1650, 80, INK.gray, { parent: demo });
  fadeOut(demo, st(4) + 0.05, 0.25);

  // ---------------- cena 4: para no desenho + PAUSA ----------------
  const s4 = st(4), F4 = S[3].fala;
  const r4 = WB.group();
  W(s4 + 0.2, s4 + F4 * 0.4, 'para quando cair num DESENHO', 540, 1500, 74, INK.red, { parent: r4 });
  fadeOut(r4, st(5) - 0.1, 0.2);
  const pausa = WB.group();
  WB.mk('rect', { x: 250, y: 1555, width: 580, height: 150, rx: 75, fill: '#fffaf0', stroke: INK.black, 'stroke-width': 6 }, pausa);
  WB.mk('rect', { x: 300, y: 1592, width: 22, height: 76, rx: 6, fill: INK.black }, pausa);
  WB.mk('rect', { x: 336, y: 1592, width: 22, height: 76, rx: 6, fill: INK.black }, pausa);
  WB.showNow(WB.textStrokes('PAUSA O VÍDEO', 600, 1655, 72, INK.black, pausa, 'middle').strokes);
  WB.effect(t => {
    const on = t >= s4 + F4 * 0.5 && t < st(5) - 0.1;
    pausa.setAttribute('opacity', on ? (0.75 + 0.25 * Math.cos((t - s4) * 7)).toFixed(3) : 0);
  });
  rest(s4 + F4 * 0.42, st(5) - 0.1);

  // ---------------- cena 5: Pronto? Tu caiu no... (desenhos pulsam) ----------------
  const s5 = st(5);
  const icones = G.map((v, k) => typeof v === 'string' ? k : -1).filter(k => k >= 0);
  WB.effect(t => {
    icones.forEach((k, i) => {
      const p = pos(k);
      const a = s5 + 0.3 + i * 0.12;
      const sc = t > a && t < st(6) ? 1 + 0.12 * Math.max(0, Math.sin((t - a) * 9)) : 1;
      if (k !== 33 || t < st(6)) cel[k].setAttribute('transform', `translate(${p.x} ${p.y}) scale(${sc.toFixed(3)})`);
    });
  });
  flash(s5 + 0.1, st(6), 'tu caiu no...', 540, 1560, 110, INK.purple);

  // ---------------- cena 6: COCÔ! ----------------
  const s6 = st(6);
  WB.effect(t => {
    const u = clamp((t - s6) / 0.45);
    G.forEach((v, k) => cel[k].setAttribute('opacity', (k === 33 ? 1 - u : 1 - 0.88 * u).toFixed(3)));
    comeca.setAttribute('opacity', (1 - u).toFixed(3));
  });
  const big = WB.group();
  const bigIn = WB.group(big);
  WB.mk('circle', { cx: 0, cy: 0, r: 300, fill: '#fffaf0', stroke: INK.black, 'stroke-width': 8 }, bigIn);
  WB.showNow(ICON.COCO(bigIn, 200)); WB.showNow(olhos(bigIn, 200));
  const fedor = [-1, 0, 1].map(i => `M ${i * 110} -230 q 25 -35 0 -70 q -25 -35 0 -70`).join(' ');
  WB.showNow([sp(fedor, '#15803d', 7, bigIn)]);
  WB.effect(t => {
    const u = ease(clamp((t - s6) / 0.4));
    const a = pos(33), x = lerp(a.x, 540, u), y = lerp(a.y, 880, u), sc = lerp(0.24, 1, u);
    const w = t > s6 + 0.4 ? 1 + 0.05 * Math.sin((t - s6) * 8) * Math.exp(-(t - s6 - 0.4) * 1.2) : 1;
    big.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) scale(${(sc * w).toFixed(3)}) rotate(${r1(Math.sin((t - s6) * 3) * 4)})`);
    big.setAttribute('opacity', t >= s6 ? 1 : 0);
  });
  const cc = flash(s6 + 0.3, 999, 'COCÔ!', 540, 1370, 220, '#7a4a1e'); pulsa(cc, 540, 1300, s6 + 0.3, 0.12, 10, 2);

  // ---------------- cena 7: CTA ----------------
  const s7 = st(7), F7 = S[6].fala;
  W(s7 + 0.4, s7 + F7 * 0.7, 'faz com o nome do teu amigo', 540, 1530, 72, INK.black);
  W(s7 + F7 * 0.72, s7 + F7 * 0.98, 'e manda pra ele!', 540, 1640, 92, INK.blue);
  rest(s7 + F7 * 0.99, S[6].end - 0.1);

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
