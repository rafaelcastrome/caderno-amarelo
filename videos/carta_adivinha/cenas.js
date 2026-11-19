// "A carta que adivinha": carta virada desde o quadro 0; (2n+8)/2-n = 4; a carta vira e mostra o 4. Narração Gemini Algieba (3.1, take único).
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
  WB.showNow(WB.textStrokes('PENSA NUM NÚMERO', 540, 190, 108, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('de 1 a 10', 540, 290, 84, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  const s7 = st(7), s8 = st(8), FLIP = s7 - 0.55;

  // ---------------- a carta (virada desde o quadro 0) ----------------
  const CX = 540, CY = 1180, CW = 420, CH = 580;
  const carta = WB.group(), costas = WB.group(carta), frente = WB.group(carta);
  const box = `M ${-CW / 2 + 36} ${-CH / 2} h ${CW - 72} q 36 0 36 36 v ${CH - 72} q 0 36 -36 36 h ${-(CW - 72)} q -36 0 -36 -36 v ${-(CH - 72)} q 0 -36 36 -36 Z`;
  { // costas: azul com losangos + "?"
    WB.mk('path', { d: box, fill: '#2f5fbf' }, costas);
    const inner = `M ${-CW / 2 + 50} ${-CH / 2 + 26} h ${CW - 100} q 24 0 24 24 v ${CH - 100} q 0 24 -24 24 h ${-(CW - 100)} q -24 0 -24 -24 v ${-(CH - 100)} q 0 -24 24 -24 Z`;
    WB.showNow([sp(box, INK.black, 7, costas), sp(inner, '#ffffff', 5, costas)]);
    let d = '';
    for (let yy = -CH / 2 + 70; yy < CH / 2 - 40; yy += 70) for (let xx = -CW / 2 + 70; xx < CW / 2 - 40; xx += 70)
      d += `M ${xx} ${yy - 22} L ${xx + 22} ${yy} L ${xx} ${yy + 22} L ${xx - 22} ${yy} Z `;
    WB.mk('path', { d, fill: 'none', stroke: '#9cb8f0', 'stroke-width': 3 }, costas);
    WB.mk('circle', { cx: 0, cy: -10, r: 110, fill: '#fffaf0' }, costas);
    WB.showNow(WB.textStrokes('?', 0, 50, 200, INK.red, costas, 'middle').strokes);
  }
  { // frente: o 4
    WB.mk('path', { d: box, fill: '#fffaf0' }, frente);
    WB.showNow([sp(box, INK.red, 8, frente)]);
    WB.showNow(WB.textStrokes('TEU NÚMERO', 0, -CH / 2 + 90, 54, INK.blue, frente, 'middle').strokes);
    WB.showNow(WB.textStrokes('4', 0, 150, 380, INK.red, frente, 'middle').strokes);
  }
  WB.effect(t => {
    const u = clamp((t - FLIP) / 0.5), sx = Math.abs(Math.cos(Math.PI * u)), face = u >= 0.5;
    costas.setAttribute('opacity', face ? 0 : 1); frente.setAttribute('opacity', face ? 1 : 0);
    let k = 1, y = CY + 8 * Math.sin(t * 2), x = CX, rot = 2 * Math.sin(t * 1.3);
    if (t > FLIP - 1.0 && t < FLIP) rot = 3 * Math.sin(t * 40) * clamp((t - FLIP + 1.0)); // treme no rufar
    if (face) { const v = clamp((t - FLIP - 0.25) / 0.3); k = 1 + 0.12 * Math.sin(Math.PI * v); rot = 0; }
    if (t >= s8) { const w = ease(clamp((t - s8) / 0.5)); k = lerp(1, 0.55, w); y = lerp(CY, 760, w); }
    carta.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)}) scale(${(k * Math.max(sx, 0.02)).toFixed(3)} ${k.toFixed(3)})`);
  });
  { const g = WB.group(); WB.showNow(WB.textStrokes('já escrevi aqui!', 540, 1560, 70, INK.purple, g, 'middle').strokes);
    WB.effect(t => g.setAttribute('opacity', t >= 3.0 && t < st(2) ? 1 : 0)); }

  // ---------------- passos ----------------
  const PASSOS = [[2, 'DOBRA', '× 2'], [3, 'SOMA 8', '+ 8'], [4, 'METADE', '÷ 2'], [5, 'TIRA O QUE PENSOU', '']];
  const gp = WB.group();
  WB.effect(t => gp.setAttribute('opacity', t >= FLIP ? 1 - clamp((t - FLIP) / 0.3) : 1));
  pop(0.3, st(2), '1, 2, 3... 10', 540, 620, 96, INK.black, gp);
  PASSOS.forEach(([c, txt, sim], i) => {
    const y = 540 + i * 100, a = st(c) + 0.3;
    const g = WB.group(gp);
    pop(a, 999, (i + 1) + '. ' + txt, 200, y, 78, INK.black, g, 'start');
    if (sim) pop(a + 0.2, 999, sim, 880, y, 84, INK.red, g, 'middle');
  });
  pop(st(6) + 0.2, FLIP, 'guarda o resultado!', 540, 1560, 72, INK.purple, gp);
  [2, 3, 4, 5].forEach(c => rest(fim(c) + 0.05, st(c + 1) - 0.05));
  rest(0.2, 0.3);

  // ---------------- 7: deu quatro ----------------
  { const g = WB.group(); img(window.ICONES.exploda, 860, 900, 170, g); surge(g, FLIP + 0.5, 860, 900);
    WB.effect(t => { if (t >= s8) g.setAttribute('opacity', 0); }); }
  { const g = WB.group(); pop(s7 + 0.05, s8, 'DEU 4, NÉ?', 540, 640, 130, INK.red, g); }

  // ---------------- 8: CTA ----------------
  const F8 = F(8);
  W(s8 + 0.4, s8 + F8 * 0.35, 'como a carta sabia?', 540, 1100, 92, INK.black);
  W(s8 + F8 * 0.38, s8 + F8 * 0.62, 'faz com teu amigo!', 540, 1230, 96, INK.purple);
  { const g = WB.group(), x = 540, y = 1420, a = s8 + F8 * 0.66;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0);
      const k = on && t < a + 0.25 ? 0.7 + 1.2 * (t - a) : (done && t < a + 1.2 ? 1.08 : 1);
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`); });
    pop(a + 0.3, 999, 'amanhã: mágica nova!', 540, 1580, 76, INK.red); }
  rest(s8 + F8, S[7].end - 0.1);

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
