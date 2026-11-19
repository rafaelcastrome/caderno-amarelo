// "Teste de audição": 6 tons cada vez mais agudos, cada um com a faixa de idade. Narração Gemini Algieba (3.1, take único).
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




  // ---------------- título (quadro 0) ----------------
  const tit = WB.group();
  WB.showNow(WB.textStrokes('TESTE DE AUDIÇÃO', 540, 190, 108, INK.red, tit, 'middle').strokes);
  WB.showNow(WB.textStrokes('até qual som tu ouve?', 540, 290, 76, INK.blue, tit, 'middle').strokes);
  pulsa(tit, 540, 180, 0.3, 0.05, 8, 1.5);
  { const g = WB.group(); img(window.ICONES.fone, 540, 450, 150, g);
    WB.effect(t => g.setAttribute('transform', `translate(0 ${r1(6 * Math.sin(t * 3))})`)); }
  const s14 = st(14);

  // ---------------- lista de níveis ----------------
  const NIV = [['8.000 Hz', 'todo mundo'], ['12.000 Hz', 'menos de 50'], ['14.000 Hz', 'menos de 40'],
               ['15.000 Hz', 'menos de 30'], ['16.000 Hz', 'menos de 25'], ['17.000 Hz', 'menos de 20']];
  const TOM = i => 3 + 2 * i;              // cena do tom de cada nível
  NIV.forEach(([hz, idade], i) => {
    const y = 640 + i * 130, g = WB.group(), x = 540;
    const bg = WB.mk('rect', { x: 120, y: y - 55, width: 840, height: 105, rx: 24, fill: '#fffaf0' }, g);
    WB.showNow([sp(`M 144 ${y - 55} h 792 q 24 0 24 24 v 57 q 0 24 -24 24 h -792 q -24 0 -24 -24 v -57 q 0 -24 24 -24 Z`, INK.black, 4, g)]);
    WB.showNow(WB.textStrokes((i + 1) + '', 180, y + 22, 62, INK.gray, g, 'middle').strokes);
    WB.showNow(WB.textStrokes(hz, 240, y + 22, 70, INK.blue, g, 'start').strokes);
    WB.showNow(WB.textStrokes(idade, 920, y + 22, 64, INK.black, g, 'end').strokes);
    WB.effect(t => {
      const a = st(TOM(i) - 1), b = TOM(i) < 13 ? st(TOM(i) + 1) : s14;
      const ativo = t >= a && t < b, tocando = t >= st(TOM(i)) && t < st(TOM(i)) + 3.0;
      bg.setAttribute('fill', tocando ? '#fde68a' : ativo ? '#fef3c7' : (t >= b ? '#f3f4f6' : '#fffaf0'));
      const k = tocando ? 1.05 + 0.02 * Math.sin(t * 10) : 1;
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-x} ${-y})`);
    });
  });

  // ---------------- onda durante cada tom ----------------
  NIV.forEach((n, i) => {
    const c = TOM(i), a = st(c), g = WB.group(), path = WB.mk('path', { d: '', fill: 'none', stroke: INK.red, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    img(window.ICONES.som, 170, 1520, 110, g);
    const lbl = WB.group(g); WB.showNow(WB.textStrokes('ESCUTA...', 540, 1660, 80, INK.red, lbl, 'middle').strokes);
    const ciclos = 5 + i * 3;
    WB.effect(t => {
      const on = t >= a && t < a + 3.0; g.setAttribute('opacity', on ? 1 : 0); if (!on) return;
      let d = ''; const x0 = 260, x1 = 960, amp = 45 * Math.min(1, (t - a) / 0.15) * Math.min(1, (a + 3 - t) / 0.15);
      for (let k = 0; k <= 140; k++) { const x = x0 + (x1 - x0) * k / 140, y = 1520 + amp * Math.sin(2 * Math.PI * (ciclos * k / 140) - t * 18);
        d += (k ? ' L ' : 'M ') + r1(x) + ' ' + r1(y); }
      path.setAttribute('d', d); lbl.setAttribute('opacity', (0.6 + 0.4 * Math.sin(t * 8)).toFixed(2));
    });
  });
  { // frase da cena 1
    const g = WB.group(); pop(1.0, st(2), 'põe o fone!', 540, 1560, 96, INK.purple, g); }
  rest(0.2, 0.3);
  for (let c = 2; c <= 13; c++) rest(st(c) + 0.05, S[c - 1].end - 0.05);

  // ---------------- 14: CTA ----------------
  const F14 = F(14);
  W(s14 + 0.1, s14 + F14 * 0.28, 'até qual tu ouviu?', 540, 1480, 84, INK.black);
  W(s14 + F14 * 0.3, s14 + F14 * 0.5, 'testa no teu pai!', 540, 1580, 84, INK.purple);
  { const g = WB.group(), x = 540, y = 1690, a = s14 + F14 * 0.55;
    const bt = WB.mk('rect', { x: x - 150, y: y - 45, width: 300, height: 84, rx: 42, fill: '#3b82f6' }, g);
    const t1 = WB.group(g); WB.showNow(WB.textStrokes('Seguir', x, y + 16, 56, '#ffffff', t1, 'middle').strokes);
    const t2 = WB.group(g); WB.showNow(WB.textStrokes('Seguindo', x, y + 16, 50, INK.black, t2, 'middle').strokes);
    WB.effect(t => { const on = t >= a, done = t >= a + 1.0;
      g.setAttribute('opacity', on ? 1 : 0); bt.setAttribute('fill', done ? '#e5e7eb' : '#3b82f6');
      t1.setAttribute('opacity', done ? 0 : 1); t2.setAttribute('opacity', done ? 1 : 0); }); }

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
