// "Página 27": escolhe 4 números (um de cada fileira, cada um de uma cor), soma -> sempre 27 = número da página,
// que está no canto da folha desde o quadro 0. Narração Gemini Algieba (3.1, take único).
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
  const st = c => S[c - 1].start, fim = c => S[c - 1].start + S[c - 1].fala;
  const flash = (a, b, txt, x, y, size, cor, parent) => {
    const g = WB.group(parent); WB.showNow(WB.textStrokes(txt, x, y, size, cor, g, 'middle').strokes);
    WB.effect(t => g.setAttribute('opacity', (clamp((t - a) / 0.12) * (1 - clamp((t - b) / 0.12))).toFixed(3))); return g;
  };
  const pulsa = (g, cx, cy, a, amp = 0.08, vel = 9, dec = 2) => WB.effect(t => {
    const k = t > a ? 1 + amp * Math.sin((t - a) * vel) * Math.exp(-(t - a) * dec) : 1;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
  });

  // ---------------- número da página (canto, desde o quadro 0) ----------------
  const PX = 905, PY = 185;
  const pag = WB.group();
  WB.showNow(WB.textStrokes('pág.', PX - 18, PY, 46, INK.gray, pag, 'end').strokes);
  const n27 = WB.group(pag);
  WB.showNow(WB.textStrokes('27', PX, PY, 58, INK.gray, n27, 'start').strokes);
  WB.showNow([sp(`M ${PX - 110} ${PY + 16} L ${PX + 85} ${PY + 16}`, INK.gray, 3, pag)]);
  WB.showNow(WB.textStrokes('Data: ___/___/___', 90, PY, 46, INK.gray, pag, 'start').strokes);

  // ---------------- título ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('ESCOLHE 4 NÚMEROS', 540, 310, 108, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('e eu já sei quanto vai dar!', 540, 395, 68, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 300, 0.4, 0.05, 8, 1.5);

  // ---------------- grade 4x4 (cada coluna uma cor) ----------------
  const G = [[6, 9, 4, 5], [12, 15, 10, 11], [4, 7, 2, 3], [5, 8, 3, 4]];
  const COR = ['#1d4ed8', '#15803d', '#7c3aed', '#ea580c'];
  const FUN = ['#bfdbfe', '#bbf7d0', '#ddd6fe', '#fed7aa'];
  const CS = 190, GAP = 16, X0 = (1080 - 4 * CS - 3 * GAP) / 2, Y0 = 470;
  const pos = (i, j) => ({ x: X0 + j * (CS + GAP) + CS / 2, y: Y0 + i * (CS + GAP) + CS / 2 });
  const grade = WB.group();
  G.forEach((row, i) => row.forEach((v, j) => {
    const p = pos(i, j), g = WB.group(grade), h = CS / 2 - 3;
    WB.mk('rect', { x: p.x - h, y: p.y - h, width: 2 * h, height: 2 * h, rx: 22, fill: FUN[j] }, g);
    WB.showNow([sp(WB.roundRectPath(p.x - h, p.y - h, 2 * h, 2 * h, 22), COR[j], 6, g)]);
    WB.showNow(WB.textStrokes(String(v), p.x, p.y + 42, 124, INK.black, g, 'middle').strokes);
  }));

  // ---------------- cena 1: gancho ----------------
  rest(0.2, 0.3);
  flash(0.0, st(2), 'livre, do jeito que tu quiser', 540, 1400, 70, INK.purple);

  // ---------------- cena 2: regra + demonstração ----------------
  const s2 = st(2), F2 = S[1].fala, DEMO = 3.55;
  const r2 = WB.group();
  W(s2 + 0.1, s2 + 1.3, '1 de cada fileira', 540, 1385, 86, INK.black, { parent: r2 });
  W(s2 + 1.5, s2 + 3.2, 'cada um de uma COR', 540, 1490, 86, INK.blue, { parent: r2 });
  // setinhas das fileiras
  const fil = WB.group(r2);
  [0, 1, 2, 3].forEach(i => { const y = pos(i, 0).y; D(s2 + 0.2 + i * 0.2, s2 + 0.35 + i * 0.2, [sp(`M 22 ${y} L 62 ${y}`, INK.red, 7, fil), sp(WB.arrowHead(66, y, 0, 16), INK.red, 7, fil)]); });
  const demo = WB.group();
  [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([i, j], k) => {
    const p = pos(i, j), t0 = s2 + DEMO + 0.3 * k;
    D(t0, t0 + 0.26, [sp(WB.loopEllipse(p.x, p.y, 100, 100), INK.red, 9, demo)]);
  });
  fadeOut(demo, st(3) + 0.1, 0.25); fadeOut(r2, st(3) + 0.05, 0.2);

  // ---------------- cena 3: soma + PAUSA ----------------
  const s3 = st(3), F3 = S[2].fala;
  const r3 = WB.group();
  W(s3 + 0.3, s3 + 2.0, 'escolhe os teus 4...', 540, 1385, 84, INK.black, { parent: r3 });
  W(s3 + 2.0, s3 + 2.9, 'e SOMA!', 540, 1495, 104, INK.red, { parent: r3 });
  fadeOut(r3, st(4) - 0.1, 0.2);
  const pausa = WB.group();
  WB.mk('rect', { x: 250, y: 1545, width: 580, height: 150, rx: 75, fill: '#fffaf0', stroke: INK.black, 'stroke-width': 6 }, pausa);
  WB.mk('rect', { x: 300, y: 1582, width: 22, height: 76, rx: 6, fill: INK.black }, pausa);
  WB.mk('rect', { x: 336, y: 1582, width: 22, height: 76, rx: 6, fill: INK.black }, pausa);
  WB.showNow(WB.textStrokes('PAUSA O VÍDEO', 600, 1645, 72, INK.black, pausa, 'middle').strokes);
  WB.effect(t => {
    const on = t >= s3 + 3.0 && t < st(4) - 0.1;
    pausa.setAttribute('opacity', on ? (0.75 + 0.25 * Math.cos((t - s3) * 7)).toFixed(3) : 0);
  });
  rest(s3 + 2.95, st(4) - 0.1);

  // ---------------- cena 4: olha o número da página ----------------
  const s4 = st(4);
  WB.effect(t => grade.setAttribute('opacity', (1 - 0.8 * clamp((t - s4 - 0.6) / 0.4)).toFixed(3)));
  flash(s4 + 0.05, s4 + 0.8, 'Pronto?', 540, 1400, 110, INK.purple);
  const olha = WB.group(); W(s4 + 0.8, s4 + 2.3, 'olha o número da página...', 540, 1400, 74, INK.black, { parent: olha }); fadeOut(olha, st(5), 0.2);
  // seta do meio até o canto
  const seta = WB.group();
  D(s4 + 2.2, s4 + 2.8, [sp(`M 640 1300 Q 960 900 ${PX + 30} ${PY + 60}`, INK.red, 9, seta), sp(WB.arrowHead(PX + 30, PY + 56, -Math.PI / 2 - 0.15, 24), INK.red, 9, seta)]);
  { // círculo pulsando em volta do 27
    const g = WB.group(); const c = WB.mk('circle', { cx: PX + 30, cy: PY - 20, r: 62, fill: 'none', stroke: INK.red, 'stroke-width': 7 }, g);
    WB.effect(t => {
      const on = t >= s4 + 2.8 && t < st(5);
      g.setAttribute('opacity', on ? 1 : 0); c.setAttribute('r', r1(60 + 8 * Math.sin((t - s4) * 10)));
    });
  }
  fadeOut(seta, st(5), 0.2);
  rest(s4 + 2.85, st(5) - 0.05);

  // ---------------- cena 5: VINTE E SETE! ----------------
  const s5 = st(5);
  WB.effect(t => {
    // o 27 do canto fica vermelho e cresce no lugar (continua lá)
    n27.querySelectorAll('path').forEach(p => { if (p.getAttribute('fill') && p.getAttribute('fill') !== 'none') p.setAttribute('fill', t >= s4 + 2.8 ? INK.red : INK.gray); else p.setAttribute('stroke', t >= s4 + 2.8 ? INK.red : INK.gray); });
  });
  const big = WB.group();
  WB.mk('circle', { cx: 0, cy: 0, r: 270, fill: '#fffaf0', stroke: INK.red, 'stroke-width': 10 }, big);
  WB.showNow(WB.textStrokes('27', 0, 130, 380, INK.red, big, 'middle').strokes);
  WB.effect(t => {
    const u = ease(clamp((t - s5) / 0.45));
    const x = lerp(PX + 30, 540, u), y = lerp(PY - 20, 860, u), sc = lerp(0.2, 1, u);
    const w = t > s5 + 0.45 ? 1 + 0.06 * Math.sin((t - s5) * 9) * Math.exp(-(t - s5 - 0.45) * 1.5) : 1;
    big.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) scale(${(sc * w).toFixed(3)})`);
    big.setAttribute('opacity', t >= s5 ? 1 : 0);
  });
  // tudo de baixo some pra revelação
  W(s5 + 0.9, s5 + S[4].fala, 'tava aí desde o começo!', 540, 1310, 80, INK.blue);

  // ---------------- cena 6: duvida? ----------------
  const s6 = st(6), F6 = S[5].fala;
  W(s6 + 0.1, s6 + 0.7, 'Duvida?', 540, 1440, 96, INK.black);
  W(s6 + 0.9, s6 + F6 * 0.6, 'volta e escolhe outros', 540, 1550, 80, INK.black);
  W(s6 + F6 * 0.62, s6 + F6, 'vai dar 27 de novo!', 540, 1660, 92, INK.red);
  rest(s6 + F6 + 0.05, S[5].end - 0.1);

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
    const SPOTS = [[290, 1790], [790, 1790], [540, 1815], [300, 1780]];
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
