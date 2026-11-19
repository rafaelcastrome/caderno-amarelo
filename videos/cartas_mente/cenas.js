// "Cartas que leem a mente": 4 cartas binárias; a pessoa soma os cantos vermelhos e acha o próprio número. Narração Gemini Algieba (3.1, take único).
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
  WB.showNow(WB.textStrokes('de 1 a 15', 540, 290, 84, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);

  // ---------------- cartas ----------------
  const CARTAS = [
    [1, 9, 5, 13, 3, 15, 7, 11],
    [2, 11, 6, 15, 10, 3, 14, 7],
    [4, 13, 7, 12, 15, 6, 14, 5],
    [8, 14, 11, 9, 13, 10, 15, 12]];
  const CORES = [INK.blue, INK.purple, INK.green, INK.orange || '#ea7a1c'];
  const FUNDOS = ['#e8f0ff', '#f1e9ff', '#e6f6ea', '#fff0e0'];
  const CW = 760, CH = 470;
  const s3 = st(3), s7 = st(7), s9 = st(9), s10 = st(10);
  const BIG = [540, 900], SMALL = [[300, 820], [780, 820], [300, 1130], [780, 1130]], KS = 0.56;
  const cartas = CARTAS.map((nums, i) => {
    const g = WB.group(), c = WB.group(g);
    const box = `M ${-CW / 2 + 30} ${-CH / 2} h ${CW - 60} q 30 0 30 30 v ${CH - 60} q 0 30 -30 30 h ${-(CW - 60)} q -30 0 -30 -30 v ${-(CH - 60)} q 0 -30 30 -30 Z`;
    WB.mk('path', { d: box, fill: FUNDOS[i] }, c);
    WB.showNow([sp(box, CORES[i], 8, c)]);
    WB.showNow(WB.textStrokes('CARTA ' + (i + 1), 0, -CH / 2 + 70, 56, CORES[i], c, 'middle').strokes);
    nums.forEach((n, k) => {
      const col = k % 4, row = Math.floor(k / 4);
      const x = -CW / 2 + 115 + col * 177, y = -CH / 2 + 220 + row * 150;
      if (k === 0) { WB.mk('circle', { cx: x, cy: y - 38, r: 62, fill: '#fde2e2' }, c); }
      WB.showNow(WB.textStrokes(String(n), x, y, 120, k === 0 ? INK.red : INK.black, c, 'middle').strokes);
    });
    const a = st(3 + i);
    WB.effect(t => {
      // aparece grande na cena dela; some quando a próxima chega; volta pequena na cena 7
      let op = 0, x = BIG[0], y = BIG[1], k = 1, rot = 0;
      if (t >= a && t < (i < 3 ? st(4 + i) : s7)) {
        const u = ease(clamp((t - a) / 0.35)); op = 1; k = 0.75 + 0.25 * u; rot = (1 - u) * (i % 2 ? 8 : -8);
        y = BIG[1] + 4 * Math.sin(t * 2);
        if (i < 3) { const v = clamp((t - (st(4 + i) - 0.25)) / 0.25); x = lerp(BIG[0], -500, ease(v)); }
      } else if (t >= s7 && t < s10) {
        const u = ease(clamp((t - s7 - i * 0.12) / 0.45)); op = t >= s7 + i * 0.12 ? 1 : 0;
        x = lerp(BIG[0], SMALL[i][0], u); y = lerp(BIG[1] + 600, SMALL[i][1], u); k = lerp(1, KS, u);
      } else if (t >= s10) { op = 1 - clamp((t - s10) / 0.3); x = SMALL[i][0]; y = SMALL[i][1]; k = KS; }
      g.setAttribute('opacity', op.toFixed(3));
      g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)}) scale(${k.toFixed(3)})`);
    });
    return g;
  });

  // ---------------- 1-2: gancho ----------------
  const g1 = WB.group();
  { const g = WB.group(g1); img(window.ICONES.cerebro, 540, 820, 240, g); surge(g, 0.0, 540, 820);
    WB.effect(t => g.setAttribute('transform', `rotate(${r1(5 * Math.sin(t * 3))} 540 820)`)); }
  pop(0.0, 999, '4 cartas', 540, 1080, 120, INK.black, g1);
  pop(0.0, 999, 'tu mesmo descobre!', 540, 1210, 84, INK.purple, g1);
  fora(g1, st(2) + 1.6);
  const g2 = WB.group(), s2 = st(2);
  WB.effect(t => g2.setAttribute('opacity', t < s2 + 1.5 ? 0 : 1 - clamp((t - s3) / 0.2)));
  W(s2 + 1.6, fim(2), 'responde em voz alta', 540, 860, 88, INK.black, { parent: g2 });
  pop(s2 + 2.4, 999, 'SIM', 360, 1080, 140, INK.green, g2); pop(s2 + 2.9, 999, 'ou', 540, 1060, 70, INK.black, g2); pop(s2 + 3.2, 999, 'NÃO', 720, 1080, 140, INK.red, g2);
  rest(0.2, 0.3); rest(fim(2) + 0.05, s3 - 0.05);

  // ---------------- 3-6: pergunta de cada carta + SIM / NÃO ----------------
  const PERG = ['Teu número tá aqui?', 'E nessa?', 'E nessa aqui?', 'Última: tá nessa?'];
  PERG.forEach((q, i) => {
    const c = 3 + i, a = st(c), b = st(c + 1), g = WB.group();
    WB.effect(t => g.setAttribute('opacity', t >= a && t < b - 0.1 ? 1 : 0));
    pop(a + 0.05, b, q, 540, 560, 96, INK.black, g);
    const bt = (txt, x, cor, fundo, d) => { const h = WB.group(g);
      WB.mk('rect', { x: x - 150, y: 1240, width: 300, height: 120, rx: 60, fill: fundo }, h);
      WB.showNow([sp(`M ${x - 90} 1240 h 180 q 60 0 60 60 q 0 60 -60 60 h -180 q -60 0 -60 -60 q 0 -60 60 -60 Z`, cor, 6, h)]);
      WB.showNow(WB.textStrokes(txt, x, 1325, 84, cor, h, 'middle').strokes);
      WB.effect(t => { const on = t >= fim(c) + d; const k = on ? 1 + 0.05 * Math.sin((t - fim(c)) * 7) : 0.01;
        h.setAttribute('opacity', on ? 1 : 0); h.setAttribute('transform', `translate(${x} 1300) scale(${k.toFixed(3)}) translate(${-x} -1300)`); }); };
    bt('SIM', 330, INK.green, '#dcfce7', 0.0); bt('NÃO', 750, INK.red, '#fee2e2', 0.1);
    rest(fim(c) + 0.05, b - 0.05);
  });

  // ---------------- 7-8: soma os vermelhos ----------------
  const g7 = WB.group();
  WB.effect(t => g7.setAttribute('opacity', t < s7 ? 0 : 1 - clamp((t - s9) / 0.25)));
  W(s7 + 0.3, s7 + 2.0, 'soma os VERMELHOS', 540, 540, 100, INK.red, { parent: g7 });
  W(s7 + 2.0, fim(7), 'das cartas do SIM', 540, 650, 88, INK.black, { parent: g7 });
  { // cantinhos vermelhos piscando
    const g = WB.group(g7);
    SMALL.forEach(([x, y]) => { const cx = x + KS * (-CW / 2 + 115), cy = y + KS * (-CH / 2 + 220 - 38);
      const cg = WB.group(g); WB.showNow([sp(WB.circlePath(cx, cy, 50), INK.red, 6, cg)]);
      WB.effect(t => cg.setAttribute('opacity', t >= s7 + 2.3 ? (0.55 + 0.45 * Math.sin((t - s7) * 6)).toFixed(3) : 0)); });
  }
  { // ampulheta / barra de tempo pra somar
    const g = WB.group(g7), a = fim(8), b = s9;
    pop(st(8) + 0.05, 999, 'soma com calma...', 540, 1420, 84, INK.purple, g);
    const bg = WB.mk('rect', { x: 240, y: 1480, width: 600, height: 26, rx: 13, fill: '#efe7cf' }, g);
    const fg = WB.mk('rect', { x: 240, y: 1480, width: 600, height: 26, rx: 13, fill: INK.blue }, g);
    WB.effect(t => { const on = t >= st(8); bg.setAttribute('opacity', on ? 1 : 0); fg.setAttribute('opacity', on ? 1 : 0);
      fg.setAttribute('width', r1(600 * (1 - clamp((t - a) / (b - a))))); });
  }
  rest(fim(7) + 0.05, s9 - 0.05);

  // ---------------- 9: deu o teu número? ----------------
  const g9 = WB.group();
  WB.effect(t => g9.setAttribute('opacity', t < s9 ? 0 : 1 - clamp((t - s10) / 0.25)));
  pop(s9 + 0.05, 999, 'DEU O TEU', 540, 1400, 110, INK.black, g9);
  pop(s9 + 0.35, 999, 'NÚMERO?', 540, 1540, 130, INK.red, g9);

  // ---------------- 10: CTA ----------------
  const F10 = F(10);
  W(s10 + 0.1, s10 + F10 * 0.3, 'como um papel adivinhou?', 540, 620, 84, INK.black);
  { const g = WB.group(); img(window.ICONES.exploda, 540, 820, 200, g); surge(g, s10 + 0.4, 540, 820); }
  W(s10 + F10 * 0.32, s10 + F10 * 0.55, 'faz com teu amigo!', 540, 1030, 96, INK.purple);
  W(s10 + F10 * 0.6, s10 + F10 * 0.85, 'AMANHÃ: O SEGREDO', 540, 1170, 100, INK.red);
  { const g = WB.group(), x = 540, y = 1340, a = s10 + F10 * 0.62;
    const bt = WB.mk('rect', { x: x - 170, y: y - 55, width: 340, height: 100, rx: 50, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 18, 64, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 18, 58, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0);
      const k = on && t < a + 0.25 ? 0.7 + 1.2 * (t - a) : (done && t < a + 1.2 ? 1.08 : 1);
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`); }); }
  rest(s10 + F10, S[9].end - 0.1);

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
